import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, DownloadCloud } from "lucide-react";

export default function UploadCandidate() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Upload Candidate Data</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Select Exam</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>--Select Exam--</option>
                <option>UPSC Civil Services</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Select Excel File (.xlsx, .xls)</label>
              <Input type="file" accept=".xlsx, .xls" className="cursor-pointer" />
            </div>
            <div>
              <Button className="w-full bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2 h-10">
                <UploadCloud className="w-4 h-4" /> Import Data
              </Button>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="link" className="text-blue-600 gap-1 h-auto p-0">
              <DownloadCloud className="w-4 h-4" /> Download Sample Template
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="p-4 flex justify-between items-center border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Recent Upload History</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <Input className="h-8 w-48" />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Total Rows</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell className="text-sm text-slate-500">10-05-2024 14:30</TableCell>
                <TableCell className="font-medium">UPSC Civil Services</TableCell>
                <TableCell className="font-mono text-xs">UPSC_Candidates_Batch1.xlsx</TableCell>
                <TableCell>15,420</TableCell>
                <TableCell>15,420</TableCell>
                <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Completed</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}