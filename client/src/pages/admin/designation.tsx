import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function DesignationMaster() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [search, setSearch] = useState("");

  const { data: designations = [], isLoading } = useQuery({
    queryKey: ["/api/designations"],
    queryFn: () => api.designations.list(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
    queryFn: () => api.departments.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.designations.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      setIsAddOpen(false);
      setName("");
      setDepartmentId("");
      toast({ title: "Designation created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.designations.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      setEditingItem(null);
      setName("");
      setDepartmentId("");
      toast({ title: "Designation updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.designations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      toast({ title: "Designation deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = designations.filter((d: any) =>
    !search || (d.name || "").toLowerCase().includes(search.toLowerCase()) || (d.departmentName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!name.trim()) return;
    const data: any = { name };
    if (departmentId) data.departmentId = parseInt(departmentId);
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Designation</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Designation Master</h3>
          <Dialog open={isAddOpen || !!editingItem} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditingItem(null); setName(""); setDepartmentId(""); } else { setIsAddOpen(true); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#1cc88a] hover:bg-[#17a673] text-white gap-2" data-testid="button-add-designation">
                <Plus className="w-4 h-4" /> Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Designation" : "Add Designation"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="--Select Department--" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Designation Name <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter designation name" data-testid="input-designation-name" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditingItem(null); setName(""); setDepartmentId(""); }}>Close</Button>
                <Button className="bg-[#4e73df] hover:bg-[#2e59d9]" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-designation">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save
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
              <Input className="h-8 w-48" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-designation" />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No designations found</TableCell>
                </TableRow>
              ) : (
                filtered.map((item: any, index: number) => (
                  <TableRow key={item.id} data-testid={`row-designation-${item.id}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.departmentName || item.department || "—"}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">{item.status || "Active"}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" onClick={() => { setEditingItem(item); setName(item.name); setDepartmentId(item.departmentId ? String(item.departmentId) : ""); }} data-testid={`button-edit-designation-${item.id}`}><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-designation-${item.id}`}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
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