"use client";

import { useState, useEffect } from 'react';
import { 
  Loader2, QrCode, Landmark, Save, CheckCircle2, 
  Info, ArrowRight, Building, ExternalLink, Plus 
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { useAuth } from '@/app/context/AuthContext';

interface Turf {
  _id: string;
  name: string;
  upiId: string;
  location: { city: string };
}

export default function QRSettingsPage() {
  const { isSuperadmin } = useAuth();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const endpoint = isSuperadmin ? '/turfs' : '/turfs/my/all';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setTurfs(res.data.turfs || []);
      }
    } catch (error) {
      toast.error("Failed to load your venues");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUPI = async (turfId: string, upiId: string) => {
    try {
      setSaving(turfId);
      const res = await api.put(`/turfs/${turfId}`, { upiId });
      if (res.data.success) {
        toast.success("UPI ID updated successfully!");
        setTurfs(prev => prev.map(t => t._id === turfId ? { ...t, upiId } : t));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60] mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading Payment Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <QrCode className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">QR Code Settings</h1>
          <p className="text-gray-500 mt-2 font-medium max-w-lg">
            Manage your UPI IDs for each venue. These will be used to generate dynamic QR codes during offline bookings.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-blue-900">How it works</h3>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            When you record an offline booking and select "Online Payment", the customer will scan a QR code linked to the UPI ID you set here. The money goes directly to your account.
          </p>
        </div>
      </div>

      {/* Venues List */}
      <div className="grid gap-6">
        {turfs.map((turf) => (
          <div key={turf._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Left: QR Preview */}
            <div className="md:w-64 bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                {turf.upiId ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${turf.upiId}&pn=${turf.name}&cu=INR`)}`}
                    alt="UPI QR Code"
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 flex flex-col items-center justify-center text-gray-300 gap-2">
                    <QrCode className="w-12 h-12" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No UPI ID</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Preview</p>
            </div>

            {/* Right: Controls */}
            <div className="flex-1 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building className="w-5 h-5 text-[#1abc60]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{turf.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{turf.location.city}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your UPI ID (VPA)</label>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1abc60] transition-colors" />
                    <input 
                      type="text" 
                      defaultValue={turf.upiId}
                      onBlur={(e) => {
                        if (e.target.value !== turf.upiId) {
                          handleUpdateUPI(turf._id, e.target.value);
                        }
                      }}
                      placeholder="e.g. yourname@okaxis"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all outline-none"
                    />
                  </div>
                  <button 
                    className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl border border-gray-200 hover:bg-white hover:text-[#1abc60] hover:border-[#1abc60] transition-all group"
                    onClick={() => {
                      const input = document.querySelector(`input[defaultValue="${turf.upiId}"]`) as HTMLInputElement;
                      if (input) handleUpdateUPI(turf._id, input.value);
                    }}
                  >
                    {saving === turf._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">
                  * Changes are saved automatically when you click away or press the save icon.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready for Bookings
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                  Test Transaction <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {turfs.length === 0 && (
          <div className="bg-white py-20 rounded-3xl border border-gray-100 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Building className="w-10 h-10 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">No Venues Found</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">
                You need to have a venue assigned to you to configure payment settings.
              </p>
            </div>
            {!isSuperadmin && (
              <a 
                href="/admin/venues/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1abc60] text-white rounded-xl font-bold text-sm hover:bg-[#17a554] transition-all shadow-md no-underline"
              >
                <Plus className="w-4 h-4" />
                Add Your First Venue
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
