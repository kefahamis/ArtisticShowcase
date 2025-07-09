import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertArtistSchema, type Artist } from "@shared/schema-old";
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
  User,
  Star,
  Loader2,
  RefreshCw,
  Info,
  Award,
  Book,
  Image,
  Palette,
  Search,
  Bell,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ArtistForm {
  name: string;
  bio: string;
  specialty: string;
  imageUrl: string;
  featured: boolean;
}

export default function AdminArtists() {
  const [, setLocation] = useLocation();
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // ADDED: Refs for the main content area and the dialog content
  const mainContentRef = useRef<HTMLDivElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // ADDED: useEffect to apply the `inert` attribute when the dialog opens
  // This is good practice for accessibility, even if not strictly needed here.
  useEffect(() => {
    const mainContentElement = mainContentRef.current;
    if (mainContentElement) {
      if ('inert' in mainContentElement) {
        // Use `inert` if supported
        mainContentElement.inert = isDialogOpen;
      } else {
        // Fallback to `aria-hidden` for older browsers
        mainContentElement.setAttribute('aria-hidden', isDialogOpen ? 'true' : 'false');
      }
    }
  }, [isDialogOpen]);

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

  // --- React Query: Fetch Artists ---
  const {
    data: artists = [],
    isLoading: isLoadingArtists,
    error: artistsError,
    refetch: refetchArtists,
  } = useQuery<Artist[]>({
    queryKey: ["adminArtists"],
    queryFn: () => authenticatedRequest("GET", "/api/artists"),
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- Error Handling for Fetching Artists ---
  useEffect(() => {
    if (artistsError) {
      toast({
        title: "Failed to load artists",
        description: artistsError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error("Artists fetch error:", artistsError);
    }
  }, [artistsError, toast]);

  // --- Artist form
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

  // --- Mutation for creating a new artist ---
  const createArtistMutation = useMutation({
    mutationFn: async (data: ArtistForm) => {
      return authenticatedRequest("POST", "/api/artists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtists"] });
      artistForm.reset();
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Artist created successfully." });
    },
    onError: (error: any) => {
      console.error("Create artist error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // --- Mutation for updating an existing artist ---
  const updateArtistMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ArtistForm> }) => {
      return authenticatedRequest("PUT", `/api/artists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtists"] });
      setEditingArtist(null);
      setIsDialogOpen(false);
      artistForm.reset();
      toast({ title: "Success", description: "Artist updated successfully." });
    },
    onError: (error: any) => {
      console.error("Update artist error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // --- Mutation for deleting an artist ---
  const deleteArtistMutation = useMutation({
    mutationFn: async (id: number) => {
      return authenticatedRequest("DELETE", `/api/artists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtists"] });
      toast({ title: "Success", description: "Artist deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // --- Function to handle editing an artist ---
  const handleEditArtist = useCallback((artist: Artist) => {
    setEditingArtist(artist);
    artistForm.reset({
      name: artist.name,
      bio: artist.bio,
      specialty: artist.specialty,
      imageUrl: artist.imageUrl || "",
      featured: artist.featured || false,
    });
    setIsDialogOpen(true);
  }, [artistForm]);

  // --- Handle form submission for both create and update ---
  const onSubmitArtist = (data: ArtistForm) => {
    if (editingArtist) {
      updateArtistMutation.mutate({ id: editingArtist.id, data });
    } else {
      createArtistMutation.mutate(data);
    }
  };

  // --- Function to open the dialog for a new artist ---
  const handleNewArtist = useCallback(() => {
    setEditingArtist(null);
    artistForm.reset();
    setIsDialogOpen(true);
  }, [artistForm]);

  // --- Calculate artist statistics ---
  const artistStats = {
    total: artists.length,
    featured: artists.filter((a) => a.featured).length,
  };

  // --- Helper to get initials for avatar fallback ---
  const getInitials = (name: string) => {
    // Handle empty or whitespace-only names
    if (!name || !name.trim()) return "?";
  
    const parts = name.trim().split(" ");
    
    // Handle single-word names
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || "?";
    }
    
    // Handle multi-word names
    const firstChar = parts[0][0]?.toUpperCase() || "";
    const lastChar = parts[parts.length - 1][0]?.toUpperCase() || "";
    return `${firstChar}${lastChar}`;
  };

  // --- Pagination logic using the custom hook ---
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedArtists,
    goToPage,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    startItem,
    endItem,
    totalItems,
  } = usePagination({ data: artists, itemsPerPage: 10 });

  // --- Rendered Component ---
  return (
    <AdminSidebar>
      {/* ATTACH THE REF HERE to the main content div that we want to make inert */}
      <div ref={mainContentRef} className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Artists</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewArtist} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Artist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingArtist ? "Edit Artist" : "Add New Artist"}
                  </DialogTitle>
                </DialogHeader>
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
                              <Input placeholder="e.g., Oil Painting, Sculpture" {...field} />
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
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artistForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Biography</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter artist biography..."
                                className="min-h-[100px]"
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
                              <p className="text-sm text-gray-600">
                                Display this artist prominently on the homepage
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
                        disabled={createArtistMutation.isPending || updateArtistMutation.isPending}
                      >
                        {editingArtist ? "Update Artist" : "Create Artist"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          {/* Artist Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card className="rounded-lg shadow-md border-l-4 border-blue-600">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Artists</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoadingArtists ? <Loader2 className="h-6 w-6 animate-spin" /> : artistStats.total}
                  </p>
                </div>
                <User className="w-10 h-10 text-blue-500 opacity-20" />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-md border-l-4 border-yellow-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Featured Artists</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{artistStats.featured}</p>
                </div>
                <Award className="w-10 h-10 text-yellow-500 opacity-20" />
              </CardContent>
            </Card>
          </div>

          {/* Artists Table */}
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <User className="w-6 h-6 text-blue-600" />
                Artist Roster <span className="text-gray-500 text-lg">({totalItems})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingArtists ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                  <p>Loading artists...</p>
                </div>
              ) : artistsError ? (
                <div className="flex flex-col items-center justify-center py-12 text-red-600">
                  <Info className="h-10 w-10 mb-4" />
                  <p>Error: {artistsError.message}</p>
                  <p className="text-sm text-gray-500 mt-2">Could not load artists. Please check your connection or try again.</p>
                </div>
              ) : paginatedArtists && paginatedArtists.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[100px] text-gray-600 font-semibold text-sm">Image</TableHead>
                        <TableHead className="text-gray-600 font-semibold text-sm">Name</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-600 font-semibold text-sm">Specialty</TableHead>
                        <TableHead className="hidden lg:table-cell text-gray-600 font-semibold text-sm w-[300px]">Biography</TableHead>
                        <TableHead className="w-[120px] text-gray-600 font-semibold text-sm">Status</TableHead>
                        <TableHead className="w-[80px] text-right text-gray-600 font-semibold text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedArtists.map((artist: Artist) => (
                        <TableRow key={artist.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <TableCell>
                            <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border border-gray-200">
                              <Avatar className="w-full h-full">
                                <AvatarImage src={artist.imageUrl || undefined} alt={artist.name} />
                                <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
                              </Avatar>
                              {artist.featured && (
                                <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-200 shadow-md">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">{artist.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-600">{artist.specialty}</TableCell>
                          <TableCell className="hidden lg:table-cell max-w-xs truncate text-muted-foreground text-sm">
                            {artist.bio || "No biography provided."}
                          </TableCell>
                          <TableCell>
                            {artist.featured ? (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-amber-100 text-amber-800">
                                <Star className="w-3 h-3 fill-amber-500" />
                                Featured
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                Standard
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditArtist(artist)}
                                className="h-8 w-8 hover:bg-gray-200"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteArtistMutation.mutate(artist.id)}
                                disabled={deleteArtistMutation.isPending}
                                className="h-8 w-8 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-md">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">No artists found.</p>
                  <p className="text-sm mt-1">Create your first artist to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing **{startItem}** to **{endItem}** of **{totalItems}** artists
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
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            // ATTACH THE REF TO THE DIALOG CONTENT
            ref={dialogContentRef}
            className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="pb-4 border-b border-gray-200 mb-4">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                {editingArtist ? "Edit Artist" : "Add New Artist"}
              </DialogTitle>
              <DialogDescription>
                {editingArtist ? "Update the details of the selected artist." : "Fill in the details to add a new artist to the gallery."}
              </DialogDescription>
            </DialogHeader>
            <Form {...artistForm}>
              <form onSubmit={artistForm.handleSubmit(onSubmitArtist)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={artistForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                          <User className="w-4 h-4 text-gray-500" /> Name
                        </FormLabel>
                        <FormControl><Input placeholder="Enter artist name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artistForm.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                          <Palette className="w-4 h-4 text-gray-500" /> Specialty
                        </FormLabel>
                        <FormControl><Input placeholder="e.g., Oil Painting, Sculpture" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artistForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                          <Image className="w-4 h-4 text-gray-500" /> Profile Image
                        </FormLabel>
                        <FormControl><ImageUpload onImageSelect={field.onChange} currentImage={field.value} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artistForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                          <Book className="w-4 h-4 text-gray-500" /> Biography
                        </FormLabel>
                        <FormControl><Textarea placeholder="Enter artist biography..." className="min-h-[120px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artistForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 rounded-md border shadow-sm col-span-1 md:col-span-2">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" /> Featured Artist
                          </FormLabel>
                          <p className="text-sm text-gray-500">Check this box to feature this artist on the homepage.</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createArtistMutation.isPending || updateArtistMutation.isPending}>
                    {(createArtistMutation.isPending || updateArtistMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingArtist ? "Update Artist" : "Create Artist"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  );
}