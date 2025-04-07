"use client";

import { Suspense } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import RefundDetails from "../components/refund-details";
import UpcomingRefunds from "../components/upcoming-refunds";

export default function PaymentDashboardPage() {
  // Enhanced placeholder data with more details
  const refundData = {
    totalRefunds: "₹45,678.90",
    successfulRefunds: "₹42,345.67",
    pendingRefunds: "₹3,333.23",
  };

  const upcomingRefundsData = [
    {
      id: "1",
      eventInfo: "Summer Music Festival",
      amount: "₹5,678.90",
      date: "15 Aug 2025",
    },
    {
      id: "2",
      eventInfo: "Tech Conference Expo",
      amount: "₹7,890.45",
      date: "22 Sep 2025",
    },
    {
      id: "3",
      eventInfo: "Art Gallery Exhibition",
      amount: "₹3,456.78",
      date: "10 Oct 2025",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <Suspense
          fallback={
            <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
          }
        >
          <RefundDetails
            totalRefunds={refundData.totalRefunds}
            successfulRefunds={refundData.successfulRefunds}
            pendingRefunds={refundData.pendingRefunds}
          />
        </Suspense>

        <Suspense
          fallback={
            <div className="h-64 bg-white rounded-2xl animate-pulse"></div>
          }
        >
          <UpcomingRefunds refunds={upcomingRefundsData} />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
