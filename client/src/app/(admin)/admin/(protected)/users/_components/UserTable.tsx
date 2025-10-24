import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IUserData } from '@/hooks/useUsersData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CircleEllipsis } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

interface UsersTableProps {
    users: IUserData[];
    handleBlockUnblockUser(userId: string, status: "suspend" | "active"): void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, handleBlockUnblockUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<"suspend" | "active" | null>(null);

    const handleConfirm = () => {
        if (selectedUser && selectedAction) {
            handleBlockUnblockUser(selectedUser, selectedAction);
        }
        setIsModalOpen(false);
        setSelectedUser(null);
        setSelectedAction(null);
    };

    const handleOpenModal = (userId: string, action: "suspend" | "active") => {
        setSelectedUser(userId);
        setSelectedAction(action);
        setIsModalOpen(true);
    };

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
                                    <div
                                        className={`h-2 w-2 rounded-full mr-2 ${!user.isBlocked ? 'bg-green-500' : 'bg-red-500'}`}
                                    ></div>
                                    <span className={!user.isBlocked ? 'text-green-400' : 'text-red-400'}>
                                        {user.isBlocked ? 'suspended' : 'active'}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="text-black" variant="outline">
                                            Action
                                            <CircleEllipsis />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-fit">
                                        <DropdownMenuItem
                                            onSelect={() => handleOpenModal(user.id, 'active')}
                                            className="flex flex-row items-center"
                                            disabled={!user.isBlocked}
                                        >
                                            <div className="rounded-full w-2 h-2 bg-green-500 mr-2"></div>
                                            Activate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => handleOpenModal(user.id, 'suspend')}
                                            className="flex flex-row items-center"
                                            disabled={user.isBlocked}
                                        >
                                            <div className="rounded-full w-2 h-2 bg-red-500 mr-2"></div>
                                            Suspend
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                content={
                    <p>
                        Are you sure you want to{' '}
                        <span className="font-semibold text-green-400">
                            {selectedAction === 'active' ? 'activate' : 'suspend'}
                        </span>{' '}
                        this user?
                    </p>
                }
            />
        </div>
    );
};

export default UsersTable;
