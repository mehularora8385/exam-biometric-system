import React from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Fingerprint, ArrowLeft } from "lucide-react";

export default function ExamActions() {
  const { state } = useAppStore();
  const [, setLocation] = useLocation();

  if (!state.selectedExam) {
    setLocation("/");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{state.selectedExam.name}</h1>
          <p className="text-slate-500">Select the operation phase to proceed</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation("/round-one")}>
          <CardHeader>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserCheck className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl">Round 1: Gate Entry</CardTitle>
            <CardDescription>
              Main Gate Attendance Verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
              <li>Verify Application No / Roll No</li>
              <li>Check Photo Identity</li>
              <li>Mark Attendance (Present/Absent)</li>
              <li>Gate Entry Pass Check</li>
            </ul>
            <Button className="w-full mt-6 group-hover:bg-primary/90">Start Gate Entry</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation("/round-two")}>
          <CardHeader>
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Fingerprint className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl">Round 2: Enrollment</CardTitle>
            <CardDescription>
              Classroom Biometric Registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
              <li>Biometric Capture (Fingerprint)</li>
              <li>Live Photo Capture</li>
              <li>OMR Sheet Mapping</li>
              <li>Final Seat Allocation</li>
            </ul>
            <Button className="w-full mt-6 group-hover:bg-primary/90">Start Enrollment</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
        <strong>Note:</strong> Ensure you are in the correct location (Gate vs Classroom) before selecting the mode. Data is logged separately for each round.
      </div>
    </div>
  );
}
