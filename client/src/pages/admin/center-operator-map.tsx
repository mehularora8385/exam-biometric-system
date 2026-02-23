import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Map, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CenterOperatorMap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    examId: "",
    centerId: "",
    operatorId: "",
    deviceTypes: ["face", "fingerprint"] as string[],
  });

  const { data: maps = [], isLoading } = useQuery({
    queryKey: ["/api/center-operator-maps"],
    queryFn: () => api.centerOperatorMaps.list(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
    queryFn: () => api.exams.list(),
  });

  const { data: centers = [] } = useQuery({
    queryKey: ["/api/centers"],
    queryFn: () => api.centers.list(),
  });

  const { data: operators = [] } = useQuery({
    queryKey: ["/api/operators"],
    queryFn: () => api.operators.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.centerOperatorMaps.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/center-operator-maps"] });
      setIsMapModalOpen(false);
      setFormData({ examId: "", centerId: "", operatorId: "", deviceTypes: ["face", "fingerprint"] });
      toast({ title: "Mapping created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.centerOperatorMaps.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/center-operator-maps"] });
      toast({ title: "Mapping deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = maps.filter((m: any) =>
    !search || (m.centerName || "").toLowerCase().includes(search.toLowerCase()) || (m.operatorName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    const data: any = {
      examId: formData.examId ? parseInt(formData.examId) : undefined,
      centerId: formData.centerId ? parseInt(formData.centerId) : undefined,
      operatorId: formData.operatorId ? parseInt(formData.operatorId) : undefined,
      deviceTypes: formData.deviceTypes,
    };
    createMutation.mutate(data);
  };

  const toggleDeviceType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      deviceTypes: prev.deviceTypes.includes(type)
        ? prev.deviceTypes.filter((t) => t !== type)
        : [...prev.deviceTypes, type],
    }));
  };

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
              <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2" data-testid="button-map-operator">
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
                  <Select value={formData.examId} onValueChange={(v) => setFormData((p) => ({ ...p, examId: v }))}>
                    <SelectTrigger><SelectValue placeholder="--Select Exam--" /></SelectTrigger>
                    <SelectContent>
                      {exams.map((exam: any) => (
                        <SelectItem key={exam.id} value={String(exam.id)}>{exam.name || exam.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Center <span className="text-red-500">*</span></Label>
                  <Select value={formData.centerId} onValueChange={(v) => setFormData((p) => ({ ...p, centerId: v }))}>
                    <SelectTrigger><SelectValue placeholder="--Select Center--" /></SelectTrigger>
                    <SelectContent>
                      {centers.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code || c.centerCode || ""})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Operator <span className="text-red-500">*</span></Label>
                  <Select value={formData.operatorId} onValueChange={(v) => setFormData((p) => ({ ...p, operatorId: v }))}>
                    <SelectTrigger><SelectValue placeholder="--Select Operator--" /></SelectTrigger>
                    <SelectContent>
                      {operators.map((op: any) => (
                        <SelectItem key={op.id} value={String(op.id)}>{op.name} ({op.code || op.operatorCode || ""})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <Label>Device Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={formData.deviceTypes.includes("face")} onChange={() => toggleDeviceType("face")} /> Face</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={formData.deviceTypes.includes("fingerprint")} onChange={() => toggleDeviceType("fingerprint")} /> Fingerprint</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={formData.deviceTypes.includes("omr")} onChange={() => toggleDeviceType("omr")} /> OMR</label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsMapModalOpen(false)}>Close</Button>
                <Button className="bg-[#4e73df] hover:bg-[#2e59d9]" onClick={handleSave} disabled={createMutation.isPending} data-testid="button-save-mapping">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Mapping
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select className="border rounded p-1.5 text-sm w-40 text-slate-600">
                <option>--Select Exam--</option>
                {exams.map((exam: any) => (
                  <option key={exam.id} value={exam.id}>{exam.name || exam.title}</option>
                ))}
              </select>
              <select className="border rounded p-1.5 text-sm w-40 text-slate-600">
                <option>--Select Center--</option>
                {centers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button size="sm" className="bg-[#4e73df] hover:bg-[#2e59d9]">Search</Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Search:</span>
              <Input className="h-8 w-48" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-mapping" />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">No mappings found</TableCell>
                </TableRow>
              ) : (
                filtered.map((item: any, index: number) => (
                  <TableRow key={item.id} data-testid={`row-mapping-${item.id}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.centerName || "—"}</TableCell>
                    <TableCell>{item.examName || "—"}</TableCell>
                    <TableCell>{item.examDate || "—"}</TableCell>
                    <TableCell>{item.operatorName || "—"}</TableCell>
                    <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">{item.status || "Active"}</span></TableCell>
                    <TableCell className="text-sm text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-100" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-mapping-${item.id}`}><Trash2 className="w-4 h-4" /></Button>
                      </div>
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