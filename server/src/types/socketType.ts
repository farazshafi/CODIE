export interface ApproveRequestData {
    roomId: string;
    requestId: string;
    userId?: string;
}

export interface ApproveUserResult {
    success: boolean;
    error?: string;
    approvedUserId?: string;
    roomId?: string;
}

export interface RejectUserResult {
    success: boolean;
    error?: string;
    rejectedUserId?: string;
    roomId?: string;
}
export interface ApproveInvitationResult {
    success: boolean;
    error?: string;
    senderId?: string;
    roomId?: string;
    reciverName?:string;
}