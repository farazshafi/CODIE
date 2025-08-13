'use client';
import React, { useEffect, useState } from 'react';
import { Users, Package, CreditCard } from 'lucide-react';
import { useMutationHook } from '@/hooks/useMutationHook';
import { dashboardDataApi } from '@/apis/adminApi';
import Loading from '@/components/Loading';

type StatsType = {
    title: string;
    value: string;
    icon: string,
    change: string,
    positive: boolean
}

const Dashboard = () => {

    const [statsCards, setStatsCards] = useState<StatsType[]>([])

    const { mutate: getDashboardData, isLoading: statsLoading } = useMutationHook(dashboardDataApi, {
        onSuccess(data) {
            console.log("Dashboard Data: ", data)
            setStatsCards([
                data.userData,
                data.projectData,
                data.paymentData
            ])
        }

    })

    useEffect(() => {
        getDashboardData({})
    }, [])

    return (
        <>
            {statsLoading ? <Loading fullScreen={false} text='Stats Loading...' /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statsCards.map((card, index) => (
                        <div key={index} className="admin-card p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-admin-muted text-sm">{card.title}</span>
                                <div className="p-2 rounded-md bg-opacity-20" style={{ backgroundColor: 'rgba(0, 230, 118, 0.1)' }}>
                                    {card.title === "Total Users" && <Users className="h-5 w-5 text-admin-accent" />}
                                    {card.title === "Total Projects" && <Package className="h-5 w-5 text-admin-accent" />}
                                    {card.title === "Total Payment" && <CreditCard className="h-5 w-5 text-admin-accent" />}
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold">{card.title === "Total Payment" && "$"}{card.value}</span>
                                <span className={`text-xs ${card.positive ? 'text-[#1bf07c]' : 'text-red-500'}`}>
                                    {card.change} from last month
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="admin-card p-4 lg:col-span-2">
                    <h2 className="text-lg font-medium mb-4">Weekly Analytics</h2>
                    <div className="h-64 flex items-center justify-center border border-gray-700 rounded-md">
                        <p className="text-admin-muted">Chart will be displayed here</p>
                    </div>
                </div>

                <div className="admin-card p-4">
                    <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-center gap-3 border-b border-gray-700 pb-3 last:border-0">
                                <div className="h-2 w-2 rounded-full bg-[#1bf07c]"></div>
                                <div>
                                    <p className="text-sm">New user registered</p>
                                    <p className="text-xs text-admin-muted">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
