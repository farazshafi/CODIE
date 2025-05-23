
import React from 'react';
import { Button } from '@/components/ui/button';
import { IUserData } from '@/hooks/useUsersData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CircleEllipsis } from 'lucide-react';

interface UsersTableProps {
    users: IUserData[];
    handleBlockUnblockUser(userId: string, status: "suspend" | "active"): void
}

const UsersTable: React.FC<UsersTableProps> = ({ users, handleBlockUnblockUser }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-sm border-b border-gray-700">
                        <th className="pb-2 font-medium">User ID</th>
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id} className="text-sm">
                            <td className="py-3">{user.id}</td>
                            <td className="py-3">{user.name}</td>
                            <td className="py-3">
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${!user.isBlocked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={!user.isBlocked ? 'active-status' : 'suspended-status'}>
                                        {user.isBlocked ? "suspended" : "acitve"}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className='text-black' variant="outline">
                                            Action
                                            <CircleEllipsis />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-fit">
                                        <DropdownMenuItem onSelect={() => handleBlockUnblockUser(user.id, "active")} className='flex flex-row items-center' disabled={!user.isBlocked}>
                                            <div className='rounded-full w-2 h-2 bg-green-500'></div>
                                            Active</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleBlockUnblockUser(user.id, "suspend")} className='flex flex-row items-center' disabled={user.isBlocked}>
                                            <div className='rounded-full w-2 h-2 bg-red-500'></div>
                                            Suspend</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;