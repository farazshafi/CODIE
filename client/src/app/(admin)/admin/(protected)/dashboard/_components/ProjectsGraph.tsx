'use client';
import { getProjectsByYearApi } from '@/apis/adminApi';
import { useMutationHook } from '@/hooks/useMutationHook';
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ProjectsGraph = ({ year }: { year: number }) => {
  const [projects, setProjects] = useState([]);

  const { mutate: getProjects } = useMutationHook(getProjectsByYearApi, {
    onSuccess(response) {
      setProjects(response.data);
    },
  });

  useEffect(() => {
    getProjects(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);
  
  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-white">
        Projects Created ({year})
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={projects}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="projects"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectsGraph;
