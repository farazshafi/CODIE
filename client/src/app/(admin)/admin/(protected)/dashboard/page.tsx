'use client';
import React, { useEffect, useState } from 'react';
import { Users, Package, CreditCard, Rocket } from 'lucide-react';
import { useMutationHook } from '@/hooks/useMutationHook';
import { dashboardDataApi } from '@/apis/adminApi';
import Loading from '@/components/Loading';
import RevenueGraph from './_components/RevenueGraph';
import UsersGraph from './_components/UserGraph';
import ProjectsGraph from './_components/ProjectsGraph';
import OverviewGraph from './_components/OverveiwGraph';
import RoomsContributorsGraph from './_components/RoomsGraph';
import SnippetsGraph from './_components/SnippetGraph';

type StatsType = {
    title: string;
    value: string;
    icon: string;
    change: string;
    positive: boolean;
};

const Dashboard = () => {
    const [statsCards, setStatsCards] = useState<StatsType[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(2025);

    const { mutate: getDashboardData, isLoading: statsLoading } = useMutationHook(dashboardDataApi, {
        onSuccess(data) {
            console.log('Dashboard Data: ', data);
            setStatsCards([
                data.data.userData,
                data.data.projectData,
                data.data.paymentData,
                data.data.discoverData
            ])
        }

    })

    useEffect(() => {
        getDashboardData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="p-4 bg-gray-900 min-h-screen text-white">
            {statsLoading ? (
                <Loading fullScreen={false} text="Stats Loading..." />
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statsCards.map((card, index) => (
                            <div key={index} className="p-4 rounded-2xl bg-gray-800 shadow-md">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400 text-sm">{card.title}</span>
                                    <div className="p-2 rounded-md bg-green-500 bg-opacity-20">
                                        {card.title === 'Total Users' && (
                                            <Users className="h-5 w-5 text-white" />
                                        )}
                                        {card.title === 'Total Projects' && (
                                            <Package className="h-5 w-5 text-white" />
                                        )}
                                        {card.title === 'Total Payment' && (
                                            <CreditCard className="h-5 w-5 text-white" />
                                        )}
                                        {card.title === 'Total Snippets' && (
                                            <Rocket className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-bold">
                                        {card.title === 'Total Payment' && '₹'}
                                        {card.value}
                                    </span>
                                    <span
                                        className={`text-xs ${card.positive ? 'text-green-400' : 'text-red-500'
                                            }`}
                                    >
                                        {card.change} from last month
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Year Selector */}
                    <div className="flex justify-end mb-4">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-gray-800 text-white border border-gray-700 p-2 rounded-md"
                        >
                            {[2025, 2024, 2023].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Graphs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RevenueGraph year={selectedYear} />
                        <UsersGraph year={selectedYear} />
                        <ProjectsGraph year={selectedYear} />
                        <RoomsContributorsGraph year={selectedYear} />
                        <SnippetsGraph year={selectedYear} />

                    </div>


                    <div className='mt-10'>
                        <OverviewGraph year={selectedYear} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
