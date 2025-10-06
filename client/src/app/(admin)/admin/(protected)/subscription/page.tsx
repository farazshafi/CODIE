"use client";
import React, { useState } from 'react'
import { useSubscriptionData } from './_hook/useSubscriptionData'
import SubscriptionTable from './_components/subscriptionTable';
import Pagination from '@/components/ui/Pagination';
import AdvancedFilter from '@/components/ui/AdvancedFilter';
import SearchBar from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateSubscriptionModal, { CreateSubscriptionType } from './_components/CreateSubscriptionModal';

const Page = () => {
    const [openModal, setOpenModal] = useState(false);
    const { subscriptions, fetchAllSubscriptions, handleSuspendActive, setCurrentPage, totalPages, currentPage, setFilterStatus, setSearchInput, handleDeleteSubscription } = useSubscriptionData()
    const [editData, setEditData] = useState<CreateSubscriptionType & { _id: string } | null>(null);


    return (
        <div className="admin-card p-4">
            <Button
                onClick={() => setOpenModal(true)}
                className='bg-white text-black mb-4 hover:bg-gray-300 cursor-pointer' size={'lg'}>
                <Plus />
                Create Subscription
            </Button>

            <CreateSubscriptionModal
                key={editData ? editData._id : 'create'}
                isOpen={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditData(null);
                }}
                onCreate={fetchAllSubscriptions}
                editData={editData}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <p className="text-admin-muted text-sm">Showing {subscriptions.length} result{subscriptions.length !== 1 && 's'}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <SearchBar onSearch={setSearchInput} />
                    <AdvancedFilter onFilterChange={setFilterStatus} />
                </div>
            </div>

            {/* Subscription table */}
            {subscriptions.length > 0 ? (
                <SubscriptionTable opneModal={(data) => {
                    setEditData(data as CreateSubscriptionType & { _id: string });
                    setOpenModal(true);
                }} handleSuspendActive={handleSuspendActive} subscriptions={subscriptions} handleDeleteSubscription={handleDeleteSubscription} />
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

export default Page