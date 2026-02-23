import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Building2, CalendarDays, Upload, Download,
  FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle
} from "lucide-react";

export default function UploadCandidate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedExam, setSelectedExam] = useState("");
  const [uploadResult, setUploadResult] = useState<{ inserted: number; total: number; skipped: number; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: exams = [] } = useQuery({ queryKey: ["exams"], queryFn: api.exams.list });

  const { data: candidates = [] } = useQuery({
    queryKey: ["candidates", selectedExam],
    queryFn: () => api.candidates.list(selectedExam ? parseInt(selectedExam) : undefined),
    enabled: !!selectedExam,
  });

  const { data: centers = [] } = useQuery({
    queryKey: ["centers", selectedExam],
    queryFn: () => api.centers.list(selectedExam ? parseInt(selectedExam) : undefined),
    enabled: !!selectedExam,
  });

  const { data: slots = [] } = useQuery({
    queryKey: ["slots", selectedExam],
    queryFn: () => api.slots.list(selectedExam ? parseInt(selectedExam) : undefined),
    enabled: !!selectedExam,
  });

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["xlsx", "xls", "csv"].includes(ext || "")) {
        setSelectedFile(file);
      } else {
        toast({ title: "Invalid file type", description: "Please upload .xlsx, .xls, or .csv files", variant: "destructive" });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedExam) {
      toast({ title: "Missing information", description: "Please select an exam and a file to upload", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    setUploadResult(null);
    try {
      const result = await api.candidates.uploadFile(selectedFile, parseInt(selectedExam));
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["candidates", selectedExam] });
      toast({ title: "Upload successful", description: `${result.inserted} candidates inserted` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Upload Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">Upload candidate data with photo URLs via Excel or CSV</p>
        </div>
        <div className="w-full sm:w-72">
          <Select value={selectedExam} onValueChange={setSelectedExam} data-testid="select-exam">
            <SelectTrigger data-testid="select-exam">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={String(exam.id)}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" data-testid="text-candidates-count">
                {selectedExam ? candidates.length : 0}
              </div>
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
              <div className="text-2xl font-bold text-gray-900" data-testid="text-centres-count">
                {selectedExam ? centers.length : 0}
              </div>
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
              <div className="text-2xl font-bold text-gray-900" data-testid="text-slots-count">
                {selectedExam ? slots.length : 0}
              </div>
              <div className="text-sm font-medium text-gray-500">Slots</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Upload Candidate Data
              </h3>
              <p className="text-sm text-gray-500 mt-1">Upload an Excel or CSV file with candidate details and photo URLs in a single file</p>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-gray-600 border-gray-200"
              data-testid="button-download-template"
              onClick={() => api.candidates.downloadTemplate()}
            >
              <Download className="w-4 h-4" /> Download Template
            </Button>
          </div>

          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-medium text-blue-800 mb-2">Template Format (CSV / Excel)</p>
            <div className="overflow-x-auto">
              <table className="text-xs text-blue-700 border-collapse w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="py-1.5 px-3 text-left font-semibold">Centre Code</th>
                    <th className="py-1.5 px-3 text-left font-semibold">Centre Name</th>
                    <th className="py-1.5 px-3 text-left font-semibold">exam Name</th>
                    <th className="py-1.5 px-3 text-left font-semibold">Roll No</th>
                    <th className="py-1.5 px-3 text-left font-semibold">Name</th>
                    <th className="py-1.5 px-3 text-left font-semibold">Father Name</th>
                    <th className="py-1.5 px-3 text-left font-semibold">DOB</th>
                    <th className="py-1.5 px-3 text-left font-semibold">Slot</th>
                    <th className="py-1.5 px-3 text-left font-semibold">Photo urL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1.5 px-3">DEL001</td>
                    <td className="py-1.5 px-3">Delhi Public School</td>
                    <td className="py-1.5 px-3">UPSC</td>
                    <td className="py-1.5 px-3">2024001</td>
                    <td className="py-1.5 px-3">Rahul Kumar</td>
                    <td className="py-1.5 px-3">Suresh Kumar</td>
                    <td className="py-1.5 px-3">01-01-1995</td>
                    <td className="py-1.5 px-3">Slot 1</td>
                    <td className="py-1.5 px-3 text-blue-500">https://...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50 bg-white"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Upload className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-base font-medium text-gray-900 mb-1 flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-medium text-blue-600 mb-1">
                    Click to upload <span className="text-gray-500 font-normal">or drag and drop</span>
                  </p>
                  <p className="text-sm text-gray-500">Upload Excel (.xlsx, .xls) or CSV file with candidate data & photo URLs</p>
                  <p className="text-xs text-gray-400 mt-2">Accepted: .xlsx, .xls, .csv | Max size: 10MB</p>
                </div>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                className="gap-2 text-gray-600 border-gray-200"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              >
                <XCircle className="w-4 h-4" /> Clear
              </Button>
              <Button
                data-testid="button-upload-file"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                disabled={isUploading || !selectedExam}
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload File</>
                )}
              </Button>
            </div>
          )}

          {!selectedExam && selectedFile && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Please select an exam before uploading
            </div>
          )}
        </CardContent>
      </Card>

      {uploadResult && (
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Upload Complete</p>
                <p className="text-sm text-green-700">
                  {uploadResult.inserted} candidates inserted
                  {uploadResult.skipped > 0 && <>, {uploadResult.skipped} skipped (missing Roll No or Name)</>}
                  {" "}out of {uploadResult.total} total rows
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {candidates.length > 0 && selectedExam && (
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-8">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              Candidate Preview ({candidates.length} records)
            </h3>
            <div className="rounded-lg border border-gray-200 overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Centre Code</TableHead>
                    <TableHead>Centre Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Photo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.slice(0, 50).map((candidate: any, idx: number) => (
                    <TableRow key={candidate.id || idx}>
                      <TableCell className="font-mono text-xs">{candidate.centreCode || "-"}</TableCell>
                      <TableCell className="text-sm">{candidate.centreName || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{candidate.rollNo || "-"}</TableCell>
                      <TableCell className="text-sm font-medium">{candidate.name || "-"}</TableCell>
                      <TableCell className="text-sm">{candidate.fatherName || "-"}</TableCell>
                      <TableCell className="text-xs">{candidate.dob || "-"}</TableCell>
                      <TableCell className="text-sm">{candidate.slot || "-"}</TableCell>
                      <TableCell>
                        {candidate.photoUrl ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <XCircle className="w-3 h-3" /> No
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {candidates.length > 50 && (
                <div className="p-3 text-center text-sm text-gray-500 border-t">
                  Showing 50 of {candidates.length} candidates
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-8">
          <h3 className="font-semibold text-gray-900 text-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Upload Instructions
          </h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">1.</span>
              <p>Download the template file to see the required column format</p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">2.</span>
              <p>Fill in candidate data following the template: <strong>Centre Code, Centre Name, exam Name, Roll No, Name, Father Name, DOB, Slot, Photo urL</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">3.</span>
              <p>Include the photo URL for each candidate directly in the <strong>Photo urL</strong> column (no separate photo upload needed)</p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">4.</span>
              <p>Ensure mandatory fields (<strong>Roll No</strong> and <strong>Name</strong>) are filled — rows without these will be skipped</p>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">5.</span>
              <p>Select the exam and upload the completed file using the drag & drop area above</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
