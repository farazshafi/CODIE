'use client';
import { getRevenueByYearApi } from '@/apis/adminApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const RevenueGraph = ({ year }: { year: number }) => {

    const [revenue, setRevenue] = useState([])

    const { mutate: getRevenue } = useMutationHook(getRevenueByYearApi, {
        onSuccess(response) {
            setRevenue(response.data)
        }
    })

    useEffect(() => {
        getRevenue(year)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year])

    return (
        <div className="bg-gray-800 p-4 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-white">
                Revenue Overview ({year})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueGraph;
