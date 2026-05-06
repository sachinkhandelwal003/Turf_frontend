'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Mail,
  User,
  Image as ImageIcon,
  Loader2,
  CheckCircle
} from 'lucide-react';

// Custom SVGs for Social Icons (Since Lucide removed brand icons)
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  bio: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  image?: string;
  isActive?: boolean;
}

const TeamMemberDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/team/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMember(data.data);
          setFormData(data.data);
        }
      } catch (error) {
        console.error('Error fetching team member:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  useEffect(() => {
    if (searchParams?.get('mode') === 'edit') {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      // Reset form data to current member if edit mode is cancelled
      if (member) setFormData(member);
    }
  }, [searchParams, member]);

  // Updated to handle both strings and booleans
  const handleChange = (field: keyof TeamMember, value: string | boolean) => {
    setFormData((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSave = async () => {
    if (!id || !formData) return;
    setIsSaving(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/team/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setMember(result.data);
        setFormData(result.data);
        setIsEditing(false);
        router.push(`/admin/team/${id}`); // Remove the query param
      } else {
        alert("Failed to update team member.");
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-lg font-medium text-gray-900">Team member not found.</p>
        <Link href="/admin/team" className="mt-4 text-blue-600 hover:underline">Return to Team Roster</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/team"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Team Member Profile</h1>
          <p className="text-sm text-gray-500">Manage profile details and contact information.</p>
        </div>
        
        {!isEditing && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
            onClick={() => router.push(`/admin/team/${id}?mode=edit`)}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 lg:grid-cols-[350px_1fr]"
      >
        {/* Left Column: Preview Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm h-fit">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-5 h-32 w-32 overflow-hidden rounded-full bg-gray-100 ring-4 ring-gray-50 relative shadow-inner">
              {member.image ? (
                <Image src={member.image} alt={member.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <User className="h-12 w-12" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h2>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">{member.position}</p>
            </div>
            
            <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {member.isActive ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {member.isActive ? 'Active Member' : 'Inactive'}
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-600 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Mail className="h-4 w-4" /></div>
              <span className="truncate">{member.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><LinkedinIcon className="h-4 w-4" /></div>
              <span className="truncate">{member.linkedin || 'No LinkedIn'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><TwitterIcon className="h-4 w-4" /></div>
              <span className="truncate">{member.twitter || 'No Twitter'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900">Profile Details</h3>
            <p className="text-sm text-gray-500">Update personal information, biography, and social links.</p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData?.name || ''}
                  onChange={(event) => handleChange('name', event.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Position</label>
                <input
                  type="text"
                  value={formData?.position || ''}
                  onChange={(event) => handleChange('position', event.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biography</label>
              <textarea
                rows={4}
                value={formData?.bio || ''}
                onChange={(event) => handleChange('bio', event.target.value)}
                disabled={!isEditing}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Contact & Media</h4>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData?.email || ''}
                    onChange={(event) => handleChange('email', event.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData?.image || ''}
                      onChange={(event) => handleChange('image', event.target.value)}
                      disabled={!isEditing}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData?.linkedin || ''}
                    onChange={(event) => handleChange('linkedin', event.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter URL</label>
                  <input
                    type="url"
                    value={formData?.twitter || ''}
                    onChange={(event) => handleChange('twitter', event.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Active Status Toggle */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Active Status</h4>
                <p className="text-xs text-gray-500">Determine if this member shows up on the public website.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData?.isActive || false}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 transition-all shadow-sm"
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/admin/team/${id}`)}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TeamMemberDetailPage;