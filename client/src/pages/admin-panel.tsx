import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Plus, Edit2, Trash2, DownloadCloud, FileText, Users, 
  Calendar, Settings, Lock, CheckCircle2, AlertTriangle, Clock, 
  MapPin, RefreshCw, Upload, Search, Filter, ShieldCheck, Power, 
  BarChart4, PieChart, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedExamFilter, setSelectedExamFilter] = useState("all");

  const exams = [
    { id: "EX-2025-001", name: "National Entrance Test 2025", date: "2025-05-15", centres: 12, candidates: 15000, status: "active", apkPassword: "NET25_SECURE_88X" },
    { id: "EX-2025-002", name: "State Level Entrance", date: "2025-06-10", centres: 8, candidates: 8500, status: "scheduled", apkPassword: "STATE25_99Y" }
  ];

  const centres = [
    { id: "DL-015", name: "Modern Public School", city: "Delhi", capacity: 500, assignedExam: "EX-2025-001", syncStatus: "98%" },
    { id: "DL-016", name: "Greenway Academy", city: "Delhi", capacity: 800, assignedExam: "EX-2025-001", syncStatus: "100%" },
    { id: "UP-102", name: "City Convent", city: "Noida", capacity: 450, assignedExam: "EX-2025-002", syncStatus: "0%" }
  ];

  const operators = [
    { id: "OP-1234", name: "Rajesh Kumar", mobile: "9876543210", deviceBound: "TAB-A12", status: "active", lastActive: "2 mins ago" },
    { id: "OP-1235", name: "Priya Sharma", mobile: "9876543211", deviceBound: "TAB-B44", status: "active", lastActive: "Just now" },
    { id: "OP-1236", name: "Amit Singh", mobile: "9876543212", deviceBound: "Not Bound", status: "disabled", lastActive: "2 days ago" },
  ];

  const candidatesMaster = [
    { omr: "OMR-88123", rollNo: "2025001", name: "Rahul Sharma", father: "R.K. Sharma", dob: "2002-05-12", centre: "DL-015", faceMatch: "98%", status: "Verified" },
    { omr: "OMR-88124", rollNo: "2025002", name: "Priya Singh", father: "V. Singh", dob: "2001-11-20", centre: "DL-015", faceMatch: "95%", status: "Verified" },
    { omr: "OMR-88125", rollNo: "2025003", name: "Amit Kumar", father: "S. Kumar", dob: "2003-01-05", centre: "DL-016", faceMatch: "-", status: "Pending" },
  ];

  // Mock Data for Charts
  const hourlySyncData = [
    { time: '08:00', verified: 400, pending: 15000 },
    { time: '09:00', verified: 3200, pending: 12200 },
    { time: '10:00', verified: 8500, pending: 6900 },
    { time: '11:00', verified: 14200, pending: 1200 },
    { time: '12:00', verified: 15240, pending: 160 },
  ];

  const examVerificationData = [
    { name: 'EX-001', verified: 14200, pending: 800, total: 15000 },
    { name: 'EX-002', verified: 7100, pending: 1400, total: 8500 },
    { name: 'EX-003', verified: 3500, pending: 500, total: 4000 },
  ];

  const centrePerformanceData = [
    { name: 'DL-015', verified: 500, capacity: 500 },
    { name: 'DL-016', verified: 780, capacity: 800 },
    { name: 'UP-102', verified: 420, capacity: 450 },
    { name: 'HR-055', verified: 580, capacity: 600 },
    { name: 'RJ-011', verified: 300, capacity: 350 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">HQ Control Panel</h1>
              <p className="text-slate-500">Centralized monitoring and exam governance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-2">
              <Power className="w-4 h-4" /> Logout All Devices
            </Button>
            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2">
              <RefreshCw className="w-4 h-4" /> Sync All
            </Button>
            <Badge className="bg-primary/10 text-primary text-sm px-3 py-1 ml-2">
              <Settings className="w-3 h-3 mr-1" /> System Admin
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 h-12">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="exams" className="text-xs md:text-sm">Exams</TabsTrigger>
            <TabsTrigger value="centres" className="text-xs md:text-sm">Centres</TabsTrigger>
            <TabsTrigger value="operators" className="text-xs md:text-sm">Operators</TabsTrigger>
            <TabsTrigger value="candidates" className="text-xs md:text-sm">Candidates</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="config" className="text-xs md:text-sm">APK Config</TabsTrigger>
          </TabsList>

          {/* 1.1 ADMIN DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Live Global Statistics</h2>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <select 
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white font-medium min-w-[200px]"
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                >
                  <option value="all">Global View (All Active Exams)</option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.name} ({exam.id})</option>
                  ))}
                </select>
                <select className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white font-medium">
                  <option>All Centres</option>
                  {centres.map(c => <option key={c.id}>{c.name} ({c.id})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <CardContent className="p-5 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Total Candidates</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">23,500</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <CardContent className="p-5 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Active Centres</span>
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">20</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <CardContent className="p-5 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Operators Online</span>
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-3xl font-bold text-blue-600">145</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
                <CardContent className="p-5 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Global Sync</span>
                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-3xl font-bold text-emerald-600">94%</span>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-sm border-slate-200">
                <CardHeader className="pb-2 border-b border-slate-100">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart4 className="w-4 h-4 text-slate-500" /> 
                    Exam-wise Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examVerificationData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="verified" name="Verified" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                  <CardContent className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Present Count (Gate)</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-blue-900">18,240</h3>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">77%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                  <CardContent className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 mb-1">Verified (Round 2)</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-emerald-900">16,500</h3>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">70%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-100 shadow-sm">
                  <CardContent className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Pending Verification</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-amber-900">1,740</h3>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">7%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
               <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart4 className="w-4 h-4 text-slate-500" />
                      Top 5 Centres by Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={centrePerformanceData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} width={60} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="verified" name="Verified" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
               </Card>

            {/* Exception Monitor injected here */}
            <Card className="border-red-200 shadow-sm mt-6">
               <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
                 <div className="flex justify-between items-center">
                   <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                     <AlertTriangle className="w-5 h-5 text-red-600" /> Biometric Exception Monitor
                   </CardTitle>
                   <Badge variant="destructive">12 New Alerts</Badge>
                 </div>
               </CardHeader>
               <CardContent className="p-0">
                 <Table>
                   <TableHeader>
                     <TableRow className="bg-slate-50">
                       <TableHead className="text-xs font-semibold">Time</TableHead>
                       <TableHead className="text-xs font-semibold">Alert Type</TableHead>
                       <TableHead className="text-xs font-semibold">Centre</TableHead>
                       <TableHead className="text-xs font-semibold">Operator</TableHead>
                       <TableHead className="text-xs font-semibold">Roll No</TableHead>
                       <TableHead className="text-xs font-semibold">Action</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {[
                       { time: "10:45 AM", type: "Face Mismatch Approved", centre: "DL-015", operator: "Rajesh K.", roll: "2025001", action: "Override - Approved", severity: "medium" },
                       { time: "10:32 AM", type: "Invalid Photo Attempt", centre: "DL-016", operator: "Amit S.", roll: "2025089", action: "Blocked", severity: "high" },
                     ].map((alert, i) => (
                       <TableRow key={i}>
                         <TableCell className="text-xs text-slate-500">{alert.time}</TableCell>
                         <TableCell className="font-medium text-sm text-slate-900 flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", alert.severity === "high" ? "bg-red-500" : "bg-orange-500")} />
                           {alert.type}
                         </TableCell>
                         <TableCell className="text-sm font-mono text-slate-600">{alert.centre}</TableCell>
                         <TableCell className="text-sm">{alert.operator}</TableCell>
                         <TableCell className="text-sm font-mono">{alert.roll}</TableCell>
                         <TableCell>
                           <Badge variant="outline" className={cn("text-[10px]", alert.action === "Blocked" ? "border-red-200 text-red-700 bg-red-50" : "border-orange-200 text-orange-700 bg-orange-50")}>
                             {alert.action}
                           </Badge>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
             </div>
          </TabsContent>

          {/* 1.2 & 1.3 EXAM & SLOT MANAGEMENT */}
          <TabsContent value="exams" className="space-y-6 mt-6">
            <div className="flex gap-2 justify-between items-center">
              <Input placeholder="Search exams..." className="max-w-sm" />
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2"><Upload className="w-4 h-4"/> Upload Candidate Data (CSV)</Button>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Create Exam</Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Exam ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date / Slots</TableHead>
                      <TableHead>Centres</TableHead>
                      <TableHead>APK Password</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-mono text-xs">{exam.id}</TableCell>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell className="text-sm">{exam.date} (2 Slots)</TableCell>
                        <TableCell className="font-medium">{exam.centres}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{exam.apkPassword}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", exam.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>
                            {exam.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1.4 CENTRE MANAGEMENT */}
          <TabsContent value="centres" className="space-y-6 mt-6">
             <div className="flex gap-2 justify-between items-center">
              <Input placeholder="Search centres..." className="max-w-sm" />
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Centre</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Centre Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Assigned Exam</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Sync Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centres.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs font-bold">{c.id}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.city}</TableCell>
                        <TableCell className="font-mono text-xs">{c.assignedExam}</TableCell>
                        <TableCell>{c.capacity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-[60px]">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: c.syncStatus }}></div>
                            </div>
                            <span className="text-xs font-medium">{c.syncStatus}</span>
                          </div>
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1.5 OPERATOR MANAGEMENT */}
          <TabsContent value="operators" className="space-y-6 mt-6">
            <div className="flex gap-2 justify-between items-center">
              <Input placeholder="Search operators by ID or Phone..." className="max-w-sm" />
              <Button className="gap-2"><Plus className="w-4 h-4" /> Create Operator</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Operator ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Device Bound</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((op) => (
                      <TableRow key={op.id}>
                        <TableCell className="font-mono text-xs font-bold">{op.id}</TableCell>
                        <TableCell>{op.name}</TableCell>
                        <TableCell className="font-mono text-xs">{op.mobile}</TableCell>
                        <TableCell>
                          {op.deviceBound !== "Not Bound" ? (
                             <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">{op.deviceBound}</Badge>
                          ) : (
                             <span className="text-xs text-slate-400">Not Bound</span>
                          )}
                        </TableCell>
                        <TableCell>
                           <Badge className={cn("text-xs", op.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            {op.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{op.lastActive}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-xs h-7">Reset Bind</Button>
                          <Button size="sm" variant="ghost" className={op.status === "active" ? "text-red-600" : "text-emerald-600"}>
                            {op.status === "active" ? "Disable" : "Enable"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1.6 CANDIDATE MASTER FIELDS */}
          <TabsContent value="candidates" className="space-y-6 mt-6">
            <div className="flex gap-2 justify-between items-center">
               <div className="flex gap-2">
                 <Input placeholder="Search Roll No or OMR..." className="w-64" />
                 <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
               </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>OMR No</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Candidate Name</TableHead>
                      <TableHead>Father Name</TableHead>
                      <TableHead>Centre</TableHead>
                      <TableHead>Face Match</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesMaster.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{c.omr}</TableCell>
                        <TableCell className="font-mono text-xs">{c.rollNo}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{c.father}</TableCell>
                        <TableCell className="font-mono text-xs">{c.centre}</TableCell>
                        <TableCell className="font-medium">{c.faceMatch}</TableCell>
                        <TableCell>
                           <Badge className={cn("text-xs", c.status === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1.7 REPORTS & EXPORT */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Attendance Report</CardTitle>
                   <CardDescription>Gate entry summaries and absent lists</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <Button className="w-full gap-2" variant="outline"><DownloadCloud className="w-4 h-4"/> Export CSV</Button>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Biometric & OMR Report</CardTitle>
                   <CardDescription>Full face match % and fingerprint logs</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <Button className="w-full gap-2" variant="outline"><DownloadCloud className="w-4 h-4"/> Export CSV</Button>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Exception Audit Log</CardTitle>
                   <CardDescription>All manual overrides and system alerts</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <Button className="w-full gap-2" variant="outline"><DownloadCloud className="w-4 h-4"/> Export CSV</Button>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          {/* 4. APK CONFIGURATION */}
          <TabsContent value="config" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>APK Control Configuration (Global API)</CardTitle>
                <CardDescription>Dynamically control APK behavior and security policies on 15,000 tablets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm border-b pb-2">Biometric Controls</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">MFS100 Fingerprint Scanner</span>
                        <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">AI Face Matching (TensorFlow)</span>
                        <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Aadhaar Verification Toggle</span>
                        <Badge variant="outline" className="text-slate-500 bg-slate-100 border-slate-200">Disabled</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm border-b pb-2">MDM Security Rules (Kiosk)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">App Locking (Kiosk Mode)</span>
                        <Badge className="bg-blue-100 text-blue-700">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Block USB / Screenshots</span>
                        <Badge className="bg-blue-100 text-blue-700">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Auto-wipe After Exam</span>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">STANDBY</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}