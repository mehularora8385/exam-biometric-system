import React, { useState } from "react";
import { useAppStore, Candidate } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, CheckCircle2, Camera, Fingerprint, FileSpreadsheet, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/camera-capture";
import { FingerprintCapture } from "@/components/fingerprint-capture";

type Step = "search" | "biometrics" | "omr" | "success";

export default function RoundTwo() {
  const { state, registerCandidate } = useAppStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [fingerprintHash, setFingerprintHash] = useState<string | null>(null);
  const [omrCode, setOmrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [integrityAlert, setIntegrityAlert] = useState<string | null>(null);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const handleCapturePhoto = (imageSrc: string) => {
    // Simulate Face Integrity Check & Match Score
    const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    setFaceMatchScore(randomScore);

    if (randomScore < 75) { // Threshold
      setShowApprovalDialog(true);
      setCapturedPhoto(imageSrc);
    } else if (Math.random() > 0.95) {
      setIntegrityAlert("Invalid Photo – Human Face Not Detected");
      setCapturedPhoto(null);
      setShowApprovalDialog(false);
    } else {
      setIntegrityAlert(null);
      setCapturedPhoto(imageSrc);
      setShowApprovalDialog(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = state.candidates.find(c => 
      c.applicationNo === searchQuery || c.rollNo === searchQuery
    );
    
    if (found) {
      setCandidate(found);
      
      // Check if already registered
      if (state.registrations.find(r => r.applicationNo === found.applicationNo)) {
         toast({
          title: "Warning",
          description: "This candidate is already registered in Round 2",
          variant: "destructive"
        });
        // We could block here, but for now let's show details
      }
    } else {
      toast({
        title: "Not Found",
        description: "No candidate found",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!candidate || !capturedPhoto || !fingerprintHash || !omrCode) {
      toast({ title: "Error", description: "Missing required data", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await registerCandidate({
        applicationNo: candidate.applicationNo,
        photoUrl: capturedPhoto,
        fingerprintHash,
        omrCode,
        timestamp: new Date().toISOString(),
        operatorId: state.operator?.id || "unknown",
        roomId: "ROOM-101" // Mock
      });
      setStep("success");
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCandidate(null);
    setSearchQuery("");
    setCapturedPhoto(null);
    setFingerprintHash(null);
    setOmrCode("");
    setStep("search");
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-12 animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Registration Complete</h2>
          <p className="text-slate-500">Candidate successfully enrolled and OMR mapped.</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Name:</span>
            <span className="font-medium">{candidate?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">OMR:</span>
            <span className="font-mono font-medium">{omrCode}</span>
          </div>
        </div>
        <Button onClick={resetFlow} size="lg" className="w-full">Next Candidate</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Button variant="ghost" size="icon" onClick={() => step === "search" ? setLocation("/exam-actions") : setStep("search")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Round 2: Enrollment</h1>
          <p className="text-sm text-slate-500">Biometrics & OMR Mapping</p>
        </div>
      </div>

      {step === "search" && (
        <div className="space-y-6">
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
             <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-slate-50 p-6 flex items-start gap-4 border-b border-slate-100">
                  <Avatar className="w-16 h-16 border border-white shadow-sm">
                    <AvatarImage src={candidate.photoUrl} />
                    <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{candidate.name}</h3>
                    <p className="text-sm text-slate-500 font-mono">{candidate.applicationNo}</p>
                  </div>
               </div>
               <CardContent className="p-6">
                  <Button onClick={() => setStep("biometrics")} className="w-full h-12 text-lg">
                    Proceed to Capture
                  </Button>
               </CardContent>
             </Card>
          )}
        </div>
      )}

      {step === "biometrics" && candidate && (
        <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-right duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Live Photo
                </div>
                {integrityAlert && (
                  <Badge variant="destructive" className="text-[10px]">Alert</Badge>
                )}
                {faceMatchScore !== null && !showApprovalDialog && !integrityAlert && (
                  <Badge variant={faceMatchScore >= 75 ? "default" : "destructive"} className="text-[10px]">
                    {faceMatchScore}% Match
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {integrityAlert && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm animate-in fade-in">
                  <p className="font-semibold">{integrityAlert}</p>
                  <p className="text-xs mt-1">Please ensure candidate's face is clearly visible and well-lit.</p>
                </div>
              )}
              {showApprovalDialog && (
                 <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg mb-4 text-sm animate-in fade-in space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="font-bold text-lg text-orange-600">{faceMatchScore}%</div>
                      <div>
                        <p className="font-semibold">FACE NOT MATCHED</p>
                        <p className="text-xs mt-0.5 opacity-80">Required threshold: 75%</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                       <Button size="sm" variant="outline" className="flex-1 bg-white" onClick={() => { setShowApprovalDialog(false); setCapturedPhoto(null); }}>
                         Re-Capture
                       </Button>
                       <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setShowApprovalDialog(false)}>
                         Approve & Continue
                       </Button>
                    </div>
                 </div>
              )}
              {!showApprovalDialog && (
                <CameraCapture onCapture={handleCapturePhoto} label="Capture Candidate" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" /> Fingerprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FingerprintCapture onCapture={setFingerprintHash} />
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex justify-end">
            <Button 
              size="lg" 
              disabled={!capturedPhoto || !fingerprintHash}
              onClick={() => setStep("omr")}
            >
              Next: OMR Mapping
            </Button>
          </div>
        </div>
      )}

      {step === "omr" && candidate && (
        <Card className="max-w-lg mx-auto animate-in slide-in-from-right duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" /> Map OMR Sheet
            </CardTitle>
            <CardDescription>Scan the barcode on the OMR sheet or enter manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-8 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center flex-col text-slate-500 gap-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setOmrCode("OMR-" + Math.floor(Math.random() * 100000))}>
              <div className="w-12 h-1 bg-red-400/50 mb-1"></div>
              <div className="w-16 h-12 border-2 border-slate-400 rounded flex items-center justify-center">
                <span className="text-xs">BARCODE</span>
              </div>
              <p className="text-sm font-medium">Tap to simulate Scan</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">OMR Serial Number</label>
              <Input 
                value={omrCode} 
                onChange={e => setOmrCode(e.target.value)} 
                placeholder="Scan or type OMR Number"
                className="font-mono text-lg"
              />
            </div>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleSubmit}
              disabled={!omrCode || loading}
            >
              {loading ? <span className="animate-spin">⏳</span> : <Save className="w-4 h-4" />}
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
