import React, { useState } from "react";
import { useAppStore, Candidate } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, CheckCircle2, ScanLine, Clock, Calendar, Users, MapPin, XCircle, SearchCode, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoundOne() {
  const { state, markAttendance } = useAppStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);

  if (!state.selectedExam) {
    setLocation("/");
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = state.candidates.find(c => 
      c.applicationNo === searchQuery || c.rollNo === searchQuery
    );
    
    if (found) {
      setCandidate(found);
    } else {
      setCandidate(null);
      toast({
        title: "Candidate Not Found",
        description: `No record matches ID: ${searchQuery}`,
        variant: "destructive",
      });
    }
  };

  const handleMarkAttendance = async () => {
    if (!candidate) return;
    setLoading(true);
    try {
      await markAttendance(candidate.applicationNo);
      toast({
        title: "Verification Successful",
        description: `${candidate.name} marked Present at Gate.`,
      });
      setSearchQuery("");
      setCandidate(null);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const existingAttendance = candidate ? state.attendance.find(a => a.applicationNo === candidate.applicationNo) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        className="gap-2 -ml-3 text-slate-500 hover:text-slate-900"
        onClick={() => setLocation("/exam-actions")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Exam Phases
      </Button>

      <Card className="border-t-4 border-t-blue-600 shadow-sm bg-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
         
         <CardContent className="p-6">
           <div className="flex gap-4 items-start">
             <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <ScanLine className="w-7 h-7" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 leading-tight">Round 1: Gate Entry</h1>
               <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-600/70" /> {state.selectedExam.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-600/70" /> Gate A, DEL001</span>
                  <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <CheckCircle2 className="w-4 h-4" /> {state.attendance.length} Verified
                  </span>
               </div>
             </div>
           </div>
         </CardContent>
      </Card>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <SearchCode className="w-5 h-5 text-blue-600" /> Scanner Input
              </CardTitle>
              <CardDescription>Scan barcode from admit card</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    placeholder="Scan or enter Roll Number..." 
                    className="text-lg h-14 font-mono shadow-sm border-slate-300 focus-visible:ring-blue-600"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 text-center">Cursor must be in this field when scanning</p>
                </div>
                <Button type="submit" size="lg" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-base shadow-sm">
                  Lookup Candidate
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Quick Stats or Instructions */}
          {!candidate && (
             <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm text-slate-600 space-y-3">
               <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                 <ScanLine className="w-4 h-4" /> Scanning Instructions
               </h3>
               <ul className="space-y-2">
                 <li className="flex gap-2"><span className="text-blue-600">•</span> Ensure admit card barcode is flat and well-lit.</li>
                 <li className="flex gap-2"><span className="text-blue-600">•</span> Hold scanner 4-6 inches away from the paper.</li>
                 <li className="flex gap-2"><span className="text-blue-600">•</span> If scanning fails, manually type the 10-digit Roll No.</li>
               </ul>
             </div>
          )}
        </div>

        <div className="md:col-span-7">
          {candidate ? (
            <Card className="overflow-hidden border-2 border-blue-200 shadow-md animate-in slide-in-from-right-8 duration-300">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 border-b border-blue-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left relative overflow-hidden">
                {/* ID Card styling element */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <UserCheck className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg rounded-xl">
                    <AvatarImage src={candidate.photoUrl} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-blue-100 text-blue-700">{candidate.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap uppercase tracking-wider">
                    Registered Photo
                  </div>
                </div>
                
                <div className="space-y-4 flex-1 z-10 w-full mt-2">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
                    <Badge variant="outline" className="mt-1 bg-white border-slate-300 font-mono text-xs">DOB: 12/04/1998</Badge>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm space-y-2 w-full text-left">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Application No</span>
                      <span className="font-mono font-bold text-slate-900">{candidate.applicationNo}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Roll No</span>
                      <span className="font-mono font-bold text-blue-700 text-lg">{candidate.rollNo}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 bg-white">
                {existingAttendance ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-xl border-2 border-emerald-200 text-emerald-800">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">Gate Entry Approved</h3>
                    <p className="text-emerald-700/80 flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4" /> Verified at {new Date(existingAttendance.timestamp).toLocaleTimeString()}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      onClick={() => {
                        setCandidate(null);
                        setSearchQuery("");
                      }}
                    >
                      Scan Next Candidate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-4 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-sm">
                      <UserCheck className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold mb-1">Operator Verification Required</p>
                        <p>Verify the candidate's face matches the registered photograph above before allowing entry.</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleMarkAttendance} 
                      className="w-full h-16 text-xl gap-2 shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? "Recording Entry..." : (
                        <><CheckCircle2 className="w-6 h-6" /> Match Confirmed - Allow Entry</>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full text-slate-500 hover:text-slate-700"
                      onClick={() => {
                        setCandidate(null);
                        setSearchQuery("");
                      }}
                    >
                      Cancel / Rescan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-8 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <SearchCode className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Awaiting Scan</h3>
              <p className="max-w-sm text-sm leading-relaxed">
                Scan a candidate's admit card barcode to display their profile and verify their gate entry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
