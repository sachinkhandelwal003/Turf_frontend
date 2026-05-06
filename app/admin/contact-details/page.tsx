'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, MapPin, Phone, Clock, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactDetails {
  _id?: string;
  companyName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  socialMedia: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  description: string;
  isActive: boolean;
}

const defaultContactDetails: ContactDetails = {
  companyName: 'Architecture Studio',
  address: {
    street: '123 Design Boulevard',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  phone: '+1 (234) 567-890',
  email: 'hello@architecture.com',
  socialMedia: {
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: ''
  },
  businessHours: {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  },
  description: 'Leading architecture and design firm specializing in innovative solutions.',
  isActive: true
};

export default function ContactDetailsPage() {
  const [contactDetails, setContactDetails] = useState<ContactDetails>(defaultContactDetails);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchContactDetails();
  }, []);

  const fetchContactDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/contact-details`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setContactDetails(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      setStatusMessage({ type: 'error', text: 'Failed to load existing contact details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/contact-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactDetails),
      });

      if (response.ok) {
        const data = await response.json();
        setContactDetails(data.data);
        setStatusMessage({ type: 'success', text: 'Contact details updated successfully!' });
        
        // Auto-hide success message after 4 seconds
        setTimeout(() => {
          setStatusMessage(null);
        }, 4000);
      } else {
        throw new Error('Failed to update contact details');
      }
    } catch (error) {
      console.error('Error saving contact details:', error);
      setStatusMessage({ type: 'error', text: 'Failed to save contact details. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setContactDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setContactDetails(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSocialMediaChange = (field: string, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setContactDetails(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value }
    }));
  };

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    setContactDetails(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading Settings...</p>
      </div>
    );
  }

  const InputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all";
  const LabelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      
      {/* Sticky Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Manage your public contact information and business hours.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 transition-all shadow-sm"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Status Message Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl flex items-center border ${
                statusMessage.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
              )}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8">
          
          {/* Company Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe className="h-5 w-5" /></div>
              <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={LabelClass}>Company Name</label>
                <input
                  type="text"
                  value={contactDetails.companyName}
                  onChange={(e) => handleInputChange('companyName', e)}
                  className={InputClass}
                  placeholder="e.g., Architecture Studio"
                />
              </div>
              <div>
                <label className={LabelClass}>Description / Tagline</label>
                <textarea
                  value={contactDetails.description}
                  onChange={(e) => handleInputChange('description', e)}
                  rows={3}
                  className={`${InputClass} resize-none`}
                  placeholder="Short description for the footer..."
                />
              </div>
            </div>
          </div>

          {/* Contact & Address Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Phone className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-gray-900">Contact Methods</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={LabelClass}>Phone Number</label>
                  <input
                    type="text"
                    value={contactDetails.phone}
                    onChange={(e) => handleInputChange('phone', e)}
                    className={InputClass}
                    placeholder="+1 (234) 567-890"
                  />
                </div>
                <div>
                  <label className={LabelClass}>Email Address</label>
                  <input
                    type="email"
                    value={contactDetails.email}
                    onChange={(e) => handleInputChange('email', e)}
                    className={InputClass}
                    placeholder="hello@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MapPin className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-gray-900">Headquarters</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={LabelClass}>Street Address</label>
                  <input
                    type="text"
                    value={contactDetails.address.street}
                    onChange={(e) => handleAddressChange('street', e)}
                    className={InputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LabelClass}>City</label>
                    <input type="text" value={contactDetails.address.city} onChange={(e) => handleAddressChange('city', e)} className={InputClass} />
                  </div>
                  <div>
                    <label className={LabelClass}>State / Province</label>
                    <input type="text" value={contactDetails.address.state} onChange={(e) => handleAddressChange('state', e)} className={InputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LabelClass}>ZIP Code</label>
                    <input type="text" value={contactDetails.address.zipCode} onChange={(e) => handleAddressChange('zipCode', e)} className={InputClass} />
                  </div>
                  <div>
                    <label className={LabelClass}>Country</label>
                    <input type="text" value={contactDetails.address.country} onChange={(e) => handleAddressChange('country', e)} className={InputClass} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Social Media Links</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={LabelClass}>LinkedIn</label>
                <input type="url" value={contactDetails.socialMedia.linkedin} onChange={(e) => handleSocialMediaChange('linkedin', e)} className={InputClass} placeholder="https://linkedin.com/..." />
              </div>
              <div>
                <label className={LabelClass}>Twitter / X</label>
                <input type="url" value={contactDetails.socialMedia.twitter} onChange={(e) => handleSocialMediaChange('twitter', e)} className={InputClass} placeholder="https://twitter.com/..." />
              </div>
              <div>
                <label className={LabelClass}>Instagram</label>
                <input type="url" value={contactDetails.socialMedia.instagram} onChange={(e) => handleSocialMediaChange('instagram', e)} className={InputClass} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className={LabelClass}>Facebook</label>
                <input type="url" value={contactDetails.socialMedia.facebook} onChange={(e) => handleSocialMediaChange('facebook', e)} className={InputClass} placeholder="https://facebook.com/..." />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm mb-12">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Clock className="h-5 w-5" /></div>
              <h2 className="text-lg font-bold text-gray-900">Business Hours</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(contactDetails.businessHours).map(([day, hours]) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-32 capitalize font-semibold text-gray-700">{day}</div>
                  
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <label className="relative inline-flex items-center cursor-pointer mr-4">
                      <input
                        type="checkbox"
                        checked={!hours.closed} // Toggle visually represents "Open"
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-sm font-medium text-gray-600">{hours.closed ? 'Closed' : 'Open'}</span>
                    </label>

                    {!hours.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-gray-400 font-medium">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}