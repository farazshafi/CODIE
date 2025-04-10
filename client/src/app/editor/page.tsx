"use client";
import React, { useEffect, useState } from "react";
import Split from "react-split";
import Header from "./_component/Header";
import { Button } from "@/components/ui/button";
import { CirclePlay, Copy } from "lucide-react";

const Page = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showCollaborators, setShowCollaborators] = useState(false);


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Header
                onChatToggle={() => {
                    setShowChat((prev) => !prev);
                    setShowCollaborators(false);
                }}
                onCollaboratorsToggle={() => {
                    setShowCollaborators((prev) => !prev);
                    setShowChat(false);
                }}
            />

            <div className="flex-1 overflow-hidden">
                {isMobile ? (
                    <div className="flex flex-col h-full w-full">
                        <div className="flex-1 bg-blue-200 p-4 overflow-auto">Console</div>
                        <div className="flex-1 bg-green-200 p-4 overflow-auto">Output</div>
                    </div>
                ) : (
                    <Split
                        direction="horizontal"
                        sizes={[showChat ? 60 : 70, showChat ? 40 : 30]}
                        minSize={300}
                        gutterSize={8}
                        className="flex h-full w-full"
                    >
                        {/* LEFT SIDE (Console + maybe Output) */}
                        <div className="h-full w-full overflow-hidden">
                            {showChat ? (
                                <Split
                                    direction="vertical"
                                    sizes={[50, 50]}
                                    minSize={100}
                                    gutterSize={8}
                                    className="flex flex-col h-full w-full"
                                >
                                    {/* Console */}
                                    <div className="bg-gray-900 overflow-auto">
                                        <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                            <p>Console</p>
                                            <Button className="bg-green text-black hover:bg-gray-700 hover:text-white">
                                                <CirclePlay /> Run
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Output */}
                                    <div className="bg-slate-700 overflow-auto">
                                        <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                            <p>Output</p>
                                            <Button className="bg-green text-black hover:bg-gray-700 hover:text-white">
                                                <Copy /> Copy
                                            </Button>
                                        </div>
                                    </div>
                                </Split>
                            ) : (
                                <div className="bg-gray-800 overflow-auto h-full">
                                    <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                        <p>Console</p>
                                        <Button className="bg-green text-black hover:bg-gray-700 hover:text-white">
                                            <CirclePlay /> Run
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE (Either Chat or Output) */}
                        <div className="h-full w-full overflow-hidden">
                            {showChat ? (
                                <div className="bg-gray-100 overflow-auto h-full">
                                    <p className="text-black font-semibold">Chat Panel</p>
                                    <p className="text-gray-600">This is your chat area</p>
                                </div>
                            ) : (
                                <div className="bg-slate-800 overflow-auto h-full">
                                    <div className="w-full text-white bg-black flex items-center px-4 py-2 justify-between">
                                        <p>Output</p>
                                        <Button className="hover:bg-gray-600 text-white bg-primary hover:text-white">
                                            <Copy /> Copy
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Split>
                )}
            </div>
        </div>
    );
};

export default Page;
