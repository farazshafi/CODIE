"use client";
import { blockUnblockSubscribeApi, deleteSubcriptionApi, getAllSubscriptionApi } from "@/apis/subscriptionApi"
import { useMutationHook } from "@/hooks/useMutationHook"
import { CreateSubscriptionInput } from "@/lib/validations/subscriptionValidation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiError extends Error {
    response?: {
        data?: {
            errors?: { message: string }[];
            message?: string;
        };
    };
}

export const useSubscriptionData = () => {
    const [subscriptions, setSubscriptions] = useState<CreateSubscriptionInput[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1)

    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const usersPerPage = "10";


    // mutate
    const { mutate: getAllSubscriptions } = useMutationHook(getAllSubscriptionApi, {
        onSuccess(response) {
            setSubscriptions(response.subscriptions)
            setTotalPages(response.pagination.totalPages);
        },
        onError(erro: ApiError) {
            toast.error(`Error fetching subscriptions: ${erro.message || "Unknown error"}`);
        }
    })

    const { mutate: updateBlockStatus } = useMutationHook(blockUnblockSubscribeApi, {
        onSuccess(res) {
            toast.success(res.message || "Updated subscription status")
            fetchAllSubscriptions()
        },
        onError(erro: ApiError) {
            toast.error(`Error fetching subscriptions: ${erro.message || "Unknown error"}`);
        }
    })

    const { mutate: deleteSubscription } = useMutationHook(deleteSubcriptionApi, {
        onSuccess(response) {
            toast.success(response.message || "Subscription deleted successfully");
            fetchAllSubscriptions()
        },
        onError(erro: ApiError) {
            toast.error(`Error fetching subscriptions: ${erro.message || "Unknown error"}`);
        }
    })


    // functions
    const fetchAllSubscriptions = useCallback(() => {
        getAllSubscriptions({
            limit: usersPerPage,
            page: String(currentPage),
            status: filterStatus,
            search: searchKeyword
        })
    }, [getAllSubscriptions, currentPage, filterStatus, searchKeyword]);

    const handleSuspendActive = (id: string, status: string) => {
        updateBlockStatus({ id, status })
    }

    const handleDeleteSubscription = (id: string) => {
        deleteSubscription(id)
    }

    //useeffect
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setSearchKeyword(searchInput)
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [searchInput]);

    useEffect(() => {
        fetchAllSubscriptions();
    }, [fetchAllSubscriptions])

    return {
        subscriptions,
        fetchAllSubscriptions,
        handleSuspendActive,
        totalPages,
        setCurrentPage,
        currentPage,
        setFilterStatus,
        setSearchInput,
        handleDeleteSubscription
    }
}