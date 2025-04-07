"use client"

import React, { useEffect, useState } from "react";

const CodeAnimation = () => {
    const [codeLines, setCodeLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState(0);

    const codeSnippet = [
        'import { collaborative } from "code-spark";',
        "",
        "// Initialize collaborative editor",
        "const editor = collaborative.create({",
        "  project: 'awesome-app',",
        "  language: 'typescript',",
        "  theme: 'dark'",
        "});",
        "",
        "// Invite teammates to collaborate",
        "editor.invite(['jane@example.com', 'john@example.com']);",
        "",
        "// Enable AI features",
        "editor.enableAI({",
        "  suggestions: true,",
        "  codeExplanation: true,",
        "  autoCompletion: true",
        "});",
        "",
        "// Deploy instantly",
        "editor.deploy();",
    ];

    useEffect(() => {
        if (currentLine < codeSnippet.length) {
            const timer = setTimeout(() => {
                setCodeLines((prevLines) => [...prevLines, codeSnippet[currentLine]]);
                setCurrentLine((prev) => prev + 1);
            }, 150);

            return () => clearTimeout(timer);
        }
    }, [currentLine]);

    return (
        <div className="relative w-full">
            <div className="absolute -inset-1"></div>
            <div className="relative bg-black rounded-xl p-6 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-gray-400 text-sm">collaborative-project.ts</span>
                </div>
                <pre className="text-left text-sm md:text-base overflow-x-auto">
                    <code className="font-mono">
                        {codeLines.map((line, index) => (
                            <div key={index} className="line">
                                <span className="text-gray-500 mr-4">{index + 1}</span>
                                {line.includes("import") ? (
                                    <span className="text-green-400">{line}</span>
                                ) : line.includes("//") ? (
                                    <span className="text-gray-500">{line}</span>
                                ) : line.includes("'") ? (
                                    <span>
                                        {line.split("'").map((part, i) => (
                                            <React.Fragment key={i}>
                                                {i % 2 === 0 ? part : <span className="text-green-400">'{part}'</span>}
                                            </React.Fragment>
                                        ))}
                                    </span>
                                ) : line.includes(":") && !line.includes("(") ? (
                                    <span>
                                        {line.split(":").map((part, i) => (
                                            <React.Fragment key={i}>
                                                {i === 0 ? (
                                                    <span>
                                                        {part}:<span className="text-green-400">
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-green-400">{part}</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </span>
                                ) : (
                                    <span className="text-gray-300">{line}</span>
                                )}
                            </div>
                        ))}
                        <div className="h-4 w-2 bg-green-500 opacity-75 inline-block animate-pulse"></div>
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeAnimation;