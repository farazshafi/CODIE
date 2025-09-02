

import mongoose from 'mongoose';

export interface RequestData {
    roomId: string;
    userId: string;
    userName: string;
    requestId: string;
}

export interface ApproveUserData {
    roomId: string;
    userId: string;
}

export interface ContributorSummary {
  userId: mongoose.Types.ObjectId | string;
  name: string;
  avatar: string;
  totalContributions: number;
  roles: {
    projectId: mongoose.Types.ObjectId | string;
    role: "owner" | "editor" | "viewer";
  }[];
}