"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, Mail, User } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  order: number;
  isActive: boolean;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/team`);
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(data.data);
      } else {
        setError('Failed to fetch team members');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-300 font-sans">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a68a6b] mx-auto mb-4"></div>
            <p className="text-slate-600">Loading our team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-300 font-sans">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-slate-900 mb-2">Oops!</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={fetchTeamMembers}
              className="px-6 py-2 bg-[#a68a6b] text-white rounded-sm hover:bg-[#8b7355] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-300 font-sans">

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="h-px w-12 bg-[#a68a6b]"></div>
              <span className="text-[#a68a6b] font-bold uppercase tracking-widest text-sm">
                Our Team
              </span>
              <div className="h-px w-12 bg-[#a68a6b]"></div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-slate-900 mb-6">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a68a6b] to-[#d4bca1]">Visionaries</span>
            </h1>
            <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
              The talented individuals behind our architectural masterpieces, each bringing unique expertise and passion to every project.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Team Grid Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {teamMembers.length === 0 ? (
            <div className="text-center py-20">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-slate-900 mb-2">No Team Members Yet</h3>
              <p className="text-slate-600">Our team is growing. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white rounded-sm shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-[#a68a6b] font-semibold text-sm mb-3 uppercase tracking-wider">
                      {member.position}
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-zinc-100">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="text-slate-400 hover:text-[#a68a6b] transition-colors"
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-[#a68a6b] transition-colors"
                          aria-label={`${member.name}'s LinkedIn`}
                        >
                          <Link className="w-4 h-4" />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-[#a68a6b] transition-colors"
                          aria-label={`${member.name}'s Twitter`}
                        >
                          <Link className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
