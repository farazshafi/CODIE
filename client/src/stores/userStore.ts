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

interface ISubscription {
    name: string;
    text: boolean;
    voice: boolean;
    id: string;
    pricePerMonth: number;
    maxPrivateProjects: number;
    nextPlanId: string;
    endDate: Date;
}

interface userState {
    user: User | null;
    subscription: ISubscription | null;
    setUser: (user: User) => void;
    logout: () => void;
    setSubscription: (sub: ISubscription) => void;
}

export const useUserStore = create<userState>()(
    persist(
        (set) => ({
            user: null,
            subscription: null,
            setUser: (user) => {
                set({ user })
            },
            setSubscription: (subscription) => {
                set({ subscription })
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