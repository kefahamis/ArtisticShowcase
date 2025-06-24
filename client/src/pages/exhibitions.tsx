import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Exhibitions() {
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  const { data: exhibitions = [], isLoading } = useQuery({
    queryKey: ["/api/exhibitions"],
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  // Gallery locations
  const locations = [
    "ALL",
    "COSTA MESA", 
    "LA JOLLA",
    "LAS VEGAS",
    "NEW ORLEANS",
    "NEW YORK",
    "SAN FRANCISCO",
    "SCHAUMBURG"
  ];

  // Create slug from title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Mock exhibition data in Martin Lawrence style
  const exhibitionData = [
    {
      id: 1,
      slug: "philippe-bertho-in-san-francisco-ca",
      title: "PHILIPPE BERTHO IN SAN FRANCISCO, CA",
      subtitle: "MEET THE ARTIST LIVE IN GALLERY",
      location: "SAN FRANCISCO, CA",
      date: "MAY 18TH, 2025",
      time: "2 - 4 PM",
      image: "/api/placeholder/400/300",
      featured: true,
      category: "current"
    },
    {
      id: 2,
      slug: "philippe-bertho-in-south-coast-plaza-mall-costa-mesa-ca",
      title: "PHILIPPE BERTHO IN SOUTH COAST PLAZA MALL COSTA MESA, CA",
      subtitle: "SOUTH COAST PLAZA COSTA MESA",
      location: "COSTA MESA, CA",
      date: "MAY 17TH, 2025",
      image: "/api/placeholder/400/300",
      featured: true,
      category: "current"
    },
    {
      id: 3,
      slug: "philippe-bertho-in-la-jolla-california",
      title: "PHILIPPE BERTHO IN LA JOLLA CALIFORNIA",
      subtitle: "",
      location: "LA JOLLA, CA",
      date: "MAY 16TH, 2025", 
      time: "6-8 PM",
      image: "/api/placeholder/400/300",
      featured: true,
      category: "current"
    },
    {
      id: 4,
      slug: "philippe-bertho-comes-to-schaumburg",
      title: "PHILIPPE BERTHO COMES TO SCHAUMBURG",
      subtitle: "Experience a night of imagination, art, and surreal wonder",
      location: "SCHAUMBURG",
      date: "MAY 15TH, 2025",
      time: "6 - 8 PM",
      image: "/api/placeholder/400/300",
      featured: false,
      category: "upcoming"
    },
    {
      id: 5,
      slug: "martin-lawrence-galleries-soho",
      title: "MARTIN LAWRENCE GALLERIES SOHO",
      subtitle: "FRANK MORRISON ART RECEPTION",
      location: "NEW YORK",
      date: "APRIL 26TH, 2025",
      image: "/api/placeholder/400/300",
      featured: false,
      category: "past"
    },
    {
      id: 6,
      slug: "april-flowers",
      title: "APRIL FLOWERS",
      subtitle: "A CELEBRATION OF SPRING",
      location: "COSTA MESA",
      date: "APRIL 20TH, 2025",
      image: "/api/placeholder/400/300",
      featured: false,
      category: "past"
    }
  ];

  // Filter exhibitions by location
  const filteredExhibitions = useMemo(() => {
    if (selectedLocation === "ALL") {
      return exhibitionData;
    }
    return exhibitionData.filter(exhibition => 
      exhibition.location.includes(selectedLocation)
    );
  }, [selectedLocation]);

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Header */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-light text-black mb-8 tracking-wide">
            EXHIBITIONS
          </h1>
          
          {/* Location Filter Tabs */}
          <div className="flex flex-wrap gap-6 text-sm">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedLocation === location
                    ? "border-black text-black font-medium"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exhibitions Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map((exhibition) => (
            <Link key={exhibition.id} href={`/exhibitions/${exhibition.slug}`}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
                <img
                  src={exhibition.image}
                  alt={exhibition.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay content for featured exhibitions */}
                {exhibition.featured && (
                  <div className="absolute inset-0 bg-black/50 flex items-end p-6">
                    <div className="text-white">
                      <div className="text-4xl font-bold mb-2">
                        {exhibition.title.includes("PHILIPPE") ? "PHILIPPE" : ""}
                      </div>
                      <div className="text-4xl font-bold text-red-500 mb-2">
                        {exhibition.title.includes("BERTHO") ? "BERTHO" : ""}
                      </div>
                      <div className="text-sm mb-2">
                        {exhibition.subtitle}
                      </div>
                      <div className="text-sm mb-1">
                        LIVE IN GALLERY
                      </div>
                      <div className="text-xl font-bold mb-2">
                        {exhibition.location.split(',')[0]}
                      </div>
                      <div className="text-sm">
                        {exhibition.date}
                      </div>
                      {exhibition.time && (
                        <div className="text-sm">
                          {exhibition.time}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Title and details below image */}
              <div className="mt-4">
                <h3 className="text-lg font-medium text-black mb-2 leading-tight">
                  {exhibition.title}
                </h3>
                <div className="text-sm text-gray-600 uppercase tracking-wide">
                  {exhibition.location}
                </div>
                <div className="text-sm text-gray-900 mt-1">
                  {exhibition.date}
                </div>
              </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Show message if no exhibitions found */}
        {filteredExhibitions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">🎨</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No exhibitions found
            </h3>
            <p className="text-gray-500">
              Try selecting a different location or check back later for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}