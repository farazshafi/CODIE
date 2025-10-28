'use client';
import { getUsersByYearApi } from '@/apis/adminApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const UsersGraph = ({ year }: { year: number }) => {

  const [users, setUsers] = useState([])

  const { mutate: getUsers } = useMutationHook(getUsersByYearApi, {
    onSuccess(response) {
      setUsers(response.data)
    }
  })

  useEffect(() => {
    getUsers(year)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year])

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">
        Users Growth ({year})
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={users}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Bar dataKey="users" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsersGraph;
