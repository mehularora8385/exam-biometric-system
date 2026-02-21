import React from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Fingerprint, ArrowLeft, ScanLine, Calendar, Users, MapPin, SearchCode, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ExamActions() {
  const { state } = useAppStore();
  const [, setLocation] = useLocation();

  if (!state.selectedExam) {
    setLocation("/");
    return null;
  }

  // Calculate statistics
  const total = state.candidates.length;
  const round1 = state.attendance.length;
  const round2 = state.registrations.length;
  const round1Progress = total > 0 ? (round1 / total) * 100 : 0;
  const round2Progress = total > 0 ? (round2 / total) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        className="gap-2 -ml-3 text-slate-500 hover:text-slate-900"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>

      <Card className="border-t-4 border-t-primary shadow-sm bg-white overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="space-y-4 flex-1">
              <div>
                <Badge variant={state.selectedExam.type === "MOCK" ? "secondary" : "default"} className={state.selectedExam.type === "MOCK" ? "bg-orange-100 text-orange-800 hover:bg-orange-100 mb-3" : "mb-3"}>
                  {state.selectedExam.type === "MOCK" ? "MOCK SERVER" : "PRODUCTION"}
                </Badge>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{state.selectedExam.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary/70" /> {state.selectedExam.date}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary/70" /> {total} Candidates</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary/70" /> DEL001</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 md:w-1/3 shrink-0 z-10">
               <div className="flex-1 bg-blue-50/80 border border-blue-100 rounded-xl p-3 shadow-sm">
                 <div className="text-xs text-slate-600 font-semibold mb-1">Round 1 (Gate)</div>
                 <div className="text-2xl font-bold text-blue-700">{round1} <span className="text-sm font-normal text-slate-500">/ {total}</span></div>
               </div>
               <div className="flex-1 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 shadow-sm">
                 <div className="text-xs text-slate-600 font-semibold mb-1">Round 2 (Bio)</div>
                 <div className="text-2xl font-bold text-emerald-700">{round2} <span className="text-sm font-normal text-slate-500">/ {total}</span></div>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Round 1 Card */}
        <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md border border-slate-200" onClick={() => setLocation("/round-one")}>
          <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-slate-900 group-hover:text-primary transition-colors">Round 1</CardTitle>
                <CardDescription className="text-sm mt-1 font-medium">Gate Entry Verification</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-sm text-slate-700 items-start">
                <div className="mt-0.5 bg-slate-100 p-1 rounded-md"><SearchCode className="w-4 h-4 text-slate-500" /></div>
                <span className="leading-snug">Scan Candidate Barcode or QR Code from Admit Card</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-700 items-start">
                <div className="mt-0.5 bg-slate-100 p-1 rounded-md"><ScanLine className="w-4 h-4 text-slate-500" /></div>
                <span className="leading-snug">Verify Roll Number & Face with registered photo</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-700 items-start">
                <div className="mt-0.5 bg-slate-100 p-1 rounded-md"><Calendar className="w-4 h-4 text-slate-500" /></div>
                <span className="leading-snug">Mark Attendance with secure Timestamp</span>
              </li>
            </ul>
            
            <div className="space-y-2 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 uppercase tracking-wider">Completion</span>
                <span className="text-blue-700">{Math.round(round1Progress)}%</span>
              </div>
              <Progress value={round1Progress} className="h-2 bg-blue-100/50" />
            </div>

            <Button className="w-full h-12 text-base shadow-sm group-hover:bg-primary group-hover:shadow-md transition-all">
              Start Gate Entry <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Round 2 Card */}
        <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md border border-slate-200" onClick={() => setLocation("/round-two")}>
          <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-slate-900 group-hover:text-primary transition-colors">Round 2</CardTitle>
                <CardDescription className="text-sm mt-1 font-medium">Biometric Registration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-sm text-slate-700 items-start">
                <div className="mt-0.5 bg-slate-100 p-1 rounded-md"><Fingerprint className="w-4 h-4 text-slate-500" /></div>
                <span className="leading-snug">Capture Left Thumb Impression (LTI) via scanner</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-700 items-start">
                <div className="mt-0.5 bg-slate-100 p-1 rounded-md"><ScanLine className="w-4 h-4 text-slate-500" /></div>
                <span className="leading-snug">Capture Live Photograph with background check</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-700 items-start">
                <div className="mt-0.5 bg-slate-100 p-1 rounded-md"><Users className="w-4 h-4 text-slate-500" /></div>
                <span className="leading-snug">AI Face Matching Verification against ID Proof</span>
              </li>
            </ul>

            <div className="space-y-2 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 uppercase tracking-wider">Completion</span>
                <span className="text-emerald-700">{Math.round(round2Progress)}%</span>
              </div>
              <Progress value={round2Progress} className="h-2 bg-emerald-100/50" />
            </div>

            <Button className="w-full h-12 text-base shadow-sm group-hover:bg-primary group-hover:shadow-md transition-all">
              Start Biometric Scan <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
