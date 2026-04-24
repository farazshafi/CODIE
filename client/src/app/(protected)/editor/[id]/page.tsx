"use client"
import React, { useEffect, useState } from "react"
import Split from "react-split"
import { useCodeEditorStore, getExecutionResult } from "@/stores/useCodeEditorStore"
import Header from "../_component/Header"
import { useEditorStore } from "@/stores/editorStore"
import { useParams } from "next/navigation"
import ChatArea from "../_component/ChatArea"
import { useSocket } from "@/context/SocketContext"
import { useUserStore } from "@/stores/userStore"
import ConsolePanel from "../_component/ConsolePanel"
import OutputPanel from "../_component/OutputPanel"
import CollaborationSection from "../_component/CollaborationSection"

const Page = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const { id } = useParams()
    const setProjectId = useEditorStore((state) => state.setProjectId)
    const userRole = useEditorStore((state) => state.userRole)
    const { runCode } = useCodeEditorStore()
    const [chatSupport, setChatSupport] = useState({
        text: false,
        voice: false
    })

    const { socket } = useSocket()
    const projectId = useEditorStore((sate) => sate.projectId)
    const user = useUserStore((sate) => sate.user)


    // functions
    const handleReset = () => {
        // handle reset logic
    }

    const handleRun = async () => {
        await runCode()
        const result = getExecutionResult()
        console.log("code exicution result: ", result)
    }



    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        setProjectId(id as string)
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

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Header
                onChatToggle={(chatSupport) => {
                    setChatSupport(chatSupport)
                    setShowChat((prev) => !prev)
                }}
                onCollaboratorsToggle={() => {
                    setShowChat(false)
                }}
            />

            <div className="flex-1 overflow-hidden">
                {isMobile ? (
                    <div className="w-full h-screen">
                        <Split
                            direction="vertical"
                            className="flex flex-col h-screen"
                            minSize={200}
                            gutterSize={16}
                            sizes={[70, 30]} // initial sizes
                            expandToMin={false}
                        >
                            {/* Top (fixed-ish) */}
                            <div className="overflow-hidden">
                                <div className="bg-[#1e1e2e] p-3 border-b border-white/5 flex items-center justify-between">
                                    <CollaborationSection />
                                </div>
                                <ConsolePanel
                                    id={id as string}
                                    onReset={handleReset}
                                    onRun={handleRun}
                                />
                            </div>

                            {/* Bottom (output - resizable focus) */}
                            <div className="overflow-auto">
                                <OutputPanel />
                            </div>
                        </Split>
                    </div>
                ) : (
                    <Split
                        direction="horizontal"
                        sizes={[showChat ? 60 : 70, showChat ? 40 : 30]}
                        minSize={300}
                        gutterSize={4}
                        className="flex h-full w-full"
                    >
                        {/* LEFT SIDE (Console + maybe Output) */}
                        <div className="h-full w-full overflow-hidden">
                            {showChat ? (
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

                        {/* RIGHT SIDE (Either Chat or Output) */}
                        <div className="h-full w-full overflow-hidden">
                            {showChat && userRole ? (
                                <ChatArea chatSupport={chatSupport} userRole={userRole} />
                            ) : (
                                <OutputPanel />
                            )}
                        </div>
                    </Split>
                )}
            </div>
        </div >
    )
}

export default Page
