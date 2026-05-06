'use client';

import { useState } from 'react';
import { Calendar, User, Tag } from 'lucide-react';

const blogs = [
  {
    id: 1,
    title: 'Sustainable Architecture: Building for the Future',
    excerpt: 'Explore how modern architecture is embracing sustainability and eco-friendly design principles. Learn about green materials, energy efficiency, and innovative designs.',
    author: 'John Architect',
    date: 'January 15, 2024',
    tags: ['Sustainability', 'Design', 'Future'],
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600',
  },
  {
    id: 2,
    title: 'The Art of Minimalist Design',
    excerpt: 'Discover the beauty of simplicity in architectural design and how less can truly be more. Explore clean lines, open spaces, and functional aesthetics.',
    author: 'Sarah Designer',
    date: 'January 10, 2024',
    tags: ['Minimalism', 'Design', 'Trends'],
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600',
  },
  {
    id: 3,
    title: 'Smart Homes: Technology Meets Architecture',
    excerpt: 'How smart technology is revolutionizing the way we design and interact with our living spaces. From automated systems to IoT integration.',
    author: 'Mike Tech',
    date: 'January 5, 2024',
    tags: ['Technology', 'Smart Homes', 'Innovation'],
    image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=600',
  },
  {
    id: 4,
    title: 'Biophilic Design: Connecting with Nature',
    excerpt: 'Incorporating natural elements into architectural design to improve well-being and create harmonious spaces.',
    author: 'Emma Green',
    date: 'December 28, 2023',
    tags: ['Biophilic', 'Nature', 'Wellness'],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
  },
  {
    id: 5,
    title: 'Urban Planning for Future Cities',
    excerpt: 'Exploring innovative approaches to urban design that prioritize sustainability, mobility, and community engagement.',
    author: 'David Urban',
    date: 'December 20, 2023',
    tags: ['Urban', 'Planning', 'Future'],
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600',
  },
  {
    id: 6,
    title: 'Restoration vs. Renovation',
    excerpt: 'Understanding the differences between restoring historic buildings and renovating modern spaces.',
    author: 'Lisa Heritage',
    date: 'December 15, 2023',
    tags: ['Restoration', 'Renovation', 'History'],
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
  },
];

const allTags = ['All', ...new Set(blogs.flatMap(blog => blog.tags))];

export default function Blogs() {
  const [selectedTag, setSelectedTag] = useState('All');

  const filteredBlogs = selectedTag === 'All'
    ? blogs
    : blogs.filter(blog => blog.tags.includes(selectedTag));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Architecture Blog</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Insights, inspiration, and ideas from our architectural experts
        </p>
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.map((blog) => (
          <article key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{blog.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{blog.author}</span>
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
                <a href={`/blogs/${blog.id}`}>{blog.title}</a>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag) => (
                  <span key={tag} className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
              <a
                href={`/blogs/${blog.id}`}
                className="inline-block text-blue-600 font-semibold hover:text-blue-700"
              >
                Read More →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}