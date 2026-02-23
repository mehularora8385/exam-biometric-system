import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, UserCheck, Wifi, WifiOff, Search, Filter, RefreshCw, Download, Calendar as CalendarIcon, Loader2 } from "lucide-react";

export default function Reports() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: logsData = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: api.auditLogs.list,
  });

  const actionFilterMap: Record<string, string> = {
    verify: "Candidate Verified",
    login: "Operator Login",
    sync: "Data Sync",
  };

  const filteredLogs = logsData.filter((log: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        log.action?.toLowerCase().includes(q) ||
        log.operatorName?.toLowerCase().includes(q) ||
        log.candidateId?.toLowerCase().includes(q) ||
        log.centreCode?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (actionFilter !== "all") {
      const mappedAction = actionFilterMap[actionFilter];
      if (mappedAction && log.action !== mappedAction) return false;
    }
    return true;
  });

  const totalEvents = filteredLogs.length;
  const verifications = filteredLogs.filter((log: any) => log.action === "Candidate Verified").length;
  const onlineEvents = filteredLogs.filter((log: any) => log.mode === "online" || log.mode === "Online").length;
  const offlineEvents = filteredLogs.filter((log: any) => log.mode === "offline" || log.mode === "Offline").length;

  const getActionColor = (action: string) => {
    switch (action) {
      case "Candidate Verified": return "text-green-700 bg-green-50";
      case "Operator Login": return "text-blue-700 bg-blue-50";
      case "Data Sync": return "text-yellow-700 bg-yellow-50";
      default: return "text-gray-700 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Track all operator activities and system events</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className={`border-gray-200 h-10 px-4 rounded-lg font-medium shadow-sm gap-2 transition-colors ${showFilters ? 'bg-gray-100 text-gray-900' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 h-10 px-4 rounded-lg font-medium shadow-sm gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ["audit-logs"] })}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-4 rounded-lg font-medium gap-2" onClick={() => alert("Export feature coming soon")}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Filter Expandable Panel */}
      {showFilters && (
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-5 flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-600">Exam</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full h-10 border-gray-200">
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="upsc">UPSC Civil Services 2024</SelectItem>
                  <SelectItem value="ssc">SSC CGL 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-600">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full h-10 border-gray-200">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="verify">Candidate Verified</SelectItem>
                  <SelectItem value="login">Operator Login</SelectItem>
                  <SelectItem value="sync">Data Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600">From Date</label>
              <div className="relative">
                <Input type="date" className="w-full h-10 border-gray-200 pr-10 text-gray-500" placeholder="dd-mm-yyyy" />
              </div>
            </div>
            
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600">To Date</label>
              <div className="relative">
                <Input type="date" className="w-full h-10 border-gray-200 pr-10 text-gray-500" placeholder="dd-mm-yyyy" />
              </div>
            </div>

            <Button variant="ghost" className="text-gray-500 h-10 px-4 hover:bg-gray-100" onClick={() => { setShowFilters(false); setActionFilter("all"); setSearchQuery(""); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" data-testid="text-total-events">{totalEvents}</div>
              <div className="text-sm font-medium text-gray-500">Total Events</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" data-testid="text-verifications">{verifications}</div>
              <div className="text-sm font-medium text-gray-500">Verifications</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" data-testid="text-online-events">{onlineEvents}</div>
              <div className="text-sm font-medium text-gray-500">Online Events</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" data-testid="text-offline-events">{offlineEvents}</div>
              <div className="text-sm font-medium text-gray-500">Offline Events</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search logs..." 
              className="pl-9 h-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show</span>
            <Select defaultValue="25">
              <SelectTrigger className="w-16 h-8 text-xs border-gray-200 rounded-md">
                <SelectValue placeholder="25" />
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
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6 w-56">Timestamp ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Action ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Mode</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Operator</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Device</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Candidate</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pr-6">Centre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredLogs.map((log: any) => (
                <TableRow key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 pl-6 text-[13px] text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-[13px] font-medium text-gray-700">
                    {log.mode || "-"}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCheck className="w-3 h-3 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-[13px]">{log.operatorName || "-"}</div>
                        <div className="text-[11px] text-gray-500">{log.operatorId || "-"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                      <div className="w-3.5 h-5 border border-gray-400 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-[1px] bg-gray-400"></div>
                      </div>
                      {log.deviceId || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {log.candidateId ? (
                      <div>
                        <div className="font-medium text-gray-900 text-[13px]">{log.candidateId}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <div className="text-[13px] font-medium text-gray-700">
                      {log.centreCode || "-"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-white">
          <div>Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 border-gray-200" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-600">1</Button>
            <Button variant="outline" size="sm" className="h-8 border-gray-200">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}