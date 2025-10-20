import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
    await requireAuth();

    return ( 
        <p>Executions Page</p>
     );
};
 
export default Page;