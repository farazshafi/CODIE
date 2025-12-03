"use client";
import { getPaymentDataApi, updatePaymentStatusApi } from "@/apis/adminApi";
import Pagination from "@/components/ui/Pagination";
import { useMutationHook } from "@/hooks/useMutationHook";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface Payment {
    _id: string;
    userId: { name: string; email: string };
    amount: number;
    currency: string;
    paymentStatus: string;
    transactionId: string;
    paymentDate: string;
}


const PaymentPage = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<keyof Payment>("paymentDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [statusFilter, setStatusFilter] = useState("all");


    const { mutate: getPaymentData } = useMutationHook(getPaymentDataApi, {
        onSuccess(data) {
            setPayments(data.data.payments)
            setTotalPages(data.data.totalPages)
        }
    })

    const { mutate: updateStatus } = useMutationHook(updatePaymentStatusApi, {
        onSuccess() {
            toast.success("Updated Status")
            getPaymentData({ page: currentPage, sort: statusFilter });
        }
    })

    const filteredPayments = payments
        .filter((p) =>
            `${p.userId?.name} ${p.userId?.email} ${p.transactionId}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return String(a[sortKey]).localeCompare(String(b[sortKey]));
            }
            return String(b[sortKey]).localeCompare(String(a[sortKey]));
        });

    const handleSort = (key: keyof Payment) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const updatePaymentStatus = (id: string, status: string) => {
        setPayments((prev) =>
            prev.map((p) =>
                p._id === id ? { ...p, paymentStatus: status } : p
            )
        );
        updateStatus({ id, status: status as "completed" | "failed" })
    };


    useEffect(() => {
        getPaymentData({ page: currentPage, sort: statusFilter });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusFilter])

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-2xl font-bold mb-4">Payment History</h1>
            <div className="flex justify-between">
                <input
                    type="text"
                    placeholder="Search payments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-4 p-2 rounded bg-gray-800 text-white w-full max-w-sm"
                />

                <div className="">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            setStatusFilter(newStatus);
                            setCurrentPage(1);
                        }}
                        className="bg-gray-800 text-white p-2 rounded"
                    >
                        <option value="all">All Payments</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-3 cursor-pointer" onClick={() => handleSort("userId")}>
                                User
                            </th>
                            <th className="p-3 cursor-pointer" onClick={() => handleSort("amount")}>
                                Amount
                            </th>
                            <th className="p-3 cursor-pointer" onClick={() => handleSort("paymentStatus")}>
                                Status
                            </th>
                            <th className="p-3">Transaction ID</th>
                            <th className="p-3 cursor-pointer" onClick={() => handleSort("paymentDate")}>
                                Date
                            </th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredPayments.map((p) => (
                            <tr
                                key={p._id}
                                className="border-b border-gray-700 hover:bg-gray-800 text-center"
                            >
                                <td className="p-3">{p.userId?.name || "N/A"}</td>
                                <td className="p-3">₹{p.amount}</td>
                                <td
                                    className={`p-3 ${p.paymentStatus === "completed"
                                        ? "text-green-400"
                                        : p.paymentStatus === "failed"
                                            ? "text-red-400"
                                            : "text-yellow-400"
                                        }`}
                                >
                                    {p.paymentStatus}
                                </td>
                                <td className="p-3">{p.transactionId}</td>
                                <td className="p-3">
                                    {new Date(p.paymentDate).toLocaleDateString()}
                                </td>
                                <td className="p-3 space-x-2">
                                    {/* Show buttons based on status */}
                                    {p.paymentStatus !== "completed" && (
                                        <button
                                            onClick={() => updatePaymentStatus(p._id, "completed")}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                    {p.paymentStatus !== "failed" && (
                                        <button
                                            onClick={() => updatePaymentStatus(p._id, "failed")}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                                        >
                                            Mark as Failed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
};

export default PaymentPage;
