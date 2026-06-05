"use client";

import { useState } from 'react';
import { X, ArrowRight, Eye, EyeOff, ChevronDown, Loader2, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';
import { toast } from 'sonner';

interface GroundOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroundOwnerModal({ isOpen, onClose }: GroundOwnerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    groundName: "",
    turfName: "",
    location: "",
    ownerName: "",
    contactNumber: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedPhotos((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic required field check
    if (!formData.groundName || !formData.turfName || !formData.location || !formData.ownerName || !formData.contactNumber || !formData.email) {
      return toast.error("Please fill in all required fields.");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return toast.error("Please enter a valid email address.");
    }

    // Phone validation (10 digits Indian)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      return toast.error("Please enter a valid 10-digit Indian phone number.");
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("groundName", formData.groundName);
      data.append("turfName", formData.turfName);
      data.append("location", formData.location);
      data.append("ownerName", formData.ownerName);
      data.append("contactNumber", formData.contactNumber);
      data.append("email", formData.email);
      
      selectedPhotos.forEach((photo) => {
        data.append("photos", photo);
      });

      await api.post('/venue-leads', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Enquiry submitted successfully! Our team will contact you soon.");
      onClose();
      // Reset form
      setFormData({
        groundName: "",
        turfName: "",
        location: "",
        ownerName: "",
        contactNumber: "",
        email: "",
      });
      setSelectedPhotos([]);
      setPreviews([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || "Failed to submit enquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="relative p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Own a Sports Venue?</h2>
                <p className="text-gray-500 text-sm">Fill the form below and our team will get in touch with you.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Ground Name</label>
                    <input
                      type="text"
                      name="groundName"
                      value={formData.groundName}
                      onChange={handleChange}
                      placeholder="e.g. Elite Arena"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#1abc60] transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">No. of Turfs</label>
                    <input
                      type="text"
                      name="turfName"
                      value={formData.turfName}
                      onChange={handleChange}
                      placeholder="e.g. 2 Turfs"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#1abc60] transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Area"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#1abc60] transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#1abc60] transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#1abc60] transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Contact Number</label>
                  <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-[#1abc60] transition-all">
                    <div className="flex items-center gap-1.5 pl-4 pr-3 py-3 border-r border-gray-200">
                      <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-4 h-auto" />
                      <span className="text-sm text-gray-700 font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, contactNumber: val });
                      }}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 bg-transparent text-sm border-none outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Ground Photos</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#1abc60] hover:bg-gray-50 transition-all">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 mt-1">Add Photo</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1abc60] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#169c4e] transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#1abc60]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Submit Enquiry <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
