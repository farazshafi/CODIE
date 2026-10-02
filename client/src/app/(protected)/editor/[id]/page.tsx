"use client"
import React, { useEffect, useState } from "react"
import Split from "react-split"
import { useCodeEditorStore, getExecutionResult, warmupPistonEngine } from "@/stores/useCodeEditorStore"
import Header from "../_component/Header"
import { useEditorStore } from "@/stores/editorStore"
import { useParams } from "next/navigation"
import ChatArea from "../_component/ChatArea"
import { useSocket } from "@/context/SocketContext"
import { useUserStore } from "@/stores/userStore"
import ConsolePanel from "../_component/ConsolePanel"
import OutputPanel from "../_component/OutputPanel"
import MobileEditorBlocker from "../_component/MobileEditorBlocker"
import VideoHuddlePanel from "../_component/VideoHuddlePanel"
import { WebRTCProvider, useWebRTCContext } from "@/context/WebRTCContext"
import { MessageSquare, Terminal, Video } from "lucide-react"

const EditorContent = () => {
    const [showSidebar, setShowSidebar] = useState(false)
    const [activeSidebarTab, setActiveSidebarTab] = useState<"chat" | "video" | "output">("chat")
    const [hasUnreadChat, setHasUnreadChat] = useState(false)

    const { id } = useParams()
    const setProjectId = useEditorStore((state) => state.setProjectId)
    const userRole = useEditorStore((state) => state.userRole)
    const { runCode } = useCodeEditorStore()
    const [chatSupport, setChatSupport] = useState({
        text: false,
        voice: false
    })

    const { socket } = useSocket()
    const projectId = useEditorStore((state) => state.projectId)
    const user = useUserStore((state) => state.user)

    const { isInHuddle } = useWebRTCContext()

    const handleReset = () => {
        // handle reset logic
    }

    const handleRun = async () => {
        await runCode()
        const result = getExecutionResult()
        console.log("code execution result: ", result)
    }

    useEffect(() => {
        setProjectId(id as string)
        document.title = "Editor | CODIE"
        // Trigger background warmup for Piston execution container on Render
        warmupPistonEngine()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    useEffect(() => {
        if (!socket || !projectId || !user) return

        return () => {
            socket.emit("leave-project", {
                userId: user.id,
                projectId: projectId,
                userName: user.name
            })
            setProjectId(null)
            localStorage.removeItem("editor-store")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Listen for incoming chat messages to trigger notification beam when chat is closed or inactive
    useEffect(() => {
        if (!socket) return

        const handleMessage = (msg: { senderId: string }) => {
            if (msg.senderId !== user?.id && (!showSidebar || activeSidebarTab !== "chat")) {
                setHasUnreadChat(true)
            }
        }

        socket.on("recived-message", handleMessage)
        return () => {
            socket.off("recived-message", handleMessage)
        }
    }, [socket, user, showSidebar, activeSidebarTab])

    // Clear unread indicator when user opens the Chat tab
    useEffect(() => {
        if (showSidebar && activeSidebarTab === "chat") {
            setHasUnreadChat(false)
        }
    }, [showSidebar, activeSidebarTab])

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#0a0b10]">
            <Header
                hasUnreadChat={hasUnreadChat}
                onChatToggle={(support) => {
                    setChatSupport(support)
                    setActiveSidebarTab("chat")
                    setShowSidebar((prev) => !prev)
                    setHasUnreadChat(false)
                }}
                onCollaboratorsToggle={() => {
                    setShowSidebar(false)
                }}
                onVideoToggle={() => {
                    setShowSidebar(true)
                    setActiveSidebarTab("video")
                }}
            />

            <div className="flex-1 overflow-hidden">
                <Split
                    direction="horizontal"
                    sizes={[showSidebar ? 65 : 75, showSidebar ? 35 : 25]}
                    minSize={300}
                    gutterSize={4}
                    className="flex h-full w-full"
                >
                    {/* LEFT SIDE (ConsolePanel) */}
                    <div className="h-full w-full overflow-hidden">
                        {showSidebar ? (
                            <Split
                                direction="vertical"
                                sizes={[50, 50]}
                                minSize={100}
                                gutterSize={4}
                                className="flex flex-col h-full w-full"
                            >
                                <ConsolePanel id={id as string} onReset={handleReset} onRun={handleRun} />
                                <OutputPanel />
                            </Split>
                        ) : (
                            <ConsolePanel id={id as string} onReset={handleReset} onRun={handleRun} />
                        )}
                    </div>

                    {/* RIGHT SIDE (Drawer: Video, Chat, or Output) */}
                    <div className="h-full w-full overflow-hidden flex flex-col bg-[#0d0e15] border-l border-white/10">
                        {/* Sidebar Top Tab Selector */}
                        {showSidebar && (
                            <div className="flex items-center border-b border-white/10 bg-[#12131c] px-2 pt-2 gap-1">
                                <button
                                    onClick={() => setActiveSidebarTab("video")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-t border-x ${activeSidebarTab === "video"
                                        ? "bg-[#0d0e15] border-emerald-500/40 text-emerald-300 font-semibold"
                                        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>Video</span>
                                    {isInHuddle && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveSidebarTab("chat")
                                        setHasUnreadChat(false)
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-t border-x relative ${activeSidebarTab === "chat"
                                        ? "bg-[#0d0e15] border-emerald-500/40 text-emerald-300 font-semibold"
                                        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Chat</span>
                                    {hasUnreadChat && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveSidebarTab("output")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-t border-x ${activeSidebarTab === "output"
                                        ? "bg-[#0d0e15] border-emerald-500/40 text-emerald-300 font-semibold"
                                        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Terminal className="w-3.5 h-3.5" />
                                    <span>Output</span>
                                </button>
                            </div>
                        )}

                        {/* Panel Content */}
                        <div className="flex-1 overflow-hidden">
                            {showSidebar ? (
                                activeSidebarTab === "video" ? (
                                    <VideoHuddlePanel />
                                ) : activeSidebarTab === "chat" && userRole ? (
                                    <ChatArea chatSupport={chatSupport} userRole={userRole} />
                                ) : (
                                    <OutputPanel />
                                )
                            ) : (
                                <OutputPanel />
                            )}
                        </div>
                    </div>
                </Split>
            </div>
        </div>
    )
}

const Page = () => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    if (isMobile) {
        return <MobileEditorBlocker />
    }

    return (
        <WebRTCProvider>
            <EditorContent />
        </WebRTCProvider>
    )
}

export default Page
