"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  ArrowLeft, 
  Save, 
  Loader2, 
  Calendar, 
  MapPin, 
  Info,
  DollarSign,
  Users,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Phone,
  Mail,
  User as UserIcon,
  Layout,
  ListOrdered,
  Award,
  Map,
  ExternalLink,
  Camera,
  CheckCircle2,
  ImagePlus,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import api from '@/app/services/api';
import { toast } from 'sonner';

export default function AddTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  
  const [ruleInput, setRuleInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    matchType: '',
    format: '',
    teamSize: 11,
    maxSubstitutes: 3,
    minPlayers: 7,
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: {
      address: '',
      city: '',
      venue: '',
      mapUrl: '',
    },
    crucialDetails: {
      eligibility: '',
      venueGuidelines: '',
      refundPolicy: '',
    },
    entryFee: 0,
    prizePool: '',
    prizes: {
      winner: '',
      runnerUp: '',
      others: '',
    },
    contact: {
      name: '',
      phone: '',
      email: '',
    },
    rules: [] as string[],
    maxTeams: 16,
    status: 'upcoming',
  });

  const toEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('output=embed') || url.includes('/maps/embed')) return url;

    const latLngMatch = url.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
    if (latLngMatch?.[1] && latLngMatch?.[3]) {
      return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[3]}&output=embed`;
    }

    if (url.includes('google.com/maps')) {
      return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
    }

    return url;
  };

  const effectiveMapPreviewUrl = () => {
    if (formData.location.mapUrl?.trim()) {
      return toEmbedUrl(formData.location.mapUrl.trim());
    }
    const query = [formData.location.venue, formData.location.address, formData.location.city].filter(Boolean).join(', ');
    if (!query) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addRule = () => {
    if (ruleInput.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, ruleInput.trim()]
      }));
      setRuleInput('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Separate basic fields from objects
      const basicFields = ['title', 'description', 'sport', 'startDate', 'endDate', 'registrationDeadline', 'entryFee', 'prizePool', 'maxTeams', 'status', 'matchType', 'format', 'teamSize', 'maxSubstitutes', 'minPlayers'];
      const objectFields = ['location', 'prizes', 'contact', 'rules', 'crucialDetails'];

      basicFields.forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });

      objectFields.forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value) {
          data.append(key, JSON.stringify(value));
        }
      });

      if (image) {
        data.append('image', image);
      }

      if (galleryImages.length > 0) {
        galleryImages.forEach(img => {
          data.append('gallery', img);
        });
      }

      const res = await api.post('/tournaments', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Tournament created successfully');
        router.push('/admin/tournaments');
      }
    } catch (error: any) {
      console.error('Full Error Object:', error);
      console.error('Response Data:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/tournaments"
          className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-[#1abc60] transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Tournament</h1>
          <p className="text-gray-500 text-sm font-medium">Design a professional sports event for your community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner Section */}
        <div className="bg-white p-1 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {imagePreview ? (
            <div className="relative w-full aspect-[21/9] rounded-[22px] overflow-hidden group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(''); }}
                  className="p-3 bg-red-500 text-white rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-[21/9] rounded-[22px] border-4 border-dashed border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 hover:border-[#1abc60]/30 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="w-8 h-8 text-[#1abc60]" />
              </div>
              <span className="text-lg font-bold text-gray-700">Upload Tournament Banner</span>
              <span className="text-xs text-gray-400 mt-2 font-medium">Recommended: 1920x820px (21:9 Aspect Ratio)</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#1abc60] mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Layout className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-800">Tournament Overview</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input 
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Summer Smash Cricket Cup 2024"
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Sport</label>
                    <select 
                      required
                      name="sport"
                      value={formData.sport}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="">Select Category</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Football">Football</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Padel">Padel</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      required
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="postponed">Postponed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="finished">Finished</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Teams</label>
                    <input 
                      type="number"
                      name="maxTeams"
                      value={formData.maxTeams}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About Tournament</label>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Describe the event, target audience, and highlights..."
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-medium text-gray-600 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#1abc60] mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-800">Team Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Match Type</label>
                  <input 
                    type="text"
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleInputChange}
                    placeholder="e.g. T20, 5-a-side"
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tournament Format</label>
                  <input 
                    type="text"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    placeholder="e.g. League + Knockout"
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Team Size</label>
                  <input 
                    type="number"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Players per Team</label>
                  <input 
                    type="number"
                    name="minPlayers"
                    value={formData.minPlayers}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Substitutes</label>
                  <input 
                    type="number"
                    name="maxSubstitutes"
                    value={formData.maxSubstitutes}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 focus:border-[#1abc60] transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Rules & Format */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#1abc60] mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-800">Format & Rules</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    placeholder="Add a rule (e.g. 10 Overs per match)"
                    className="flex-1 px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1abc60] font-medium text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  />
                  <button 
                    type="button"
                    onClick={addRule}
                    className="px-6 bg-[#1abc60] text-white rounded-2xl font-bold hover:bg-[#16a352] transition-all active:scale-95"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl group animate-in fade-in slide-in-from-left-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1abc60] text-white flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{rule}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeRule(idx)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.rules.length === 0 && (
                    <p className="text-center py-8 text-gray-400 text-xs font-medium border-2 border-dashed border-gray-50 rounded-2xl">
                      No rules added yet. Click above to start defining the format.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Championship Rewards */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#1abc60] mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-800">Championship Rewards</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Prize Pool</label>
                  <input 
                    type="text"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹5,00,000"
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 font-bold text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-[#1abc60] to-[#16a352] rounded-3xl text-white space-y-2">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Winner's Prize</label>
                  <input 
                    type="text"
                    name="prizes.winner"
                    value={formData.prizes.winner}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹3,50,000"
                    className="w-full bg-transparent border-none focus:ring-0 text-2xl font-black placeholder:text-white/40"
                  />
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl text-white space-y-2">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Runner Up's Prize</label>
                  <input 
                    type="text"
                    name="prizes.runnerUp"
                    value={formData.prizes.runnerUp}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹1,00,000"
                    className="w-full bg-transparent border-none focus:ring-0 text-2xl font-black placeholder:text-white/40"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Other Rewards (Optional)</label>
                  <input 
                    type="text"
                    name="prizes.others"
                    value={formData.prizes.others}
                    onChange={handleInputChange}
                    placeholder="e.g. Trophies for Best Player, Best Bowler, etc."
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1abc60]/10 font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Crucial Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#1abc60] mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-800">Crucial Details</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1abc60]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#1abc60]" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Eligibility</label>
                    <textarea 
                      name="crucialDetails.eligibility"
                      value={formData.crucialDetails.eligibility}
                      onChange={handleInputChange}
                      placeholder="e.g. Open to all amateur and semi-pro teams..."
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1abc60] font-medium text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Venue Guidelines</label>
                    <textarea 
                      name="crucialDetails.venueGuidelines"
                      value={formData.crucialDetails.venueGuidelines}
                      onChange={handleInputChange}
                      placeholder="e.g. Spiked shoes required. Players must arrive 45 mins before..."
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1abc60] font-medium text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Refund Policy</label>
                    <textarea 
                      name="crucialDetails.refundPolicy"
                      value={formData.crucialDetails.refundPolicy}
                      onChange={handleInputChange}
                      placeholder="e.g. Full refund if cancelled 7 days prior..."
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#1abc60] font-medium text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#1abc60] mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-800">Tournament Gallery</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={URL.createObjectURL(file)} alt="Gallery" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {galleryImages.length < 8 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group">
                    <Camera className="w-6 h-6 text-gray-300 group-hover:text-[#1abc60] transition-colors" />
                    <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Add Photo</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setGalleryImages(prev => [...prev, ...files].slice(0, 8));
                      }} 
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                Add up to 8 additional photos of the venue, trophies, or past events.
              </p>
            </div>
          </div>

          {/* Right Side: Sidebar Controls */}
          <div className="space-y-8">
            {/* Registration Fee */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entry Fee (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1abc60]" />
                  <input 
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-5 py-4 bg-green-50/50 border-2 border-transparent focus:border-[#1abc60] rounded-2xl focus:outline-none font-black text-2xl text-[#1abc60]"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-gray-800 font-black">
                <Calendar className="w-5 h-5 text-[#1abc60]" />
                <h3>Schedule</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                  <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Reg. Deadline</label>
                  <input required type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleInputChange} className="w-full px-5 py-3 bg-red-50/50 border border-red-100 rounded-xl focus:outline-none focus:border-red-400 font-bold text-red-600 text-sm" />
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-gray-800 font-black">
                <MapPin className="w-5 h-5 text-[#1abc60]" />
                <h3>Venue Details</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Venue Name</label>
                    <input required type="text" name="location.venue" value={formData.location.venue} onChange={handleInputChange} placeholder="Arena Name" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                    <input required type="text" name="location.city" value={formData.location.city} onChange={handleInputChange} placeholder="Bangalore" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                    <textarea required name="location.address" value={formData.location.address} onChange={handleInputChange} rows={2} placeholder="Complete address..." className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-medium text-gray-600 text-sm resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps URL (Optional)</label>
                    <input type="text" name="location.mapUrl" value={formData.location.mapUrl} onChange={handleInputChange} placeholder="https://maps.google.com/..." className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 aspect-video lg:aspect-auto">
                  {effectiveMapPreviewUrl() ? (
                    <iframe
                      title="Tournament Map Preview"
                      src={effectiveMapPreviewUrl()}
                      className="h-full w-full border-0 min-h-[250px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center min-h-[250px]">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <MapPin className="h-8 w-8 text-gray-200" />
                        <span className="text-xs font-bold uppercase tracking-widest">Map Preview</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-gray-800 font-black">
                <UserIcon className="w-5 h-5 text-[#1abc60]" />
                <h3>Contact Organizer</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="text" name="contact.name" value={formData.contact.name} onChange={handleInputChange} placeholder="Organizer Name" className="w-full pl-10 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="text" name="contact.phone" value={formData.contact.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full pl-10 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="email" name="contact.email" value={formData.contact.email} onChange={handleInputChange} placeholder="Email Address" className="w-full pl-10 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#1abc60] font-bold text-gray-700 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Bottom */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between gap-6">
          <div className="hidden md:block">
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Ready to publish?</h3>
            <p className="text-gray-500 text-sm font-medium">Double check all details before saving.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] md:flex-none px-12 py-4 bg-[#1abc60] text-white rounded-2xl font-black text-lg hover:bg-[#16a352] transition-all shadow-xl shadow-green-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 min-w-[240px]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              {loading ? 'Processing...' : 'Save & Publish Tournament'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
