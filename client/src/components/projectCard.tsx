import React from 'react';
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Star, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteProjectApi } from '@/apis/projectApi';
import { toast } from 'sonner';

type ProjectCardProps = {
    title: string;
    id: string;
    language: string;
    refetchProject(): void
    // thumbnail: string;
    updatedAt: string;
};

const ProjectCard = ({ title, language, updatedAt, id, refetchProject }: ProjectCardProps) => {

    const router = useRouter()

    const handleDelete = async () => {
        try {
            const data = await deleteProjectApi(id)
            if (data.message) {
                console.log("Deleted project data:", data);
                toast.success("Project deleted successfully");
                refetchProject();
            } else {
                toast.error("Failed to delete the project. Please try again.");
            }
        } catch (err) {
            toast.error("Failed to delete the project. Please try again.");
            console.error("Error deleting project:", err);
        }
    }

    return (
        <div className="rounded-b-lg mt-5 text-white w-full transform transition-transform duration-300 hover:scale-105">
            <Image
                src={"https://undsgn.com/wp-content/uploads/2018/02/image009.jpg"}
                className="rounded-t-lg w-full h-[150px] sm:h-[180px] object-cover"
                width={0}
                height={0}
                sizes="100vw"
                alt={title}
                onClick={() => {
                    router.push(`/editor/${id}`)
                }}
            />
            <div className="flex items-center justify-between w-full px-3 py-2 rounded-b-lg bg-black">
                <div className="flex flex-col">
                    <p>{title}</p>
                    <p className="mygreen mt-2 text-sm">{language}</p>
                </div>
                <div className="flex flex-col items-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Ellipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* <DropdownMenuItem className='group'>
                                <div className='p-1 rounded group-hover:bg-black text-white hover:bg-gray-900'>
                                    <Star className='' />
                                </div>
                                <p>Favorite</p>
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={handleDelete} className='group'>
                                <div className='p-1 rounded group-hover:bg-black text-white hover:bg-gray-900'>
                                    <Trash className='' />
                                </div>
                                <p>Delete</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm mt-2 text-gray-400">Edited: {updatedAt}</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
