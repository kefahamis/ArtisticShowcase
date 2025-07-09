import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Phone, Mail, User, CheckCircle, ArrowRight } from "lucide-react";

// --- Skeleton Components (Ideally in separate files) ---

// A generic skeleton rectangle
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
);

// Skeleton for an input field
const SkeletonInput = () => <Skeleton className="h-12 w-full" />;

// Skeleton for a textarea
const SkeletonTextarea = () => <Skeleton className="h-36 w-full" />;

// Skeleton for a select dropdown
const SkeletonSelect = () => <Skeleton className="h-12 w-full" />;

// Skeleton for a card title
const SkeletonCardTitle = () => <Skeleton className="h-8 w-3/4 mb-4" />;

// Skeleton for a small text line
const SkeletonText = ({ className = "h-5 w-full" }: { className?: string }) => (
  <Skeleton className={className} />
);

// --- End Skeleton Components ---


export default function Appointments() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    appointmentType: "",
    preferredDate: "",
    preferredTime: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simulate data fetching or content loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Increased delay for a smoother effect
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate appointment booking (would integrate with actual booking system)
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Appointment Request Submitted",
        description: "We'll contact you within 24 hours to confirm your appointment details.",
        action: <CheckCircle className="text-green-500" />,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        appointmentType: "",
        preferredDate: "",
        preferredTime: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue submitting your appointment request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white to-gray-100 py-24 md:py-32">
        <div className="container mx-auto px-6 text-center">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-16 w-3/4 mx-auto mb-8" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
              <Skeleton className="h-6 w-5/6 max-w-xl mx-auto mt-2" />
            </div>
          ) : (
            <>
              <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
                Schedule a Visit
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-light leading-relaxed">
                Experience our curated collection firsthand with a personalized viewing or consultation. We look forward to welcoming you to the gallery.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Appointment Form */}
          <div>
            <h2 className="text-4xl font-serif font-bold mb-10 text-gray-900">Book Your Appointment</h2>
            <Card className="shadow-2xl border-none rounded-3xl p-2">
              <CardContent className="p-8">
                {isLoading ? (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <SkeletonInput />
                      <SkeletonInput />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <SkeletonInput />
                      <SkeletonInput />
                    </div>
                    <SkeletonSelect />
                    <div className="grid md:grid-cols-2 gap-6">
                      <SkeletonInput />
                      <SkeletonSelect />
                    </div>
                    <SkeletonTextarea />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name *</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Jane"
                          className="h-12 px-5 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Doe"
                          className="h-12 px-5 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="jane.doe@example.com"
                          className="h-12 px-5 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="(+254) 712 345678"
                          className="h-12 px-5 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                        />
                      </div>
                    </div>

                    {/* Appointment Type */}
                    <div>
                      <Label htmlFor="appointmentType" className="block text-sm font-semibold text-gray-700 mb-2">Appointment Type *</Label>
                      <Select value={formData.appointmentType} onValueChange={(value) => handleInputChange("appointmentType", value)}>
                        <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-gray-900">
                          <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private-viewing">Private Viewing</SelectItem>
                          <SelectItem value="consultation">Art Consultation</SelectItem>
                          <SelectItem value="appraisal">Art Appraisal</SelectItem>
                          <SelectItem value="commission">Commission Discussion</SelectItem>
                          <SelectItem value="collection-review">Collection Review</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="preferredDate" className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date *</Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                          className="h-12 px-5 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                          min={today}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</Label>
                        <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange("preferredTime", value)}>
                          <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-gray-900">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                            <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                            <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                            <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                            <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                            <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                            <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                            <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                            <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message or Special Requests</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Please describe any specific artworks you're interested in or special requirements for your visit..."
                        rows={5}
                        className="min-h-[120px] p-5 rounded-xl border-gray-300 focus-visible:ring-gray-900"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 bg-gray-900 text-white hover:bg-gray-800 transition-all transform hover:scale-[1.01] font-bold text-lg rounded-xl shadow-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>
                          Request Appointment
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Section */}
          <div className="space-y-12">
            <h2 className="text-4xl font-serif font-bold mb-10 text-gray-900">Information for Your Visit</h2>
            <Card className="rounded-3xl shadow-xl border-none transition-all hover:shadow-2xl group">
              <CardContent className="p-8 flex flex-col md:flex-row items-start gap-6">
                <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-purple-600 flex-shrink-0">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-serif font-semibold mb-3">Gallery Hours</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="flex justify-between"><SkeletonText className="w-1/3" /><SkeletonText className="w-1/4" /></div>
                      <div className="flex justify-between"><SkeletonText className="w-1/3" /><SkeletonText className="w-1/4" /></div>
                      <div className="flex justify-between"><SkeletonText className="w-1/3" /><SkeletonText className="w-1/4" /></div>
                      <SkeletonText className="h-4 w-2/3 mt-4" />
                    </div>
                  ) : (
                    <div className="space-y-3 text-lg text-gray-700 font-light">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Monday - Friday</span>
                        <span className="font-light">10:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Saturday</span>
                        <span className="font-light">10:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sunday</span>
                        <span className="font-light">12:00 PM - 5:00 PM</span>
                      </div>
                      <p className="pt-4 border-t border-gray-200 text-sm text-gray-600 mt-4">
                        Private appointments available outside regular hours by request.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-xl border-none transition-all hover:shadow-2xl group">
              <CardContent className="p-8 flex flex-col md:flex-row items-start gap-6">
                <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-blue-600 flex-shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-serif font-semibold mb-3">What to Expect</h3>
                  {isLoading ? (
                    <div className="space-y-6">
                      <SkeletonText className="w-2/3 mb-2" />
                      <SkeletonText className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold mb-2">Personalized Service</h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          Your appointment guarantees you one-on-one time with a gallery expert who can guide you through the collection and answer your questions.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">No Obligation</h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          Whether you're a seasoned collector or a first-time buyer, appointments are a no-pressure way to explore the art.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-xl border-none transition-all hover:shadow-2xl group">
              <CardContent className="p-8 flex flex-col md:flex-row items-start gap-6">
                <div className="bg-gray-900 p-4 rounded-full text-white transition-colors group-hover:bg-green-600 flex-shrink-0">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-serif font-semibold mb-3">Find Us</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <SkeletonText className="w-1/2" />
                      <SkeletonText className="w-2/3" />
                      <SkeletonText className="w-1/2" />
                      <div className="flex items-center mt-4"><SkeletonText className="w-2/3" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-lg text-gray-700">
                      <p className="font-medium">Contemporary Gallery</p>
                      <p>123 Art District Avenue</p>
                      <p>New York, NY 10001</p>
                      <a href="#" className="flex items-center text-blue-600 hover:underline mt-4 font-semibold">
                        <ArrowRight className="w-5 h-5 mr-1" />
                        Get Directions
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}