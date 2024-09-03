import { useModal } from "@/hooks/use-modal-store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import qs from "query-string"
import axios from "axios";

export const DeleteMessageModal = () => {
    const { isOpen, onClose, type, data } = useModal();

    const isModalOpen = isOpen && type === "deleteMessage";

    const { apiUrl, query } = data;

    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);
            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query
            });

            await axios.delete(url);

            onClose();

        } catch(error){
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="">
                <DialogHeader className="flex items-center">
                    <DialogTitle>
                        Delete Message
                    </DialogTitle>
                    <DialogDescription className="flex flex-col items-center">
                        <div>Are you sure you want to do this?</div> 
                        The message will be permanentaly deleted
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button
                        disabled={isLoading}
                        onClick={onClose}
                        variant="ghost">
                            Cancel
                        </Button>          
                        <Button
                        disabled={isLoading}
                        onClick={onClick}
                        variant="primary">
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}