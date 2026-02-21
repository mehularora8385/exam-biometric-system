import React, { useState } from "react";
import { useAppStore, Candidate } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, CheckCircle2, Camera, Fingerprint, FileSpreadsheet, Save, SearchCode, AlertTriangle, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/camera-capture";
import { FingerprintCapture } from "@/components/fingerprint-capture";
import { Progress } from "@/components/ui/progress";

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

  if (!state.selectedExam) {
    setLocation("/");
    return null;
  }

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
    if (!searchQuery.trim()) return;

    const found = state.candidates.find(c => 
      c.applicationNo === searchQuery || c.rollNo === searchQuery
    );
    
    if (found) {
      setCandidate(found);
      
      // Check if already registered
      if (state.registrations.find(r => r.applicationNo === found.applicationNo)) {
         toast({
          title: "Candidate Already Registered",
          description: "This candidate has already completed Round 2 verification.",
          variant: "destructive"
        });
      }
    } else {
      setCandidate(null);
      toast({
        title: "Candidate Not Found",
        description: `No record matches ID: ${searchQuery}`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!candidate || !capturedPhoto || !fingerprintHash || !omrCode) {
      toast({ title: "Incomplete Data", description: "All biometric and OMR fields are required.", variant: "destructive" });
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
    setFaceMatchScore(null);
    setShowApprovalDialog(false);
    setIntegrityAlert(null);
    setStep("search");
  };

  // Step Progress Indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: "search", label: "Candidate Search", icon: SearchCode },
      { id: "biometrics", label: "Biometric Capture", icon: Fingerprint },
      { id: "omr", label: "OMR Mapping", icon: FileSpreadsheet }
    ];
    
    const currentIndex = steps.findIndex(s => s.id === step);
    if (step === "success") return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500" 
               style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>
          
          {steps.map((s, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            const Icon = s.icon;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200" : 
                  isCurrent ? "bg-white border-emerald-500 text-emerald-600 shadow-md shadow-emerald-100 scale-110" : 
                  "bg-white border-slate-300 text-slate-400"
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-semibold ${isCurrent ? "text-emerald-700" : isCompleted ? "text-slate-700" : "text-slate-400"} hidden sm:block absolute -bottom-6 whitespace-nowrap`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto text-center space-y-8 pt-12 animate-in zoom-in duration-500">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 bg-emerald-100 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-16 h-16" />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Complete</h2>
          <p className="text-slate-500 text-lg">Candidate securely enrolled and OMR mapped.</p>
        </div>
        
        <Card className="border border-emerald-100 shadow-sm bg-emerald-50/50">
           <CardContent className="p-6 text-left space-y-4">
             <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
               <span className="text-emerald-800/70 text-sm font-semibold uppercase tracking-wider">Candidate</span>
               <span className="font-bold text-emerald-950 text-lg">{candidate?.name}</span>
             </div>
             <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
               <span className="text-emerald-800/70 text-sm font-semibold uppercase tracking-wider">Roll No</span>
               <span className="font-mono font-bold text-emerald-950">{candidate?.rollNo}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-emerald-800/70 text-sm font-semibold uppercase tracking-wider">OMR Sheet</span>
               <Badge className="bg-emerald-600 font-mono text-sm px-3 py-1">{omrCode}</Badge>
             </div>
           </CardContent>
        </Card>
        
        <Button onClick={resetFlow} size="lg" className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 shadow-lg">
          Process Next Candidate <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Button 
        variant="ghost" 
        className="gap-2 -ml-3 text-slate-500 hover:text-slate-900"
        onClick={() => step === "search" ? setLocation("/exam-actions") : setStep("search")}
      >
        <ArrowLeft className="w-4 h-4" /> {step === "search" ? "Back to Exam Phases" : "Back to Search"}
      </Button>

      <Card className="border-t-4 border-t-emerald-500 shadow-sm bg-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
         
         <CardContent className="p-6">
           <div className="flex gap-4 items-start">
             <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Fingerprint className="w-7 h-7" />
             </div>
             <div className="flex-1">
               <div className="flex justify-between items-start">
                 <h1 className="text-2xl font-bold text-slate-900 leading-tight">Round 2: Enrollment</h1>
                 <Badge variant="outline" className="bg-slate-50 text-slate-600 font-mono">Room: 101</Badge>
               </div>
               <p className="text-slate-500 mt-1 font-medium text-sm">Biometric Capture & OMR Sheet Mapping</p>
             </div>
           </div>
         </CardContent>
      </Card>

      {renderStepIndicator()}

      {step === "search" && (
        <div className="grid md:grid-cols-12 gap-8">
           <div className="md:col-span-5 space-y-6">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <SearchCode className="w-5 h-5 text-emerald-600" /> Scan Admit Card
                  </CardTitle>
                  <CardDescription>Scan barcode or manually enter details</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Scan or enter Roll Number..." 
                        className="text-lg h-14 font-mono shadow-sm border-slate-300 focus-visible:ring-emerald-500"
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

              {/* Status context area */}
              {!candidate && (
                 <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100/50 text-sm text-slate-600">
                    <p className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Session Active
                    </p>
                    <p>Ready to process biometrics for {state.selectedExam.name}. Devices connected and ready.</p>
                 </div>
              )}
           </div>

           <div className="md:col-span-7">
              {candidate ? (
                 <Card className="overflow-hidden border-2 border-emerald-200 shadow-md animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
                   <div className="bg-gradient-to-br from-slate-50 to-emerald-50 p-6 border-b border-emerald-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left relative flex-1">
                     <div className="relative z-10">
                       <Avatar className="w-32 h-32 border-4 border-white shadow-lg rounded-xl">
                         <AvatarImage src={candidate.photoUrl} className="object-cover" />
                         <AvatarFallback className="text-4xl font-bold bg-emerald-100 text-emerald-700">{candidate.name[0]}</AvatarFallback>
                       </Avatar>
                     </div>
                     
                     <div className="space-y-4 flex-1 z-10 w-full mt-2">
                       <div>
                         <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
                         <Badge variant="outline" className="mt-1 bg-white border-slate-300 font-mono text-xs">DOB: 12/04/1998</Badge>
                       </div>
                       
                       <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm space-y-2 w-full text-left">
                         <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                           <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Application No</span>
                           <span className="font-mono font-bold text-slate-900">{candidate.applicationNo}</span>
                         </div>
                         <div className="flex justify-between items-center pt-1">
                           <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Roll No</span>
                           <span className="font-mono font-bold text-emerald-700 text-lg">{candidate.rollNo}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   <CardContent className="p-6 bg-white shrink-0">
                      <Button onClick={() => setStep("biometrics")} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all group">
                        Confirm Identity & Capture Biometrics <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button variant="ghost" className="w-full mt-2 text-slate-500 hover:text-slate-700" onClick={() => { setCandidate(null); setSearchQuery(""); }}>
                        Cancel / Rescan
                      </Button>
                   </CardContent>
                 </Card>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-8 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Fingerprint className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Awaiting Subject</h3>
                  <p className="max-w-sm text-sm leading-relaxed">
                    Lookup a candidate to begin the biometric registration and OMR mapping process.
                  </p>
                </div>
              )}
           </div>
        </div>
      )}

      {step === "biometrics" && candidate && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
           {/* Candidate Context Bar */}
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
               <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                 <AvatarImage src={candidate.photoUrl} className="object-cover" />
                 <AvatarFallback>{candidate.name[0]}</AvatarFallback>
               </Avatar>
               <div>
                 <h3 className="font-bold text-slate-900 leading-none">{candidate.name}</h3>
                 <span className="font-mono text-sm text-slate-500">{candidate.rollNo}</span>
               </div>
             </div>
             <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                Biometric Capture Active
             </Badge>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Camera className="w-5 h-5 text-blue-600" /> Live Photo Capture
                  </div>
                  {integrityAlert && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200 animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Integrity Alert
                    </Badge>
                  )}
                  {faceMatchScore !== null && !showApprovalDialog && !integrityAlert && (
                    <Badge variant="outline" className={`border ${faceMatchScore >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"} flex items-center gap-1.5 px-2.5 py-1`}>
                      {faceMatchScore >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span className="font-bold">{faceMatchScore}% Match</span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col">
                {integrityAlert && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 text-sm animate-in fade-in flex gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <p className="font-bold mb-1">{integrityAlert}</p>
                      <p className="opacity-90">Ensure the candidate is looking directly at the camera with clear lighting and no face coverings.</p>
                    </div>
                  </div>
                )}

                {showApprovalDialog && (
                   <div className="bg-orange-50 border border-orange-200 text-orange-900 p-5 rounded-xl mb-6 shadow-sm animate-in zoom-in-95 duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                          <span className="font-bold text-2xl text-orange-600">{faceMatchScore}%</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight mb-1 flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="w-5 h-5" /> Low Confidence Match
                          </h4>
                          <p className="text-sm opacity-80 leading-relaxed mb-4">The AI score is below the strict 75% threshold. Please verify identity manually against government ID.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                         <Button size="lg" variant="outline" className="flex-1 bg-white border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => { setShowApprovalDialog(false); setCapturedPhoto(null); }}>
                           Reject & Recapture
                         </Button>
                         <Button size="lg" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-sm" onClick={() => setShowApprovalDialog(false)}>
                           Force Approve
                         </Button>
                      </div>
                   </div>
                )}
                
                <div className="flex-1 flex flex-col justify-center relative min-h-[300px]">
                  {!showApprovalDialog && (
                     <>
                        <div className="absolute inset-0 z-0 bg-slate-100 rounded-xl overflow-hidden opacity-50 flex items-center justify-center">
                          {/* Placeholder while camera loads or behind it */}
                          <Camera className="w-16 h-16 text-slate-300" />
                        </div>
                        <div className="relative z-10 w-full h-full">
                          <CameraCapture onCapture={handleCapturePhoto} label={capturedPhoto ? "Retake Photo" : "Capture Live Photo"} />
                        </div>
                     </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Fingerprint className="w-5 h-5 text-emerald-600" /> Left Thumb Impression (LTI)
                  </div>
                  {fingerprintHash && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 px-2.5 py-1">
                      <CheckCircle2 className="w-3 h-3" /> Captured
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-center min-h-[400px]">
                <FingerprintCapture onCapture={setFingerprintHash} />
              </CardContent>
            </Card>

            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center mt-2 shadow-inner">
               <div className="flex gap-4 items-center pl-2">
                 <div className={`flex items-center gap-2 text-sm font-semibold ${capturedPhoto ? 'text-emerald-600' : 'text-slate-400'}`}>
                   <CheckCircle2 className={`w-5 h-5 ${capturedPhoto ? 'text-emerald-500' : 'text-slate-300'}`} /> Photo Status
                 </div>
                 <div className="w-px h-6 bg-slate-300"></div>
                 <div className={`flex items-center gap-2 text-sm font-semibold ${fingerprintHash ? 'text-emerald-600' : 'text-slate-400'}`}>
                   <CheckCircle2 className={`w-5 h-5 ${fingerprintHash ? 'text-emerald-500' : 'text-slate-300'}`} /> Biometric Status
                 </div>
               </div>
              <Button 
                size="lg" 
                disabled={!capturedPhoto || !fingerprintHash || showApprovalDialog || !!integrityAlert}
                onClick={() => setStep("omr")}
                className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-md group transition-all"
              >
                Proceed to OMR Mapping <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "omr" && candidate && (
        <Card className="max-w-2xl mx-auto border-t-4 border-t-emerald-500 shadow-lg animate-in slide-in-from-right-8 duration-300 overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                <AvatarImage src={candidate.photoUrl} className="object-cover" />
                <AvatarFallback>{candidate.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-slate-900 leading-none text-lg">{candidate.name}</h3>
                <span className="font-mono text-sm text-slate-500">{candidate.rollNo}</span>
              </div>
            </div>
            
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" /> Map OMR Sheet
            </CardTitle>
            <CardDescription className="text-base">Scan the barcode on the OMR sheet to link it to this candidate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8 relative z-10 bg-white">
            
            <div className="group p-10 bg-slate-50 hover:bg-emerald-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-300 flex items-center justify-center flex-col text-slate-500 hover:text-emerald-700 gap-4 cursor-pointer transition-all duration-300" 
                 onClick={() => setOmrCode("OMR-" + Math.floor(Math.random() * 10000000).toString().padStart(8, '0'))}>
              
              <div className="relative">
                 <div className="w-32 h-1.5 bg-red-500/80 mb-2 rounded-full absolute top-1/2 -translate-y-1/2 -inset-x-4 shadow-[0_0_10px_rgba(239,68,68,0.6)] z-10 animate-pulse"></div>
                 <div className="w-24 h-16 border-4 border-slate-400 group-hover:border-emerald-400 rounded-lg flex items-center justify-center bg-white shadow-sm transition-colors relative z-0 overflow-hidden">
                   <div className="flex gap-1 items-center px-2 w-full h-full opacity-60">
                      <div className="w-1 h-full bg-slate-800"></div><div className="w-2 h-full bg-slate-800"></div><div className="w-1 h-full bg-slate-800"></div><div className="w-1.5 h-full bg-slate-800"></div><div className="w-0.5 h-full bg-slate-800"></div><div className="w-2 h-full bg-slate-800"></div><div className="w-1 h-full bg-slate-800"></div><div className="w-1.5 h-full bg-slate-800"></div>
                   </div>
                 </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">Tap to simulate OMR Scan</p>
                <p className="text-sm opacity-80 mt-1">Point scanner at OMR sheet barcode</p>
              </div>
            </div>

            <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-slate-200"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                 <span className="bg-white px-4 text-slate-500 font-medium">OR ENTER MANUALLY</span>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-600">OMR Serial Number</label>
              <Input 
                value={omrCode} 
                onChange={e => setOmrCode(e.target.value)} 
                placeholder="e.g. OMR-12345678"
                className="font-mono text-2xl h-16 text-center tracking-widest border-2 focus-visible:border-emerald-500 shadow-sm transition-colors"
                autoFocus
              />
            </div>

            <Button 
              className="w-full gap-2 h-16 text-xl bg-slate-900 hover:bg-slate-800 shadow-lg" 
              size="lg"
              onClick={handleSubmit}
              disabled={!omrCode || loading}
            >
              {loading ? (
                <><span className="animate-spin text-2xl">⏳</span> Saving Record...</>
              ) : (
                <><Save className="w-6 h-6" /> Complete Registration & Link OMR</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
