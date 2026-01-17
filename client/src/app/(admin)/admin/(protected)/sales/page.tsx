"use client";

import { downloadSalesReportApi, getDailySalesReportApi, getMonthlySalesReportApi, getYearlySalesReportApi } from "@/apis/adminApi";
import { useMutationHook } from "@/hooks/useMutationHook";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

type YearlyRow = { year: number; revenue: number };
type MonthlyRow = { month: number; revenue: number };
type DailyRow = { day: number; revenue: number };


export default function SalesReportPage() {
  const [viewMode, setViewMode] = useState<"yearly" | "monthly" | "daily">(
    "monthly"
  );

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1)

  const [yearlyData, setYearlyData] = useState<YearlyRow[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRow[]>([]);
  const [dailyData, setDailyData] = useState<DailyRow[]>([]);


  const { mutate: getYearlySales } = useMutationHook(getYearlySalesReportApi, {
    onSuccess(response) {
      console.log("yearly data: ", response.data)
      setYearlyData(response.data as YearlyRow[])
    }
  })

  const { mutate: getMonthlySales } = useMutationHook(getMonthlySalesReportApi, {
    onSuccess(response) {
      setMonthlyData(response.data as MonthlyRow[]);
    }

  })

  const { mutate: getDailySales } = useMutationHook(getDailySalesReportApi, {
    onSuccess(response) {
      console.log("yearly data: ", response.data)
      setDailyData(response.data as DailyRow[])
    }
  })

  const handleExportServerCSV = async () => {
    try {
      const params: Record<string, string | number> = { view: viewMode };
      if (viewMode === "yearly") params.year = selectedYear;
      if (viewMode === "monthly") {
        params.year = selectedYear;

      }
      if (viewMode === "daily") {
        params.year = selectedYear;
        params.month = selectedMonth;
      }

      const stringParams: Record<string, string> = Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      );

      const query = new URLSearchParams(stringParams).toString();


      // note: downloadSalesReportApi now returns the Axios response
      const res = await downloadSalesReportApi(query);
      console.log("download sales report api called", res);

      // res.data is the blob
      const blob = res.data;
      // Try to extract filename from headers, fallback to constructed name
      const contentDisposition = res.headers?.["content-disposition"] || res.headers?.["Content-Disposition"];
      let filename = `sales_report_${viewMode}_${selectedYear}`;
      if (viewMode === "monthly") filename += `_${selectedMonth + 1}`;
      if (viewMode === "daily") filename += `_${selectedMonth + 1}`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }
      // ensure .csv
      if (!filename.toLowerCase().endsWith(".csv")) filename += ".csv";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch (err: unknown) {
      if (isHtmlRedirectError(err) && err.response.type === "text/html") {
        toast.error("Export failed: authentication issue or server returned HTML.");
      } else {
        toast.error("Export failed");
      }
    }
  };

  function isHtmlRedirectError(
    err: unknown
  ): err is { response: { type?: string } } {
    if (typeof err !== "object" || err === null) return false;

    const maybe = err as Record<string, unknown>;
    const response = maybe["response"];

    return (
      typeof response === "object" &&
      response !== null &&
      "type" in response
    );
  }



  useEffect(() => {
    getYearlySales()
    getMonthlySales(selectedYear)
    getDailySales({ year: selectedYear, month: selectedMonth })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, viewMode])

  let chartData: YearlyRow[] | MonthlyRow[] | DailyRow[] = [];
  let xKey: "year" | "month" | "day" = "month";

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
        <button onClick={handleExportServerCSV} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow">
          Export CSV
        </button>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={viewMode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setViewMode(e.target.value as "yearly" | "monthly" | "daily")
          }
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
            <option value={2025}>2025</option>
          </select>
        )}

        {viewMode === "monthly" || viewMode === "daily" && (
          <>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg"
            >
              <option value={2025}>2025</option>
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
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </>
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
              {viewMode === "yearly" &&
                (chartData as YearlyRow[]).map((row, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="py-2 px-4">{row.year}</td>
                    <td className="py-2 px-4">{row.revenue.toLocaleString()}</td>
                  </tr>
                ))}

              {viewMode === "monthly" &&
                (chartData as MonthlyRow[]).map((row, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="py-2 px-4">{row.month}</td>
                    <td className="py-2 px-4">{row.revenue.toLocaleString()}</td>
                  </tr>
                ))}

              {viewMode === "daily" &&
                (chartData as DailyRow[]).map((row, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="py-2 px-4">{row.day}</td>
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
