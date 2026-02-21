import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAppStore, Exam } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, CheckCircle2, Clock, AlertCircle, Cloud, MapPin, Search, Filter, PlayCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function ExamDashboard() {
  const [, setLocation] = useLocation();
  const { state } = useAppStore();
  
  // Get active exam or default to first
  const [selectedExamId, setSelectedExamId] = useState<string>(state.exams[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock exam metrics data (this would normally come from an API)
  const examMetrics = {
    "EX-2025-001": {
      totalCandidates: 2845,
      attendanceMarked: 2650,
      enrollmentComplete: 2510,
      totalCentres: 12,
      activeCentres: 12,
      totalOperators: 48,
      activeOperators: 45,
      anomalies: 15,
      completionPct: 88,
    },
    "EX-MOCK-001": {
      totalCandidates: 355,
      attendanceMarked: 335,
      enrollmentComplete: 284,
      totalCentres: 3,
      activeCentres: 3,
      totalOperators: 12,
      activeOperators: 9,
      anomalies: 2,
      completionPct: 80,
    }
  };

  // Mock centers for the selected exam
  const examCentres = [
    { id: "DL-015", name: "Delhi-015 (North)", candidates: 120, present: 115, enrolled: 98, status: "active", progress: 82 },
    { id: "DL-016", name: "Delhi-016 (South)", candidates: 85, present: 78, enrolled: 65, status: "active", progress: 76 },
    { id: "DL-017", name: "Delhi-017 (East)", candidates: 150, present: 142, enrolled: 121, status: "active", progress: 81 },
    { id: "MH-001", name: "Mumbai Central", candidates: 200, present: 195, enrolled: 180, status: "active", progress: 90 },
    { id: "MH-002", name: "Mumbai Suburban", candidates: 150, present: 0, enrolled: 0, status: "idle", progress: 0 },
  ];

  const currentExam = state.exams.find(e => e.id === selectedExamId) || state.exams[0];
  const currentMetrics = examMetrics[selectedExamId as keyof typeof examMetrics] || examMetrics["EX-2025-001"];

  const filteredCentres = examCentres.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Exam Overview</h1>
              <p className="text-slate-500">Global monitoring across all centres</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm min-w-[300px]">
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="w-full border-0 focus:ring-0 shadow-none font-semibold text-slate-900 bg-transparent">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                {state.exams.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant={e.type === "MOCK" ? "secondary" : "default"} className="text-[10px] px-1 py-0 h-4">
                        {e.type}
                      </Badge>
                      <span className="truncate max-w-[200px]">{e.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentExam && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{currentExam.name}</h2>
                <Badge variant={currentExam.type === "MOCK" ? "secondary" : "default"} className={currentExam.type === "MOCK" ? "bg-orange-100 text-orange-800" : ""}>
                  {currentExam.type === "MOCK" ? "MOCK EXAM" : "LIVE EXAM"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Date: {currentExam.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Code: {currentExam.id}</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active / In Progress
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 bg-white text-slate-700">
                <Filter className="w-4 h-4" /> Filter Reports
              </Button>
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                <Download className="w-4 h-4" /> Export Master Roster
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-t-4 border-t-blue-500 shadow-sm">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">{currentMetrics.totalCandidates.toLocaleString()}</div>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Registrations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-emerald-500 shadow-sm">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="flex justify-center items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-emerald-600">{currentMetrics.attendanceMarked.toLocaleString()}</span>
                  <span className="text-sm font-bold text-emerald-600/70 pb-1">/ {currentMetrics.totalCandidates}</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Gate Entry (Present)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-purple-500 shadow-sm">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="flex justify-center items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-purple-600">{currentMetrics.enrollmentComplete.toLocaleString()}</span>
                  <span className="text-sm font-bold text-purple-600/70 pb-1">/ {currentMetrics.attendanceMarked}</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Biometrics Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-orange-500 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3">
               <AlertCircle className="w-5 h-5 text-orange-200" />
             </div>
            <CardContent className="p-5">
              <div className="text-center">
                <div className="text-4xl font-black text-orange-600">{currentMetrics.anomalies}</div>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Flagged Anomalies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">Centre Performance Tracking</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search centres..." 
                    className="pl-9 bg-white shadow-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-semibold text-slate-700">Centre Info</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Total</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Present</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Enrolled</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right pr-6">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCentres.length > 0 ? (
                          filteredCentres.map((centre) => (
                            <TableRow key={centre.id} className="hover:bg-slate-50 border-b border-slate-100">
                              <TableCell>
                                <div className="font-medium text-slate-900">{centre.name}</div>
                                <div className="font-mono text-xs text-slate-500 mt-0.5">{centre.id}</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={cn(
                                  "text-xs",
                                  centre.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                                )}>
                                  {centre.status === "active" ? "Online" : "Offline"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium">{centre.candidates}</TableCell>
                              <TableCell className="text-center font-bold text-blue-600">{centre.present}</TableCell>
                              <TableCell className="text-center font-bold text-purple-600">{centre.enrolled}</TableCell>
                              <TableCell className="pr-6">
                                <div className="flex flex-col gap-1.5 items-end">
                                  <span className="text-xs font-bold text-slate-700">{centre.progress}%</span>
                                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden self-end">
                                    <div 
                                      className={cn("h-full rounded-full transition-all", centre.progress > 80 ? "bg-emerald-500" : centre.progress > 50 ? "bg-blue-500" : "bg-slate-300")}
                                      style={{width: `${centre.progress}%`}}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                              No centres found matching your search.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
           </div>

           <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Overall Progress</h2>
                <Card className="shadow-sm border-slate-200">
                  <CardContent className="p-6 space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-semibold text-slate-700">Global Exam Completion</span>
                        <span className="text-3xl font-black text-emerald-600">{currentMetrics.completionPct}%</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all rounded-full" 
                          style={{width: `${currentMetrics.completionPct}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-right">
                        Based on biometric enrollments vs total candidates
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Centres Online</div>
                        <div className="text-xl font-bold text-slate-900">{currentMetrics.activeCentres} / {currentMetrics.totalCentres}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Operators</div>
                        <div className="text-xl font-bold text-slate-900">{currentMetrics.activeOperators} / {currentMetrics.totalOperators}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Recent Alerts</h2>
                <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 flex gap-3 hover:bg-slate-50 transition-colors">
                          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Low Face Match Confidence</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Centre: DL-015 • Roll No: 202500{i}</p>
                            <p className="text-xs font-medium text-orange-700 mt-1">Score: {65 + i}% - Operator Override applied</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                      <Button variant="link" className="text-sm text-blue-600 h-auto p-0">View All {currentMetrics.anomalies} Anomalies</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}