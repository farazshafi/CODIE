"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { RotateCw, CirclePlay } from "lucide-react"
import EditorPanel from "./EditorPanel"

interface ConsolePanelProps {
    id: string
    onReset: () => void
    onRun: () => void
}

const ConsolePanel = ({ id, onReset, onRun }: ConsolePanelProps) => {
    return (
        <div className="bg-gray-900 h-full flex flex-col">
            <div className="flex flex-row justify-between items-center px-5 py-2 text-white bg-black">
                <p>Console</p>
                <div className="flex gap-x-3">
                    <Button 
                        onClick={onReset} 
                        className="bg-gray-800 text-white hover:bg-gray-700 hover:text-white"
                    >
                        <RotateCw />
                    </Button>
                    <Button 
                        onClick={onRun} 
                        className="bg-green text-black hover:bg-gray-700 hover:text-white"
                    >
                        <CirclePlay /> Run
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <EditorPanel id={id} />
            </div>
        </div>
    )
}

export default ConsolePanel
