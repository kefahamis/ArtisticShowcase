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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Palette, Star, Check, X } from "lucide-react";

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

  const { data: artworks = [], isLoading: loadingArtworks } = useQuery({
    queryKey: ["/api/artworks"],
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  // Artwork form  
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
      category: "",
      availability: "available",
      featured: false,
      artistId: "",
    },
  });

  // Artwork mutations
  const createArtworkMutation = useMutation({
    mutationFn: async (data: ArtworkForm) => {
      const payload = {
        ...data,
        artistId: parseInt(data.artistId),
        price: data.price.toString(),
      };
      console.log("Creating artwork with payload:", payload);
      return authenticatedRequest("POST", "/api/artworks", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      artworkForm.reset();
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Artwork created successfully" });
    },
    onError: (error: any) => {
      console.error("Create artwork error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ArtworkForm> }) => {
      const payload = {
        ...data,
        artistId: data.artistId ? parseInt(data.artistId) : undefined,
        price: data.price ? data.price.toString() : undefined,
      };
      console.log("Updating artwork with payload:", payload);
      return authenticatedRequest("PUT", `/api/artworks/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      setEditingArtwork(null);
      setIsDialogOpen(false);
      artworkForm.reset();
      toast({ title: "Success", description: "Artwork updated successfully" });
    },
    onError: (error: any) => {
      console.error("Update artwork error:", error);
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

  const editArtwork = (artwork: any) => {
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
    setIsDialogOpen(true);
  };

  const onSubmitArtwork = (data: ArtworkForm) => {
    if (editingArtwork) {
      updateArtworkMutation.mutate({ id: editingArtwork.id, data });
    } else {
      createArtworkMutation.mutate(data);
    }
  };

  const handleNewArtwork = () => {
    setEditingArtwork(null);
    artworkForm.reset();
    setIsDialogOpen(true);
  };

  // Pagination
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

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Artworks</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewArtwork} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Artwork
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingArtwork ? "Edit Artwork" : "Add New Artwork"}
                  </DialogTitle>
                </DialogHeader>
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
                              <SelectContent 
                                className="z-[9999]"
                                side="bottom"
                                sideOffset={4}
                              >
                                {artists && artists.length > 0 ? artists.map((artist: Artist) => (
                                  <SelectItem key={artist.id} value={artist.id.toString()}>
                                    {artist.name}
                                  </SelectItem>
                                )) : (
                                  <SelectItem value="no-artists" disabled>
                                    No artists available. Create an artist first.
                                  </SelectItem>
                                )}
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
                              <SelectContent 
                                className="z-[9999]"
                                side="bottom"
                                sideOffset={4}
                              >
                                <SelectItem value="painting">Painting</SelectItem>
                                <SelectItem value="sculpture">Sculpture</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="digital">Digital Art</SelectItem>
                                <SelectItem value="mixed-media">Mixed Media</SelectItem>
                                <SelectItem value="drawing">Drawing</SelectItem>
                                <SelectItem value="printmaking">Printmaking</SelectItem>
                                <SelectItem value="ceramics">Ceramics</SelectItem>
                                <SelectItem value="textiles">Textiles</SelectItem>
                                <SelectItem value="installation">Installation</SelectItem>
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
                              <SelectContent 
                                className="z-[9999]"
                                side="bottom"
                                sideOffset={4}
                              >
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
                            <ImageUpload
                              onImageSelect={field.onChange}
                              currentImage={field.value}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter artwork description..."
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
                              <p className="text-sm text-gray-600">
                                Display this artwork prominently on the homepage
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createArtworkMutation.isPending || updateArtworkMutation.isPending}
                      >
                        {editingArtwork ? "Update Artwork" : "Create Artwork"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Artworks ({Array.isArray(artworks) ? artworks.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingArtworks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedArtworks.map((artwork: any) => (
                      <TableRow key={artwork.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {artwork.imageUrl && (
                              <img 
                                src={artwork.imageUrl} 
                                alt={artwork.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{artwork.title}</div>
                              {artwork.featured && (
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit mt-1">
                                  <Star className="w-3 h-3" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{artwork.artist?.name || "Unknown Artist"}</TableCell>
                        <TableCell>{artwork.price}</TableCell>
                        <TableCell className="capitalize">{artwork.category}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={artwork.availability === 'available' ? 'default' : 
                                   artwork.availability === 'sold' ? 'destructive' : 'secondary'}
                            className="flex items-center gap-1 w-fit"
                          >
                            {artwork.availability === 'available' && <Check className="w-3 h-3" />}
                            {artwork.availability === 'sold' && <X className="w-3 h-3" />}
                            {artwork.availability.charAt(0).toUpperCase() + artwork.availability.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editArtwork(artwork)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteArtworkMutation.mutate(artwork.id)}
                              disabled={deleteArtworkMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {Array.isArray(artworks) && artworks.length === 0 && !loadingArtworks && (
                <div className="text-center py-8 text-gray-500">
                  No artworks found. Create your first artwork to get started.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {totalItems} artworks
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={previousPage}
                          className={hasPrevious ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={nextPage}
                          className={hasNext ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                        />
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