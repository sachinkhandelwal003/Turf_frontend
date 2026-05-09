"use client";

import { useState, useEffect } from "react";
import { 
  Save, Loader2, Globe, Lock, Shield, 
  Image as ImageIcon, Apple, 
  Check, Info, Coins
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import MediaUpload from "@/components/MediaUpload";
import { useAuth } from "@/app/context/AuthContext";

type SettingsTab = "general" | "hero" | "auth" | "security" | "coins";

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
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

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
  });

  const [logoFiles, setLogoFiles] = useState<{
    frontend?: UploadedFile | null;
    backend?: UploadedFile | null;
    hero?: UploadedFile | null;
  }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const message = apiError.response?.data?.msg || apiError.message || "Failed to fetch settings";
      console.error("Failed to fetch settings:", message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) return toast.error("Only Superadmins can modify settings");
    
    setIsSaving(true);
    try {
      const formData = new FormData();
      
      // Append basic settings
      formData.append("siteName", settings.siteName);
      formData.append("contactEmail", settings.contactEmail);
      formData.append("maintenanceMode", String(settings.maintenanceMode));
      formData.append("coinValue", String(settings.coinValue));
      formData.append("googleLogin", JSON.stringify(settings.googleLogin));
      formData.append("appleLogin", JSON.stringify(settings.appleLogin));
      formData.append("heroBanner", JSON.stringify(settings.heroBanner));

      // Handle logos
      if (logoFiles.frontend?.originalFile) {
        formData.append("frontendLogo", logoFiles.frontend.originalFile);
      } else if (logoFiles.frontend === null) {
        formData.append("frontendLogo", ""); // Signal removal
      } else if (typeof settings.frontendLogo === 'string') {
        formData.append("frontendLogo", settings.frontendLogo);
      }

      if (logoFiles.backend?.originalFile) {
        formData.append("backendLogo", logoFiles.backend.originalFile);
      } else if (logoFiles.backend === null) {
        formData.append("backendLogo", ""); // Signal removal
      } else if (typeof settings.backendLogo === 'string') {
        formData.append("backendLogo", settings.backendLogo);
      }

      if (logoFiles.hero?.originalFile) {
        formData.append("image", logoFiles.hero.originalFile);
      } else if (logoFiles.hero === null) {
        formData.append("heroBannerImage", ""); // Signal removal
      } else if (typeof settings.heroBanner?.image === 'string') {
        formData.append("heroBannerImage", settings.heroBanner.image);
      }

      const res = await api.post("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSettings(res.data.settings);
        toast.success("Settings updated successfully");
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.msg || "Failed to save settings");
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure logos, authentication, and platform defaults.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1.5">
          {([
            {id: "general", label: "Branding & General", icon: Globe },
            { id: "coins", label: "Coin System", icon: Coins },
            { id: "hero", label: "Hero Banner", icon: ImageIcon },
            { id: "auth", label: "Authentication", icon: Lock },
            { id: "security", label: "Security & Access", icon: Shield },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-green-50 text-[#1abc60] shadow-sm border border-green-100" 
                  : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8">
            
            {activeTab === "general" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Site Name */}
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Platform Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Site Name</label>
                      <input 
                        value={settings.siteName} 
                        onChange={e => setSettings({...settings, siteName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm" 
                        placeholder="e.g. Turf Booking"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Support Email</label>
                      <input 
                        type="email"
                        value={settings.contactEmail} 
                        onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm" 
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Logos */}
                <div className="space-y-5 pt-4">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Branding Logos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Frontend Logo */}
                    <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Frontend Logo</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">Required</span>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.frontendLogo ? [settings.frontendLogo] : []}
                        onFilesChange={(files) => setLogoFiles(prev => ({ ...prev, frontend: files.length > 0 ? files[0] : null }))}
                        className="bg-white"
                        maxFiles={1}
                      />
                      <p className="text-xs text-gray-500">Recommended: 400x120 PNG with transparent background</p>
                    </div>

                    {/* Backend Logo */}
                    <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Admin Logo</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded border border-gray-300">Optional</span>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.backendLogo ? [settings.backendLogo] : []}
                        onFilesChange={(files) => setLogoFiles(prev => ({ ...prev, backend: files.length > 0 ? files[0] : null }))}
                        className="bg-white"
                        maxFiles={1}
                      />
                      <p className="text-xs text-gray-500">Recommended: 200x200 Square SVG or PNG</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "coins" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Coin Value Configuration</h3>
                  <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Exchange Rate</h4>
                        <p className="text-xs text-gray-500">Set how much each coin is worth in currency (₹).</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">1 Coin = ? (₹)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            value={settings.coinValue} 
                            onChange={e => setSettings({...settings, coinValue: parseFloat(e.target.value) || 0})}
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-bold" 
                            placeholder="1.0"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500">Current Rate: 1 Coin = ₹{settings.coinValue}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/50 rounded-lg border border-yellow-100 flex items-start gap-3">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        Changing this value will affect all future checkouts. For example, if you set it to <strong>2.0</strong>, a user with 10 coins will get a <strong>₹20</strong> discount.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "hero" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Hero Banner Text */}
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Hero Banner Content</h3>
                  <div className="space-y-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Main Heading (Title)</label>
                      <input 
                        value={settings.heroBanner?.title} 
                        onChange={e => setSettings({...settings, heroBanner: {...settings.heroBanner, title: e.target.value}})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm font-bold" 
                        placeholder="e.g. UP YOUR GAME"
                      />
                      <p className="text-[10px] text-gray-500">The last word will be highlighted in green automatically.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Sub-heading (Subtitle)</label>
                      <textarea 
                        rows={3}
                        value={settings.heroBanner?.subtitle} 
                        onChange={e => setSettings({...settings, heroBanner: {...settings.heroBanner, subtitle: e.target.value}})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm resize-none" 
                        placeholder="Enter the descriptive text for your hero section..."
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Banner Image */}
                <div className="space-y-5 pt-4">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Banner Background Image</h3>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">Background Image</span>
                      </div>
                    </div>
                    <MediaUpload 
                      initialFiles={settings.heroBanner?.image ? [settings.heroBanner.image] : []}
                      onFilesChange={(files) => setLogoFiles(prev => ({ ...prev, hero: files.length > 0 ? files[0] : null }))}
                      className="bg-white"
                      maxFiles={1}
                    />
                    <p className="text-xs text-gray-500">Recommended: High-resolution (1920x1080) JPG or WEBP. This will be the main banner image.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "auth" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Google Login */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border border-gray-200 p-4 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Google OAuth</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Enable one-tap login for customers</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.googleLogin.enabled} onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, enabled: e.target.checked}})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                    </label>
                  </div>

                  {settings.googleLogin.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Client ID</label>
                        <input 
                          type="password"
                          value={settings.googleLogin.clientId} 
                          onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, clientId: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Client Secret</label>
                        <input 
                          type="password"
                          value={settings.googleLogin.clientSecret} 
                          onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, clientSecret: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all font-mono text-sm" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Apple Login */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border border-gray-200 p-4 rounded-xl hover:border-gray-300 transition-all bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-sm">
                        <Apple className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Sign in with Apple</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Premium authentication for iOS users</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.appleLogin.enabled} onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, enabled: e.target.checked}})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                    </label>
                  </div>

                  {settings.appleLogin.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Service ID</label>
                        <input 
                          value={settings.appleLogin.clientId} 
                          onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, clientId: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Team ID</label>
                        <input 
                          value={settings.appleLogin.teamId} 
                          onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, teamId: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 flex flex-col sm:flex-row gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 border border-orange-200">
                    <Shield className="text-orange-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-orange-900 font-semibold text-base">Maintenance Mode</h4>
                    <p className="text-orange-800/80 text-sm mt-1">When active, only administrators can access the platform. Customers will see a maintenance message.</p>
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                      className={`mt-4 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        settings.maintenanceMode 
                          ? "bg-orange-500 text-white shadow-sm hover:bg-orange-600" 
                          : "bg-white text-orange-700 border border-orange-300 hover:bg-orange-100"
                      }`}
                    >
                      {settings.maintenanceMode ? "Deactivate Mode" : "Activate Maintenance"}
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-dashed border-gray-300 rounded-xl space-y-3 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Info className="w-5 h-5 text-blue-500" />
                    <span className="text-base font-semibold">Advanced Security</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    More security features including IP Whitelisting, Audit Logs retention policy and Two-Factor Authentication enforcement will be available in future updates.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-gray-200 gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Check className="w-4 h-4 text-[#1abc60]" />
                <span className="text-sm font-medium">Changes auto-saved as draft</span>
              </div>
              <button 
                disabled={isSaving || !isSuperadmin} 
                type="submit" 
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1abc60] text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 hover:bg-[#17a554] transition-colors disabled:opacity-50 text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
