import React from 'react';
import { Users, Package, CreditCard, Activity } from 'lucide-react';
import AdminLayout from '../_components/AdminLayout';

const statsCards = [
    {
        title: 'Total Users',
        value: '12,345',
        icon: Users,
        change: '+12%',
        positive: true
    },
    {
        title: 'Active Products',
        value: '432',
        icon: Package,
        change: '+5%',
        positive: true
    },
    {
        title: 'Revenue',
        value: '$34,567',
        icon: CreditCard,
        change: '-2%',
        positive: false
    },
    {
        title: 'Engagement',
        value: '87%',
        icon: Activity,
        change: '+14%',
        positive: true
    }
];

const Dashboard = () => {
    return (
        <AdminLayout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsCards.map((card, index) => (
                    <div key={index} className="admin-card p-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-admin-muted text-sm">{card.title}</span>
                            <div className="p-2 rounded-md bg-opacity-20" style={{ backgroundColor: 'rgba(0, 230, 118, 0.1)' }}>
                                <card.icon className="h-5 w-5 text-admin-accent" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold">{card.value}</span>
                            <span className={`text-xs ${card.positive ? 'text-[#1bf07c]' : 'text-red-500'}`}>
                                {card.change} from last month
                            </span>
                        </div>
                    </div>
                ))}
            </div>

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
        </AdminLayout>
    );
};

export default Dashboard;