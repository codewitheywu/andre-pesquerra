import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet){
                    try{
                        cookiesToSet.forEach(({ name, value, option }) => {
                            cookieStore.set(name,value,options);
                        });
                    } catch{
                        // Server components cannot always write code
                        // Middleware or a Server Action can handle refreshes
                    }
                },
            },
        }
    );
}