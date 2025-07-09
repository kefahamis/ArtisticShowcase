import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PayPalButtonWrapper from "@/components/PayPalButtonWrapper";

// Schema for form validation
const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  address: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  paymentMethod: z.enum(["paypal"], {
    errorMap: () => ({ message: "Please select a payment method" }),
  }),
  shippingNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
const countries = [
  "United States",
  "Canada", 
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kenya",
  "South Africa",
  "Nigeria",
  "Egypt",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "India",
  "China",
  "Thailand",
  "Malaysia",
  "Philippines",
  "Indonesia",
  "Vietnam",
  "Taiwan",
  "Israel",
  "Turkey",
  "Russia",
  "Poland",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Greece",
  "Portugal",
  "Norway",
  "Sweden",
  "Denmark",
  "Finland",
  "Iceland"
];

export default function Checkout() {
  const { items, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      paymentMethod: "paypal",
      shippingNotes: "",
    },
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      // Validate cart items before submitting
      if (!items || items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Validate all items have required properties
      const invalidItems = items.filter(item => 
        !item.artwork?.id || 
        !item.artwork?.price || 
        !item.quantity || 
        item.quantity <= 0
      );

      if (invalidItems.length > 0) {
        throw new Error("Some cart items are invalid");
      }

      const orderData = {
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.trim().toLowerCase(),
        customerAddress: `${data.address.street.trim()}, ${data.address.city.trim()}, ${data.address.state.trim()}, ${data.address.zipCode.trim()}, ${data.address.country.trim()}`,
        shippingNotes: data.shippingNotes?.trim() || "",
        paymentMethod: data.paymentMethod,
        items: items.map((item) => ({
          artworkId: parseInt(item.artwork.id) || item.artwork.id,
          quantity: parseInt(item.quantity) || item.quantity,
          price: parseFloat(item.artwork.price),
        })),
        totalAmount: getTotalPrice().toString(),
      };

      const accessToken = localStorage.getItem("admin_token");
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }

      if (response.ok) {
        setOrderId(responseData.id);
        toast({
          title: "Order created successfully!",
          description: "Please complete payment to finalize your order.",
        });
      } else {
        const errorMessage = responseData?.message || 
                           responseData?.error || 
                           `Server error: ${response.status} ${response.statusText}`;
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.artwork.price) || 0) * (parseInt(item.quantity) || 0);
    }, 0);
  };

  const handlePaymentSuccess = async (paymentId: string, method: string) => {
    try {
      if (!orderId) {
        throw new Error("No order ID found");
      }

      const accessToken = localStorage.getItem("admin_token");
      if (!accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const paymentData = {
        paymentId: paymentId.trim(),
        paymentMethod: method,
        status: "completed"
      };

      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(paymentData),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast({
          title: "Payment successful!",
          description: "Your order has been confirmed. You will receive an email shortly.",
        });
        clearCart();
        setLocation("/artworks");
      } else {
        throw new Error(responseData?.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Payment update error:", error);
      
      toast({
        title: "Payment Error",
        description: error.message || "Payment processed but order update failed. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/artworks">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artworks
          </Button>
        </Link>

        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Payment Notice */}
        {!orderId && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Secure Payment Processing</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Complete your order details below, then proceed to PayPal to complete your payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input
                        id="customerName"
                        {...form.register("customerName")}
                        className="mt-1"
                      />
                      {form.formState.errors.customerName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email Address</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        {...form.register("customerEmail")}
                        className="mt-1"
                      />
                      {form.formState.errors.customerEmail && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      {...form.register("address.street")}
                      className="mt-1"
                    />
                    {form.formState.errors.address?.street && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.address.street.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...form.register("address.city")}
                        className="mt-1"
                      />
                      {form.formState.errors.address?.city && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.address.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...form.register("address.state")}
                        className="mt-1"
                      />
                      {form.formState.errors.address?.state && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.address.state.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        {...form.register("address.zipCode")}
                        className="mt-1"
                      />
                      {form.formState.errors.address?.zipCode && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.address.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={form.watch("address.country")} 
                      onValueChange={(value) => form.setValue("address.country", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.address?.country && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.address.country.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingNotes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="shippingNotes"
                      {...form.register("shippingNotes")}
                      className="mt-1"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              {!orderId ? (
                <Button
                  type="submit"
                  className="w-full bg-yellow-600 text-white hover:bg-yellow-700 py-4 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Order..." : `Create Order - $${getTotalPrice().toLocaleString()}`}
                </Button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">Order #{orderId} created successfully!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Please complete your payment to finalize your purchase.
                  </p>
                </div>
              )}
            </form>

            {/* Payment Methods Section */}
            {orderId && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Complete Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-4">
                    <PayPalButtonWrapper
                      amount={getTotalPrice().toString()}
                      currency="USD"
                      intent="CAPTURE"
                      onSuccess={(paymentId) => handlePaymentSuccess(paymentId, "paypal")}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.artwork.id} className="flex items-center space-x-4">
                    <img
                      src={item.artwork.imageUrl}
                      alt={item.artwork.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.artwork.title}</p>
                      <p className="text-sm text-gray-500">by {item.artwork.artist.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(parseFloat(item.artwork.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}