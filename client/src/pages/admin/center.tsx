import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Key, UploadCloud, DownloadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CenterMaster() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Center Master</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
          <h3 className="font-semibold text-slate-700">Center Details</h3>
          <div className="flex gap-2">
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <UploadCloud className="w-4 h-4" /> Import Center
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Center Details</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded text-blue-700 text-sm">
                    <span>Download Sample Template</span>
                    <Button size="sm" variant="ghost" className="h-8"><DownloadCloud className="w-4 h-4 mr-2" /> Download</Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Upload Excel File</label>
                    <Input type="file" accept=".xlsx,.xls" />
                  </div>
                  <Button className="w-full bg-[#1a56db] hover:bg-blue-700 mt-2">Upload & Process</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2">
              <Plus className="w-4 h-4" /> Add Center
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
            <div className="flex gap-2 w-full md:w-auto">
              <select className="border rounded p-1.5 text-sm w-48 text-slate-600">
                <option>--Select Exam--</option>
                <option>UPSC Civil Services</option>
              </select>
              <Button size="sm" className="bg-[#4e73df] hover:bg-[#2e59d9]">Search</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <Input className="h-8 w-48" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Center Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>No. of Candidate</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell className="font-mono text-xs">C001</TableCell>
                  <TableCell>TestingExam1</TableCell>
                  <TableCell className="font-medium">DPS Delhi</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">C001_User</TableCell>
                  <TableCell>New Delhi</TableCell>
                  <TableCell>Delhi</TableCell>
                  <TableCell>500</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">*****</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Key className="w-3 h-3 text-slate-400" /></Button>
                    </div>
                  </TableCell>
                  <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Active</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}