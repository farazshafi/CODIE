"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesReportPage() {
  const [viewMode, setViewMode] = useState<"yearly" | "monthly" | "daily">(
    "monthly"
  );
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // October (0-based)
  const [selectedDate, setSelectedDate] = useState<string>("2024-10-01");

  // ---- Dummy Data ---- //
  const yearlyData = [
    { year: 2022, revenue: 24000 },
    { year: 2023, revenue: 32500 },
    { year: 2024, revenue: 41200 },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1900 },
    { month: "Mar", revenue: 2500 },
    { month: "Apr", revenue: 3100 },
    { month: "May", revenue: 2800 },
    { month: "Jun", revenue: 3400 },
    { month: "Jul", revenue: 3000 },
    { month: "Aug", revenue: 3600 },
    { month: "Sep", revenue: 3900 },
    { month: "Oct", revenue: 4200 },
    { month: "Nov", revenue: 4600 },
    { month: "Dec", revenue: 5000 },
  ];

  const dailyData = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    revenue: Math.floor(200 + Math.random() * 400),
  }));

  // ---- Select Data Based on View ---- //
  let chartData;
  let xKey;
  switch (viewMode) {
    case "yearly":
      chartData = yearlyData;
      xKey = "year";
      break;
    case "monthly":
      chartData = monthlyData;
      xKey = "month";
      break;
    case "daily":
      chartData = dailyData;
      xKey = "day";
      break;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">Sales Report</h1>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow">
          Export CSV
        </button>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as any)}
          className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg"
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>

        {viewMode === "yearly" && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg"
          >
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
          </select>
        )}

        {viewMode === "monthly" && (
          <>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg"
            >
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </>
        )}

        {viewMode === "daily" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg"
          />
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          {viewMode === "yearly"
            ? "Yearly Revenue"
            : viewMode === "monthly"
            ? "Monthly Revenue"
            : "Daily Revenue"}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey={xKey} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          {viewMode === "yearly"
            ? "Yearly Summary"
            : viewMode === "monthly"
            ? "Monthly Summary"
            : "Daily Summary"}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 capitalize">{xKey}</th>
                <th className="py-2 px-4">Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="py-2 px-4">{row[xKey]}</td>
                  <td className="py-2 px-4">{row.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
