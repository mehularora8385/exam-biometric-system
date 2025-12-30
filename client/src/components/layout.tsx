import { Link, useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, LogOut, BarChart3, Shield, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state, logout } = useAppStore();
  const [, setLocation] = useLocation();
  const isOnline = navigator.onLine;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!state.operator) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-lg hidden sm:block text-slate-800 tracking-tight">ExamVerify</span>
            </Link>
            
            {state.selectedExam && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                  {state.selectedExam.name}
                </span>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200" title={isOnline ? "Online" : "Offline"}>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-medium text-slate-600">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setLocation("/centre-dashboard")} title="Centre Dashboard" className="gap-1.5 text-xs h-9">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">Centre</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setLocation("/admin-panel")} title="Admin Panel" className="gap-1.5 text-xs h-9">
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">Admin</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setLocation("/sync")} className="text-xs h-9">
              Sync
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={state.operator.photoUrl} alt={state.operator.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {state.operator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{state.operator.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      ID: {state.operator.id}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/sync")}>
                  Data Sync Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); setLocation("/login"); }} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setLocation("/centre-dashboard"); setMobileMenuOpen(false); }}>
              <BarChart3 className="w-4 h-4" /> Centre Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setLocation("/admin-panel"); setMobileMenuOpen(false); }}>
              <Shield className="w-4 h-4" /> Admin Panel
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setLocation("/sync"); setMobileMenuOpen(false); }}>
              Sync Status
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={() => { logout(); setLocation("/login"); setMobileMenuOpen(false); }}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>Biometric Examination Verification System v1.0.0 (Mockup)</p>
      </footer>
    </div>
  );
}
