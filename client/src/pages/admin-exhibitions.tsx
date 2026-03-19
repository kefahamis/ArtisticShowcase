import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, EditIcon, TrashIcon, PlusIcon, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminSidebar from "@/components/admin-sidebar";
import { ImageUpload } from "@/components/image-upload";
import type { Exhibition, InsertExhibition } from "@shared/schema";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.talantaart.com";

const exhibitionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().transform(val => val === "" ? undefined : val).optional(),
  location: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  openingReception: z.string().transform(val => val === "" ? undefined : val).optional(),
  current: z.boolean().default(false),
});

type ExhibitionFormData = z.infer<typeof exhibitionFormSchema>;

export default function AdminExhibitions() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

    const response = await fetch(`${API_BASE_URL}${url}`, {
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
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    return response.status === 204 ? null : response.json();
  };

  const { data: exhibitions, isLoading, error, isError } = useQuery<Exhibition[]>({
    queryKey: ["/api/exhibitions"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`${API_BASE_URL}/api/exhibitions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_token");
        setLocation("/login");
        throw new Error("Authentication failed");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Request failed");
      }

      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<ExhibitionFormData>({
    resolver: zodResolver(exhibitionFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      imageUrl: undefined, // Changed to undefined to match schema
      location: "",
      venue: "",
      startDate: "",
      endDate: "",
      openingReception: "",
      current: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExhibitionFormData) => {
      const exhibitionData = {
        ...data,
        imageUrl: data.imageUrl || null,
        location: data.location || null,
        venue: data.venue || null,
        openingReception: data.openingReception || null,
      };
      return await authenticatedRequest("POST", "/api/exhibitions", exhibitionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitions"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Exhibition created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exhibition",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ExhibitionFormData) => {
      if (!editingExhibition) return;
      const exhibitionData = {
        ...data,
        imageUrl: data.imageUrl || null,
        location: data.location || null,
        venue: data.venue || null,
        openingReception: data.openingReception || null,
      };
      return await authenticatedRequest("PUT", `/api/exhibitions/${editingExhibition.id}`, exhibitionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitions"] });
      setIsDialogOpen(false);
      setEditingExhibition(null);
      form.reset();
      toast({
        title: "Success",
        description: "Exhibition updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update exhibition",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await authenticatedRequest("DELETE", `/api/exhibitions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitions"] });
      toast({
        title: "Success",
        description: "Exhibition deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exhibition",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ExhibitionFormData) => {
    if (editingExhibition) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Helper function to safely convert date to input format
  const formatDateForInput = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const handleEdit = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition);
    form.reset({
      title: exhibition.title,
      subtitle: exhibition.subtitle || "",
      description: exhibition.description,
      imageUrl: exhibition.imageUrl || undefined,
      location: exhibition.location || "",
      venue: exhibition.venue || "",
      startDate: formatDateForInput(exhibition.startDate),
      endDate: formatDateForInput(exhibition.endDate),
      openingReception: exhibition.openingReception || "",
      current: exhibition.current,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exhibition?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingExhibition(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Exhibitions</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Exhibition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingExhibition ? "Edit Exhibition" : "Create New Exhibition"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Exhibition title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                    <Input
                      id="subtitle"
                      {...form.register("subtitle")}
                      placeholder="Exhibition subtitle"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Exhibition description"
                      rows={4}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Exhibition Image (Optional)"
                      value={form.watch("imageUrl") || ""}
                      onChange={(url) => {
                        form.setValue("imageUrl", url === "" ? undefined : url);
                        form.clearErrors("imageUrl");
                      }}
                      context="admin"
                      endpoint={`${API_BASE_URL}/api/admin/exhibitions/media`}
                    />
                    {form.formState.errors.imageUrl && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.imageUrl.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <select
                      id="location"
                      {...form.register("location")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Location</option>
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Kakamega">Kakamega</option>
                    </select>
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.location.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="venue">Venue (Optional)</Label>
                    <Input
                      id="venue"
                      {...form.register("venue")}
                      placeholder="Gallery name or venue"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...form.register("startDate")}
                    />
                    {form.formState.errors.startDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...form.register("endDate")}
                    />
                    {form.formState.errors.endDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.endDate.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="openingReception">Opening Reception (Optional)</Label>
                    <Input
                      id="openingReception"
                      {...form.register("openingReception")}
                      placeholder="Opening reception details"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="current"
                        checked={form.watch("current")}
                        onCheckedChange={(checked) => form.setValue("current", !!checked)}
                      />
                      <Label htmlFor="current">Mark as Current Exhibition</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingExhibition ? "Update" : "Create"} Exhibition
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Exhibitions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading exhibitions...</div>
              </div>
            ) : isError ? (
              <div className="text-center p-8">
                <div className="text-red-500 mb-4">Error loading exhibitions</div>
                <p className="text-muted-foreground mb-4">
                  {error?.message || "Failed to load exhibitions. Please try again."}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : exhibitions && exhibitions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exhibitions.map((exhibition) => (
                    <TableRow key={exhibition.id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>{exhibition.title}</div>
                          {exhibition.subtitle && (
                            <div className="text-sm text-muted-foreground">
                              {exhibition.subtitle}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{exhibition.location || "Not specified"}</div>
                          {exhibition.venue && (
                            <div className="text-xs text-muted-foreground">
                              {exhibition.venue}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                          </div>
                          {exhibition.openingReception && (
                            <div className="text-xs text-muted-foreground">
                              Reception: {exhibition.openingReception}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {exhibition.current ? (
                          <Badge variant="default">Current</Badge>
                        ) : (
                          <Badge variant="outline">Upcoming</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(exhibition)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exhibition.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No exhibitions found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first exhibition.
                </p>
                <Button onClick={handleAddNew}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Exhibition
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}