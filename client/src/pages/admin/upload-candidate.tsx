import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, CalendarDays, Upload, Download } from "lucide-react";

export default function UploadCandidate() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col gap-1">
        <Button variant="link" className="w-fit p-0 h-auto text-gray-500 hover:text-gray-900 flex items-center gap-1 -ml-1 mb-2">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          Upload Candidates
        </Button>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">UPSC Civil Services 2024</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">15,420</div>
              <div className="text-sm font-medium text-gray-500">Current Candidates</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm font-medium text-gray-500">Centres</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-sm font-medium text-gray-500">Slots</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Upload Candidate Data</h3>
              <p className="text-sm text-gray-500 mt-1">Upload an Excel or CSV file with candidate information</p>
            </div>
            <Button variant="outline" className="gap-2 text-gray-600 border-gray-200">
              <Download className="w-4 h-4" /> Download Template
            </Button>
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50 bg-white"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-medium text-blue-600 mb-1">Click to upload <span className="text-gray-500 font-normal">or drag and drop</span></p>
                <p className="text-sm text-gray-500">Upload Excel (.xlsx, .xls) or CSV file</p>
                <p className="text-xs text-gray-400 mt-2">Accepted: .xlsx, .xls, .csv</p>
                <p className="text-xs text-gray-400">Max size: 10MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-8">
          <h3 className="font-semibold text-gray-900 text-lg mb-6">Upload Instructions</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">1.</span>
              <p>Download the template file to see the required format</p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">2.</span>
              <p>Fill in the candidate data following the template structure (all formats accepted for student photos etc)</p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">3.</span>
              <p>Ensure mandatory fields (Roll No, Name, Centre Code) are not empty</p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">4.</span>
              <p>Upload the completed file using the drag and drop area above</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}