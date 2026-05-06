'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { 
  Camera, ChevronDown, Circle, ImagePlus, Loader2, MapPin, Upload, CheckCircle2,
  Building, FileText, IndianRupee, Clock, Landmark, Mail, Hash
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/app/services/api';
import Swal from 'sweetalert2';

type VenueFormMode = 'add' | 'edit';

interface VenueFormProps {
  mode: VenueFormMode;
  turfId?: string;
}

interface FormShape {
  name: string;
  description: string;
  sports: string[];
  surfaceType: string;
  amenities: string[];
  address: string;
  city: string;
  landmark: string;
  postcode: string;
  mapUrl: string;
  pricePerHour: string;
  peakHourSurcharge: string;
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
  termsAccepted: boolean;
}

interface ApiCarryForwardShape {
  rates: any[];
  availableSlots: any[];
  courts: any[];
  unavailableDates: any[];
}

const defaultForm: FormShape = {
  name: '',
  description: '',
  sports: ['Cricket'],
  surfaceType: 'Hybrid Grass',
  amenities: ['Floodlights', 'Changing Rooms'],
  address: '',
  city: '',
  landmark: '',
  postcode: '',
  mapUrl: '',
  pricePerHour: '',
  peakHourSurcharge: '',
  weekdayOpen: '06:00',
  weekdayClose: '23:00',
  weekendOpen: '08:00',
  weekendClose: '22:00',
  termsAccepted: false,
};

const fallbackSports = ['Football', 'Cricket', 'Tennis', 'Basketball'];
const fallbackSurfaceOptions = ['Artificial Turf (A-Grade)', 'Hybrid Grass', 'Hard Court'];
const fallbackAmenities = ['Floodlights', 'Changing Rooms', 'Shower', 'Parking', 'Water Station', 'Medical Kit'];

