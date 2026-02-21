import React from "react";
import { useAppStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlayCircle, Calendar, MapPin, CheckCircle2, AlertCircle, Users, Clock, FileCheck, RefreshCw, Power } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { state, downloadData, selectExam, logout } = useAppStore();
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

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  // Get candidate status
  const getCandidateStatus = (appNo: string) => {
    const registered = state.registrations.find(r => r.applicationNo === appNo);
    const attended = state.attendance.find(a => a.applicationNo === appNo);
    
    if (registered) return { status: "Enrolled", color: "bg-emerald-100 text-emerald-700", icon: "✓" };
    if (attended) return { status: "Gate Entry", color: "bg-blue-100 text-blue-700", icon: "→" };
    return { status: "Pending", color: "bg-slate-100 text-slate-600", icon: "◯" };
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-primary shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={state.operator?.photoUrl} />
                <AvatarFallback className="text-xl bg-primary/5 text-primary">
                  {state.operator?.name?.charAt(0) || "O"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {state.operator?.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Badge variant="outline" className="font-normal text-slate-600 bg-slate-50">{state.operator?.id}</Badge>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Centre: DEL001
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[200px]">
               <div className="flex items-center justify-between text-sm p-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                 <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Sync Status</span>
                 <span className="font-semibold">Synced just now</span>
               </div>
               <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 border-destructive/20" onClick={handleLogout}>
                 <Power className="w-4 h-4 mr-2" /> Secure Logout
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8">
         <h2 className="text-xl font-bold text-slate-900">Assigned Examinations</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.exams.map((exam) => {
          const isDownloaded = state.isDownloaded;
          const candidateCount = state.candidates.length;
          
          return (
            <Card key={exam.id} className={cn(
              "overflow-hidden transition-all hover:shadow-md border",
              exam.type === "MOCK" ? "border-orange-200" : "border-slate-200"
            )}>
              <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={exam.type === "MOCK" ? "secondary" : "default"} className={exam.type === "MOCK" ? "bg-orange-100 text-orange-800 hover:bg-orange-100" : ""}>
                    {exam.type === "MOCK" ? "MOCK SERVER" : "PRODUCTION"}
                  </Badge>
                  {isDownloaded && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Data Ready</Badge>}
                </div>
                <CardTitle className="line-clamp-2 min-h-[3rem] text-lg leading-tight">{exam.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> {exam.date}
                </div>
              </CardHeader>
              
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                     <div className="text-xl font-bold text-slate-900">{isDownloaded ? candidateCount : "---"}</div>
                     <div className="text-xs text-slate-500 font-medium mt-1">Total Candidates</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                     <div className="text-xl font-bold text-slate-900">{isDownloaded ? state.registrations.length : "---"}</div>
                     <div className="text-xs text-slate-500 font-medium mt-1">Verified Today</div>
                  </div>
                </div>

                {isDownloaded ? (
                  <Button 
                    className="w-full gap-2 h-11 text-base shadow-sm" 
                    onClick={() => handleStartExam(exam)}
                  >
                    <PlayCircle className="w-5 h-5" /> Start Verification
                  </Button>
                ) : (
                  <Button 
                    className="w-full gap-2 h-11 text-base border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" 
                    variant="outline" 
                    disabled={!!downloading}
                    onClick={() => handleDownload(exam.id)}
                  >
                    {downloading === exam.id ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Downloading Secure Data...</>
                    ) : (
                      <><Download className="w-5 h-5" /> Fetch Exam Data</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
