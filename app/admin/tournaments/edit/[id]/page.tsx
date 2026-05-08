"use client";

import { useState, useEffect, use } from 'react';
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
import Swal from 'sweetalert2';

export default function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  
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

  const getImageUrl = (path: string) => {
    if (!path || path === 'undefined' || path === 'null' || path === '') return '/heroimage.png';
    if (path.startsWith('http')) return path;
    
    // Replace backslashes with forward slashes for cross-platform compatibility
    const normalizedPath = path.replace(/\\/g, '/');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rkinteriorstudio.in/api';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get(`/tournaments/${id}`);
        if (res.data.success) {
          const t = res.data.tournament;
          setFormData({
            title: t.title || '',
            description: t.description || '',
            sport: t.sport || '',
            matchType: t.matchType || '',
            format: t.format || '',
            teamSize: t.teamSize || 11,
            maxSubstitutes: t.maxSubstitutes || 3,
            minPlayers: t.minPlayers || 7,
            startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '',
            endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '',
            registrationDeadline: t.registrationDeadline ? new Date(t.registrationDeadline).toISOString().split('T')[0] : '',
            location: {
              address: t.location?.address || '',
              city: t.location?.city || '',
              venue: t.location?.venue || '',
              mapUrl: t.location?.mapUrl || '',
            },
            crucialDetails: {
              eligibility: t.crucialDetails?.eligibility || '',
              venueGuidelines: t.crucialDetails?.venueGuidelines || '',
              refundPolicy: t.crucialDetails?.refundPolicy || '',
            },
            entryFee: t.entryFee || 0,
            prizePool: t.prizePool || '',
            prizes: {
              winner: t.prizes?.winner || '',
              runnerUp: t.prizes?.runnerUp || '',
              others: t.prizes?.others || '',
            },
            contact: {
              name: t.contact?.name || '',
              phone: t.contact?.phone || '',
              email: t.contact?.email || '',
            },
            rules: t.rules || [],
            maxTeams: t.maxTeams || 16,
            status: t.status || 'upcoming',
          });
          if (t.image) {
            setImagePreview(getImageUrl(t.image));
          }
          setExistingGallery(t.gallery || []);
        }
      } catch (error) {
        toast.error('Failed to load tournament details');
        router.push('/admin/tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, router]);

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
    setSaving(true);

    try {
      const data = new FormData();
      
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

      data.append('existingGallery', JSON.stringify(existingGallery));

      const res = await api.put(`/tournaments/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        await Swal.fire({
          title: 'Tournament Updated',
          text: 'The tournament details have been successfully saved.',
          icon: 'success',
          confirmButtonColor: '#1abc60',
        });
        toast.success('Tournament updated successfully');
        router.push('/admin/tournaments');
      }
    } catch (error: any) {
      await Swal.fire({
        title: 'Update Failed',
        text: error.response?.data?.error || 'Failed to update tournament.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      toast.error(error.response?.data?.error || 'Failed to update tournament');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 md:px-8 pb-8 pt-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <Link 
          href="/admin/tournaments"
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-[#1abc60] hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Tournament</h1>
          <p className="text-sm text-gray-500 mt-1">Update event details and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900">Tournament Banner</h2>
          </div>
          <div className="p-6">
            {imagePreview ? (
              <div className="relative w-full aspect-[21/9] lg:aspect-[21/6] rounded-xl overflow-hidden group border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    className="p-2.5 bg-red-500 text-white rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-[21/9] lg:aspect-[21/6] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-green-50/50 hover:border-[#1abc60] transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-[#1abc60]" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Change Tournament Banner</span>
                <span className="text-xs text-gray-500 mt-1">Recommended: 1920x820px (21:9 Aspect Ratio)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <Layout className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Tournament Overview</h2>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Summer Smash Cricket Cup 2024"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Sport <span className="text-red-500">*</span></label>
                    <select 
                      required
                      name="sport"
                      value={formData.sport}
                      onChange={handleInputChange}
                      className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900"
                    >
                      <option value="">Select Category</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Football">Football</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Padel">Padel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                    <select 
                      required
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="postponed">Postponed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="finished">Finished</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Teams</label>
                    <input 
                      type="number"
                      name="maxTeams"
                      value={formData.maxTeams}
                      onChange={handleInputChange}
                      className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">About Tournament <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the event, target audience, and highlights..."
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400 !resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <Users className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Team Details</h2>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Match Type</label>
                  <input 
                    type="text"
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleInputChange}
                    placeholder="e.g. T20, 5-a-side"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tournament Format</label>
                  <input 
                    type="text"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    placeholder="e.g. League + Knockout"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Size</label>
                  <input 
                    type="number"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Players per Team</label>
                  <input 
                    type="number"
                    name="minPlayers"
                    value={formData.minPlayers}
                    onChange={handleInputChange}
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Substitutes</label>
                  <input 
                    type="number"
                    name="maxSubstitutes"
                    value={formData.maxSubstitutes}
                    onChange={handleInputChange}
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Rules & Format */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <ListOrdered className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Format & Rules</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    placeholder="Add a rule (e.g. 10 Overs per match)"
                    className="!flex-1 !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  />
                  <button 
                    type="button"
                    onClick={addRule}
                    className="px-4 py-2.5 bg-[#1abc60] text-white rounded-lg text-sm font-medium hover:bg-[#17a554] transition-colors shadow-sm"
                  >
                    Add Rule
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 text-[#1abc60] flex items-center justify-center text-xs font-semibold shrink-0">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeRule(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.rules.length === 0 && (
                    <p className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      No rules added yet. Type above and click add.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Crucial Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Crucial Details</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Eligibility</label>
                  <textarea 
                    name="crucialDetails.eligibility"
                    value={formData.crucialDetails.eligibility}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g. Open to all amateur and semi-pro teams..."
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400 !resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue Guidelines</label>
                  <textarea 
                    name="crucialDetails.venueGuidelines"
                    value={formData.crucialDetails.venueGuidelines}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g. Spiked shoes required. Players must arrive 45 mins before..."
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400 !resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Refund Policy</label>
                  <textarea 
                    name="crucialDetails.refundPolicy"
                    value={formData.crucialDetails.refundPolicy}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g. Full refund if cancelled 7 days prior..."
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400 !resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImagePlus className="w-5 h-5 text-[#1abc60]" />
                  <h2 className="text-base font-semibold text-gray-900">Tournament Gallery</h2>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-md">{existingGallery.length + galleryImages.length}/8 Photos</span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingGallery.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                      <img src={getImageUrl(img)} alt="Gallery" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setExistingGallery(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-[#1abc60]">
                      <img src={URL.createObjectURL(file)} alt="Gallery" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-[#1abc60] text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm">New</div>
                    </div>
                  ))}
                  {existingGallery.length + galleryImages.length < 8 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50/50 hover:border-[#1abc60] transition-colors group">
                      <Camera className="w-6 h-6 text-gray-400 group-hover:text-[#1abc60] transition-colors mb-2" />
                      <span className="text-xs font-semibold text-gray-500 group-hover:text-[#1abc60]">Add Photo</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setGalleryImages(prev => [...prev, ...files].slice(0, 8 - existingGallery.length));
                        }} 
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Sidebar Controls */}
          <div className="space-y-6">
            
            {/* Registration Fee */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Registration Fee</h2>
              </div>
              <div className="p-6 space-y-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                  <input 
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    className="!w-full !pl-8 !pr-4 !py-3 !bg-white !border !border-gray-300 focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !rounded-lg focus:!outline-none !font-semibold !text-base !text-gray-900 !transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">Set 0 if the tournament is free to enter.</p>
              </div>
            </div>

            {/* Championship Rewards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <Award className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Rewards</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Prize Pool</label>
                  <input 
                    type="text"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹5,00,000"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Winner's Prize</label>
                  <input 
                    type="text"
                    name="prizes.winner"
                    value={formData.prizes.winner}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹3,50,000"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Runner Up's Prize</label>
                  <input 
                    type="text"
                    name="prizes.runnerUp"
                    value={formData.prizes.runnerUp}
                    onChange={handleInputChange}
                    placeholder="e.g. ₹1,00,000"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Other Rewards (Optional)</label>
                  <input 
                    type="text"
                    name="prizes.others"
                    value={formData.prizes.others}
                    onChange={handleInputChange}
                    placeholder="e.g. Trophies for Best Player"
                    className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors !text-sm !text-gray-900 placeholder:!text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Schedule</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date <span className="text-red-500">*</span></label>
                  <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors" />
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-medium text-red-600 mb-1.5">Registration Deadline <span className="text-red-500">*</span></label>
                  <input required type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleInputChange} className="!w-full !px-3 !py-2.5 !bg-red-50/30 !border !border-red-200 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-red-500/20 focus:!border-red-500 !text-sm !text-gray-900 !transition-colors" />
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Location</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Venue Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="location.venue" value={formData.location.venue} onChange={handleInputChange} placeholder="Arena Name" className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors placeholder:!text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input required type="text" name="location.city" value={formData.location.city} onChange={handleInputChange} placeholder="Bangalore" className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors placeholder:!text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                  <textarea required name="location.address" value={formData.location.address} onChange={handleInputChange} rows={2} placeholder="Complete address..." className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !resize-none !transition-colors placeholder:!text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Google Maps URL (Optional)</label>
                  <input type="text" name="location.mapUrl" value={formData.location.mapUrl} onChange={handleInputChange} placeholder="https://maps.google.com/..." className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors placeholder:!text-gray-400" />
                </div>
                
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 h-40">
                  {effectiveMapPreviewUrl() ? (
                    <iframe
                      title="Tournament Map Preview"
                      src={effectiveMapPreviewUrl()}
                      className="h-full w-full border-0 min-h-[160px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center min-h-[160px]">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <MapPin className="h-6 w-6 text-gray-300" />
                        <span className="text-xs font-medium uppercase tracking-wider">Map Preview</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Organizer Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-[#1abc60]" />
                <h2 className="text-base font-semibold text-gray-900">Organizer Contact</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input required type="text" name="contact.name" value={formData.contact.name} onChange={handleInputChange} placeholder="Organizer Name" className="!w-full !pl-10 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors placeholder:!text-gray-400" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input required type="text" name="contact.phone" value={formData.contact.phone} onChange={handleInputChange} placeholder="Phone Number" className="!w-full !pl-10 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors placeholder:!text-gray-400" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input required type="email" name="contact.email" value={formData.contact.email} onChange={handleInputChange} placeholder="Email Address" className="!w-full !pl-10 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-sm !text-gray-900 !transition-colors placeholder:!text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions - Bottom */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-40">
          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold text-gray-900">Ready to save changes?</h3>
            <p className="text-gray-500 text-xs mt-0.5">Please verify all tournament details before updating.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-[2] sm:flex-none px-8 py-2.5 bg-[#1abc60] text-white rounded-lg text-sm font-semibold hover:bg-[#17a554] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Updating...' : 'Update Tournament'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}