import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin-sidebar";
import type { Exhibition, InsertExhibition } from "@shared/schema";

const exhibitionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Please enter a valid image URL").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  openingReception: z.string().optional(),
  current: z.boolean().default(false),
});

type ExhibitionFormData = z.infer<typeof exhibitionFormSchema>;

export default function AdminExhibitions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exhibitions, isLoading } = useQuery<Exhibition[]>({
    queryKey: ["/api/exhibitions"],
  });

  const form = useForm<ExhibitionFormData>({
    resolver: zodResolver(exhibitionFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      startDate: "",
      endDate: "",
      openingReception: "",
      current: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExhibitionFormData) => {
      const exhibitionData: InsertExhibition = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        openingReception: data.openingReception ? data.openingReception : null,
      };
      return await apiRequest("POST", "/api/exhibitions", exhibitionData);
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
      const exhibitionData: Partial<InsertExhibition> = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        openingReception: data.openingReception ? data.openingReception : null,
      };
      return await apiRequest("PATCH", `/api/exhibitions/${editingExhibition.id}`, exhibitionData);
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
      return await apiRequest("DELETE", `/api/exhibitions/${id}`);
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

  const handleEdit = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition);
    form.reset({
      title: exhibition.title,
      subtitle: exhibition.subtitle || "",
      description: exhibition.description,
      imageUrl: exhibition.imageUrl || "",
      startDate: new Date(exhibition.startDate).toISOString().split('T')[0],
      endDate: new Date(exhibition.endDate).toISOString().split('T')[0],
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
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      {...form.register("imageUrl")}
                      placeholder="https://example.com/image.jpg"
                    />
                    {form.formState.errors.imageUrl && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.imageUrl.message}
                      </p>
                    )}
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
            ) : exhibitions && exhibitions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
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