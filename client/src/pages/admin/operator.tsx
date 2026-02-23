import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Smartphone, Search, Edit, Trash2, PowerOff, RefreshCw } from "lucide-react";

export default function OperatorMaster() {
  const operatorsData = [
    { name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@example.com", center: "Delhi Public School", device: "Samsung Tab A7", lastActive: "25/01/2024, 04:00 pm", status: "Active" },
    { name: "Priya Sharma", phone: "9876543211", email: "priya@example.com", center: "Delhi Public School", device: "Lenovo Tab M10", lastActive: "25/01/2024, 03:55 pm", status: "Active" },
    { name: "Amit Patel", phone: "9876543212", email: "amit@example.com", center: "Kendriya Vidyalaya", device: "Samsung Tab A7", lastActive: "25/01/2024, 03:50 pm", status: "Active" },
    { name: "Sunita Verma", phone: "9876543213", email: "sunita@example.com", center: "St. Xaviers College", device: "Not bound", lastActive: "Never", status: "Inactive" },
    { name: "Vikram Singh", phone: "9876543214", email: "vikram@example.com", center: "IIT Bombay", device: "iPad 9th Gen", lastActive: "25/01/2024, 03:45 pm", status: "Active" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Operators Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage verification operators and device bindings</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-10 border-blue-200 text-blue-900 bg-white shadow-sm rounded-lg">
              <SelectValue placeholder="All Exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              <SelectItem value="upsc">UPSC Civil Services 2024</SelectItem>
              <SelectItem value="ssc">SSC CGL 2024</SelectItem>
              <SelectItem value="rrb">RRB NTPC 2024</SelectItem>
              <SelectItem value="ibps">IBPS PO 2023</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all_centres">
            <SelectTrigger className="w-[200px] h-10 border-gray-200 text-gray-700 bg-white shadow-sm rounded-lg">
              <SelectValue placeholder="All Centres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_centres">All Centres</SelectItem>
              <SelectItem value="del001">DEL001 - Delhi Public School</SelectItem>
              <SelectItem value="del002">DEL002 - Kendriya Vidyalaya</SelectItem>
              <SelectItem value="mum001">MUM001 - St. Xaviers College</SelectItem>
              <SelectItem value="mum002">MUM002 - IIT Bombay</SelectItem>
              <SelectItem value="blr001">BLR001 - Christ University</SelectItem>
              <SelectItem value="blr002">BLR002 - RV College</SelectItem>
              <SelectItem value="chn001">CHN001 - IIT Madras</SelectItem>
              <SelectItem value="kol001">KOL001 - Jadavpur University</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">6</div>
              <div className="text-sm font-medium text-gray-500">Total Operators</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm font-medium text-gray-500">Active</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm font-medium text-gray-500">Device Bound</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search operators..." 
              className="pl-9 h-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8 text-xs border-gray-200 rounded-md">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>entries</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-100">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6">Operator ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Email ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Centre ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Device</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Last Active ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Status ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {operatorsData.map((operator, idx) => (
                <TableRow key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div>
                      <div className="font-medium text-gray-900 text-[13px]">{operator.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{operator.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-600">{operator.email}</TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-900">{operator.center}</TableCell>
                  <TableCell className="py-4 text-[13px]">
                    {operator.device !== "Not bound" ? (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Smartphone className="w-3.5 h-3.5 text-green-500" />
                        {operator.device}
                      </div>
                    ) : (
                      <span className="text-gray-400">{operator.device}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-600">{operator.lastActive}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${operator.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className={`text-[13px] font-medium ${operator.status === 'Active' ? 'text-green-700' : 'text-gray-500'}`}>
                        {operator.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      {operator.status === 'Active' ? (
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Deactivate">
                          <PowerOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors" title="Activate">
                          <PowerOff className="w-4 h-4" />
                        </button>
                      )}
                      
                      {operator.device !== "Not bound" && (
                        <button className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-md transition-colors" title="Unbind Device">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination placeholder matching the design */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-white">
          <div>Showing 1 to 5 of 6 entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 border-gray-200" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-600">1</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200">2</Button>
            <Button variant="outline" size="sm" className="h-8 border-gray-200">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}