import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertArtistSchema, type Artist } from "@shared/schema";
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
import { Pencil, Trash2, Plus, User, Star } from "lucide-react";

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

  const { data: artists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ["/api/artists"],
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

  // Artist mutations
  const createArtistMutation = useMutation({
    mutationFn: async (data: ArtistForm) => {
      return authenticatedRequest("POST", "/api/artists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      artistForm.reset();
      setIsDialogOpen(false);
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
      setIsDialogOpen(false);
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

  const editArtist = (artist: Artist) => {
    setEditingArtist(artist);
    artistForm.reset({
      name: artist.name,
      bio: artist.bio,
      specialty: artist.specialty,
      imageUrl: artist.imageUrl || "",
      featured: artist.featured || false,
    });
    setIsDialogOpen(true);
  };

  const onSubmitArtist = (data: ArtistForm) => {
    if (editingArtist) {
      updateArtistMutation.mutate({ id: editingArtist.id, data });
    } else {
      createArtistMutation.mutate(data);
    }
  };

  const handleNewArtist = () => {
    setEditingArtist(null);
    artistForm.reset();
    setIsDialogOpen(true);
  };

  // Pagination
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

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto">
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
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingArtist ? "Edit Artist" : "Add New Artist"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...artistForm}>
                  <form onSubmit={artistForm.handleSubmit(onSubmitArtist)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
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
                          <FormItem className="col-span-1">
                            <ImageUpload
                              onImageSelect={field.onChange}
                              currentImage={field.value}
                            />
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

        {/* Main Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Artists ({Array.isArray(artists) ? artists.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingArtists ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bio</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedArtists.map((artist: Artist) => (
                      <TableRow key={artist.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {artist.imageUrl && (
                              <img 
                                src={artist.imageUrl} 
                                alt={artist.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            {artist.name}
                          </div>
                        </TableCell>
                        <TableCell>{artist.specialty}</TableCell>
                        <TableCell>
                          {artist.featured && (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <Star className="w-3 h-3" />
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {artist.bio || "No biography"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editArtist(artist)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteArtistMutation.mutate(artist.id)}
                              disabled={deleteArtistMutation.isPending}
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

              {Array.isArray(artists) && artists.length === 0 && !loadingArtists && (
                <div className="text-center py-8 text-gray-500">
                  No artists found. Create your first artist to get started.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {startItem} to {endItem} of {totalItems} artists
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