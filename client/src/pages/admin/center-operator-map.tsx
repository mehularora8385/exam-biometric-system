import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Map } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CenterOperatorMap() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Center Operator Map</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Map List</h3>
          
          <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2">
                <Plus className="w-4 h-4" /> Map Operator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Map Operator to Center</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <Label>Exam <span className="text-red-500">*</span></Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="--Select Exam--" /></SelectTrigger>
                    <SelectContent><SelectItem value="exam1">UPSC Civil Services</SelectItem></SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Center <span className="text-red-500">*</span></Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="--Select Center--" /></SelectTrigger>
                    <SelectContent><SelectItem value="c1">DPS Delhi (C001)</SelectItem></SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Operator <span className="text-red-500">*</span></Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="--Select Operator--" /></SelectTrigger>
                    <SelectContent><SelectItem value="o1">Rajesh Kumar (OP001)</SelectItem></SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <Label>Device Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" defaultChecked /> Face</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" defaultChecked /> Fingerprint</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" /> OMR</label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsMapModalOpen(false)}>Close</Button>
                <Button className="bg-[#4e73df] hover:bg-[#2e59d9]">Save Mapping</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select className="border rounded p-1.5 text-sm w-40 text-slate-600">
                <option>--Select Exam--</option>
              </select>
              <select className="border rounded p-1.5 text-sm w-40 text-slate-600">
                <option>--Select Center--</option>
              </select>
              <Button size="sm" className="bg-[#4e73df] hover:bg-[#2e59d9]">Search</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <Input className="h-8 w-48" />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Center Name</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead>Op Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Add Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell className="font-medium">DPS Delhi</TableCell>
                <TableCell>UPSC Civil Services</TableCell>
                <TableCell>15-05-2024</TableCell>
                <TableCell>Rajesh Kumar</TableCell>
                <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Active</span></TableCell>
                <TableCell className="text-sm text-slate-500">10-05-2024</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}