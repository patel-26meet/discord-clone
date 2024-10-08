"use client"

import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "../ui/user-avatar";
import Image from "next/image";
import { Edit, FileIcon, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../action-tooltip";
import * as z from "zod";
import axios from "axios";
import qs from "query-string"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { isUploadThingHook } from "uploadthing/internal/types";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
    id: string;
    content: string;
    member: Member& {
        profile: Profile;
    }
    timestamp: string;
    fileUrl: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
}

const formSchema = z.object({
    content: z.string().min(1)
});

export const ChatItem = ({
    id,
    content,
    member,
    timestamp,
    fileUrl,
    deleted,
    currentMember,
    isUpdated,
    socketUrl,
    socketQuery,
}: ChatItemProps) => {
    const fileType = fileUrl?.split(".").pop();

    const [isEditing, setIsEditing] = useState(false);
    
    const { onOpen } = useModal();

    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !deleted && isOwner && !fileUrl;
    const isPDF = fileType === "pdf" && fileUrl;
    const isImg = !isPDF && fileUrl;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    })

    useEffect(() => {
        form.reset({
            content: content
        })
    }, [content]);

    useEffect(()=>{
        const handleKeyDown = (event: any) => {
            if(event.key === "Escape" || event.keyCode === 27){
                setIsEditing(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown",handleKeyDown)
    },[])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery,
            })

            await axios.patch(url, values);

            form.reset();
            setIsEditing(false);
        }catch(error){
            console.log(error)
        }
    }


    return(
        <div className="relative group flex items-center hover:bg-black/5 
        p-3 transition w-full">
            <div className="group flex gap-1 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar src={member.profile.imageUrl} />          
                </div>
                <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                        <div className="font-semibold text-sm hover:underline cursor-pointer">
                            {member.profile.name} 
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {timestamp}
                        </div>
                    </div>
                    {isImg && (
                        <a 
                            href={fileUrl}
                            target="_blank"
                            rel="noopener referrer"
                            className="relative aspect-square rounded-md mt-2 overflow-hidden
                            border flex items-center bg-secondary h-48 w-48"
                        >
                            <Image
                                src={fileUrl}
                                alt={content}
                                fill 
                                className="object-cover"
                            />
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
                            <a 
                            href={fileUrl}
                            target="_blank"
                            rel="nooopener noreferrer"
                            className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                            >
                                PDF File
                            </a>
                    </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn(
                            "text-sm text-zinc-600 dark:text-zinc-300",
                            deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                        )}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-zinc-500 dark:text-zinc-400 text-[10px] mx-2">
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form 
                            className="flex items-center w-full gap-x-2 pt-2"
                            onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({field}) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="relative w-full">
                                                    <Input
                                                     disabled={isLoading}
                                                     className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75
                                                     border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-1
                                                     text-zinc-600 dark:text-zinc-200"
                                                     placeholder="Edited Message"
                                                     {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={isLoading} size="sm" variant="primary">
                                    Save
                                </Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400">
                                Press escape to cancel, enter to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div>
                    <ActionTooltip label="Edit">
                        <Edit
                            onClick={() => setIsEditing(true)}
                            className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-600 transition"
                        />
                    </ActionTooltip>
                </div>
            )}
            <ActionTooltip label="Delete">
                <Trash
                onClick={() => onOpen("deleteMessage", { 
                    apiUrl:`${socketUrl}/${id}`,
                    query: socketQuery
                })}
                    className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-600 transition"
                />
            </ActionTooltip>
        </div>
    )
}