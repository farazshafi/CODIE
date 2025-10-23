"use client"
import React, { useEffect, useState } from "react";
import { Search, Filter, User, Calendar, DollarSign } from "lucide-react";
import { useMutationHook } from "@/hooks/useMutationHook";
import { getAllSubscriptionHistoryApi } from "@/apis/adminApi";
import Pagination from "@/components/ui/Pagination";

type Subscription = {
  user: string;
  email: string;
  plan: string;
  amount: number;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
};

const AdminSubscriptionHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const { mutate: fetchSubscriptions } = useMutationHook(
    getAllSubscriptionHistoryApi, {
    onSuccess(response) {
      console.log("response:", response.data)
      setSubscriptions(response.data.subscriptions);
      setTotalPage(response.data.totalPages)
      setCurrentPage(response.data.currentPage)
      setLoading(false);
    },
    onError() {
      setSubscriptions([]);
      setLoading(false);
    },
  }
  );

  const fetchData = () => {
    setLoading(true);
    let year, month;
    if (selectedMonth) {
      const [y, m] = selectedMonth.split("-");
      year = parseInt(y);
      month = parseInt(m);
    }
    fetchSubscriptions({ year, month, sort, search: searchTerm, currentPage });
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sort, selectedMonth, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    fetchData();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    fetchData();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-500 text-center sm:text-left">
        Admin Subscription History
      </h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 flex-wrap">
        {/* Search */}
        <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg w-full md:w-1/3">
          <Search className="text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search user or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-transparent outline-none w-full text-gray-200 text-sm sm:text-base"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg w-full md:w-1/4">
          <Filter className="text-gray-400 mr-2 shrink-0" />
          <select
            value={sort}
            onChange={handleSortChange}
            className="bg-transparent outline-none text-gray-200 w-full text-sm sm:text-base"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Month Picker */}
        <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg w-full md:w-1/4">
          <Calendar className="text-gray-400 mr-2 shrink-0" />
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="bg-transparent outline-none text-gray-200 w-full text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg">
        {loading ? (
          <p className="text-center p-4 text-gray-400">Loading...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-center p-4 text-gray-400">No records found.</p>
        ) : (
          <table className="min-w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-green-600 text-left uppercase tracking-wider text-gray-100">
                <th className="py-3 px-4 whitespace-nowrap">User</th>
                <th className="py-3 px-4 whitespace-nowrap">Email</th>
                <th className="py-3 px-4 whitespace-nowrap">Plan</th>
                <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Start Date</th>
                <th className="py-3 px-4 whitespace-nowrap">End Date</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                >
                  <td className="py-3 px-4 flex items-center gap-2 whitespace-nowrap">
                    <User size={18} className="text-green-500 shrink-0" />{" "}
                    {sub.user}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{sub.email}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{sub.plan}</td>
                  <td className="py-3 px-4 flex items-center gap-1 whitespace-nowrap">
                    <DollarSign size={14} /> {sub.amount}
                  </td>
                  <td
                    className={`py-3 px-4 font-semibold whitespace-nowrap ${sub.status === "active"
                      ? "text-green-400"
                      : sub.status === "expired"
                        ? "text-gray-400"
                        : "text-red-400"
                      }`}
                  >
                    {sub.status}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-center gap-1">
                    <Calendar size={14} /> {sub.startDate}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap flex items-center gap-1">
                    <Calendar size={14} /> {sub.endDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AdminSubscriptionHistoryPage;
