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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, Plus, Edit, Trash2, Eye, Upload, FileImage, 
  DollarSign, ShoppingCart, Home
} from "lucide-react";
import { useLocation } from "wouter";
import { insertArtworkSchema } from "@shared/schema";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";

type ArtworkForm = z.infer<typeof insertArtworkSchema>;

export default function ArtistDashboard() {
  const { artist, user, isLoading: authLoading, isAuthenticated, logout } = useArtistAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [artworkDialogOpen, setArtworkDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

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

  // Fetch artist's orders
  const { data: artistOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/artists/orders"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch media files
  const { data: mediaFiles = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/artists/media"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/media', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch media');
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create artwork",
        variant: "destructive",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update artwork",
        variant: "destructive",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete artwork",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', `Media upload for ${artist?.name}`);

    try {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      queryClient.invalidateQueries({ queryKey: ["/api/artists/media"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/artist/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Calculate statistics
  const stats = {
    totalArtworks: artworks.length,
    availableArtworks: artworks.filter((a: any) => a.availability === 'available').length,
    soldArtworks: artworks.filter((a: any) => a.availability === 'sold').length,
    totalRevenue: artistOrders.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || order.total || '0'), 0),
    pendingOrders: artistOrders.filter((o: any) => o.status === 'pending').length,
    completedOrders: artistOrders.filter((o: any) => o.status === 'completed').length,
    totalOrders: artistOrders.length,
  };

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
      {/* Layout with Sidebar */}
      <div className="flex">
        <ArtistSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ArtistHeader 
            title="Dashboard" 
            subtitle={`Welcome back, ${artist?.name || 'Artist'}!`}
            actions={
              <div className="flex items-center space-x-2">
                <Button onClick={handleNewArtwork} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Artwork
                </Button>
                <Button variant="outline" onClick={() => setLocation("/")} size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Gallery
                </Button>
              </div>
            }
          />
          
          {/* Dashboard Content */}
          <main className="flex-1 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalArtworks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.availableArtworks} available, {stats.soldArtworks} sold
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {stats.completedOrders} completed orders
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{artistOrders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingOrders} pending
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Media Files</CardTitle>
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.mediaFiles}</div>
                  <p className="text-xs text-muted-foreground">
                    Images and documents
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Artworks */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Artworks</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleNewArtwork}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </CardHeader>
                <CardContent>
                  {artworksLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : artworks.length === 0 ? (
                    <div className="text-center py-8">
                      <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
                      <p className="text-gray-500 mb-4">Create your first artwork to get started</p>
                      <Button onClick={handleNewArtwork}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Artwork
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {artworks.slice(0, 5).map((artwork: any) => (
                        <div key={artwork.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                            <img 
                              src={artwork.imageUrl} 
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{artwork.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{artwork.medium}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium text-green-600">${artwork.price}</span>
                              <Badge variant={artwork.availability === 'available' ? 'default' : 'secondary'} className="text-xs">
                                {artwork.availability}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditArtwork(artwork)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteArtworkMutation.mutate(artwork.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={handleNewArtwork}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Artwork
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('media-upload')?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Gallery
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Artist Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {artist?.name?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{artist?.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{artist?.specialty}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {artist?.bio || 'No bio available'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : artistOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Orders for your artworks will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artistOrders.slice(0, 5).map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.items?.length || 0} items</TableCell>
                          <TableCell>${order.total}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Hidden file input for media upload */}
      <input
        type="file"
        id="media-upload"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,video/*,.pdf"
      />

      {/* Artwork Dialog */}
      <Dialog open={artworkDialogOpen} onOpenChange={setArtworkDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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