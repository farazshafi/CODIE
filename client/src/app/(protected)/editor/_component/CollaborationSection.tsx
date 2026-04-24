"use client"
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Handshake, UserRoundPlus } from "lucide-react";
import { useMutationHook } from "@/hooks/useMutationHook";
import { enableCollabrationApi, getRoomByProjectIdApi } from "@/apis/roomApi";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import InvitationModal from "./InvitationModal";

const CollaborationSection = () => {
    const [isWantToCollab, setIsWantToCollab] = useState(false);
    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [copyMessage, setCopyMessage] = useState("Click to copy");
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const roomId = useEditorStore((state) => state.roomId);
    const setRoomId = useEditorStore((state) => state.setRoomId);
    const user = useUserStore((state) => state.user);
    const setOwnerIdInStore = useEditorStore((state) => state.setOwnerId);
    const ownerId = useEditorStore((state) => state.ownerId);
    const { socket } = useSocket();

    const params = useParams();
    const { id } = params;

    const { mutate: enableCollab } = useMutationHook(enableCollabrationApi, {
        onSuccess(res) {
            setIsWantToCollab(true);
            setRoomId(res.data.data.roomId);
            toast.success("Enabled collaboration!");
        },
        onError(error) {
            toast.error(error instanceof Error ? error.message : String(error));
        },
    });

    const { mutate: getRoomByProjectId } = useMutationHook(getRoomByProjectIdApi, {
        onSuccess(res) {
            setRoomId(res.data.roomId);
            setIsWantToCollab(true);
            setOwnerIdInStore(res.data.owner);
        },
        onError() {
            setIsWantToCollab(false);
        },
    });

    const handleCollaboration = () => {
        enableCollab(id as string);
    };

    const handleInvitation = () => {
        setShowInvitationModal(true);
    };

    const handleModalClose = () => {
        setShowInvitationModal(false);
    };

    const copyRoomId = async () => {
        if (!roomId) return;
        try {
            await navigator.clipboard.writeText(roomId);
            setCopyMessage("Copied!");
        } catch {
            setCopyMessage("Failed to copy!");
        }

        setTooltipOpen(false);
        setTimeout(() => setTooltipOpen(true), 0);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setCopyMessage("Click to copy");
            setTooltipOpen(false);
        }, 2000);
    };

    useEffect(() => {
        if (id) {
            getRoomByProjectId(id as string);
        }
    }, [id, isWantToCollab]);

    useEffect(() => {
        if (!socket || !id) return;
        const refetchCollaborators = () => getRoomByProjectId(id as string);
        socket.on("update-request", refetchCollaborators);
        return () => {
            socket.off("update-request", refetchCollaborators);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [socket, id]);

    return (
        <div className="flex flex-row items-center gap-x-3">
            {isWantToCollab ? (
                <div className="flex flex-row items-center gap-x-3">
                    <div className="flex p-2 px-3 rounded-md bg-tertiary border border-white/10">
                        <p className="text-sm text-white font-medium">
                            Room:
                            {roomId && (
                                <Tooltip open={tooltipOpen}>
                                    <TooltipTrigger asChild>
                                        <span
                                            onClick={copyRoomId}
                                            className="ml-2 px-2 cursor-pointer hover:bg-green-500 hover:text-white transition-colors font-mono font-bold py-0.5 bg-white text-black rounded"
                                        >
                                            #{roomId}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{copyMessage}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </p>
                    </div>
                    {user?.id === ownerId && (
                        <Button
                            onClick={handleInvitation}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            <UserRoundPlus className="w-4 h-4 mr-2" />
                            Invite
                        </Button>
                    )}
                </div>
            ) : (
                <Button
                    onClick={handleCollaboration}
                    size="sm"
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                    <Handshake className="w-4 h-4 mr-2" />
                    Enable Collaboration
                </Button>
            )}

            {showInvitationModal && roomId && (
                <InvitationModal hanldeModalClose={handleModalClose} roomId={roomId} />
            )}
        </div>
    );
};

export default CollaborationSection;
