'use client';
import React from 'react';
import { useUsersData } from '@/hooks/useUsersData';
import UsersTable from './_components/UserTable';
import Pagination from '@/components/ui/Pagination';
import AdvancedFilter from '../../../../../components/ui/AdvancedFilter';
import SearchBar from '../../../../../components/ui/SearchBar';

const Users = () => {
    const {
        currentUsers,
        currentPage,
        setCurrentPage,
        totalPages,
        setFilterStatus,
        setSearchKeyword,
        handleBlockUnblockUser
    } = useUsersData();

    return (
        <div className="admin-card p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <p className="text-admin-muted text-sm">Showing {currentUsers.length} result{currentUsers.length !== 1 && 's'}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <SearchBar onSearch={setSearchKeyword} />
                    <AdvancedFilter onFilterChange={setFilterStatus} />
                </div>
            </div>

            {/* Users table */}
            {currentUsers.length > 0 ? (
                <UsersTable handleBlockUnblockUser={handleBlockUnblockUser} users={currentUsers} />
            ) : (
                <div className="text-center text-gray-500">
                    <p>No Users Found</p>
                </div>
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
};

export default Users;
