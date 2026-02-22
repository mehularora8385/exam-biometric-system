import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function DepartmentMaster() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Department</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Department Master</h3>
          <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2">
            <Plus className="w-4 h-4" /> Add Department
          </Button>
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
                <TableHead>Department Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell className="font-medium">Testing</TableCell>
                <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Active</span></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell className="font-medium">Education</TableCell>
                <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">Active</span></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="p-4 flex justify-between items-center text-sm text-slate-500">
            <div>Showing 1 to 2 of 2 entries</div>
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