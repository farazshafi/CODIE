"use client";
import { blockUnblockSubscribeApi, deleteSubcriptionApi, getAllSubscriptionApi } from "@/apis/subscriptionApi"
import { useMutationHook } from "@/hooks/useMutationHook"
import { CreateSubscriptionInput } from "@/lib/validations/subscriptionValidation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
        onError(erro) {
            toast.error(`Error fetching subscriptions: ${erro.message || "Unknown error"}`);
        }
    })

    const { mutate: updateBlockStatus } = useMutationHook(blockUnblockSubscribeApi, {
        onSuccess(response) {
            fetchAllSubscriptions()
        },
        onError(erro) {
            toast.error(`Error fetching subscriptions: ${erro.message || "Unknown error"}`);
        }
    })

    const { mutate: deleteSubscription } = useMutationHook(deleteSubcriptionApi, {
        onSuccess(response) {
            fetchAllSubscriptions()
        },
        onError(erro) {
            toast.error(`Error fetching subscriptions: ${erro.message || "Unknown error"}`);
        }
    })


    // functions
    const fetchAllSubscriptions = () => {
        getAllSubscriptions({
            limit: usersPerPage,
            page: currentPage,
            status: filterStatus,
            search: searchKeyword
        })
    }

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
    }, [filterStatus, searchKeyword])

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