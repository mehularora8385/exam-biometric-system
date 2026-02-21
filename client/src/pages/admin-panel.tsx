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
    { id: "EX-2025-001", name: "UPSC Civil Services 2024", date: "2024-05-15", centres: 12, candidates: 15420, status: "Active", apkPassword: "UPSC24_SECURE_88X" },
    { id: "EX-2025-002", name: "State Level Entrance", date: "2024-06-10", centres: 8, candidates: 8500, status: "Scheduled", apkPassword: "STATE24_99Y" }
  ];

  const centres = [
    { id: "DEL001", name: "Delhi Public School", exam: "UPSC Civil Services 2024", location: "New Delhi, Delhi", address: "Mathura Road", capacity: 500 },
    { id: "DEL002", name: "Kendriya Vidyalaya", exam: "UPSC Civil Services 2024", location: "New Delhi, Delhi", address: "Gole Market", capacity: 800 },
    { id: "MUM001", name: "St. Xaviers College", exam: "UPSC Civil Services 2024", location: "Mumbai, MH", address: "Fort", capacity: 450 }
  ];

  const operators = [
    { name: "Rajesh Kumar", mobile: "9876543210", email: "rajesh@example.com", centre: "Delhi Public School", device: "Samsung Tab A7", status: "Active", lastActive: "25/01/2024, 10:30 am" },
    { name: "Priya Sharma", mobile: "9876543211", email: "priya@example.com", centre: "Kendriya Vidyalaya", device: "Lenovo Tab S6", status: "Active", lastActive: "25/01/2024, 10:32 am" },
    { name: "Amit Singh", mobile: "9876543212", email: "amit@example.com", centre: "St. Xaviers College", device: "Samsung Tab A7", status: "Inactive", lastActive: "24/01/2024, 05:00 pm" },
  ];

  const candidatesMaster = [
    { omr: "OMR001234", rollNo: "UPSC2024001", name: "Arun Kumar", father: "Suresh Kumar", dob: "1995-05-15", centre: "DEL001 Delhi Public School", slot: "Morning Slot", faceMatch: "98.5%", status: "Verified" },
    { omr: "OMR001235", rollNo: "UPSC2024002", name: "Priya Singh", father: "V. Singh", dob: "1996-11-20", centre: "DEL001 Delhi Public School", slot: "Morning Slot", faceMatch: "95.2%", status: "Verified" },
    { omr: "OMR001236", rollNo: "UPSC2024003", name: "Amit Kumar", father: "S. Kumar", dob: "1997-01-05", centre: "DEL002 Kendriya Vidyalaya", slot: "Evening Slot", faceMatch: "-", status: "Pending" },
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
            <TabsTrigger value="reports" className="text-xs md:text-sm">Audit Logs</TabsTrigger>
            <TabsTrigger value="config" className="text-xs md:text-sm">Generate APK</TabsTrigger>
          </TabsList>

          {/* 1.1 ADMIN DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-slate-500">Overview of all exams</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button variant="outline" className="bg-white">All Exams</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-[120px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Total Candidates</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">15,420</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-[120px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Verified</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600">12,350</span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">80% complete</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">+12.5% vs last hour</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-[120px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Pending</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-3xl font-bold text-amber-600">2,070</span>
                  <span className="text-xs text-slate-500 mt-1">Not Verified: 1,000</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-[120px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">Present Today</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-3xl font-bold text-blue-600">14,200</span>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-slate-500">Centres: 6/8</span>
                    <span className="text-xs text-slate-500">Ops: 5/6</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col items-center">
                     <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.8)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute text-2xl font-bold text-slate-800">80%</div>
                     </div>
                     <p className="text-sm font-medium text-slate-600">12,350 / 15,420</p>
                   </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Present</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col items-center">
                     <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.92)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute text-2xl font-bold text-slate-800">92%</div>
                     </div>
                     <p className="text-sm font-medium text-slate-600">14,200 / 15,420</p>
                   </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Operators</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col items-center">
                     <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.83)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute text-2xl font-bold text-slate-800">83%</div>
                     </div>
                     <p className="text-sm font-medium text-slate-600">5 / 6</p>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Centre-wise Verification Status</CardTitle>
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
                  <CardTitle className="text-base">Verifications Today</CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlySyncData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="verified" name="Verifications" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Centre-wise Statistics</CardTitle>
                    <CardDescription>Detailed breakdown by examination centre</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Show</span>
                    <select className="border rounded px-2 py-1 text-sm"><option>10</option></select>
                    <span className="text-sm text-slate-500">entries</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">CODE</TableHead>
                      <TableHead className="font-semibold">CENTRE NAME</TableHead>
                      <TableHead className="font-semibold">TOTAL</TableHead>
                      <TableHead className="font-semibold">VERIFIED</TableHead>
                      <TableHead className="font-semibold">PENDING</TableHead>
                      <TableHead className="font-semibold">OPERATORS</TableHead>
                      <TableHead className="font-semibold">PROGRESS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs">DEL001</TableCell>
                      <TableCell className="font-medium">Delhi Public School</TableCell>
                      <TableCell>2,500</TableCell>
                      <TableCell className="text-emerald-600 font-medium">2,100</TableCell>
                      <TableCell className="text-amber-600">300</TableCell>
                      <TableCell>2 / 2</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                          </div>
                          <span className="text-xs font-medium">84%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">DEL002</TableCell>
                      <TableCell className="font-medium">Kendriya Vidyalaya</TableCell>
                      <TableCell>2,200</TableCell>
                      <TableCell className="text-emerald-600 font-medium">1,800</TableCell>
                      <TableCell className="text-amber-600">350</TableCell>
                      <TableCell>1 / 1</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                          </div>
                          <span className="text-xs font-medium">82%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">MUM001</TableCell>
                      <TableCell className="font-medium">St. Xaviers College</TableCell>
                      <TableCell>2,800</TableCell>
                      <TableCell className="text-emerald-600 font-medium">2,300</TableCell>
                      <TableCell className="text-amber-600">400</TableCell>
                      <TableCell>0 / 1</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                          </div>
                          <span className="text-xs font-medium">82%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1.2 & 1.3 EXAM & SLOT MANAGEMENT */}
          <TabsContent value="exams" className="space-y-6 mt-6">
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2">
                 <Input placeholder="Search exams..." className="w-80" />
                 <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
               </div>
              <div className="flex gap-2">
                <Button variant="outline"><DownloadCloud className="w-4 h-4 mr-2"/> Excel</Button>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Create Exam</Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>EXAM ID</TableHead>
                      <TableHead>NAME</TableHead>
                      <TableHead>DATE / SLOTS</TableHead>
                      <TableHead>CENTRES</TableHead>
                      <TableHead>APK PASSWORD</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-mono text-xs font-bold">{exam.id}</TableCell>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell className="text-sm text-slate-500">{exam.date} (2 Slots)</TableCell>
                        <TableCell className="font-medium">{exam.centres}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{exam.apkPassword}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", exam.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>
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
                      <TableHead>CODE</TableHead>
                      <TableHead>CENTRE NAME</TableHead>
                      <TableHead>EXAM</TableHead>
                      <TableHead>LOCATION</TableHead>
                      <TableHead>ADDRESS</TableHead>
                      <TableHead>CAPACITY</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centres.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs font-bold">{c.id}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm">{c.exam}</TableCell>
                        <TableCell className="text-sm text-slate-500">{c.location}</TableCell>
                        <TableCell className="text-sm text-slate-500">{c.address}</TableCell>
                        <TableCell>{c.capacity}</TableCell>
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
              <Input placeholder="Search operators..." className="max-w-sm" />
              <Button className="gap-2"><Plus className="w-4 h-4" /> Create Operator</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>OPERATOR</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>CENTRE</TableHead>
                      <TableHead>DEVICE</TableHead>
                      <TableHead>LAST ACTIVE</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((op, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <p className="font-medium">{op.name}</p>
                          <p className="text-xs text-slate-500">{op.mobile}</p>
                        </TableCell>
                        <TableCell className="text-sm">{op.email}</TableCell>
                        <TableCell className="text-sm">{op.centre}</TableCell>
                        <TableCell className="text-sm">{op.device}</TableCell>
                        <TableCell className="text-sm text-slate-500">{op.lastActive}</TableCell>
                        <TableCell>
                           <Badge className={cn("text-xs", op.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            {op.status}
                          </Badge>
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

          {/* 1.6 CANDIDATE MASTER FIELDS */}
          <TabsContent value="candidates" className="space-y-6 mt-6">
            <div className="flex gap-2 justify-between items-center">
               <div className="flex gap-2">
                 <Input placeholder="Search by name, roll no, OMR no..." className="w-80" />
                 <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline"><DownloadCloud className="w-4 h-4 mr-2" /> Excel</Button>
                 <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> PDF</Button>
               </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>UPLOAD PHOTO</TableHead>
                      <TableHead>VERIFIED PHOTO</TableHead>
                      <TableHead>OMR NO.</TableHead>
                      <TableHead>ROLL NO.</TableHead>
                      <TableHead>CANDIDATE</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>CENTRE</TableHead>
                      <TableHead>SLOT</TableHead>
                      <TableHead>MATCH %</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesMaster.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="w-8 h-8 bg-slate-200 rounded-sm"></div></TableCell>
                        <TableCell><div className="w-8 h-8 bg-slate-200 rounded-sm"></div></TableCell>
                        <TableCell className="font-mono text-xs">{c.omr}</TableCell>
                        <TableCell className="font-mono text-xs">{c.rollNo}</TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-slate-500">S/o {c.father}</p>
                        </TableCell>
                        <TableCell className="text-sm">{c.dob}</TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{c.centre}</TableCell>
                        <TableCell className="text-sm">{c.slot}</TableCell>
                        <TableCell className="font-medium">{c.faceMatch}</TableCell>
                        <TableCell>
                           <Badge className={cn("text-xs", c.status === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {c.status}
                          </Badge>
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

          {/* 1.7 REPORTS & EXPORT -> AUDIT LOGS */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <div className="flex gap-2 justify-between items-center">
              <Input placeholder="Search logs..." className="max-w-sm" />
              <div className="flex gap-2">
                <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
                <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
                <Button variant="outline"><DownloadCloud className="w-4 h-4 mr-2" /> Export</Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>TIMESTAMP</TableHead>
                      <TableHead>ACTION</TableHead>
                      <TableHead>BIOMETRIC</TableHead>
                      <TableHead>OPERATOR</TableHead>
                      <TableHead>DEVICE</TableHead>
                      <TableHead>CANDIDATE</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm text-slate-500">25/01/2024, 10:30 am</TableCell>
                      <TableCell className="font-medium">Candidate Verified</TableCell>
                      <TableCell>Both</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">Rajesh Kumar</p>
                        <p className="text-xs text-slate-500">op-1</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">DEV001</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">Arun Kumar</p>
                        <p className="text-xs text-slate-500">cand-1</p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700">Online</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. APK CONFIGURATION -> GENERATE APK */}
          <TabsContent value="config" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">APK Versions</h2>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Generate APK</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>VERSION</TableHead>
                      <TableHead>EXAM</TableHead>
                      <TableHead>GENERATED ON</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">2.1.0</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        Added face liveness detection<br/>
                        Improved fingerprint scanner compatibility<br/>
                        Bug fixes
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">20/01/2024</TableCell>
                      <TableCell>
                         <Badge className="bg-emerald-100 text-emerald-700">Ready</Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
                         <Button size="sm" variant="ghost"><DownloadCloud className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}