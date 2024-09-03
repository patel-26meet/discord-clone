import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
    params: {
        serverId: string;
    }
};

const ServerIdPage = async ({
    params
}:ServerIdPageProps) => {

    const profile = await currentProfile();

    if(!profile){
        return auth().redirectToSignIn();
    }

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id,
                }
            }
        },
        include: {
            channel: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    const initialChannel = server?.channel[0];

    if(initialChannel?.name !== "general"){
        return null;
    }

    return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}
 
export default ServerIdPage;