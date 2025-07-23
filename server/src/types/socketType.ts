

export interface ApproveRequestData {
    roomId: string;
    requestId: string;
    userId?: string;
    projectId?: string;
}

export interface ApproveUserResult {
    success: boolean;
    error?: string;
    approvedUserId?: string;
    roomId?: string;
    projectId?: string;
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
    reciverName?: string;
    projectId?: string
}

export interface ISentMessage {
    roomId: string; senderId: string; senderName: string; content: string; senderRole: "owner" | "editor" | "viewer", projectId: string
}

// project socket 

export interface JoinProjectData { projectId: string, userId: string }

export interface leaveProjectData { projectId: string, userId: string, userName: string }

export interface updateCodeData { projectId: string, code: string, userId: string }

export interface updateRoleData { userId: string, role: "viewer" | "editor", projectId: string }

export interface ProjectServiceResult {
    success: boolean;
    error?: string;
}
