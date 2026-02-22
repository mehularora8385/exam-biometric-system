import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

export default function DeviceMapping() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Device Mapping List</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Registered Devices</h3>
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
                <TableHead>Operator</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Device Model</TableHead>
                <TableHead>Device ID (MAC/IMEI)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell className="font-medium">Rajesh Kumar</TableCell>
                <TableCell>DPS Delhi</TableCell>
                <TableCell>Samsung Galaxy Tab A7</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">00:1B:44:11:3A:B7</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none"><Lock className="w-3 h-3 mr-1" /> Bound</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <Unlock className="w-4 h-4 mr-1" /> Unbind
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell className="font-medium">Priya Sharma</TableCell>
                <TableCell>Kendriya Vidyalaya</TableCell>
                <TableCell>Lenovo Tab M10</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">A1:B2:C3:D4:E5:F6</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none"><Lock className="w-3 h-3 mr-1" /> Bound</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    <Unlock className="w-4 h-4 mr-1" /> Unbind
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}