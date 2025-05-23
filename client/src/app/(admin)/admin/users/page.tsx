"use client"
import React from 'react';
import AdminLayout from '../_components/AdminLayout';
import { useUsersData } from '@/hooks/useUsersData';
import UserSearchBar from './_components/UserSearchBar';
import UsersTable from './_components/UserTable';
import UserPagination from './_components/UserPagination';
import UserAdvancedFilter from '../_components/UserAdvancedFilter';


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
        <AdminLayout title="Users">
            <div className="admin-card p-4">
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <p className="text-admin-muted text-sm">showing {currentUsers.length} result</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                            <UserSearchBar onSearch={setSearchKeyword} />
                            <UserAdvancedFilter onFilterChange={(status) => {
                                setFilterStatus(status);
                            }} />

                        </div>
                    </div>

                    {/* Users table */}
                    {currentUsers.length > 0 ? <UsersTable handleBlockUnblockUser={handleBlockUnblockUser} users={currentUsers} /> :
                        <div className='text-center text-gray-500'>
                            <p>No Users Found</p>
                        </div>
                    }

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
