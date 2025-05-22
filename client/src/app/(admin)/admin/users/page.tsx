"use client"
import React from 'react';
import AdminLayout from '../_components/AdminLayout';
import { useUsersData } from '@/hooks/useUsersData';
import UserFilterTabs from './_components/UserFilterTabs';
import UserSearchBar from './_components/UserSearchBar';
import UsersTable from './_components/UserTable';
import UserPagination from './_components/UserPagination';

const Users = () => {
    const {
        users,
        filteredUsers,
        currentUsers,
        activeTab,
        setActiveTab,
        currentPage,
        setCurrentPage,
        totalPages,
        selectedStatus,
        setSelectedStatus,
        selectedPlan,
        setSelectedPlan,
    } = useUsersData();

    return (
        <AdminLayout title="Users">
            <div className="admin-card p-4">
                <>
                    {/* Filter tabs */}
                    <UserFilterTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        users={users}
                    />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <p className="text-admin-muted text-sm">showing {currentUsers.length} result</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                            <UserSearchBar />
                        </div>
                    </div>

                    {/* Users table */}
                    <UsersTable users={currentUsers} />

                    {/* Pagination */}
                    <UserPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </>
            </div>
        </AdminLayout>
    );
};

export default Users;
