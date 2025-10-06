import * as monaco from 'monaco-editor';

export interface Theme {
    id: string;
    label: string;
    color: string;
}

export interface CodeEditorState {
    language: string;
    output: string;
    isRunning: boolean;
    error: string | null;
    theme: string;
    fontSize: number;
    editor: monaco.editor.IStandaloneCodeEditor | null;
    executionResult: ExecutionResult | null;

    setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => void;
    getCode: () => string;
    setLanguage: (language: string) => void;
    setTheme: (theme: string) => void;
    setFontSize: (fontSize: number) => void;
    runCode: () => Promise<void>;
    reset: () => void;
}


export interface ExecutionResult {
    code: string;
    output: string;
    error: string | null;
}

export interface ProjectCardType {
    projectName: string;
    projectLanguage: string;
    createdAt: Date;
    updatedAt: Date;
    id: string;
}

export interface ICollaborator {
    user: {
        _id: string;
        name: string;
        email: string;
    };
    role: string;
    _id: string;
}

export interface ISendAndReciveRequest {
    _id: string;
    roomId: string;
    reciverId: {
        _id: string;
        name: string;
    };
    senderId: {
        _id: string;
        name: string;
    };
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

export interface ContributorSummary {
    userId: string;
    name: string;
    avatar: string;
    totalContributions: number;
    roles: {
        projectId: string;
        role: "owner" | "editor" | "viewer";
    }[];
}
