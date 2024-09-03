import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ListOrdered } from "lucide-react";
import { redirect } from "next/navigation";
//@ts-ignore
import { ChannelType } from "@prisma/client";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel"

interface ServerSidebarProps{
    serverId: string;
}

export const ServerSidebar = async({
    serverId
}: ServerSidebarProps) => {
    const profile = await currentProfile();

    if(!profile){
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channel: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                }
            }
        }

    });

    const textChannels = server?.channel.filter((channel) => 
        channel.type === ChannelType.TEXT
    )

    const audioChannels = server?.channel.filter((channel) => 
        channel.type === ChannelType.AUDIO
    )

    const videoChannels = server?.channel.filter((channel) => 
        channel.type === ChannelType.VIDEO
    )

    const members = server?.members.filter((member) => member.profileId !== profile.id)

    if(!server){
        return redirect("/");
    }

    const role = server.members.find((member) => member.profileId === profile.id)?.role;

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader
                server = {server}
                role = {role}
            />
            <ScrollArea className="flex-1 px-3">
                <div className="searchArea pt-3">
                    Search area 
                </div>     
                <Separator className="bg-zinc-700 rounded-md my-2"/>
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                        sectionType="channels"
                        channelType={ChannelType.TEXT}
                        role={role}
                        label="Text Channels"
                        />
                        {textChannels.map((channel) => (
                        <ServerChannel 
                        server={server}
                        channel={channel}
                        role={role}
                        key={channel.id}
                        />
                      ))}
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                        sectionType="channels"
                        channelType={ChannelType.AUDIO}
                        role={role}
                        label="Voice Channels"
                        />
                        {audioChannels.map((channel) => (
                        <ServerChannel 
                        server={server}
                        channel={channel}
                        role={role}
                        key={channel.id}
                        />
                      ))}
                    </div>
                )}
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                        sectionType="channels"
                        channelType={ChannelType.VIDEO}
                        role={role}
                        label="Video Channels"
                        />
                        {videoChannels.map((channel) => (
                        <ServerChannel 
                        server={server}
                        channel={channel}
                        role={role}
                        key={channel.id}
                        />
                      ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}