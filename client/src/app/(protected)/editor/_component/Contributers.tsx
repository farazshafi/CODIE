import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useUserStore } from '@/stores/userStore';
import { Users } from 'lucide-react'
import { useParams } from 'next/navigation';
import React from 'react'


type SearchResultUser = {
    name: string;
    email: string;
    _id: string;
};

type Collaborator = {
    user: SearchResultUser;
    role: string;
    _id: string;
};

type ContributersProps = {
    collaborators: Collaborator[];
    ownerId: string;
    isRoleLoading: boolean;
    handleUpdateRole(userId: string, role: string): void;
};


const Contributers: React.FC<ContributersProps> = ({ collaborators, ownerId, isRoleLoading, handleUpdateRole }) => {
    const params = useParams()

    const { id: projectId } = params
    const { onlineUsers } = useOnlineUsers(projectId?.toString())
    const user = useUserStore((state) => state.user)

    const isUserOnline = (userId: string, onlineUsers: string[]): boolean => {
        return onlineUsers?.includes(userId);
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="bg-tertiary p-2 hover:scale-125 rounded-md cursor-pointer">
                    <Users />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="">
                <DropdownMenuLabel>
                    <div className="text-center py-2 font-bold">
                        <p>Collabrators</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {collaborators.map((item, index) => (
                    <DropdownMenuItem key={index} className="flex flex-col w-full p-2 hover:bg-slate-200 focus:bg-slate-200">
                        <div className="flex items-center gap-x-4 justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage alt={item.user.name} />
                                    <AvatarFallback className={`text-black font-bold text-sm ${isUserOnline(item.user._id, onlineUsers) ? 'bg-green-400' : 'bg-red-400'
                                        }`}>
                                        {item.user.name.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>

                                </Avatar>
                                <div>
                                    <div className="flex flex-row items-center space-x-3">
                                        <p className="font-medium">{item.user.name}</p>
                                        
                                        {onlineUsers && onlineUsers.some(onlineId => onlineId === item.user._id) ? (
                                            <span className="text-[10px] bg-green rounded-lg px-[5px] py-[2px]">
                                                online
                                            </span>
                                        ) : (
                                            <span className='text-[10px] bg-red-400 rounded-lg px-[5px] py-[2px]'>offline</span>
                                        )}

                                    </div>

                                    <p className="text-xs text-gray-500">{item.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-md text-xs ${item.role === "editor" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                    {item.role}
                                </span>
                                {ownerId === user?.id && item.role !== "owner" && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none">
                                                Change Role
                                            </div>
                                            {/* <Button size={"sm"} variant={'outline'} className='rounded-md bg-white text-sm'>Change Role</Button> */}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-white">
                                            <DropdownMenuItem
                                                disabled={item.role === "editor" || isRoleLoading}
                                                onClick={() => handleUpdateRole(item.user._id, "editor")}
                                                onSelect={(e) => e.preventDefault()} // Prevent default Radix UI close behavior
                                                className="hover:bg-slate-100 text-sm"
                                            >
                                                {isRoleLoading ? "Updating..." : "Make Editor"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                disabled={item.role === "viewer" || isRoleLoading}
                                                onClick={() => handleUpdateRole(item.user._id, "viewer")}
                                                onSelect={(e) => e.preventDefault()} // Prevent default Radix UI close behavior
                                                className="hover:bg-slate-100 text-sm"
                                            >
                                                Make Viewer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default Contributers