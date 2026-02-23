import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, UserCheck, Clock, XCircle, UserX, CheckCircle2, Search, Filter, Download, FileText, Eye, ImageIcon, Fingerprint, Loader2 } from "lucide-react";

export default function Candidates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const { data: candidatesData = [], isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => api.candidates.list(),
  });

  const totalCount = candidatesData.length;
  const verifiedCount = candidatesData.filter((c: any) => c.status === "Verified").length;
  const pendingCount = candidatesData.filter((c: any) => c.status === "Pending").length;
  const notVerifiedCount = candidatesData.filter((c: any) => c.status === "Not Verified").length;
  const presentCount = candidatesData.filter((c: any) => c.status === "Present").length;
  const percentDone = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  const handleViewDetails = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "text-green-700 bg-green-50";
      case "Pending": return "text-yellow-700 bg-yellow-50";
      case "Present": return "text-blue-700 bg-blue-50";
      case "Not Verified": return "text-red-700 bg-red-50";
      default: return "text-gray-700 bg-gray-50";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      case "Present": return "bg-blue-500";
      case "Not Verified": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Candidates Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage examination candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-gray-200 text-gray-700 bg-white h-10 px-4 rounded-lg font-medium shadow-sm gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="border-gray-200 text-gray-700 bg-white h-10 px-4 rounded-lg font-medium shadow-sm gap-2">
            <Download className="w-4 h-4" /> Excel
          </Button>
          <Button variant="outline" className="border-gray-200 text-gray-700 bg-white h-10 px-4 rounded-lg font-medium shadow-sm gap-2">
            <FileText className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900" data-testid="text-total-count">{totalCount}</div>
              <div className="text-xs font-medium text-gray-500">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900" data-testid="text-verified-count">{verifiedCount}</div>
              <div className="text-xs font-medium text-gray-500">Verified</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900" data-testid="text-pending-count">{pendingCount}</div>
              <div className="text-xs font-medium text-gray-500">Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900" data-testid="text-not-verified-count">{notVerifiedCount}</div>
              <div className="text-xs font-medium text-gray-500">Not Verified</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <UserX className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900" data-testid="text-present-count">{presentCount}</div>
              <div className="text-xs font-medium text-gray-500">Present</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900" data-testid="text-percent-done">{percentDone}%</div>
              <div className="text-xs font-medium text-gray-500">% Done</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-5 flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-gray-600">Exam</label>
            <Select defaultValue="upsc">
              <SelectTrigger className="w-full h-10 border-gray-200">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upsc">UPSC Civil Services 2024</SelectItem>
                <SelectItem value="ssc">SSC CGL 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-600">Centre</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full h-10 border-gray-200">
                <SelectValue placeholder="All Centres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centres</SelectItem>
                <SelectItem value="del001">Delhi Public School</SelectItem>
                <SelectItem value="del002">Kendriya Vidyalaya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-600">Slot</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full h-10 border-gray-200">
                <SelectValue placeholder="All Slots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Slots</SelectItem>
                <SelectItem value="morning">Morning Slot</SelectItem>
                <SelectItem value="afternoon">Afternoon Slot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-600">Status</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full h-10 border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" className="text-gray-500 h-10 px-4 hover:bg-gray-100">
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name, roll no, OMR no..." 
              className="pl-9 h-10 border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg shadow-sm w-full"
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
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6 w-20 text-center">Upload Photo</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 w-20 text-center">Verified Photo</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 whitespace-nowrap">OMR No. ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 whitespace-nowrap">Roll No. ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Candidate ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">DOB ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Centre ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Slot ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Match % ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4">Status ↑↓</TableHead>
                <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-4 text-center pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {candidatesData.map((candidate) => (
                <TableRow key={candidate.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-3 pl-6">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mx-auto border border-gray-200 overflow-hidden">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt="Upload" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mx-auto border border-gray-200 overflow-hidden">
                      {candidate.status === "Pending" ? (
                         <ImageIcon className="w-4 h-4 text-gray-300" />
                      ) : candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt="Verified" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[13px] font-mono text-gray-600 whitespace-nowrap">{candidate.omrNo}</TableCell>
                  <TableCell className="py-3 text-[13px] font-mono font-medium text-gray-900 whitespace-nowrap">{candidate.rollNo}</TableCell>
                  <TableCell className="py-3">
                    <div>
                      <div className="font-medium text-gray-900 text-[13px]">{candidate.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 whitespace-nowrap">S/o {candidate.fatherName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[13px] text-gray-600 whitespace-nowrap">
                     {candidate.dob}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <div className="text-[13px] text-gray-900 font-medium">{candidate.centreCode}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[120px]">{candidate.centreName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[13px] text-gray-600">{candidate.slot}</TableCell>
                  <TableCell className="py-3">
                    <span className={`text-[13px] font-medium ${candidate.matchPercent != null && candidate.matchPercent !== '-' ? 'text-green-600' : 'text-gray-400'}`}>
                      {candidate.matchPercent != null && candidate.matchPercent !== '-' ? (typeof candidate.matchPercent === 'number' ? `${candidate.matchPercent}%` : candidate.matchPercent) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(candidate.status)}`}></div>
                      {candidate.status}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 pr-6 text-center">
                    <button 
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors mx-auto" 
                      title="View Details"
                      onClick={() => handleViewDetails(candidate)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Candidate Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 border-b border-gray-100 bg-white">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Candidate Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="p-6 bg-white space-y-6">
              {/* Photos Section */}
              <div className="flex justify-center gap-12">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Upload Photo</span>
                  <div className="w-32 h-36 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
                     {selectedCandidate.photoUrl ? (
                       <img src={selectedCandidate.photoUrl} alt="Upload" className="w-full h-full object-cover" />
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs">Upload</span>
                       </div>
                     )}
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Verified Photo</span>
                  <div className="w-32 h-36 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
                     {selectedCandidate.photoUrl && selectedCandidate.status !== "Pending" ? (
                       <img src={selectedCandidate.photoUrl} alt="Verified" className="w-full h-full object-cover" />
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs">Verified</span>
                       </div>
                     )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <div className="text-xs text-gray-500 mb-1">OMR No.</div>
                  <div className="text-[15px] font-mono font-medium text-gray-900">{selectedCandidate.omrNo}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Roll No.</div>
                  <div className="text-[15px] font-mono font-medium text-gray-900">{selectedCandidate.rollNo}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">Candidate Name</div>
                  <div className="text-[15px] font-medium text-gray-900">{selectedCandidate.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Father Name</div>
                  <div className="text-[15px] font-medium text-gray-900">{selectedCandidate.fatherName}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
                  <div className="text-[15px] font-medium text-gray-900">{selectedCandidate.dob}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedCandidate.status)}`}>
                    {selectedCandidate.status}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Centre</div>
                  <div className="text-[15px] font-medium text-gray-900">{selectedCandidate.centreCode} - {selectedCandidate.centreName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Slot</div>
                  <div className="text-[15px] font-medium text-gray-900">{selectedCandidate.slot}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Face Match</div>
                  <div className={`text-[15px] font-bold ${selectedCandidate.matchPercent != null && selectedCandidate.matchPercent !== '-' ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedCandidate.matchPercent != null && selectedCandidate.matchPercent !== '-' ? (typeof selectedCandidate.matchPercent === 'number' ? `${selectedCandidate.matchPercent}%` : selectedCandidate.matchPercent) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Verified At</div>
                  <div className="text-[15px] font-medium text-gray-900">{selectedCandidate.verifiedAt || '-'}</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="text-sm font-medium text-gray-900 mb-3">Biometric Data</div>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  <Fingerprint className="w-4 h-4 opacity-50" />
                  Not captured
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}