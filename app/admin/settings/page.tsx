"use client";

import { useState, useEffect } from "react";
import { 
  Save, Loader2, Globe, Lock, Shield, 
  Image as ImageIcon, Apple, 
  Check, Info, Coins, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import MediaUpload from "@/components/MediaUpload";
import { useAuth } from "@/app/context/AuthContext";

type SettingsTab = "general" | "hero" | "auth" | "coins" | "payment";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  size: number;
  originalFile?: File;
}

interface SettingsState {
  frontendLogo: string;
  backendLogo: string;
  googleLogin: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
  };
  appleLogin: {
    enabled: boolean;
    clientId: string;
    teamId: string;
    keyId: string;
  };
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  coinValue: number;
  heroBanner: {
    title: string;
    subtitle: string;
    image: string;
  };
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
  };
}

interface ApiError {
  response?: {
    data?: {
      msg?: string;
    };
  };
  message?: string;
}

const getApiError = (error: unknown) => error as ApiError;

export default function AdminSettingsPage() {
  const { isSuperadmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("payment");

  const [settings, setSettings] = useState<SettingsState>({
    frontendLogo: "",
    backendLogo: "",
    googleLogin: {
      enabled: false,
      clientId: "",
      clientSecret: "",
    },
    appleLogin: {
      enabled: false,
      clientId: "",
      teamId: "",
      keyId: "",
    },
    siteName: "Turf Booking",
    contactEmail: "",
    maintenanceMode: false,
    coinValue: 1,
    heroBanner: {
      title: "UP YOUR GAME",
      subtitle: "Premium sports venues, professional training, and competitive matches. Book your victory in seconds.",
      image: "",
    },
    razorpay: {
      enabled: false,
      keyId: "",
      keySecret: "",
    },
  });

  const [logoFiles, setLogoFiles] = useState<{
    frontend?: UploadedFile | null;
    backend?: UploadedFile | null;
    hero?: UploadedFile | null;
  }>({});

  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (!loaded) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('adminSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Loaded from localStorage:', parsed);
        setSettings(prev => ({ ...prev, ...parsed }));
        return true;
      }
    } catch (e) {
      console.log('No localStorage found:', e);
    }
    return false;
  };

  const saveToLocalStorage = (newSettings: SettingsState) => {
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
    console.log('✅ Saved to localStorage:', newSettings);
  };

  const fetchSettings = async () => {
    try {
      console.log('Fetching from API...');
      const res = await api.get("/settings");
      
      if (res.data && res.data.success && res.data.settings) {
        const apiData = res.data.settings;
        setSettings(prev => ({
          ...prev,
          ...apiData
        }));
        saveToLocalStorage(apiData);
        console.log('API settings loaded:', apiData);
      }
    } catch (error) {
      console.error('API fetch failed:', error);
      toast.error("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('siteName', settings.siteName);
      formData.append('contactEmail', settings.contactEmail);
      formData.append('maintenanceMode', String(settings.maintenanceMode));
      formData.append('coinValue', String(settings.coinValue));
      formData.append('googleLogin', JSON.stringify(settings.googleLogin));
      formData.append('appleLogin', JSON.stringify(settings.appleLogin));
      formData.append('heroBanner', JSON.stringify(settings.heroBanner));
      formData.append('razorpay', JSON.stringify(settings.razorpay));

      if (logoFiles.frontend?.originalFile) {
        formData.append('frontendLogo', logoFiles.frontend.originalFile);
      } else if (logoFiles.frontend === null) {
        formData.append('frontendLogo', "");
      }

      if (logoFiles.backend?.originalFile) {
        formData.append('backendLogo', logoFiles.backend.originalFile);
      } else if (logoFiles.backend === null) {
        formData.append('backendLogo', "");
      }

      if (logoFiles.hero?.originalFile) {
        formData.append('image', logoFiles.hero.originalFile);
      } else if (logoFiles.hero === null) {
        formData.append('heroBannerImage', "");
      }

      const res = await api.post("/settings", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        const saved = res.data.settings;
        setSettings(prev => ({
          ...prev,
          ...saved
        }));
        saveToLocalStorage(saved);
        toast.success("Settings saved successfully!");
      } else {
        throw new Error(res.data.msg || "Failed to save settings");
      }
    } catch (error) {
      console.error('Save error:', error);
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.msg || apiError.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-6">
      <div className="border-b border-gray-200 pb-5 mb-8 px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure logos, authentication, and platform defaults.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="lg:col-span-1 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2.5 lg:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
          {([
            {id: "general", label: "Branding & General", icon: Globe },
            { id: "coins", label: "Coin System", icon: Coins },
            { id: "payment", label: "Payment Gateway", icon: CreditCard },
            { id: "hero", label: "Hero Banner", icon: ImageIcon },
            { id: "auth", label: "Authentication", icon: Lock },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none lg:w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all snap-start ${
                activeTab === tab.id 
                  ? "bg-green-50 text-[#1abc60] shadow-sm border border-green-100" 
                  : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 md:p-8">
            
            {activeTab === "payment" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Razorpay Payment Gateway</h3>
                  <div className="p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Razorpay Configuration</h4>
                        <p className="text-xs text-gray-500">Enter your Razorpay API keys to enable payments.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 p-3 sm:p-4 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50 gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900">Enable Razorpay</h3>
                          <p className="text-xs text-gray-500 mt-0.5 break-words">Activate payment gateway integration</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={settings.razorpay?.enabled || false} 
                          onChange={e => {
                            const newSettings = {
                              ...settings, 
                              razorpay: {
                                ...settings.razorpay, 
                                enabled: e.target.checked
                              }
                            };
                            setSettings(newSettings);
                            saveToLocalStorage(newSettings);
                          }} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                      </label>
                    </div>

                    {(settings.razorpay?.enabled) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5 min-w-0">
                          <label className="text-xs font-semibold text-gray-700">Key ID</label>
                          <input 
                            type="text"
                            value={settings.razorpay?.keyId || ''} 
                            onChange={e => {
                              const newSettings = {
                                ...settings, 
                                razorpay: {
                                  ...settings.razorpay, 
                                  keyId: e.target.value
                                }
                              };
                              setSettings(newSettings);
                              saveToLocalStorage(newSettings);
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all" 
                            placeholder="rzp_test_..."
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <label className="text-xs font-semibold text-gray-700">Key Secret</label>
                          <input 
                            type="password"
                            value={settings.razorpay?.keySecret || ''} 
                            onChange={e => {
                              const newSettings = {
                                ...settings, 
                                razorpay: {
                                  ...settings.razorpay, 
                                  keySecret: e.target.value
                                }
                              };
                              setSettings(newSettings);
                              saveToLocalStorage(newSettings);
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all" 
                            placeholder="Enter your secret key"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-3 sm:p-4 bg-white/50 rounded-lg border border-blue-100 flex items-start gap-2.5 min-w-0">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-800 leading-relaxed break-words">
                        Get your API keys from <a href="https://razorpay.com" target="_blank" className="font-bold underline">Razorpay Dashboard</a>. Use Test mode keys for development.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "general" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Platform Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Site Name</label>
                      <input 
                        value={settings.siteName} 
                        onChange={e => {
                          const newS = { ...settings, siteName: e.target.value };
                          setSettings(newS);
                          saveToLocalStorage(newS);
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm" 
                        placeholder="e.g. Turf Booking"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Support Email</label>
                      <input 
                        type="email"
                        value={settings.contactEmail} 
                        onChange={e => {
                          const newS = { ...settings, contactEmail: e.target.value };
                          setSettings(newS);
                          saveToLocalStorage(newS);
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm" 
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-4">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Logos & Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Frontend Logo</label>
                      <MediaUpload
                        maxFiles={1}
                        initialFiles={settings.frontendLogo ? [settings.frontendLogo] : []}
                        onFilesChange={(files) => {
                          setLogoFiles(prev => ({ ...prev, frontend: files[0] || null }));
                        }}
                        acceptedTypes={["image"]}
                      />
                      <p className="text-[10px] text-gray-400 font-medium italic">Visible on main website (Recommended: PNG, 144x48px)</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Backend Logo</label>
                      <MediaUpload
                        maxFiles={1}
                        initialFiles={settings.backendLogo ? [settings.backendLogo] : []}
                        onFilesChange={(files) => {
                          setLogoFiles(prev => ({ ...prev, backend: files[0] || null }));
                        }}
                        acceptedTypes={["image"]}
                      />
                      <p className="text-[10px] text-gray-400 font-medium italic">Visible on admin dashboard (Recommended: PNG, 144x48px)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "hero" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Hero Banner Configuration</h3>
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Hero Title</label>
                      <input 
                        value={settings.heroBanner.title} 
                        onChange={e => {
                          const newS = { ...settings, heroBanner: { ...settings.heroBanner, title: e.target.value } };
                          setSettings(newS);
                          saveToLocalStorage(newS);
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm font-bold" 
                        placeholder="UP YOUR GAME"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Hero Subtitle</label>
                      <textarea 
                        value={settings.heroBanner.subtitle} 
                        onChange={e => {
                          const newS = { ...settings, heroBanner: { ...settings.heroBanner, subtitle: e.target.value } };
                          setSettings(newS);
                          saveToLocalStorage(newS);
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm h-24 resize-none" 
                        placeholder="Premium sports venues..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Hero Background Image</label>
                      <MediaUpload
                        maxFiles={1}
                        initialFiles={settings.heroBanner.image ? [settings.heroBanner.image] : []}
                        onFilesChange={(files) => {
                          setLogoFiles(prev => ({ ...prev, hero: files[0] || null }));
                        }}
                        acceptedTypes={["image"]}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "auth" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" /> Google Authentication
                    </h3>
                    <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900">Enable Google Login</h4>
                          <p className="text-xs text-gray-500 mt-0.5 break-words">Allow users to sign in with their Google accounts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            checked={settings.googleLogin.enabled} 
                            onChange={e => {
                              const newS = { ...settings, googleLogin: { ...settings.googleLogin, enabled: e.target.checked } };
                              setSettings(newS);
                              saveToLocalStorage(newS);
                            }} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                        </label>
                      </div>

                      {settings.googleLogin.enabled && (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs font-bold text-gray-700">Client ID</label>
                            <input 
                              value={settings.googleLogin.clientId}
                              onChange={e => {
                                const newS = { ...settings, googleLogin: { ...settings.googleLogin, clientId: e.target.value } };
                                setSettings(newS);
                                saveToLocalStorage(newS);
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-mono" 
                              placeholder="xxxxxxxx-xxxx.apps.googleusercontent.com"
                            />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs font-bold text-gray-700">Client Secret</label>
                            <input 
                              type="password"
                              value={settings.googleLogin.clientSecret}
                              onChange={e => {
                                const newS = { ...settings, googleLogin: { ...settings.googleLogin, clientSecret: e.target.value } };
                                setSettings(newS);
                                saveToLocalStorage(newS);
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-mono" 
                              placeholder="••••••••••••••••"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <Apple className="w-4 h-4 text-gray-900" /> Apple Authentication
                    </h3>
                    <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900">Enable Apple Login</h4>
                          <p className="text-xs text-gray-500 mt-0.5 break-words">Allow users to sign in with their Apple ID</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            checked={settings.appleLogin.enabled} 
                            onChange={e => {
                              const newS = { ...settings, appleLogin: { ...settings.appleLogin, enabled: e.target.checked } };
                              setSettings(newS);
                              saveToLocalStorage(newS);
                            }} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                        </label>
                      </div>

                      {settings.appleLogin.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs font-bold text-gray-700">Service ID (Client ID)</label>
                            <input 
                              value={settings.appleLogin.clientId}
                              onChange={e => {
                                const newS = { ...settings, appleLogin: { ...settings.appleLogin, clientId: e.target.value } };
                                setSettings(newS);
                                saveToLocalStorage(newS);
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all text-sm" 
                            />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs font-bold text-gray-700">Team ID</label>
                            <input 
                              value={settings.appleLogin.teamId}
                              onChange={e => {
                                const newS = { ...settings, appleLogin: { ...settings.appleLogin, teamId: e.target.value } };
                                setSettings(newS);
                                saveToLocalStorage(newS);
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all text-sm" 
                            />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <label className="text-xs font-bold text-gray-700">Key ID</label>
                            <input 
                              value={settings.appleLogin.keyId}
                              onChange={e => {
                                const newS = { ...settings, appleLogin: { ...settings.appleLogin, keyId: e.target.value } };
                                setSettings(newS);
                                saveToLocalStorage(newS);
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-400 transition-all text-sm" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "coins" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Coin System</h3>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Coin Value (1 Coin = ? INR)</label>
                    <input 
                      type="number"
                      value={settings.coinValue} 
                      onChange={e => {
                        const newS = { ...settings, coinValue: Number(e.target.value) || 1 };
                        setSettings(newS);
                        saveToLocalStorage(newS);
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm" 
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-gray-200 gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Check className="w-4 h-4 text-[#1abc60]" />
                <span className="text-sm font-medium">Ready to save</span>
              </div>
              <button 
                disabled={isSaving} 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3 bg-[#1abc60] hover:bg-[#17a554] text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-base"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'SAVING...' : 'SAVE & PUBLISH SETTINGS'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
