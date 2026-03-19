import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image, Link } from "lucide-react";
import type { MediaFile } from "@shared/schema";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  context?: 'admin' | 'artist' | 'public';
  disableMediaLibrary?: boolean;
}

export function ImageUpload({ value, onChange, label = "Image", className = "", context = 'admin', disableMediaLibrary = false }: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Safety wrapper for onChange
  const safeOnChange = (url: string) => {
    if (typeof onChange === 'function') {
      onChange(url);
    } else {
      console.error('onChange is not a function:', typeof onChange);
    }
  };

  const { data: mediaFiles = [], refetch } = useQuery({
    queryKey: context === 'artist' ? ["/api/artists/media"] : ["/api/media"],
    queryFn: async () => {
      const tokenKey = context === 'artist' ? 'artist_token' : 'admin_token';
      const apiEndpoint = context === 'artist' ? '/api/artists/media' : '/api/media';
      const token = localStorage.getItem(tokenKey);
      
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch media files');
      }
      
      return response.json();
    },
    enabled: isOpen && !disableMediaLibrary,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("description", "");

      // For public context (registration), use a simpler approach - just URL input
      if (context === 'public') {
        // For registration, we'll just use URL input only
        throw new Error("File upload not available during registration. Please use URL input instead.");
      }

      const tokenKey = context === 'artist' ? 'artist_token' : 'admin_token';
      const apiEndpoint = context === 'artist' ? '/api/artists/media' : '/api/media';
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem(tokenKey)}`,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const uploadedFile = await response.json();
      safeOnChange(uploadedFile.url);
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload not available during registration. Please use a direct image URL instead.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      safeOnChange(urlInput.trim());
      setUrlInput("");
      setIsOpen(false);
    }
  };

  const handleMediaSelect = (mediaFile: MediaFile) => {
    safeOnChange(mediaFile.url);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <Label htmlFor="image-upload">{label}</Label>
      <div className="flex items-center gap-4 mt-2">
        {value && (
          <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              <Image className="w-4 h-4 mr-2" />
              {value ? "Change Image" : "Select Image"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Image</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue={context === 'public' ? "url" : "upload"} className="w-full">
              <TabsList className={`grid w-full ${context === 'public' ? 'grid-cols-1' : disableMediaLibrary ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {context !== 'public' && (
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                )}
                {!disableMediaLibrary && context !== 'public' && (
                  <TabsTrigger value="library">Media Library</TabsTrigger>
                )}
                {/* <TabsTrigger value="url">URL</TabsTrigger> */}
              </TabsList>
              
              {context !== 'public' && (
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
                      Click to upload or drag and drop
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      type="button"
                    >
                      {isUploading ? "Uploading..." : "Choose File"}
                    </Button>
                  </div>
                </TabsContent>
              )}
              
              {!disableMediaLibrary && context !== 'public' && (
                <TabsContent value="library" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaFiles.map((file: MediaFile) => (
                      <div
                        key={file.id}
                        className="relative group cursor-pointer"
                        onClick={() => handleMediaSelect(file)}
                      >
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button size="sm" variant="secondary">
                            Select
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {file.originalName}
                        </p>
                      </div>
                    ))}
                  </div>
                  {mediaFiles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No media files found. Upload some images first.
                    </div>
                  )}
                </TabsContent>
              )}
              
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-4">
                  {context === 'public' && (
                    <p className="text-sm text-gray-600 mb-4">
                      During registration, please provide a direct image URL. You can upload files after your account is approved.
                    </p>
                  )}
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                    <Link className="w-4 h-4 mr-2" />
                    Use URL
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        {value && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => safeOnChange("")}
            type="button"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;