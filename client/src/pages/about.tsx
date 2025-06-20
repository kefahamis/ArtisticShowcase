import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Award, Globe, Users, Calendar, Palette } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-50 to-white py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-light mb-8 text-gray-900">
              About Our Gallery
            </h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
              For over three decades, we've been at the forefront of contemporary art, 
              discovering and nurturing exceptional talent while connecting art enthusiasts 
              with transformative experiences.
            </p>
            <div className="flex justify-center">
              <Link href="/contact">
                <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                  Get In Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-light mb-8 text-gray-900">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 font-light leading-relaxed">
                <p>
                  Founded in 1990, Contemporary Gallery emerged from a vision to create a space 
                  where exceptional contemporary art could flourish and connect with passionate collectors. 
                  What began as a small gallery in the heart of the arts district has evolved into 
                  a internationally recognized institution.
                </p>
                <p>
                  We believe that art has the power to inspire, challenge, and transform. Our carefully 
                  curated exhibitions showcase both emerging and established artists, creating a dynamic 
                  dialogue between tradition and innovation that defines contemporary art today.
                </p>
                <p>
                  Over the years, we've had the privilege of launching careers, facilitating important 
                  acquisitions, and building lasting relationships with collectors, institutions, and 
                  art lovers from around the world.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop"
                  alt="Gallery Interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">30+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-light mb-6 text-gray-900">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              These core principles guide everything we do, from selecting artworks 
              to building relationships with our community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Passion for Art</h3>
                <p className="text-gray-600 font-light">
                  We are driven by an unwavering love for art and a commitment to sharing 
                  that passion with every visitor who walks through our doors.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Excellence</h3>
                <p className="text-gray-600 font-light">
                  We maintain the highest standards in everything we do, from curation 
                  and presentation to customer service and conservation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Globe className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Global Perspective</h3>
                <p className="text-gray-600 font-light">
                  We embrace diverse voices and perspectives, showcasing artists from 
                  around the world to create a truly international dialogue.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Community</h3>
                <p className="text-gray-600 font-light">
                  We foster meaningful connections between artists, collectors, and 
                  art enthusiasts, building a vibrant community around shared appreciation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Innovation</h3>
                <p className="text-gray-600 font-light">
                  We continuously evolve our approach, embracing new technologies and 
                  methodologies to enhance the art experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Palette className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
                <p className="text-gray-600 font-light">
                  We believe art should be accessible to everyone, offering educational 
                  programs and inclusive experiences for all backgrounds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-light mb-6 text-gray-900">
              Our Team
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Meet the passionate individuals who bring our vision to life every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                  alt="Sarah Chen"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sarah Chen</h3>
              <p className="text-gray-600 font-light mb-3">Gallery Director & Curator</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                With over 15 years in contemporary art curation, Sarah leads our artistic vision 
                and oversees our exhibition program.
              </p>
            </div>

            <div className="text-center">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                  alt="Marcus Rodriguez"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Marcus Rodriguez</h3>
              <p className="text-gray-600 font-light mb-3">Senior Art Advisor</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Marcus brings deep expertise in art history and market trends, helping collectors 
                make informed decisions about their acquisitions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
                  alt="Elena Petrov"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Elena Petrov</h3>
              <p className="text-gray-600 font-light mb-3">Client Relations Manager</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Elena ensures every client receives personalized attention and exceptional service 
                throughout their art journey with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-light mb-6">
            Visit Our Gallery
          </h2>
          <p className="text-xl text-gray-300 font-light mb-8 max-w-2xl mx-auto">
            Experience our current exhibitions and discover your next favorite piece. 
            Our doors are always open to art enthusiasts and collectors alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/exhibitions">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900">
                Current Exhibitions
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">
                Plan Your Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}