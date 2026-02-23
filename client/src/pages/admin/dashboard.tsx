import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Clock, AlertCircle, Building2, Smartphone, TrendingUp, Search, HandMetal } from "lucide-react";
import { Loader2 } from "lucide-react";

interface DashboardProps {
  selectedExamId?: number;
}

export default function Dashboard({ selectedExamId }: DashboardProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedExamId],
    queryFn: () => api.dashboard.stats(selectedExamId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalCandidates = stats?.totalCandidates ?? 0;
  const verified = stats?.verified ?? 0;
  const pending = stats?.pending ?? 0;
  const notVerified = stats?.notVerified ?? 0;
  const present = stats?.present ?? 0;
  const absent = stats?.absent ?? 0;
  const totalCenters = stats?.totalCenters ?? 0;
  const activeCenters = stats?.activeCenters ?? 0;
  const totalOperators = stats?.totalOperators ?? 0;
  const activeOperators = stats?.activeOperators ?? 0;
  const totalAlerts = stats?.totalAlerts ?? 0;
  const centerStats = stats?.centerStats ?? [];

  const verifiedPct = totalCandidates > 0 ? Math.round((verified / totalCandidates) * 100) : 0;
  const presentPct = totalCandidates > 0 ? Math.round((present / totalCandidates) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-[15px]">Overview of all exams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col justify-between">
              <span className="text-[15px] font-medium text-gray-500">Total Candidates</span>
              <span data-testid="text-total-candidates" className="text-3xl font-bold text-gray-900 mt-2">{totalCandidates.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-gray-500">Verified</span>
                <span data-testid="text-verified" className="text-3xl font-bold text-gray-900 mt-2">{verified.toLocaleString()}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-500">{verifiedPct}% complete</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Pending</span>
              <span data-testid="text-pending" className="text-3xl font-bold text-gray-900 mt-2">{pending.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Not Verified</span>
              <span data-testid="text-not-verified" className="text-3xl font-bold text-gray-900 mt-2">{notVerified.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Present</span>
              <span data-testid="text-present" className="text-3xl font-bold text-blue-600 mt-2">{present.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <HandMetal className="w-6 h-6" />
            </div>
          </CardContent>
          <div className="px-5 pb-4 text-sm">
            <span className="text-gray-500">{presentPct}% attendance</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-none bg-[#f0f7ff] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-800">Active Centres</div>
              <div data-testid="text-active-centres" className="text-xl font-bold text-gray-900">{activeCenters}/{totalCenters}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#f0fdf4] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100/50 flex items-center justify-center text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-green-800">Active Operators</div>
              <div data-testid="text-active-operators" className="text-xl font-bold text-gray-900">{activeOperators}/{totalOperators}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#faf5ff] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-purple-800">Synced Devices</div>
              <div className="text-xl font-bold text-gray-900">{activeOperators}/{totalOperators}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#fffbeb] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-yellow-800">Total Alerts</div>
              <div data-testid="text-total-alerts" className="text-xl font-bold text-gray-900">{totalAlerts}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-8 text-[17px]">Centre-wise Verification & Attendance</h3>
            <div className="h-64 flex items-end justify-around gap-2 px-4 border-l border-b border-gray-100 pb-2 relative">
              <div className="absolute left-[-40px] top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-0">
                <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
              </div>
              
              <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[25%]" />
              <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[50%]" />
              <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[75%]" />
              
              {centerStats.map((cs: any, i: number) => {
                const total = cs.total || 1;
                const vPct = (cs.verified / total) * 100;
                const pPct = (cs.pending / total) * 100;
                const nPct = ((total - cs.verified - cs.pending) / total) * 100;
                const prPct = ((cs.present || 0) / total) * 100;
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full relative z-10 w-full hover:bg-gray-50/50 rounded-t-lg transition-colors cursor-pointer group/bar">
                    <div className="flex items-end gap-1 h-full w-full justify-center">
                      <div className="w-[18%] max-w-[12px] bg-green-500 rounded-t-sm transition-all" style={{ height: `${vPct}%` }} />
                      <div className="w-[18%] max-w-[12px] bg-amber-500 rounded-t-sm transition-all" style={{ height: `${pPct}%` }} />
                      <div className="w-[18%] max-w-[12px] bg-red-500 rounded-t-sm transition-all" style={{ height: `${nPct}%` }} />
                      <div className="w-[18%] max-w-[12px] bg-blue-500 rounded-t-sm transition-all" style={{ height: `${prPct}%` }} />
                    </div>
                    <div className="absolute -bottom-7 text-[11px] text-gray-500 whitespace-nowrap">{cs.code}</div>
                    
                    <div className="absolute top-0 bg-white shadow-xl rounded-lg p-3 border border-gray-100 w-44 z-50 text-xs hidden group-hover/bar:block">
                      <div className="font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{cs.code} - {cs.name}</div>
                      <div className="flex justify-between text-green-600 mb-1"><span>Verified:</span> <span className="font-bold">{cs.verified}</span></div>
                      <div className="flex justify-between text-amber-500 mb-1"><span>Pending:</span> <span className="font-bold">{cs.pending}</span></div>
                      <div className="flex justify-between text-red-500 mb-1"><span>Not Verified:</span> <span className="font-bold">{total - cs.verified - cs.pending}</span></div>
                      <div className="flex justify-between text-blue-600"><span>Present:</span> <span className="font-bold">{cs.present || 0}</span></div>
                    </div>
                  </div>
                );
              })}
              {centerStats.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No centre data</div>
              )}
            </div>
            <div className="flex justify-center gap-5 mt-8 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> <span className="text-gray-500">Verified</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> <span className="text-gray-500">Pending</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> <span className="text-gray-500">Not Verified</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> <span className="text-gray-500">Present</span></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-[17px]">Attendance & Verification</h3>
            <div className="flex flex-col justify-center items-center h-64 mt-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    const total = totalCandidates || 1;
                    const circumference = 251.2;
                    const vAngle = (verified / total) * circumference;
                    const pAngle = (pending / total) * circumference;
                    const nAngle = (notVerified / total) * circumference;
                    const vRotate = 0;
                    const pRotate = (verified / total) * 360;
                    const nRotate = pRotate + (pending / total) * 360;
                    return (
                      <>
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="15" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="15" strokeDasharray={`${circumference}`} strokeDashoffset={circumference - vAngle} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray={`${circumference}`} strokeDashoffset={circumference - pAngle} style={{ transform: `rotate(${pRotate}deg)`, transformOrigin: '50px 50px' }} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="15" strokeDasharray={`${circumference}`} strokeDashoffset={circumference - nAngle} style={{ transform: `rotate(${nRotate}deg)`, transformOrigin: '50px 50px' }} />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{presentPct}%</div>
                    <div className="text-xs text-gray-500">Present</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-6 text-xs font-medium w-full max-w-[280px]">
                <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> <span className="text-gray-500">Verified</span></div> <span className="font-bold text-gray-700">{verified}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> <span className="text-gray-500">Pending</span></div> <span className="font-bold text-gray-700">{pending}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> <span className="text-gray-500">Not Verified</span></div> <span className="font-bold text-gray-700">{notVerified}</span></div>
                <div className="flex items-center justify-between border-t pt-2 mt-1"><div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> <span className="text-gray-600 font-semibold">Present</span></div> <span className="font-bold text-blue-600">{present}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> <span className="text-gray-500">Absent</span></div> <span className="font-bold text-gray-700">{absent}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 h-full flex items-center justify-around">
            <CircularProgress value={verifiedPct} label="Verified" sublabel={`${verified.toLocaleString()} / ${totalCandidates.toLocaleString()}`} strokeClass="stroke-green-500" />
            <CircularProgress value={presentPct} label="Present" sublabel={`${present.toLocaleString()} / ${totalCandidates.toLocaleString()}`} strokeClass="stroke-blue-600" />
            <CircularProgress value={totalOperators > 0 ? Math.round((activeOperators / totalOperators) * 100) : 0} label="Operators" sublabel={`${activeOperators} / ${totalOperators}`} strokeClass="stroke-indigo-500" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-[17px]">Centre Performance</h3>
            <div className="space-y-3">
              {centerStats.slice(0, 6).map((cs: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-20 truncate">{cs.code}</span>
                  <span className="text-xs text-gray-400 w-32 truncate">{cs.name}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${cs.progress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-10 text-right">{cs.progress}%</span>
                  <span className="text-xs font-medium text-blue-600 w-16 text-right">{cs.present || 0} prsnt</span>
                </div>
              ))}
              {centerStats.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">No centre data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-[17px]">Centre-wise Statistics</h3>
          <p className="text-gray-500 text-[13px] mt-1">Detailed breakdown by examination centre</p>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search centres..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            Show
            <select className="border border-gray-200 rounded-md bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            entries
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Code</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Centre Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Total</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Verified</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Pending</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Present</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Operators</th>
                <th className="px-6 py-4 font-semibold tracking-wider min-w-[150px]">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {centerStats.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-600">{row.code}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{(row.total || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{(row.verified || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-amber-500">{(row.pending || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">{(row.present || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-green-600">{row.operators}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8">{row.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {centerStats.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No centre data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 text-sm text-gray-500 bg-gray-50/50">
          <div className="mb-4 sm:mb-0 font-medium">Showing 1 to {centerStats.length} of {centerStats.length} entries</div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 text-gray-400 cursor-not-allowed hover:bg-gray-100 rounded">&#171;</button>
            <button className="px-2 py-1 text-gray-400 cursor-not-allowed hover:bg-gray-100 rounded">&#8249;</button>
            <button className="px-3 py-1 bg-white border border-gray-200 rounded-md font-medium text-gray-700 shadow-sm">Page 1 of 1</button>
            <button className="px-2 py-1 text-gray-400 cursor-not-allowed hover:bg-gray-100 rounded">&#8250;</button>
            <button className="px-2 py-1 text-gray-400 cursor-not-allowed hover:bg-gray-100 rounded">&#187;</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CircularProgress({ value, label, sublabel, strokeClass }: { value: number, label: string, sublabel: string, strokeClass: string }) {
  const dashoffset = 226 - (226 * value) / 100;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
          <circle 
            cx="50" cy="50" r="36" 
            fill="transparent" 
            className={strokeClass} 
            strokeWidth="10" 
            strokeDasharray="226" 
            strokeDashoffset={dashoffset} 
            strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-gray-900">{value}%</div>
      </div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sublabel}</div>
    </div>
  );
}
