import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  label?: string;
}

export function CameraCapture({ onCapture, label = "Capture Photo" }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImage(null);
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center">
        {image ? (
          <img src={image} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user", aspectRatio: 0.75 }}
              className="w-full h-full object-cover"
              onUserMedia={() => setIsCameraReady(true)}
              onUserMediaError={() => setIsCameraReady(false)} // Handle errors gracefully-ish
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                <Camera className="w-12 h-12 animate-pulse" />
              </div>
            )}
            
            {/* Guide overlay */}
            <div className="absolute inset-0 border-[3px] border-white/30 m-8 rounded-full pointer-events-none opacity-50"></div>
          </>
        )}
      </div>

      <div className="flex gap-2 w-full">
        {image ? (
          <Button onClick={retake} variant="outline" className="flex-1 gap-2" size="lg">
            <RotateCcw className="w-4 h-4" /> Retake
          </Button>
        ) : (
          <Button onClick={capture} className="flex-1 gap-2" size="lg" disabled={!isCameraReady}>
            <Camera className="w-4 h-4" /> {label}
          </Button>
        )}
      </div>
    </div>
  );
}
