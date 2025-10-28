'use client';
import { getRoomsByYearApi } from '@/apis/adminApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from 'recharts';

interface RoomData {
  month: string;
  rooms: number;
  contributors: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: {
    value: number;
    payload: RoomData;
    dataKey: string;
    fill: string;
  }[];
  label?: string;
  active?: boolean;
}

const RoomsContributorsGraph = ({ year }: { year: number }) => {
  const [rooms, setRooms] = useState<RoomData[]>([]);

  const { mutate: getRooms } = useMutationHook(getRoomsByYearApi, {
    onSuccess(response) {
      setRooms(response.data);
    },
  });

  useEffect(() => {
    getRooms(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-2 rounded shadow-lg border border-green-500">
          <p className="font-semibold">{label}</p>
          <p>Rooms: {payload[0].value}</p>
          <p>Contributors: {payload[0].payload.contributors}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">
        Contribution ({year})
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={rooms}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rooms" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RoomsContributorsGraph;
