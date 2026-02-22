import React from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, UserCheck, Clock, AlertCircle, Building2, Smartphone, TrendingUp, Search, Shield, ChevronLeft 
} from "lucide-react";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useAppStore();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const tableData = [
    { code: "DEL001", name: "Delhi Public School", total: "2,500", verified: "2,100", pending: "300", operators: "2 / 2", progress: 84 },
    { code: "DEL002", name: "Kendriya Vidyalaya", total: "2,200", verified: "1,800", pending: "350", operators: "1 / 1", progress: 82 },
    { code: "MUM001", name: "St. Xaviers College", total: "2,800", verified: "2,300", pending: "400", operators: "0 / 1", progress: 82 },
    { code: "MUM002", name: "IIT Bombay", total: "3,200", verified: "2,700", pending: "400", operators: "1 / 1", progress: 84 },
    { code: "BLR001", name: "Christ University", total: "2,400", verified: "1,900", pending: "400", operators: "1 / 1", progress: 79 },
    { code: "BLR002", name: "RV College", total: "2,320", verified: "1,550", pending: "220", operators: "0 / 0", progress: 67 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans antialiased">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-6 border-r border-gray-200 h-8">
            <Shield className="w-6 h-6 text-gray-400" />
            <span className="font-bold text-[13px] text-gray-800 leading-tight uppercase">
              MPA VERIFICATION<br/>SYSTEM
            </span>
          </div>
          
          <div className="font-semibold text-gray-900">
            UPSC Civil Services 2024
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout} title="Click to logout">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                UC
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 leading-none">UPSC Client</span>
                <span className="text-xs text-gray-500">Client View</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90 ml-1" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto pb-10">
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Exam Dashboard</h1>
            <p className="text-gray-500 text-[15px]">Live monitoring for UPSC Civil Services 2024</p>
          </div>

          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Candidates */}
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-5 flex justify-between">
                <div className="flex flex-col justify-between">
                  <span className="text-[15px] font-medium text-gray-500">Total Candidates</span>
                  <span className="text-3xl font-bold text-gray-900 mt-2">15,420</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Verified */}
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-gray-500">Verified</span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">12,350</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">80% complete</span><br/>
                  <span className="text-green-600 font-medium">+12.5%</span> <span className="text-gray-500">vs last hour</span>
                </div>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-5 flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-gray-500">Pending</span>
                  <span className="text-3xl font-bold text-gray-900 mt-2">2,070</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Not Verified */}
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-5 flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-gray-500">Not Verified</span>
                  <span className="text-3xl font-bold text-gray-900 mt-2">1,000</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-none bg-[#f0f7ff] rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-800">Active Centres</div>
                  <div className="text-xl font-bold text-gray-900">6/8</div>
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
                  <div className="text-xl font-bold text-gray-900">5/6</div>
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
                  <div className="text-xl font-bold text-gray-900">5/6</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-[#fffbeb] rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-yellow-800">Present Today</div>
                  <div className="text-xl font-bold text-gray-900">14,200</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-8 text-[17px]">Centre-wise Verification Status</h3>
                <div className="h-64 flex items-end justify-around gap-2 px-4 border-l border-b border-gray-100 pb-2 relative">
                  {/* Y Axis labels */}
                  <div className="absolute left-[-40px] top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-0">
                    <span>2800</span><span>2100</span><span>1400</span><span>700</span><span>0</span>
                  </div>
                  
                  {/* Grid lines */}
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[25%]" />
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[50%]" />
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[75%]" />
                  
                  {/* Bar Groups */}
                  {[
                    { label: "DEL001", v: 75, p: 10, nv: 5 },
                    { label: "DEL002", v: 60, p: 15, nv: 2 },
                    { label: "MUM001", v: 82, p: 12, nv: 3 },
                    { label: "MUM002", v: 95, p: 15, nv: 4 },
                    { label: "BLR001", v: 55, p: 10, nv: 3 },
                    { label: "BLR002", v: 45, p: 12, nv: 25 },
                  ].map((group, i) => (
                    <div key={i} className="flex flex-col items-center justify-end h-full relative z-10 w-full hover:bg-gray-50/50 rounded-t-lg transition-colors cursor-pointer group/bar">
                      <div className="flex items-end gap-1.5 h-full w-full justify-center">
                        <div className="w-[25%] max-w-[14px] bg-green-500 rounded-t-sm transition-all" style={{ height: `${group.v}%` }} />
                        <div className="w-[25%] max-w-[14px] bg-amber-500 rounded-t-sm transition-all" style={{ height: `${group.p}%` }} />
                        <div className="w-[25%] max-w-[14px] bg-red-500 rounded-t-sm transition-all" style={{ height: `${group.nv}%` }} />
                      </div>
                      <div className="absolute -bottom-7 text-[11px] text-gray-500 whitespace-nowrap">{group.label}</div>
                    </div>
                  ))}
                </div>
                <div className="h-6 w-full"></div>
              </CardContent>
            </Card>
            
            {/* Donut Chart */}
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6 text-[17px]">Verification Status</h3>
                <div className="flex flex-col justify-center items-center h-64 mt-4">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="220" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="230" className="origin-center rotate-[45deg]" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="50" className="origin-center rotate-[90deg]" />
                    </svg>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-8 text-xs font-medium w-full">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> <span className="text-gray-500">Not Verified</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> <span className="text-gray-500">Pending</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> <span className="text-gray-500">Verified</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Circular Progress Indicators */}
            <Card className="shadow-sm border-gray-100 rounded-xl">
              <CardContent className="p-6 h-full flex items-center justify-around">
                <CircularProgress value={80} label="Verified" sublabel="12,350 / 15,420" strokeClass="stroke-green-500" />
                <CircularProgress value={92} label="Present" sublabel="14,200 / 15,420" strokeClass="stroke-blue-600" />
                <CircularProgress value={75} label="Operators" sublabel="3 / 4" strokeClass="stroke-indigo-500" />
              </CardContent>
            </Card>

            {/* Line Chart */}
            <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6 text-[17px]">Verifications Today</h3>
                <div className="h-56 relative border-l border-b border-gray-100 mx-6 mt-4 mb-8">
                  {/* Y Axis labels */}
                  <div className="absolute left-[-35px] top-0 bottom-0 flex flex-col justify-between text-[11px] text-gray-400 py-0">
                    <span>800</span><span>600</span><span>400</span><span>200</span><span>0</span>
                  </div>
                  
                  {/* X Axis labels */}
                  <div className="absolute left-0 right-0 -bottom-8 flex justify-between text-[11px] text-gray-400 px-0">
                    <span>09:00</span><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><span>14:00</span><span>15:00</span><span>16:00</span>
                  </div>
                  
                  {/* Grid lines */}
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[25%]" />
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[50%]" />
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[75%]" />
                  <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[100%]" />

                  {/* Line SVG */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                     <path d="M0,87.5 C 7,87.5 7,56.25 14.28,56.25 C 21,56.25 21,27.5 28.57,27.5 C 35,27.5 35,47.5 42.85,47.5 C 50,47.5 50,77.5 57.14,77.5 C 64,77.5 64,43.75 71.42,43.75 C 78,43.75 78,22.5 85.71,22.5 C 92,22.5 92,52.5 100,52.5" 
                           fill="none" stroke="#2563eb" strokeWidth="2.5" />
                     <circle cx="0" cy="87.5" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="14.28" cy="56.25" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="28.57" cy="27.5" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="42.85" cy="47.5" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="57.14" cy="77.5" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="71.42" cy="43.75" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="85.71" cy="22.5" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                     <circle cx="100" cy="52.5" r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table Row */}
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
                    <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Code ↕</th>
                    <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Centre Name ↕</th>
                    <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Total ↕</th>
                    <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Verified ↕</th>
                    <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-gray-100">Pending ↕</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Operators</th>
                    <th className="px-6 py-4 font-semibold tracking-wider min-w-[150px]">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-600">{row.code}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">{row.total}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">{row.verified}</td>
                      <td className="px-6 py-4 font-semibold text-amber-500">{row.pending}</td>
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
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Reusable component for the circular progress indicators
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