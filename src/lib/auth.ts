import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";

import prisma from "@/lib/db";
import { polarClient } from "@/lib/polar";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "50c35c06-c53f-4a20-ba55-b7bffb0e2891",
              slug: "pro",
            }
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
        // 5:22:38
      ]
    })
  ]
});
