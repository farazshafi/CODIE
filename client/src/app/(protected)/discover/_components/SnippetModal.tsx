"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IDiscover } from '@/app/(protected)/discover/page';
import { Check, Copy } from 'lucide-react';

interface SnippetModalProps {
    open: boolean;
    onClose: () => void;
    project: IDiscover | null;
}

const SnippetModal: React.FC<SnippetModalProps> = ({ open, onClose, project }) => {
    if (!project) return null;

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(project.projectId.projectCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] h-[90vh] max-h-[90vh] p-4 overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4 h-full">
                    <div className="w-full md:w-[70%] rounded-lg p-4 overflow-y-auto border border-gray-200">
                        <p className="text-black text-2xl font-semibold mb-4">
                            {project.projectId.projectName}
                        </p>

                        <div className="relative bg-black text-white p-3 rounded-md text-sm">
                            <button
                                onClick={handleCopy}
                                className="gap-x-2 flex items-center absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                            >
                                {isCopied ? (
                                    <>
                                        <span>Copied</span>
                                        <Check size={14} />
                                    </>
                                ) : (
                                    <>
                                        <span>Copy</span>
                                        <Copy size={14} />
                                    </>
                                )}
                            </button>

                            <div className="max-h-[40vh] overflow-auto pr-2">
                                <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                                    <code>{project.projectId.projectCode}</code>
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-[30%] bg-gray-100 rounded-lg p-4 overflow-auto border border-gray-200">
                        <h3 className="font-bold text-lg mb-2">Explanation</h3>
                        <div className="text-sm leading-relaxed text-black max-h-[35vh] overflow-auto">
                            <strong>Intuition</strong><br />
                            To improve our runtime complexity, we need a more efficient way to check if the complement exists in the array...
                            <br /><br />
                            <strong>Algorithm</strong><br />
                            A simple implementation uses two iterations. In the first, we add each value as a key and its index as value...
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SnippetModal;
