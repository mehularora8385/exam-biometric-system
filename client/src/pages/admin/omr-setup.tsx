import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function OmrSetup() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">OMR Sheet Setup</h1>
      </div>

      <Card className="border-t-4 border-t-[#1a56db] shadow-sm">
        <div className="bg-slate-50 p-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Configure OMR Settings</h3>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable OMR Scanning</Label>
                  <p className="text-sm text-slate-500">Allow operators to scan OMR sheets using mobile camera</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Auto-Crop OMR</Label>
                  <p className="text-sm text-slate-500">Automatically crop edges during scan</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="border rounded-lg p-4 flex flex-col justify-center items-center bg-slate-50 border-dashed">
              <div className="w-32 h-40 bg-white border-2 border-slate-300 rounded mb-4 flex items-center justify-center text-slate-400">
                Sample OMR
              </div>
              <Button variant="outline">Upload New Template</Button>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-[#4e73df] hover:bg-[#2e59d9]">Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}