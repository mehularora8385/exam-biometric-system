import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadCloud, Search, Filter } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Select Center</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>--Select Center--</option>
                <option>All Centers</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button className="bg-[#4e73df] hover:bg-[#2e59d9] text-white gap-2 h-10">
                <Search className="w-4 h-4" /> View Report
              </Button>
              <Button className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2 h-10">
                <DownloadCloud className="w-4 h-4" /> Export Excel
              </Button>
            </div>
          </div>
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
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Center Name</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Total Candidate</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Unverified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell className="font-medium">DPS Delhi</TableCell>
                  <TableCell>UPSC Civil Services</TableCell>
                  <TableCell>500</TableCell>
                  <TableCell className="text-blue-600 font-semibold">450</TableCell>
                  <TableCell className="text-slate-500">50</TableCell>
                  <TableCell className="text-emerald-600 font-semibold">445</TableCell>
                  <TableCell className="text-red-500 font-semibold">5</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}