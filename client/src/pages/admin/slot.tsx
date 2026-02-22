import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SlotMaster() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Slot Master</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Slot Master List</h3>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2">
                <Plus className="w-4 h-4" /> Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Add Slot</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <Label>Exam <span className="text-red-500">*</span></Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger>
                    <SelectContent><SelectItem value="exam1">UPSC Civil Services</SelectItem></SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Exam Date <span className="text-red-500">*</span></Label>
                  <Input type="date" />
                </div>
                
                <div className="space-y-1">
                  <Label>Slot Title <span className="text-red-500">*</span></Label>
                  <Input placeholder="Enter Slot Title" />
                </div>
                
                <div className="space-y-1">
                  <Label>Slot Sequence</Label>
                  <Input placeholder="Enter Slot Sequence" type="number" />
                </div>
                
                <div className="space-y-1">
                  <Label>Reporting Start Time <span className="text-red-500">*</span></Label>
                  <Input type="time" />
                </div>
                
                <div className="space-y-1">
                  <Label>Reporting End Time <span className="text-red-500">*</span></Label>
                  <Input type="time" />
                </div>
                
                <div className="space-y-1">
                  <Label>Gate Close Time <span className="text-red-500">*</span></Label>
                  <Input type="time" />
                </div>
                
                <div className="space-y-1">
                  <Label>Start Time <span className="text-red-500">*</span></Label>
                  <Input type="time" />
                </div>
                
                <div className="space-y-1">
                  <Label>End Time <span className="text-red-500">*</span></Label>
                  <Input type="time" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Close</Button>
                <Button className="bg-[#4e73df] hover:bg-[#2e59d9]">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-0">
          <div className="p-4 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Show</span>
              <select className="border rounded p-1 text-sm"><option>10</option></select>
              <span className="text-sm text-slate-500">entries</span>
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
                  <TableHead className="w-16 whitespace-nowrap">S.No</TableHead>
                  <TableHead className="whitespace-nowrap">Exam</TableHead>
                  <TableHead className="whitespace-nowrap">Exam Date</TableHead>
                  <TableHead className="whitespace-nowrap">Slot Title</TableHead>
                  <TableHead className="whitespace-nowrap">Slot Sequence</TableHead>
                  <TableHead className="whitespace-nowrap">Start Time</TableHead>
                  <TableHead className="whitespace-nowrap">End Time</TableHead>
                  <TableHead className="whitespace-nowrap">Reporting Start Time</TableHead>
                  <TableHead className="whitespace-nowrap">Reporting End Time</TableHead>
                  <TableHead className="whitespace-nowrap">Gate Close Time</TableHead>
                  <TableHead className="whitespace-nowrap">Shift Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell className="font-medium">TestingExam1</TableCell>
                  <TableCell>24-02-2025</TableCell>
                  <TableCell>Morning</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>09:00:00</TableCell>
                  <TableCell>12:00:00</TableCell>
                  <TableCell>08:00:00</TableCell>
                  <TableCell>08:45:00</TableCell>
                  <TableCell>08:45:00</TableCell>
                  <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Active</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 flex justify-between items-center text-sm text-slate-500">
            <div>Showing 1 to 1 of 1 entries</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-[#1a56db] text-white">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}