import { useState, useEffect, useRef, useCallback, useReducer } from "react";
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
import { insertBlogPostSchema, type BlogPost } from "@shared/schema-old";
import AdminSidebar from "@/components/admin-sidebar";
import WysiwygEditor from "@/components/wsiwyg-editor";
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
import { Pencil, Trash2, Plus, FileText, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";

interface BlogPostForm {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  published: boolean;
}

interface AdminBlogState {
  isDialogOpen: boolean;
  editingPost: BlogPost | null;
}

type AdminBlogAction =
  | { type: "OPEN_DIALOG"; payload?: { post: BlogPost } }
  | { type: "CLOSE_DIALOG" };

const adminBlogReducer = (state: AdminBlogState, action: AdminBlogAction): AdminBlogState => {
  switch (action.type) {
    case "OPEN_DIALOG":
      return { ...state, isDialogOpen: true, editingPost: action.payload?.post ?? null };
    case "CLOSE_DIALOG":
      return { ...state, isDialogOpen: false, editingPost: null };
    default:
      return state;
  }
};

export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const [{ isDialogOpen, editingPost }, dispatch] = useReducer(adminBlogReducer, {
    isDialogOpen: false,
    editingPost: null,
  });
  const { toast } = useToast();
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Dialog Focus Management
  useEffect(() => {
    if (isDialogOpen && dialogContentRef.current) {
      const firstInput = dialogContentRef.current.querySelector('input, textarea') as HTMLElement;
      firstInput?.focus();
    }
  }, [isDialogOpen]);

  const authenticatedRequest = useCallback(
    async <T,>(method: string, url: string, data?: any): Promise<T | null> => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
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

  const {
    data: blogPosts = [],
    isLoading: loadingPosts,
    error: fetchError,
    refetch: refetchBlogPosts,
  } = useQuery<BlogPost[]>({
    queryKey: ["adminBlogPosts"],
    queryFn: async () => {
      try {
        const data = await authenticatedRequest<BlogPost[]>("GET", "/api/blog");
        return data || [];
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Failed to load blog posts",
        description: fetchError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [fetchError, toast]);

  const blogForm = useForm<BlogPostForm>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      published: false,
    },
    values: editingPost ? {
      title: editingPost.title,
      content: editingPost.content,
      excerpt: editingPost.excerpt || "",
      imageUrl: editingPost.imageUrl || "",
      published: editingPost.published,
    } : undefined,
  });

  const handleMutationSuccess = useCallback(async (message: string) => {
    try {
      // Invalidate and immediately refetch
      await queryClient.invalidateQueries({
        queryKey: ["adminBlogPosts"],
        refetchType: 'active'
      });
      await refetchBlogPosts();
      toast({ title: "Success", description: message });
      dispatch({ type: "CLOSE_DIALOG" });
      blogForm.reset();
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast({
        title: "Success but refresh failed",
        description: "Operation succeeded but couldn't refresh the list.",
        variant: "default"
      });
    }
  }, [blogForm, toast, refetchBlogPosts]);

  const handleMutationError = useCallback((error: any, action: string) => {
    console.error(`${action} failed:`, error);
    toast({
      title: `Error ${action}`,
      description: error.message || "An unexpected error occurred.",
      variant: "destructive",
    });
  }, [toast]);

  const createPostMutation = useMutation({
    mutationFn: (data: BlogPostForm) => authenticatedRequest<BlogPost>("POST", "/api/blog", data),
    onSuccess: () => handleMutationSuccess("Blog post created successfully."),
    onError: (error) => handleMutationError(error, "creating post"),
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BlogPostForm> }) =>
      authenticatedRequest<BlogPost>("PUT", `/api/blog/${id}`, data),
    onSuccess: () => handleMutationSuccess("Blog post updated successfully."),
    onError: (error) => handleMutationError(error, "updating post"),
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => authenticatedRequest<null>("DELETE", `/api/blog/${id}`),
    onSuccess: () => handleMutationSuccess("Blog post deleted successfully."),
    onError: (error) => handleMutationError(error, "deleting post"),
  });

  const onSubmitPost = useCallback(
    (data: BlogPostForm) => {
      if (editingPost) {
        updatePostMutation.mutate({ id: editingPost.id, data });
      } else {
        createPostMutation.mutate(data);
      }
    },
    [editingPost, createPostMutation, updatePostMutation]
  );

  const handleAddPostClick = useCallback(() => {
    dispatch({ type: "OPEN_DIALOG" });
    blogForm.reset();
  }, [blogForm]);

  const handleEditPostClick = useCallback(
    (post: BlogPost) => {
      dispatch({ type: "OPEN_DIALOG", payload: { post } });
    },
    []
  );

  const handleManualRefetch = async () => {
    try {
      setIsRefetching(true);
      await refetchBlogPosts();
      toast({ title: "Success", description: "Posts refreshed successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh posts",
        variant: "destructive"
      });
    } finally {
      setIsRefetching(false);
    }
  };

  const formatDate = useCallback((dateValue: string | Date | null) => {
    if (!dateValue) return "N/A";
    try {
      const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return "Error Date";
    }
  }, []);

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedPosts,
    goToPage,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    startItem,
    endItem,
    totalItems,
  } = usePagination({ data: blogPosts, itemsPerPage: 10 });

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Blog Management</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleManualRefetch}
                disabled={isRefetching || loadingPosts}
                className="flex items-center gap-2"
              >
                {isRefetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  if (!open) {
                    dispatch({ type: "CLOSE_DIALOG" });
                    blogForm.reset();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={handleAddPostClick} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto z-[1000]"
                  ref={dialogContentRef}
                >
                  <DialogHeader className="pb-4 border-b border-gray-200 mb-4">
                    <DialogTitle className="text-2xl font-bold">
                      {editingPost ? "Edit Blog Post" : "Add New Blog Post"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...blogForm}>
                    <form onSubmit={blogForm.handleSubmit(onSubmitPost)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-5">
                        <FormField
                          control={blogForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter post title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Brief description..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Featured Image</FormLabel>
                              <FormControl>
                                <ImageUpload onImageSelect={field.onChange} currentImage={field.value} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <WysiwygEditor
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Write your blog post content here..."
                                  className="min-h-[300px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="published"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 p-2 border rounded-md">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Published</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Make this post visible to visitors
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={blogForm.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title (SEO)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="SEO-optimized title (recommended: 50-60 characters)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={blogForm.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description (SEO)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="SEO meta description (recommended: 150-160 characters)"
                                className="h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => dispatch({ type: "CLOSE_DIALOG" })}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPostMutation.isPending || updatePostMutation.isPending}>
                          {createPostMutation.isPending || updatePostMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {editingPost ? "Update Post" : "Create Post"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card className="shadow-lg rounded-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <FileText className="w-6 h-6 text-blue-600" />
                Blog Posts <span className="text-gray-500 text-lg">({totalItems})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p>Loading blog posts...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[200px]">Title</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[120px]">Created</TableHead>
                          <TableHead>Excerpt</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPosts.length > 0 ? (
                          paginatedPosts.map((post) => (
                            <TableRow key={post.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  {post.imageUrl && (
                                    <img
                                      src={post.imageUrl}
                                      alt={post.title}
                                      className="w-12 h-12 rounded-lg object-cover"
                                      onError={(e) => { e.currentTarget.src = "https://placehold.co/48x48/e2e8f0/000000?text=IMG"; }}
                                    />
                                  )}
                                  {post.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={post.published ? "default" : "secondary"}>
                                  {post.published ? "Published" : "Draft"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(post.createdAt)}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {post.excerpt || <span className="text-gray-400 italic">No excerpt</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditPostClick(post)}
                                    className="text-blue-500 hover:bg-blue-50"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deletePostMutation.mutate(post.id)}
                                    disabled={deletePostMutation.isPending}
                                    className="text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-gray-500 italic">
                              No blog posts found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {startItem} to {endItem} of {totalItems} posts
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}