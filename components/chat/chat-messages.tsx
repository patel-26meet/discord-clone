"use client"

import { useChatQuery } from "@/hooks/use-chat-query";
import { Member, Message, Profile } from "@prisma/client";
import { Hash, Loader2, ServerCrash } from "lucide-react";
import { ElementRef, Fragment, Key, useRef } from "react";
import { ChatItem } from "./chat-item";
import { format } from "date-fns";
import { useChatSocket } from "@/hooks/use-chat-socket";

const DATE_FORMAT = "d/MM/yyy, HH:mm"


type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";
}

export const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type
}: ChatMessagesProps) => {
    const queryKey = `chat:${chatId}`
    const addKey = `chat:${chatId}:messages`;
    const updatekey = `chat:${chatId}:messages:update`;

    const chatRef = useRef<ElementRef<"div">>(null)
    const bottomRef = useRef<ElementRef<"div">>(null)

    const {
        data, fetchNextPage, hasNextPage, isFetchingNextPage, status
    } = useChatQuery({
        queryKey, apiUrl, paramKey, paramValue
    })

    useChatSocket({ queryKey, addKey, updatekey})

    if(status === "pending"){
        return(
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        )
    }

    if(status === "error"){
        return(
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4"/>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Something went wrong
                    </p>
            </div>
        )
    }

    return ( 
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className="flex-1"/>
        { /*Welcome Message */}  
            <div className="space-y-2 px-4 mb-4"> 
                {type === "channel" && (
                    <div className="h-[75px] w-[75px] rounded-full bg-zinc-500 dark:bg-zinc-700
                    flex items-center justify-center">
                        <Hash className="h-12 w-12 text-white"/>
                    </div>
                )}         
                <p className="text-xl md:text-3xl font-bold">
                    {type === "channel" ? "Welcome to #" : ""}{name}
                </p>
                <p>
                    {type === "channel" ? `This is the start of #${name} channel` : `This is the start of your conversation with ${name}`}
                </p>
            </div>
            <div className="flex flex-col-reverse mt-auto">
                {data?.pages?.map((group: { items: MessageWithMemberWithProfile[]; }, i: Key | null | undefined) => (
                    <Fragment key={i}>
                        {group.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem 
                            id={message.id}
                            content={message.content}
                            member={message.member}
                            timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                            fileUrl={message.fileUrl}
                            deleted={message.deleted}
                            currentMember={member}
                            isUpdated={message.updatedAt !== message.createdAt}
                            socketUrl={socketUrl}
                            socketQuery={socketQuery}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef}/>
        </div>
    );
}