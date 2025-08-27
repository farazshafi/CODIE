"use client";
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Star, Trash2 } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard/SpotlightCard';
import { IDiscover } from '@/app/(protected)/discover/page';
import { useUserStore } from '@/stores/userStore';
import SnippetModal from '@/app/(protected)/discover/_components/SnippetModal';
import { useMutationHook } from '@/hooks/useMutationHook';
import { removeFromDiscoverApi } from '@/apis/discoverApi';
import { toast } from 'sonner';
import { getStarredSnippetsApi, removeSnippetApi, starSnippetApi } from '@/apis/starredApi';
import Loading from './Loading';

interface snippetCardPros {
    project: IDiscover;
    onDelete: (id: string) => void;
    isStarred: boolean;
    onUnstarHanlder?: (projectId: string) => void;
    refetchSnippets: () => void
}

const SnippetCard = ({ isStarred, project, onDelete, onUnstarHanlder, refetchSnippets }: snippetCardPros) => {

    const user = useUserStore((state) => state.user)
    const [open, setOpen] = useState(false)
    const [starred, setStarred] = useState<string[]>([])

    const { mutate: removeSnippet } = useMutationHook(removeFromDiscoverApi, {
        onSuccess(data) {
            toast.success(data.message || "Removed from Discovery")
            onDelete(project._id)
        }
    })

    const { mutate: starSnippet, isLoading: starring } = useMutationHook(starSnippetApi, {
        onSuccess(data) {
            toast.success(data.message || "Snippet is starred")
            getStarredSnippet()
            refetchSnippets()
        },
        onError(error) {
            console.log(error)
            toast.info(error.response.data.message || "Cannot Star")
        },
    })

    const { mutate: getStarredSnippet } = useMutationHook(getStarredSnippetsApi, {
        onSuccess(data) {
            console.log("raw data", data);
            const starredIds = Array.isArray(data)
                ? data.map((item) => item?.projectId?._id)
                : [];
            setStarred(starredIds)
        }
    })

    const handleDeleteSnippet = () => {
        removeSnippet(project._id)
    }

    useEffect(() => {
        getStarredSnippet()
    }, [])

    if (starring) return <Loading fullScreen={false} text='Starring your item...'></Loading>

    return (

        <div className='rounded-lg p-5 transform transition-transform duration-300 hover:scale-105 text-white'>
            <SpotlightCard spotlightColor="rgba(77, 79, 79, 0.3)"
            >

                <div className='flex flex-row items-center justify-between'>
                    <div className='flex'>
                        {/* <Image className='rounded-lg' width={"40px"} src={LANGUAGE_CONFIG[project.projectId.projectLanguage].logoPath} alt="language-logo" /> */}

                        <div className='flex flex-col justify-between ml-3'>
                            <div className='text-white py-1 px-2 w-fit rounded-sm bg-primary'>
                                <p className='text-xs'>{project.projectId.projectLanguage}</p>
                            </div>
                            <div className='flex text-xs flex-row items-center gap-x-1'>
                                <Clock size={"10px"} />
                                <p>{project.createdAt.toString().slice(0, 10)}</p>
                            </div>
                        </div>
                    </div>

                    {!isStarred && <div className='gap-x-4 flex flex-row items-center'>
                        {user?.id === project.projectId.userId._id && (
                            <Button onClick={handleDeleteSnippet} className='bg-primary cursor-pointer hover:bg-black'>
                                <Trash2 />
                            </Button>
                        )}

                        <Button onClick={() => starSnippet(project.projectId._id)} className={`bg-green cursor-pointer ${starred.includes(project.projectId._id) ? "bg-green-600 hover:bg-green-400" : "bg-black hover:bg-gray-500"}`}>
                            <p>Stared <span>{project.starred}</span></p>
                            <Star />
                        </Button>

                    </div>}
                    {isStarred && onUnstarHanlder && <div className='gap-x-4 flex flex-row items-center'>

                        <Button onClick={() => onUnstarHanlder(project.projectId._id)} className='bg-primary cursor-pointer hover:bg-black'>
                            <Trash2 />
                        </Button>
                    </div>}
                </div>
                <div className='mt-5'>
                    <p className='font-bold text-lg'>{project.projectId.projectName}</p>
                    <div className='text-white p-1 rounded-sm bg-primary flex items-center w-fit mt-2 gap-x-3'>
                        <Avatar className="ml-2 text-xs">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>US</AvatarFallback>
                        </Avatar>
                        <p className='text-xs'>{project.projectId.userId.name}</p>
                    </div>
                </div>

                <div className='mt-5 '>
                    <img height={155} width={235} src="https://images.ctfassets.net/lzny33ho1g45/5hzHWhjxP8bM3Ew2SJgKuS/ae69008c04ab864f602254bf349725e7/acode.webp" alt="code-image" />
                </div>
                <div className='mt-3'>
                    <button onClick={() => setOpen(true)} className='rounded-xl w-full bg-tertiary text-white py-4 cursor-pointer'>Explore</button>
                </div>
            </SpotlightCard>
            <SnippetModal open={open} onClose={() => setOpen(false)} project={project} />

        </div>
    )
}

export default SnippetCard