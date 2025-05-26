"use client";
import React from 'react'
import { useSubscriptionData } from './_hook/useSubscriptionData'
import SubscriptionTable from './_components/subscriptionTable';
import Pagination from '@/components/ui/Pagination';
import AdvancedFilter from '@/components/ui/AdvancedFilter';
import SearchBar from '@/components/ui/SearchBar';

const page = () => {

    const { subscriptions, handleSuspendActive, setCurrentPage, totalPages, currentPage, setFilterStatus, setSearchInput } = useSubscriptionData()


    return (
        <div className="admin-card p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <p className="text-admin-muted text-sm">Showing {subscriptions.length} result{subscriptions.length !== 1 && 's'}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <SearchBar onSearch={setSearchInput} />
                    <AdvancedFilter onFilterChange={setFilterStatus} />
                </div>
            </div>

            {/* Subscription table */}
            {subscriptions.length > 0 ? (
                <SubscriptionTable handleSuspendActive={handleSuspendActive} subscriptions={subscriptions} />
            ) : (
                <div className="text-center text-gray-500">
                    <p>No Subscription Found</p>
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </div>
    )
}

export default page