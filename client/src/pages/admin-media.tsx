import { useState, useRef, useEffect, useCallback } from "react";
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
  Eye,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  Copy,
  X,
  FileImage,
  FileVideo,
  FileText,
  Calendar,
  HardDrive,
  ArrowLeft
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { MediaFile } from "@shared/schema";

// Enhanced Upload Dialog with Drag & Drop
function EnhancedUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    
    for (const file of files) {
      try {
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
        
        successCount++;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} of ${files.length} files uploaded successfully`
      });
      setFiles([]);
      setIsOpen(false);
      onSuccess();
    } else {
      toast({
        title: "Upload Failed",
        description: "No files were uploaded successfully. Please try again.",
        variant: "destructive"
      });
    }
    
    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
    if (file.type.startsWith('video/')) return <FileVideo className="w-4 h-4 text-purple-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Bulk Upload Media Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {dragActive ? 'Drop multiple files here' : 'Click to select multiple files or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                  Select multiple files for bulk upload - Supports: Images, Videos, PDF, Word documents (Max 10MB each)
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Selected Files ({files.length})
                  </Label>
                  <p className="text-xs text-gray-500">
                    Total size: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {getFileTypeIcon(file)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={files.length === 0 || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Media File Card with Preview
function EnhancedMediaFileCard({ 
  file, 
  onDelete, 
  onEdit, 
  viewMode 
}: { 
  file: MediaFile; 
  onDelete: (id: number) => void;
  onEdit: (file: MediaFile) => void;
  viewMode: "grid" | "list";
}) {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getFullUrl = (url: string) => {
    return `https://api.talantaart.com${url.startsWith('/uploads/') ? url : `/uploads/${url}`}`;
  };

  const copyUrl = async () => {
    try {
      const fullUrl = getFullUrl(file.url);
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Copied!",
        description: "File URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = getFullUrl(file.url);
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (viewMode === "list") {
    return (
      <div className="group flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-all">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {file.mimeType.startsWith('image/') ? (
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                <img 
                  src={getFullUrl(file.url)} 
                  alt={file.originalName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `/api/placeholder/48/48`;
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                {getFileIcon(file.mimeType)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{file.originalName}</h3>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>{file.mimeType}</span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            {file.description && (
              <p className="text-xs text-gray-600 mt-1 truncate">{file.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={copyUrl}
            className="h-8 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={downloadFile}
            className="h-8 px-2"
          >
            <Download className="w-3 h-3" />
          </Button>
          {file.mimeType.startsWith('image/') && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowPreview(true)}
              className="h-8 px-2"
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onEdit(file)}
            className="h-8 px-2"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onDelete(file.id)}
            className="h-8 px-2 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {showPreview && file.mimeType.startsWith('image/') && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl bg-white">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileImage className="w-5 h-5" />
                  <span>{file.originalName}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <img 
                  src={getFullUrl(file.url)} 
                  alt={file.description || file.originalName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = `/api/placeholder/400/300`;
                  }}
                />
              </div>
              <div className="space-y-3 pb-4">
                <div className="flex justify-center space-x-2">
                  <Button onClick={downloadFile} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={copyUrl} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border break-all font-mono max-w-md mx-auto">
                    {getFullUrl(file.url)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-gray-100">
          {file.mimeType.startsWith('image/') ? (
            <img 
              src={getFullUrl(file.url)} 
              alt={file.originalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFileIcon(file.mimeType)}
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {file.mimeType.startsWith('image/') && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setShowPreview(true)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button 
                size="sm" 
                variant="secondary"
                onClick={downloadFile}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={copyUrl}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-sm truncate mb-2">{file.originalName}</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Badge variant="secondary" className="text-xs">
                {file.mimeType.split('/')[0]}
              </Badge>
              <span className="text-gray-500 flex items-center">
                <HardDrive className="w-3 h-3 mr-1" />
                {formatFileSize(file.size)}
              </span>
            </div>
            
            {file.description && (
              <p className="text-xs text-gray-600 line-clamp-2">{file.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
              
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onEdit(file)}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onDelete(file.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showPreview && file.mimeType.startsWith('image/') && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl bg-white">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileImage className="w-5 h-5" />
                  <span>{file.originalName}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <img 
                  src={getFullUrl(file.url)} 
                  alt={file.description || file.originalName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = `/api/placeholder/400/300`;
                  }}
                />
              </div>
              <div className="space-y-3 pb-4">
                <div className="flex justify-center space-x-2">
                  <Button onClick={downloadFile} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={copyUrl} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border break-all font-mono max-w-md mx-auto">
                    {getFullUrl(file.url)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

// Edit File Dialog
function EditFileDialog({ 
  file, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  file: MediaFile | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (file) {
      setDisplayName(file.originalName || "");
      setDescription(file.description || "");
    }
  }, [file]);

  const handleSave = () => {
    if (file) {
      onSave({ 
        id: file.id, 
        originalName: displayName,
        description 
      });
      onClose();
    }
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Edit File Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name for this file..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the name shown in the media library
            </p>
          </div>
          
          <div>
            <Label>System Filename</Label>
            <Input value={file.filename} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">
              Internal system filename (read-only)
            </p>
          </div>
          
          <div>
            <Label>File Type</Label>
            <Input value={file.mimeType} disabled className="bg-gray-50" />
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this file..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allMediaFiles, setAllMediaFiles] = useState<MediaFile[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: mediaFiles, isLoading, refetch } = useQuery({
    queryKey: ['/api/media', page],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await fetch(`/api/media?page=${page}&limit=20`, {
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
    },
    enabled: !!page
  });

  useEffect(() => {
    if (mediaFiles) {
      if (page === 1) {
        setAllMediaFiles(mediaFiles);
      } else {
        setAllMediaFiles(prev => [...prev, ...mediaFiles]);
      }
      
      if (mediaFiles.length < 20) {
        setHasMore(false);
      }
    }
  }, [mediaFiles, page]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, isLoadingMore]);

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

  const updateMutation = useMutation({
    mutationFn: async ({ id, originalName, description }: { id: number; originalName?: string; description?: string }) => {
      const token = localStorage.getItem('admin_token');
      const updateData: any = {};
      if (originalName !== undefined) updateData.originalName = originalName;
      if (description !== undefined) updateData.description = description;
      
      const response = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "File updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update file", 
        variant: "destructive" 
      });
    }
  });

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (data: any) => {
    updateMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredAndSortedFiles = (allMediaFiles || [])
    .filter((file: MediaFile) => {
      const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (file.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === "all" ||
                         (filterType === "images" && file.mimeType.startsWith('image/')) ||
                         (filterType === "videos" && file.mimeType.startsWith('video/')) ||
                         (filterType === "documents" && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'));
      
      return matchesSearch && matchesType;
    })
    .sort((a: MediaFile, b: MediaFile) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "size":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

  const totalFiles = allMediaFiles?.length || 0;
  const totalSize = allMediaFiles?.reduce((acc: number, file: MediaFile) => acc + (file.size || 0), 0) || 0;
  const imageCount = allMediaFiles?.filter((file: MediaFile) => file.mimeType.startsWith('image/')).length || 0;
  const videoCount = allMediaFiles?.filter((file: MediaFile) => file.mimeType.startsWith('video/')).length || 0;
  const documentCount = totalFiles - imageCount - videoCount;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600">Manage your gallery's media files</p>
          </div>
        </div>
        <EnhancedUploadDialog onSuccess={() => refetch()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <File className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-lg font-semibold">{totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileImage className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-lg font-semibold">{imageCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileVideo className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Videos</p>
                <p className="text-lg font-semibold">{videoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-lg font-semibold">{formatFileSize(totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  {sortBy === "newest" ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading media files...</span>
          </div>
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileImage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Upload your first media file to get started"}
            </p>
            {(!searchQuery && filterType === "all") && (
              <EnhancedUploadDialog onSuccess={() => refetch()} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-10 gap-4"
            : "space-y-3"
        }>
          {filteredAndSortedFiles.map((file: MediaFile) => (
            <EnhancedMediaFileCard
              key={file.id}
              file={file}
              onDelete={handleDelete}
              onEdit={handleEdit}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
      
      {hasMore && filteredAndSortedFiles.length > 0 && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading more files...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Scroll to load more files</div>
          )}
        </div>
      )}

      <EditFileDialog
        file={editingFile}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingFile(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}