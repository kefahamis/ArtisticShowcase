import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Car,
  Train,
  Coffee,
  MailCheck,
  Map,
  MoveRight,
} from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: result.message || "Thank you for your inquiry. We'll get back to you within 24 hours.",
        });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast({
          title: "Error",
          description: result.message || "There was an issue sending your message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-gray-100 py-32 md:py-40">
        <div className="container relative z-10 mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 text-gray-900 leading-tight tracking-tighter drop-shadow-lg">
              Let's Connect
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed max-w-3xl mx-auto">
              Whether you're interested in acquiring a piece, scheduling a private viewing, or learning more about our artists, we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Information */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-serif font-bold mb-12 text-gray-900 leading-tight">
                Send Us a Message
              </h2>

              <Card className="shadow-2xl border-none rounded-3xl p-2">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="John Doe"
                          className="h-14 text-base px-6 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="your@email.com"
                          className="h-14 text-base px-6 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="h-14 text-base px-6 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                        <Input
                          id="subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="Inquiry about..."
                          className="h-14 text-base px-6 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        placeholder="Tell us about your interest in our gallery, specific artworks, or any questions you have..."
                        rows={7}
                        className="min-h-[150px] text-base p-6 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-all transform hover:scale-[1.01] h-14 text-lg rounded-xl font-bold" disabled={isSubmitting}>
                      <MailCheck className="mr-2 w-5 h-5" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information Cards */}
            <div className="flex flex-col gap-10">
              <h2 className="text-4xl font-serif font-bold mb-2 text-gray-900 leading-tight">
                Visit Our Gallery
              </h2>
              <p className="text-lg text-gray-700 font-light leading-relaxed">
                We are located in the heart of Chelsea's vibrant art district. Feel free to drop by during our open hours or schedule a private appointment.
              </p>

              {/* Location */}
              <Card className="rounded-3xl shadow-xl border-none transition-all hover:shadow-2xl group">
                <CardContent className="p-8 flex items-start gap-6">
                  <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-purple-600">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2 font-serif">Our Location</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      123 Art District Avenue<br />
                      Chelsea, New York, NY 10001<br />
                      United States
                    </p>
                    <a href="https://maps.app.goo.gl/your-location" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors font-semibold">
                      Open in Google Maps <MoveRight className="ml-2 w-5 h-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <Card className="rounded-3xl shadow-xl border-none transition-all hover:shadow-2xl group">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-blue-600">
                      <Phone className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold font-serif">Phone</h3>
                      <a href="tel:+15551234567" className="text-gray-600 text-lg hover:underline">+1 (555) 123-4567</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-green-600">
                      <Mail className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold font-serif">Email</h3>
                      <a href="mailto:info@contemporarygallery.com" className="text-gray-600 text-lg hover:underline">info@contemporarygallery.com</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card className="rounded-3xl shadow-xl border-none transition-all hover:shadow-2xl group">
                <CardContent className="p-8 flex items-start gap-6">
                  <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-orange-600">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 font-serif">Gallery Hours</h3>
                    <div className="space-y-3 text-lg text-gray-700 font-light">
                      <div className="flex justify-between">
                        <span>Tuesday - Friday</span>
                        <span className="font-medium">10:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-medium">10:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-medium">12:00 PM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Monday</span>
                        <span className="text-red-600">Closed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Here & Map Section */}
      ---
      <section className="py-24 md:py-32 bg-gray-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Map Placeholder */}
            <div className="aspect-[5/4] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Map className="w-20 h-20 text-gray-400 mx-auto mb-4 opacity-70" />
                  <p className="text-lg font-light">
                    Interactive map coming soon
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    123 Art District Avenue, Chelsea, NY 10001
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Here details */}
            <div>
              <h2 className="text-4xl font-serif font-bold mb-12 text-gray-900 leading-tight">
                Getting Here
              </h2>
              <p className="text-lg text-gray-700 font-light mb-12 leading-relaxed">
                We are conveniently located in the heart of Chelsea's art district, easily accessible by multiple transportation options.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {/* By Car */}
                <div className="flex items-start gap-5">
                  <div className="bg-black text-white p-4 rounded-full shadow-lg">
                    <Car className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-serif mb-2">By Car</h3>
                    <p className="text-gray-600 text-lg font-light leading-relaxed">
                      Parking available at nearby lots. Street parking is also available with meter payment.
                    </p>
                  </div>
                </div>
                {/* Public Transit */}
                <div className="flex items-start gap-5">
                  <div className="bg-black text-white p-4 rounded-full shadow-lg">
                    <Train className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-serif mb-2">Public Transit</h3>
                    <p className="text-gray-600 text-lg font-light leading-relaxed">
                      Subway: L train to 14th St-8th Ave <br />
                      Bus: M14A, M14D, M11
                    </p>
                  </div>
                </div>
                {/* Nearby */}
                <div className="flex items-start gap-5">
                  <div className="bg-black text-white p-4 rounded-full shadow-lg">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-serif mb-2">Nearby</h3>
                    <p className="text-gray-600 text-lg font-light leading-relaxed">
                      We're a short walk from High Line Park, Whitney Museum, and numerous cafes.
                    </p>
                  </div>
                </div>
                {/* Services */}
                <div className="flex items-start gap-5">
                  <div className="bg-black text-white p-4 rounded-full shadow-lg">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-serif mb-2">Special Services</h3>
                    <ul className="text-gray-600 text-lg font-light space-y-1 leading-relaxed list-disc list-inside">
                      <li>Private viewing appointments</li>
                      <li>Art consultation services</li>
                      <li>Corporate art programs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}