import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ServerSidebar } from "@/components/server/server-sidebar";

const ServerIdLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: {serverId: string}
}) => {
    const profile = await currentProfile();

    if(!profile){
        return auth().redirectToSignIn();
    }

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if(!server){
        return redirect("/")
    }

    return ( 
        <div className="h-full flex">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={params.serverId}/>
            </div>
            <main className="md:pl-60 flex-1 h-full">
            {children}
            </main>
        </div>
     );
}
 
export default ServerIdLayout;