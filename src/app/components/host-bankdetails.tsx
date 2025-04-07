"use client";

import { useState } from "react";
import { User, Building, CreditCard, Scan, RefreshCw } from "lucide-react";

interface BankDetails {
  name: string;
  bankName: string;
  accountNo: string;
  upiId: string;
}

const HostBankDetails = () => {
  // Placeholder data
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    name: "John Doe",
    bankName: "State Bank",
    accountNo: "XXXX XXXX XXXX 1234",
    upiId: "johndoe@bank",
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl text-indigo-800">
          Account Details
        </h2>
        <button className="text-gray-500 hover:text-indigo-600 transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        {/* Profile image placeholder with gradient */}
        <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full border-2 border-indigo-200 flex items-center justify-center mb-4 shadow-md">
          <User size={48} className="text-indigo-600" />
        </div>
        <p className="text-lg font-semibold text-gray-800">
          {bankDetails.name}
        </p>
      </div>

      {/* User details with improved layout */}
      <div className="space-y-4 mb-auto">
        {[
          { icon: User, label: "Name", value: bankDetails.name },
          { icon: Building, label: "Bank Name", value: bankDetails.bankName },
          {
            icon: CreditCard,
            label: "Account No",
            value: bankDetails.accountNo,
          },
          { icon: Scan, label: "UPI ID", value: bankDetails.upiId },
        ].map(({ icon: Icon, label, value }, index) => (
          <div
            key={index}
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon size={20} className="text-indigo-600 mr-4 flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="text-xs font-medium text-gray-500 uppercase">
                {label}
              </h3>
              <p className="font-medium text-gray-800 text-base truncate">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons with improved styling */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="py-3 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors rounded-lg border border-indigo-100 font-medium text-sm">
          Payment History
        </button>
        <button className="py-3 px-4 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg font-medium text-sm">
          Refunds
        </button>
      </div>
    </div>
  );
};

export default HostBankDetails;
