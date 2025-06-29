import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Upload, Image, MoreVertical, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePagination } from "@/hooks/use-pagination";
import AdminHeader from "@/components/admin-header";
import AdminFooter from "@/components/admin-footer";
import AdminSidebar from "@/components/admin-sidebar";

const mediaFileSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().min(1, "Size is required"),
  url: z.string().url("Valid URL is required"),
  altText: z.string().optional(),
  caption: z.string().optional(),
  uploadedBy: z.string().optional(),
});

type MediaFile = {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  caption?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminMedia() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ["/api/media"],
  });

  const createForm = useForm({
    resolver: zodResolver(mediaFileSchema),
    defaultValues: {
      filename: "",
      originalName: "",
      mimeType: "",
      size: 0,
      url: "",
      altText: "",
      caption: "",
      uploadedBy: "Admin",
    },
  });

  const editForm = useForm({
    resolver: zodResolver(mediaFileSchema.partial()),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/media", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Media file added successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest(`/api/media/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Media file updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      setIsEditOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/media/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({ title: "Media file deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter media files
  const filteredFiles = mediaFiles.filter((file: MediaFile) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.altText && file.altText.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || 
                       (filterType === "images" && file.mimeType.startsWith("image/")) ||
                       (filterType === "documents" && !file.mimeType.startsWith("image/"));
    
    return matchesSearch && matchesType;
  });

  const {
    currentItems: currentFiles,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination({ data: filteredFiles, itemsPerPage: 12 });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEdit = (file: MediaFile) => {
    setSelectedFile(file);
    editForm.reset(file);
    setIsEditOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload - in real app, upload to storage service
      const mockUrl = `/api/placeholder/400/300`;
      createForm.setValue("filename", `${Date.now()}_${file.name}`);
      createForm.setValue("originalName", file.name);
      createForm.setValue("mimeType", file.type);
      createForm.setValue("size", file.size);
      createForm.setValue("url", mockUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <AdminSidebar>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
              <p className="text-gray-600">Manage uploaded images and files</p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Media
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Media File</DialogTitle>
                </DialogHeader>
                <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Choose File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Original Name</Label>
                    <Input {...createForm.register("originalName")} />
                    {createForm.formState.errors.originalName && (
                      <p className="text-sm text-red-600 mt-1">
                        {createForm.formState.errors.originalName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Alt Text</Label>
                    <Input {...createForm.register("altText")} placeholder="Describe the image" />
                  </div>

                  <div>
                    <Label>Caption</Label>
                    <Textarea {...createForm.register("caption")} placeholder="Optional caption" />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {filterType === "all" ? "All Files" : filterType === "images" ? "Images" : "Documents"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>All Files</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("images")}>Images</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("documents")}>Documents</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentFiles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No files match your search criteria." : "Upload your first media file to get started."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Media
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {currentFiles.map((file: MediaFile) => (
                  <Card key={file.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.altText || file.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              📄
                            </div>
                            <p className="text-sm text-gray-600 truncate px-2">
                              {file.originalName}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(file)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate(file.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate mb-1">{file.originalName}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {file.mimeType.split('/')[0]}
                        </Badge>
                      </div>
                      {file.caption && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{file.caption}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </AdminSidebar>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Media File</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit((data) => 
            selectedFile && updateMutation.mutate({ id: selectedFile.id, data })
          )} className="space-y-4">
            <div>
              <Label>Original Name</Label>
              <Input {...editForm.register("originalName")} />
            </div>

            <div>
              <Label>Alt Text</Label>
              <Input {...editForm.register("altText")} placeholder="Describe the image" />
            </div>

            <div>
              <Label>Caption</Label>
              <Textarea {...editForm.register("caption")} placeholder="Optional caption" />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminFooter />
    </div>
  );
}