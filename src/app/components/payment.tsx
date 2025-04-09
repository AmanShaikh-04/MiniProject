"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  ArrowRight,
  BarChart3,
  PieChart,
} from "lucide-react";

interface PaymentData {
  totalRevenue: string;
  totalAttendees: string;
  monthlyData: {
    month: string;
    revenue: number;
  }[];
}

const Payment = () => {
  const router = useRouter();

  // Placeholder data
  const [paymentData] = useState<PaymentData>({
    totalRevenue: "₹45,678.90",
    totalAttendees: "1,234",
    monthlyData: [
      { month: "Jan", revenue: 3500 },
      { month: "Feb", revenue: 4200 },
      { month: "Mar", revenue: 3800 },
      { month: "Apr", revenue: 5100 },
      { month: "May", revenue: 6200 },
      { month: "Jun", revenue: 5800 },
    ],
  });

  // Navigate to payment dashboard
  const handleViewPaymentDashboard = () => {
    router.push("/payment-dashboard");
  };

  return (
    <div className="bg-white rounded-xl p-4 h-full">
      <div className="flex items-center mb-3">
        <BarChart3 className="text-indigo-600 mr-2" size={20} />
        <h2 className="font-semibold text-lg text-indigo-800">
          Payment Summary
        </h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 flex items-center">
          <div className="w-7 h-7 flex items-center justify-center mr-2 bg-blue-100 rounded-full">
            <DollarSign size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-600">REVENUE</p>
            <p className="text-lg font-semibold text-gray-800">
              {paymentData.totalRevenue}
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 flex items-center">
          <div className="w-7 h-7 flex items-center justify-center mr-2 bg-green-100 rounded-full">
            <Users size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-green-600">ATTENDEES</p>
            <p className="text-lg font-semibold text-gray-800">
              {paymentData.totalAttendees}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Distribution Pie Chart */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <PieChart size={16} className="text-indigo-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">
            Revenue Distribution
          </h3>
        </div>
        <div className="flex justify-between items-center">
          <div className="relative w-32 h-32">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transform -rotate-90"
            >
              {paymentData.monthlyData.map((item, index) => {
                const total = paymentData.monthlyData.reduce(
                  (sum, i) => sum + i.revenue,
                  0,
                );
                const startAngle = paymentData.monthlyData
                  .slice(0, index)
                  .reduce((sum, i) => sum + (i.revenue / total) * 360, 0);
                const angle = (item.revenue / total) * 360;
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 =
                  50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                const y2 =
                  50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                const largeArc = angle > 180 ? 1 : 0;
                const colors = [
                  "#0d9488",
                  "#f97316",
                  "#e11d48",
                  "#9333ea",
                  "#059669",
                  "#d97706",
                ];

                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[index % colors.length]}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex flex-col space-y-2">
            {paymentData.monthlyData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-sm mr-2"
                  style={{
                    backgroundColor: [
                      "#0d9488",
                      "#f97316",
                      "#e11d48",
                      "#9333ea",
                      "#059669",
                      "#d97706",
                    ][index % 6],
                  }}
                ></div>
                <span className="text-xs text-gray-600">{item.month}</span>
                <span className="text-xs font-medium text-gray-800 ml-2">
                  ₹{item.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleViewPaymentDashboard}
        className="w-full py-2 px-3 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center justify-center"
      >
        View Details <ArrowRight size={14} className="ml-1" />
      </button>
    </div>
  );
};

export default Payment;
