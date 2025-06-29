import { useState, useEffect, useCallback, useRef } from "react"; // ADDED useRef
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertArtworkSchema, type Artwork, type Artist } from "@shared/schema";
import AdminSidebar from "@/components/admin-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ImageUpload from "@/components/image-upload";
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2,
  Plus,
  Palette,
  Star,
  Check,
  X,
  GalleryHorizontal,
  Loader2,
  TrendingUp,
  Image,
  RefreshCw,
  Info,
  DollarSign,
  User,
  Ruler,
  Clock,
  Package,
  FileText,
} from "lucide-react";

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

export default function AdminArtworks() {
  const [, setLocation] = useLocation();
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // ADDED: A ref to the main content area that should be made inert
  const mainContentRef = useRef<HTMLDivElement>(null);

  // ADDED: useEffect to apply the 'inert' attribute
  useEffect(() => {
    // Check if the browser supports the `inert` attribute
    if (!('inert' in document.createElement('div'))) {
        console.warn("The 'inert' attribute is not supported by this browser. Consider a polyfill for full accessibility.");
        // Fallback for older browsers: use aria-hidden (which might cause the warning)
        if (mainContentRef.current) {
            mainContentRef.current.setAttribute('aria-hidden', isDialogOpen ? 'true' : 'false');
        }
        return; // Exit if no support
    }
    
    // The main content area to make inert
    const mainContentElement = mainContentRef.current;
    
    // The dialog content element, which should NOT be inert
    // We can get this from the dialog's state, but for simplicity, we'll
    // just make the rest of the page inert.
    
    if (mainContentElement) {
        if (isDialogOpen) {
            // When the dialog opens, make the main content inert
            mainContentElement.inert = true;
        } else {
            // When the dialog closes, remove the inert attribute
            mainContentElement.inert = false;
        }
    }
  }, [isDialogOpen]); // Re-run this effect whenever the dialog's open state changes

  // --- Authentication Check ---
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      console.warn("No admin_token found. Redirecting to login.");
      setLocation("/login");
    }
  }, [setLocation]);

  // --- Authenticated Request Helper ---
  const authenticatedRequest = useCallback(
    async <T,>(method: string, url: string, data?: any): Promise<T | null> => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        console.error("Authentication Error: No admin_token found. Redirecting.");
        setLocation("/login");
        throw new Error("Authentication failed: No token.");
      }

      try {
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
          console.error(`Authentication Error: ${response.status} - Invalid or expired token. Redirecting.`);
          setLocation("/login");
          throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok && response.status !== 304) {
          const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
          throw new Error(errorBody.message || `API request failed with status: ${response.status}`);
        }

        if (response.status === 204 || response.status === 304) {
          return null;
        }

        return (await response.json()) as T;
      } catch (error: any) {
        console.error(`Fetch operation failed for ${method} ${url}:`, error);
        throw error;
      }
    },
    [setLocation]
  );

  // --- React Query: Fetch Artworks ---
  const {
    data: artworks = [],
    isLoading: isLoadingArtworks,
    error: artworksError,
    refetch: refetchArtworks,
  } = useQuery<Artwork[]>({
    queryKey: ["adminArtworks"],
    queryFn: () => authenticatedRequest("GET", "/api/artworks"),
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- React Query: Fetch Artists ---
  const { data: artists = [], isLoading: isLoadingArtists } = useQuery<Artist[]>({
    queryKey: ["adminArtists"],
    queryFn: () => authenticatedRequest("GET", "/api/artists"),
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  // --- Error Handling for Fetching Artworks ---
  useEffect(() => {
    if (artworksError) {
      toast({
        title: "Failed to load artworks",
        description: artworksError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error("Artworks fetch error:", artworksError);
    }
  }, [artworksError, toast]);

  // --- Setup the form with Zod for validation ---
  const artworkFormSchema = insertArtworkSchema.extend({
    artistId: insertArtworkSchema.shape.artistId.transform(String),
  });

  const artworkForm = useForm<ArtworkForm>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: {
      title: "",
      description: "",
      medium: "",
      dimensions: "",
      price: "",
      imageUrl: "",
      category: "painting",
      availability: "available",
      featured: false,
      artistId: "",
    },
  });

  // --- Mutation for creating a new artwork ---
  const createArtworkMutation = useMutation({
    mutationFn: async (data: ArtworkForm) => {
      const payload = {
        ...data,
        artistId: parseInt(data.artistId),
        price: parseFloat(data.price),
      };
      return authenticatedRequest("POST", "/api/artworks", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      artworkForm.reset();
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Artwork created successfully." });
    },
    onError: (error: Error) => {
      console.error("Create artwork error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // --- Mutation for updating an existing artwork ---
  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ArtworkForm> }) => {
      const payload = {
        ...data,
        artistId: data.artistId ? parseInt(data.artistId) : undefined,
        price: data.price ? parseFloat(data.price) : undefined,
      };
      return authenticatedRequest("PUT", `/api/artworks/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      setEditingArtwork(null);
      setIsDialogOpen(false);
      artworkForm.reset();
      toast({ title: "Success", description: "Artwork updated successfully." });
    },
    onError: (error: Error) => {
      console.error("Update artwork error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // --- Mutation for deleting an artwork ---
  const deleteArtworkMutation = useMutation({
    mutationFn: async (id: number) => {
      return authenticatedRequest("DELETE", `/api/artworks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      toast({ title: "Success", description: "Artwork deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // --- Function to handle editing an artwork ---
  const handleEditArtwork = useCallback((artwork: Artwork) => {
    setEditingArtwork(artwork);
    artworkForm.reset({
      title: artwork.title,
      description: artwork.description,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      price: artwork.price.toString(),
      imageUrl: artwork.imageUrl,
      category: artwork.category,
      availability: artwork.availability,
      featured: artwork.featured || false,
      artistId: artwork.artistId.toString(),
    });
    setIsDialogOpen(true);
  }, [artworkForm]);

  // --- Handle form submission for both create and update ---
  const onSubmitArtwork = (data: ArtworkForm) => {
    if (editingArtwork) {
      updateArtworkMutation.mutate({ id: editingArtwork.id, data });
    } else {
      createArtworkMutation.mutate(data);
    }
  };

  // --- Function to open the dialog for a new artwork ---
  const handleNewArtwork = useCallback(() => {
    setEditingArtwork(null);
    artworkForm.reset();
    setIsDialogOpen(true);
  }, [artworkForm]);

  // --- Calculate artwork statistics ---
  const artworkStats = {
    total: artworks.length,
    available: artworks.filter((a) => a.availability === "available").length,
    featured: artworks.filter((a) => a.featured).length,
    totalValue: artworks.reduce((sum, a) => sum + parseFloat(a.price || "0"), 0),
  };

  // --- Helper to get availability badge styling ---
  const getAvailabilityBadge = useCallback((availability: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      available: { label: "Available", className: "bg-green-100 text-green-800", icon: <Check className="w-3 h-3" /> },
      sold: { label: "Sold", className: "bg-red-100 text-red-800", icon: <X className="w-3 h-3" /> },
      reserved: { label: "Reserved", className: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
    };
    const { label, className, icon } = statusMap[availability] || { label: availability, className: "bg-gray-100 text-gray-800", icon: null };
    return (
      <Badge className={`font-semibold capitalize px-3 py-1 text-xs rounded-full gap-1 ${className}`}>
        {icon}
        {label}
      </Badge>
    );
  }, []);

  // --- Pagination logic using the custom hook ---
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedArtworks,
    goToPage,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    startItem,
    endItem,
    totalItems,
  } = usePagination({ data: artworks, itemsPerPage: 10 });

  // --- Rendered Component ---
  return (
    <AdminSidebar>
      {/* ADDED: Attach the ref to the main content div */}
      <div ref={mainContentRef} className="flex-1 overflow-auto bg-gray-50">
        {/* Header Section */}
        <header className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <SidebarTrigger />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <GalleryHorizontal className="w-6 h-6 text-primary" />
              Artworks Management
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  refetchArtworks();
                  toast({ title: "Refreshing...", description: "Fetching the latest artworks from the server." });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh List
              </Button>
              {/* The Dialog is here. It will not be made inert. */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewArtwork} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Artwork
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-xl"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <DialogHeader className="pb-4 border-b border-gray-200 mb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <Image className="w-6 h-6 text-primary" />
                      {editingArtwork ? "Edit Artwork" : "Add New Artwork"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingArtwork ? "Update the details of the selected artwork." : "Fill in the details to add a new artwork to the gallery."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...artworkForm}>
                    <form onSubmit={artworkForm.handleSubmit(onSubmitArtwork)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={artworkForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <Palette className="w-4 h-4 text-gray-500" /> Title
                              </FormLabel>
                              <FormControl><Input placeholder="Enter artwork title" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={artworkForm.control}
                          name="artistId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <User className="w-4 h-4 text-gray-500" /> Artist
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Select an artist" /></SelectTrigger>
                                </FormControl>
                                <SelectContent side="bottom" sideOffset={8} position="popper" className="z-[9999]">
                                  {isLoadingArtists ? (
                                    <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-gray-500" /></div>
                                  ) : (artists && artists.length > 0 ? artists.map((artist: Artist) => (
                                    <SelectItem key={artist.id} value={artist.id.toString()}>{artist.name}</SelectItem>
                                  )) : (
                                    <SelectItem value="" disabled>No artists available. Create an artist first.</SelectItem>
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
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <Image className="w-4 h-4 text-gray-500" /> Medium
                              </FormLabel>
                              <FormControl><Input placeholder="e.g., Oil on Canvas" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={artworkForm.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <Ruler className="w-4 h-4 text-gray-500" /> Dimensions
                              </FormLabel>
                              <FormControl><Input placeholder="e.g., 24 x 36 inches" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={artworkForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <DollarSign className="w-4 h-4 text-gray-500" /> Price ($)
                              </FormLabel>
                              <FormControl><Input placeholder="e.g., 5000" type="number" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={artworkForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <GalleryHorizontal className="w-4 h-4 text-gray-500" /> Category
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                <SelectContent side="bottom" sideOffset={8} position="popper" className="z-[9999]">
                                  {["painting", "sculpture", "photography", "digital", "mixed-media", "drawing", "printmaking", "ceramics", "textiles", "installation"].map(cat => (
                                    <SelectItem key={cat} value={cat} className="capitalize">{cat.replace('-', ' ')}</SelectItem>
                                  ))}
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
                              <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                                <Package className="w-4 h-4 text-gray-500" /> Availability
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger></FormControl>
                                <SelectContent side="bottom" sideOffset={8} position="popper" className="z-[9999]">
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
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 rounded-md border shadow-sm">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base flex items-center gap-2">
                                  <Star className="w-5 h-5 text-yellow-500" /> Featured Artwork
                                </FormLabel>
                                <p className="text-sm text-gray-500">Check this box to feature this artwork on the homepage.</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={artworkForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                              <Image className="w-4 h-4 text-gray-500" /> Image
                            </FormLabel>
                            <FormControl><ImageUpload onImageSelect={field.onChange} currentImage={field.value} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                              <FileText className="w-4 h-4 text-gray-500" /> Description
                            </FormLabel>
                            <FormControl><Textarea placeholder="Enter a detailed description of the artwork..." className="min-h-[120px]" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createArtworkMutation.isPending || updateArtworkMutation.isPending}>
                          {(createArtworkMutation.isPending || updateArtworkMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingArtwork ? "Update Artwork" : "Create Artwork"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {/* Artwork Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-lg shadow-md border-l-4 border-blue-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Artworks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{artworkStats.total}</p>
                </div>
                <Palette className="w-10 h-10 text-blue-500 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-green-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Available</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{artworkStats.available}</p>
                </div>
                <Check className="w-10 h-10 text-green-600 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-yellow-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Featured</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{artworkStats.featured}</p>
                </div>
                <Star className="w-10 h-10 text-yellow-500 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-purple-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">
                    ${artworkStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
              </CardContent>
            </Card>
          </div>

          {/* Artworks Table */}
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <GalleryHorizontal className="w-6 h-6 text-blue-600" />
                Artwork Collection <span className="text-gray-500 text-lg">({totalItems})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingArtworks ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                  <p>Loading artworks...</p>
                </div>
              ) : artworksError ? (
                <div className="flex flex-col items-center justify-center py-12 text-red-600">
                  <Info className="h-10 w-10 mb-4" />
                  <p>Error: {artworksError.message}</p>
                  <p className="text-sm text-gray-500 mt-2">Could not load artworks. Please check your connection or try again.</p>
                </div>
              ) : paginatedArtworks && paginatedArtworks.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[100px] text-gray-600 font-semibold text-sm">Image</TableHead>
                        <TableHead className="text-gray-600 font-semibold text-sm">Artwork</TableHead>
                        <TableHead className="text-gray-600 font-semibold text-sm">Artist</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-600 font-semibold text-sm">Category</TableHead>
                        <TableHead className="hidden sm:table-cell text-gray-600 font-semibold text-sm">Price</TableHead>
                        <TableHead className="w-[150px] text-gray-600 font-semibold text-sm">Status</TableHead>
                        <TableHead className="w-[80px] text-right text-gray-600 font-semibold text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedArtworks.map((artwork: Artwork) => (
                        <TableRow key={artwork.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <TableCell>
                            <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden border border-gray-200">
                              {artwork.imageUrl ? (
                                <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <Image className="w-6 h-6" />
                                </div>
                              )}
                              {artwork.featured && (
                                <div className="absolute top-1 right-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /></div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-[250px]">
                            <div className="flex flex-col gap-1">
                              <div className="font-semibold text-gray-900 line-clamp-2">{artwork.title}</div>
                              <div className="text-sm text-gray-500">{artwork.medium}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {artists.find(a => a.id === artwork.artistId)?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="capitalize hidden md:table-cell">
                            <Badge variant="secondary">{artwork.category.replace('-', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800 hidden sm:table-cell">
                            ${parseFloat(artwork.price || "0").toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getAvailabilityBadge(artwork.availability)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditArtwork(artwork)}
                                className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 p-2"
                                aria-label="Edit Artwork"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 p-2"
                                onClick={() => deleteArtworkMutation.mutate(artwork.id)}
                                disabled={deleteArtworkMutation.isPending}
                                aria-label="Delete Artwork"
                              >
                                {deleteArtworkMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Palette className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-800">No Artworks Found</h3>
                    <p className="mt-2 text-sm">
                      Get started by adding your first artwork to the gallery.
                    </p>
                    <Button onClick={handleNewArtwork} className="mt-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Artwork
                    </Button>
                  </div>
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{startItem}</span> to <span className="font-semibold">{endItem}</span> of <span className="font-semibold">{totalItems}</span> artworks
                  </div>
                  <Pagination>
                    <PaginationContent className="flex items-center space-x-2">
                      <PaginationItem>
                        <PaginationPrevious onClick={previousPage} className={hasPrevious ? "cursor-pointer text-blue-600 hover:bg-blue-50" : "cursor-not-allowed opacity-50 text-gray-400"} />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink onClick={() => goToPage(page)} isActive={currentPage === page} className={`cursor-pointer px-3 py-1 rounded-md transition-colors duration-200 ${currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext onClick={nextPage} className={hasNext ? "cursor-pointer text-blue-600 hover:bg-blue-50" : "cursor-not-allowed opacity-50 text-gray-400"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}