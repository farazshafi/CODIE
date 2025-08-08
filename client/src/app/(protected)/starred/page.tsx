"use client"
import { getStarredSnippetsApi, removeSnippetApi } from '@/apis/starredApi'
import Navbar from '@/components/ui/navbar'
import { useMutationHook } from '@/hooks/useMutationHook'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import SnippetCardSkeleton from '../discover/_components/SnippetCardSkeleton'
import SnippetCard from '@/components/snippetCard'
import { toast } from 'sonner'
import Loading from '@/components/Loading'

const Page = () => {
    const user = useUserStore((state) => state.user)

    const [snippets, setSnippets] = useState([])

    const { mutate: getStarredSnippets, isLoading } = useMutationHook(getStarredSnippetsApi, {
        onSuccess(data) {
            console.log("user starred projects", data)
            setSnippets(data)
        },
    })
    const { mutate: removeStarredSnippet , isLoading: unstarring} = useMutationHook(removeSnippetApi, {
        onSuccess(data) {
            toast.success(data.message || "Unstarred Snippet")
            getStarredSnippets({})
        },
    })

    const removeSnippet = (id: string) => {
        removeStarredSnippet(id)
    }

    useEffect(() => {
        if (!user) return
        getStarredSnippets({})
    }, [])

    if(unstarring) return <Loading fullScreen={false} text='Removing your item...'></Loading>

    return (
        <div>
            <Navbar />
            {snippets.length >= 1 && <div className='flex items-center justify-center'>
                <p className='text-3xl text-center font-bold text-white mt-4'>Starred Snippets</p>
            </div>}

            {snippets.length === 0 && (
                <div className='flex items-center justify-center'>
                    <p className='text-3xl text-center font-bold text-white mt-4'>Nothing starred yet</p>
                </div>
            )}
            <div className='px-5 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5 text-white'>
                {isLoading && snippets.length === 0
                    ? Array(6).fill(0).map((_, index) => <SnippetCardSkeleton key={index} />)
                    : snippets.map((item, index) => <SnippetCard isStarred={true} onUnstarHanlder={removeSnippet} onDelete={() => { }} project={item} key={index} />)
                }
            </div>
        </div>
    )
}

export default Page