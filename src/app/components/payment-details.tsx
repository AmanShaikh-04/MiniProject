"use client";

import { useState } from "react";
import {
  Wallet,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Calendar,
  PieChart,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

interface PaymentData {
  totalBalance: string;
  paidRefunds: string;
  unpaidRefunds: string;
  profitBalance: string;
  upcomingRefunds: { eventName: string; refundDate: string }[];
}

const PaymentDetails = () => {
  // Placeholder data
  const [paymentData, setPaymentData] = useState<PaymentData>({
    totalBalance: "₹5,432.10",
    paidRefunds: "₹2,345.67",
    unpaidRefunds: "₹1,234.56",
    profitBalance: "₹3,456.78",
    upcomingRefunds: [
      { eventName: "Music Festival", refundDate: "25 Apr 2025" },
      { eventName: "Tech Conference", refundDate: "28 Apr 2025" },
      { eventName: "Art Exhibition", refundDate: "05 May 2025" },
    ],
  });

  // For pie chart data - converting string values to numbers
  const totalBalanceValue = parseFloat(
    paymentData.totalBalance.replace(/[₹,]/g, ""),
  );
  const paidRefundsValue = parseFloat(
    paymentData.paidRefunds.replace(/[₹,]/g, ""),
  );
  const unpaidRefundsValue = parseFloat(
    paymentData.unpaidRefunds.replace(/[₹,]/g, ""),
  );
  const profitBalanceValue = parseFloat(
    paymentData.profitBalance.replace(/[₹,]/g, ""),
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Wallet className="text-indigo-600 mr-3" size={24} />
          <h2 className="font-semibold text-xl text-indigo-800">Payments</h2>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center">
            <ArrowDownCircle size={16} className="mr-1" /> Export
          </button>
          <button className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center">
            <ArrowUpCircle size={16} className="mr-1" /> Import
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-grow">
        {/* Left column with metrics and chart */}
        <div className="col-span-8 flex flex-col">
          {/* Payment metrics grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              {
                icon: Wallet,
                color: "blue",
                label: "Total Balance",
                value: paymentData.totalBalance,
              },
              {
                icon: CreditCard,
                color: "green",
                label: "Paid Refunds",
                value: paymentData.paidRefunds,
              },
              {
                icon: AlertCircle,
                color: "amber",
                label: "Unpaid Refunds",
                value: paymentData.unpaidRefunds,
              },
              {
                icon: TrendingUp,
                color: "indigo",
                label: "Profit Balance",
                value: paymentData.profitBalance,
              },
            ].map(({ icon: Icon, color, label, value }, index) => (
              <div
                key={index}
                className={`bg-${color}-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center mr-2 bg-${color}-100 rounded-full`}
                  >
                    <Icon size={18} className={`text-${color}-600`} />
                  </div>
                  <p
                    className={`text-xs font-medium text-${color}-600 uppercase`}
                  >
                    {label}
                  </p>
                </div>
                <p className="text-xl font-semibold text-gray-800 mt-1">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <PieChart size={18} className="text-indigo-600 mr-2" />
              <h3 className="font-medium text-gray-700">Financial Overview</h3>
            </div>

            <div className="flex justify-between items-center">
              {/* SVG Pie Chart */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Profit Balance - Indigo */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#818cf8"
                    strokeWidth="20"
                    strokeDasharray={`${(profitBalanceValue / totalBalanceValue) * 251.2} 251.2`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Paid Refunds - Green */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#4ade80"
                    strokeWidth="20"
                    strokeDasharray={`${(paidRefundsValue / totalBalanceValue) * 251.2} 251.2`}
                    strokeDashoffset={`${-1 * (profitBalanceValue / totalBalanceValue) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Unpaid Refunds - Amber */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#fbbf24"
                    strokeWidth="20"
                    strokeDasharray={`${(unpaidRefundsValue / totalBalanceValue) * 251.2} 251.2`}
                    strokeDashoffset={`${-1 * ((profitBalanceValue + paidRefundsValue) / totalBalanceValue) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="font-bold text-indigo-800">
                    {paymentData.totalBalance}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-400 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-700">Profit Balance</span>
                  <span className="ml-auto font-medium text-indigo-600">
                    {paymentData.profitBalance}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-400 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-700">Paid Refunds</span>
                  <span className="ml-auto font-medium text-green-600">
                    {paymentData.paidRefunds}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-400 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-700">Unpaid Refunds</span>
                  <span className="ml-auto font-medium text-amber-600">
                    {paymentData.unpaidRefunds}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 px-4 bg-gray-100 rounded-lg text-center font-medium text-gray-700 hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center">
              <ArrowDownCircle size={18} className="mr-2" /> Withdraw
            </button>
            <button className="py-3 px-4 bg-indigo-600 rounded-lg text-center font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center">
              <CreditCard size={18} className="mr-2" /> Deposit
            </button>
          </div>
        </div>

        {/* Right column with upcoming refunds */}
        <div className="col-span-4 flex flex-col">
          {/* Upcoming Refunds */}
          <div className="bg-gray-50 rounded-lg p-5 shadow-sm flex-grow flex flex-col">
            <div className="flex items-center mb-4">
              <Calendar size={18} className="text-indigo-600 mr-2" />
              <h3 className="font-medium text-gray-700">Upcoming Refunds</h3>
            </div>

            <div className="space-y-3 flex-grow">
              {paymentData.upcomingRefunds.map((refund, index) => (
                <div
                  key={index}
                  className="flex justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-gray-800">
                    {refund.eventName}
                  </span>
                  <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium">
                    {refund.refundDate}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <AlertCircle size={16} className="text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-700 text-sm">
                    Refund Status
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  You have {paymentData.upcomingRefunds.length} upcoming refunds
                  scheduled for processing.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Processing</span>
                  <span>65%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button className="w-full px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors font-medium shadow-sm flex items-center justify-center">
                <Calendar size={16} className="mr-2" /> Show More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
