import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Key } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function OperatorMaster() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Operator Master</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Operator List</h3>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2">
                <Plus className="w-4 h-4" /> Add Operator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Create Operator</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <Label>Operator Code <span className="text-red-500">*</span></Label>
                  <Input placeholder="Enter Operator Code" />
                </div>
                
                <div className="space-y-1">
                  <Label>Operator Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="Enter Operator Name" />
                </div>
                
                <div className="space-y-1">
                  <Label>Mobile Number <span className="text-red-500">*</span></Label>
                  <Input placeholder="Enter Mobile Number" />
                </div>
                
                <div className="space-y-1">
                  <Label>Email ID</Label>
                  <Input placeholder="Enter Email ID" type="email" />
                </div>
                
                <div className="space-y-1">
                  <Label>Password <span className="text-red-500">*</span></Label>
                  <Input placeholder="Enter Password" type="password" />
                </div>
                
                <div className="space-y-1">
                  <Label>Status</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2"><input type="radio" name="status" defaultChecked className="w-4 h-4" /> Active</label>
                    <label className="flex items-center gap-2"><input type="radio" name="status" className="w-4 h-4" /> Inactive</label>
                  </div>
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
          
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Op Code</TableHead>
                <TableHead>Op Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>PWD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell className="font-mono text-xs font-semibold">OP001</TableCell>
                <TableCell className="font-medium">Rajesh Kumar</TableCell>
                <TableCell>9876543210</TableCell>
                <TableCell>rajesh@example.com</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}