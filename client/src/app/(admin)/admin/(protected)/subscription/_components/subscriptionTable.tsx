import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CircleEllipsis, Pencil, Trash2 } from 'lucide-react';
import { CreateSubscriptionInput } from '@/lib/validations/subscriptionValidation';


interface SubscriptionTableProps {
    subscriptions: CreateSubscriptionInput[];
    handleSuspendActive(id: string, status: "suspend" | "active"): void;
    handleDeleteSubscription(id: string): void;
    opneModal(data: CreateSubscriptionInput): void;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ subscriptions, handleSuspendActive, handleDeleteSubscription, opneModal }) => {


    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-sm border-b border-gray-700">
                        <th className="pb-2 font-medium">ID</th>
                        <th className="pb-2 font-medium">Max Collabrators</th>
                        <th className="pb-2 font-medium">Max Projects</th>
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {subscriptions.map((item: CreateSubscriptionInput) => (
                        <tr key={item._id} className="text-sm">
                            <td className="py-3">{item._id}</td>
                            <td className="py-3">{item.maxCollaborators}</td>
                            <td className="py-3">{item.maxPrivateProjects}</td>
                            <td className="py-3">{item.name}</td>
                            <td className="py-3">{item.pricePerMonth === 0 ? "Free" : item.pricePerMonth + " ₹"}</td>
                            <td className="py-3">
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${item.isVisible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={item.isVisible ? 'active-status' : 'suspended-status'}>
                                        {!item.isVisible ? "suspended" : "acitve"}
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
                                        <DropdownMenuItem onSelect={() => handleSuspendActive(item._id as string, "active")} className='flex flex-row items-center' disabled={item.isVisible}>
                                            <div className='rounded-full w-2 h-2 bg-green-500'></div>
                                            Active</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleSuspendActive(item._id as string, "suspend")} className='flex flex-row items-center' disabled={!item.isVisible}>
                                            <div className='rounded-full w-2 h-2 bg-red-500'></div>
                                            Suspend</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => opneModal(item)} className='flex flex-row items-center'>
                                            <Pencil />
                                            Edit</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleDeleteSubscription(item._id as string)} className='flex flex-row items-center'>
                                            <Trash2 />
                                            Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SubscriptionTable