import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CalendarDays, Users, Building, Users2, Clock, MapPin, XCircle, CheckCircle, AlertTriangle, CloudRain } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [selectedExam, setSelectedExam] = useState("all");
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Select Date</label>
              <Input type="date" className="h-9" defaultValue="2025-02-22" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Select Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">--Select Exam--</SelectItem>
                  <SelectItem value="exam1">UPSC Civil Services</SelectItem>
                  <SelectItem value="exam2">State Entrance Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Stat Cards matching Image 1 & Image 3 */}
        <StatCard title="Total Exams" value="15" icon={<FileText className="w-8 h-8 opacity-20" />} color="bg-[#4e73df]" />
        <StatCard title="Today Exams" value="5" icon={<CalendarDays className="w-8 h-8 opacity-20" />} color="bg-[#1cc88a]" />
        <StatCard title="Total Candidates" value="200" icon={<Users className="w-8 h-8 opacity-20" />} color="bg-[#36b9cc]" />
        <StatCard title="Total Centers" value="100" icon={<Building className="w-8 h-8 opacity-20" />} color="bg-[#f6c23e]" />
        
        <StatCard title="Present Candidate" value="50" icon={<Users2 className="w-8 h-8 opacity-20" />} color="bg-[#e74a3b]" />
        <StatCard title="Pending Candidates" value="50" icon={<Clock className="w-8 h-8 opacity-20" />} color="bg-[#858796]" />
        <StatCard title="Absent Candidates" value="100" icon={<XCircle className="w-8 h-8 opacity-20" />} color="bg-[#5a5c69]" />
        
        <StatCard title="Verified Candidates" value="50" icon={<CheckCircle className="w-8 h-8 opacity-20" />} color="bg-[#2e59d9]" />
        <StatCard title="Un-Verified Candidates" value="150" icon={<XCircle className="w-8 h-8 opacity-20" />} color="bg-[#17a673]" />
        
        <StatCard title="Biometric Exceptions" value="0" icon={<AlertTriangle className="w-8 h-8 opacity-20" />} color="bg-[#2c9faf]" />
        <StatCard title="Sync Percentage" value="0%" icon={<CloudRain className="w-8 h-8 opacity-20" />} color="bg-[#f4b619]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-sm">
          <div className="bg-slate-50 p-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700">Exam Wise Candidates</h3>
          </div>
          <CardContent className="p-6 flex justify-center items-center h-64 text-slate-400">
            [Chart Area: Exam Wise Candidates]
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <div className="bg-slate-50 p-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-700">Exam Wise Verifications</h3>
          </div>
          <CardContent className="p-6 flex justify-center items-center h-64 text-slate-400">
            [Chart Area: Exam Wise Verifications]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={`${color} rounded-lg shadow-sm text-white overflow-hidden relative group hover:shadow-md transition-shadow`}>
      <div className="p-4 flex flex-col h-full z-10 relative">
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium opacity-90">{title}</div>
      </div>
      <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 transform scale-150 text-black">
        {icon}
      </div>
      <div className="bg-black/10 py-1.5 px-4 text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors">
        More info <span className="text-[10px]">▶</span>
      </div>
    </div>
  );
}