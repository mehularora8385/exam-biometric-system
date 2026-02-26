import { useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { User, Lock, Eye, EyeOff, Loader2, Fingerprint } from "lucide-react";
import biometricBg from "@assets/digitalforensic-vector-50912861_1772098182646.png";

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
    <div className="min-h-screen flex font-sans antialiased">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={biometricBg}
          alt="Biometric Verification"
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="img-login-bg"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-900/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">MPA Biometric</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-3">Secure Biometric<br />Verification System</h2>
          <p className="text-blue-200 text-sm max-w-md leading-relaxed">
            Advanced face recognition, fingerprint matching, and multi-factor biometric verification for examination integrity.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-login-title">MPA VERIFICATION SYSTEM</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" data-testid="form-login">
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
                  data-testid="input-username"
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
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center" data-testid="text-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 px-6 py-3 text-base gap-2 w-full mt-2"
              disabled={loading || !username || !password}
              data-testid="button-login"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">MPA Biometric Verification System</p>
        </div>
      </div>
    </div>
  );
}
