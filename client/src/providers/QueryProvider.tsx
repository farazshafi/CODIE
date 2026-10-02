"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { warmupPistonEngine } from "@/stores/useCodeEditorStore";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes stale time
                        gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    useEffect(() => {
        // Automatically warm up Piston execution container on Render when user enters the website
        warmupPistonEngine();
    }, []);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
