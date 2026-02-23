import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert, AlertTriangle, Fingerprint, History, Settings2, Download, Filter, Search, Shield, Wifi, WifiOff, Loader2 } from "lucide-react";

export default function BiometricIntegrity() {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'config'>('monitoring');

  const { data: alertsData = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.list,
  });

  const getAlertColor = (type: string) => {
    switch (type) {
      case "Invalid Photo Attempt": return "text-orange-700 bg-orange-50 border-orange-200";
      case "Operator Face Misuse": return "text-red-700 bg-red-50 border-red-200";
      case "Face Mismatch Approved": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Duplicate Image Attempt": return "text-red-700 bg-red-50 border-red-200";
      case "Post-Exam Biometric Activity": return "text-purple-700 bg-purple-50 border-purple-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Biometric Integrity & Live Control</h1>
          <p className="text-sm text-gray-500 mt-1">Hybrid Offline + Online compatible biometric monitoring and configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={activeTab === 'monitoring' ? 'default' : 'outline'} 
            className={activeTab === 'monitoring' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600'}
            onClick={() => setActiveTab('monitoring')}
          >
            <ShieldAlert className="w-4 h-4 mr-2" /> Exception Monitor
          </Button>
          <Button 
            variant={activeTab === 'config' ? 'default' : 'outline'}
            className={activeTab === 'config' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600'}
            onClick={() => setActiveTab('config')}
          >
            <Settings2 className="w-4 h-4 mr-2" /> Admin Configuration
          </Button>
        </div>
      </div>

      {activeTab === 'monitoring' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm font-medium text-gray-500">Critical Alerts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm font-medium text-gray-500">Misuse Attempts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-sm font-medium text-gray-500">Post-Exam Activities</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-sm font-medium text-gray-500">Total Exceptions</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exception Monitor Table */}
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search alerts, roll no, operator..." 
                  className="pl-9 h-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] h-10 border-gray-200 text-gray-700 bg-white shadow-sm rounded-lg">
                    <SelectValue placeholder="All Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    <SelectItem value="upsc">UPSC Civil Services 2024</SelectItem>
                    <SelectItem value="ssc">SSC CGL 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] h-10 border-gray-200 text-gray-700 bg-white shadow-sm rounded-lg">
                    <SelectValue placeholder="All Alert Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alert Types</SelectItem>
                    <SelectItem value="invalid">Invalid Photo</SelectItem>
                    <SelectItem value="operator">Operator Misuse</SelectItem>
                    <SelectItem value="mismatch">Face Mismatch</SelectItem>
                    <SelectItem value="duplicate">Duplicate Image</SelectItem>
                    <SelectItem value="post">Post-Exam Activity</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-gray-200 text-gray-700 h-10 px-4 rounded-lg font-medium shadow-sm gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6">Alert Type</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Centre / Roll No</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Operator / Device</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Match %</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Timestamp / Delay</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Mode</TableHead>
                    <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 pr-6 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-500">Loading alerts...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : alertsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-500">
                        No alerts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    alertsData.map((alert: any) => (
                    <TableRow key={alert.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getAlertColor(alert.type)}`}>
                          {alert.type}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900 text-[13px]">{alert.centreCode}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{alert.candidateId}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900 text-[13px]">{alert.operatorId}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{alert.description}</div>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-[13px] text-gray-900">
                        {alert.confidence != null ? `${alert.confidence}%` : "-"}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-[13px] text-gray-600">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "-"}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className={`flex items-center gap-1.5 text-[13px] font-medium ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'high' ? 'text-orange-600' : 'text-green-600'}`}>
                          {alert.severity}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                          ${alert.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {alert.status}
                        </span>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      ) : (
        /* Configuration Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-gray-100 rounded-xl">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Per Exam Biometric Settings</CardTitle>
              <CardDescription>Configure validation thresholds and rules for specific exams.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Exam Context</label>
                  <Select defaultValue="upsc">
                    <SelectTrigger className="w-full h-11 border-blue-500 ring-2 ring-blue-100 rounded-lg text-gray-900">
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upsc">UPSC Civil Services 2024</SelectItem>
                      <SelectItem value="ssc">SSC CGL 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Face Match Threshold %</div>
                      <div className="text-xs text-gray-500">Minimum percentage required for auto-approval</div>
                    </div>
                    <div className="w-24">
                      <Input type="number" defaultValue="80" className="h-10 text-right" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Allow Mismatch Approval</div>
                      <div className="text-xs text-gray-500">Let operators approve candidates below threshold (with logging)</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Minimum Verification Time</div>
                      <div className="text-xs text-gray-500">Seconds required per candidate (triggers rapid speed alert)</div>
                    </div>
                    <div className="w-24">
                      <Input type="number" defaultValue="15" className="h-10 text-right" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-xl">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Time & Activity Restrictions</CardTitle>
              <CardDescription>Control when biometric operations are permitted.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Exam End Time</div>
                    <div className="text-xs text-gray-500">Official scheduled end time for selected exam</div>
                  </div>
                  <div className="w-40">
                    <Input type="time" defaultValue="17:00" className="h-10" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Grace Period (Minutes)</div>
                    <div className="text-xs text-gray-500">Allowed post-exam buffer before flagging</div>
                  </div>
                  <div className="w-24">
                    <Input type="number" defaultValue="30" className="h-10 text-right" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <div className="font-bold text-red-900 text-sm">Strict Mode</div>
                    <div className="text-xs text-red-700 mt-1 pr-6">Completely BLOCK all post-exam biometric activity instead of just alerting.</div>
                  </div>
                  <Switch />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-bold text-blue-900 text-sm mb-2">Automated Protections Active</div>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                    <li>Invalid/Wrong Photo Detection (Wall/Paper/Covered)</li>
                    <li>Operator Self-Face Detection</li>
                    <li>Duplicate Image Hash Detection</li>
                    <li>Device Clock Tampering Protection</li>
                  </ul>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-100">
                   <Button className="bg-blue-600 hover:bg-blue-700">Save Configuration</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}