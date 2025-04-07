"use client";

import { Suspense } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import HostBankDetails from "../components/host-bankdetails";
import PaymentDetails from "../components/payment-details";

export default function PaymentDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Host Bank Details */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg"></div>
              }
            >
              <HostBankDetails />
            </Suspense>
          </div>

          {/* Right column - Payment Details */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg"></div>
              }
            >
              <PaymentDetails />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
