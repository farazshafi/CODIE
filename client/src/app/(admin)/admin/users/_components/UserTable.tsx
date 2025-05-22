
import React from 'react';
import { Button } from '@/components/ui/button';

interface User {
    id: string;
    name: string;
    plan: string;
    status: string;
}

interface UsersTableProps {
    users: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-sm border-b border-gray-700">
                        <th className="pb-2 font-medium">User ID</th>
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Plan</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id} className="text-sm">
                            <td className="py-3">{user.id}</td>
                            <td className="py-3">{user.name}</td>
                            <td className="py-3">{user.plan}</td>
                            <td className="py-3">
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={user.status === 'Active' ? 'active-status' : 'suspended-status'}>
                                        {user.status}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-admin-muted hover:text-black"
                                >
                                    Action
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;