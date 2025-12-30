import React from "react";
import { useAppStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, PlayCircle, Calendar, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
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
    // Based on workflow, selecting exam leads to exam actions
    setLocation("/exam-actions");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exam Dashboard</h1>
          <p className="text-slate-500 mt-1">Select an assigned exam to proceed</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.exams.map((exam) => {
          const isDownloaded = state.isDownloaded; // Simplified: in real app, check per exam
          
          return (
            <Card key={exam.id} className={cn(
              "overflow-hidden transition-all hover:shadow-md border-t-4",
              exam.type === "MOCK" ? "border-t-orange-400" : "border-t-primary"
            )}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={exam.type === "MOCK" ? "secondary" : "default"} className="mb-2">
                    {exam.type === "MOCK" ? "MOCK DRILL" : "LIVE EXAM"}
                  </Badge>
                  {isDownloaded && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                <CardTitle className="line-clamp-2 min-h-[3rem]">{exam.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4" /> {exam.date}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                    <span>{exam.centerCode}</span>
                  </div>
                  <div className="pl-6 text-xs text-slate-500">
                    {exam.roomDetails}
                  </div>
                </div>

                {isDownloaded ? (
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={() => handleStartExam(exam)}
                  >
                    <PlayCircle className="w-4 h-4" /> Enter Exam Mode
                  </Button>
                ) : (
                  <Button 
                    className="w-full gap-2" 
                    variant="outline" 
                    size="lg"
                    disabled={!!downloading}
                    onClick={() => handleDownload(exam.id)}
                  >
                    {downloading === exam.id ? (
                      "Downloading..."
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download Data
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!state.isDownloaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 items-start text-blue-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Internet Connection Required</p>
            <p>You must download the exam data while connected to the internet. Once downloaded, the application will operate fully offline.</p>
          </div>
        </div>
      )}
    </div>
  );
}
