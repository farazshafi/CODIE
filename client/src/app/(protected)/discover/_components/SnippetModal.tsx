"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { IDiscover } from '@/app/(protected)/discover/page';
import { Check, Copy, SquareTerminal } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useMutationHook } from '@/hooks/useMutationHook';
import { getUserSubscriptionApi } from '@/apis/userSubscriptionApi';
import { useUserStore } from '@/stores/userStore';
import { explainCodeApi } from '@/apis/discoverApi';

interface SnippetModalProps {
    open: boolean;
    onClose: () => void;
    project: IDiscover | null;
}

const SnippetModal: React.FC<SnippetModalProps> = ({ open, onClose, project }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isAiExplanationOn, setIsAiExplanationOn] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null | boolean>(null);

    const user = useUserStore((state) => state.user);

    const { mutate: getSubscription } = useMutationHook(getUserSubscriptionApi, {
        onSuccess(data) {
            console.log("user subscription data", data);
        }
    });

    const { mutate: getExplanation, isLoading: generatingExplanation } = useMutationHook(explainCodeApi, {
        onSuccess(data) {
            setAiExplanation(data || "No explanation found.");
            toast.success("AI code explanation generated.");
        }, onError(error) {
            setAiExplanation(false)
            toast.info(error.response.data.message || "Please upgrade your subscription")
        },
    });

    useEffect(() => {
        if (user?.id) {
            getSubscription(user.id);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!isAiExplanationOn) {
            setAiExplanation(null);
        } else if (project?.projectId.projectCode && aiExplanation === null) {
            getExplanation(project.projectId.projectCode);
        }
    }, [isAiExplanationOn, project]);


    const handleCopy = () => {
        if (!project) return;
        navigator.clipboard.writeText(project.projectId.projectCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] h-[90vh] max-h-[90vh] p-4 overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>Project Code Modal</DialogTitle>
                </VisuallyHidden>
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
                        <h3 className="font-bold text-lg mb-2">Code Explanation</h3>
                        <div className="flex items-center space-x-2 mt-2">
                            <Switch
                                id="ai-explanation"
                                checked={isAiExplanationOn}
                                onCheckedChange={setIsAiExplanationOn}
                            />
                            <Label htmlFor="ai-explanation">AI Code Explanation <SquareTerminal /></Label>
                        </div>

                        {isAiExplanationOn && (
                            <div className="text-sm leading-relaxed text-black max-h-[35vh] overflow-auto mt-4">
                                {generatingExplanation ? "Generating explanation..." : aiExplanation}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SnippetModal;
