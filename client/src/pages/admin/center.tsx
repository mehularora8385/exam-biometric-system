import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, MapPin, Search, Edit, Trash2, Plus, Filter, Loader2 } from "lucide-react";

export default function CenterMaster() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    examId: "",
    city: "",
    state: "",
    address: "",
    capacity: "",
  });

  const queryClient = useQueryClient();

  const { data: centersData = [], isLoading } = useQuery({
    queryKey: ["centers"],
    queryFn: () => api.centers.list(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.centers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centers"] });
      setIsModalOpen(false);
      setFormData({ code: "", name: "", examId: "", city: "", state: "", address: "", capacity: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.centers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centers"] });
    },
  });

  const handleEditClick = () => {
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("add");
    setFormData({ code: "", name: "", examId: "", city: "", state: "", address: "", capacity: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (modalMode === "add") {
      createMutation.mutate({
        code: formData.code,
        name: formData.name,
        examId: formData.examId ? parseInt(formData.examId) : undefined,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const uniqueCities = new Set(centersData.map((c: any) => c.city).filter(Boolean));

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
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Centres Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage examination centres</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px] h-10 pl-9 border-blue-200 text-blue-900 bg-white shadow-sm ring-offset-0 focus:ring-1 focus:ring-blue-500 rounded-lg">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {exams.map((exam: any) => (
                  <SelectItem key={exam.id} value={String(exam.id)}>{exam.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-4 rounded-lg font-medium"
            onClick={handleAddClick}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Centre
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{centersData.length}</div>
              <div className="text-sm font-medium text-gray-500">Total Centres</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{uniqueCities.size}</div>
              <div className="text-sm font-medium text-gray-500">Cities</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl invisible md:visible">
          <CardContent className="p-6 flex items-center gap-4 opacity-50">
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search centres..." 
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
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6">Code ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Centre Name ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Exam ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Location</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Address</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Capacity ↑↓</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {centersData.map((center: any, idx: number) => (
                <TableRow key={center.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 pl-6 font-medium text-blue-600 text-[13px]">{center.code}</TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-900 font-medium">{center.name}</TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-600">{center.examName}</TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {center.city}, {center.state}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-600">{center.address}</TableCell>
                  <TableCell className="py-4 text-[13px] text-gray-900 font-medium">{center.capacity}</TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        onClick={handleEditClick}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        onClick={() => handleDelete(center.id)}
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
          <div>Showing 1 to {centersData.length} of {centersData.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 border-gray-200" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-600">1</Button>
            <Button variant="outline" size="sm" className="h-8 border-gray-200">Next</Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-xl rounded-2xl">
          <DialogHeader className="p-6 border-b border-gray-100 bg-white">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {modalMode === "edit" ? "Edit Centre" : "Add Centre"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 bg-white space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Centre Code</label>
                <Input 
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. DEL001" 
                  className="h-11 rounded-lg border-gray-200 shadow-sm" 
                />
                <p className="text-xs text-gray-500">Unique identifier for this centre</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Capacity</label>
                <Input 
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g. 500" 
                  className="h-11 rounded-lg border-gray-200 shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Exam</label>
              <Select 
                value={formData.examId}
                onValueChange={(val) => setFormData({ ...formData, examId: val })}
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200 shadow-sm w-full text-left">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam.id} value={String(exam.id)}>{exam.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Centre Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Delhi Public School" 
                className="h-11 rounded-lg border-gray-200 shadow-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <Input 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter street address" 
                className="h-11 rounded-lg border-gray-200 shadow-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">City</label>
                <Input 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. New Delhi" 
                  className="h-11 rounded-lg border-gray-200 shadow-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">State</label>
                <Input 
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Delhi" 
                  className="h-11 rounded-lg border-gray-200 shadow-sm" 
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
            <Button 
              variant="outline" 
              className="px-6 h-11 border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-100"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {modalMode === "edit" ? "Update Centre" : "Add Centre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}