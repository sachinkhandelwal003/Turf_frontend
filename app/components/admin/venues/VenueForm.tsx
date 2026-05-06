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
            },
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
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
        }),
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
            }),
          ),
        ),
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
        confirmButtonColor: '#1ab35b',
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#1ab35b]" />
      </div>
    );
  }

  return (
    <form onSubmit={submitVenue} className="mx-auto w-full max-w-5xl space-y-6 text-[#2a2a2a]">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[#2f3337] md:text-4xl">{mode === 'edit' ? 'Edit Venue' : 'Add Venue'}</h1>
        <p className="mt-1 text-sm text-[#6f757c] md:text-base">Manage your athlete credentials and contact information.</p>
      </div>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold leading-none text-[#353a3f] md:text-3xl">01 Venue Identity</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                VENUE NAME
              </label>
              <div className="relative group flex items-center bg-[#eff1f0] border border-[#e6e8e7] rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus-within:border-[#1abc60] transition-all">
                <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                  <Building className="w-5 h-5" />
                </div>
                <div className="w-px h-6 bg-gray-300/50" />
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. The Kinetic Arena South"
                  className="flex-1 px-5 py-4 bg-transparent text-sm font-bold outline-none text-gray-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                OFFICIAL BRAND LOGO
              </p>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoSelected} />
              <button type="button" onClick={() => logoRef.current?.click()} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d6dad7] bg-[#f2f4f3] text-sm font-bold text-[#5f656b] hover:border-[#1abc60] hover:bg-white transition-all">
                <Upload className="h-5 w-5" />
                {logoFile ? logoFile.name : 'Select Logo'}
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
              VENUE DESCRIPTION
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tell owners about your facility's history, vibe, and unique features..."
              className="h-32 w-full rounded-2xl border border-[#e6e8e7] bg-[#eff1f0] px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all resize-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold leading-none text-[#353a3f] md:text-3xl">02 Sports & Facilities</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-4 sm:p-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f]">SUPPORTED SPORTS</p>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sportsOptions.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleListValue('sports', sport)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                  form.sports.includes(sport)
                    ? 'border-[#1abc60] bg-green-50 text-[#1abc60] shadow-lg shadow-green-100'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
              >
                {sport}
                {form.sports.includes(sport) && <CheckCircle2 className="h-4 w-4 fill-[#1abc60] text-white" />}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f]">SURFACE TYPE</p>
              <div className="mt-3 space-y-2">
                {surfaceOptions.map((surface) => (
                  <label key={surface} className="flex h-12 items-center gap-3 rounded-md bg-[#eef0ef] px-3 text-sm text-[#34383c]">
                    <input
                      type="radio"
                      checked={form.surfaceType === surface}
                      onChange={() => setForm((prev) => ({ ...prev, surfaceType: surface }))}
                      className="hidden"
                    />
                    {form.surfaceType === surface ? <Circle className="h-4 w-4 fill-[#1ab35b] text-[#1ab35b]" /> : <Circle className="h-4 w-4 text-[#6c7379]" />}
                    {surface}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f]">AMENITIES</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {amenitiesOptions.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-[#3a3f43]">
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(item)}
                      onChange={() => toggleListValue('amenities', item)}
                      className="h-4 w-4 rounded accent-[#1ab35b]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold leading-none text-[#353a3f] md:text-3xl">03 Location Details</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#f4f5f5] p-4 sm:p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                STREET ADDRESS
              </label>
              <div className="relative group flex items-center bg-[#eff1f0] border border-[#e6e8e7] rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
                <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="w-px h-6 bg-gray-300/50" />
                <input 
                  value={form.address} 
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} 
                  placeholder="Street Name, Area"
                  className="flex-1 px-5 py-4 bg-transparent text-sm font-bold outline-none text-gray-700" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                  CITY
                </label>
                <input 
                  value={form.city} 
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} 
                  placeholder="City"
                  className="h-14 w-full rounded-2xl border border-[#e6e8e7] bg-[#eff1f0] px-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                  LANDMARK
                </label>
                <input 
                  value={form.landmark} 
                  onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))} 
                  placeholder="Nearby landmark"
                  className="h-14 w-full rounded-2xl border border-[#e6e8e7] bg-[#eff1f0] px-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                POSTCODE
              </label>
              <input 
                value={form.postcode} 
                onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value }))} 
                placeholder="PIN Code"
                className="h-14 w-full rounded-2xl border border-[#e6e8e7] bg-[#eff1f0] px-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
              />
            </div>

            <button type="button" onClick={detectCurrentLocation} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#d7dbd8] bg-white text-sm font-bold text-[#3f4348] hover:bg-gray-50 transition-all shadow-sm">
              <MapPin className="h-5 w-5 text-red-500" />
              Detect Current Location
            </button>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                MAP LINK (OPTIONAL)
              </label>
              <input
                value={form.mapUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, mapUrl: e.target.value }))}
                placeholder="Paste Google Maps link"
                className="h-14 w-full rounded-2xl border border-[#e6e8e7] bg-[#eff1f0] px-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all"
              />
            </div>
            {form.mapUrl ? (
              <a
                href={form.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-[#1ab35b] underline"
              >
                Open map link
              </a>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#dde1df] bg-[#ecefee]">
            {effectiveMapPreviewUrl() ? (
              <iframe
                title="Venue Map Preview"
                src={effectiveMapPreviewUrl()}
                className="h-[320px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-[320px] w-full items-center justify-center bg-[radial-gradient(circle_at_15%_20%,#dfe7e3_8%,transparent_8%),radial-gradient(circle_at_80%_35%,#d5dfda_8%,transparent_8%),linear-gradient(120deg,#dbe3df,#eff3f1)]">
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#485057] shadow">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Paste map link for preview
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-[#1ab35b] pb-1 text-2xl font-bold leading-none text-[#353a3f] md:text-3xl">04 Pricing & Availability</h2>
        <div className="rounded-2xl bg-[#f4f5f5] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                BASE RATE (PER HOUR)
              </label>
              <div className="relative group flex items-center bg-[#eff1f0] border border-[#e6e8e7] rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
                <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div className="w-px h-6 bg-gray-300/50" />
                <input 
                  value={form.pricePerHour} 
                  onChange={(e) => setForm((prev) => ({ ...prev, pricePerHour: e.target.value }))} 
                  placeholder="₹ 4500.00" 
                  className="flex-1 px-5 py-4 bg-transparent text-sm font-bold outline-none text-gray-700" 
                />
              </div>
              <p className="mt-1 text-xs font-medium text-[#8d9399]">Average rate for similar venues in your area is ₹ 3500 - ₹ 5000.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">
                PEAK HOUR SURCHARGE
              </label>
              <div className="relative group flex items-center bg-[#eff1f0] border border-[#e6e8e7] rounded-2xl focus-within:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all">
                <div className="pl-6 pr-3 text-gray-400 group-focus-within:text-[#1abc60]">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div className="w-px h-6 bg-gray-300/50" />
                <input 
                  value={form.peakHourSurcharge} 
                  onChange={(e) => setForm((prev) => ({ ...prev, peakHourSurcharge: e.target.value }))} 
                  placeholder="₹ 1500.00" 
                  className="flex-1 px-5 py-4 bg-transparent text-sm font-bold outline-none text-gray-700" 
                />
              </div>
              <p className="mt-1 text-xs font-medium text-[#8d9399]">Applied weekdays 6 PM - 10 PM.</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#3f3f3f] uppercase">OPERATING HOURS</p>
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-[120px_1fr_20px_1fr] sm:items-center">
                <span className="font-bold text-[#3a3f43] uppercase tracking-wider text-[11px]">Weekdays</span>
                <input type="time" value={form.weekdayOpen} onChange={(e) => setForm((prev) => ({ ...prev, weekdayOpen: e.target.value }))} className="h-12 w-full rounded-xl border border-[#e6e8e7] bg-[#eff1f0] px-5 outline-none focus:bg-white focus:border-[#1abc60] transition-all font-bold" />
                <span className="text-left text-xs font-black text-gray-400 sm:text-center">TO</span>
                <input type="time" value={form.weekdayClose} onChange={(e) => setForm((prev) => ({ ...prev, weekdayClose: e.target.value }))} className="h-12 w-full rounded-xl border border-[#e6e8e7] bg-[#eff1f0] px-5 outline-none focus:bg-white focus:border-[#1abc60] transition-all font-bold" />
              </div>
              <div className="grid gap-3 sm:grid-cols-[120px_1fr_20px_1fr] sm:items-center">
                <span className="font-bold text-[#3a3f43] uppercase tracking-wider text-[11px]">Weekends</span>
                <input type="time" value={form.weekendOpen} onChange={(e) => setForm((prev) => ({ ...prev, weekendOpen: e.target.value }))} className="h-12 w-full rounded-xl border border-[#e6e8e7] bg-[#eff1f0] px-5 outline-none focus:bg-white focus:border-[#1abc60] transition-all font-bold" />
                <span className="text-left text-xs font-black text-gray-400 sm:text-center">TO</span>
                <input type="time" value={form.weekendClose} onChange={(e) => setForm((prev) => ({ ...prev, weekendClose: e.target.value }))} className="h-12 w-full rounded-xl border border-[#e6e8e7] bg-[#eff1f0] px-5 outline-none focus:bg-white focus:border-[#1abc60] transition-all font-bold" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="inline-block border-b-4 border-gray-100 pb-1 text-2xl font-bold leading-none text-[#353a3f] md:text-3xl">05 Photo Gallery</h2>
        <div className="space-y-3 rounded-2xl bg-white border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={onHeroSelected} />
            <button type="button" onClick={() => heroRef.current?.click()} className="col-span-2 flex h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 text-gray-400 overflow-hidden hover:border-[#1abc60] hover:bg-white transition-all group">
              {heroImage ? (
                <img src={URL.createObjectURL(heroImage)} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6 text-gray-300 group-hover:text-[#1abc60]" />
                  </div>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Upload Hero Image</span>
                  <span className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-tighter">Recommended: 1920x1080</span>
                </>
              )}
            </button>
            <div className="grid gap-3">
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onGallerySelected} />
              <button type="button" onClick={() => galleryRef.current?.click()} className="flex h-[108px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 text-gray-400 overflow-hidden hover:border-[#1abc60] hover:bg-white transition-all group">
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 w-full h-full">
                    {galleryImages.slice(0, 4).map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt="Gallery" className="w-full h-full object-cover" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-gray-300 group-hover:text-[#1abc60]" />
                    <span className="text-[10px] mt-2 font-bold uppercase tracking-widest text-gray-400">Add Gallery</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{galleryImages.length} images</span>
                {galleryImages.length > 0 && (
                  <button type="button" onClick={() => setGalleryImages([])} className="text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest underline decoration-2 underline-offset-4">Clear</button>
                )}
              </div>
            </div>
          </div>
          {(existingImages.length > 0 || galleryImages.length > 0 || heroImage) && (
            <div className="rounded-md border border-[#d7dcda] bg-white px-3 py-2 text-xs text-[#5f666d]">
              Existing: {existingImages.length} | New: {(heroImage ? 1 : 0) + galleryImages.length} / 10
            </div>
          )}
          <div className="rounded-md bg-[#eceeed] px-3 py-2 text-xs text-[#7a8288]">
            Professional photography can increase booking rates by up to 300%. Our "Kinetic Editorial" style favors wide-angle shots of empty arenas or high-intensity action shots during peak hours.
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t border-[#e1e4e2] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-[#72787e]">
          <input type="checkbox" checked={form.termsAccepted} onChange={(e) => setForm((prev) => ({ ...prev, termsAccepted: e.target.checked }))} className="h-4 w-4 accent-[#1ab35b]" />
          I agree to the <span className="font-semibold text-[#1ab35b]">Venue Partner Agreement</span>
        </label>
        <button
          disabled={saving}
          type="submit"
          className="group relative flex h-16 items-center justify-center overflow-hidden rounded-[24px] bg-[#1abc60] px-12 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-green-200 transition-all hover:bg-[#16a085] hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-3">
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                {mode === 'edit' ? 'Update Venue Profile' : 'Publish Venue Profile'}
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
