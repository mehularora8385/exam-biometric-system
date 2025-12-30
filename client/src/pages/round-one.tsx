import React, { useState } from "react";
import { useAppStore, Candidate } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoundOne() {
  const { state, markAttendance } = useAppStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = state.candidates.find(c => 
      c.applicationNo === searchQuery || c.rollNo === searchQuery
    );
    
    if (found) {
      setCandidate(found);
    } else {
      setCandidate(null);
      toast({
        title: "Not Found",
        description: "No candidate found with this ID",
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
        title: "Success",
        description: `Marked ${candidate.name} as Present`,
      });
      setSearchQuery("");
      setCandidate(null);
      // Auto focus back to search would go here
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const existingAttendance = candidate ? state.attendance.find(a => a.applicationNo === candidate.applicationNo) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/exam-actions")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gate Entry Check</h1>
          <p className="text-sm text-slate-500">Scan or enter Application Number</p>
        </div>
      </div>

      <Card className="border-2 border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              placeholder="Enter Application or Roll No" 
              className="text-lg h-12"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button type="submit" size="lg" className="h-12 w-24">
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {candidate && (
        <Card className="overflow-hidden border-2 border-slate-200 animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <Avatar className="w-32 h-32 border-4 border-white shadow-sm rounded-xl">
              <AvatarImage src={candidate.photoUrl} className="object-cover" />
              <AvatarFallback className="text-4xl">{candidate.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold">{candidate.name}</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600">
                <div>
                  <span className="block text-slate-400 text-xs uppercase tracking-wider">Application No</span>
                  <span className="font-mono font-medium text-base text-slate-900">{candidate.applicationNo}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs uppercase tracking-wider">Roll No</span>
                  <span className="font-mono font-medium text-base text-slate-900">{candidate.rollNo}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 bg-white">
            {existingAttendance ? (
              <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-600" />
                <h3 className="text-xl font-bold">Already Checked In</h3>
                <p className="text-sm opacity-80 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {new Date(existingAttendance.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleMarkAttendance} 
                className="w-full h-16 text-xl gap-2 shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? "Processing..." : "Mark Present & Allow Entry"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
