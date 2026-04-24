"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, ClipboardCheck, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useCodeEditorStore } from "@/stores/useCodeEditorStore"
import RunningCodeSkeleton from "./RunningCodingSkelton"
import { toast } from "sonner"

const OutputPanel = () => {
    const { output, isRunning, error } = useCodeEditorStore()
    const [copyLoading, setCopyLoading] = useState(false)

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

    return (
        <div className="bg-slate-800 h-full flex flex-col">
            <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between border-b border-gray-800">
                <p className="font-medium">Output</p>
                <Button 
                    variant="ghost"
                    disabled={copyLoading || !output} 
                    onClick={handleCopy} 
                    className="h-8 hover:bg-gray-800 text-gray-300 hover:text-white"
                >
                    {copyLoading ? (
                        <><ClipboardCheck className="w-4 h-4 mr-2" /> Copied</>
                    ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copy</>
                    )}
                </Button>
            </div>

            <div className="flex-grow text-white px-4 py-4 flex flex-col overflow-hidden">
                <div className="relative flex-grow h-full">
                    <div className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] rounded-xl p-4 h-full overflow-auto font-mono text-sm scrollbar-thin scrollbar-thumb-gray-700">
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
    )
}

export default OutputPanel
