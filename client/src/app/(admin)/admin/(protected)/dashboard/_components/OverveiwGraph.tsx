'use client';
import React, { useEffect, useState } from 'react';
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
import { useMutationHook } from '@/hooks/useMutationHook';
import { getAdminDashbaordOverviewApi } from '@/apis/adminApi';

const OverviewGraph = ({ year }: { year: number }) => {
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
    const [monthlyData, setMonthlyData] = useState([])
    const [yearlyData, setYearlyData] = useState([])

    const data = viewMode === 'month' ? monthlyData : yearlyData;

    const { mutate: getOverviewData } = useMutationHook(getAdminDashbaordOverviewApi, {
        onSuccess(response) {
            setMonthlyData(response.data.monthlyData)
            setYearlyData(response.data.yearlyData)
            console.log("Admin overview response: ", response)
        }
    })

    useEffect(() => {
        getOverviewData(year)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year])

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
                        dataKey="rooms"
                        stroke="#a78bfa"
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
