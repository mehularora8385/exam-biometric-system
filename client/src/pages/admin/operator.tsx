import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, UserCheck, Smartphone, Search, Edit, Trash2, PowerOff, RefreshCw, Loader2 } from "lucide-react";

export default function OperatorMaster() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all_centres");
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", centerId: "", status: "Active" });

  const { data: operatorsData = [], isLoading } = useQuery({
    queryKey: ["operators"],
    queryFn: api.operators.list,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const { data: centers = [] } = useQuery({
    queryKey: ["centers"],
    queryFn: () => api.centers.list(),
  });

  const createMutation = useMutation({
    mutationFn: api.operators.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.operators.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.operators.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });

  const centerIdsForExam = new Set<string>();
  if (examFilter !== "all") {
    centers.forEach((c: any) => {
      if (c.examId?.toString() === examFilter) {
        centerIdsForExam.add(c.id.toString());
      }
    });
  }

  const filteredOperators = operatorsData.filter((op: any) => {
    const matchesSearch = !searchQuery ||
      op.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.phone?.includes(searchQuery) ||
      op.email?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesExam = true;
    if (examFilter !== "all") {
      if (op.examId) {
        matchesExam = op.examId.toString() === examFilter;
      } else if (op.centerId) {
        matchesExam = centerIdsForExam.has(op.centerId.toString());
      } else {
        matchesExam = false;
      }
    }

    const matchesCentre = centerFilter === "all_centres" || op.centerId?.toString() === centerFilter || op.center === centerFilter;

    return matchesSearch && matchesExam && matchesCentre;
  });

  const totalOperators = filteredOperators.length;
  const activeOperators = filteredOperators.filter((op: any) => op.status === "Active").length;
  const deviceBound = filteredOperators.filter((op: any) => op.device && op.device !== "Not bound").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Operators Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage verification operators and device bindings</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={examFilter} onValueChange={setExamFilter}>
            <SelectTrigger className="w-[180px] h-10 border-blue-200 text-blue-900 bg-white shadow-sm rounded-lg">
              <SelectValue placeholder="All Exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={exam.id.toString()}>
                  {exam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={centerFilter} onValueChange={setCenterFilter}>
            <SelectTrigger className="w-[200px] h-10 border-gray-200 text-gray-700 bg-white shadow-sm rounded-lg">
              <SelectValue placeholder="All Centres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_centres">All Centres</SelectItem>
              {centers.map((center: any) => (
                <SelectItem key={center.id} value={center.id.toString()}>
                  {center.code ? `${center.code} - ${center.name}` : center.name}
                </SelectItem>
              ))}
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
              <div className="text-2xl font-bold text-gray-900" data-testid="text-total-operators">{totalOperators}</div>
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
              <div className="text-2xl font-bold text-gray-900" data-testid="text-active-operators">{activeOperators}</div>
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
              <div className="text-2xl font-bold text-gray-900" data-testid="text-device-bound">{deviceBound}</div>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {filteredOperators.map((operator: any, idx: number) => (
                <TableRow key={operator.id ?? idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div>
                      <div className="font-medium text-gray-900 text-[13px]">{operator.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{operator.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-600">{operator.email}</TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-900">{operator.centerName || operator.center}</TableCell>
                  <TableCell className="py-4 text-[13px]">
                    {operator.device && operator.device !== "Not bound" ? (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Smartphone className="w-3.5 h-3.5 text-green-500" />
                        {operator.device}
                      </div>
                    ) : (
                      <span className="text-gray-400">{operator.device || "Not bound"}</span>
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
                        <button
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Deactivate"
                          data-testid={`button-deactivate-${operator.id ?? idx}`}
                          onClick={() => updateMutation.mutate({ id: operator.id, status: "Inactive" })}
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors"
                          title="Activate"
                          data-testid={`button-activate-${operator.id ?? idx}`}
                          onClick={() => updateMutation.mutate({ id: operator.id, status: "Active" })}
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      )}
                      
                      {operator.device && operator.device !== "Not bound" && (
                        <button
                          className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                          title="Unbind Device"
                          data-testid={`button-unbind-${operator.id ?? idx}`}
                          onClick={() => updateMutation.mutate({ id: operator.id, device: "Not bound" })}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                        data-testid={`button-edit-${operator.id ?? idx}`}
                        onClick={() => {
                          setEditId(operator.id);
                          setEditForm({
                            name: operator.name || "",
                            phone: operator.phone || "",
                            email: operator.email || "",
                            centerId: operator.centerId?.toString() || "",
                            status: operator.status || "Active",
                          });
                          setEditOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                        data-testid={`button-delete-${operator.id ?? idx}`}
                        onClick={() => operator.id && deleteMutation.mutate(operator.id)}
                      >
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
          <div>Showing 1 to {filteredOperators.length} of {operatorsData.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 border-gray-200" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-600">1</Button>
            <Button variant="outline" size="sm" className="h-8 border-gray-200">Next</Button>
          </div>
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditId(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Operator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                data-testid="input-edit-operator-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Operator name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                data-testid="input-edit-operator-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                data-testid="input-edit-operator-email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Centre</Label>
              <Select value={editForm.centerId} onValueChange={(val) => setEditForm({ ...editForm, centerId: val })}>
                <SelectTrigger data-testid="select-edit-operator-center">
                  <SelectValue placeholder="Select Centre" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center: any) => (
                    <SelectItem key={center.id} value={center.id.toString()}>
                      {center.code ? `${center.code} - ${center.name}` : center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                <SelectTrigger data-testid="select-edit-operator-status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                data-testid="button-edit-operator-cancel"
                onClick={() => { setEditOpen(false); setEditId(null); }}
              >
                Cancel
              </Button>
              <Button
                data-testid="button-edit-operator-save"
                disabled={updateMutation.isPending}
                onClick={() => {
                  if (editId === null) return;
                  const selectedCenter = centers.find((c: any) => c.id.toString() === editForm.centerId);
                  updateMutation.mutate(
                    {
                      id: editId,
                      name: editForm.name,
                      phone: editForm.phone,
                      email: editForm.email,
                      centerId: editForm.centerId ? parseInt(editForm.centerId) : null,
                      centerName: selectedCenter ? (selectedCenter.code ? `${selectedCenter.code} - ${selectedCenter.name}` : selectedCenter.name) : null,
                      status: editForm.status,
                    },
                    {
                      onSuccess: () => {
                        setEditOpen(false);
                        setEditId(null);
                      },
                    }
                  );
                }}
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
