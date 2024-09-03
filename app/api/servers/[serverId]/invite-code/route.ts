import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

export async function PATCH(
    req: Request,
    { params }: { params: {serverId: string}}
) {
    try {
        const profile = await currentProfile();

        if(!profile){
            return new NextResponse("Unauthorized", { status: 506})
        }

        if(!params.serverId){
            return new NextResponse("Serve ID Missing"), { status: 507}
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
            data: {
                inviteCode: v4(),
            },
        });

        return NextResponse.json(server);

    } catch(error){
        console.log("[SEREVER_ID]", error);
        return new NextResponse("Invite link problem", { status: 505})
    }
}