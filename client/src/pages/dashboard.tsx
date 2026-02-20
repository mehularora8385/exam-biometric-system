import React from "react";
import { useAppStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlayCircle, Calendar, MapPin, CheckCircle2, AlertCircle, Users, Clock, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { state, downloadData, selectExam } = useAppStore();
  const [, setLocation] = useLocation();
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownload = async (examId: string) => {
    setDownloading(examId);
    await downloadData(examId);
    setDownloading(null);
  };

  const handleStartExam = (exam: any) => {
    selectExam(exam);
    setLocation("/exam-actions");
  };

  // Get candidate status
  const getCandidateStatus = (appNo: string) => {
    const registered = state.registrations.find(r => r.applicationNo === appNo);
    const attended = state.attendance.find(a => a.applicationNo === appNo);
    
    if (registered) return { status: "Enrolled", color: "bg-emerald-100 text-emerald-700", icon: "✓" };
    if (attended) return { status: "Gate Entry", color: "bg-blue-100 text-blue-700", icon: "→" };
    return { status: "Pending", color: "bg-slate-100 text-slate-600", icon: "◯" };
  };

  const isAdmin = state.operator?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exam Dashboard</h1>
          <p className="text-slate-500 mt-1">Select an assigned exam to proceed</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
              onClick={() => setLocation("/centre-dashboard")}
            >
              <MapPin className="w-4 h-4" /> Centre Monitor
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 border-slate-200 hover:bg-slate-50"
              onClick={() => setLocation("/admin-panel")}
            >
              <Users className="w-4 h-4" /> Admin Panel
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {state.exams.map((exam) => {
          const isDownloaded = state.isDownloaded;
          const candidateCount = state.candidates.length;
          
          return (
            <Card key={exam.id} className={cn(
              "overflow-hidden transition-all hover:shadow-md border-t-4",
              exam.type === "MOCK" ? "border-t-orange-400" : "border-t-primary"
            )}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={exam.type === "MOCK" ? "secondary" : "default"} className="mb-2">
                    {exam.type === "MOCK" ? "MOCK" : "LIVE"}
                  </Badge>
                  {isDownloaded && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                <CardTitle className="line-clamp-2 min-h-[3rem] text-base">{exam.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <Calendar className="w-3 h-3" /> {exam.date}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded text-center">
                  <div className="font-bold text-lg text-primary">{candidateCount}</div>
                  <div className="text-xs text-slate-500">Students Downloaded</div>
                </div>

                {isDownloaded ? (
                  <Button 
                    className="w-full gap-2 text-xs h-9" 
                    onClick={() => handleStartExam(exam)}
                  >
                    <PlayCircle className="w-3 h-3" /> Enter Exam
                  </Button>
                ) : (
                  <Button 
                    className="w-full gap-2 text-xs h-9" 
                    variant="outline" 
                    disabled={!!downloading}
                    onClick={() => handleDownload(exam.id)}
                  >
                    {downloading === exam.id ? (
                      "Downloading..."
                    ) : (
                      <>
                        <Download className="w-3 h-3" /> Download Data
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.isDownloaded && state.candidates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Downloaded Candidates ({state.candidates.length})
            </h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <FileCheck className="w-3 h-3" /> {state.registrations.length} Enrolled
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" /> {state.attendance.length} Gate Entry
              </Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">Photo</TableHead>
                      <TableHead className="text-xs font-semibold">Name</TableHead>
                      <TableHead className="text-xs font-semibold">App No</TableHead>
                      <TableHead className="text-xs font-semibold">Roll No</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.candidates.map((candidate) => {
                      const statusInfo = getCandidateStatus(candidate.applicationNo);
                      return (
                        <TableRow key={candidate.applicationNo} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell>
                            <Avatar className="h-8 w-8 border border-slate-200">
                              <AvatarImage src={candidate.photoUrl} className="object-cover" />
                              <AvatarFallback className="text-xs">{candidate.name[0]}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium text-sm text-slate-900">{candidate.name}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">{candidate.applicationNo}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">{candidate.rollNo}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn("text-xs font-semibold", statusInfo.color)}>
                              {statusInfo.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{state.candidates.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Total Candidates</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{state.registrations.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Round 2 Complete</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{state.attendance.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Gate Entry Done</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!state.isDownloaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start text-blue-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Download Data First</p>
            <p>Click "Download Data" on an exam above to fetch the student list. Internet connection required for download only.</p>
          </div>
        </div>
      )}
    </div>
  );
}
