import React from 'react';
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Share, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteProjectApi } from '@/apis/projectApi';
import { toast } from 'sonner';
import { useMutationHook } from '@/hooks/useMutationHook';
import { shareDiscoverApi } from '@/apis/discoverApi';
import { removeFromProjectApi } from '@/apis/roomApi';
import { useUserStore } from '@/stores/userStore';

type ProjectCardProps = {
    title: string;
    id: string;
    language: string;
    refetchProject(): void
    // thumbnail: string;
    updatedAt: string;
    isContributer: boolean
};

const ProjectCard = ({ title, language, updatedAt, id, refetchProject, isContributer = false }: ProjectCardProps) => {

    const router = useRouter()
    const user = useUserStore((state) => state.user)

    const { mutate: shareDiscover } = useMutationHook(shareDiscoverApi, {
        onSuccess(data) {
            toast.success(data.message)
        },
        onError(error) {
            toast.info(error.response.data.message || "Can't share , Server Error")
        },
    })
    const { mutate: removeFromProject } = useMutationHook(removeFromProjectApi, {
        onSuccess(data) {
            console.log("successfully removed")
            toast.success(data.message || "Removed from project")
            refetchProject()
        }
    })

    const handleDelete = async () => {
        try {
            const data = await deleteProjectApi(id)
            if (data.message) {
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

    const removeContributerFromProject = async () => {
        removeFromProject({ projectId: id, userId: user?.id })
    }

    const shareTODiscover = async (projectId: string) => {
        shareDiscover(projectId)
    }

    return (
        <div className="rounded-b-lg mt-5 text-white w-full transform transition-transform duration-300 hover:scale-105">
            <Image
                src={"https://undsgn.com/wp-content/uploads/2018/02/image009.jpg"}
                className="rounded-t-lg w-full h-[120px] sm:h-[100px] object-cover"
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
                    <p className='text-sm font-bold'>{title}</p>
                    <p className="mygreen mt-2 text-xs">{language}</p>
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
                            <DropdownMenuItem onClick={isContributer ? removeContributerFromProject : handleDelete} className='group'>
                                <div className='p-1 rounded group-hover:bg-black text-white hover:bg-gray-900'>
                                    <Trash className='' />
                                </div>
                                <p>Delete</p>
                            </DropdownMenuItem>
                            {!isContributer && (
                                <>
                                    <DropdownMenuItem onClick={() => shareTODiscover(id)} className='group'>
                                        <div className='p-1 rounded group-hover:bg-black text-white hover:bg-gray-900'>
                                            <Share className='' />
                                        </div>
                                        <p>Share to Discover</p>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs mt-2 text-gray-400">Edited: {updatedAt}</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
