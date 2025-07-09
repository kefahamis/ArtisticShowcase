import { useState, useEffect } from "react";
import { useArtistAuth } from "@/hooks/useArtistAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, Plus, Edit, Trash2, Eye, Search, Filter,
  Grid, List, SortAsc, SortDesc
} from "lucide-react";
import { useLocation } from "wouter";
import { insertArtworkSchema } from "@shared/schema";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";

type ArtworkForm = z.infer<typeof insertArtworkSchema>;

export default function ArtistArtworks() {
  const { artist, isLoading: authLoading, isAuthenticated } = useArtistAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [artworkDialogOpen, setArtworkDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Artist not authenticated, redirecting to login');
      setLocation("/artist/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Artwork form
  const artworkForm = useForm<ArtworkForm>({
    resolver: zodResolver(insertArtworkSchema.omit({ artistId: true })),
    defaultValues: {
      title: "",
      description: "",
      medium: "",
      dimensions: "",
      price: "0",
      imageUrl: "",
      category: "",
      availability: "available",
      featured: false,
    },
  });

  // Fetch artist's artworks
  const { data: artworks = [], isLoading: artworksLoading } = useQuery({
    queryKey: ["/api/artists/artworks"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/artworks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch artworks');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Create artwork mutation
  const createArtworkMutation = useMutation({
    mutationFn: async (data: ArtworkForm) => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists/artworks"] });
      setArtworkDialogOpen(false);
      artworkForm.reset();
      toast({
        title: "Success",
        description: "Artwork created successfully",
      });
    },
  });

  // Update artwork mutation
  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArtworkForm }) => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch(`/api/artists/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists/artworks"] });
      setArtworkDialogOpen(false);
      setEditingArtwork(null);
      artworkForm.reset();
      toast({
        title: "Success",
        description: "Artwork updated successfully",
      });
    },
  });

  // Delete artwork mutation
  const deleteArtworkMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch(`/api/artists/artworks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to delete artwork');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists/artworks"] });
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });
    },
  });

  const onSubmitArtwork = (data: ArtworkForm) => {
    if (editingArtwork) {
      updateArtworkMutation.mutate({ id: editingArtwork.id, data });
    } else {
      createArtworkMutation.mutate(data);
    }
  };

  const handleEditArtwork = (artwork: any) => {
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
      featured: artwork.featured,
    });
    setArtworkDialogOpen(true);
  };

  const handleNewArtwork = () => {
    setEditingArtwork(null);
    artworkForm.reset();
    setArtworkDialogOpen(true);
  };

  // Filter and sort artworks
  const filteredAndSortedArtworks = artworks
    .filter((artwork: any) => 
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.medium.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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
            title="My Artworks" 
            subtitle={`${artworks.length} artworks in your collection`}
            actions={
              <Button onClick={handleNewArtwork}>
                <Plus className="w-4 h-4 mr-2" />
                Add Artwork
              </Button>
            }
          />

          <main className="flex-1 p-6">
            {/* Filters and Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search artworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Artworks Display */}
            {artworksLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAndSortedArtworks.length === 0 ? (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No artworks found' : 'No artworks yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first artwork to get started'}
                </p>
                <Button onClick={handleNewArtwork}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Artwork
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedArtworks.map((artwork: any) => (
                  <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 truncate">{artwork.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-lg text-green-600">${artwork.price}</span>
                        <Badge variant={artwork.availability === 'available' ? 'default' : 'secondary'}>
                          {artwork.availability}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditArtwork(artwork)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteArtworkMutation.mutate(artwork.id)}
                          disabled={deleteArtworkMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedArtworks.map((artwork: any) => (
                  <Card key={artwork.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={artwork.imageUrl} 
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-xl text-gray-900 mb-1">{artwork.title}</h3>
                              <p className="text-gray-600 mb-2">{artwork.medium} • {artwork.dimensions}</p>
                              <p className="text-gray-500 text-sm line-clamp-2">{artwork.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-bold text-xl text-green-600 mb-2">${artwork.price}</div>
                              <Badge variant={artwork.availability === 'available' ? 'default' : 'secondary'}>
                                {artwork.availability}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleEditArtwork(artwork)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deleteArtworkMutation.mutate(artwork.id)}
                              disabled={deleteArtworkMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                            <div className="text-xs text-gray-500 ml-auto">
                              Created {new Date(artwork.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Artwork Dialog - Same as in dashboard */}
      <Dialog open={artworkDialogOpen} onOpenChange={setArtworkDialogOpen}>
        <DialogContent className="z-[100] max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
            </DialogTitle>
          </DialogHeader>

          <Form {...artworkForm}>
            <form onSubmit={artworkForm.handleSubmit(onSubmitArtwork)} className="space-y-4">
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
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
                          <SelectItem value="drawing">Drawing</SelectItem>
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
              </div>

              <FormField
                control={artworkForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your artwork..." 
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={artworkForm.watch('featured')}
                    onChange={(e) => artworkForm.setValue('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Feature this artwork
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setArtworkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createArtworkMutation.isPending || updateArtworkMutation.isPending}>
                    {createArtworkMutation.isPending || updateArtworkMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {editingArtwork ? 'Update' : 'Create'} Artwork
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}