import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { Shield, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Mock login validation
      await new Promise(r => setTimeout(r, 1000));
      
      if (username === "admin" && password === "admin123") {
        login({
          id: "HQ-ADMIN-01",
          name: "System Administrator",
          mobile: "N/A",
          aadhaar: "N/A",
          photoUrl: "https://github.com/shadcn.png",
          role: "ADMIN"
        });
        setLocation("/admin-panel");
      } else {
        setError("Invalid admin credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800 text-slate-100">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-blue-900/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight">HQ Control Panel</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Secure Administrative Access
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Admin Username</label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" 
                placeholder="Enter username" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Secure Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500" 
                placeholder="Enter password" 
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800 text-red-200 text-sm rounded-md text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
              disabled={loading || !username || !password}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</>
              ) : (
                "Access Control Panel"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-900/50 border-t border-slate-800 p-4 justify-center">
          <p className="text-xs text-slate-500">
            For demonstration: Use <span className="font-mono text-blue-400">admin</span> / <span className="font-mono text-blue-400">admin123</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}