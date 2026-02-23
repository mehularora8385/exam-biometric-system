import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Radar, Eye, Search, BrainCircuit, Mic, Waves, Fingerprint, Activity, Map, Cpu, Zap, Volume2 } from "lucide-react";

export default function GlobalSurveillance() {
  const [activeTab, setActiveTab] = useState<'kinesics' | 'rfid' | 'voice'>('kinesics');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Radar className="w-8 h-8 text-indigo-600" /> Advanced Global Surveillance
          </h1>
          <p className="text-sm text-gray-500 mt-1">Next-gen verification technologies inspired by international security protocols</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-medium text-sm border border-indigo-100 shadow-sm">
          <BrainCircuit className="w-4 h-4 animate-pulse" /> Neural Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className={`shadow-sm border-2 transition-all cursor-pointer ${activeTab === 'kinesics' ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-200'}`} onClick={() => setActiveTab('kinesics')}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTab === 'kinesics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Kinesics & Micro-Expressions</h3>
              <p className="text-sm text-gray-500 mt-2">Behavioral analysis detecting stress or deception during verification (China/US standard)</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-2 transition-all cursor-pointer ${activeTab === 'rfid' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`} onClick={() => setActiveTab('rfid')}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTab === 'rfid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'}`}>
              <Waves className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">UHF RFID Tracking</h3>
              <p className="text-sm text-gray-500 mt-2">Passive tracking of candidate movement within the examination center (South Korea model)</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-2 transition-all cursor-pointer ${activeTab === 'voice' ? 'border-purple-500 bg-purple-50/30' : 'border-gray-100 hover:border-purple-200'}`} onClick={() => setActiveTab('voice')}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${activeTab === 'voice' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-purple-50 text-purple-600'}`}>
              <Mic className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Voice Biometrics</h3>
              <p className="text-sm text-gray-500 mt-2">Vocal passphrase matching combined with background noise anomaly detection</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'kinesics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
                <h3 className="font-bold text-xl">Behavioral Analysis Engine</h3>
              </div>
              <p className="text-slate-400 text-sm">Monitors facial micro-expressions and eye tracking during the photo capture phase to detect nervousness, coaching, or earpiece listening.</p>
            </div>
            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Eye className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Pupil Dilation Tracking (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Measures abnormal pupil responses indicating cognitive overload or stress.</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Activity className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Micro-Expression Scanner (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Detects 43 distinct facial muscle movements to identify hidden anxiety.</div>
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Search className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Gaze Deviation Alert (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Flags if a candidate is repeatedly looking off-camera (potential coaching).</div>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-xl bg-slate-50 border-dashed">
            <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
              <div className="w-64 h-64 relative mb-6">
                {/* Simulated Wireframe Face Scanner */}
                <div className="absolute inset-0 bg-[url('https://cdn-icons-png.flaticon.com/512/3035/3035048.png')] bg-cover opacity-10 blur-[1px]"></div>
                <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-pulse"></div>
                
                {/* Scanning lines */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
                <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_green]"></div>
                
                {/* HUD Elements */}
                <div className="absolute top-4 left-0 text-[10px] font-mono text-indigo-600 text-left">
                  STRESS: LOW<br/>
                  HEART RATE: ~72BPM<br/>
                  FOCUS: CENTER
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Live Kinesics Demo</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">Requires compatible AI accelerator chip on the verification tablet (NPU supported).</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rfid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-blue-900 p-6 text-white border-b border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <Map className="w-6 h-6 text-blue-400" />
                <h3 className="font-bold text-xl">Center Geolocation & RFID</h3>
              </div>
              <p className="text-blue-200 text-sm">Integration with UHF RFID tags embedded in OMR sheets or ID cards to track movement across the examination hall.</p>
            </div>
            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Waves className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">OMR Proximity Alert (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Alerts if OMR sheet moves outside the designated classroom zone.</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Zap className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Multi-Tag Collision (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Detects if two candidate tags are suspiciously close to each other for &gt;5 mins.</div>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100 rounded-xl">
            <CardContent className="p-6 h-full flex flex-col items-center justify-center">
              <div className="w-full max-w-sm aspect-square bg-slate-100 rounded-full border-4 border-slate-200 relative flex items-center justify-center overflow-hidden mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-[ping_3s_infinite]"></div>
                <div className="absolute inset-4 border-4 border-blue-500/40 rounded-full animate-[ping_2s_infinite]"></div>
                <div className="absolute inset-8 border-4 border-blue-500/60 rounded-full animate-[ping_1s_infinite]"></div>
                <Map className="w-12 h-12 text-blue-600 relative z-10" />
                
                {/* Dots representing tracked items */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-500 rounded-full shadow-lg z-20"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-red-500 rounded-full shadow-lg z-20">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Zonal Tracking Simulator</h3>
              <p className="text-sm text-gray-500 mt-2 text-center">Requires physical RFID gateways installed at center entry points and classroom doors.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-purple-900 p-6 text-white border-b border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <Volume2 className="w-6 h-6 text-purple-400" />
                <h3 className="font-bold text-xl">Acoustic Signature Matching</h3>
              </div>
              <p className="text-purple-200 text-sm">Extracts over 100 physical vocal tract characteristics during verification. Deep-fake audio and synthetic voice resistant.</p>
            </div>
            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Mic className="w-5 h-5 text-purple-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Voice Print Generation (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Requires candidate to read a random 4-digit code aloud during face capture.</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Cpu className="w-5 h-5 text-purple-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Synthetic Audio Detection (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">AI model that detects AI-generated voices or pre-recorded playback.</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4">
                    <div className="mt-1"><Volume2 className="w-5 h-5 text-purple-600" /></div>
                    <div>
                      <div className="font-bold text-gray-900">Background Anomaly Flag (Optional)</div>
                      <div className="text-sm text-gray-500 mt-1">Flags if whispering or coaching is detected in the audio background.</div>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-gray-100 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center p-8">
             <div className="w-full flex items-center justify-center gap-1 h-32 mb-8">
               {[...Array(20)].map((_, i) => (
                 <div 
                   key={i} 
                   className="w-2 bg-purple-500 rounded-full" 
                   style={{ 
                     height: `${Math.random() * 100}%`,
                     animation: `pulse ${0.5 + Math.random()}s infinite alternate`
                   }}
                 ></div>
               ))}
             </div>
             <h3 className="font-bold text-white text-xl mb-2">Acoustic Model Configured</h3>
             <p className="text-slate-400 text-sm text-center">Ready to capture and process multi-channel audio data on candidate verification.</p>
          </Card>
        </div>
      )}
    </div>
  );
}