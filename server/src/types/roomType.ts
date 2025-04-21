import mongoose from "mongoose";

export type CreateRoomType = {
    roomId: string;
    projectId: string;
    ownerId: string;
}


export interface Collaborator {
    user: mongoose.Types.ObjectId;
    role: "owner" | "editor" | "viewer";
}

export interface Room {
    roomId: string;
    projectId: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    collaborators: Collaborator[];
    createdAt?: Date;
    updatedAt?: Date;
}