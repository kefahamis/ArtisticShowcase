import { useState, useEffect } from "react";
import { useArtistAuth } from "@/hooks/useArtistAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, FileImage, Search, Filter, Grid, List, 
  Download, Trash2, Eye, Image, Video, FileText
} from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";

export default function ArtistMedia() {
  const { artist, isLoading: authLoading, isAuthenticated } = useArtistAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/artist/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Fetch media files
  const { data: mediaFiles = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/artists/media"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/media', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch media');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', `Media upload for ${artist?.name}`);

    try {
      const token = localStorage.getItem('artist_token');
      const response = await fetch('/api/artists/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      queryClient.invalidateQueries({ queryKey: ["/api/artists/media"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Filter media files
  const filteredMediaFiles = mediaFiles
    .filter((file: any) => {
      const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (filterType === 'all') return matchesSearch;
      if (filterType === 'images') return matchesSearch && file.mimeType.startsWith('image/');
      if (filterType === 'videos') return matchesSearch && file.mimeType.startsWith('video/');
      if (filterType === 'documents') return matchesSearch && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/');
      
      return matchesSearch;
    });

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <ArtistSidebar />
        
        <div className="flex-1 flex flex-col">
          <ArtistHeader 
            title="Media Library" 
            subtitle={`${mediaFiles.length} files in your library`}
            actions={
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <Button 
                  onClick={() => document.getElementById('media-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </Button>
              </div>
            }
          />
          
          <main className="flex-1 p-6">
            {/* Filters and Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
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
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Media Display */}
            {mediaLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredMediaFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery || filterType !== 'all' ? 'No files found' : 'No media files yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Upload your first media file to get started'}
                </p>
                <Button onClick={() => document.getElementById('media-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {filteredMediaFiles.map((file: any) => {
                  const FileIcon = getFileIcon(file.mimeType);
                  return (
                    <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                        {file.mimeType.startsWith('image/') ? (
                          <img 
                            src={file.url} 
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="w-8 h-8 text-gray-400" />
                        )}
                        
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <Button size="sm" variant="secondary" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="secondary" asChild>
                            <a href={file.url} download={file.originalName}>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMediaFiles.map((file: any) => {
                  const FileIcon = getFileIcon(file.mimeType);
                  return (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {file.mimeType.startsWith('image/') ? (
                              <img 
                                src={file.url} 
                                alt={file.originalName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FileIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {file.originalName}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {file.mimeType.split('/')[0]}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(file.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {file.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                {file.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.url} download={file.originalName}>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}