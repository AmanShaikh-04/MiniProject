"use client";
import Login from "../components/login";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Login />
      </main>
    </div>
  );
}
