import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DeviceMapping() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["/api/devices"],
    queryFn: () => api.devices.list(),
  });

  const unbindMutation = useMutation({
    mutationFn: (id: number) => api.devices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: "Device unbound successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = devices.filter((d: any) =>
    !search || (d.operatorName || d.operator || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.centerName || d.center || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.deviceModel || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.deviceId || "").toLowerCase().includes(search.toLowerCase())
  );

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
              <Input className="h-8 w-48" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-device" />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">No devices found</TableCell>
                </TableRow>
              ) : (
                filtered.map((device: any, index: number) => (
                  <TableRow key={device.id} data-testid={`row-device-${device.id}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{device.operatorName || device.operator || "—"}</TableCell>
                    <TableCell>{device.centerName || device.center || "—"}</TableCell>
                    <TableCell>{device.deviceModel || device.model || "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{device.deviceId || device.macAddress || device.imei || "—"}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none"><Lock className="w-3 h-3 mr-1" /> {device.status || "Bound"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => unbindMutation.mutate(device.id)} disabled={unbindMutation.isPending} data-testid={`button-unbind-device-${device.id}`}>
                        <Unlock className="w-4 h-4 mr-1" /> Unbind
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}