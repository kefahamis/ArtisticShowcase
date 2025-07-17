import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useArtistAuth } from "@/hooks/useArtistAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { User, Edit, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";

// Form schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  specialty: z.string().min(2, "Specialty must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ArtistProfile() {
  const { artist, user, isLoading: authLoading, isAuthenticated } = useArtistAuth();
  const [, setLocation] = useLocation();
  const [editingProfile, setEditingProfile] = useState(false);
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/artist/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: artist?.name || '',
      bio: artist?.bio || '',
      specialty: artist?.specialty || '',
      phone: user?.phone || '',
    }
  });

  // Update form values when artist data changes
  useEffect(() => {
    if (artist && user) {
      profileForm.reset({
        name: artist.name || '',
        bio: artist.bio || '',
        specialty: artist.specialty || '',
        phone: user.phone || '',
      });
    }
  }, [artist, user, profileForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artists/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/artists/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  // Handle profile submission
  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <ArtistSidebar />
        
        <div className="flex-1 flex flex-col">
          <ArtistHeader 
            title="Artist Profile" 
            subtitle="Manage your artist information and profile details"
          />
          
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  {!editingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {editingProfile ? (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Artist Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="specialty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specialty</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Optional" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input value={user?.email || ''} readOnly className="mt-1 bg-gray-50" />
                          </div>
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Biography</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="min-h-[120px]" placeholder="Tell us about your artistic journey, style, and inspirations..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditingProfile(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Artist Name</label>
                            <Input value={artist?.name || ''} readOnly className="mt-1 bg-gray-50" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Specialty</label>
                            <Input value={artist?.specialty || ''} readOnly className="mt-1 bg-gray-50" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <Input value={user?.phone || 'Not provided'} readOnly className="mt-1 bg-gray-50" />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input value={user?.email || ''} readOnly className="mt-1 bg-gray-50" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Username</label>
                            <Input value={user?.username || ''} readOnly className="mt-1 bg-gray-50" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Member Since</label>
                            <Input 
                              value={artist?.createdAt ? new Date(artist.createdAt).toLocaleDateString() : ''} 
                              readOnly 
                              className="mt-1 bg-gray-50" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Biography</label>
                        <Textarea 
                          value={artist?.bio || ''} 
                          readOnly 
                          className="mt-1 min-h-[120px] bg-gray-50" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant={artist?.featured ? "default" : "secondary"}>
                          {artist?.featured ? 'Featured Artist' : 'Regular Artist'}
                        </Badge>
                        <Badge variant={artist?.approved ? "default" : "destructive"}>
                          {artist?.approved ? 'Approved' : 'Pending Approval'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Profile Settings Link */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Account Settings</h3>
                      <p className="text-sm text-gray-500">Manage your notification preferences, security settings, and more.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/artist/settings")}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Manage Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}