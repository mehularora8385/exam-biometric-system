import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fingerprint, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FingerprintCaptureProps {
  onCapture: (hash: string) => void;
}

export function FingerprintCapture({ onCapture }: FingerprintCaptureProps) {
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setStatus("scanning");
    setProgress(0);

    // Simulate scanning process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatus("success");
        onCapture("fp_hash_" + Math.random().toString(36).substring(7));
      }
    }, 50); // 1 second total
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div className={cn(
        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative",
        status === "idle" && "bg-slate-200 text-slate-400",
        status === "scanning" && "bg-blue-100 text-blue-500 ring-4 ring-blue-100",
        status === "success" && "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-100",
        status === "error" && "bg-red-100 text-red-500"
      )}>
        {status === "scanning" && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-blue-500 transition-all duration-200"
              strokeDasharray="289.026"
              strokeDashoffset={289.026 - (289.026 * progress) / 100}
            />
          </svg>
        )}
        
        {status === "success" ? (
          <CheckCircle2 className="w-10 h-10 animate-in zoom-in" />
        ) : (
          <Fingerprint className={cn("w-10 h-10", status === "scanning" && "animate-pulse")} />
        )}
      </div>

      <div className="text-center space-y-1">
        <h3 className="font-medium text-slate-900">
          {status === "idle" && "Ready to Scan"}
          {status === "scanning" && "Scanning Fingerprint..."}
          {status === "success" && "Scan Complete"}
          {status === "error" && "Scan Failed"}
        </h3>
        <p className="text-sm text-slate-500">
          {status === "idle" && "Place candidate's finger on the sensor"}
          {status === "scanning" && "Please hold still"}
          {status === "success" && "Fingerprint captured successfully"}
        </p>
      </div>

      {status !== "success" && (
        <Button 
          onClick={startScan} 
          disabled={status === "scanning"}
          variant={status === "error" ? "destructive" : "default"}
          className="w-full max-w-[200px]"
        >
          {status === "error" ? "Retry Scan" : "Start Scan"}
        </Button>
      )}
      
      {status === "success" && (
        <Button 
          onClick={() => setStatus("idle")} 
          variant="outline"
          className="w-full max-w-[200px]"
        >
          Rescan
        </Button>
      )}
    </div>
  );
}
