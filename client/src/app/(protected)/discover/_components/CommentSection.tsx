import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessagesSquare, ThumbsUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import WriteCommentModal from './WriteCommand';
import { useMutationHook } from '@/hooks/useMutationHook';
import { getAllCommentsApi, likeCommentApi } from '@/apis/commentApi';
import { useEditorStore } from '@/stores/editorStore';
import { useUserStore } from '@/stores/userStore';

type commentType = {
    userId: { name: string, avatarUrl: string };
    comment: string;
    likes: string[];
    _id: string;
}

const CommentSection = () => {

    const [comments, setComments] = useState<commentType[]>([])
    const projectId = useEditorStore((state) => state.projectId)
    const user = useUserStore((state) => state.user)

    const { mutate: getAllComments } = useMutationHook(getAllCommentsApi, {
        onSuccess(res) {
            setComments(res.data)
        }
    })
    const { mutate: likeComment } = useMutationHook(likeCommentApi, {
        onSuccess() {
            if (!projectId) return
            getAllComments(projectId)
        }
    })

    useEffect(() => {
        if (!projectId) return
        getAllComments(projectId)
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className='flex flex-col gap-y-4'>
            <div className='flex justify-between items-center'>
                <div className="flex gap-x-3">
                    <MessagesSquare />
                    <p className='font-semibold text-xl'>Share your Thoughts</p>
                </div>
                <div>
                    <WriteCommentModal fetchComments={getAllComments} />
                </div>
            </div>

            <div className='w-full border-gray-200 border rounded-md text-black px-3 py-2 max-h-[150px] overflow-auto'>
                {comments.length < 1 && (<p>No Comments Yet.</p>)}
                {comments.map((comment, idx) => (
                    <div key={idx} className="mb-3">
                        <div className='flex gap-x-2 items-center'>
                            <Avatar>
                                <AvatarImage src={comment.userId.avatarUrl} />
                                <AvatarFallback>{comment.userId.name}</AvatarFallback>
                            </Avatar>
                            <p>{comment.userId.name}</p>
                        </div>
                        <div className='border border-black rounded px-3 py-1 mt-2'>
                            <p>{comment.comment}</p>
                        </div>
                        <div className="mt-2 flex gap-x-3 items-center justify-end">
                            <p className='text-xs'>{comment.likes.length} likes</p>
                            <div onClick={() => likeComment(comment._id)} className={`${user && comment.likes.includes(user?.id) ? "bg-green-600" : "bg-gray-900"} rounded p-1 text-white cursor-pointer hover:bg-gray-600`}>
                                <ThumbsUp width={15} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    )
}

export default CommentSection