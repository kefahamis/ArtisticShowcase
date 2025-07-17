import { useState, useRef, useEffect, useCallback } from "react";
import { useArtistAuth } from "@/hooks/useArtistAuth";
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
  ArrowLeft,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";
import type { MediaFile } from "@shared/schema";

// Base URL for file access
const API_BASE_URL = "https://api.talantaart.com";

// Utility to get full file URL
const getFullUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

// Enhanced Upload Dialog with Drag & Drop
function EnhancedUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", `Uploaded file: ${file.name}`);

        const token = localStorage.getItem("artist_token");
        if (!token) {
          throw new Error("No authentication token found. Please log in again.");
        }

        const response = await fetch("/api/artists/media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("artist_token");
          toast({
            title: "Authentication Error",
            description:
              response.status === 403
                ? "Your account is not approved or your session has expired. Please log in again."
                : "Please log in again.",
            variant: "destructive",
          });
          setLocation("/artist/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Upload failed: ${errorData.message || "Unknown error"}`);
        }

        successCount++;
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} of ${files.length} files uploaded successfully`,
      });
      setFiles([]);
      setIsOpen(false);
      onSuccess();
    }

    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Upload Media Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop files here, or click to select</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Files to Upload ({files.length})</h4>
                <p className="text-sm text-gray-500">Total: {formatFileSize(getTotalSize())}</p>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileImage className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? "Uploading..." : `Upload ${files.length} file(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit File Dialog
function EditFileDialog({
  file,
  isOpen,
  onClose,
  onSave,
}: {
  file: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  // Update fields when file changes
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
        description,
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

// Enhanced Media File Card Component
function EnhancedMediaFileCard({
  file,
  onDelete,
  onEdit,
  viewMode,
}: {
  file: MediaFile;
  onDelete: (id: number) => void;
  onEdit: (file: MediaFile) => void;
  viewMode: "grid" | "list";
}) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Success",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return FileVideo;
    return FileText;
  };

  const FileIcon = getFileIcon(file.mimeType);

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {file.mimeType.startsWith("image/") ? (
                <img
                  src={getFullUrl(file.url)}
                  alt={file.originalName}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/400/300";
                  }}
                />
              ) : (
                <FileIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{file.originalName}</h4>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                <Badge variant="outline" className="text-xs">
                  {file.mimeType.split("/")[0]}
                </Badge>
                <span
                  className="text-xs text-gray-400"
                  title={`Uploaded: ${new Date(file.createdAt).toLocaleString()}`}
                >
                  {new Date(file.createdAt).toLocaleDateString()} at{" "}
                  {new Date(file.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {file.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">{file.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getFullUrl(file.url))}
              >
                <Copy className="w-4 h-4" />
              </Button>
              {file.mimeType.startsWith("image/") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={getFullUrl(file.url)} download={file.originalName}>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(file)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(file.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Image Preview Modal for List View */}
        {showPreview && file.mimeType.startsWith("image/") && (
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
                    e.currentTarget.src = "/api/placeholder/400/300";
                  }}
                />
              </div>
              <div className="space-y-3 pb-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = getFullUrl(file.url);
                      link.download = file.originalName;
                      link.click();
                    }}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(getFullUrl(file.url))}
                    variant="outline"
                  >
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
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {file.mimeType.startsWith("image/") ? (
          <img
            src={getFullUrl(file.url)}
            alt={file.originalName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/api/placeholder/400/300";
            }}
          />
        ) : (
          <FileIcon className="w-8 h-8 text-gray-400" />
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => copyToClipboard(getFullUrl(file.url))}
          >
            <Copy className="w-4 h-4" />
          </Button>
          {file.mimeType.startsWith("image/") && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="secondary" asChild>
            <a href={getFullUrl(file.url)} download={file.originalName}>
              <Download className="w-4 h-4" />
            </a>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(file)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(file.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-gray-600 truncate font-medium">{file.originalName}</p>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          <p
            className="text-xs text-gray-400"
            title={`Uploaded: ${new Date(file.createdAt).toLocaleString()}`}
          >
            {new Date(file.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>

      {/* Image Preview Modal */}
      {showPreview && file.mimeType.startsWith("image/") && (
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
                  e.currentTarget.src = "/api/placeholder/400/300";
                }}
              />
            </div>
            <div className="space-y-3 pb-4">
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = getFullUrl(file.url);
                    link.download = file.originalName;
                    link.click();
                  }}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => copyToClipboard(getFullUrl(file.url))}
                  variant="outline"
                >
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
    </Card>
  );
}

export default function ArtistMedia() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [allFiles, setAllFiles] = useState<MediaFile[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch paginated media files
  const { data: mediaData, isLoading: mediaLoading, refetch } = useQuery({
    queryKey: ["/api/artists/media", currentPage],
    queryFn: async () => {
      const token = localStorage.getItem("artist_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/artists/media?page=${currentPage}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("artist_token");
        toast({
          title: "Authentication Error",
          description:
            response.status === 403
              ? "Your account is not approved or your session has expired. Please log in again."
              : "Please log in again.",
          variant: "destructive",
        });
        setLocation("/artist/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch media files: ${errorData.message || "Unknown error"}`);
      }

      return response.json();
    },
    retry: false,
  });

  // Update files when new data is fetched
  useEffect(() => {
    if (mediaData && Array.isArray(mediaData)) {
      if (currentPage === 1) {
        setAllFiles(mediaData);
      } else {
        setAllFiles((prev) => [...prev, ...mediaData]);
      }
      setHasMore(mediaData.length === 20);
      setIsLoadingMore(false);
    }
  }, [mediaData, currentPage]);

  // Infinite scroll implementation
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !mediaLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, isLoadingMore, mediaLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleLoadMore]);

  // Filter and sort files
  const filteredAndSortedFiles = allFiles
    .filter((file: MediaFile) => {
      const matchesSearch =
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter =
        filterType === "all" ||
        (filterType === "images" && file.mimeType.startsWith("image/")) ||
        (filterType === "videos" && file.mimeType.startsWith("video/")) ||
        (filterType === "documents" &&
          !file.mimeType.startsWith("image/") &&
          !file.mimeType.startsWith("video/"));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "size":
          return b.size - a.size;
        default:
          return 0;
      }
    });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("artist_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/artists/media/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("artist_token");
        toast({
          title: "Authentication Error",
          description:
            response.status === 403
              ? "You are not authorized to delete this file or your session has expired."
              : "Please log in again.",
          variant: "destructive",
        });
        setLocation("/artist/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete file: ${errorData.message || "Unknown error"}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      setCurrentPage(1);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      originalName,
      description,
    }: {
      id: number;
      originalName?: string;
      description?: string;
    }) => {
      const token = localStorage.getItem("artist_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updateData: any = {};
      if (originalName !== undefined) updateData.originalName = originalName;
      if (description !== undefined) updateData.description = description;

      const response = await fetch(`/api/artists/media/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("artist_token");
        toast({
          title: "Authentication Error",
          description:
            response.status === 403
              ? "You are not authorized to update this file or your session has expired."
              : "Please log in again.",
          variant: "destructive",
        });
        setLocation("/artist/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update: ${errorData.message || "Unknown error"}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "File updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/artists/media"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
    setShowEditDialog(true);
  };

  const handleSaveEdit = (data: any) => {
    updateMutation.mutate(data);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ArtistHeader />

      <div className="flex">
        <ArtistSidebar />

        <div className="flex-1">
          <main className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
                  <p className="text-gray-600 mt-2">Manage your media files and uploads</p>
                </div>

                <EnhancedUploadDialog
                  onSuccess={() => {
                    setCurrentPage(1);
                    refetch();
                  }}
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Files</p>
                      <p className="text-2xl font-bold">{allFiles.length}</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Images</p>
                      <p className="text-2xl font-bold">
                        {allFiles.filter((f) => f.mimeType.startsWith("image/")).length}
                      </p>
                    </div>
                    <FileImage className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Videos</p>
                      <p className="text-2xl font-bold">
                        {allFiles.filter((f) => f.mimeType.startsWith("video/")).length}
                      </p>
                    </div>
                    <FileVideo className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Documents</p>
                      <p className="text-2xl font-bold">
                        {allFiles.filter(
                          (f) => !f.mimeType.startsWith("image/") && !f.mimeType.startsWith("video/")
                        ).length}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Controls */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
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

            {/* Media Display */}
            {mediaLoading && currentPage === 1 ? (
              <div className="flex justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading media files...</span>
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
                    <EnhancedUploadDialog
                      onSuccess={() => {
                        setCurrentPage(1);
                        refetch();
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                    : "space-y-3"
                }
              >
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

            {/* Infinite Scroll Trigger */}
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
          </main>
        </div>
      </div>

      {/* Edit File Dialog */}
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