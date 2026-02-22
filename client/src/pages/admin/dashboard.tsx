import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Clock, AlertCircle, Building2, Smartphone, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-[15px]">Overview of all exams</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col justify-between">
              <span className="text-[15px] font-medium text-gray-500">Total Candidates</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">15,420</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Verified */}
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-gray-500">Verified</span>
                <span className="text-3xl font-bold text-gray-900 mt-2">12,350</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-500">80% complete</span><br/>
              <span className="text-green-600 font-medium">+12.5%</span> <span className="text-gray-500">vs last hour</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Pending</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">2,070</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Not Verified */}
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Not Verified</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">1,000</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-none bg-[#f0f7ff] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-800">Active Centres</div>
              <div className="text-xl font-bold text-gray-900">6/8</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#f0fdf4] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100/50 flex items-center justify-center text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-green-800">Active Operators</div>
              <div className="text-xl font-bold text-gray-900">5/6</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#faf5ff] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-purple-800">Synced Devices</div>
              <div className="text-xl font-bold text-gray-900">5/6</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#fffbeb] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-yellow-800">Present Today</div>
              <div className="text-xl font-bold text-gray-900">14,200</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg">Centre-wise Verification Status</h3>
            {/* Mock Bar Chart */}
            <div className="h-64 flex items-end justify-around gap-2 px-4 border-l border-b border-gray-100 pb-2 relative">
              {/* Y Axis labels */}
              <div className="absolute left-[-35px] top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-2">
                <span>2800</span>
                <span>2100</span>
                <span>1400</span>
                <span>700</span>
              </div>
              {/* Grid lines */}
              <div className="absolute inset-0 border-t border-gray-50 border-dashed top-[25%]" />
              <div className="absolute inset-0 border-t border-gray-50 border-dashed top-[50%]" />
              <div className="absolute inset-0 border-t border-gray-50 border-dashed top-[75%]" />
              
              {/* Bars */}
              <div className="w-10 bg-green-500 rounded-t-sm h-[75%] relative z-10 mx-2" />
              <div className="w-10 bg-green-500 rounded-t-sm h-[60%] relative z-10 mx-2" />
              <div className="w-10 bg-green-500 rounded-t-sm h-[85%] relative z-10 mx-2" />
              <div className="w-10 bg-green-500 rounded-t-sm h-[95%] relative z-10 mx-2" />
              <div className="w-10 bg-green-500 rounded-t-sm h-[55%] relative z-10 mx-2" />
              <div className="w-10 bg-green-500 rounded-t-sm h-[40%] relative z-10 mx-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg">Verification Status</h3>
            {/* Mock Donut Chart */}
            <div className="flex justify-center items-center h-64">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fef08a" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="220" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="230" className="origin-center rotate-[45deg]" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="50" className="origin-center rotate-[90deg]" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}