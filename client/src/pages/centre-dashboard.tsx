import React from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Wifi, WifiOff, Users, CheckCircle2, Clock, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CentreDashboard() {
  const [, setLocation] = useLocation();
  const { state } = useAppStore();

  // Mock centre data
  const centres = [
    {
      id: "DL-015",
      name: "Centre: Delhi-015 (North)",
      location: "NDSE-II, Delhi",
      totalOperators: 4,
      activeOperators: 3,
      totalCandidates: 120,
      attendanceMarked: 115,
      enrollmentComplete: 98,
      lastSync: "2 minutes ago",
      syncStatus: "synced"
    },
    {
      id: "DL-016",
      name: "Centre: Delhi-016 (South)",
      location: "Dwarka, Delhi",
      totalOperators: 3,
      activeOperators: 2,
      totalCandidates: 85,
      attendanceMarked: 78,
      enrollmentComplete: 65,
      lastSync: "15 minutes ago",
      syncStatus: "synced"
    },
    {
      id: "BLR-001",
      name: "Centre: Bangalore-001",
      location: "Indiranagar, Bangalore",
      totalOperators: 5,
      activeOperators: 4,
      totalCandidates: 150,
      attendanceMarked: 142,
      enrollmentComplete: 121,
      lastSync: "45 seconds ago",
      syncStatus: "syncing"
    },
  ];

  const operators = [
    { id: "OP-1234", name: "Rajesh Kumar", centre: "DL-015", mobile: "9876543210", status: "active", attendanceCount: 32, enrollmentCount: 28 },
    { id: "OP-1235", name: "Priya Sharma", centre: "DL-015", mobile: "9876543211", status: "active", attendanceCount: 28, enrollmentCount: 24 },
    { id: "OP-1236", name: "Amit Singh", centre: "DL-016", mobile: "9876543212", status: "idle", attendanceCount: 40, enrollmentCount: 35 },
    { id: "OP-1237", name: "Neha Patel", centre: "BLR-001", mobile: "9876543213", status: "active", attendanceCount: 45, enrollmentCount: 38 },
    { id: "OP-1238", name: "Vikram Malhotra", centre: "BLR-001", mobile: "9876543214", status: "active", attendanceCount: 38, enrollmentCount: 32 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Centre Server Dashboard</h1>
            <p className="text-slate-500">Real-time monitoring of all exam centres</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">3</div>
                <p className="text-xs text-slate-500 mt-1">Active Centres</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">355</div>
                <p className="text-xs text-slate-500 mt-1">Total Candidates</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">335</div>
                <p className="text-xs text-slate-500 mt-1">Gate Entry Passed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">284</div>
                <p className="text-xs text-slate-500 mt-1">Enrolled (Round 2)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Exam Centres Status</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">Centre</TableHead>
                      <TableHead className="text-xs font-semibold">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Operators</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Candidates</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Gate Entry %</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Enrolled %</TableHead>
                      <TableHead className="text-xs font-semibold">Sync Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centres.map((centre) => {
                      const gateEntryPct = Math.round((centre.attendanceMarked / centre.totalCandidates) * 100);
                      const enrollmentPct = Math.round((centre.enrollmentComplete / centre.totalCandidates) * 100);
                      
                      return (
                        <TableRow key={centre.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell className="font-semibold text-slate-900">{centre.name}</TableCell>
                          <TableCell className="text-sm text-slate-600">{centre.location}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {centre.activeOperators}/{centre.totalOperators}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm font-medium">{centre.totalCandidates}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all" 
                                  style={{width: `${gateEntryPct}%`}}
                                ></div>
                              </div>
                              <span className="text-xs font-medium w-8 text-right">{gateEntryPct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 transition-all" 
                                  style={{width: `${enrollmentPct}%`}}
                                ></div>
                              </div>
                              <span className="text-xs font-medium w-8 text-right">{enrollmentPct}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {centre.syncStatus === "synced" ? (
                                <>
                                  <Wifi className="w-4 h-4 text-emerald-600" />
                                  <span className="text-xs text-emerald-600 font-medium">Synced</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-orange-600 animate-spin" />
                                  <span className="text-xs text-orange-600 font-medium">Syncing</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Operators Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">Operator ID</TableHead>
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold">Centre</TableHead>
                      <TableHead className="text-xs font-semibold">Mobile</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Gate Entry</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Enrollment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((op) => (
                      <TableRow key={op.id} className="hover:bg-slate-50 border-b border-slate-100">
                        <TableCell className="font-mono text-xs text-slate-600">{op.id}</TableCell>
                        <TableCell className="font-medium text-slate-900">{op.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{op.centre}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{op.mobile}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            op.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {op.status === "active" ? "Active" : "Idle"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium text-blue-600">{op.attendanceCount}</TableCell>
                        <TableCell className="text-center font-medium text-emerald-600">{op.enrollmentCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cloud className="w-4 h-4" /> Data Sync Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Records Synced:</span>
                <span className="font-bold">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pending Sync:</span>
                <span className="font-bold text-orange-600">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Failed (Retry):</span>
                <span className="font-bold text-destructive">2</span>
              </div>
              <Button className="w-full mt-3" size="sm">Force Sync All Centres</Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">API Response Time:</span>
                <span className="font-bold text-emerald-600">124ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Database Status:</span>
                <Badge variant="outline" className="bg-emerald-50">Online</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Last Health Check:</span>
                <span className="text-xs text-slate-500">30s ago</span>
              </div>
              <Button className="w-full mt-3" size="sm" variant="outline">View Logs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
