'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SocialIcons {
  _id?: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  pinterest: string;
}

const defaultSocialIcons: SocialIcons = {
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  youtube: '',
  pinterest: ''
};

const socialPlatforms = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourhandle' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/yourchannel' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourprofile' }
];

export default function SocialIconsManagementPage() {
  const [socialIcons, setSocialIcons] = useState<SocialIcons>(defaultSocialIcons);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<SocialIcons>(defaultSocialIcons);

  // Fetch social icons
  useEffect(() => {
    fetchSocialIcons();
  }, []);

  const fetchSocialIcons = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/social-icons`);
      const data = await response.json();
      if (data.success && data.data) {
        setSocialIcons(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching social icons:', error);
      setMessage({ type: 'error', text: 'Error loading social icons' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/social-icons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSocialIcons(data.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Social icons updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error updating social icons' });
      }
    } catch (error) {
      console.error('Error saving social icons:', error);
      setMessage({ type: 'error', text: 'Error saving social icons' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(socialIcons);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#a68a6b]"></div>
          <p className="text-zinc-600 mt-4 font-light">Loading social icons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Social Icons Management</h1>
          <p className="text-slate-600 font-light">Manage your social media links and icons</p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex-1">{message.text}</div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-zinc-200"
        >
          {!isEditing ? (
            // View Mode
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                    Social Media Links
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.key} className="p-4 bg-zinc-50 rounded-lg">
                        <p className="text-sm font-semibold text-zinc-700 mb-2">{platform.label}</p>
                        <p className="text-sm text-slate-600 break-all">
                          {formData[platform.key as keyof SocialIcons] || 'Not set'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#a68a6b] text-white rounded-lg hover:bg-[#9a7a5a] transition-colors font-semibold"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Links
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.key}>
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">
                          {platform.label}
                        </label>
                        <input
                          type="url"
                          name={platform.key}
                          value={formData[platform.key as keyof SocialIcons]}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a68a6b] focus:border-transparent"
                          placeholder={platform.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-zinc-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#a68a6b] text-white rounded-lg hover:bg-[#9a7a5a] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-300 text-slate-700 rounded-lg hover:bg-zinc-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}