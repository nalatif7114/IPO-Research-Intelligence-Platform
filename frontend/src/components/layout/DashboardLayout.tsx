"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar />
      {/* Main content area — offset by sidebar */}
      <div className="ml-[72px] md:ml-[260px] transition-all duration-300">
        <Navbar />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
