import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image, 
  File, 
  Trash2, 
  Edit2, 
  Search,
  Grid,
  List,
  Download,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MediaFile } from "@shared/schema-old";

// Upload Dialog Component
function UploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Uploaded file: ${file.name}`);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('admin_token');
        throw new Error('Authentication expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${errorData}`);
      }
      return response.json();
    });

    try {
      await Promise.all(uploadPromises);
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`
      });
      setFiles([]);
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files. Please try logging in again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Upload Media Files</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported: Images, Videos, PDF, Word documents
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      {file.type.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-blue-500" />
                      ) : (
                        <File className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <span className="text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={files.length === 0 || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Media File Card Component
function MediaFileCard({ file, onDelete, onEdit }: { 
  file: MediaFile; 
  onDelete: (id: number) => void;
  onEdit: (file: MediaFile) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getFileIcon(file.mimeType)}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{file.filename}</h3>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.mimeType.startsWith('image/') && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="h-7 w-7 p-0"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(file)}
              className="h-7 w-7 p-0"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(file.id)}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
            {file.mimeType}
          </Badge>
          {file.description && (
            <p className="text-xs text-gray-600 truncate">{file.description}</p>
          )}
          <p className="text-xs text-gray-400">
            {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>

        {/* Image Preview Dialog */}
        {showPreview && file.mimeType.startsWith('image/') && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl bg-white">
              <DialogHeader>
                <DialogTitle>{file.filename}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <img 
                  src={file.url} 
                  alt={file.description || file.filename}
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminMediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const { toast } = useToast();

  // Fetch media files
  const { data: mediaFiles, isLoading, refetch } = useQuery({
    queryKey: ['/api/media'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await fetch('/api/media', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('admin_token');
        throw new Error('Authentication expired. Please log in again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch media files');
      }
      return response.json();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      toast({ title: "Success", description: "File deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete file", 
        variant: "destructive" 
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "File updated successfully" });
      setEditingFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
  };

  const handleUpdateFile = (data: any) => {
    if (editingFile) {
      updateMutation.mutate({ id: editingFile.id, data });
    }
  };

  // Filter files
  const filteredFiles = Array.isArray(mediaFiles) ? mediaFiles.filter((file: MediaFile) => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || 
                       (filterType === "images" && file.mimeType.startsWith('image/')) ||
                       (filterType === "documents" && !file.mimeType.startsWith('image/'));
    return matchesSearch && matchesType;
  }) : [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your uploaded files and media</p>
        </div>
        <UploadDialog onSuccess={refetch} />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Count */}
      <div className="text-sm text-gray-600">
        {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchQuery || filterType !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by uploading your first file"
              }
            </p>
            {(!searchQuery && filterType === "all") && (
              <UploadDialog onSuccess={refetch} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "space-y-2"
        }>
          {filteredFiles.map((file: MediaFile) => (
            <MediaFileCard
              key={file.id}
              file={file}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Edit File Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filename">File Name</Label>
                <Input
                  id="filename"
                  defaultValue={editingFile.filename}
                  onChange={(e) => setEditingFile({...editingFile, filename: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  defaultValue={editingFile.description || ''}
                  onChange={(e) => setEditingFile({...editingFile, description: e.target.value})}
                  placeholder="Describe this file..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingFile(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateFile({
                    filename: editingFile.filename,
                    description: editingFile.description
                  })}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}