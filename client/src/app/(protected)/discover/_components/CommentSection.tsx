import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessagesSquare, ThumbsUp } from 'lucide-react'
import React from 'react'
import WriteCommentModal from './WriteCommand';

const mockComments = [
    {
        id: 1,
        userName: "Faraz Shafi",
        userImage: "https://github.com/shadcn.png",
        userInitials: "FS",
        text: "There is an issue in code I found. Your explanation is good, but code is broken.",
        likes: 12,
    },
    {
        id: 2,
        userName: "Alice Johnson",
        userImage: "https://randomuser.me/api/portraits/women/44.jpg",
        userInitials: "AJ",
        text: "This is a great snippet! I learned a lot from your explanation.",
        likes: 7,
    },
    {
        id: 3,
        userName: "Bob Smith",
        userImage: "https://randomuser.me/api/portraits/men/45.jpg",
        userInitials: "BS",
        text: "I think there is a typo in line 23, it throws an error for me.",
        likes: 5,
    },
    {
        id: 4,
        userName: "Charlie Lee",
        userImage: "https://randomuser.me/api/portraits/men/46.jpg",
        userInitials: "CL",
        text: "Amazing work! Could you explain why you used this approach?",
        likes: 9,
    },
    {
        id: 5,
        userName: "Diana Prince",
        userImage: "https://randomuser.me/api/portraits/women/47.jpg",
        userInitials: "DP",
        text: "Can you provide an example with different input values?",
        likes: 4,
    },
    {
        id: 6,
        userName: "Ethan Hunt",
        userImage: "https://randomuser.me/api/portraits/men/48.jpg",
        userInitials: "EH",
        text: "The code runs fine, but I think it can be optimized further.",
        likes: 3,
    },
];

const CommentSection = () => {
    return (
        <div className='flex flex-col gap-y-4'>
            <div className='flex justify-between items-center'>
                <div className="flex gap-x-3">
                    <MessagesSquare />
                    <p className='font-semibold text-xl'>Share your Thoughts</p>
                </div>
                <div>
                    <WriteCommentModal />
                </div>
            </div>

            <div className='w-full border-gray-200 border rounded-md text-black px-3 py-2 max-h-[150px] overflow-auto'>
                {mockComments.map((comment, idx) => (
                    <div key={idx} className="mb-3">
                        <div className='flex gap-x-2 items-center'>
                            <Avatar>
                                <AvatarImage src={comment.userImage} />
                                <AvatarFallback>{comment.userInitials}</AvatarFallback>
                            </Avatar>
                            <p>{comment.userName}</p>
                        </div>
                        <div className='border border-black rounded px-3 py-1 mt-2'>
                            <p>{comment.text}</p>
                        </div>
                        <div className="mt-2 flex gap-x-3 items-center justify-end">
                            <p className='text-xs'>{comment.likes} likes</p>
                            <div className='bg-gray-900 rounded p-1 text-white cursor-pointer hover:bg-gray-600'>
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