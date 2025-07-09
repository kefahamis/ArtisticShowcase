import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertArtworkSchema, insertArtistSchema, type Artwork, type Artist } from "@shared/schema-old";
import { Pencil, Trash2, Plus, Save, X, LogOut, Shield, TrendingUp, Users, Palette, Eye } from "lucide-react";

interface ArtworkForm {
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  price: string;
  imageUrl: string;
  category: string;
  availability: string;
  featured: boolean;
  artistId: string;
}

interface ArtistForm {
  name: string;
  bio: string;
  specialty: string;
  imageUrl: string;
  featured: boolean;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Helper to make authenticated requests
  const authenticatedRequest = async (method: string, url: string, data?: any) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("admin_token");
      setLocation("/login");
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.status === 204 ? null : response.json();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  const { data: artworks = [], isLoading: loadingArtworks } = useQuery({
    queryKey: ["/api/artworks"],
  });

  const { data: artists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ["/api/artists"],
  });

  // Calculate statistics
  const stats = {
    totalArtworks: artworks.length,
    availableArtworks: artworks.filter((a: any) => a.availability === 'available').length,
    featuredArtworks: artworks.filter((a: any) => a.featured).length,
    totalArtists: artists.length,
    featuredArtists: artists.filter((a: Artist) => a.featured).length,
  };

  // Artwork form
  const artworkForm = useForm<ArtworkForm>({
    resolver: zodResolver(insertArtworkSchema.extend({
      artistId: insertArtworkSchema.shape.artistId.transform(String),
    })),
    defaultValues: {
      title: "",
      description: "",
      medium: "",
      dimensions: "",
      price: "",
      imageUrl: "",
      category: "",
      availability: "available",
      featured: false,
      artistId: "",
    },
  });

  // Artist form
  const artistForm = useForm<ArtistForm>({
    resolver: zodResolver(insertArtistSchema),
    defaultValues: {
      name: "",
      bio: "",
      specialty: "",
      imageUrl: "",
      featured: false,
    },
  });

  // Artwork mutations
  const createArtworkMutation = useMutation({
    mutationFn: async (data: ArtworkForm) => {
      return authenticatedRequest("POST", "/api/artworks", {
        ...data,
        artistId: parseInt(data.artistId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      artworkForm.reset();
      toast({ title: "Success", description: "Artwork created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ArtworkForm> }) => {
      return authenticatedRequest("PUT", `/api/artworks/${id}`, {
        ...data,
        artistId: data.artistId ? parseInt(data.artistId) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      setEditingArtwork(null);
      artworkForm.reset();
      toast({ title: "Success", description: "Artwork updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteArtworkMutation = useMutation({
    mutationFn: async (id: number) => {
      return authenticatedRequest("DELETE", `/api/artworks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      toast({ title: "Success", description: "Artwork deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Artist mutations
  const createArtistMutation = useMutation({
    mutationFn: async (data: ArtistForm) => {
      return authenticatedRequest("POST", "/api/artists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      artistForm.reset();
      toast({ title: "Success", description: "Artist created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateArtistMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ArtistForm> }) => {
      return authenticatedRequest("PUT", `/api/artists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      setEditingArtist(null);
      artistForm.reset();
      toast({ title: "Success", description: "Artist updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteArtistMutation = useMutation({
    mutationFn: async (id: number) => {
      return authenticatedRequest("DELETE", `/api/artists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({ title: "Success", description: "Artist deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const editArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    artworkForm.reset({
      title: artwork.title,
      description: artwork.description,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      price: artwork.price,
      imageUrl: artwork.imageUrl,
      category: artwork.category,
      availability: artwork.availability,
      featured: artwork.featured || false,
      artistId: artwork.artistId.toString(),
    });
  };

  const editArtist = (artist: Artist) => {
    setEditingArtist(artist);
    artistForm.reset({
      name: artist.name,
      bio: artist.bio,
      specialty: artist.specialty,
      imageUrl: artist.imageUrl || "",
      featured: artist.featured || false,
    });
  };

  const onSubmitArtwork = (data: ArtworkForm) => {
    if (editingArtwork) {
      updateArtworkMutation.mutate({ id: editingArtwork.id, data });
    } else {
      createArtworkMutation.mutate(data);
    }
  };

  const onSubmitArtist = (data: ArtistForm) => {
    if (editingArtist) {
      updateArtistMutation.mutate({ id: editingArtist.id, data });
    } else {
      createArtistMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-gray-700" />
              <h1 className="text-4xl font-serif font-light">Gallery Administration</h1>
            </div>
            <p className="text-gray-600">Manage artists, artworks, and gallery content</p>
          </div>
          
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artworks</p>
                  <p className="text-2xl font-bold">{stats.totalArtworks}</p>
                </div>
                <Palette className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.availableArtworks}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.featuredArtworks}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Artists</p>
                  <p className="text-2xl font-bold">{stats.totalArtists}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingArtwork ? "Edit Artwork" : "Add New Artwork"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...artworkForm}>
                  <form onSubmit={artworkForm.handleSubmit(onSubmitArtwork)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={artworkForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter artwork title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="artistId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artist</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an artist" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {artists.map((artist: Artist) => (
                                  <SelectItem key={artist.id} value={artist.id.toString()}>
                                    {artist.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="medium"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medium</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Oil on Canvas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="dimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensions</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 24 x 36 inches" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., $5,000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="painting">Painting</SelectItem>
                                <SelectItem value="sculpture">Sculpture</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="mixed-media">Mixed Media</SelectItem>
                                <SelectItem value="digital">Digital Art</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select availability" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={artworkForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter artwork description"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={artworkForm.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Artwork</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createArtworkMutation.isPending || updateArtworkMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingArtwork ? "Update Artwork" : "Create Artwork"}
                      </Button>
                      {editingArtwork && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingArtwork(null);
                            artworkForm.reset();
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingArtworks ? (
                  <p>Loading artworks...</p>
                ) : (
                  <div className="space-y-4">
                    {artworks.map((artwork: any) => (
                      <div key={artwork.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium">{artwork.title}</h3>
                            <p className="text-sm text-gray-600">{artwork.artist?.name}</p>
                            <p className="text-sm font-medium text-green-600">{artwork.price}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={artwork.availability === "available" ? "default" : "secondary"}>
                                {artwork.availability}
                              </Badge>
                              {artwork.featured && <Badge variant="outline">Featured</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editArtwork(artwork)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteArtworkMutation.mutate(artwork.id)}
                            disabled={deleteArtworkMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingArtist ? "Edit Artist" : "Add New Artist"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...artistForm}>
                  <form onSubmit={artistForm.handleSubmit(onSubmitArtist)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={artistForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter artist name" {...field} />
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
                            <FormLabel>Specialty</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Contemporary Painting" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artistForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={artistForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biography</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter artist biography"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={artistForm.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Artist</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createArtistMutation.isPending || updateArtistMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingArtist ? "Update Artist" : "Create Artist"}
                      </Button>
                      {editingArtist && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingArtist(null);
                            artistForm.reset();
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Artists</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingArtists ? (
                  <p>Loading artists...</p>
                ) : (
                  <div className="space-y-4">
                    {artists.map((artist: Artist) => (
                      <div key={artist.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={artist.imageUrl || "/placeholder-artist.jpg"}
                            alt={artist.name}
                            className="w-16 h-16 object-cover rounded-full"
                          />
                          <div>
                            <h3 className="font-medium">{artist.name}</h3>
                            <p className="text-sm text-gray-600">{artist.specialty}</p>
                            {artist.featured && <Badge variant="outline" className="mt-1">Featured</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editArtist(artist)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteArtistMutation.mutate(artist.id)}
                            disabled={deleteArtistMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}