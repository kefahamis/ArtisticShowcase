import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Palette, User, Mail, Lock, FileText, Star } from "lucide-react";
import { Link, useLocation } from "wouter";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const artistSchema = z.object({
  name: z.string().min(2, "Artist name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  specialty: z.string().min(2, "Specialty is required"),
  imageUrl: z.string()
    .transform(val => val === "" ? undefined : val)
    .pipe(z.string().url().optional()),
});

type UserForm = z.infer<typeof userSchema>;
type ArtistForm = z.infer<typeof artistSchema>;

export default function ArtistRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const artistForm = useForm<ArtistForm>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: "",
      bio: "",
      specialty: "",
      imageUrl: "",
    },
  });

  const onSubmit = async () => {
    const userData = userForm.getValues();
    const artistData = artistForm.getValues();

    // Validate both forms
    const userValidation = await userForm.trigger();
    const artistValidation = await artistForm.trigger();

    if (!userValidation || !artistValidation) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/artists/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            username: userData.username,
            email: userData.email,
            password: userData.password,
          },
          artist: artistData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the artist token
        localStorage.setItem("artist_token", data.token);
        
        toast({
          title: "Registration Successful",
          description: "Welcome to the artist community!",
        });

        // Redirect to artist dashboard
        setLocation("/artist/dashboard");
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Artist Community</h1>
          <p className="text-xl text-gray-600">
            Share your art with the world and connect with art enthusiasts
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Palette className="w-8 h-8" />
              Artist Registration
            </CardTitle>
            <CardDescription className="text-blue-100">
              Create your artist profile and start showcasing your work
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Account Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Account Information
                </div>
                
                <Form {...userForm}>
                  <div className="space-y-4">
                    <FormField
                      control={userForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a unique username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a secure password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>

              {/* Artist Profile Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Artist Profile
                </div>
                
                <Form {...artistForm}>
                  <div className="space-y-4">
                    <FormField
                      control={artistForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Artist Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your professional artist name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={artistForm.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Specialty
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Oil Painting, Digital Art, Sculpture" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={artistForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Profile Image URL (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/your-photo.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={artistForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Artist Biography
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your artistic journey, style, and inspiration..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Button 
                onClick={onSubmit}
                disabled={isLoading}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? "Creating Account..." : "Register as Artist"}
              </Button>

              <div className="text-center text-gray-600">
                Already have an artist account?{" "}
                <Link href="/artist/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}