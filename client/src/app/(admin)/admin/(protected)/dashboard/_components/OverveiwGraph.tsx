'use client';
import React, { useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';

const OverviewGraph = () => {
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

    // Example monthly data
    const monthlyData = [
        { name: 'Jan', users: 40, projects: 25, revenue: 12000 },
        { name: 'Feb', users: 55, projects: 35, revenue: 18000 },
        { name: 'Mar', users: 70, projects: 40, revenue: 21000 },
        { name: 'Apr', users: 80, projects: 50, revenue: 26000 },
        { name: 'May', users: 95, projects: 60, revenue: 30000 },
        { name: 'Jun', users: 110, projects: 70, revenue: 35000 },
        { name: 'Jul', users: 130, projects: 75, revenue: 38000 },
        { name: 'Aug', users: 145, projects: 82, revenue: 42000 },
        { name: 'Sep', users: 160, projects: 90, revenue: 46000 },
        { name: 'Oct', users: 170, projects: 95, revenue: 49000 },
        { name: 'Nov', users: 180, projects: 100, revenue: 52000 },
        { name: 'Dec', users: 200, projects: 110, revenue: 56000 },
    ];

    // Example yearly data
    const yearlyData = [
        { name: '2021', users: 800, projects: 450, revenue: 320000 },
        { name: '2022', users: 950, projects: 520, revenue: 410000 },
        { name: '2023', users: 1200, projects: 680, revenue: 520000 },
        { name: '2024', users: 1500, projects: 850, revenue: 610000 },
        { name: '2025', users: 1800, projects: 1000, revenue: 740000 },
    ];

    const data = viewMode === 'month' ? monthlyData : yearlyData;

    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md col-span-full">
            {/* Header with Toggle */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                    Overview — Users, Projects & Revenue
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setViewMode('month')}
                        className={`px-4 py-1 rounded-md text-sm ${viewMode === 'month'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Month
                    </Button>
                    <Button
                        onClick={() => setViewMode('year')}
                        className={`px-4 py-1 rounded-md text-sm ${viewMode === 'year'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        Year
                    </Button>
                </div>
            </div>

            {/* Graph */}
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#22c55e',
                        }}
                        labelStyle={{ color: '#22c55e' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="projects"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#facc15"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OverviewGraph;
