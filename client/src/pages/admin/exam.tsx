import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Key, User, Clock, Trash2, Edit, UploadCloud, SquareSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link, useLocation } from "wouter";

export default function ExamMaster({ setActivePage }: { setActivePage?: (page: string) => void }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [, setLocation] = useLocation();

  // Mock data for exams
  const exams = [
    {
      id: "UP",
      name: "UPSC Civil Services 2024",
      code: "UPSC-CS-2024",
      client: "Union Public Service Commission",
      status: "Active",
      candidates: "15,420",
      verified: "12,350",
      verifiedPercent: "80%",
      created: "15/01/2024",
      apkPass: "UPSC2024X",
      loginId: "upsc_client",
      loginPass: "upsc@123",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "SS",
      name: "SSC CGL 2024",
      code: "SSC-CGL-2024",
      client: "Staff Selection Commission",
      status: "Active",
      candidates: "28,500",
      verified: "18,200",
      verifiedPercent: "64%",
      created: "01/02/2024",
      apkPass: "SSC2024Y",
      loginId: "ssc_client",
      loginPass: "ssc@123",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "RR",
      name: "RRB NTPC 2024",
      code: "RRB-NTPC-2024",
      client: "Railway Recruitment Board",
      status: "Draft",
      candidates: "0",
      verified: "0",
      verifiedPercent: "0%",
      created: "01/03/2024",
      apkPass: "-",
      loginId: "-",
      loginPass: "-",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "IB",
      name: "IBPS PO 2023",
      code: "IBPS-PO-2023",
      client: "Institute of Banking Personnel Selec...",
      status: "Active",
      candidates: "12,000",
      verified: "11,500",
      verifiedPercent: "95%",
      created: "10/11/2023",
      apkPass: "IBPS2023Z",
      loginId: "ibps_client",
      loginPass: "ibps@123",
      color: "bg-blue-100 text-blue-600",
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exam Management</h1>
          <p className="text-gray-500 text-[15px]">Create and manage examination sessions</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (open) setActiveStep(1);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 h-auto gap-2">
              <Plus className="w-4 h-4" /> Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold text-gray-900">Create New Exam</DialogTitle>
            </DialogHeader>
            
            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 px-6 mt-4">
              <div 
                className={`py-3 px-4 text-sm font-medium border-b-2 cursor-pointer ${activeStep === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveStep(1)}
              >
                1. Basic Info
              </div>
              <div 
                className={`py-3 px-4 text-sm font-medium border-b-2 cursor-pointer ${activeStep === 2 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveStep(2)}
              >
                2. Time Slots
              </div>
              <div 
                className={`py-3 px-4 text-sm font-medium border-b-2 cursor-pointer ${activeStep === 3 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveStep(3)}
              >
                3. Settings
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {activeStep === 1 && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Exam Name <span className="text-gray-400">*</span></label>
                    <Input placeholder="e.g., UPSC Civil Services 2024" className="border-gray-200 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Exam Code <span className="text-gray-400">*</span></label>
                    <Input placeholder="e.g., UPSC-CS-2024" className="border-gray-200 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-700">Client Name <span className="text-gray-400">*</span></label>
                    <Input placeholder="e.g., Union Public Service Commission" className="border-gray-200 focus-visible:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Credentials</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Login ID <span className="text-gray-400">*</span></label>
                      <Input placeholder="e.g., upsc_client" className="border-gray-200 focus-visible:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Login Password <span className="text-gray-400">*</span></label>
                      <Input placeholder="Enter password" type="password" className="border-gray-200 focus-visible:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">APK Password <span className="text-gray-400">*</span></label>
                      <Input placeholder="Enter APK password" type="password" className="border-gray-200 focus-visible:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Time Slots */}
            {activeStep === 2 && (
              <div className="p-6 space-y-6 min-h-[300px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Time Slots <span className="text-red-500">*</span></h4>
                    <p className="text-xs text-gray-500 mt-1">Define examination time slots (at least one required)</p>
                  </div>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 gap-2 h-9 rounded-lg">
                    <Plus className="w-4 h-4" /> Add Slot
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <Input defaultValue="Slot 1" className="bg-white border-gray-200" />
                  <div className="relative flex-1">
                    <Input defaultValue="09:00" className="bg-white border-gray-200 pr-10" />
                    <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                  <div className="relative flex-1">
                    <Input defaultValue="12:00" className="bg-white border-gray-200 pr-10" />
                    <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                  <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {activeStep === 3 && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Biometric Settings</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Biometric Mode</label>
                      <Select defaultValue="face">
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="face">Face Only</SelectItem>
                          <SelectItem value="fingerprint">Fingerprint Only</SelectItem>
                          <SelectItem value="both">Face + Fingerprint</SelectItem>
                          <SelectItem value="photo">Photo Capture Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Verification Flow</label>
                      <Select defaultValue="single">
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select flow" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Biometric</SelectItem>
                          <SelectItem value="face_finger">Face → Fingerprint</SelectItem>
                          <SelectItem value="finger_face">Fingerprint → Face</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Attendance Mode</label>
                      <Select defaultValue="both">
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="present">Mark Present Only</SelectItem>
                          <SelectItem value="verification">Verification Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">OMR/Barcode Mode</label>
                      <Select defaultValue="verification">
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verification">Verification Only</SelectItem>
                          <SelectItem value="present_verify_omr">Present + Verification + OMR</SelectItem>
                          <SelectItem value="verify_omr">Verification + OMR Scan</SelectItem>
                          <SelectItem value="omr_only">OMR Scan Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Features</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div className="flex items-start space-x-3">
                      <Switch id="liveness" defaultChecked className="mt-1 data-[state=checked]:bg-blue-600" />
                      <div>
                        <label htmlFor="liveness" className="text-sm font-medium text-gray-900 cursor-pointer">Face Liveness Detection</label>
                        <p className="text-xs text-gray-500">Detect live face vs photo</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Switch id="finger_quality" defaultChecked className="mt-1 data-[state=checked]:bg-blue-600" />
                      <div>
                        <label htmlFor="finger_quality" className="text-sm font-medium text-gray-900 cursor-pointer">Fingerprint Quality Check</label>
                        <p className="text-xs text-gray-500">Ensure fingerprint quality</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Switch id="offline" defaultChecked className="mt-1 data-[state=checked]:bg-blue-600" />
                      <div>
                        <label htmlFor="offline" className="text-sm font-medium text-gray-900 cursor-pointer">Offline Mode</label>
                        <p className="text-xs text-gray-500">Allow offline operations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Switch id="gps" className="mt-1 data-[state=checked]:bg-blue-600" />
                      <div>
                        <label htmlFor="gps" className="text-sm font-medium text-gray-900 cursor-pointer">GPS Capture</label>
                        <p className="text-xs text-gray-500">Record location</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Switch id="mdm" className="mt-1 data-[state=checked]:bg-blue-600" />
                      <div>
                        <label htmlFor="mdm" className="text-sm font-medium text-gray-900 cursor-pointer">MDM Control</label>
                        <p className="text-xs text-gray-500">Enable MDM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-full space-y-1">
                        <label className="text-sm font-medium text-gray-900">Retry Limit</label>
                        <Input defaultValue="3" className="border-gray-200 w-full focus-visible:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-4 px-6 border-t border-gray-100 bg-gray-50/50">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 border-none text-gray-700">
                Cancel
              </Button>
              <div className="flex gap-2">
                {activeStep > 1 && (
                  <Button variant="outline" onClick={() => setActiveStep(activeStep - 1)} className="bg-gray-100 hover:bg-gray-200 border-none text-gray-700">
                    Previous
                  </Button>
                )}
                {activeStep < 3 ? (
                  <Button onClick={() => setActiveStep(activeStep + 1)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Next
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create Exam
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <Input 
          placeholder="Search exams..." 
          className="pl-9 bg-white border-gray-200 rounded-lg focus-visible:ring-blue-500" 
        />
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {exams.map((exam, i) => (
          <Card key={i} className="shadow-sm border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${exam.color}`}>
                      {exam.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{exam.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{exam.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-lg border-gray-100">
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 mb-1">
                        <Edit className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 mb-1"
                        onClick={() => {
                          if (setActivePage) setActivePage("upload-candidate");
                        }}
                      >
                        <UploadCloud className="w-4 h-4" /> Upload Candidates
                      </DropdownMenuItem>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 focus:text-red-600 mb-1">
                        <SquareSquare className="w-4 h-4" /> Stop Exam
                      </DropdownMenuItem>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 focus:text-red-600">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Client</span>
                    <span className="font-medium text-gray-900 text-right truncate max-w-[200px]" title={exam.client}>{exam.client}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold ${exam.status === 'Active' ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded-md text-xs' : 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-xs'}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Candidates</span>
                    <span className="font-semibold text-gray-900">{exam.candidates}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Verified</span>
                    <span className="font-semibold text-green-600">
                      {exam.verified} <span className="font-medium">({exam.verifiedPercent})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium text-gray-900">{exam.created}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-5 pb-5 pt-0 space-y-2">
                <div className="flex items-center gap-2 bg-gray-50/80 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                  <Key className="w-3.5 h-3.5 text-gray-400" />
                  <span>APK Password: <span className="font-mono font-semibold text-gray-800">{exam.apkPass}</span></span>
                </div>
                <div className="flex items-center gap-2 bg-[#f0f7ff] rounded-lg p-2.5 text-xs text-blue-700 border border-blue-100">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Client Login: <span className="font-mono font-semibold">{exam.loginId} / {exam.loginPass}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}