// lib/projects.ts

export const projects = [
  {
    id: "modern-villa",
    title: "The Glass Pavilion",
    category: "Residential",
    location: "Swiss Alps, Switzerland",
    year: "2023",
    client: "Private Client",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80"
    ],
    shortDescription: "A contemporary residential masterpiece with panoramic mountain views.",
    detailedDescription: "The Glass Pavilion is an exploration of transparency and light. Perched on a dramatic alpine slope, the residence utilizes massive structural glass panels to dissolve the boundary between the interior living spaces and the breathtaking natural environment. Sustainable heating systems and locally sourced stone ground the ethereal structure.",
    technologies: ["Structural Glass", "Local Granite", "Geothermal Heating"],
  },
  {
    id: "aura-tower",
    title: "Aura Skyscraper",
    category: "Commercial",
    location: "Dubai, UAE",
    year: "2024",
    client: "Emaar Properties",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
    ],
    shortDescription: "A commercial tower defining the next generation of smart workspaces.",
    detailedDescription: "Aura Skyscraper redefines the commercial skyline. Featuring a twisting aerodynamic profile, the tower reduces wind load while providing 360-degree views of the city. The facade integrates smart-tinting glass that automatically adjusts to solar intensity, reducing energy consumption by 30%.",
    technologies: ["Smart Glass", "Aerodynamic Steel Frame", "Vertical Gardens"],
  },
  {
    id: "zenith-estate",
    title: "Zenith Estate",
    category: "Residential",
    location: "Malibu, California",
    year: "2022",
    client: "Confidential",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80"
    ],
    shortDescription: "Coastal luxury blending raw materials with refined geometry.",
    detailedDescription: "Situated on a rugged cliffside, Zenith Estate is designed to weather the elements while providing ultimate luxury. Board-formed concrete walls provide privacy from the street, while the ocean-facing elevation opens entirely via motorized glass walls, allowing the ocean breeze to ventilate the home naturally.",
    technologies: ["Board-formed Concrete", "Motorized Facade", "Solar Array"],
  },
  {
    id: "lumina-museum",
    title: "Lumina Art Center",
    category: "Cultural",
    location: "Copenhagen, Denmark",
    year: "2025",
    client: "Ministry of Culture",
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
      "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&q=80"
    ],
    shortDescription: "An iconic cultural hub dedicated to contemporary digital art.",
    detailedDescription: "The Lumina Art Center acts as a canvas itself. The exterior is clad in perforated aluminum panels that allow soft, diffused natural light to enter the galleries during the day, while transforming into a glowing lantern at night. The interior features massive column-free spaces to accommodate large-scale installations.",
    technologies: ["Perforated Aluminum", "Diffused Skylights", "Post-Tensioned Concrete"],
  }
];

export const categories = ['All', 'Residential', 'Commercial', 'Cultural'];