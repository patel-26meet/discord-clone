import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server";
import { v4 } from  "uuid";
//@ts-ignore
import { MemberRole, ChannelType } from "@prisma/client";


export async function POST(req: Request){
    try{
        const { name, imageUrl } = await req.json();
        const profile = await currentProfile();

        if(!profile){
            return new NextResponse("Unauthorized")
        }

        const server= await db.server.create({
            data: {
                profileId: profile.id,
                name,
                imageUrl,
                inviteCode: v4(),
                channel: {
                    create: [
                        {
                            name: "general", profileId: profile.id,
                            type: ChannelType.TEXT
                        }
                    ]
                },
                members: {
                    create: [
                        { profileId: profile.id, role: MemberRole.ADMIN}
                    ]
                }
            }
        });

        return NextResponse.json(server);
    }catch(error){
        console.log("[SERVER_POST]",error);
        return new NextResponse("Internal Error", {status: 501})
    }
}