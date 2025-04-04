import React from 'react'
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis } from 'lucide-react';

const ProjectCard = () => {
    return (
        <div className="rounded-b-lg mt-5 text-white w-full">
            <Image
                src={"https://undsgn.com/wp-content/uploads/2018/02/image009.jpg"}
                className="rounded-t-lg w-full h-[150px] sm:h-[180px] object-cover"
                width={0} height={0} sizes="100vw"
                alt="code" />

            <div className="flex items-center justify-between w-full px-3 py-2 rounded-b-lg bg-black">
                <div className="flex flex-col">
                    <p>Prime number</p>
                    <p className="mygreen mt-2 text-sm">Python</p>
                </div>
                <div className="flex flex-col items-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Ellipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm mt-2 text-gray-400">Edited: 1:29 PM</p>
                </div>
            </div>
        </div>
    )
}

export default ProjectCard