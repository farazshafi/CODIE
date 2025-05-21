import { create } from "zustand";
import { persist } from "zustand/middleware";


interface useState {
    roomId: string | null;
    projectId: string | null;
    setRoomId: (roomId: string | null) => void;
    setProjectId: (projectId: string | null) => void;
}

export const useEditorStore = create<useState>()(
    persist(
        (set) => ({
            roomId: null,
            projectId: null,
            setRoomId: (roomId) => set({ roomId }),
            setProjectId: (projectId) => set({ projectId }),
        }),
        {
            name: "editor-store",
        }
    )
)