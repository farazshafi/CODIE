import { getUserPaymentHistoryApi } from '@/apis/paymentApi'
import Pagination from '@/components/ui/Pagination';
import { useMutationHook } from '@/hooks/useMutationHook'
import React, { useEffect, useState } from 'react'

interface Payment {
  paymentDate: string;
  transactionId: string;
  paymentStatus: string;
  method: string;
  amount: number;
  subscriptionId: {
    name: string
  }
}

const PaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const { mutate: getPaymentHistory, isLoading: paymentHistoryLoading } = useMutationHook(getUserPaymentHistoryApi, {
    onSuccess(data) {
      console.log("Payment history: ", data)
      setPaymentHistory(data.paymentHistory || []);
      setTotalPage(data.totalPages)
    }
  })

  useEffect(() => {
    getPaymentHistory({})
  }, [])

  return (
    <>
      <div className="overflow-x-auto">
        <h1 className=' text-3xl text-white my-6'>Payment History</h1>

        <table className="min-w-full text-white rounded-lg shadow-md">
          <thead className='rounded-2xl'>
            <tr className="bg-white border-b border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-green-500 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-green-500 uppercase tracking-wider">Payment ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-green-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-green-500 uppercase tracking-wider">Method</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-green-500 uppercase tracking-wider">amount</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-green-500 uppercase tracking-wider">Plan</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center text-gray-400">{paymentHistoryLoading ? "Loading..." : "No payment history found"}</td>
              </tr>
            ) : (
              paymentHistory.map((payment, index) => (
                <tr key={payment.transactionId} className={`${index % 2 === 0 ? 'bg-tertiary' : 'bg-gray-700'} border-b border-gray-600 hover:bg-gray-600 transition-colors duration-200`}>
                  <td className="py-3 px-4 text-sm text-gray-300">{payment.paymentDate.slice(0, 10)}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{payment.transactionId}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                      payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">Razorpay</td>
                  <td className="py-3 px-4 text-sm text-gray-300">${payment.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{payment.subscriptionId.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
      <Pagination currentPage={currentPage} totalPages={totalPage} setCurrentPage={(page) => {
        getPaymentHistory(page)
        setCurrentPage(page)
      }}
      />

    </>
  )
}

export default PaymentHistory