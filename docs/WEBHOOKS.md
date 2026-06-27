# Webhooks

NodeBase exposes two public webhook endpoints that trigger workflow execution from external services. These endpoints are unauthenticated — any request with a valid `workflowId` will trigger the corresponding workflow.

---

## Table of Contents

1. [Webhook Overview](#1-webhook-overview)
2. [Stripe Webhook](#2-stripe-webhook)
3. [Google Form Webhook](#3-google-form-webhook)
4. [Security Considerations](#4-security-considerations)
5. [Testing Webhooks Locally](#5-testing-webhooks-locally)
6. [Webhook Payload Handling](#6-webhook-payload-handling)

---

## 1. Webhook Overview

| Endpoint | Method | Trigger | Data key |
|----------|--------|---------|---------|
| `/api/webhooks/stripe` | POST | Stripe event | `initialData.stripe` |
| `/api/webhooks/google-form` | POST | Google Form submission | `initialData.googleForm` |

Both endpoints:
1. Parse the incoming request body
2. Extract structured data
3. Send an Inngest event (`workflows/execute.workflow`) with the data
4. Return `{ success: true }`

The workflow execution is **asynchronous** — the HTTP response is returned immediately, and the workflow runs in the background via Inngest.

---

## 2. Stripe Webhook

### Endpoint

```
POST /api/webhooks/stripe?workflowId={workflowId}
```

**File:** `src/app/api/webhooks/stripe/route.ts`

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `workflowId` | Yes | ID of the workflow to trigger |

### Request Body

Standard Stripe event object (raw JSON):

```json
{
  "id": "evt_1NirD82eZvKYlo2C...",
  "object": "event",
  "type": "payment_intent.succeeded",
  "created": 1692819423,
  "livemode": false,
  "data": {
    "object": {
      "id": "pi_3NirD82eZvKYlo2C0cMZBSzT",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded",
      ...
    }
  },
  ...
}
```

### Extracted Data

The handler extracts and restructures the relevant fields:

```typescript
const stripeData = {
  eventId: body.id,           // "evt_1NirD82eZvKYlo2C..."
  eventType: body.type,       // "payment_intent.succeeded"
  timestamp: body.created,    // Unix timestamp
  livemode: body.livemode,    // false in test mode
  data: body.data,            // Full event data object
};
```

### Workflow Context

This data is available in downstream nodes at:
```handlebars
{{initialData.stripe.eventId}}
{{initialData.stripe.eventType}}
{{initialData.stripe.timestamp}}
{{initialData.stripe.livemode}}
{{initialData.stripe.data.object.amount}}
{{initialData.stripe.data.object.status}}
```

### Response

```json
{ "success": true }
```

### Setup in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe?workflowId=YOUR_WORKFLOW_ID`
4. Select the events you want to receive (e.g., `payment_intent.succeeded`)
5. Click **Add endpoint**

**For local testing with Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe?workflowId=YOUR_WORKFLOW_ID
```

### Supported Stripe Events

Any Stripe event can trigger the workflow. Common use cases:

| Event | Description |
|-------|-------------|
| `payment_intent.succeeded` | Payment completed |
| `customer.subscription.created` | New subscription |
| `customer.subscription.deleted` | Subscription cancelled |
| `invoice.payment_succeeded` | Invoice paid |
| `checkout.session.completed` | Checkout completed |

---

## 3. Google Form Webhook

### Endpoint

```
POST /api/webhooks/google-form?workflowId={workflowId}
```

**File:** `src/app/api/webhooks/google-form/route.ts`

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `workflowId` | Yes | ID of the workflow to trigger |

### Request Body

Expected format (sent by a Google Apps Script or middleware):

```json
{
  "formId": "1FAIpQLSf...",
  "formTitle": "Customer Feedback Form",
  "responseId": "1A2B3C...",
  "timestamp": "2026-06-27T10:30:00.000Z",
  "respondentEmail": "user@example.com",
  "responses": {
    "What is your name?": "John Doe",
    "Rating (1-5)": "4",
    "Additional comments": "Great service!"
  }
}
```

### Extracted Data

The handler extracts all top-level fields:

```typescript
const googleFormData = {
  formId: body.formId,
  formTitle: body.formTitle,
  responseId: body.responseId,
  timestamp: body.timestamp,
  respondentEmail: body.respondentEmail,
  responses: body.responses,
};
```

### Workflow Context

This data is available in downstream nodes at:
```handlebars
{{initialData.googleForm.formTitle}}
{{initialData.googleForm.respondentEmail}}
{{initialData.googleForm.responses}}
{{initialData.googleForm.timestamp}}
```

### Response

```json
{ "success": true }
```

### Setup with Google Apps Script

Google Forms does not natively support webhooks. Use a Google Apps Script:

1. Open your Google Form → ⋮ → Script editor
2. Paste this script:

```javascript
function onFormSubmit(e) {
  const form = FormApp.getActiveForm();
  const response = e.response;
  const items = response.getItemResponses();

  const responses = {};
  items.forEach(item => {
    responses[item.getItem().getTitle()] = item.getResponse();
  });

  const payload = {
    formId: form.getId(),
    formTitle: form.getTitle(),
    responseId: response.getId(),
    timestamp: response.getTimestamp().toISOString(),
    respondentEmail: response.getRespondentEmail() || "",
    responses: responses,
  };

  const webhookUrl = "https://your-domain.com/api/webhooks/google-form?workflowId=YOUR_WORKFLOW_ID";

  UrlFetchApp.fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}
```

3. Click **Triggers** (⏰ icon) → Add Trigger
4. Function: `onFormSubmit`
5. Event type: **On form submit**
6. Save

### Alternative: Zapier / Make.com

If you don't want to write Apps Script:
1. Use Zapier → Trigger: **Google Forms → New Response in Spreadsheet**
2. Action: **Webhooks by Zapier → POST** to your webhook URL
3. Map the form fields to match the expected body format

---

## 4. Security Considerations

### Current Security Model

Both webhook endpoints are **unauthenticated**. Anyone who knows the webhook URL can trigger a workflow execution with arbitrary data.

**Attack vector:** An attacker who discovers a webhook URL can:
1. Trigger workflow executions (consuming AI API quota)
2. Send arbitrary data in the payload

### Recommended Mitigations

#### 1. Stripe Webhook Signature Verification

Add Stripe's webhook signature verification:

```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Process verified event
  // ...
}
```

#### 2. Shared Secret for Google Form Webhook

Add a secret token check:

```typescript
// Add to google-form webhook handler
const secret = request.headers.get("x-webhook-secret");
if (secret !== process.env.GOOGLE_FORM_WEBHOOK_SECRET) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

And in the Google Apps Script:
```javascript
UrlFetchApp.fetch(webhookUrl, {
  headers: {
    "Content-Type": "application/json",
    "x-webhook-secret": "YOUR_SECRET",
  },
  // ...
});
```

#### 3. Rate Limiting

Implement per-workflow rate limiting using Upstash Redis or similar:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

// In webhook handler:
const { success } = await ratelimit.limit(`webhook:${workflowId}`);
if (!success) {
  return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

---

## 5. Testing Webhooks Locally

### Option 1: Ngrok + Real Service

1. Start Ngrok: `ngrok http 3000`
2. Use the public Ngrok URL as your webhook URL in Stripe/Google
3. Trigger real events from the service dashboard

### Option 2: Manual curl

```bash
# Test Stripe webhook manually
curl -X POST "http://localhost:3000/api/webhooks/stripe?workflowId=YOUR_WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_123",
    "type": "payment_intent.succeeded",
    "created": 1692819423,
    "livemode": false,
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 2000,
        "currency": "usd",
        "status": "succeeded"
      }
    }
  }'

# Test Google Form webhook manually
curl -X POST "http://localhost:3000/api/webhooks/google-form?workflowId=YOUR_WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "test_form_123",
    "formTitle": "Test Form",
    "responseId": "resp_123",
    "timestamp": "2026-06-27T10:30:00.000Z",
    "respondentEmail": "test@example.com",
    "responses": {
      "Question 1": "Answer 1",
      "Question 2": "Answer 2"
    }
  }'
```

### Option 3: Stripe CLI

```bash
# Install Stripe CLI then:
stripe listen --forward-to localhost:3000/api/webhooks/stripe?workflowId=YOUR_WORKFLOW_ID

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

## 6. Webhook Payload Handling

### Accessing Webhook Data in Workflows

After a webhook triggers a workflow, the payload is available in the context as `initialData`:

```
context.initialData.stripe.*         (Stripe workflows)
context.initialData.googleForm.*     (Google Form workflows)
```

The STRIPE_TRIGGER and GOOGLE_FORM_TRIGGER executor nodes are pass-through — they simply ensure the data is accessible to downstream nodes without modification.

### Example Workflow: Stripe Payment → AI Analysis → Slack Alert

```
STRIPE_TRIGGER
    ↓
OPENAI (variableName: "analysis")
  systemPrompt: "Analyze this payment and provide business insights."
  userPrompt: "Payment event: {{initialData.stripe.eventType}}. Amount: {{initialData.stripe.data.object.amount}} cents."
    ↓
SLACK (variableName: "alert")
  content: "New payment analyzed!\n\n{{analysis.text}}"
  webhookUrl: "https://hooks.slack.com/services/..."
```

### Example Workflow: Google Form → Gemini Summary → Discord Post

```
GOOGLE_FORM_TRIGGER
    ↓
GEMINI (variableName: "summary")
  userPrompt: "Summarize this feedback from {{initialData.googleForm.respondentEmail}}: {{initialData.googleForm.responses}}"
    ↓
DISCORD (variableName: "post")
  content: "New feedback summary:\n\n{{summary.text}}"
  webhookUrl: "https://discord.com/api/webhooks/..."
```
