import { useArtistAuth } from "@/hooks/useArtistAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { User, Mail, Palette, Edit } from "lucide-react";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";

export default function ArtistProfile() {
  const { artist, user, isLoading: authLoading, isAuthenticated } = useArtistAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/artist/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
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
            subtitle="Manage your artist information and settings"
          />
          
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Artist Name</label>
                        <Input value={artist?.name || ''} readOnly className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Specialty</label>
                        <Input value={artist?.specialty || ''} readOnly className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Featured Artist</label>
                        <Input value={artist?.featured ? 'Yes' : 'No'} readOnly className="mt-1" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input value={user?.email || ''} readOnly className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <Input value={user?.username || ''} readOnly className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Member Since</label>
                        <Input 
                          value={artist?.createdAt ? new Date(artist.createdAt).toLocaleDateString() : ''} 
                          readOnly 
                          className="mt-1" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700">Biography</label>
                    <Textarea 
                      value={artist?.bio || ''} 
                      readOnly 
                      className="mt-1 min-h-[120px]" 
                    />
                  </div>
                  
                  {artist?.imageUrl && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-700">Profile Image</label>
                      <div className="mt-2">
                        <img 
                          src={artist.imageUrl} 
                          alt={artist.name}
                          className="w-32 h-32 rounded-lg object-cover border"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Contact support to update your profile information
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications about orders and updates</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-gray-500">Change your account password</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>
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