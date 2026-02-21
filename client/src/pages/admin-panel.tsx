import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit2, Trash2, DownloadCloud, FileText, Users, Calendar, Settings, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("exams");
  const [searchQuery, setSearchQuery] = useState("");

  const exams = [
    {
      id: "EX-2025-001",
      name: "National Entrance Test 2025",
      date: "2025-05-15",
      centres: 12,
      candidates: 2845,
      status: "active",
      dataDownloads: 156,
      stats: {
        present: 2450,
        verified: 2100,
        pending: 395,
        syncPercent: 98
      }
    },
    // ... existing exams
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">HQ Control Panel</h1>
              <p className="text-slate-500">Centralized monitoring and exam governance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-2">
              <Lock className="w-4 h-4" /> Logout All Devices
            </Button>
            <Badge className="bg-primary/10 text-primary text-sm px-3 py-1">
              <Settings className="w-3 h-3 mr-1" /> HQ Admin
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitor</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="config">APK Config</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border-emerald-100">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-emerald-600">Verified Candidates</p>
                        <h3 className="text-3xl font-bold text-emerald-900">2,100</h3>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/20" />
                    </div>
                  </CardContent>
                </Card>
                {/* Add more live stats cards */}
             </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>APK Control Configuration</CardTitle>
                <CardDescription>Dynamically control APK behavior and security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Biometric Controls</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Fingerprint Scanning</span>
                        <Badge>Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">AI Face Matching</span>
                        <Badge>Enabled</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">MDM & Security (Full Control)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Kiosk Mode (App Locking)</span>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Block Screenshot/USB</span>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200">ACTIVE</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* ... existing tab contents */}
        </Tabs>
      </div>
    </div>
  );
}
