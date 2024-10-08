'use client'

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client"
import { HashIcon, Headset, Lock, Settings, UserPlus, Video } from "lucide-react";
import { useRouter,useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../action-tooltip";

interface ServerChannelProps{
    channel: Channel;
    server: Server;
    role?: MemberRole;
}

const iconMap = {
    [ChannelType.TEXT]: HashIcon,
    [ChannelType.AUDIO]: Headset,
    [ChannelType.VIDEO]: Video,

}

export const ServerChannel = ({
    channel,
    server,
    role
}: ServerChannelProps) => {
    const params = useParams();
    const router = useRouter();

    const Icon = iconMap[channel.type];

    const onClick = () => {
        router.push(`/servers/${server.id}/channels/${channel.id}`)
    }

    return(
     <button
     onClick={onClick}
     className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
     )}>
        <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400"/>
        <p className={cn(
            "line-clamp-1 font-semibold text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}>
            {channel.name}
        </p>
        {channel.name !== "general" && role !== MemberRole.GUEST && (
            <div className="ml-auto flex items-center gap-x-1">
                <ActionTooltip label="Invite People">
                    <UserPlus onClick={(e) => {
                        e.stopPropagation() //more logic to be added
                    }} size={16} className="hidden group-hover:block text-zinc-500 dark:text-zinc-400"/>
                </ActionTooltip>
                <ActionTooltip label="Edit channel">
                    <Settings onClick={(e) => {
                        e.stopPropagation() //more logic to be added
                    }} size={16} className="hidden group-hover:block text-zinc-500 dark:text-zinc-400"/>
                </ActionTooltip>
            </div>
        )}
        {channel.name === "general" && (
            <Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400"/>
        )}
     </button>
    )
} 