"use client";

import { useState, useEffect } from "react";
import { 
  Save, Loader2, Globe, Lock, Shield, 
  Image as ImageIcon, Apple, 
  Check, Info, Upload
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/app/services/api";
import { toast } from "sonner";
import MediaUpload from "@/components/MediaUpload";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminSettingsPage() {
  const { isSuperadmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "auth" | "security">("general");

  const [settings, setSettings] = useState<any>({
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
  });

  const [logoFiles, setLogoFiles] = useState<{
    frontend?: any;
    backend?: any;
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
    } catch (error) {
      console.error("Failed to fetch settings");
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
      formData.append("googleLogin", JSON.stringify(settings.googleLogin));
      formData.append("appleLogin", JSON.stringify(settings.appleLogin));

      // Handle logos
      if (logoFiles.frontend?.originalFile) {
        formData.append("frontendLogo", logoFiles.frontend.originalFile);
      } else if (typeof settings.frontendLogo === 'string') {
        formData.append("existingFrontendLogo", settings.frontendLogo);
      }

      if (logoFiles.backend?.originalFile) {
        formData.append("backendLogo", logoFiles.backend.originalFile);
      } else if (typeof settings.backendLogo === 'string') {
        formData.append("existingBackendLogo", settings.backendLogo);
      }

      const res = await api.post("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSettings(res.data.settings);
        toast.success("Settings updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Failed to save settings");
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Configure logos, authentication and platform defaults</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "general", label: "Branding & General", icon: Globe },
            { id: "auth", label: "Authentication", icon: Lock },
            { id: "security", label: "Security & Access", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-[#1abc60] shadow-sm border border-slate-100" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
            
            {activeTab === "general" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                {/* Site Name */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Platform Identity</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-1">Site Name</label>
                      <input 
                        value={settings.siteName} 
                        onChange={e => setSettings({...settings, siteName: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all font-semibold" 
                        placeholder="e.g. Turf Booking"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 ml-1">Support Email</label>
                      <input 
                        value={settings.contactEmail} 
                        onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all font-semibold" 
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Logos */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding Logos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Frontend Logo */}
                    <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Frontend Logo</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#1abc60] uppercase bg-green-50 px-2 py-0.5 rounded">Required</span>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.frontendLogo ? [settings.frontendLogo] : []}
                        onFilesChange={(files) => setLogoFiles(prev => ({ ...prev, frontend: files[0] }))}
                        className="bg-white"
                        maxFiles={1}
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Recommended: 400x120 PNG with transparent background</p>
                    </div>

                    {/* Backend Logo */}
                    <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">Admin Dashboard Logo</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200 px-2 py-0.5 rounded">Optional</span>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.backendLogo ? [settings.backendLogo] : []}
                        onFilesChange={(files) => setLogoFiles(prev => ({ ...prev, backend: files[0] }))}
                        className="bg-white"
                        maxFiles={1}
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Recommended: 200x200 Square SVG or PNG</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "auth" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                {/* Google Login */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Google OAuth</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enable one-tap login for customers</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.googleLogin.enabled} onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, enabled: e.target.checked}})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                    </label>
                  </div>

                  {settings.googleLogin.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client ID</label>
                        <input 
                          type="password"
                          value={settings.googleLogin.clientId} 
                          onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, clientId: e.target.value}})}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Secret</label>
                        <input 
                          type="password"
                          value={settings.googleLogin.clientSecret} 
                          onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, clientSecret: e.target.value}})}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Apple Login */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                        <Apple className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Sign in with Apple</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premium authentication for iOS users</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.appleLogin.enabled} onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, enabled: e.target.checked}})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                    </label>
                  </div>

                  {settings.appleLogin.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service ID</label>
                        <input 
                          value={settings.appleLogin.clientId} 
                          onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, clientId: e.target.value}})}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team ID</label>
                        <input 
                          value={settings.appleLogin.teamId} 
                          onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, teamId: e.target.value}})}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none font-mono text-sm" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-orange-900 font-bold text-sm">Maintenance Mode</h4>
                    <p className="text-orange-700/70 text-xs mt-0.5">When active, only administrators can access the platform. Customers will see a maintenance message.</p>
                    <button 
                      type="button"
                      onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                      className={`mt-4 px-6 py-2 rounded-xl font-bold text-xs transition-all ${
                        settings.maintenanceMode 
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                          : "bg-white text-orange-600 border border-orange-200"
                      }`}
                    >
                      {settings.maintenanceMode ? "Deactivate Now" : "Activate Mode"}
                    </button>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Info className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Advanced Security</span>
                  </div>
                  <p className="text-sm text-slate-500">More security features including IP Whitelisting, Audit Logs retention policy and Two-Factor Authentication enforcement will be available in future updates.</p>
                </div>
              </motion.div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-12 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-400">
                <Check className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tighter">Changes auto-saved as draft</span>
              </div>
              <button 
                disabled={isSaving || !isSuperadmin} 
                type="submit" 
                className="px-12 py-4 bg-[#1abc60] text-white rounded-2xl font-black shadow-xl shadow-green-100 flex items-center gap-3 hover:bg-[#16a085] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Publish Settings</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
