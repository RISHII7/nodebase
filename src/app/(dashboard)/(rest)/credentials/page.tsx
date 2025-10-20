import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
    await requireAuth();
    
    return ( 
        <p>Credentials Page</p>
     );
};
 
export default Page;