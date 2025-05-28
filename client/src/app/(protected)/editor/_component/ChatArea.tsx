import { Input } from '@/components/ui/input'
import { Mic, Send, SmilePlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import React, { useEffect, useRef, useState } from 'react'
import { useSocket } from '@/context/SocketContext'
import { useUserStore } from '@/stores/userStore'
import { useEditorStore } from '@/stores/editorStore'
import { useMutationHook } from '@/hooks/useMutationHook'
import { getChatMessagesApi } from '@/apis/messageApi'

interface Message {
    _id?: string
    senderId: string
    senderName: string
    senderRole: 'owner' | 'editor' | 'viewer'
    content: string
    roomId: string
    projectId?: string
}

interface ChatProps {
    userRole: 'owner' | 'editor' | 'viewer'
}

const ChatArea: React.FC<ChatProps> = ({ userRole }) => {
    //hooks & stores
    const { socket } = useSocket()
    const user = useUserStore((state) => state.user)
    const roomId = useEditorStore((state) => state.roomId)
    const projectId = useEditorStore((state) => state.projectId)

    // states
    const [messageText, setMessageText] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const bottomRef = useRef<HTMLDivElement | null>(null)

    //mutations
    const { mutate: getMessages } = useMutationHook(getChatMessagesApi, {
        onSuccess(response) {
            setMessages(response)
        }
    })

    // functions
    const handleSend = () => {
        if (!socket || !user || !roomId || !projectId) return
        if (!messageText.trim()) return

        const newMessage: Message = {
            roomId,
            senderId: user.id,
            senderName: user.name,
            senderRole: userRole as 'owner' | 'editor' | 'viewer',
            content: messageText,
            projectId
        }

        socket.emit("send-message", newMessage)
        setMessageText("")
    }

    //useEffects
    useEffect(() => {
        getMessages(roomId)
    }, [roomId])
    useEffect(() => {
        if (!socket || !roomId) return

        socket.on("recived-message", (msg: Message) => {
            setMessages((prev) => [...prev, msg])
        })

        return () => {
            socket.off("receive_message")
        }

    }, [roomId])
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="bg-tertiary text-center overflow-auto py-5 flex flex-col justify-between gap-y-5 h-full px-5">
            <p className="text-white text-center text-3xl font-semibold">Chat With Collabrators</p>
            <div className="flex flex-row justify-center items-center gap-x-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
                    <span className="text-white text-sm">Owner</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                    <span className="text-white text-sm">Editor</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                    <span className="text-white text-sm">Viewer</span>
                </div>
            </div>
            <div className=" h-[500px] w-full bg-primary rounded-lg px-5 py-3 ">
                <div className="h-[80%] w-full flex flex-col gap-y-5 relative overflow-y-auto pr-2">
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === user?.id
                        const isFirstOfGroup = index === 0 || messages[index - 1].senderId !== msg.senderId

                        return (
                            <div
                                key={index}
                                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="flex max-w-[80%] flex-row items-start gap-3">
                                    {isFirstOfGroup && (
                                        <Avatar title={msg.senderName}>
                                            <AvatarImage
                                                src={isMe ? user.avatar : "https://github.com/shadcn.png"}
                                                alt={isMe ? "You" : msg.senderName}
                                            />
                                            <AvatarFallback>{msg.senderName.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={`rounded px-4 py-2 break-words whitespace-pre-wrap w-fit max-w-full text-white 
                                            ${msg.senderRole === 'owner' ? 'bg-yellow-300 !text-black'
                                                : msg.senderRole === 'editor' ? 'bg-blue-400 text-white'
                                                    : msg.senderRole === 'viewer' ? 'bg-gray-500 text-white'
                                                        : 'bg-tertiary'}`}
                                    >
                                        <p className="break-words">{msg.content}</p>
                                    </div>


                                </div>
                            </div>
                        )
                    })}

                    <div ref={bottomRef} />
                </div>


                <div className="h-fit gap-x-3 w-full px-5 py-3 bg-white flex flex-row justify-between items-center rounded-md">
                    <SmilePlus />
                    <Input
                        placeholder="Message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend()
                        }}
                    />
                    <div className="flex flex-row gap-x-5 item-center">
                        <div className="bg-green px-3 py-2 rounded-md">
                            <Mic />
                        </div>
                        <div
                            onClick={handleSend}
                            className="bg-primary text-white px-3 py-2 rounded-md cursor-pointer"
                        >
                            <Send />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ChatArea