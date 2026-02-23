import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Smartphone, RefreshCw, LogOut, Shield, ShieldOff, Wifi, WifiOff,
  Battery, Search, Tablet, CheckCircle, XCircle, Clock, Monitor, Signal
} from "lucide-react";

export default function DeviceManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState<string>("all");

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["/api/devices"],
    queryFn: () => api.devices.list(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const selectedExamId = examFilter !== "all" ? Number(examFilter) : undefined;

  const filteredDevices = devices.filter((d: any) => {
    const matchesExam = !selectedExamId || d.examId === selectedExamId;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (d.operatorName || "").toLowerCase().includes(q) ||
      (d.centerName || "").toLowerCase().includes(q) ||
      (d.model || "").toLowerCase().includes(q) ||
      (d.macAddress || "").toLowerCase().includes(q) ||
      (d.imei || "").toLowerCase().includes(q) ||
      (d.centreCode || "").toLowerCase().includes(q);
    return matchesExam && matchesSearch;
  });

  const totalDevices = filteredDevices.length;
  const loggedInDevices = filteredDevices.filter((d: any) => d.loginStatus === "Logged In").length;
  const mdmActiveDevices = filteredDevices.filter((d: any) => d.mdmStatus === "Active").length;
  const syncedRecently = filteredDevices.filter((d: any) => d.lastSyncAt).length;

  const syncAllMutation = useMutation({
    mutationFn: () => api.devices.syncAll(selectedExamId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Sync Triggered", description: data.message });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => api.devices.logoutAll(selectedExamId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Logout Complete", description: data.message });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const releaseMdmAllMutation = useMutation({
    mutationFn: () => api.devices.releaseMdm(selectedExamId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "MDM Released", description: data.message });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const syncOneMutation = useMutation({
    mutationFn: (id: number) => api.devices.syncOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device synced" });
    },
  });

  const logoutOneMutation = useMutation({
    mutationFn: (id: number) => api.devices.logoutOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device logged out" });
    },
  });

  const releaseMdmOneMutation = useMutation({
    mutationFn: (id: number) => api.devices.releaseMdm(undefined, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "MDM released for device" });
    },
  });

  const unbindMutation = useMutation({
    mutationFn: (id: number) => api.devices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device unbound" });
    },
  });

  const getBatteryColor = (level: number | null) => {
    if (!level) return "text-gray-400";
    if (level > 60) return "text-green-600";
    if (level > 30) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Device Management</h1>
          <p className="text-gray-500 text-[15px]">Monitor, sync, and control all connected devices</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Exam:</label>
          <select
            className="border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            data-testid="select-exam-filter"
          >
            <option value="all">All Exams</option>
            {exams.map((exam: any) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <Button
          onClick={() => syncAllMutation.mutate()}
          disabled={syncAllMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
          data-testid="button-sync-all"
        >
          {syncAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sync All Devices
        </Button>

        <Button
          onClick={() => logoutAllMutation.mutate()}
          disabled={logoutAllMutation.isPending}
          variant="outline"
          className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-2"
          data-testid="button-logout-all"
        >
          {logoutAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Logout All Devices
        </Button>

        <Button
          onClick={() => releaseMdmAllMutation.mutate()}
          disabled={releaseMdmAllMutation.isPending}
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
          data-testid="button-release-mdm-all"
        >
          {releaseMdmAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
          Release MDM (All)
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Total Devices</div>
              <div className="text-3xl font-bold text-gray-900 mt-1" data-testid="text-total-devices">{totalDevices}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Tablet className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Logged In</div>
              <div className="text-3xl font-bold text-green-600 mt-1" data-testid="text-logged-in">{loggedInDevices}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">MDM Active</div>
              <div className="text-3xl font-bold text-orange-600 mt-1" data-testid="text-mdm-active">{mdmActiveDevices}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Shield className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Last Synced</div>
              <div className="text-3xl font-bold text-blue-600 mt-1" data-testid="text-synced">{syncedRecently}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Signal className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <Input
              placeholder="Search operator, centre, model, IMEI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-lg"
              data-testid="input-search-device"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""} found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 font-semibold tracking-wider">S.No</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Operator</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Centre</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Device Model</th>
                <th className="px-4 py-3 font-semibold tracking-wider">IMEI / MAC</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Android</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Battery</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Login</th>
                <th className="px-4 py-3 font-semibold tracking-wider">MDM</th>
                <th className="px-4 py-3 font-semibold tracking-wider">Last Sync</th>
                <th className="px-4 py-3 font-semibold tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={11} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : filteredDevices.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400">No devices found</td></tr>
              ) : (
                filteredDevices.map((device: any, index: number) => (
                  <tr key={device.id} className="hover:bg-blue-50/30 transition-colors" data-testid={`row-device-${device.id}`}>
                    <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{device.operatorName || "—"}</div>
                      <div className="text-xs text-gray-400">{device.examName || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-700">{device.centerName || "—"}</div>
                      <div className="text-xs text-gray-400">{device.centreCode || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{device.model || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      <div>{device.imei || "—"}</div>
                      <div className="text-gray-400">{device.macAddress || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{device.androidVersion ? `v${device.androidVersion}` : "—"}</td>
                    <td className="px-4 py-3">
                      {device.batteryLevel != null ? (
                        <div className="flex items-center gap-1.5">
                          <Battery className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`} />
                          <span className={`font-semibold ${getBatteryColor(device.batteryLevel)}`}>{device.batteryLevel}%</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {device.loginStatus === "Logged In" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 shadow-none text-xs gap-1">
                          <CheckCircle className="w-3 h-3" /> Logged In
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none text-xs gap-1">
                          <XCircle className="w-3 h-3" /> Logged Out
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {device.mdmStatus === "Active" ? (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-none text-xs gap-1">
                          <Shield className="w-3 h-3" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none text-xs gap-1">
                          <ShieldOff className="w-3 h-3" /> Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">{device.lastSyncAt || "Never"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => syncOneMutation.mutate(device.id)}
                          disabled={syncOneMutation.isPending}
                          title="Sync this device"
                          data-testid={`button-sync-${device.id}`}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => logoutOneMutation.mutate(device.id)}
                          disabled={logoutOneMutation.isPending || device.loginStatus !== "Logged In"}
                          title="Logout this device"
                          data-testid={`button-logout-${device.id}`}
                        >
                          <LogOut className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => releaseMdmOneMutation.mutate(device.id)}
                          disabled={releaseMdmOneMutation.isPending || device.mdmStatus !== "Active"}
                          title="Release MDM lock"
                          data-testid={`button-release-mdm-${device.id}`}
                        >
                          <ShieldOff className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-gray-500 border-gray-200 hover:bg-gray-50"
                          onClick={() => unbindMutation.mutate(device.id)}
                          disabled={unbindMutation.isPending}
                          title="Unbind device"
                          data-testid={`button-unbind-${device.id}`}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between border-t border-gray-100 text-sm text-gray-500 bg-gray-50/50">
          <div className="font-medium">Showing {filteredDevices.length} of {devices.length} devices</div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-blue-500" /> Sync
            </div>
            <div className="flex items-center gap-1.5">
              <LogOut className="w-3 h-3 text-orange-500" /> Logout
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldOff className="w-3 h-3 text-red-500" /> Release MDM
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3 h-3 text-gray-500" /> Unbind
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
