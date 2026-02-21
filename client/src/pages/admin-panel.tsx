import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, Plus, Edit2, Trash2, DownloadCloud, FileText, Users, 
  Calendar, Settings, Lock, CheckCircle2, AlertTriangle, Clock, 
  MapPin, RefreshCw, Upload, Search, Filter, ShieldCheck, Power, 
  BarChart4, PieChart, Activity, Smartphone, Key, MonitorSmartphone, Cloud
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
    { id: "DEL001", name: "Delhi Public School", exam: "UPSC Civil Services 2024", location: "New Delhi, Delhi", address: "Mathura Road", capacity: 500, sync: "95%" },
    { id: "DEL002", name: "Kendriya Vidyalaya", exam: "UPSC Civil Services 2024", location: "New Delhi, Delhi", address: "Gole Market", capacity: 800, sync: "100%" },
    { id: "MUM001", name: "St. Xaviers College", exam: "UPSC Civil Services 2024", location: "Mumbai, MH", address: "Fort", capacity: 450, sync: "80%" }
  ];

  const operators = [
    { id: "OP-101", name: "Rajesh Kumar", mobile: "9876543210", email: "rajesh@example.com", centre: "Delhi Public School", device: "Samsung Tab A7 (Bound)", status: "Active", lastActive: "25/01/2024, 10:30 am" },
    { id: "OP-102", name: "Priya Sharma", mobile: "9876543211", email: "priya@example.com", centre: "Kendriya Vidyalaya", device: "Lenovo Tab S6 (Bound)", status: "Active", lastActive: "25/01/2024, 10:32 am" },
    { id: "OP-103", name: "Amit Singh", mobile: "9876543212", email: "amit@example.com", centre: "St. Xaviers College", device: "Unbound", status: "Disabled", lastActive: "24/01/2024, 05:00 pm" },
  ];

  const slots = [
    { id: "SL-01", exam: "UPSC Civil Services 2024", name: "Morning Slot", startTime: "09:00 AM", endTime: "12:00 PM", mappedCentres: 12 },
    { id: "SL-02", exam: "UPSC Civil Services 2024", name: "Evening Slot", startTime: "02:00 PM", endTime: "05:00 PM", mappedCentres: 12 },
  ];

  // Mock Data for Charts
  const hourlySyncData = [
    { time: '08:00', verified: 400, pending: 15000 },
    { time: '09:00', verified: 3200, pending: 12200 },
    { time: '10:00', verified: 8500, pending: 6900 },
    { time: '11:00', verified: 14200, pending: 1200 },
    { time: '12:00', verified: 15240, pending: 160 },
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">HQ Control Panel</h1>
              <p className="text-slate-500">Centralized monitoring and exam governance</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2" onClick={() => setLocation('/client-dashboard')}>
              <Activity className="w-4 h-4" /> Client Portal View
            </Button>
            <Badge className="bg-primary/10 text-primary text-sm px-3 py-1 ml-2">
              <Settings className="w-3 h-3 mr-1" /> System Admin
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto gap-1 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">Dashboard</TabsTrigger>
            <TabsTrigger value="exams" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">Exams</TabsTrigger>
            <TabsTrigger value="slots" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">Slots</TabsTrigger>
            <TabsTrigger value="centres" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">Centres</TabsTrigger>
            <TabsTrigger value="operators" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">Operators</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">Reports</TabsTrigger>
            <TabsTrigger value="config" className="text-xs md:text-sm flex-1 min-w-[100px] h-10">APK Config</TabsTrigger>
          </TabsList>

          {/* 1.1 ADMIN DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm font-semibold text-slate-700">Filter Exam:</span>
                <Select value={selectedExamFilter} onValueChange={setSelectedExamFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="All Active Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Active Exams</SelectItem>
                    <SelectItem value="EX-2025-001">UPSC Civil Services 2024</SelectItem>
                    <SelectItem value="EX-2025-002">State Level Entrance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2">
                  <RefreshCw className="w-4 h-4" /> Force Sync All Devices
                </Button>
                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-2">
                  <Power className="w-4 h-4" /> Logout All Devices
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Candidates</span>
                  <span className="text-2xl font-bold text-slate-900 mt-1">15,420</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Centres</span>
                  <span className="text-2xl font-bold text-slate-900 mt-1">12</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Operators</span>
                  <span className="text-2xl font-bold text-slate-900 mt-1">45</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center border-b-4 border-b-blue-500">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Present</span>
                  <span className="text-2xl font-bold text-blue-600 mt-1">14,200</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center border-b-4 border-b-emerald-500">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Verified</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1">12,350</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center border-b-4 border-b-orange-500">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Pending</span>
                  <span className="text-2xl font-bold text-orange-600 mt-1">1,850</span>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm col-span-2 lg:col-span-1">
                <CardContent className="p-4 flex flex-col justify-center h-[100px] text-center border-b-4 border-b-purple-500">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Sync %</span>
                  <span className="text-2xl font-bold text-purple-600 mt-1">98%</span>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Centre-wise Live Monitoring</CardTitle>
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
                  <CardTitle className="text-base">Verifications Timeline</CardTitle>
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
          </TabsContent>

          {/* 1.2 EXAM MANAGEMENT */}
          <TabsContent value="exams" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex gap-2 w-full sm:w-auto">
                 <Input placeholder="Search exams..." className="w-full sm:w-80" />
                 <Button variant="outline" size="icon"><Search className="w-4 h-4" /></Button>
               </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"><Plus className="w-4 h-4" /> Create New Exam</Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>EXAM DETAILS</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>CENTRES</TableHead>
                      <TableHead>SECURITY CREDENTIALS</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div className="font-bold text-slate-900">{exam.name}</div>
                          <div className="font-mono text-xs text-slate-500">{exam.id}</div>
                        </TableCell>
                        <TableCell className="text-sm">{exam.date}</TableCell>
                        <TableCell className="font-medium">{exam.centres} Assigned</TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-xs">
                               <span className="text-slate-500 w-16">APK Pass:</span>
                               <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{exam.apkPassword}</code>
                               <Button variant="ghost" size="icon" className="h-5 w-5 ml-1"><RefreshCw className="w-3 h-3 text-blue-500" /></Button>
                             </div>
                             <div className="flex items-center gap-2 text-xs">
                               <span className="text-slate-500 w-16">Client Login:</span>
                               <Button variant="link" className="h-auto p-0 text-xs">Generate Credentials</Button>
                             </div>
                           </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", exam.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-700")}>
                            {exam.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className={exam.status === "Active" ? "text-orange-600" : "text-emerald-600"}>
                              {exam.status === "Active" ? "Stop" : "Activate"}
                            </Button>
                            <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1.3 SLOT MANAGEMENT */}
          <TabsContent value="slots" className="space-y-6 mt-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold">Time-wise Slot Management</h2>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Create Slot</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>SLOT ID</TableHead>
                      <TableHead>EXAM</TableHead>
                      <TableHead>SLOT NAME</TableHead>
                      <TableHead>TIMINGS</TableHead>
                      <TableHead>MAPPED CENTRES</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-600">{s.id}</TableCell>
                        <TableCell className="text-sm font-medium">{s.exam}</TableCell>
                        <TableCell className="text-sm">{s.name}</TableCell>
                        <TableCell className="text-sm font-mono text-blue-600">{s.startTime} - {s.endTime}</TableCell>
                        <TableCell className="text-sm">{s.mappedCentres} Centres</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
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
             <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <Input placeholder="Search centres..." className="max-w-sm" />
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2"><MapPin className="w-4 h-4" /> Assign to Exam</Button>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /> Add Centre</Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>CODE</TableHead>
                      <TableHead>CENTRE DETAILS</TableHead>
                      <TableHead>ASSIGNED EXAM</TableHead>
                      <TableHead>CAPACITY</TableHead>
                      <TableHead>SYNC STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centres.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-700">{c.id}</TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{c.location}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{c.exam}</TableCell>
                        <TableCell className="font-medium text-slate-700">{c.capacity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex w-fit items-center gap-1.5">
                            <Cloud className="w-3 h-3" /> {c.sync}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
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

          {/* 1.5 OPERATOR MANAGEMENT */}
          <TabsContent value="operators" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <Input placeholder="Search operators..." className="max-w-sm" />
              <Button className="gap-2"><Plus className="w-4 h-4" /> Create Operator Account</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>OPERATOR</TableHead>
                      <TableHead>CONTACT INFO</TableHead>
                      <TableHead>ASSIGNED CENTRE</TableHead>
                      <TableHead>DEVICE BINDING</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((op, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="font-bold text-slate-900">{op.name}</div>
                          <div className="font-mono text-xs text-slate-500 mt-0.5">{op.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700">{op.mobile}</div>
                          <div className="text-xs text-slate-500">{op.email}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{op.centre}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {op.device.includes("Bound") ? (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none text-xs flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Bound
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500">Unbound</Badge>
                            )}
                            <span className="text-xs text-slate-500">{op.device.split(" ")[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge className={cn("text-xs shadow-none", op.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100")}>
                            {op.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              {op.status === "Active" ? "Disable" : "Enable"}
                            </Button>
                            {op.device.includes("Bound") && (
                              <Button size="sm" variant="outline" className="text-xs h-7 text-orange-600 border-orange-200">
                                Reset Binding
                              </Button>
                            )}
                          </div>
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
            <div className="flex gap-2 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <Input placeholder="Search logs..." className="max-w-sm" />
              <div className="flex gap-2">
                <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
                <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800"><DownloadCloud className="w-4 h-4" /> Export CSV/Excel</Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>TIMESTAMP</TableHead>
                      <TableHead>EVENT / ALERT TYPE</TableHead>
                      <TableHead>OPERATOR / DEVICE</TableHead>
                      <TableHead>CANDIDATE</TableHead>
                      <TableHead>CENTRE</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm text-slate-500 whitespace-nowrap">25/01/2024, 10:30:45 am</TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900">Biometric Verification Complete</div>
                        <div className="text-xs text-emerald-600 font-medium">Match: 95.2%</div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">Rajesh Kumar (OP-101)</p>
                        <p className="text-xs text-slate-500 font-mono">DEV-A7-8890</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">Arun Kumar</p>
                        <p className="text-xs text-slate-500 font-mono">UPSC2024001</p>
                      </TableCell>
                      <TableCell className="text-sm">DEL001</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Online Sync</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-orange-50/30">
                      <TableCell className="text-sm text-slate-500 whitespace-nowrap">25/01/2024, 10:45:12 am</TableCell>
                      <TableCell>
                        <div className="font-bold text-orange-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Face Mismatch Approved</div>
                        <div className="text-xs text-orange-600 font-medium">Match: 62% (Operator Override)</div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">Priya Sharma (OP-102)</p>
                        <p className="text-xs text-slate-500 font-mono">DEV-S6-4421</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">Sanjay Verma</p>
                        <p className="text-xs text-slate-500 font-mono">UPSC2024099</p>
                      </TableCell>
                      <TableCell className="text-sm">DEL002</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Alert Logged</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. APK CONFIGURATION -> DYNAMIC CONTROLS */}
          <TabsContent value="config" className="space-y-6 mt-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">APK Control Configuration</h2>
                <p className="text-sm text-slate-500">Dynamically control operator device features and security policies</p>
              </div>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><MonitorSmartphone className="w-4 h-4" /> Push Update to Devices</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Biometric & Flow Controls */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-500" /> Biometric & Flow Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700">Biometric Verification Mode</Label>
                    <Select defaultValue="both">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="face">Face Capture Only</SelectItem>
                        <SelectItem value="fingerprint">Fingerprint Only</SelectItem>
                        <SelectItem value="both">Face + Fingerprint (Recommended)</SelectItem>
                        <SelectItem value="all">Face + Fingerprint + OMR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Aadhaar Validation</Label>
                      <p className="text-xs text-slate-500">Require masked Aadhaar entry at login</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Strict Liveness Check</Label>
                      <p className="text-xs text-slate-500">Block verification if face integrity score &lt; 75%</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Offline Mode Support</Label>
                      <p className="text-xs text-slate-500">Allow biometrics without active internet</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Operator Device Binding</Label>
                      <p className="text-xs text-slate-500">Lock operator logins to a specific tablet hardware ID</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* MDM Controls */}
              <Card className="shadow-sm border-slate-200 border-t-4 border-t-red-500">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                    <ShieldCheck className="w-5 h-5" /> Mobile Device Management (MDM)
                  </CardTitle>
                  <CardDescription>Strict OS-level policies for exam security</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold text-slate-900">Enable MDM Kiosk Mode</Label>
                      <p className="text-xs text-slate-500">Lock tablet to only run the BioVerify APK</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-red-600" />
                  </div>

                  <div className="flex items-center justify-between pl-4 border-l-2 border-slate-200">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Block App Switching</Label>
                      <p className="text-xs text-slate-500">Disable recent apps button</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between pl-4 border-l-2 border-slate-200">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Block Screenshots & Recording</Label>
                      <p className="text-xs text-slate-500">Prevent screen capture during exams</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between pl-4 border-l-2 border-slate-200">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Block USB File Transfer</Label>
                      <p className="text-xs text-slate-500">Disable MTP/PTP protocols</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold text-slate-900">Auto-Wipe Post Exam</Label>
                      <p className="text-xs text-slate-500">Delete all local candidate data after successful sync</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-red-600" />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Changes to MDM policies require device reboot to apply.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}