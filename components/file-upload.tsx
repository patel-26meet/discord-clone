"use-client"

import { UploadDropzone } from "@uploadthing/react";
import { FileIcon, X } from "lucide-react"
import Image from "next/image";

interface FileUploadProps {
    endpoint: "messageFile" | "serverImage";
    value: string;
    onChange: (url?: string) => void
}

export const FileUpload = ({
    onChange, 
    endpoint,
    value
}: FileUploadProps) => {
    const fileType = value?.split(".").pop();

    if(value && fileType !== "pdf"){
        return (
            <div className="relative h-20 w-20">
                <Image
                 fill src={value} alt="Upload" className="rounded-full"/>
                <button
                  onClick={()=> onChange("")}
                  className="bg-rose-500 text-white p-1
                  rounded-full absolute top-0 right-0 shadow-sm">
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    if(value && fileType === "pdf"){
        return(
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
                <a 
                href={value}
                target="_blank"
                rel="nooopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                    {value}
                </a>
                <button
                  onClick={()=> onChange("")}
                  className="bg-rose-500 text-white p-1
                  rounded-full absolute -top-2 -right-2 shadow-sm">
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    return ( 
        <UploadDropzone
         endpoint={endpoint}
         onClientUploadComplete={(res: any) => {
            if (res && res.length > 0) {
                onChange(res[0].url);
              } else {
                console.log(`Nothing uploaded!??`)
              }
         }}
         onUploadError={(error: Error) => {
            console.log(error);
         }}
        />
     );
}
 