import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Award, Globe, Users, Calendar, Palette, ArrowRight, CornerRightDown } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-32 md:py-40">
        <div className="container relative z-10 mx-auto px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-10 text-gray-900 leading-tight tracking-tighter drop-shadow-lg">
              Crafting Legacies in Art
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed max-w-4xl mx-auto mb-10">
              For over three decades, we've been at the forefront of contemporary art, discovering and
              nurturing exceptional talent while connecting art enthusiasts with transformative experiences.
            </p>
            <div className="flex justify-center">
              <Link href="/contact">
                <Button className="bg-black text-white hover:bg-gray-800 transition-all transform hover:scale-105 px-10 py-7 text-lg rounded-full shadow-2xl font-bold uppercase tracking-wide">
                  Get In Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-5xl font-serif font-bold mb-10 text-gray-900 leading-tight">
                A Journey of Passion and Purpose
              </h2>
              <div className="space-y-8 text-lg text-gray-700 leading-relaxed font-light">
                <p>
                  Founded in 1990, the **Contemporary Gallery** emerged from a vision to create a vibrant space where exceptional contemporary art could flourish and connect with passionate collectors. What began as a small gallery in the heart of the arts district has evolved into an internationally recognized institution.
                </p>
                <p>
                  We believe that art has the power to inspire, challenge, and transform. Our carefully curated exhibitions showcase both emerging and established artists, creating a dynamic dialogue between tradition and innovation that defines contemporary art today.
                </p>
                <p>
                  Over the years, we've had the privilege of launching careers, facilitating important acquisitions, and building lasting relationships with collectors, institutions, and art lovers from around the world.
                </p>
              </div>
            </div>
            {/* Image with overlay card */}
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&h=800&fit=crop"
                  alt="Gallery Interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-2xl border-4 border-gray-100 min-w-[220px] transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-900 mb-2 font-serif">30+</div>
                  <div className="text-lg text-gray-600 font-semibold tracking-wide">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      ---
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900 leading-tight">
              Our Guiding Principles
            </h2>
            <p className="text-xl text-gray-600 font-light">
              These core principles are the heartbeat of our gallery, guiding every decision, from curating exhibitions to nurturing our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <Card className="border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group bg-white">
              <CardContent className="p-10 text-center">
                <Heart className="w-16 h-16 text-red-500 mx-auto mb-6 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold mb-4 font-serif text-gray-900">Passion for Art</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We are driven by an unwavering love for art and a commitment to sharing that passion with every visitor who walks through our doors.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group bg-white">
              <CardContent className="p-10 text-center">
                <Award className="w-16 h-16 text-amber-500 mx-auto mb-6 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold mb-4 font-serif text-gray-900">Uncompromising Excellence</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We maintain the highest standards in everything we do, from curation and presentation to client service and conservation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group bg-white">
              <CardContent className="p-10 text-center">
                <Globe className="w-16 h-16 text-emerald-600 mx-auto mb-6 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold mb-4 font-serif text-gray-900">Global Perspective</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We embrace diverse voices and perspectives, showcasing artists from around the world to create a truly international dialogue.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group bg-white">
              <CardContent className="p-10 text-center">
                <Users className="w-16 h-16 text-purple-600 mx-auto mb-6 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold mb-4 font-serif text-gray-900">Community First</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We foster meaningful connections between artists, collectors, and art enthusiasts, building a vibrant community around shared appreciation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group bg-white">
              <CardContent className="p-10 text-center">
                <Palette className="w-16 h-16 text-pink-500 mx-auto mb-6 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold mb-4 font-serif text-gray-900">Artistic Innovation</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We continuously evolve our approach, embracing new technologies and methodologies to enhance the art experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 group bg-white">
              <CardContent className="p-10 text-center">
                <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-6 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-bold mb-4 font-serif text-gray-900">Inclusivity & Accessibility</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We believe art should be accessible to everyone, offering educational programs and inclusive experiences for all backgrounds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Team */}
      ---
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <h2 className="text-5xl font-serif font-bold mb-8 text-gray-900 leading-tight">
              Meet the Visionaries
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Meet the passionate individuals who bring our vision to life every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {/* Team Member 1 */}
            <div className="text-center group">
              <div className="w-60 h-60 rounded-full mx-auto mb-8 relative overflow-hidden shadow-2xl border-4 border-gray-100 transition-transform duration-500 group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
                  alt="Sarah Chen"
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              </div>
              <h3 className="text-2xl font-bold mb-1 font-serif">Sarah Chen</h3>
              <p className="text-lg text-purple-700 font-medium mb-4">Gallery Director & Head Curator</p>
              <p className="text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                With over 15 years in contemporary art curation, Sarah leads our artistic vision and oversees our exhibition program.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center group">
              <div className="w-60 h-60 rounded-full mx-auto mb-8 relative overflow-hidden shadow-2xl border-4 border-gray-100 transition-transform duration-500 group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                  alt="Marcus Rodriguez"
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              </div>
              <h3 className="text-2xl font-bold mb-1 font-serif">Marcus Rodriguez</h3>
              <p className="text-lg text-purple-700 font-medium mb-4">Senior Art Advisor</p>
              <p className="text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                Marcus brings deep expertise in art history and market trends, helping collectors make informed decisions about their acquisitions.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center group">
              <div className="w-60 h-60 rounded-full mx-auto mb-8 relative overflow-hidden shadow-2xl border-4 border-gray-100 transition-transform duration-500 group-hover:scale-105">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
                  alt="Elena Petrov"
                  className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              </div>
              <h3 className="text-2xl font-bold mb-1 font-serif">Elena Petrov</h3>
              <p className="text-lg text-purple-700 font-medium mb-4">Client Relations Manager</p>
              <p className="text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                Elena ensures every client receives personalized attention and exceptional service throughout their art journey with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      ---
      <section className="py-24 md:py-32 bg-gray-900 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center max-w-5xl">
          <h2 className="text-5xl font-serif font-bold mb-8 leading-tight">
            Ready to Explore?
          </h2>
          <p className="text-xl text-gray-300 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience our current exhibitions and discover your next favorite piece. Our doors are always open to art enthusiasts and collectors alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/exhibitions">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 rounded-full px-10 py-7 text-lg font-bold transition-all transform hover:scale-105 group"
              >
                Current Exhibitions
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-200 rounded-full px-10 py-7 text-lg font-bold transition-all transform hover:scale-105 group"
              >
                Plan Your Visit
                <CornerRightDown className="ml-2 w-5 h-5 transition-transform group-hover:rotate-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}