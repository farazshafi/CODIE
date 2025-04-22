import { Monaco } from "@monaco-editor/react";

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
    editor: Monaco | null;
    executionResult: ExecutionResult | null;

    setEditor: (editor: Monaco) => void;
    getCode: () => string;
    setLanguage: (language: string) => void;
    setTheme: (theme: string) => void;
    setFontSize: (fontSize: number) => void;
    runCode: () => Promise<void>;
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

export interface Collaborator {
    user: {
        _id: string;
        name: string;
    };
    role: string;
    _id: string;
}