'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, Circle, ImagePlus, Loader2, MapPin, Upload, CheckCircle2, Plus, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/app/services/api';
import Swal from 'sweetalert2';

type VenueFormMode = 'add' | 'edit';

interface VenueFormProps {
  mode: VenueFormMode;
  turfId?: string;
}

interface Court {
  name: string;
  courtType: string;
}

interface PriceHike {
  day: string;
  startTime: string;
  endTime: string;
  hikePercentage: number;
}

interface FormShape {
  name: string;
  description: string;
  pricePerHour: number | string;
  peakHourSurcharge: number | string;
  surfaceType: string;
  address: string;
  city: string;
  landmark: string;
  postcode: string;
  mapUrl: string;
  sports: string[];
  amenities: string[];
  courts: Court[];
  priceHikes: PriceHike[];
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
  termsAccepted: boolean;
  logoFile?: File;
  galleryFiles: File[];
  profilePhoto?: string;
  images?: string[];
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
  pricePerHour: 0,
  peakHourSurcharge: 0,
  surfaceType: 'Hybrid Grass',
  address: '',
  city: '',
  landmark: '',
  postcode: '',
  mapUrl: '',
  sports: [],
  amenities: [],
  courts: [{ name: 'Court 1', courtType: 'Turf' }],
  priceHikes: [],
  weekdayOpen: '06:00',
  weekdayClose: '23:00',
  weekendOpen: '08:00',
  weekendClose: '22:00',
  termsAccepted: false,
  galleryFiles: [],
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
        }
        if (amenities.length) {
          setAmenitiesOptions(amenities);
        }
        if (surfaces.length) {
          setSurfaceOptions(surfaces);
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
          sports: target.sports || [],
          surfaceType: target.surfaceType || 'Hybrid Grass',
          amenities: target.amenities || [],
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
          priceHikes: target.priceHikes || [],
          termsAccepted: true,
          courts: target.courts?.length ? target.courts : [{ name: 'Court 1', courtType: target.surfaceType || 'Synthetic' }],
          galleryFiles: [],
        });
        setExistingImages(Array.isArray(target.images) ? target.images : []);
        setApiCarryForward({
          rates: Array.isArray(target.rates) ? target.rates : [],
          availableSlots: Array.isArray(target.availableSlots) ? target.availableSlots : [],
          courts: target.courts || [],
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
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    const toastId = toast.loading('Detecting your location...');

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
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'TurfBookingApp/1.0 (contact: admin@turf.com)',
              },
            },
          );

          if (!reverseRes.ok) throw new Error('Location service unavailable');
          
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
          toast.success('Location detected successfully!', { id: toastId });
        } catch (error) {
          console.error('Reverse Geocoding Error:', error);
          setForm((prev) => ({
            ...prev,
            address: `Lat ${lat.toFixed(5)}, Lng ${lon.toFixed(5)}`,
            mapUrl,
          }));
          toast.success('Coordinates captured (address lookup failed).', { id: toastId });
        }
      },
      (error) => {
        let msg = 'Unable to fetch location.';
        if (error.code === 1) msg = 'Location permission denied.';
        else if (error.code === 2) msg = 'Location unavailable.';
        else if (error.code === 3) msg = 'Location request timed out.';
        toast.error(msg, { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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

  const effectiveMapPreviewUrl = () => {
    if (form.mapUrl?.trim()) {
      const url = form.mapUrl.trim();
      if (url.includes('output=embed') || url.includes('/maps/embed')) return url;
      const latLngMatch = url.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
      if (latLngMatch?.[1] && latLngMatch?.[3]) return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[3]}&output=embed`;
      if (url.includes('google.com/maps')) return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
      return url;
    }
    const query = [form.address, form.city, form.postcode].filter(Boolean).join(', ');
    if (!query) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  };

  const submitVenue = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.termsAccepted) return toast.error('Please accept the Agreement.');
    if (!form.name || !form.city || !form.address) return toast.error('Please fill name and location.');

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('description', form.description);
      payload.append('sports', JSON.stringify(form.sports));
      payload.append('amenities', JSON.stringify(form.amenities));
      
      const price = parseFloat(String(form.pricePerHour)) || 0;
      const surcharge = parseFloat(String(form.peakHourSurcharge)) || 0;
      
      payload.append('pricePerHour', String(price));
      payload.append('peakHourSurcharge', String(surcharge));
      payload.append('surfaceType', form.surfaceType);
      payload.append('location', JSON.stringify({ address: form.address, city: form.city, landmark: form.landmark, postcode: form.postcode, mapUrl: form.mapUrl }));
      payload.append('operatingHours', JSON.stringify(buildOperatingHours()));
      payload.append('availableSlots', JSON.stringify(apiCarryForward.availableSlots || []));
      payload.append('rates', JSON.stringify(apiCarryForward.rates || []));
      payload.append('courts', JSON.stringify(form.courts || []));
      payload.append('priceHikes', JSON.stringify(form.priceHikes || []));
      payload.append('unavailableDates', JSON.stringify(apiCarryForward.unavailableDates || []));
      payload.append('existingImages', JSON.stringify(existingImages || []));

      if (logoFile) payload.append('logo', logoFile);
      if (heroImage) payload.append('images', heroImage);
      galleryImages.forEach((file) => payload.append('images', file));

      if (mode === 'edit' && turfId) {
        await api.put(`/turfs/${turfId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/turfs', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await Swal.fire({ title: 'Success', icon: 'success' });
      router.push('/admin/venues/list');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save venue.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#1ab35b]" /></div>;

  return (
    <form onSubmit={submitVenue} className="mx-auto w-full max-w-5xl space-y-6 text-[#2a2a2a]">
      <div>
        <h1 className="text-3xl font-bold text-[#2f3337] md:text-4xl">{mode === 'edit' ? 'Edit Venue' : 'Add Venue'}</h1>
        <p className="mt-1 text-sm text-[#6f757c]">Manage your venue information, courts, and pricing.</p>
      </div>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold text-[#353a3f]">01 Venue Identity</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-[11px] font-bold text-[#3f3f3f]">VENUE NAME
              <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="mt-2 h-12 w-full rounded-md border border-[#e6e8e7] bg-[#eff1f0] px-3 text-sm outline-none focus:border-[#1ab35b]" />
            </label>
            <div className="text-[11px] font-bold text-[#3f3f3f]">BRAND LOGO
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoSelected} />
              <button type="button" onClick={() => logoRef.current?.click()} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#d6dad7] bg-[#f2f4f3] text-sm text-[#5f656b]">
                <Upload className="h-4 w-4" /> {logoFile ? logoFile.name : 'Select Logo'}
              </button>
            </div>
          </div>
          <label className="mt-4 block text-[11px] font-bold text-[#3f3f3f]">DESCRIPTION
            <textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} className="mt-2 h-28 w-full rounded-md border border-[#e6e8e7] bg-[#eff1f0] px-3 py-2 text-sm outline-none focus:border-[#1ab35b]" />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold text-[#353a3f]">02 Sports & Facilities</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-5">
          <p className="text-[11px] font-bold text-[#3f3f3f]">SUPPORTED SPORTS</p>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sportsOptions.map(sport => {
              const active = form.sports.includes(sport);
              return (
                <button key={sport} type="button" onClick={() => toggleListValue('sports', sport)} className={`h-16 rounded-xl border-2 text-sm font-bold transition flex items-center justify-center gap-2 relative ${active ? 'border-[#1ab35b] bg-[#eefaf3] text-[#1ab35b]' : 'border-[#e3e6e4] bg-[#f6f7f6] text-[#34383c]'}`}>
                  {active && <CheckCircle2 className="h-4 w-4 fill-[#1ab35b] text-white" />} {sport}
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold text-[#3f3f3f]">SURFACE TYPE</p>
              <div className="mt-3 space-y-2">
                {surfaceOptions.map(surface => (
                  <label key={surface} className="flex h-12 items-center gap-3 rounded-md bg-[#eef0ef] px-3 text-sm text-[#34383c]">
                    <input type="radio" checked={form.surfaceType === surface} onChange={() => setForm(prev => ({ ...prev, surfaceType: surface }))} className="hidden" />
                    <Circle className={`h-4 w-4 ${form.surfaceType === surface ? 'fill-[#1ab35b] text-[#1ab35b]' : 'text-[#6c7379]'}`} /> {surface}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#3f3f3f]">AMENITIES</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {amenitiesOptions.map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm text-[#3a3f43]">
                    <input type="checkbox" checked={form.amenities.includes(item)} onChange={() => toggleListValue('amenities', item)} className="h-4 w-4 rounded accent-[#1ab35b]" /> {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1abc60] pb-1 text-2xl font-bold text-[#353a3f]">03 Courts Management</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-5 space-y-4">
          {form.courts.map((court, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white p-4 rounded-xl border border-gray-100">
              <label className="text-[11px] font-bold text-[#3f3f3f]">COURT NAME
                <input value={court.name} onChange={(e) => {
                  const newCourts = [...form.courts];
                  newCourts[index].name = e.target.value;
                  setForm(prev => ({ ...prev, courts: newCourts }));
                }} className="mt-2 h-11 w-full rounded-md border border-[#e6e8e7] bg-[#eff1f0] px-3 text-sm outline-none focus:border-[#1abc60]" />
              </label>
              <label className="text-[11px] font-bold text-[#3f3f3f]">COURT TYPE
                <select value={court.courtType} onChange={(e) => {
                  const newCourts = [...form.courts];
                  newCourts[index].courtType = e.target.value;
                  setForm(prev => ({ ...prev, courts: newCourts }));
                }} className="mt-2 h-11 w-full rounded-md border border-[#e6e8e7] bg-[#eff1f0] px-3 text-sm outline-none focus:border-[#1abc60]">
                  {surfaceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setForm(prev => ({ ...prev, courts: prev.courts.filter((_, i) => i !== index) }))} className="h-11 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-md px-4 font-bold text-xs">
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setForm(prev => ({ ...prev, courts: [...prev.courts, { name: `Court ${prev.courts.length + 1}`, courtType: prev.surfaceType }] }))} className="flex items-center gap-2 text-[#1abc60] font-bold text-sm hover:underline">
            <Plus className="w-4 h-4" /> Add Another Court
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1abc60] pb-1 text-2xl font-bold text-[#353a3f]">04 Pricing & Hikes</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-[11px] font-bold text-[#3f3f3f]">BASE RATE (PER HOUR)
              <input value={form.pricePerHour} onChange={(e) => setForm(prev => ({ ...prev, pricePerHour: e.target.value }))} className="mt-2 h-12 w-full rounded-md border border-[#e6e8e7] bg-[#eff1f0] px-3 text-sm outline-none focus:border-[#1ab35b]" />
            </label>
            <label className="text-[11px] font-bold text-[#3f3f3f]">PEAK SURCHARGE (DEPRECATED)
              <input value={form.peakHourSurcharge} onChange={(e) => setForm(prev => ({ ...prev, peakHourSurcharge: e.target.value }))} className="mt-2 h-12 w-full rounded-md border border-[#e6e8e7] bg-[#eff1f0] px-3 text-sm outline-none focus:border-[#1ab35b]" />
            </label>
          </div>
          <div className="mt-5 space-y-4">
            <p className="text-[11px] font-bold text-[#3f3f3f]">CUSTOM PRICE HIKES</p>
            {form.priceHikes.map((hike, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-4 rounded-xl border border-gray-100">
                <select value={hike.day} onChange={(e) => {
                  const newHikes = [...form.priceHikes];
                  newHikes[index].day = e.target.value;
                  setForm(prev => ({ ...prev, priceHikes: newHikes }));
                }} className="h-11 w-full rounded-md bg-[#eff1f0] px-3 text-sm">{daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}</select>
                <input type="time" value={hike.startTime} onChange={(e) => {
                  const newHikes = [...form.priceHikes];
                  newHikes[index].startTime = e.target.value;
                  setForm(prev => ({ ...prev, priceHikes: newHikes }));
                }} className="h-11 w-full rounded-md bg-[#eff1f0] px-3 text-sm" />
                <input type="time" value={hike.endTime} onChange={(e) => {
                  const newHikes = [...form.priceHikes];
                  newHikes[index].endTime = e.target.value;
                  setForm(prev => ({ ...prev, priceHikes: newHikes }));
                }} className="h-11 w-full rounded-md bg-[#eff1f0] px-3 text-sm" />
                <input type="number" value={hike.hikePercentage} onChange={(e) => {
                  const newHikes = [...form.priceHikes];
                  newHikes[index].hikePercentage = Number(e.target.value);
                  setForm(prev => ({ ...prev, priceHikes: newHikes }));
                }} className="h-11 w-full rounded-md bg-[#eff1f0] px-3 text-sm" placeholder="Hike %" />
                <button type="button" onClick={() => setForm(prev => ({ ...prev, priceHikes: prev.priceHikes.filter((_, i) => i !== index) }))} className="h-11 flex items-center justify-center bg-red-50 text-red-600 rounded-md"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm(prev => ({ ...prev, priceHikes: [...prev.priceHikes, { day: 'Saturday', startTime: '18:00', endTime: '22:00', hikePercentage: 20 }] }))} className="flex items-center gap-2 text-[#1abc60] font-bold text-sm"><Plus className="w-4 h-4" /> Add Hike Rule</button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold text-[#353a3f]">05 Photo Gallery</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => heroRef.current?.click()} className="col-span-2 h-56 rounded-xl border border-dashed bg-[#f9faf9] overflow-hidden flex flex-col items-center justify-center">
              {heroImage ? <img src={URL.createObjectURL(heroImage)} className="w-full h-full object-cover" /> : <Camera className="h-7 w-7 text-[#1ab35b]" />}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {galleryImages.slice(0, 4).map((file, idx) => <img key={idx} src={URL.createObjectURL(file)} className="h-24 w-full rounded-xl object-cover" />)}
              <button type="button" onClick={() => galleryRef.current?.click()} className="h-24 rounded-xl border border-dashed bg-[#f9faf9] flex items-center justify-center"><Plus className="h-6 w-6" /></button>
            </div>
            <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={onHeroSelected} />
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onGallerySelected} />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.termsAccepted} onChange={(e) => setForm(prev => ({ ...prev, termsAccepted: e.target.checked }))} className="h-4 w-4" /> I agree to the terms
        </label>
        <button disabled={saving} type="submit" className="h-12 bg-[#1ab35b] px-10 rounded-md text-white font-bold uppercase">{saving ? <Loader2 className="animate-spin" /> : 'Save Venue'}</button>
      </div>
    </form>
  );
}
