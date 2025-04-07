"use client";

import React from "react";
import { TrendingUpIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";

interface RefundDetailsProps {
  totalRefunds: string;
  successfulRefunds: string;
  pendingRefunds: string;
}

const RefundDetails: React.FC<RefundDetailsProps> = ({
  totalRefunds,
  successfulRefunds,
  pendingRefunds,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Refund Analytics</h2>
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          Last 30 Days
        </div>
      </div>
      <div className="flex justify-between space-x-4">
        <div className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition-all duration-300 flex-1">
          <div className="flex justify-center mb-3">
            <TrendingUpIcon className="text-gray-600 w-10 h-10 bg-white p-2 rounded-lg shadow" />
          </div>
          <div className="text-sm text-gray-500 mb-1">Total Refunds</div>
          <div className="text-2xl font-bold text-gray-900">{totalRefunds}</div>
          <div className="text-xs text-gray-400 mt-1">
            Complete Transactions
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-5 text-center hover:shadow-md transition-all duration-300 flex-1">
          <div className="flex justify-center mb-3">
            <CheckCircle2Icon className="text-green-600 w-10 h-10 bg-white p-2 rounded-lg shadow" />
          </div>
          <div className="text-sm text-green-600 mb-1">Successful Refunds</div>
          <div className="text-2xl font-bold text-green-800">
            {successfulRefunds}
          </div>
          <div className="text-xs text-green-500 mt-1">
            Processed Successfully
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-5 text-center hover:shadow-md transition-all duration-300 flex-1">
          <div className="flex justify-center mb-3">
            <ClockIcon className="text-yellow-600 w-10 h-10 bg-white p-2 rounded-lg shadow" />
          </div>
          <div className="text-sm text-yellow-600 mb-1">Pending Refunds</div>
          <div className="text-2xl font-bold text-yellow-800">
            {pendingRefunds}
          </div>
          <div className="text-xs text-yellow-500 mt-1">In Processing</div>
        </div>
      </div>
    </div>
  );
};

export default RefundDetails;
