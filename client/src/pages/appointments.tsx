import { useState, useEffect } from "react"; // Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Phone, Mail, User } from "lucide-react";

// --- Skeleton Components (Ideally in separate files) ---

// A generic skeleton rectangle
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Skeleton for an input field
const SkeletonInput = () => <Skeleton className="h-10 w-full" />;

// Skeleton for a textarea
const SkeletonTextarea = () => <Skeleton className="h-24 w-full" />;

// Skeleton for a select dropdown
const SkeletonSelect = () => <Skeleton className="h-10 w-full" />;

// Skeleton for a card title
const SkeletonCardTitle = () => <Skeleton className="h-6 w-3/4 mb-4" />;

// Skeleton for a small text line
const SkeletonText = ({ className = "h-4 w-full" }: { className?: string }) => (
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
  const [isLoading, setIsLoading] = useState(true); // New loading state for the page content
  const { toast } = useToast();

  // Simulate data fetching or content loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Set loading to false after a delay
    }, 1500); // Simulate 1.5 seconds of loading
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate appointment booking (would integrate with actual booking system)
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Appointment Request Submitted",
        description: "We'll contact you within 24 hours to confirm your appointment.",
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

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
              <Skeleton className="h-6 w-5/6 max-w-2xl mx-auto mt-2" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">
                Schedule an Appointment
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                Experience our collection in person with personalized attention from our gallery experts.
                Schedule a private viewing or consultation to discover the perfect piece for your collection.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Appointment Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader className="bg-black text-white">
                <CardTitle className="text-2xl font-serif font-light flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  Book Your Appointment
                </CardTitle>
              </CardHeader>

              <CardContent className="p-8">
                {isLoading ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><SkeletonInput /></div>
                      <div><SkeletonInput /></div>
                    </div>
                    <div><SkeletonInput /></div>
                    <div><SkeletonInput /></div>
                    <div><SkeletonSelect /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><SkeletonInput /></div>
                      <div><SkeletonSelect /></div>
                    </div>
                    <div><SkeletonTextarea /></div>
                    <Skeleton className="h-12 w-full" /> {/* Submit button skeleton */}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Appointment Type */}
                    <div>
                      <Label htmlFor="appointmentType" className="text-sm font-medium">
                        Appointment Type *
                      </Label>
                      <Select value={formData.appointmentType} onValueChange={(value) => handleInputChange("appointmentType", value)}>
                        <SelectTrigger className="mt-1">
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
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preferredDate" className="text-sm font-medium">
                          Preferred Date *
                        </Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                          className="mt-1"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredTime" className="text-sm font-medium">
                          Preferred Time
                        </Label>
                        <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange("preferredTime", value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9:00 AM">9:00 AM</SelectItem>
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
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message or Special Requests
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="mt-1"
                        rows={4}
                        placeholder="Please describe any specific artworks you're interested in or special requirements for your visit..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg font-medium tracking-wide"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Request Appointment"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Section */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif font-light flex items-center">
                  <Clock className="w-5 h-5 mr-3" />
                  Gallery Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <>
                    <div className="flex justify-between"><SkeletonText className="w-1/3" /><SkeletonText className="w-1/3" /></div>
                    <div className="flex justify-between"><SkeletonText className="w-1/3" /><SkeletonText className="w-1/3" /></div>
                    <div className="flex justify-between"><SkeletonText className="w-1/3" /><SkeletonText className="w-1/3" /></div>
                    <SkeletonText className="h-4 w-2/3 pt-3 border-t" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Monday - Friday</span>
                      <span>10:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Saturday</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sunday</span>
                      <span>12:00 PM - 5:00 PM</span>
                    </div>
                    <div className="pt-3 border-t text-sm text-gray-600">
                      Private appointments available outside regular hours by request
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif font-light flex items-center">
                  <MapPin className="w-5 h-5 mr-3" />
                  Visit Our Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <>
                    <SkeletonText className="w-1/2" />
                    <SkeletonText className="w-2/3" />
                    <SkeletonText className="w-1/2" />
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center"><SkeletonText className="w-1/2" /></div>
                      <div className="flex items-center"><SkeletonText className="w-2/3" /></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">Contemporary Gallery</p>
                      <p className="text-gray-600">123 Art District Avenue</p>
                      <p className="text-gray-600">New York, NY 10001</p>
                    </div>
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span>(555) 123-4567</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span>appointments@gallery.com</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif font-light">
                  What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <div>
                      <SkeletonText className="w-1/3 mb-2" />
                      <SkeletonText className="h-10 w-full" />
                    </div>
                    <div>
                      <SkeletonText className="w-1/3 mb-2" />
                      <SkeletonText className="h-10 w-full" />
                    </div>
                    <div>
                      <SkeletonText className="w-1/3 mb-2" />
                      <SkeletonText className="h-10 w-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Private Viewing</h4>
                      <p className="text-gray-600 text-sm">
                        Enjoy exclusive access to our collection with personalized guidance from our curators.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Art Consultation</h4>
                      <p className="text-gray-600 text-sm">
                        Get expert advice on building your collection, investment potential, and artwork selection.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Commission Services</h4>
                      <p className="text-gray-600 text-sm">
                        Discuss custom artwork commissions directly with our featured artists.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}