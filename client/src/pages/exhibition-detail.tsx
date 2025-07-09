import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from "lucide-react";
import { Link } from "wouter";

export default function ExhibitionDetail() {
  const { slug } = useParams();

  const { data: exhibition, isLoading } = useQuery({
    queryKey: ["/api/exhibitions", slug],
  });

  // Mock exhibition data for demonstration
  const exhibitionData = {
    "philippe-bertho-in-san-francisco-ca": {
      id: 1,
      slug: "philippe-bertho-in-san-francisco-ca",
      title: "PHILIPPE BERTHO IN SAN FRANCISCO, CA",
      subtitle: "MEET THE ARTIST LIVE IN GALLERY",
      location: "SAN FRANCISCO, CA",
      venue: "Martin Lawrence Galleries San Francisco",
      address: "366 Geary Street, San Francisco, CA 94102",
      date: "MAY 18TH, 2025",
      time: "2 - 4 PM",
      endDate: "MAY 20TH, 2025",
      image: "/api/placeholder/800/600",
      galleryImages: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300"
      ],
      description: `Join us for an exclusive meet-the-artist event with Philippe Bertho, one of the most celebrated contemporary artists of our time. This special exhibition showcases Bertho's latest collection of surrealist works that blend imagination with reality in the most extraordinary ways.

Philippe Bertho's art transcends traditional boundaries, creating dreamlike landscapes that invite viewers into worlds where the impossible becomes possible. His unique technique combines classical painting methods with modern surrealist concepts, resulting in pieces that are both technically masterful and conceptually groundbreaking.

During this special event, guests will have the rare opportunity to meet Philippe Bertho in person, discuss his artistic process, and gain insights into the inspiration behind his most recent works. The artist will be available for conversations, book signings, and private viewings.`,
      artistBio: `Philippe Bertho is a French contemporary artist known for his surrealist paintings that blend reality with fantasy. Born in Paris in 1962, Bertho studied at the École des Beaux-Arts and has been exhibiting internationally for over three decades. His works are held in major private collections worldwide and have been featured in prestigious galleries across Europe and North America.`,
      featured: true,
      category: "current",
      rsvpRequired: true,
      ticketPrice: "Free",
      contact: {
        phone: "(415) 956-1000",
        email: "sanfrancisco@martinlawrence.com"
      }
    },
    "philippe-bertho-in-south-coast-plaza-mall-costa-mesa-ca": {
      id: 2,
      slug: "philippe-bertho-in-south-coast-plaza-mall-costa-mesa-ca",
      title: "PHILIPPE BERTHO IN SOUTH COAST PLAZA MALL COSTA MESA, CA",
      subtitle: "SOUTH COAST PLAZA COSTA MESA",
      location: "COSTA MESA, CA",
      venue: "Martin Lawrence Galleries Costa Mesa",
      address: "3333 Bristol Street, Costa Mesa, CA 92626",
      date: "MAY 17TH, 2025",
      time: "6 - 8 PM",
      endDate: "MAY 19TH, 2025",
      image: "/api/placeholder/800/600",
      galleryImages: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300"
      ],
      description: `Experience the extraordinary world of Philippe Bertho at our Costa Mesa location. This exhibition features a curated selection of the artist's most compelling works, showcasing his evolution as a master of contemporary surrealism.`,
      featured: true,
      category: "current",
      rsvpRequired: false,
      ticketPrice: "Free"
    },
    "philippe-bertho-in-la-jolla-california": {
      id: 3,
      slug: "philippe-bertho-in-la-jolla-california",
      title: "PHILIPPE BERTHO IN LA JOLLA CALIFORNIA",
      subtitle: "",
      location: "LA JOLLA, CA",
      venue: "Martin Lawrence Galleries La Jolla",
      address: "7655 Girard Avenue, La Jolla, CA 92037",
      date: "MAY 16TH, 2025",
      time: "6-8 PM",
      endDate: "MAY 18TH, 2025",
      image: "/api/placeholder/800/600",
      galleryImages: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300"
      ],
      description: `Discover Philippe Bertho's captivating world of surrealist art at our beautiful La Jolla location. This intimate exhibition showcases the artist's unique vision and technical mastery.`,
      featured: true,
      category: "current",
      rsvpRequired: false,
      ticketPrice: "Free"
    }
  };

  const currentExhibition = exhibitionData[slug as keyof typeof exhibitionData] || exhibitionData["philippe-bertho-in-san-francisco-ca"];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/exhibitions">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Exhibitions
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="aspect-[21/9] overflow-hidden">
          <img
            src={currentExhibition.image}
            alt={currentExhibition.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        
        {/* Exhibition Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            {currentExhibition.featured && (
              <Badge className="mb-4 bg-red-500 text-white">
                Featured Exhibition
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
              {currentExhibition.title}
            </h1>
            {currentExhibition.subtitle && (
              <p className="text-xl text-gray-200 mb-6">
                {currentExhibition.subtitle}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <div>
                  <div className="font-medium">{currentExhibition.date}</div>
                  {currentExhibition.endDate && (
                    <div className="text-gray-300">Through {currentExhibition.endDate}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <div>
                  <div className="font-medium">{currentExhibition.time}</div>
                  <div className="text-gray-300">Gallery Hours</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <div>
                  <div className="font-medium">{currentExhibition.venue}</div>
                  <div className="text-gray-300">{currentExhibition.location}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-light mb-6 tracking-wide">About This Exhibition</h2>
              <div className="prose prose-gray max-w-none">
                {currentExhibition.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Gallery Images */}
            {currentExhibition.galleryImages && (
              <div>
                <h2 className="text-2xl font-light mb-6 tracking-wide">Exhibition Preview</h2>
                <div className="grid grid-cols-2 gap-4">
                  {currentExhibition.galleryImages.map((image, index) => (
                    <div key={index} className="aspect-[4/3] overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Exhibition preview ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artist Bio */}
            {currentExhibition.artistBio && (
              <div>
                <h2 className="text-2xl font-light mb-6 tracking-wide">About the Artist</h2>
                <p className="text-gray-700 leading-relaxed">
                  {currentExhibition.artistBio}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Visit Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Visit Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Venue</div>
                  <div className="text-gray-600">{currentExhibition.venue}</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">Address</div>
                  <div className="text-gray-600">{currentExhibition.address}</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">Dates</div>
                  <div className="text-gray-600">
                    {currentExhibition.date}
                    {currentExhibition.endDate && ` - ${currentExhibition.endDate}`}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">Time</div>
                  <div className="text-gray-600">{currentExhibition.time}</div>
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">Admission</div>
                  <div className="text-gray-600">{currentExhibition.ticketPrice}</div>
                </div>
                
                {currentExhibition.rsvpRequired && (
                  <div>
                    <div className="font-medium text-gray-900">RSVP</div>
                    <div className="text-gray-600">Required</div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {currentExhibition.contact && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Contact</h3>
                <div className="space-y-2 text-sm">
                  {currentExhibition.contact.phone && (
                    <div>
                      <span className="font-medium">Phone: </span>
                      <a href={`tel:${currentExhibition.contact.phone}`} className="text-black hover:underline">
                        {currentExhibition.contact.phone}
                      </a>
                    </div>
                  )}
                  {currentExhibition.contact.email && (
                    <div>
                      <span className="font-medium">Email: </span>
                      <a href={`mailto:${currentExhibition.contact.email}`} className="text-black hover:underline">
                        {currentExhibition.contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {currentExhibition.rsvpRequired && (
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  RSVP for Event
                </Button>
              )}
              
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Share Exhibition
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}