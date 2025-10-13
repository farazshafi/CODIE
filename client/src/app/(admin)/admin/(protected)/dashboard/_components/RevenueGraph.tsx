import { getAdminGraphApi } from '@/apis/adminApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";


const RevenueGraph = () => {

    const [graphData, setGraphData] = useState([])

    const { mutate: getGraphData } = useMutationHook(getAdminGraphApi, {
        onSuccess(data) {
            console.log("graph data", data)
            setGraphData(data.data)
        },
    })

    useEffect(() => {
        getGraphData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <LineChart width={600} height={300} data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            <Line type="monotone" dataKey="users" stroke="#82ca9d" />
        </LineChart>
    )
}

export default RevenueGraph