export default function VenueForm({ mode, turfId }: VenueFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormShape>(defaultForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [sportsOptions, setSportsOptions] = useState<string[]>(fallbackSports);
  const [surfaceOptions, setSurfaceOptions] = useState<string[]>(fallbackSurfaceOptions);
  const [amenitiesOptions, setAmenitiesOptions] = useState<string[]>(fallbackAmenities);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [apiCarryForward, setApiCarryForward] = useState<ApiCarryForwardShape>({
    rates: [],
    availableSlots: [],
    courts: [{ name: 'Court 1', courtType: 'Synthetic' }],
    unavailableDates: [],
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const logoRef = useRef<HTMLInputElement | null>(null);
  const heroRef = useRef<HTMLInputElement | null>(null);
  const galleryRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const res = await api.get('/masters');
        const masters = res.data?.masters || [];
        const sports = masters.filter((item: any) => item.category === 'sport').map((item: any) => item.name);
        const amenities = masters.filter((item: any) => item.category === 'amenity').map((item: any) => item.name);
        const surfaces = masters
          .filter((item: any) => item.category === 'court_type' || item.category === 'surface_type')
          .map((item: any) => item.name);

        if (sports.length) {
          setSportsOptions(sports);
          setForm((prev) => ({ ...prev, sports: prev.sports.length ? prev.sports : [sports[0]] }));
        }
        if (amenities.length) {
          setAmenitiesOptions(amenities);
        }
        if (surfaces.length) {
          setSurfaceOptions(surfaces);
          setForm((prev) => ({ ...prev, surfaceType: prev.surfaceType || surfaces[0] }));
        }
      } catch (error) {
        toast.error('Failed to load masters, using default options.');
      }
    };

    loadMasters();
  }, []);

  useEffect(() => {
    if (mode !== 'edit') {
      return;
    }

    const loadVenue = async () => {
      setLoading(true);
      try {
        let target: any = null;
        if (turfId) {
          const byIdRes = await api.get(`/turfs/${turfId}`);
          target = byIdRes.data?.turf || null;
        } else {
          const res = await api.get('/turfs/my/all');
          const turfs = res.data?.turfs || [];
          target = turfs[0];
        }
        if (!target) {
          toast.error('No venue found to edit.');
          return;
        }

        const weekdayHours = target.operatingHours?.find((hour: any) => hour.day === 'Monday');
        const weekendHours = target.operatingHours?.find((hour: any) => hour.day === 'Saturday');

        setForm({
          name: target.name || '',
          description: target.description || '',
          sports: target.sports?.length ? target.sports : ['Cricket'],
          surfaceType: target.surfaceType || 'Hybrid Grass',
          amenities: target.amenities?.length ? target.amenities : [],
          address: target.location?.address || '',
          city: target.location?.city || '',
          landmark: target.location?.landmark || '',
          postcode: target.location?.postcode || '',
          mapUrl: target.location?.mapUrl || '',
          pricePerHour: String(target.pricePerHour || ''),
          peakHourSurcharge: String(target.peakHourSurcharge || ''),
          weekdayOpen: weekdayHours?.open || '06:00',
          weekdayClose: weekdayHours?.close || '23:00',
          weekendOpen: weekendHours?.open || '08:00',
          weekendClose: weekendHours?.close || '22:00',
          termsAccepted: true,
        });
        setExistingImages(Array.isArray(target.images) ? target.images : []);
        setApiCarryForward({
          rates: Array.isArray(target.rates) ? target.rates : [],
          availableSlots: Array.isArray(target.availableSlots) ? target.availableSlots : [],
          courts:
            Array.isArray(target.courts) && target.courts.length
              ? target.courts.map((court: any) => ({
                  name: court.name || 'Court 1',
                  courtType: court.courtType || court.type || target.surfaceType || 'Synthetic',
                }))
              : [{ name: 'Court 1', courtType: target.surfaceType || 'Synthetic' }],
          unavailableDates: Array.isArray(target.unavailableDates) ? target.unavailableDates : [],
        });
      } catch (error) {
        toast.error('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
  }, [mode, turfId]);

  const toggleListValue = (field: 'sports' | 'amenities', value: string) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      const next = exists ? prev[field].filter((item) => item !== value) : [...prev[field], value];
      return { ...prev, [field]: next };
    });
  };

  const onLogoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const onHeroSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHeroImage(file);
    }
  };

  const onGallerySelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      setGalleryImages((prev) => [...prev, ...files].slice(0, 10));
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const mapUrl = `https://maps.google.com/?q=${lat},${lon}`;

        try {
          // Add User-Agent as per Nominatim usage policy
          const reverseRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            {
              headers: {
                'User-Agent': 'TurfApp/1.0',
              },
            }
          );
          const reverseData = await reverseRes.json();
          
          const address = reverseData?.display_name || `Lat ${lat.toFixed(5)}, Lng ${lon.toFixed(5)}`;
          const city =
            reverseData?.address?.city ||
            reverseData?.address?.town ||
            reverseData?.address?.suburb ||
            reverseData?.address?.village ||
            reverseData?.address?.state_district ||
            '';
          const postcode = reverseData?.address?.postcode || '';

          setForm((prev) => ({
            ...prev,
            address: address,
            city: city,
            postcode: postcode,
            mapUrl,
          }));
          toast.success('Current location applied.');
        } catch (error) {
          console.error('Reverse Geocoding Error:', error);
          setForm((prev) => ({
            ...prev,
            address: `Lat ${lat.toFixed(5)}, Lng ${lon.toFixed(5)}`,
            mapUrl,
          }));
          toast.success('Location coordinates applied (address fetch failed).');
        }
      },
      (error) => {
        if (error.code === 1) {
          toast.error('Location permission denied. Please allow location access.');
          return;
        }
        toast.error('Unable to fetch current location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const buildOperatingHours = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
      day,
      open: form.weekdayOpen,
      close: form.weekdayClose,
      isOpen: true,
    }));
    const weekends = ['Saturday', 'Sunday'].map((day) => ({
      day,
      open: form.weekendOpen,
      close: form.weekendClose,
      isOpen: true,
    }));
    return [...weekdays, ...weekends];
  };

  const toEmbedUrl = (url: string) => {
    if (!url) {
      return '';
    }
    if (url.includes('output=embed') || url.includes('/maps/embed')) {
      return url;
    }

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
    if (form.mapUrl?.trim()) {
      return toEmbedUrl(form.mapUrl.trim());
    }
    const query = [form.address, form.city, form.postcode].filter(Boolean).join(', ');
    if (!query) {
      return '';
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  };

  const submitVenue = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.termsAccepted) {
      toast.error('Please accept the Venue Partner Agreement.');
      return;
    }
    if (!form.name || !form.city || !form.address) {
      toast.error('Please fill venue name and location details.');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('description', form.description);
      payload.append('sports', JSON.stringify(form.sports));
      payload.append('amenities', JSON.stringify(form.amenities));
      payload.append('pricePerHour', String(Number(form.pricePerHour || 0)));
      payload.append('peakHourSurcharge', String(Number(form.peakHourSurcharge || 0)));
      payload.append('surfaceType', form.surfaceType);
      payload.append(
        'location',
        JSON.stringify({
          address: form.address,
          city: form.city,
          landmark: form.landmark,
          postcode: form.postcode,
          mapUrl: form.mapUrl,
        })
      );
      payload.append('operatingHours', JSON.stringify(buildOperatingHours()));
      payload.append('availableSlots', JSON.stringify(apiCarryForward.availableSlots));
      payload.append('rates', JSON.stringify(apiCarryForward.rates));
      payload.append(
        'courts',
        JSON.stringify(
          (apiCarryForward.courts?.length ? apiCarryForward.courts : [{ name: 'Court 1', courtType: form.surfaceType }]).map(
            (court: any) => ({
              name: court.name || 'Court 1',
              courtType: court.courtType || court.type || form.surfaceType,
            })
          )
        )
      );
      payload.append('unavailableDates', JSON.stringify(apiCarryForward.unavailableDates));
      payload.append('existingImages', JSON.stringify(existingImages));

      if (logoFile) {
        payload.append('logo', logoFile);
      }
      if (heroImage) {
        payload.append('images', heroImage);
      }
      galleryImages.forEach((file) => payload.append('images', file));

      if (mode === 'edit' && turfId) {
        await api.put(`/turfs/${turfId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/turfs', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await Swal.fire({
        title: mode === 'edit' ? 'Venue Updated' : 'Venue Submitted',
        text: mode === 'edit' ? 'Your venue details were updated successfully.' : 'Your venue was submitted for review successfully.',
        icon: 'success',
        confirmButtonColor: '#1abc60',
      });
      toast.success(mode === 'edit' ? 'Venue updated successfully.' : 'Venue submitted for review.');
      router.push('/admin/venues/list');
    } catch (error: any) {
      await Swal.fire({
        title: 'Save Failed',
        text: error?.response?.data?.error || 'Failed to save venue.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      toast.error(error?.response?.data?.error || 'Failed to save venue.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <form onSubmit={submitVenue} className="mx-auto w-full max-w-5xl space-y-6 text-gray-800 p-4 sm:p-6 lg:p-8">
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-5 mb-2">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">
          {mode === 'edit' ? 'Edit Venue' : 'Add Venue'}
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Provide detailed information about your facility to attract more bookings.
        </p>
      </div>

      {/* Section 1: Venue Identity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">1</span>
          <h2 className="text-base font-semibold text-gray-900">Venue Identity</h2>
        </div>
        
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. The Kinetic Arena South"
                  className="!w-full !pl-9 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Official Brand Logo</label>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoSelected} />
              <button 
                type="button" 
                onClick={() => logoRef.current?.click()} 
                className="!flex !w-full !items-center !justify-center !gap-2 !rounded-lg !border !border-dashed !border-gray-300 !bg-gray-50 !px-4 !py-2.5 !text-sm !font-medium !text-gray-600 hover:!border-[#1abc60] hover:!bg-green-50 hover:!text-[#1abc60] !transition-colors !cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {logoFile ? logoFile.name : 'Upload Logo Image'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-gray-700">Venue Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tell customers about your facility's history, vibe, and unique features..."
              className="!h-32 !w-full !rounded-lg !border !border-gray-300 !bg-white !p-3 !text-sm !text-gray-900 !outline-none focus:!border-[#1abc60] focus:!ring-2 focus:!ring-[#1abc60]/20 !transition-colors !resize-none placeholder:!text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Sports & Facilities */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">2</span>
          <h2 className="text-base font-semibold text-gray-900">Sports & Facilities</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Supported Sports</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sportsOptions.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleListValue('sports', sport)}
                  className={`!flex !items-center !justify-between !rounded-lg !border !px-4 !py-2.5 !text-sm !font-medium !transition-colors !cursor-pointer ${
                    form.sports.includes(sport)
                      ? '!border-[#1abc60] !bg-green-50 !text-[#1abc60]'
                      : '!border-gray-200 !bg-white !text-gray-600 hover:!border-gray-300 hover:!bg-gray-50'
                  }`}
                >
                  {sport}
                  {form.sports.includes(sport) && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Surface Type</label>
              <div className="space-y-2 rounded-lg border border-gray-200 p-4 bg-gray-50/50">
                {surfaceOptions.map((surface) => (
                  <label key={surface} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      checked={form.surfaceType === surface}
                      onChange={() => setForm((prev) => ({ ...prev, surfaceType: surface }))}
                      className="hidden"
                    />
                    {form.surfaceType === surface ? (
                      <Circle className="h-4 w-4 fill-[#1abc60] text-[#1abc60]" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                    {surface}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Amenities</label>
              <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 bg-gray-50/50 sm:grid-cols-2">
                {amenitiesOptions.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(item)}
                      onChange={() => toggleListValue('amenities', item)}
                      className="!h-4 !w-4 !rounded !border-gray-300 !text-[#1abc60] focus:!ring-[#1abc60] !cursor-pointer"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Location Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">3</span>
          <h2 className="text-base font-semibold text-gray-900">Location Details</h2>
        </div>
        
        <div className="p-6 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  value={form.address} 
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} 
                  placeholder="Street Name, Area"
                  className="!w-full !pl-9 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
                <input 
                  value={form.city} 
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} 
                  placeholder="City"
                  className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Landmark</label>
                <input 
                  value={form.landmark} 
                  onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))} 
                  placeholder="Nearby landmark"
                  className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Postcode</label>
              <input 
                value={form.postcode} 
                onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value }))} 
                placeholder="PIN Code"
                className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400" 
              />
            </div>

            <button 
              type="button" 
              onClick={detectCurrentLocation} 
              className="!flex !w-full !items-center !justify-center !gap-2 !rounded-lg !border !border-gray-300 !bg-white !px-4 !py-2.5 !text-sm !font-medium !text-gray-700 hover:!bg-gray-50 !transition-colors !shadow-sm !cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-red-500" />
              Auto-Detect Location
            </button>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700">Google Maps Link (Optional)</label>
              <input
                value={form.mapUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, mapUrl: e.target.value }))}
                placeholder="Paste Google Maps URL"
                className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400"
              />
              {form.mapUrl && (
                <a
                  href={form.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs font-medium text-[#1abc60] hover:underline mt-1"
                >
                  Verify Map Link
                </a>
              )}
            </div>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm flex items-center justify-center min-h-[300px]">
            {effectiveMapPreviewUrl() ? (
              <iframe
                title="Venue Map Preview"
                src={effectiveMapPreviewUrl()}
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <MapPin className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium">Map preview will appear here</p>
                <p className="text-xs mt-1">Enter an address or paste a Google Maps link</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Pricing & Availability */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">4</span>
          <h2 className="text-base font-semibold text-gray-900">Pricing & Hours</h2>
        </div>
        
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Rate (Per Hour)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="number"
                  value={form.pricePerHour} 
                  onChange={(e) => setForm((prev) => ({ ...prev, pricePerHour: e.target.value }))} 
                  placeholder="e.g. 1200" 
                  className="!w-full !pl-9 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400" 
                />
              </div>
              <p className="text-xs text-gray-500">Standard rate applied to regular slots.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Peak Hour Surcharge</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="number"
                  value={form.peakHourSurcharge} 
                  onChange={(e) => setForm((prev) => ({ ...prev, peakHourSurcharge: e.target.value }))} 
                  placeholder="e.g. 300" 
                  className="!w-full !pl-9 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors placeholder:!text-gray-400" 
                />
              </div>
              <p className="text-xs text-gray-500">Additional amount added during evening/weekend peak hours.</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Operating Hours</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-600">Weekdays</span>
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    type="time" 
                    value={form.weekdayOpen} 
                    onChange={(e) => setForm((prev) => ({ ...prev, weekdayOpen: e.target.value }))} 
                    className="!flex-1 !px-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors" 
                  />
                  <span className="text-sm text-gray-400">to</span>
                  <input 
                    type="time" 
                    value={form.weekdayClose} 
                    onChange={(e) => setForm((prev) => ({ ...prev, weekdayClose: e.target.value }))} 
                    className="!flex-1 !px-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors" 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-600">Weekends</span>
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    type="time" 
                    value={form.weekendOpen} 
                    onChange={(e) => setForm((prev) => ({ ...prev, weekendOpen: e.target.value }))} 
                    className="!flex-1 !px-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors" 
                  />
                  <span className="text-sm text-gray-400">to</span>
                  <input 
                    type="time" 
                    value={form.weekendClose} 
                    onChange={(e) => setForm((prev) => ({ ...prev, weekendClose: e.target.value }))} 
                    className="!flex-1 !px-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-colors" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Photo Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">5</span>
          <h2 className="text-base font-semibold text-gray-900">Photo Gallery</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cover Image</label>
              <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={onHeroSelected} />
              <button 
                type="button" 
                onClick={() => heroRef.current?.click()} 
                className="!flex !h-56 !w-full !flex-col !items-center !justify-center !rounded-lg !border-2 !border-dashed !border-gray-300 !bg-gray-50 !text-gray-500 hover:!border-[#1abc60] hover:!bg-green-50 !transition-colors !overflow-hidden !relative !cursor-pointer group"
              >
                {heroImage ? (
                  <img src={URL.createObjectURL(heroImage)} alt="Hero" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <Camera className="mb-2 h-8 w-8 text-gray-400 group-hover:text-[#1abc60] transition-colors" />
                    <span className="text-sm font-medium group-hover:text-[#1abc60] transition-colors">Click to upload cover photo</span>
                    <span className="text-xs mt-1 text-gray-400">Recommended size: 1920x1080px</span>
                  </>
                )}
              </button>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Gallery Images</label>
                {galleryImages.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setGalleryImages([])} 
                    className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer bg-transparent border-none p-0 m-0"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onGallerySelected} />
              <button 
                type="button" 
                onClick={() => galleryRef.current?.click()} 
                className="!flex !h-56 !w-full !flex-col !items-center !justify-center !rounded-lg !border-2 !border-dashed !border-gray-300 !bg-gray-50 !text-gray-500 hover:!border-[#1abc60] hover:!bg-green-50 !transition-colors !overflow-hidden !cursor-pointer group relative"
              >
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                    {galleryImages.slice(0, 4).map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt="Gallery" className="h-full w-full object-cover rounded-sm" />
                    ))}
                    {galleryImages.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-medium">
                        +{galleryImages.length - 4} more
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-8 w-8 text-gray-400 group-hover:text-[#1abc60] transition-colors" />
                    <span className="text-sm font-medium group-hover:text-[#1abc60] transition-colors">Add more photos</span>
                    <span className="text-xs mt-1 text-gray-400">Up to 10 images</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-blue-50 p-4 text-sm text-blue-700 border border-blue-100 gap-2">
            <p>High-quality, well-lit photos can increase booking conversion rates significantly.</p>
            {(existingImages.length > 0 || galleryImages.length > 0 || heroImage) && (
              <span className="font-medium whitespace-nowrap bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-100 text-blue-800">
                Selected: {(heroImage ? 1 : 0) + galleryImages.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-40">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 font-medium">
          <input 
            type="checkbox" 
            checked={form.termsAccepted} 
            onChange={(e) => setForm((prev) => ({ ...prev, termsAccepted: e.target.checked }))} 
            className="!h-4 !w-4 !rounded !border-gray-300 !text-[#1abc60] focus:!ring-[#1abc60] !cursor-pointer" 
          />
          I agree to the <span className="text-[#1abc60] hover:underline">Venue Partner Agreement</span>
        </label>
        
        <button
          disabled={saving || !form.termsAccepted}
          type="submit"
          className="!flex !w-full sm:!w-auto !items-center !justify-center !gap-2 !rounded-lg !bg-[#1abc60] !px-8 !py-3 !text-sm !font-semibold !text-white !transition-colors hover:!bg-[#17a554] disabled:!opacity-50 disabled:!cursor-not-allowed !shadow-sm !border-none"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {mode === 'edit' ? 'Update Venue Profile' : 'Publish Venue Profile'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}