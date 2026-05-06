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
  const [activeTab, setActiveTab] = useState<"general" | "auth" | "security" | "hero">("general");

  const [settings, setSettings] = useState<any>({
    frontendLogo: "",
    backendLogo: "",
    heroBanner: {
      title: "UP YOUR GAME",
      subtitle: "Premium sports venues, professional training, and competitive matches. Book your victory in seconds.",
      image: "/heroimage.png",
    },
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

  const [uploadedFiles, setUploadedFiles] = useState<{
    frontend?: any;
    backend?: any;
    hero?: any;
  }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        // Merge with initial state to ensure all fields exist
        setSettings((prev: any) => ({
          ...prev,
          ...res.data.settings,
          heroBanner: {
            ...prev.heroBanner,
            ...(res.data.settings.heroBanner || {})
          }
        }));
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
      
      // Send both as a JSON string and as individual fields to be safe
      const heroBannerData = {
        title: settings.heroBanner?.title || "",
        subtitle: settings.heroBanner?.subtitle || "",
        image: settings.heroBanner?.image || "",
      };
      formData.append("heroBanner", JSON.stringify(heroBannerData));
      formData.append("heroTitle", settings.heroBanner?.title || "");
      formData.append("heroSubtitle", settings.heroBanner?.subtitle || "");
      formData.append("hero_title", settings.heroBanner?.title || "");
      formData.append("hero_subtitle", settings.heroBanner?.subtitle || "");

      // Handle logos
      if (uploadedFiles.frontend?.originalFile) {
        formData.append("frontendLogo", uploadedFiles.frontend.originalFile);
      } else if (typeof settings.frontendLogo === 'string') {
        formData.append("existingFrontendLogo", settings.frontendLogo);
      }

      if (uploadedFiles.backend?.originalFile) {
        formData.append("backendLogo", uploadedFiles.backend.originalFile);
      } else if (typeof settings.backendLogo === 'string') {
        formData.append("existingBackendLogo", settings.backendLogo);
      }

      if (uploadedFiles.hero?.originalFile) {
        formData.append("image", uploadedFiles.hero.originalFile);
      } else if (settings.heroBanner?.image) {
        formData.append("existingHeroImage", settings.heroBanner.image);
      }

      const res = await api.post("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSettings((prev: any) => ({
          ...prev,
          ...res.data.settings,
          heroBanner: {
            ...prev.heroBanner,
            ...(res.data.settings.heroBanner || {})
          }
        }));
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure logos, authentication, and platform defaults.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1.5">
          {[
            { id: "general", label: "Branding & General", icon: Globe },
            { id: "hero", label: "Hero Banner", icon: ImageIcon },
            { id: "auth", label: "Authentication", icon: Lock },
            { id: "security", label: "Security & Access", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-[#1abc60] shadow-sm border border-gray-200" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
            
            {activeTab === "general" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Site Name */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Platform Identity</h3>
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
                        value={settings.contactEmail} 
                        onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm" 
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Logos */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Branding Logos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Frontend Logo */}
                    <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Frontend Logo</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">Required</span>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.frontendLogo ? [settings.frontendLogo] : []}
                        onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, frontend: files[0] }))}
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
                        <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide bg-gray-200 px-2 py-0.5 rounded-md border border-gray-300">Optional</span>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.backendLogo ? [settings.backendLogo] : []}
                        onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, backend: files[0] }))}
                        className="bg-white"
                        maxFiles={1}
                      />
                      <p className="text-xs text-gray-500">Recommended: 200x200 Square SVG or PNG</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "hero" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Hero Content */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Hero Section Content</h3>
                  <div className="space-y-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Main Heading</label>
                      <input 
                        value={settings.heroBanner?.title || ""} 
                        onChange={e => setSettings({...settings, heroBanner: {...settings.heroBanner, title: e.target.value}})}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm font-bold" 
                        placeholder="e.g. UP YOUR GAME"
                      />
                      <p className="text-[10px] text-gray-500 font-medium italic">* The last word will automatically be styled in green on the frontend.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Sub-heading / Description</label>
                      <textarea 
                        value={settings.heroBanner?.subtitle || ""} 
                        onChange={e => setSettings({...settings, heroBanner: {...settings.heroBanner, subtitle: e.target.value}})}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1abc60]/20 focus:border-[#1abc60] transition-all text-sm leading-relaxed" 
                        placeholder="Premium sports venues, professional training..."
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Background Image */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Hero Background</h3>
                  <div className="pt-2">
                    <div className="space-y-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Background Image</span>
                        </div>
                      </div>
                      <MediaUpload 
                        initialFiles={settings.heroBanner?.image ? [(() => {
                          const img = settings.heroBanner.image;
                          if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('blob:')) return img;
                          if (img.startsWith('/uploads') || img.startsWith('uploads')) {
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
                            const path = img.startsWith('/') ? img : `/${img}`;
                            return `${baseUrl}${path}`;
                          }
                          // For local assets like /heroimage.png, ensure they load from frontend origin
                          if (typeof window !== 'undefined' && img.startsWith('/')) {
                            return window.location.origin + img;
                          }
                          return img;
                        })()] : []}
                        onFilesChange={(files) => setUploadedFiles(prev => ({ ...prev, hero: files[0] }))}
                        className="bg-white"
                        maxFiles={1}
                      />
                      <p className="text-xs text-gray-500">Recommended: High resolution 1920x1080 JPEG or WEBP</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "auth" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Google Login */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border border-gray-200 p-4 rounded-xl hover:border-gray-300 transition-all">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
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
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Client Secret</label>
                        <input 
                          type="password"
                          value={settings.googleLogin.clientSecret} 
                          onChange={e => setSettings({...settings, googleLogin: {...settings.googleLogin, clientSecret: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Apple Login */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border border-gray-200 p-4 rounded-xl hover:border-gray-300 transition-all">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
                    </label>
                  </div>

                  {settings.appleLogin.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Service ID</label>
                        <input 
                          value={settings.appleLogin.clientId} 
                          onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, clientId: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Team ID</label>
                        <input 
                          value={settings.appleLogin.teamId} 
                          onChange={e => setSettings({...settings, appleLogin: {...settings.appleLogin, teamId: e.target.value}})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 border border-orange-200">
                    <Shield className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-orange-900 font-semibold text-sm">Maintenance Mode</h4>
                    <p className="text-orange-800/80 text-xs mt-1">When active, only administrators can access the platform. Customers will see a maintenance message.</p>
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
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-semibold">Advanced Security</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    More security features including IP Whitelisting, Audit Logs retention policy and Two-Factor Authentication enforcement will be available in future updates.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <Check className="w-4 h-4 text-[#1abc60]" />
                <span className="text-sm font-medium">Changes auto-saved as draft</span>
              </div>
              <button 
                disabled={isSaving || !isSuperadmin} 
                type="submit" 
                className="px-6 py-2.5 bg-[#1abc60] text-white rounded-lg font-medium shadow-sm flex items-center gap-2 hover:bg-[#16a085] transition-all disabled:opacity-50 text-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Publish Settings</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}