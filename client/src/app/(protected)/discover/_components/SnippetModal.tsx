"use client";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { IDiscover } from '@/app/(protected)/discover/page';
import { Check, Copy, SquareTerminal, UsersRound } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useMutationHook } from '@/hooks/useMutationHook';
import { getUserSubscriptionApi } from '@/apis/userSubscriptionApi';
import { useUserStore } from '@/stores/userStore';
import { explainCodeApi } from '@/apis/discoverApi';
import ReactMarkdown from "react-markdown"
import CommentSection from './CommentSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getContributersApi } from '@/apis/roomApi';
import { useEditorStore } from '@/stores/editorStore';
import Link from 'next/link';

interface SnippetModalProps {
    open: boolean;
    onClose: () => void;
    project: IDiscover | null;
    owner: { _id: string, name: string }
}

interface ApiError extends Error {
    response?: {
        data?: {
            message?: string;
        };
    };
}


type contributorType = {
    _id: string,
    user: { _id: string, name: string },
    role: string,
}


const SnippetModal: React.FC<SnippetModalProps> = ({ open, onClose, project, owner }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isAiExplanationOn, setIsAiExplanationOn] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isCodeVisible, setIsCodeVisible] = useState(true);
    const [contributors, setContributors] = useState<contributorType[]>([])


    const user = useUserStore((state) => state.user);
    const projectId = useEditorStore((state) => state.projectId)

    const { mutate: getSubscription } = useMutationHook(getUserSubscriptionApi, {
        onSuccess(data) {
            console.log("user subscription data", data);
        }
    });

    const { mutate: getExplanation, isLoading: generatingExplanation } = useMutationHook(explainCodeApi, {
        onSuccess(data) {
            setAiExplanation(data.data || "No explanation found.");
            toast.success("AI code explanation generated.");
        }, onError(error: ApiError) {
            setAiExplanation(null)
            toast.info(error?.response?.data?.message || "Please upgrade your subscription")
        },
    });

    const { mutate: getContributers, isLoading: loadingContributers } = useMutationHook(getContributersApi, {
        onSuccess(data) {
            setContributors(data.data)
        }
    });

    useEffect(() => {
        if (user?.id && projectId) {
            getSubscription(user.id);
            getContributers(projectId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        if (!isAiExplanationOn) {
            setAiExplanation(null);
        } else if (project?.projectId.projectCode && aiExplanation === null) {
            getExplanation(project.projectId.projectCode);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <div className="flex flex-col w-full md:w-[70%] gap-y-3">
                        <div className="rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-x-3">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>{owner.name}</AvatarFallback>
                                </Avatar>
                                <p>{owner.name}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-black text-2xl font-semibold">
                                    {project.projectId.projectName}
                                </p>
                                <button
                                    onClick={() => setIsCodeVisible(prev => !prev)}
                                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    {isCodeVisible ? "Hide Code" : "Show Code"}
                                </button>
                            </div>

                            {isCodeVisible && (
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
                            )}
                        </div>

                        <CommentSection />
                    </div>

                    {/* Right Sidebar */}
                    <div className="flex flex-col gap-y-4 w-full md:w-[30%] bg-gray-100 rounded-lg p-4 overflow-auto border border-gray-200">
                        <div>

                            {/* Contributors */}
                            <div className="mt-6">
                                <div className="flex gap-x-2 items-center">
                                    <UsersRound />
                                    <p className="font-medium">Contributors</p>
                                    <div className="flex items-center justify-center p-1 w-[30px] h-[30px] rounded-full bg-green-600 text-white text-sm">
                                        {contributors.length < 1 ? 0 : contributors.length - 1}
                                    </div>
                                </div>

                                {/* Contributors Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {loadingContributers ? <p>Loading...</p> : contributors
                                        .filter((contributor) => contributor.role !== "owner")
                                        .map((contributor) => (
                                            <Link href={`/contributor/${contributor.user._id}`} key={contributor._id}>
                                                <div className="flex items-center gap-x-2 bg-gray-600 p-2 rounded-lg text-white cursor-pointer">
                                                    <Avatar>
                                                        <AvatarImage src="https://github.com/shadcn.png" />
                                                        <AvatarFallback>{contributor.user.name}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-medium">{contributor.user.name}</p>
                                                        <p className="text-green-600 text-xs">{contributor.role}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Code Explanation */}
                        <div>
                            <h3 className="font-bold text-lg mb-2">Code Explanation</h3>
                            <div className="flex items-center space-x-2 mt-2">
                                <Switch
                                    id="ai-explanation"
                                    checked={isAiExplanationOn}
                                    onCheckedChange={setIsAiExplanationOn}
                                />
                                <Label htmlFor="ai-explanation">
                                    AI Code Explanation <SquareTerminal />
                                </Label>
                            </div>

                            {isAiExplanationOn && (
                                <div className="text-sm leading-relaxed text-black max-h-[35vh] overflow-auto mt-4 prose">
                                    {generatingExplanation ? (
                                        "Generating explanation..."
                                    ) : (
                                        <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SnippetModal;
