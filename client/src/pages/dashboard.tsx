import React, { useState } from "react";
import { useAppStore, Exam } from "@/lib/store";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, PlayCircle, Calendar, MapPin, CheckCircle2, AlertCircle, Users, Clock, FileCheck, RefreshCw, Power, List, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { state, downloadData, selectExam, logout } = useAppStore();
  const [, setLocation] = useLocation();
  
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string>("DL-015");
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [examToDownload, setExamToDownload] = useState<Exam | null>(null);
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");

  const handleOpenDownload = (exam: Exam) => {
    setExamToDownload(exam);
    setIsDownloadDialogOpen(true);
  };

  const handleConfirmDownload = async () => {
    if (!examToDownload) return;
    setIsDownloadDialogOpen(false);
    setDownloading(examToDownload.id);
    // Simulating downloading only the selected center data
    await downloadData(examToDownload.id);
    setDownloading(null);
  };

  const handleStartExam = (exam: Exam) => {
    selectExam(exam);
    setLocation("/exam-actions");
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  // Filter candidates for roster based on search
  const filteredCandidates = state.candidates.filter(c => 
    c.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
    c.rollNo.includes(rosterSearch) ||
    c.applicationNo.includes(rosterSearch)
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <Card className="border-t-4 border-t-primary shadow-sm bg-white overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md bg-white">
                <AvatarImage src={state.operator?.photoUrl} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {state.operator?.name?.charAt(0) || "O"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Welcome, {state.operator?.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                  <Badge variant="outline" className="font-mono text-xs bg-slate-50 border-slate-200 text-slate-700 px-2 py-0.5">
                    ID: {state.operator?.id}
                  </Badge>
                  <span className="flex items-center gap-1.5 font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                    <MapPin className="w-3.5 h-3.5" /> Active Centre: {selectedCenter}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[220px] w-full md:w-auto">
               <div className="flex items-center justify-between text-sm p-3 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-sm">
                 <span className="flex items-center gap-2 font-medium"><RefreshCw className="w-4 h-4 text-slate-400" /> Auto-Sync</span>
                 <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                   <CheckCircle2 className="w-4 h-4" /> Active
                 </span>
               </div>
               <Button variant="outline" className="w-full text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors" onClick={handleLogout}>
                 <Power className="w-4 h-4 mr-2" /> End Session
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-10 mb-2 gap-4">
         <div>
           <h2 className="text-2xl font-bold text-slate-900">Assigned Examinations</h2>
           <p className="text-slate-500 text-sm mt-1">Select an exam to download center data or start verification.</p>
         </div>
         <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 shadow-sm">
           <MapPin className="w-3.5 h-3.5 mr-1.5" /> Filtering for: {selectedCenter}
         </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {state.exams.map((exam) => {
          const isDownloaded = state.isDownloaded && state.candidates.length > 0;
          const candidateCount = state.candidates.length;
          const registeredCount = state.registrations.length;
          
          return (
            <Card key={exam.id} className={cn(
              "overflow-hidden transition-all duration-300 hover:shadow-lg border-2 flex flex-col",
              exam.type === "MOCK" ? "border-orange-200 shadow-orange-100/50" : "border-slate-200",
              isDownloaded ? "ring-1 ring-emerald-500/20" : ""
            )}>
              <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={exam.type === "MOCK" ? "secondary" : "default"} className={cn(
                    "px-2.5 py-1 text-xs font-bold tracking-wide",
                    exam.type === "MOCK" ? "bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200" : "bg-blue-600"
                  )}>
                    {exam.type === "MOCK" ? "MOCK SERVER" : "PRODUCTION"}
                  </Badge>
                  {isDownloaded && (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 flex items-center gap-1.5 px-2.5 py-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5"/> Data Ready
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl leading-tight text-slate-900">{exam.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {exam.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> 09:00 AM</span>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 shadow-sm relative overflow-hidden group">
                     <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative z-10">
                       <div className="text-3xl font-black text-slate-900">{isDownloaded ? candidateCount : "---"}</div>
                       <div className="text-xs text-slate-500 font-semibold mt-1.5 uppercase tracking-wider">Center Candidates</div>
                     </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 shadow-sm relative overflow-hidden group">
                     <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative z-10">
                       <div className="text-3xl font-black text-slate-900">{isDownloaded ? registeredCount : "---"}</div>
                       <div className="text-xs text-slate-500 font-semibold mt-1.5 uppercase tracking-wider">Verified Today</div>
                     </div>
                  </div>
                </div>

                {isDownloaded ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="w-full gap-2 h-12 text-base shadow-md bg-emerald-600 hover:bg-emerald-700 transition-all" 
                      onClick={() => handleStartExam(exam)}
                    >
                      <PlayCircle className="w-5 h-5" /> Start Verification
                    </Button>
                    <Dialog open={isRosterOpen} onOpenChange={setIsRosterOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2 h-12 text-base border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm">
                          <List className="w-5 h-5" /> View Roster
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" /> Center Roster: {selectedCenter}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                              Showing downloaded candidates and roll numbers for this center.
                            </DialogDescription>
                          </div>
                          <Badge variant="outline" className="bg-white px-3 py-1 font-mono text-base shadow-sm">
                            Total: {candidateCount}
                          </Badge>
                        </div>
                        
                        <div className="p-4 border-b border-slate-100 bg-white">
                          <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                              placeholder="Search by Name, Roll No, or App No..." 
                              className="pl-9 bg-slate-50 border-slate-200"
                              value={rosterSearch}
                              onChange={e => setRosterSearch(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="overflow-auto flex-1 p-0">
                          <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                              <TableRow>
                                <TableHead className="font-semibold text-slate-700">Roll No.</TableHead>
                                <TableHead className="font-semibold text-slate-700">Application No.</TableHead>
                                <TableHead className="font-semibold text-slate-700">Candidate Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredCandidates.length > 0 ? (
                                filteredCandidates.map((c, idx) => (
                                  <TableRow key={idx} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono font-medium text-slate-900">{c.rollNo}</TableCell>
                                    <TableCell className="font-mono text-slate-500 text-xs">{c.applicationNo}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>
                                      {c.verificationStatus === "PENDING" ? (
                                        <Badge variant="outline" className="bg-slate-50 text-slate-600">Pending</Badge>
                                      ) : c.verificationStatus === "GATE_ENTRY" ? (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Gate Entry</Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Verified</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                    No candidates found matching your search.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Button 
                    className="w-full gap-2 h-12 text-base border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 shadow-sm transition-all" 
                    variant="outline" 
                    disabled={!!downloading}
                    onClick={() => handleOpenDownload(exam)}
                  >
                    {downloading === exam.id ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Fetching Center Data...</>
                    ) : (
                      <><Download className="w-5 h-5" /> Download Center Data</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Center Selection & Download Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Download className="w-5 h-5 text-blue-600" /> Download Center Data
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Select your operating center to fetch the assigned candidates and roll numbers for this exam.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <h4 className="font-semibold text-slate-900">{examToDownload?.name}</h4>
               <p className="text-sm text-slate-500">{examToDownload?.type === 'MOCK' ? 'Mock Test Environment' : 'Production Environment'}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-600">Select Operating Center</label>
              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select a center..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DL-015">DL-015: New Delhi Main Campus</SelectItem>
                  <SelectItem value="DL-016">DL-016: North Delhi Test Center</SelectItem>
                  <SelectItem value="DL-017">DL-017: South Extension Hub</SelectItem>
                  <SelectItem value="MH-001">MH-001: Mumbai Central</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> You will only download data for this specific center.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmDownload}>
              <Download className="w-4 h-4 mr-2" /> Start Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
