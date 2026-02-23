import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SlotMaster() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    examId: "",
    examDate: "",
    slotTitle: "",
    slotSequence: "",
    reportingStartTime: "",
    reportingEndTime: "",
    gateCloseTime: "",
    startTime: "",
    endTime: "",
  });

  const resetForm = () => {
    setFormData({ examId: "", examDate: "", slotTitle: "", slotSequence: "", reportingStartTime: "", reportingEndTime: "", gateCloseTime: "", startTime: "", endTime: "" });
    setEditId(null);
  };

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["/api/slots"],
    queryFn: () => api.slots.list(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["/api/exams"],
    queryFn: () => api.exams.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.slots.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      setIsAddModalOpen(false);
      resetForm();
      toast({ title: "Slot created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.slots.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      setIsAddModalOpen(false);
      resetForm();
      toast({ title: "Slot updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.slots.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots"] });
      toast({ title: "Slot deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = slots.filter((s: any) =>
    !search || (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const getExamName = (examId: number | null | undefined) => {
    if (!examId) return "—";
    const exam = exams.find((e: any) => e.id === examId);
    return exam ? (exam.name || exam.title || "—") : String(examId);
  };

  const handleSave = () => {
    const data: any = {
      name: formData.slotTitle,
      examId: formData.examId ? parseInt(formData.examId) : undefined,
      date: formData.examDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: "Active",
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (slot: any) => {
    setEditId(slot.id);
    setFormData({
      examId: String(slot.examId || ""),
      examDate: slot.date || "",
      slotTitle: slot.name || "",
      slotSequence: "",
      reportingStartTime: "",
      reportingEndTime: "",
      gateCloseTime: "",
      startTime: slot.startTime || "",
      endTime: slot.endTime || "",
    });
    setIsAddModalOpen(true);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Slot Master</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Slot Master List</h3>
          
          <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2" data-testid="button-add-slot">
                <Plus className="w-4 h-4" /> Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">{editId ? "Edit Slot" : "Add Slot"}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <Label>Exam <span className="text-red-500">*</span></Label>
                  <Select value={formData.examId} onValueChange={(v) => updateField("examId", v)}>
                    <SelectTrigger><SelectValue placeholder="--Select--" /></SelectTrigger>
                    <SelectContent>
                      {exams.map((exam: any) => (
                        <SelectItem key={exam.id} value={String(exam.id)}>{exam.name || exam.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label>Exam Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={formData.examDate} onChange={(e) => updateField("examDate", e.target.value)} data-testid="input-slot-exam-date" />
                </div>
                
                <div className="space-y-1">
                  <Label>Slot Title <span className="text-red-500">*</span></Label>
                  <Input placeholder="Enter Slot Title" value={formData.slotTitle} onChange={(e) => updateField("slotTitle", e.target.value)} data-testid="input-slot-title" />
                </div>
                
                <div className="space-y-1">
                  <Label>Slot Sequence</Label>
                  <Input placeholder="Enter Slot Sequence" type="number" value={formData.slotSequence} onChange={(e) => updateField("slotSequence", e.target.value)} data-testid="input-slot-sequence" />
                </div>
                
                <div className="space-y-1">
                  <Label>Reporting Start Time <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formData.reportingStartTime} onChange={(e) => updateField("reportingStartTime", e.target.value)} />
                </div>
                
                <div className="space-y-1">
                  <Label>Reporting End Time <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formData.reportingEndTime} onChange={(e) => updateField("reportingEndTime", e.target.value)} />
                </div>
                
                <div className="space-y-1">
                  <Label>Gate Close Time <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formData.gateCloseTime} onChange={(e) => updateField("gateCloseTime", e.target.value)} />
                </div>
                
                <div className="space-y-1">
                  <Label>Start Time <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formData.startTime} onChange={(e) => updateField("startTime", e.target.value)} />
                </div>
                
                <div className="space-y-1">
                  <Label>End Time <span className="text-red-500">*</span></Label>
                  <Input type="time" value={formData.endTime} onChange={(e) => updateField("endTime", e.target.value)} />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>Close</Button>
                <Button className="bg-[#4e73df] hover:bg-[#2e59d9]" onClick={handleSave} disabled={isSaving} data-testid="button-save-slot">
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editId ? "Update" : "Save"}
                </Button>
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
              <Input className="h-8 w-48" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-slot" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-16 whitespace-nowrap">S.No</TableHead>
                  <TableHead className="whitespace-nowrap">Exam</TableHead>
                  <TableHead className="whitespace-nowrap">Exam Date</TableHead>
                  <TableHead className="whitespace-nowrap">Slot Title</TableHead>
                  <TableHead className="whitespace-nowrap">Slot Sequence</TableHead>
                  <TableHead className="whitespace-nowrap">Start Time</TableHead>
                  <TableHead className="whitespace-nowrap">End Time</TableHead>
                  <TableHead className="whitespace-nowrap">Reporting Start Time</TableHead>
                  <TableHead className="whitespace-nowrap">Reporting End Time</TableHead>
                  <TableHead className="whitespace-nowrap">Gate Close Time</TableHead>
                  <TableHead className="whitespace-nowrap">Shift Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-slate-500">No slots found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((slot: any, index: number) => (
                    <TableRow key={slot.id} data-testid={`row-slot-${slot.id}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{getExamName(slot.examId)}</TableCell>
                      <TableCell>{slot.date || "—"}</TableCell>
                      <TableCell>{slot.name || "—"}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>{slot.startTime || "—"}</TableCell>
                      <TableCell>{slot.endTime || "—"}</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">{slot.status || "Active"}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" onClick={() => handleEdit(slot)} data-testid={`button-edit-slot-${slot.id}`}><Edit className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100" onClick={() => deleteMutation.mutate(slot.id)} data-testid={`button-delete-slot-${slot.id}`}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 flex justify-between items-center text-sm text-slate-500">
            <div>Showing 1 to {filtered.length} of {filtered.length} entries</div>
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