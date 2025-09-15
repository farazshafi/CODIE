import { create } from "zustand";
import { persist } from "zustand/middleware";


interface useState {
    roomId: string | null;
    projectId: string | null;
    userRole: "owner" | "editor" | "viewer" | null;
    ownerId: string | null;
    isContributionEnabled: boolean;
    setRoomId: (roomId: string | null) => void;
    setProjectId: (projectId: string | null) => void;
    setUserRole: (role: "owner" | "editor" | "viewer") => void;
    setOwnerId: (ownerId: string | null) => void,
    setContributionEnabled: () => void
}

export const useEditorStore = create<useState>()(
    persist(
        (set) => ({
            roomId: null,
            projectId: null,
            userRole: null,
            ownerId: null,
            isContributionEnabled: false,
            setRoomId: (roomId) => set({ roomId }),
            setProjectId: (projectId) => set({ projectId }),
            setUserRole: (userRole) => set({ userRole }),
            setOwnerId: (ownerId) => set({ ownerId }),
            setContributionEnabled: () => set({ isContributionEnabled: true })
        }),
        {
            name: "editor-store",
        }
    )
)