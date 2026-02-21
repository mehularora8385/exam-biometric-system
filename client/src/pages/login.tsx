import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/camera-capture";
import { Loader2, ArrowRight } from "lucide-react";

// Schemas
const loginSchema = z.object({
  mobile: z.string().length(10, "Mobile number must be 10 digits"),
  pin: z.string().min(4, "PIN must be at least 4 digits"),
});

const registerSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  aadhaar: z.string().length(12, "Aadhaar must be 12 digits"),
  mobile: z.string().length(10, "Mobile number must be 10 digits"),
});

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const { login } = useAppStore();
  const [, setLocation] = useLocation();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "photo">("details");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", pin: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", aadhaar: "", mobile: "" },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    // Mock login
    await new Promise(r => setTimeout(r, 1000));

    // Check if it's the admin PIN
    const isAdmin = data.pin === "8888";

    login({
      id: "OP-" + data.mobile.slice(-4),
      name: isAdmin ? "System Administrator" : "Demo Operator",
      mobile: data.mobile,
      aadhaar: "XXXXXXXX1234",
      photoUrl: "https://github.com/shadcn.png",
      role: isAdmin ? "ADMIN" : "OPERATOR"
    });
    setLocation("/");
  };

  const onRegisterNext = async (data: z.infer<typeof registerSchema>) => {
    setStep("photo");
  };

  const onRegisterComplete = async () => {
    if (!capturedPhoto) return;
    const data = registerForm.getValues();
    
    // Mock registration
    await new Promise(r => setTimeout(r, 1500));
    login({
      id: "OP-" + data.mobile.slice(-4),
      name: data.fullName,
      mobile: data.mobile,
      aadhaar: data.aadhaar,
      photoUrl: capturedPhoto,
      role: "OPERATOR"
    });
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Exam Verification</CardTitle>
          <CardDescription>Secure Biometric Access System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Operator Login</TabsTrigger>
              <TabsTrigger value="register">Register New</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10 digit mobile" {...field} maxLength={10} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access PIN</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter PIN" {...field} maxLength={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    ) : (
                      "Login to System"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              {step === "details" ? (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterNext)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="As per ID proof" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10 digit number" {...field} maxLength={10} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="aadhaar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhaar Number</FormLabel>
                          <FormControl>
                            <Input placeholder="12 digit number" {...field} maxLength={12} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11 mt-2">
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="text-center">
                    <h3 className="font-medium text-lg">Operator Verification</h3>
                    <p className="text-sm text-slate-500">Capture a clear selfie for ID</p>
                  </div>
                  
                  <CameraCapture onCapture={setCapturedPhoto} label="Capture Selfie" />

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                      Back
                    </Button>
                    <Button className="flex-1" disabled={!capturedPhoto} onClick={onRegisterComplete}>
                      Complete Registration
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-400 w-full">Protected by secure biometric encryption</p>
        </CardFooter>
      </Card>
    </div>
  );
}
