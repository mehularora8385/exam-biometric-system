import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit2, Trash2, DownloadCloud, FileText, Users, Calendar, Settings, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("exams");
  const [searchQuery, setSearchQuery] = useState("");

  const exams = [
    {
      id: "EX-2025-001",
      name: "National Entrance Test 2025",
      date: "2025-05-15",
      centres: 12,
      candidates: 2845,
      status: "active",
      dataDownloads: 156
    },
    {
      id: "EX-2025-002",
      name: "State Level Entrance",
      date: "2025-06-10",
      centres: 8,
      candidates: 1520,
      status: "scheduled",
      dataDownloads: 0
    },
    {
      id: "EX-MOCK-001",
      name: "System Trial Run",
      date: "2025-04-20",
      centres: 3,
      candidates: 355,
      status: "completed",
      dataDownloads: 28
    },
  ];

  const operators = [
    {
      id: "OP-1234",
      name: "Rajesh Kumar",
      mobile: "9876543210",
      centre: "DL-015",
      status: "active",
      registeredDate: "2025-01-10",
      recordsProcessed: 89
    },
    {
      id: "OP-1235",
      name: "Priya Sharma",
      mobile: "9876543211",
      centre: "DL-015",
      status: "active",
      registeredDate: "2025-01-10",
      recordsProcessed: 76
    },
    {
      id: "OP-1236",
      name: "Amit Singh",
      mobile: "9876543212",
      centre: "DL-016",
      status: "suspended",
      registeredDate: "2025-01-12",
      recordsProcessed: 45
    },
  ];

  const reports = [
    { id: "RPT-001", name: "Gate Entry Summary", type: "Attendance", generatedDate: "2025-04-20", records: 2847, status: "ready" },
    { id: "RPT-002", name: "Enrollment Report", type: "Biometrics", generatedDate: "2025-04-20", records: 2156, status: "ready" },
    { id: "RPT-003", name: "OMR Mapping Validation", type: "Data Validation", generatedDate: "2025-04-20", records: 2156, status: "ready" },
    { id: "RPT-004", name: "Operator Activity Log", type: "Audit", generatedDate: "2025-04-19", records: 1247, status: "archived" },
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
              <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
              <p className="text-slate-500">System administration and configuration</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary text-sm px-3 py-1">
            <Lock className="w-3 h-3 mr-1" /> Admin Access
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-slate-500 mt-1">Active Exams</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">42</div>
                <p className="text-xs text-slate-500 mt-1">Total Operators</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <DownloadCloud className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">184</div>
                <p className="text-xs text-slate-500 mt-1">Data Downloads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <FileText className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-600">4</div>
                <p className="text-xs text-slate-500 mt-1">Reports Ready</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search exams..." 
                className="max-w-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Exam
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">Exam ID</TableHead>
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Centres</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Candidates</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Downloads</TableHead>
                      <TableHead className="text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-xs">{exam.id}</TableCell>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell className="text-sm">{exam.date}</TableCell>
                        <TableCell className="text-center font-medium">{exam.centres}</TableCell>
                        <TableCell className="text-center font-medium">{exam.candidates}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            exam.status === "active" && "bg-emerald-100 text-emerald-700",
                            exam.status === "scheduled" && "bg-blue-100 text-blue-700",
                            exam.status === "completed" && "bg-slate-100 text-slate-600"
                          )}>
                            {exam.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{exam.dataDownloads}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operators" className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search operators..." 
                className="max-w-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Register Operator
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">Operator ID</TableHead>
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold">Mobile</TableHead>
                      <TableHead className="text-xs font-semibold">Centre</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Registered</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Records</TableHead>
                      <TableHead className="text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((op) => (
                      <TableRow key={op.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-xs">{op.id}</TableCell>
                        <TableCell className="font-medium">{op.name}</TableCell>
                        <TableCell className="font-mono text-xs">{op.mobile}</TableCell>
                        <TableCell className="text-sm">{op.centre}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            op.status === "active" && "bg-emerald-100 text-emerald-700",
                            op.status === "suspended" && "bg-red-100 text-red-700"
                          )}>
                            {op.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{op.registeredDate}</TableCell>
                        <TableCell className="text-center font-medium">{op.recordsProcessed}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex gap-2">
              <Button className="gap-2">
                <FileText className="w-4 h-4" /> Generate New Report
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">Report ID</TableHead>
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold">Type</TableHead>
                      <TableHead className="text-xs font-semibold">Generated</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Records</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-xs">{report.id}</TableCell>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell className="text-sm">{report.type}</TableCell>
                        <TableCell className="text-sm text-slate-600">{report.generatedDate}</TableCell>
                        <TableCell className="text-center font-medium">{report.records}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            report.status === "ready" && "bg-emerald-100 text-emerald-700",
                            report.status === "archived" && "bg-slate-100 text-slate-600"
                          )}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <DownloadCloud className="w-3 h-3" /> CSV
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" /> System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Data Sync Interval (minutes)</label>
                    <Input type="number" defaultValue="30" className="mt-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Inactivity Timeout (minutes)</label>
                    <Input type="number" defaultValue="15" className="mt-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Max Offline Records</label>
                    <Input type="number" defaultValue="5000" className="mt-1 text-xs" />
                  </div>
                  <Button size="sm" className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium">Enable Data Encryption</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium">Require Operator PIN</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-xs font-medium">Biometric Verification</span>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">Optional</Badge>
                  </div>
                  <Button size="sm" className="w-full" variant="outline">Manage Encryption Keys</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
