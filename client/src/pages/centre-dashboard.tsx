import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Wifi, WifiOff, Users, CheckCircle2, Clock, AlertCircle, Cloud, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CentreDashboard() {
  const [, setLocation] = useLocation();
  const { state } = useAppStore();
  
  // Get active center from state or default to the first mock center
  const [selectedCenter, setSelectedCenter] = useState<string>("DL-015");

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
  
  // Filter data based on selected center
  const filteredCentres = centres.filter(c => c.id === selectedCenter);
  const filteredOperators = operators.filter(o => o.centre === selectedCenter);
  const currentCenterData = filteredCentres[0] || centres[0];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Centre Server Dashboard</h1>
              <p className="text-slate-500">Real-time monitoring for your active center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <MapPin className="w-5 h-5 text-emerald-600 ml-2" />
            <Select value={selectedCenter} onValueChange={setSelectedCenter}>
              <SelectTrigger className="w-[280px] border-0 focus:ring-0 shadow-none font-semibold text-slate-900 bg-transparent">
                <SelectValue placeholder="Select Center" />
              </SelectTrigger>
              <SelectContent>
                {centres.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.id}: {c.location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">{currentCenterData.totalCandidates}</div>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Candidates</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">{currentCenterData.attendanceMarked}</div>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Gate Entry Passed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">{currentCenterData.enrollmentComplete}</div>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Enrolled (Round 2)</p>
              </div>
            </CardContent>
          </Card>
          <Card className={cn("border-l-4 shadow-sm", currentCenterData.syncStatus === 'synced' ? 'border-l-emerald-500' : 'border-l-orange-500')}>
            <CardContent className="p-5 flex flex-col items-center justify-center h-full">
              <div className="flex items-center gap-2 mb-1">
                {currentCenterData.syncStatus === 'synced' ? (
                  <Wifi className="w-8 h-8 text-emerald-500" />
                ) : (
                  <Clock className="w-8 h-8 text-orange-500 animate-spin" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 capitalize mt-1">
                {currentCenterData.syncStatus === 'synced' ? 'System Synced' : 'Sync in Progress'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Last: {currentCenterData.lastSync}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Center Operators Activity</h2>
              <Badge variant="outline" className="bg-white">{filteredOperators.length} Assigned</Badge>
            </div>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">Operator</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Gate Entry</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Enrollment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOperators.length > 0 ? (
                        filteredOperators.map((op) => (
                          <TableRow key={op.id} className="hover:bg-slate-50 border-b border-slate-100">
                            <TableCell>
                              <div className="font-medium text-slate-900">{op.name}</div>
                              <div className="font-mono text-xs text-slate-500 mt-0.5">{op.id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-xs",
                                op.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                              )}>
                                {op.status === "active" ? "Active" : "Idle"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold text-blue-600">{op.attendanceCount}</TableCell>
                            <TableCell className="text-center font-bold text-emerald-600">{op.enrollmentCount}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No operators assigned to this center.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Progress Overview</h2>
            <Card className="shadow-sm border-slate-200 h-[calc(100%-2rem)]">
              <CardContent className="p-6 space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-slate-700">Gate Entry Progress</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round((currentCenterData.attendanceMarked / currentCenterData.totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all rounded-full" 
                      style={{width: `${Math.round((currentCenterData.attendanceMarked / currentCenterData.totalCandidates) * 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-right">
                    {currentCenterData.attendanceMarked} of {currentCenterData.totalCandidates} candidates
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-slate-700">Biometric Enrollment</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {Math.round((currentCenterData.enrollmentComplete / currentCenterData.totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all rounded-full" 
                      style={{width: `${Math.round((currentCenterData.enrollmentComplete / currentCenterData.totalCandidates) * 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-right">
                    {currentCenterData.enrollmentComplete} of {currentCenterData.totalCandidates} candidates
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4" /> Local System Status
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Network Connection:</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Pending Sync Records:</span>
                      <span className="font-bold text-slate-900">0</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">Run Diagnostics</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
