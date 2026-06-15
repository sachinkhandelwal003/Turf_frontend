'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { 
  Camera, ChevronDown, Circle, ImagePlus, Loader2, MapPin, Upload, CheckCircle2,
  Building, FileText, IndianRupee, Clock, Landmark, Mail, Hash, Calendar, Info,
  PlusCircle, Trash2, Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/app/services/api';
import Swal from 'sweetalert2';

type VenueFormMode = 'add' | 'edit';

interface VenueFormProps {
  mode: VenueFormMode;
  turfId?: string;
  onSuccess?: (createdTurf: any) => void;
  onCancel?: () => void;
}

interface PriceHike {
  startTime: string;
  endTime: string;
  extraPrice: number;
}

interface SportConfig {
  sportName: string;
  pricePerHour: string;
  slotDuration: number;
  slotPricings: { startTime: string; endTime: string; price: number; isPeak: boolean }[];
  courts: { name: string; isActive: boolean }[];
  images: string[]; // URLs of images
  newImages?: File[]; // For new uploads
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
  upiId: string;
  peakHourSurcharge: string;
  slotPricings: { startTime: string; endTime: string; price: number; isPeak: boolean }[];
  priceHikes: PriceHike[];
  weekdayOpen: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
  termsAccepted: boolean;
  sportConfigs: SportConfig[];
  interestToHost: boolean;
  coordinates?: { lat: number; lng: number };
}

interface ApiCarryForwardShape {
  rates: any[];
  availableSlots: any[];
  courts: any[];
}

const defaultForm: FormShape = {
  name: '',
  description: '',
  sports: [],
  surfaceType: '',
  amenities: [],
  address: '',
  city: '',
  landmark: '',
  postcode: '',
  mapUrl: '',
  pricePerHour: '',
  upiId: '',
  peakHourSurcharge: '',
  slotPricings: [],
  priceHikes: [],
  weekdayOpen: '06:00',
  weekdayClose: '23:00',
  weekendOpen: '08:00',
  weekendClose: '22:00',
  termsAccepted: false,
  sportConfigs: [],
  interestToHost: false,
  coordinates: undefined,
};

const fallbackSports = ['Football', 'Cricket', 'Tennis', 'Basketball'];
const fallbackSurfaceOptions = ['Artificial Turf (A-Grade)', 'Hybrid Grass', 'Hard Court'];
const fallbackAmenities = ['Floodlights', 'Changing Rooms', 'Shower', 'Parking', 'Water Station', 'Medical Kit'];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type OperatingHour = { day: string; open: string; close: string; isOpen: boolean };

