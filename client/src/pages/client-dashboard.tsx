import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, DownloadCloud, Users, CheckCircle2, 
  Clock, MapPin, Activity, ShieldCheck, PieChart as PieChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [selectedExam, setSelectedExam] = useState("EX-2025-001");

  const exams = [
    { id: "EX-2025-001", name: "UPSC Civil Services 2024", date: "2024-05-15" },
    { id: "EX-2025-002", name: "State Level Entrance", date: "2024-06-10" }
  ];

  // Mock Data for Charts
  const hourlySyncData = [
    { time: '08:00', verified: 400, pending: 15000 },
    { time: '09:00', verified: 3200, pending: 12200 },
    { time: '10:00', verified: 8500, pending: 6900 },
    { time: '11:00', verified: 12200, pending: 3200 },
    { time: '12:00', verified: 14200, pending: 1200 },
    { time: '13:00', verified: 15100, pending: 320 },
  ];

  const centrePerformanceData = [
    { name: 'DEL001', verified: 2100, capacity: 2500 },
    { name: 'DEL002', verified: 1800, capacity: 2200 },
    { name: 'MUM001', verified: 2300, capacity: 2800 },
    { name: 'BLR001', verified: 1500, capacity: 1600 },
    { name: 'CHE001', verified: 1200, capacity: 1300 },
  ];

  const pieData = [
    { name: 'Verified', value: 12350, color: '#10b981' },
    { name: 'Pending', value: 2070, color: '#f59e0b' },
    { name: 'Absent (Est)', value: 1000, color: '#64748b' }
  ];

  const centres = [
    { id: "DEL001", name: "Delhi Public School", city: "New Delhi", total: 2500, verified: 2100, pending: 300, progress: 84 },
    { id: "DEL002", name: "Kendriya Vidyalaya", city: "New Delhi", total: 2200, verified: 1800, pending: 350, progress: 82 },
    { id: "MUM001", name: "St. Xaviers College", city: "Mumbai", total: 2800, verified: 2300, pending: 400, progress: 82 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Client Portal</h1>
              <p className="text-xs text-slate-500 font-medium">Read-only live statistics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-slate-50 font-medium font-mono min-w-[250px]"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name} ({exam.date})</option>
              ))}
            </select>
            <Button variant="outline" className="gap-2">
              <DownloadCloud className="w-4 h-4" /> Export Report
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/login")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Total Registered</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-3xl font-bold text-slate-900">15,420</span>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-700">Verified Candidates</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-900">12,350</span>
                <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">80%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-100 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-700">Pending Verification</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-900">2,070</span>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">13%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 flex flex-col justify-center h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Active Centres</span>
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-3xl font-bold text-slate-900">12 / 12</span>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" /> 
                Verification Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlySyncData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="verified" name="Verified Candidates" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-slate-500" /> 
                Current Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Centres Verification Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={centrePerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="verified" name="Verified" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Centre Status Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">CODE</TableHead>
                    <TableHead className="font-semibold">CENTRE NAME</TableHead>
                    <TableHead className="font-semibold">VERIFIED</TableHead>
                    <TableHead className="font-semibold">PROGRESS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centres.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-emerald-600 font-medium">{c.verified} <span className="text-slate-400 text-xs font-normal">/ {c.total}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${c.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-medium">{c.progress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-slate-100 flex justify-center">
                 <Button variant="link" className="text-blue-600 text-sm h-8">View All Centres</Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}