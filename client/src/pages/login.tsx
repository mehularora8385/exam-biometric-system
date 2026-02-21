import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Fingerprint, Camera, LogIn } from "lucide-react";

const loginSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  mobile: z.string().length(10, "Mobile must be exactly 10 digits"),
  aadhaar: z.string().length(12, "Aadhaar must be exactly 12 digits"),
  deviceBound: z.string().optional()
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { setOperator, login } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      mobile: "",
      aadhaar: "",
      deviceBound: "TAB-" + Math.floor(Math.random() * 10000).toString().padStart(4, '0') // Auto device ID
    },
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast({ title: "Camera Error", description: "Could not access front camera", variant: "destructive" });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setPhotoCaptured(true);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const retakePhoto = () => {
    setPhotoCaptured(false);
    startCamera();
  };

  const onFirstStepSubmit = async (data: LoginForm) => {
    setStep(2);
    startCamera();
  };

  const onFinalSubmit = () => {
    if (!photoCaptured) {
      toast({ title: "Photo Required", description: "Please capture your live photo to continue", variant: "destructive" });
      return;
    }
    
    // Auto-login success (mock JWT & session)
    login({
      id: "OP-" + Math.floor(Math.random() * 10000),
      name: form.getValues().name,
      role: "OPERATOR",
      mobile: form.getValues().mobile,
      aadhaar: form.getValues().aadhaar,
      photoUrl: "https://github.com/shadcn.png"
    });
    
    toast({
      title: "Login Successful",
      description: "Device bound successfully. JWT token generated.",
    });
    
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center pb-6 border-b border-slate-100">
          <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-2">
            <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">MPA Verification System</CardTitle>
          <CardDescription>
            {step === 1 ? "Operator Identity Verification" : "Live Liveness Check"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFirstStepSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name (min 3 chars)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit mobile number" maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aadhaar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="12-digit Aadhaar number" maxLength={12} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-500 border border-slate-200 mt-4">
                  <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><UserCircle className="w-3 h-3"/> Device Binding Info</p>
                  This device ({form.getValues().deviceBound}) will be securely bound to your identity. Duplicate logins on other devices will be blocked.
                </div>

                <Button type="submit" className="w-full mt-6 h-12 text-lg font-semibold">
                  Continue to Photo <LogIn className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
              <div className="relative w-64 h-64 bg-slate-200 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner">
                {!photoCaptured ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <canvas ref={canvasRef} className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
                
                {/* Face guide overlay */}
                {!photoCaptured && (
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 m-8 rounded-[40%] pointer-events-none" />
                )}
              </div>
              
              <p className="text-sm text-slate-500 text-center px-4">
                {photoCaptured ? "Photo captured successfully. Proceed to login." : "Position your face within the guide and ensure good lighting."}
              </p>

              <div className="flex gap-3 w-full">
                {!photoCaptured ? (
                  <>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" className="w-full gap-2" onClick={capturePhoto}>
                      <Camera className="w-4 h-4" /> Capture Photo
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" className="w-full" onClick={retakePhoto}>Retake</Button>
                    <Button type="button" className="w-full gap-2" onClick={onFinalSubmit}>
                      <LogIn className="w-4 h-4" /> Secure Login
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dev backdoor (mockup only) */}
      <div className="absolute bottom-4 right-4 flex gap-2">
         <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => {
            login({
              id: "OP-9999",
              name: "Demo Operator",
              role: "OPERATOR",
              mobile: "9876543210",
              aadhaar: "XXXXXXXX1234",
              photoUrl: "https://github.com/shadcn.png"
            });
            setLocation("/");
         }}>
           Bypass Login
         </Button>
         <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setLocation("/admin/login")}>
           Admin Portal
         </Button>
      </div>
    </div>
  );
}
