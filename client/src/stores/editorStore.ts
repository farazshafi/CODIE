import { create } from "zustand";
import { persist } from "zustand/middleware";


interface useState {
    roomId: string | null;
    projectId: string | null;
    userRole: "owner" | "editor" | "viewer" | null;
    setRoomId: (roomId: string | null) => void;
    setProjectId: (projectId: string | null) => void;
    setUserRole: (role: "owner" | "editor" | "viewer") => void;
}

export const useEditorStore = create<useState>()(
    persist(
        (set) => ({
            roomId: null,
            projectId: null,
            userRole: null,
            setRoomId: (roomId) => set({ roomId }),
            setProjectId: (projectId) => set({ projectId }),
            setUserRole: (userRole) => set({ userRole })
        }),
        {
            name: "editor-store",
        }
    )
)