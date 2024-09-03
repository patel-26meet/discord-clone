"use client";

import { Dialog, 
        DialogContent, 
        DialogDescription, 
        DialogHeader, 
        DialogTitle 
} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import axios from "axios";

export const InviteModal = () => {
    const { isOpen,onOpen, onClose, type, data } = useModal();
    const origin = useOrigin();

    const isModalOpen = isOpen && type === "invite";
    const { server } = data;

    const[copied, setCopied] = useState(false);
    const[loading, setLoading] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
    }

    const onNew = async () => {
        try{
            setLoading(true);
            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);

            onOpen("invite", { server: response.data})
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const inviteUrl = `${origin}/invite/${server?.inviteCode}`
    return ( 
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                    Invite Friends
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <Label className="uppercase pl-1 text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server Invite Link!
                    </Label> 
                    <div className="flex items-center mt-2 gap-x-2">
                        <Input
                        disabled={loading}
                         className="bg-zinc-300/55 border-0 focus-visible:ring-0
                         text-black focus-visible:ring-offset-0"
                         value={inviteUrl}
                        />
                        <Button disabled={loading} onClick={onCopy} size="icon">
                            {copied ?
                              <Check className="w-5 h-5"/> 
                            : <Copy className="w-5 h-5"/>
                            }
                        </Button>
                        </div>
                        <Button 
                            onClick={onNew}
                            disabled={loading}
                            variant="link"
                            size="sm"
                            className="text-zinc-500 mt-4">
                                Generate a new link
                                <RefreshCw className="w-4 h-4 ml-2"/>
                        </Button>
                </div>

            </DialogContent>
        </Dialog>
     );
 }