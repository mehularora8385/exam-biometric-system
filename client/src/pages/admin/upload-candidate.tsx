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
  FileSpreadsheet, Image, CheckCircle, XCircle, Loader2, AlertCircle
} from "lucide-react";

export default function UploadCandidate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedExam, setSelectedExam] = useState("");
  const [uploadResult, setUploadResult] = useState<{ inserted: number; total: number; skipped: number; message: string } | null>(null);
  const [photoResult, setPhotoResult] = useState<{ uploaded: number; matched: number; results: any[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [dragActivePhoto, setDragActivePhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePhoto(true);
    } else if (e.type === "dragleave") {
      setDragActivePhoto(false);
    }
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePhoto(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadPhotos(e.dataTransfer.files);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadPhotos(e.target.files);
    }
  };

  const uploadPhotos = async (files: FileList) => {
    setIsUploadingPhotos(true);
    setPhotoResult(null);
    try {
      const result = await api.candidates.uploadPhotos(files);
      setPhotoResult(result);
      if (photoInputRef.current) photoInputRef.current.value = "";
      toast({ title: "Photos uploaded", description: `${result.uploaded || 0} photos uploaded, ${result.matched || 0} matched to candidates` });
    } catch (error: any) {
      toast({ title: "Photo upload failed", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const selectedExamData = exams.find((e: any) => String(e.id) === selectedExam);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Upload Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">Upload candidate data and photos for examination</p>
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
              <p className="text-sm text-gray-500 mt-1">Upload an Excel or CSV file with candidate information</p>
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
                  <p className="text-sm text-gray-500">Upload Excel (.xlsx, .xls) or CSV file</p>
                  <p className="text-xs text-gray-400 mt-2">Accepted: .xlsx, .xls, .csv</p>
                  <p className="text-xs text-gray-400">Max size: 10MB</p>
                </div>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4 flex justify-end">
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
                  {uploadResult.inserted} candidates inserted, {uploadResult.skipped} skipped out of {uploadResult.total} total
                </p>
                {uploadResult.message && (
                  <p className="text-sm text-green-600 mt-1">{uploadResult.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-600" />
              Upload Candidate Photos
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload candidate photos. Filename should match the roll number (e.g., 12345.jpg)
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
              ${dragActivePhoto ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-50 bg-white"}`}
            onDragEnter={handlePhotoDrag}
            onDragLeave={handlePhotoDrag}
            onDragOver={handlePhotoDrag}
            onDrop={handlePhotoDrop}
            onClick={() => photoInputRef.current?.click()}
          >
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
              data-testid="button-upload-photos"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                {isUploadingPhotos ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Image className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-base font-medium text-purple-600 mb-1">
                  {isUploadingPhotos ? "Uploading photos..." : "Click to upload photos"}{" "}
                  {!isUploadingPhotos && <span className="text-gray-500 font-normal">or drag and drop</span>}
                </p>
                <p className="text-sm text-gray-500">Accepts JPG, PNG, GIF, BMP, WebP</p>
                <p className="text-xs text-gray-400 mt-2">Photos are matched by filename (roll number = filename)</p>
              </div>
            </div>
          </div>

          {photoResult && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-800">Photos Uploaded</p>
                <p className="text-sm text-purple-700">
                  {photoResult.uploaded} photos uploaded, {photoResult.matched} matched to candidates
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.slice(0, 50).map((candidate: any, idx: number) => (
                    <TableRow key={candidate.id || idx}>
                      <TableCell className="font-mono">{candidate.rollNumber || candidate.roll_number || "-"}</TableCell>
                      <TableCell>{candidate.name || "-"}</TableCell>
                      <TableCell>{candidate.centerCode || candidate.center_code || "-"}</TableCell>
                      <TableCell>
                        {candidate.photoUrl || candidate.photo_url ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> Photo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <XCircle className="w-3 h-3" /> No Photo
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
            <div className="flex gap-3">
              <span className="font-semibold text-gray-900">5.</span>
              <p>Upload candidate photos with filenames matching roll numbers (e.g., 12345.jpg)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
