'use client';
import { getSnippetsGraphByYearApi } from '@/apis/adminApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const SnippetsGraph = ({ year }: { year: number }) => {

    const [snippets, setSnippets] = useState([])

    const { mutate: getSnippets } = useMutationHook(getSnippetsGraphByYearApi, {
        onSuccess(response) {
            console.log("respnose: ", response.data)
            setSnippets(response.data)
        }
    })

    useEffect(() => {
        getSnippets(year)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year])

    return (
        <div className="bg-gray-800 p-4 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-white">
                Snippets Overview ({year})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={snippets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="snippet"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SnippetsGraph;
