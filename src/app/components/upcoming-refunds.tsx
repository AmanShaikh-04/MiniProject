"use client";

import React, { useState } from "react";
import {
  FileTextIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
} from "lucide-react";

interface UpcomingRefund {
  id: string;
  eventInfo: string;
  amount: string;
  date: string;
}

interface UpcomingRefundsProps {
  refunds: UpcomingRefund[];
}

const UpcomingRefunds: React.FC<UpcomingRefundsProps> = ({ refunds }) => {
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null);

  const handleDetailsClick = (id: string) => {
    setSelectedRefund(selectedRefund === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Refunds</h2>
        <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Refresh List
        </button>
      </div>
      <div className="space-y-4">
        {refunds.map((refund) => (
          <div
            key={refund.id}
            className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <FileTextIcon className="text-blue-500 w-10 h-10 bg-blue-50 p-2 rounded-lg" />
              <div>
                <p className="font-semibold text-gray-800">
                  {refund.eventInfo}
                </p>
                <p className="text-sm text-gray-500">
                  Amount: {refund.amount} | Date: {refund.date}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDetailsClick(refund.id)}
                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
              >
                Details <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
              <button className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center">
                <CheckCircle2Icon className="w-4 h-4 mr-2" /> Issue Refund
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingRefunds;
