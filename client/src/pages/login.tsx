import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await api.auth.login(username, password);

      localStorage.setItem("role", user.role);
      localStorage.setItem("displayName", user.displayName || user.name);
      localStorage.setItem("username", user.username || username);

      login({
        id: user.id || username,
        name: user.displayName || user.name || username,
        mobile: user.mobile || "N/A",
        aadhaar: user.aadhaar || "N/A",
        photoUrl: user.photoUrl || "https://github.com/shadcn.png",
        role: user.role,
      });

      if (user.role === "admin" || user.role === "ADMIN") {
        setLocation("/admin-panel");
      } else if (user.role === "client" || user.role === "CLIENT") {
        setLocation("/client-dashboard");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* We'll use a placeholder structure for the logo if the image isn't available, but try to load it first */}
          <div className="mx-auto mb-4 flex items-center justify-center h-24 w-full">
            <div className="text-4xl font-extrabold text-blue-600 tracking-tighter flex items-center gap-2">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                 <span className="text-white">M</span>
              </div>
              MPA
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MPA VERIFICATION SYSTEM</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="w-full text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed border-gray-300 pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="w-full text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed border-gray-300 pl-10 pr-10"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-6 py-3 text-base gap-2 w-full mt-2"
            disabled={loading || !username || !password}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center mb-3">Demo Credentials</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Admin:</span>
              <span className="font-mono text-gray-900 font-semibold">demo / demo</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Client:</span>
              <span className="font-mono text-gray-900 font-semibold">upsc_client / upsc@123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}