export default function VenueForm({ mode, turfId, onSuccess, onCancel }: VenueFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormShape>(defaultForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [activeSportTab, setActiveSportSportTab] = useState<string | null>(null);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (form.sports.length > 0) {
      if (!activeSportTab || !form.sports.includes(activeSportTab)) {
        setActiveSportSportTab(form.sports[0]);
      }
    } else {
      setActiveSportSportTab(null);
    }
  }, [form.sports, activeSportTab]);
  const [sportsOptions, setSportsOptions] = useState<string[]>(fallbackSports);
  const [surfaceOptions, setSurfaceOptions] = useState<string[]>(fallbackSurfaceOptions);
  const [amenitiesOptions, setAmenitiesOptions] = useState<string[]>(fallbackAmenities);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [apiCarryForward, setApiCarryForward] = useState<ApiCarryForwardShape>({
    rates: days.map(day => ({ day, price: 0, isPeak: false })),
    availableSlots: [],
    courts: [{ name: 'Court 1', courtType: 'Synthetic' }],
  });
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>(
    days.map((day) => ({ day, open: '06:00', close: '23:00', isOpen: true }))
  );
  const [slotDuration, setSlotDuration] = useState<number>(60);
  const [courtsCount, setCourtsCount] = useState<number>(1);
  const [slotPreviewDay, setSlotPreviewDay] = useState<string>('Monday');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const logoRef = useRef<HTMLInputElement | null>(null);
  const heroRef = useRef<HTMLInputElement | null>(null);
  const galleryRef = useRef<HTMLInputElement | null>(null);

  const formatMinutes = (mins: number) => String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
  const parseTimeToMinutes = (time: string) => {
    const [h, m] = (time || '00:00').split(':').map((v) => Number(v));
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };
  const buildTimeSlots = (open: string, close: string, duration: number) => {
    const start = parseTimeToMinutes(open);
    const end = parseTimeToMinutes(close);
    const d = Math.max(15, Number(duration) || 60);
    const slots: { startTime: string; endTime: string }[] = [];
    let cur = start;
    while (cur + d <= end) {
      slots.push({ startTime: formatMinutes(cur), endTime: formatMinutes(cur + d) });
      cur += d;
    }
    return slots;
  };

  const to12h = (time24: string) => {
    const [hh, mm] = (time24 || '00:00').split(':').map((v) => Number(v));
    const h = (hh % 12) || 12;
    const ampm = hh < 12 ? 'AM' : 'PM';
    return `${h}:${String(mm || 0).padStart(2, '0')} ${ampm}`;
  };

  const TIME_OPTIONS = (() => {
    const opts: { value: string; label: string }[] = [];
    for (let mins = 0; mins < 24 * 60; mins += 30) {
      const value = formatMinutes(mins);
      opts.push({ value, label: to12h(value) });
    }
    return opts;
  })();

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
          setForm((prev) => {
            const defaultSport = sports[0];
            const hasSports = prev.sports.length > 0;
            const newSports = hasSports ? prev.sports : [defaultSport];
            
            // If we're setting a default sport, make sure it has a config
            let newConfigs = [...prev.sportConfigs];
            if (!hasSports && newConfigs.length === 0) {
              newConfigs = [{
                sportName: defaultSport,
                pricePerHour: prev.pricePerHour || '0',
                slotDuration: 60,
                slotPricings: [],
                courts: [{ name: 'Court 1', isActive: true }],
                images: [],
                newImages: []
              }];
            }
            
            return { 
              ...prev, 
              sports: newSports,
              sportConfigs: newConfigs
            };
          });
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

        const finalSports = target.sports?.length ? target.sports : ['Cricket'];
        const existingConfigs = Array.isArray(target.sportConfigs) ? target.sportConfigs : [];
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

        // Backfill missing configs and format existing ones
        const sportConfigs = finalSports.map((sportName: string) => {
          const trimmedSportName = sportName.trim();
          const existing = existingConfigs.find((sc: any) => sc.sportName.trim() === trimmedSportName);
          if (existing) {
            return {
              ...existing,
              sportName: trimmedSportName, // Normalize name
              pricePerHour: String(existing.pricePerHour || ''),
              slotDuration: Number(existing.slotDuration || 60),
              images: (existing.images || []).map((img: string) => img.startsWith('http') ? img : `${baseUrl}${img}`),
              newImages: []
            };
          }
          // Default config for missing sport
          return {
            sportName: trimmedSportName,
            pricePerHour: String(target.pricePerHour || '0'),
            slotDuration: 60,
            slotPricings: [],
            courts: [{ name: 'Court 1', isActive: true }],
            images: [],
            newImages: []
          };
        });

        setForm({
          name: target.name || '',
          description: target.description || '',
          sports: finalSports,
          surfaceType: target.surfaceType || 'Hybrid Grass',
          amenities: target.amenities?.length ? target.amenities : [],
          address: target.location?.address || '',
          city: target.location?.city || '',
          landmark: target.location?.landmark || '',
          postcode: target.location?.postcode || '',
          mapUrl: target.location?.mapUrl || '',
          pricePerHour: String(target.pricePerHour || ''),
          upiId: target.upiId || '',
          peakHourSurcharge: String(target.peakHourSurcharge || ''),
          slotPricings: Array.isArray(target.slotPricings)
            ? target.slotPricings
            : [],
          priceHikes: Array.isArray(target.priceHikes)
            ? target.priceHikes
            : [],
          weekdayOpen: weekdayHours?.open || '06:00',
          weekdayClose: weekdayHours?.close || '23:00',
          weekendOpen: weekendHours?.open || '08:00',
          weekendClose: weekendHours?.close || '22:00',
          termsAccepted: true,
          sportConfigs: sportConfigs,
          interestToHost: !!target.interestToHost,
          coordinates: target.location?.coordinates,
        });
        if (Array.isArray(target.operatingHours) && target.operatingHours.length) {
          setOperatingHours(
            days.map((day) => {
              const found = target.operatingHours.find((h: any) => h.day === day);
              return {
                day,
                open: found?.open || (day === 'Saturday' || day === 'Sunday' ? '08:00' : '06:00'),
                close: found?.close || (day === 'Saturday' || day === 'Sunday' ? '22:00' : '23:00'),
                isOpen: found?.isOpen !== false,
              };
            })
          );
        }
        if (typeof target.slotDuration === 'number') {
          setSlotDuration(target.slotDuration || 60);
        }
        if (Array.isArray(target.courts)) {
          setCourtsCount(Math.max(1, target.courts.length || 1));
        }
        setRating(target.rating || 0);
        setReviewsCount(target.reviewsCount || 0);
        setExistingImages(Array.isArray(target.images) ? target.images.map((img: string) => img.startsWith('http') ? img : `${baseUrl}${img}`) : []);
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
        });
      } catch (error) {
        toast.error('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
  }, [mode, turfId]);

  useEffect(() => {
    setApiCarryForward(prev => {
      const currentCourts = [...prev.courts];
      if (currentCourts.length === courtsCount) return prev;
      
      let nextCourts = [];
      if (currentCourts.length < courtsCount) {
        nextCourts = [
          ...currentCourts,
          ...Array.from({ length: courtsCount - currentCourts.length }).map((_, idx) => ({
            name: `Court ${currentCourts.length + idx + 1}`,
            courtType: form.surfaceType || surfaceOptions[0] || 'Synthetic'
          }))
        ];
      } else {
        nextCourts = currentCourts.slice(0, courtsCount);
      }
      return { ...prev, courts: nextCourts };
    });
  }, [courtsCount, form.surfaceType]);

  const toggleListValue = (field: 'sports' | 'amenities', value: string) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      const next = exists ? prev[field].filter((item) => item !== value) : [...prev[field], value];
      
      let nextSportConfigs = [...prev.sportConfigs];
      if (field === 'sports') {
        const trimmedValue = value.trim();
        if (exists) {
          nextSportConfigs = nextSportConfigs.filter(c => c.sportName.trim() !== trimmedValue);
        } else {
          nextSportConfigs.push({
            sportName: trimmedValue,
            pricePerHour: prev.pricePerHour || '0',
            slotDuration: 60,
            slotPricings: [],
            courts: [{ name: 'Court 1', isActive: true }],
            images: [],
            newImages: []
          });
        }
      }

      return { ...prev, [field]: next, sportConfigs: nextSportConfigs };
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
            coordinates: { lat, lng: lon }
          }));
          toast.success('Current location applied.');
        } catch (error) {
          console.error('Reverse Geocoding Error:', error);
          setForm((prev) => ({
            ...prev,
            address: `Lat ${lat.toFixed(5)}, Lng ${lon.toFixed(5)}`,
            mapUrl,
            coordinates: { lat, lng: lon }
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

  const effectiveOperatingHours = () => {
    // Keep old weekday/weekend fields as fallback, but prefer per-day state.
    if (operatingHours?.length === 7) {
      return operatingHours;
    }
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

  const updateDayRate = (day: string, patch: Partial<{ price: number; isPeak: boolean }>) => {
    setApiCarryForward((prev) => ({
      ...prev,
      rates: (prev.rates?.length ? prev.rates : days.map((d) => ({ day: d, price: 0, isPeak: false }))).map((r: any) =>
        r.day === day ? { ...r, ...patch } : r
      ),
    }));
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
      const resolvedSurfaceType = form.surfaceType || surfaceOptions[0] || 'Synthetic';
      
      // Ensure we have a base price, fallback to first sport config if needed
      let finalBasePrice = Number(form.pricePerHour || 0);
      if (finalBasePrice === 0 && form.sportConfigs.length > 0) {
        // Try to find the minimum price among all sports to use as base display price
        const prices = form.sportConfigs.map(c => Number(c.pricePerHour || 0)).filter(p => p > 0);
        if (prices.length > 0) {
          finalBasePrice = Math.min(...prices);
        } else {
          finalBasePrice = Number(form.sportConfigs[0].pricePerHour || 0);
        }
      }

      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('interestToHost', String(form.interestToHost));
      if (form.description) payload.append('description', form.description);
      if (form.sports && form.sports.length > 0) payload.append('sports', JSON.stringify(form.sports));
      if (form.amenities && form.amenities.length > 0) payload.append('amenities', JSON.stringify(form.amenities));
      
      payload.append('pricePerHour', String(finalBasePrice));
      
      if (form.upiId) payload.append('upiId', form.upiId);
      if (form.peakHourSurcharge && Number(form.peakHourSurcharge) > 0) {
        payload.append('peakHourSurcharge', String(Number(form.peakHourSurcharge)));
      }
      if (resolvedSurfaceType) payload.append('surfaceType', resolvedSurfaceType);
      
      const locationData: any = {
        address: form.address,
        city: form.city,
      };
      if (form.landmark) locationData.landmark = form.landmark;
      if (form.postcode) locationData.postcode = form.postcode;
      if (form.mapUrl) locationData.mapUrl = form.mapUrl;
      if (form.coordinates) locationData.coordinates = form.coordinates;
      
      payload.append('location', JSON.stringify(locationData));
      
      // Only send slotDuration if it's not the default 60
      if (slotDuration !== 60) {
        payload.append('slotDuration', String(slotDuration));
      }
      
      const opHours = effectiveOperatingHours();
      // Only send operatingHours if they are not the default 6-23 for all days
      const isDefaultOpHours = opHours.every(h => h.open === '06:00' && h.close === '23:00' && h.isOpen);
      if (!isDefaultOpHours && opHours.length > 0) {
        payload.append('operatingHours', JSON.stringify(opHours));
      }
      
      if (apiCarryForward.availableSlots && apiCarryForward.availableSlots.length > 0) {
        payload.append('availableSlots', JSON.stringify(apiCarryForward.availableSlots));
      }
      
      // Ensure rates are always in sync with base price and surcharge
      const finalRates = days.map((day) => {
        const rate = apiCarryForward.rates.find(r => r.day === day) || { day, price: 0, isPeak: false };
        const basePrice = Number(form.pricePerHour || 0);
        const surcharge = Number(form.peakHourSurcharge || 0);
        
        // Final price is base + surcharge (if peak), otherwise just base.
        const finalPrice = rate.isPeak ? basePrice + surcharge : basePrice;
        
        return { ...rate, price: finalPrice };
      });

      payload.append('rates', JSON.stringify(finalRates));
      
      if (form.priceHikes && form.priceHikes.length > 0) {
        payload.append('priceHikes', JSON.stringify(form.priceHikes));
      }
      
      // Handle sportConfigs and their images
      if (form.sportConfigs && form.sportConfigs.length > 0) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        const sportConfigsToSubmit = form.sportConfigs.map((config) => {
          const { newImages, ...rest } = config;
          const sportName = String(config.sportName || "").trim();
          // Strip baseUrl from existing images to send only relative paths to backend
          const strippedImages = (rest.images || []).map(img => {
            if (img.startsWith('http')) {
              return img.replace(baseUrl, '');
            }
            return img;
          });
          // Filter out default values within sport configs too
          return {
                    ...rest,
                    images: strippedImages,
                    sportName, // Normalize name
                    slotPricings: (rest.slotPricings || []).filter(sp => sp.price > 0),
                    courts: rest.courts || [] // Keep all courts
                  };
        });
        payload.append('sportConfigs', JSON.stringify(sportConfigsToSubmit));

        // Append sport-specific files
        form.sportConfigs.forEach((config) => {
          const sportName = String(config.sportName || "").trim();
          if (config.newImages && config.newImages.length > 0) {
            config.newImages.forEach(file => {
              payload.append(`sportImages_${sportName}`, file);
            });
          }
        });
      }

      // Only send global courts if they differ from the single default "Court 1"
      const hasMeaningfulGlobalCourts = apiCarryForward.courts?.length > 1 || 
        (apiCarryForward.courts?.length === 1 && apiCarryForward.courts[0].name !== 'Court 1');
      
      if (hasMeaningfulGlobalCourts) {
        payload.append('courts', JSON.stringify(apiCarryForward.courts));
      }
      
      if (existingImages && existingImages.length > 0) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
        const strippedExistingImages = existingImages.map(img => {
          if (img.startsWith('http')) {
            return img.replace(baseUrl, '');
          }
          return img;
        });
        payload.append('existingImages', JSON.stringify(strippedExistingImages));
      }
      
      if (mode === 'edit') {
        payload.append('rating', String(rating));
        payload.append('reviewsCount', String(reviewsCount));
      }

      if (logoFile) {
        payload.append('logo', logoFile);
      }
      if (heroImage) {
        payload.append('images', heroImage);
      }
      galleryImages.forEach((file) => payload.append('images', file));

      let res;
      if (mode === 'edit' && turfId) {
        res = await api.put(`/turfs/${turfId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/turfs', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await Swal.fire({
        title: mode === 'edit' ? 'Venue Updated' : 'Venue Submitted',
        text: mode === 'edit' ? 'Your venue details were updated successfully.' : 'Your venue was submitted for review successfully.',
        icon: 'success',
        confirmButtonColor: '#1abc60',
      });
      toast.success(mode === 'edit' ? 'Venue updated successfully.' : 'Venue submitted for review.');
      if (onSuccess) {
        onSuccess(res.data?.turf || { _id: turfId });
      } else {
        router.push('/admin/venues/list');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.msg || error?.response?.data?.error || 'Failed to save venue.';
      await Swal.fire({
        title: 'Save Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      toast.error(errorMessage);
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

          <div className="mt-6 p-4 rounded-lg bg-green-50/50 border border-green-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="interestToHost" className="text-sm font-semibold text-gray-950 cursor-pointer">
                Interest to Host Matches
              </label>
              <p className="text-xs text-gray-500">
                Allow players and match organizers to create public or private hosted matches at this venue.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="interestToHost"
                checked={form.interestToHost}
                onChange={(e) => setForm((prev) => ({ ...prev, interestToHost: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1abc60]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1abc60]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Location Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">2</span>
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

      {/* Section 3: Amenities & Surface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">3</span>
          <h2 className="text-base font-semibold text-gray-900">Amenities & Surface</h2>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Surface Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Surface Type</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {surfaceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, surfaceType: option }))}
                  className={`!flex !items-center !justify-between !rounded-lg !border !px-4 !py-2.5 !text-sm !font-medium !transition-colors !cursor-pointer ${
                    form.surfaceType === option
                      ? '!border-[#1abc60] !bg-green-50 !text-[#1abc60]'
                      : '!border-gray-200 !bg-white !text-gray-600 hover:!border-gray-300 hover:!bg-gray-50'
                  }`}
                >
                  {option}
                  {form.surfaceType === option && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Amenities (Common for all sports)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add custom amenity..."
                  className="!px-3 !py-1.5 !bg-white !border !border-gray-300 !rounded-lg !text-xs focus:!border-[#1abc60] !outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newAmenity.trim()) {
                        if (!amenitiesOptions.includes(newAmenity.trim())) {
                          setAmenitiesOptions(prev => [...prev, newAmenity.trim()]);
                        }
                        if (!form.amenities.includes(newAmenity.trim())) {
                          toggleListValue('amenities', newAmenity.trim());
                        }
                        setNewAmenity('');
                      }
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (newAmenity.trim()) {
                      if (!amenitiesOptions.includes(newAmenity.trim())) {
                        setAmenitiesOptions(prev => [...prev, newAmenity.trim()]);
                      }
                      if (!form.amenities.includes(newAmenity.trim())) {
                        toggleListValue('amenities', newAmenity.trim());
                      }
                      setNewAmenity('');
                    }
                  }}
                  className="!bg-[#1abc60] !text-white !px-3 !py-1.5 !rounded-lg !text-xs !font-bold hover:!bg-[#17a554] !transition-colors !border-none !cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {amenitiesOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleListValue('amenities', amenity)}
                  className={`!flex !items-center !justify-between !rounded-lg !border !px-4 !py-2.5 !text-sm !font-medium !transition-colors !cursor-pointer ${
                    form.amenities.includes(amenity)
                      ? '!border-[#1abc60] !bg-green-50 !text-[#1abc60]'
                      : '!border-gray-200 !bg-white !text-gray-600 hover:!border-gray-300 hover:!bg-gray-50'
                  }`}
                >
                  {amenity}
                  {form.amenities.includes(amenity) && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Sports & Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">4</span>
          <h2 className="text-base font-semibold text-gray-900">Sports & Pricing</h2>
        </div>
        
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#1abc60]" />
                Base Price Per Hour (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.pricePerHour}
                onChange={(e) => setForm(prev => ({ ...prev, pricePerHour: e.target.value }))}
                placeholder="e.g. 1000"
                className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !font-bold focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60]"
                required
              />
              <p className="text-[10px] text-gray-500 italic">This will be the default price for all sports and days unless overridden.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-[#1abc60]" />
                Peak Hour Surcharge (₹)
              </label>
              <input
                type="number"
                value={form.peakHourSurcharge}
                onChange={(e) => setForm(prev => ({ ...prev, peakHourSurcharge: e.target.value }))}
                placeholder="e.g. 200"
                className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm !font-bold focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60]"
              />
              <p className="text-[10px] text-gray-500 italic">Extra amount added during peak hours or peak days.</p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700">Select Sports</label>
            <div className="!flex !items-center !gap-3 !overflow-x-auto !pb-4 !scrollbar-hide">
              {sportsOptions.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleListValue('sports', sport)}
                  className={`!flex !items-center !justify-between !rounded-lg !border !px-4 !py-2.5 !text-sm !font-medium !transition-colors !cursor-pointer !min-w-[140px] !flex-shrink-0 ${
                    form.sports.includes(sport)
                      ? '!border-[#1abc60] !bg-green-50 !text-[#1abc60]'
                      : '!border-gray-200 !bg-white !text-gray-600 hover:!border-gray-300 hover:!bg-gray-50'
                  }`}
                >
                  <span className="!whitespace-nowrap">{sport}</span>
                  {form.sports.includes(sport) && <CheckCircle2 className="h-4 w-4 !flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[#1abc60]" />
              Daily Pricing & Peak Days
            </h3>
            <p className="text-xs text-gray-500 mb-4">Select which days are considered "Peak Days" to apply the surcharge automatically.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {days.map((day) => {
                const rate = apiCarryForward.rates.find(r => r.day === day) || { day, price: 0, isPeak: false };
                const basePrice = Number(form.pricePerHour || 0);
                const surcharge = Number(form.peakHourSurcharge || 0);
                const displayPrice = rate.isPeak ? basePrice + surcharge : basePrice;

                return (
                  <div key={day} className={`p-3 rounded-xl border transition-all ${rate.isPeak ? 'bg-green-50 border-[#1abc60]' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700">{day}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={rate.isPeak}
                          onChange={(e) => updateDayRate(day, { isPeak: e.target.checked })}
                        />
                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1abc60]"></div>
                      </label>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Rate:</span>
                      <span className={`text-sm font-black ${rate.isPeak ? 'text-[#1abc60]' : 'text-gray-900'}`}>
                        ₹{displayPrice}
                      </span>
                    </div>
                    {rate.isPeak && <span className="text-[9px] font-bold text-[#1abc60] uppercase mt-1 block">(Includes Surcharge)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {form.sports.length > 0 ? (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {form.sports.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setActiveSportSportTab(sport)}
                    className={`!px-4 !py-2 !rounded-lg !text-xs !font-bold !whitespace-nowrap !transition-all ${
                      activeSportTab === sport
                        ? '!bg-[#1abc60] !text-white !shadow-md !shadow-green-100'
                        : '!bg-gray-100 !text-gray-500 hover:!bg-gray-200'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                {form.sportConfigs
                  .filter(c => c.sportName === activeSportTab)
                  .map((config, sIdx) => {
                    // Find actual index in form.sportConfigs
                    const actualIdx = form.sportConfigs.findIndex(c => c.sportName === config.sportName);
                    return (
                    <div key={config.sportName} className="rounded-xl border border-gray-200 bg-gray-50/30 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-[#1abc60]" />
                          <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{config.sportName} Settings</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price Per Hour (₹)</label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                value={config.pricePerHour}
                                onChange={(e) => {
                                  const next = [...form.sportConfigs];
                                  next[actualIdx].pricePerHour = e.target.value;
                                  setForm(prev => ({ ...prev, sportConfigs: next }));
                                }}
                                className="!w-full !pl-9 !pr-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !font-bold focus:!border-[#1abc60] focus:!ring-2 focus:!ring-[#1abc60]/20"
                                placeholder="e.g. 1500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Slot Duration (Minutes)</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <select
                                value={config.slotDuration}
                                onChange={(e) => {
                                  const next = [...form.sportConfigs];
                                  next[actualIdx].slotDuration = Number(e.target.value);
                                  setForm(prev => ({ ...prev, sportConfigs: next }));
                                }}
                                className="!w-full !pl-9 !pr-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !font-bold focus:!border-[#1abc60] focus:!ring-2 focus:!ring-[#1abc60]/20"
                              >
                                {[30, 45, 60, 90, 120].map(m => (
                                  <option key={m} value={m}>{m} Minutes</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Courts / Pitches</label>
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => {
                                  const nextConfigs = [...prev.sportConfigs];
                                  const idx = nextConfigs.findIndex(c => c.sportName === config.sportName);
                                  if (idx !== -1) {
                                    const nextCourts = [...nextConfigs[idx].courts, { name: `Court ${nextConfigs[idx].courts.length + 1}`, isActive: true }];
                                    nextConfigs[idx] = { ...nextConfigs[idx], courts: nextCourts };
                                  }
                                  return { ...prev, sportConfigs: nextConfigs };
                                });
                              }}
                              className="text-[10px] font-bold text-[#1abc60] hover:underline cursor-pointer"
                            >
                              + Add Court
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {config.courts.map((court, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2">
                                <input
                                  value={court.name}
                                  onChange={(e) => {
                                    const next = [...form.sportConfigs];
                                    next[actualIdx].courts[cIdx].name = e.target.value;
                                    setForm(prev => ({ ...prev, sportConfigs: next }));
                                  }}
                                  className="flex-1 !border-none !bg-transparent !p-0 !text-xs !font-medium focus:!ring-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...form.sportConfigs];
                                    next[actualIdx].courts = next[actualIdx].courts.filter((_, i) => i !== cIdx);
                                    setForm(prev => ({ ...prev, sportConfigs: next }));
                                  }}
                                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{config.sportName} Photos</label>
                          <div className="flex flex-wrap gap-4">
                            {config.images.map((img, iIdx) => (
                              <div key={iIdx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                                <img src={img} alt="Sport" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => {
                                      const nextConfigs = [...prev.sportConfigs];
                                      const idx = nextConfigs.findIndex(c => c.sportName === config.sportName);
                                      if (idx !== -1) {
                                        nextConfigs[idx] = {
                                          ...nextConfigs[idx],
                                          images: nextConfigs[idx].images.filter((_, i) => i !== iIdx)
                                        };
                                      }
                                      return { ...prev, sportConfigs: nextConfigs };
                                    });
                                  }}
                                  className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {(config.newImages || []).map((file, iIdx) => (
                              <div key={iIdx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => {
                                      const nextConfigs = [...prev.sportConfigs];
                                      const idx = nextConfigs.findIndex(c => c.sportName === config.sportName);
                                      if (idx !== -1) {
                                        nextConfigs[idx] = {
                                          ...nextConfigs[idx],
                                          newImages: nextConfigs[idx].newImages?.filter((_, i) => i !== iIdx)
                                        };
                                      }
                                      return { ...prev, sportConfigs: nextConfigs };
                                    });
                                  }}
                                  className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const files = Array.from((e.target as HTMLInputElement).files || []);
                                  if (files.length) {
                                    setForm(prev => {
                                      const nextConfigs = [...prev.sportConfigs];
                                      const idx = nextConfigs.findIndex(c => c.sportName === config.sportName);
                                      if (idx !== -1) {
                                        nextConfigs[idx] = {
                                          ...nextConfigs[idx],
                                          newImages: [...(nextConfigs[idx].newImages || []), ...files]
                                        };
                                      }
                                      return { ...prev, sportConfigs: nextConfigs };
                                    });
                                  }
                                };
                                input.click();
                              }}
                              className="h-20 w-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-[#1abc60] hover:text-[#1abc60] transition-colors cursor-pointer"
                            >
                              <ImagePlus className="h-5 w-5" />
                              <span className="text-[10px] font-bold">Add</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Peak Hour Rates</label>
                            <button
                              type="button"
                              onClick={() => {
                              setForm(prev => {
                                const nextConfigs = [...prev.sportConfigs];
                                const idx = nextConfigs.findIndex(c => c.sportName === config.sportName);
                                if (idx !== -1) {
                                  const nextSlots = [...nextConfigs[idx].slotPricings, { startTime: '18:00', endTime: '22:00', price: Number(config.pricePerHour) + 200, isPeak: true }];
                                  nextConfigs[idx] = { ...nextConfigs[idx], slotPricings: nextSlots };
                                }
                                return { ...prev, sportConfigs: nextConfigs };
                              });
                            }}
                              className="text-[10px] font-bold text-[#1abc60] hover:underline cursor-pointer"
                            >
                              + Add Peak Slot
                            </button>
                          </div>
                          <div className="space-y-2">
                            {config.slotPricings.map((slot, pIdx) => (
                              <div key={pIdx} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                                <select
                                  value={slot.startTime}
                                  onChange={(e) => {
                                    const next = [...form.sportConfigs];
                                    next[actualIdx].slotPricings[pIdx].startTime = e.target.value;
                                    setForm(prev => ({ ...prev, sportConfigs: next }));
                                  }}
                                  className="!text-xs !rounded !border-gray-200 !py-1"
                                >
                                  {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <span className="text-gray-400 text-xs">to</span>
                                <select
                                  value={slot.endTime}
                                  onChange={(e) => {
                                    const next = [...form.sportConfigs];
                                    next[actualIdx].slotPricings[pIdx].endTime = e.target.value;
                                    setForm(prev => ({ ...prev, sportConfigs: next }));
                                  }}
                                  className="!text-xs !rounded !border-gray-200 !py-1"
                                >
                                  {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <div className="relative flex-1 min-w-[100px]">
                                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                  <input
                                    type="number"
                                    value={slot.price}
                                    onChange={(e) => {
                                      const next = [...form.sportConfigs];
                                      next[actualIdx].slotPricings[pIdx].price = Number(e.target.value);
                                      setForm(prev => ({ ...prev, sportConfigs: next }));
                                    }}
                                    className="!w-full !pl-6 !pr-2 !py-1 !text-xs !font-bold !text-[#1abc60] !border-gray-200 !rounded focus:!ring-1 focus:!ring-[#1abc60]"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...form.sportConfigs];
                                    next[actualIdx].slotPricings = next[actualIdx].slotPricings.filter((_, i) => i !== pIdx);
                                    setForm(prev => ({ ...prev, sportConfigs: next }));
                                  }}
                                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-8 py-10 border-t border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <Trophy className="h-10 w-10 mb-2 opacity-10" />
              <p className="text-sm italic">Select sports above to configure specific pricing and courts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Operating Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">5</span>
          <h2 className="text-base font-semibold text-gray-900">Operating Settings</h2>
        </div>
        
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Math.max(15, Number(e.target.value) || 60))}
                className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60]"
              >
                {[30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>{m} minutes</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">UPI ID for Payments</label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  value={form.upiId} 
                  onChange={(e) => setForm((prev) => ({ ...prev, upiId: e.target.value }))} 
                  placeholder="e.g. owner@okaxis" 
                  className="!w-full !pl-9 !pr-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !text-sm focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60]" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Operating Hours</h3>
            <div className="space-y-2">
              {operatingHours.map((oh, idx) => (
                <div key={oh.day} className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3 ${oh.isOpen ? 'bg-white' : 'bg-gray-50 border-dashed opacity-60'}`}>
                  <div className="w-28 text-sm font-bold text-gray-700">{oh.day}</div>
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={oh.open}
                      disabled={!oh.isOpen}
                      onChange={(e) => setOperatingHours(prev => prev.map((d, i) => i === idx ? { ...d, open: e.target.value } : d))}
                      className="!flex-1 !px-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm disabled:!bg-gray-100"
                    >
                      {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <span className="text-gray-400 text-xs">to</span>
                    <select
                      value={oh.close}
                      disabled={!oh.isOpen}
                      onChange={(e) => setOperatingHours(prev => prev.map((d, i) => i === idx ? { ...d, close: e.target.value } : d))}
                      className="!flex-1 !px-3 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm disabled:!bg-gray-100"
                    >
                      {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oh.isOpen}
                      onChange={(e) => setOperatingHours(prev => prev.map((d, i) => i === idx ? { ...d, isOpen: e.target.checked } : d))}
                      className="!h-4 !w-4 !rounded !border-gray-300 !text-[#1abc60]"
                    />
                    Open
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Photo Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1abc60] text-xs font-bold text-white shadow-sm">6</span>
          <h2 className="text-base font-semibold text-gray-900">General Gallery</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cover Photo</label>
              <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={onHeroSelected} />
              <button 
                type="button" 
                onClick={() => heroRef.current?.click()} 
                className="!flex !h-56 !w-full !flex-col !items-center !justify-center !rounded-lg !border-2 !border-dashed !border-gray-300 !bg-gray-50 hover:!border-[#1abc60] hover:!bg-green-50 !transition-all !overflow-hidden !relative !cursor-pointer group"
              >
                {heroImage ? (
                  <img src={URL.createObjectURL(heroImage)} alt="Hero" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <Camera className="mb-2 h-8 w-8 text-gray-400 group-hover:text-[#1abc60]" />
                    <span className="text-sm font-medium text-gray-500 group-hover:text-[#1abc60]">Upload Cover Photo</span>
                  </>
                )}
              </button>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Gallery</label>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onGallerySelected} />
              <button 
                type="button" 
                onClick={() => galleryRef.current?.click()} 
                className="!flex !h-56 !w-full !flex-col !items-center !justify-center !rounded-lg !border-2 !border-dashed !border-gray-300 !bg-gray-50 hover:!border-[#1abc60] hover:!bg-green-50 !transition-all !cursor-pointer group"
              >
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                    {galleryImages.slice(0, 4).map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt="Gallery" className="h-full w-full object-cover rounded-sm" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-8 w-8 text-gray-400 group-hover:text-[#1abc60]" />
                    <span className="text-sm font-medium text-gray-500 group-hover:text-[#1abc60]">Add Photos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-40">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 font-medium">
          <input 
            type="checkbox" 
            checked={form.termsAccepted} 
            onChange={(e) => setForm((prev) => ({ ...prev, termsAccepted: e.target.checked }))} 
            className="!h-4 !w-4 !rounded !border-gray-300 !text-[#1abc60] cursor-pointer" 
          />
          I agree to the <a href="/partner-terms" target="_blank" rel="noopener noreferrer" className="text-[#1abc60] hover:underline">Partner Terms</a>
        </label>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="!inline-flex !w-full sm:!w-auto !items-center !justify-center !rounded-lg !border !border-gray-300 !bg-white !px-6 !py-3 !text-sm !font-bold !text-gray-700 hover:!bg-gray-50 !transition-all !cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            disabled={saving || !form.termsAccepted}
            type="submit"
            className="!flex !w-full sm:!w-auto !items-center !justify-center !gap-2 !rounded-lg !bg-[#1abc60] !px-10 !py-3 !text-sm !font-bold !text-white hover:!bg-[#17a554] disabled:!opacity-50 !transition-all !border-none !cursor-pointer shadow-lg shadow-green-100"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {mode === 'edit' ? 'Save Changes' : 'Create Venue'}
          </button>
        </div>
      </div>
    </form>
  );
}