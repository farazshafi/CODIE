import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
    name: string;
    email: string;
    avatar?: string;
    token?: string;
    id: string;
    isAdmin: boolean;
}

interface userState {
    user: User | null;
    setUser: (user: User) => void
    logout: () => void
}

export const useUserStore = create<userState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => {
                set({ user })
            },
            logout: () => {
                set({ user: null })
                localStorage.removeItem("user-storage");
            }
        }),
        {
            name: "user-storage"
        }
    ),
)