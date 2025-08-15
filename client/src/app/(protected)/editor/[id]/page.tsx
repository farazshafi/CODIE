"use client"
import React, { useEffect, useState } from "react"
import Split from "react-split"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, CirclePlay, ClipboardCheck, Clock, Copy, RotateCw, } from "lucide-react"
import { useCodeEditorStore, getExecutionResult } from "@/stores/useCodeEditorStore"
import { toast } from "sonner"
import Header from "../_component/Header"
import EditorPanel from "../_component/EditorPanel"
import RunningCodeSkeleton from "../_component/RunningCodingSkelton"
import { LANGUAGE_CONFIG } from "../_constants"
import { useEditorStore } from "@/stores/editorStore"
import { useParams } from "next/navigation"
import ChatArea from "../_component/ChatArea"

const Page = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [showCollaborators, setShowCollaborators] = useState(false)
    const [copyLoading, setCopyLoading] = useState(false)
    const { id } = useParams()
    const setProjectId = useEditorStore((state) => state.setProjectId)
    const userRole = useEditorStore((state) => state.userRole)
    const { language, editor, output, isRunning, error, runCode } = useCodeEditorStore()
    const [chatSupport, setChatSupport] = useState({
        text: false,
        voice: false
    })


    // functions
    const handleReset = () => {
        console.log(showCollaborators)
        const defaultCode = LANGUAGE_CONFIG[language].defaultCode
        if (editor) editor.setValue(defaultCode)
        localStorage.removeItem(`editor-code-${language}`)
    }

    const handleRun = async () => {
        await runCode()
        const result = getExecutionResult()
        console.log("code exicution result: ", result)
    }

    const handleCopy = () => {
        if (output) {
            setCopyLoading(true)
            setTimeout(() => {
                setCopyLoading(false)
            }, 3000)
            navigator.clipboard.writeText(output).then(() => {
                toast.success("Copied")
            }).catch((err) => {
                console.error("Failed to copy output: ", err)
            })
        } else {
            toast.info("No output to copy")
        }
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
    }, [id])

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Header
                onChatToggle={(chatSupport) => {
                    setChatSupport(chatSupport)
                    setShowChat((prev) => !prev)
                    setShowCollaborators(false)
                }}
                onCollaboratorsToggle={() => {
                    setShowCollaborators((prev) => !prev)
                    setShowChat(false)
                }}
            />

            <div className="flex-1 overflow-hidden">
                {isMobile ? (
                    <div className="bg-red-500 w-full h-screen">

                        <Split
                            className="split text-white w-full flex flex-col h-screen"
                            direction="vertical"
                            color="#1bf07c"
                            minSize={200}
                            gutterSize={8}
                        >
                            <div className="bg-gray-900 overflow-auto">
                                <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                    <p>Console</p>
                                    <div className="flex gap-x-3">
                                        <Button onClick={handleReset} className="bg-gray text-white hover:bg-gray-700 hover:text-white">
                                            <RotateCw />
                                        </Button>
                                        <Button className="bg-green text-black hover:bg-gray-700 hover:text-white">
                                            <CirclePlay /> Run
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <EditorPanel />
                                </div>
                            </div>
                            <div className="bg-slate-700 overflow-auto">
                                <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                    <p>Output</p>
                                    <Button disabled={copyLoading} onClick={handleCopy} className="hover:bg-gray-600 text-white bg-primary hover:text-white">
                                        {copyLoading ? (<><ClipboardCheck /> Copied</>) : (<><Copy /> Copy</>)}
                                    </Button>
                                </div>
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
                                    {/* Console */}
                                    <div className="bg-gray-900 h-full flex flex-col">
                                        <div className="flex flex-row justify-between items-center px-5 py-2 text-white">
                                            <p>Console</p>
                                            <div className="flex gap-x-3">
                                                <Button onClick={handleReset} className="bg-tertiary text-white hover:bg-gray-700 hover:text-white">
                                                    <RotateCw />
                                                </Button>
                                                <Button onClick={handleRun} className="bg-green text-black hover:bg-gray-700 hover:text-white">
                                                    <CirclePlay /> Run
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-hidden">
                                            <EditorPanel />
                                        </div>
                                    </div>

                                    {/* Output */}
                                    <div className="bg-slate-800 h-screen flex flex-col">
                                        <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                            <p>Output</p>
                                            <Button disabled={copyLoading} onClick={handleCopy} className="hover:bg-gray-600 text-white bg-primary hover:text-white">
                                                {copyLoading ? (<><ClipboardCheck /> Copied</>) : (<><Copy /> Copy</>)}
                                            </Button>
                                        </div>

                                        <div className="flex-grow text-white px-4 py-2 flex flex-col">
                                            <div className="relative flex-grow">
                                                <div
                                                    className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
                rounded-xl p-4 h-full overflow-auto font-mono text-sm">

                                                    {isRunning ? (
                                                        <RunningCodeSkeleton />
                                                    ) : error ? (
                                                        <div className="flex items-start gap-3 text-red-400">
                                                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" />
                                                            <div className="space-y-1">
                                                                <div className="font-medium">Execution Error</div>
                                                                <pre className="whitespace-pre-wrap text-red-400/80">{error}</pre>
                                                            </div>
                                                        </div>
                                                    ) : output ? (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                                                <CheckCircle className="w-5 h-5" />
                                                                <span className="font-medium">Execution Successful</span>
                                                            </div>
                                                            <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4">
                                                                <Clock className="w-6 h-6" />
                                                            </div>
                                                            <p className="text-center">Run your code to see the output here...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </Split>
                            ) : (
                                <div className="bg-gray-800 overflow-hidden h-full flex flex-col">
                                    <div className="flex flex-row justify-between items-center px-5 py-2 text-white bg-black">
                                        <p>Console</p>
                                        <div className="flex gap-x-3">
                                            <Button onClick={handleReset} className="bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
                                                <RotateCw />
                                            </Button>
                                            <Button onClick={handleRun} className="bg-green text-black hover:bg-gray-700 hover:text-white">
                                                <CirclePlay /> Run
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <EditorPanel />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE (Either Chat or Output) */}
                        <div className="h-full w-full overflow-hidden">
                            {showChat && userRole ? (
                                <ChatArea chatSupport={chatSupport} userRole={userRole} />
                            ) : (
                                <div className="bg-slate-800 h-screen flex flex-col">
                                    <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                        <p>Output</p>
                                        <Button disabled={copyLoading} onClick={handleCopy} className="hover:bg-gray-600 text-white bg-primary hover:text-white">
                                            {copyLoading ? (<><ClipboardCheck /> Copied</>) : (<><Copy /> Copy</>)}
                                        </Button>

                                    </div>

                                    <div className="flex-grow text-white px-4 py-2 flex flex-col">
                                        <div className="relative flex-grow">
                                            <div
                                                className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
                                            rounded-xl p-4 h-full overflow-auto font-mono text-sm">

                                                {isRunning ? (
                                                    <RunningCodeSkeleton />
                                                ) : error ? (
                                                    <div className="flex items-start gap-3 text-red-400">
                                                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" />
                                                        <div className="space-y-1">
                                                            <div className="font-medium">Execution Error</div>
                                                            <pre className="whitespace-pre-wrap text-red-400/80">{error}</pre>
                                                        </div>
                                                    </div>
                                                ) : output ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                                            <CheckCircle className="w-5 h-5" />
                                                            <span className="font-medium">Execution Successful</span>
                                                        </div>
                                                        <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4">
                                                            <Clock className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-center">Run your code to see the output here...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            )}
                        </div>
                    </Split>
                )}
            </div>
        </div >
    )
}

export default Page
