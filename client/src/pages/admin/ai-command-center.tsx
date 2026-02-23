import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Video, AlertCircle, ScanLine, Maximize2, Radio } from "lucide-react";

export default function AICommandCenter() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Live Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time global surveillance and operator monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full font-medium text-sm animate-pulse border border-red-100">
          <Radio className="w-4 h-4" /> Live Feed Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-800 rounded-xl overflow-hidden bg-slate-900 text-white">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Primary Verification Feed - DEL001</span>
              </div>
              <button className="text-slate-400 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
            </div>
            <div className="aspect-video bg-black relative flex flex-col items-center justify-center border-b border-slate-800">
              <ScanLine className="w-16 h-16 text-blue-500/50 mb-4 animate-pulse" />
              <p className="text-slate-500 text-sm">Secure Encrypted Stream Connected</p>
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-2 py-1 bg-black/50 text-xs rounded text-green-400 backdrop-blur-sm border border-green-500/30">FPS: 30</span>
                <span className="px-2 py-1 bg-black/50 text-xs rounded text-blue-400 backdrop-blur-sm border border-blue-500/30">1080p</span>
              </div>
              {/* Fake face targeting box overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border border-blue-500/30 relative">
                   <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                   <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                   <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-900/50">
              <div className="p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">Current Candidate</div>
                <div className="font-medium text-sm text-slate-200">Rahul Gupta</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">Face Match</div>
                <div className="font-medium text-sm text-green-400">98.5%</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs text-slate-500 mb-1">Liveness</div>
                <div className="font-medium text-sm text-green-400">Verified</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-gray-100 rounded-xl h-full">
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" /> System Events
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500 shadow z-10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-slate-100 mt-[-6px]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-[13px]">Device Auth</div>
                      <time className="text-[11px] font-medium text-slate-500">Just now</time>
                    </div>
                    <div className="text-slate-500 text-xs">DEV001 connected securely.</div>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 shadow z-10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-slate-100 mt-[-6px]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-[13px]">Biometric Scan</div>
                      <time className="text-[11px] font-medium text-slate-500">2m ago</time>
                    </div>
                    <div className="text-slate-500 text-xs">Match successful (98.5%).</div>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-500 shadow z-10 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-100 p-3 rounded-lg shadow-sm mt-[-6px]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-red-900 text-[13px]">Liveness Fail</div>
                      <time className="text-[11px] font-medium text-red-500">5m ago</time>
                    </div>
                    <div className="text-red-700 text-xs">Possible photo spoof detected at DEV004.</div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}