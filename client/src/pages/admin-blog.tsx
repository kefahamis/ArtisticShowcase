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
import { insertBlogPostSchema, type BlogPost } from "@shared/schema";
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
import { Pencil, Trash2, Plus, FileText, Eye, EyeOff, RefreshCw } from "lucide-react";

// --- Type Definitions ---
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

// --- Reducer Function ---
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

// --- Main Component ---
export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const [{ isDialogOpen, editingPost }, dispatch] = useReducer(adminBlogReducer, {
    isDialogOpen: false,
    editingPost: null,
  });
  const { toast } = useToast();
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // --- Authentication Check ---
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      console.warn("No admin_token found. Redirecting to login.");
      setLocation("/login");
    }
  }, [setLocation]);

  // --- Dialog Focus Management ---
  useEffect(() => {
    if (isDialogOpen && dialogContentRef.current) {
      const firstInput = dialogContentRef.current.querySelector('input, textarea') as HTMLElement;
      firstInput?.focus();
    }
  }, [isDialogOpen]);

  // --- Authenticated Request Helper with Debugging Logs ---
  const authenticatedRequest = useCallback(
    async <T,>(method: string, url: string, data?: any): Promise<T | null> => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        console.error("Authentication Error: No admin_token found. Redirecting.");
        setLocation("/login");
        throw new Error("Authentication failed: No token.");
      }

      console.log(`[Request] ${method} ${url}`);
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        console.log(`[Response] ${method} ${url} - Status: ${response.status}`);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_token");
          console.error(`Authentication Error: ${response.status} - Invalid or expired token. Redirecting.`);
          setLocation("/login");
          throw new Error("Authentication failed. Please log in again.");
        }

        if (!response.ok && response.status !== 304) { // Explicitly ignore 304 for error handling
          const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
          console.error(`API Error: ${response.status} for ${method} ${url}`, errorBody);
          throw new Error(errorBody.message || `API request failed with status: ${response.status}`);
        }

        // Return null for 204 No Content and 304 Not Modified
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

  // --- React Query: Fetch Blog Posts ---
  const {
    data: blogPosts = [],
    isLoading: loadingPosts,
    error: fetchError,
    refetch: refetchBlogPosts, // Expose refetch function for the manual refresh button
  } = useQuery<BlogPost[]>({
    queryKey: ["adminBlogPosts"],
    queryFn: () => authenticatedRequest<BlogPost[]>("GET", "/api/blog"),
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Data kept in cache for 10 minutes
  });

  // --- Error Handling for Fetching Posts ---
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Failed to load blog posts",
        description: fetchError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      console.error("Blog post fetch error:", fetchError);
    }
  }, [fetchError, toast]);

  // --- React Hook Form Setup ---
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
    resetOptions: {
      keepDirtyValues: false,
    }
  });

  // --- React Query: Mutations (Create, Update, Delete) ---
  const handleMutationSuccess = useCallback((message: string) => {
    // Invalidate the cache to force React Query to re-fetch the data from the server
    queryClient.invalidateQueries({ queryKey: ["adminBlogPosts"] });
    toast({ title: "Success", description: message });
    dispatch({ type: "CLOSE_DIALOG" });
    blogForm.reset();
  }, [blogForm, toast]);

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

  // --- Event Handlers ---
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

  const formatDate = useCallback((dateValue: string | Date | null) => {
    if (!dateValue) return "N/A";
    try {
      const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) {
        console.warn("Invalid date provided:", dateValue);
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      console.error("Error formatting date:", e, "Original value:", dateValue);
      return "Error Date";
    }
  }, []);

  // --- Pagination Logic ---
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

  // --- Rendered Component ---
  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Blog & News Management</h1>
            <div className="flex items-center gap-3">
              {/* Manual Refetch Button */}
              <Button
                variant="outline"
                onClick={() => {
                  refetchBlogPosts();
                  toast({ title: "Refreshing...", description: "Fetching the latest posts from the server." });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh List
              </Button>
              {/* Add Post Dialog Trigger */}
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  if (!open) {
                    dispatch({ type: "CLOSE_DIALOG" });
                    blogForm.reset();
                  } else {
                    dispatch({ type: "OPEN_DIALOG" });
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={handleAddPostClick} className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary-dark">
                    <Plus className="h-4 w-4" />
                    Add Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto z-[1000] bg-white p-6 rounded-lg shadow-xl"
                  role="dialog"
                  aria-labelledby="dialog-title"
                  ref={dialogContentRef}
                >
                  <DialogHeader className="pb-4 border-b border-gray-200 mb-4">
                    <DialogTitle id="dialog-title" className="text-2xl font-bold text-gray-800">
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
                              <FormLabel className="text-gray-700 font-medium">Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter post title" {...field} className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Excerpt</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Brief description of the post..."
                                  className="h-20 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Featured Image</FormLabel>
                              <FormControl>
                                <ImageUpload onImageSelect={field.onChange} currentImage={field.value} />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Content</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Write your blog post content here..."
                                  className="min-h-[200px] border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={blogForm.control}
                          name="published"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border border-gray-200 rounded-md bg-gray-50">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-gray-700 font-medium">Published</FormLabel>
                                <p className="text-sm text-gray-600">
                                  Make this post visible to visitors on the public site.
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="outline" onClick={() => dispatch({ type: "CLOSE_DIALOG" })} className="px-4 py-2 rounded-md text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPostMutation.isPending || updatePostMutation.isPending} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
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

        {/* Main Content Area */}
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
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                  <p>Loading blog posts...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[200px] text-gray-600 font-semibold text-sm">Title</TableHead>
                          <TableHead className="w-[120px] text-gray-600 font-semibold text-sm">Status</TableHead>
                          <TableHead className="w-[120px] text-gray-600 font-semibold text-sm">Created</TableHead>
                          <TableHead className="text-gray-600 font-semibold text-sm">Excerpt</TableHead>
                          <TableHead className="w-[100px] text-right text-gray-600 font-semibold text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPosts.length > 0 ? (
                          paginatedPosts.map((post: BlogPost) => (
                            <TableRow key={post.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <TableCell className="font-medium py-3">
                                <div className="flex items-center gap-3">
                                  {post.imageUrl && (
                                    <img
                                      src={post.imageUrl}
                                      alt={post.title}
                                      className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100"
                                      onError={(e) => { e.currentTarget.src = "https://placehold.co/48x48/e2e8f0/000000?text=IMG"; }}
                                    />
                                  )}
                                  <div className="font-medium text-gray-800">{post.title}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={post.published ? "default" : "secondary"} className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-semibold ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  {post.published ? "Published" : "Draft"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600 text-sm">{formatDate(post.createdAt)}</TableCell>
                              <TableCell className="max-w-xs truncate text-gray-700 text-sm">
                                {post.excerpt || <span className="text-gray-400 italic">No excerpt available</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditPostClick(post)} className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-md p-2 transition-colors" aria-label={`Edit ${post.title}`}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => deletePostMutation.mutate(post.id)} disabled={deletePostMutation.isPending} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md p-2 transition-colors" aria-label={`Delete ${post.title}`}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-gray-500 italic">
                              {loadingPosts ? "Loading posts..." : "No blog posts found. Click 'Add Blog Post' to create one."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{startItem}</span> to <span className="font-semibold">{endItem}</span> of <span className="font-semibold">{totalItems}</span> posts
                      </div>
                      <Pagination>
                        <PaginationContent className="flex items-center space-x-2">
                          <PaginationItem>
                            <PaginationPrevious onClick={previousPage} className={hasPrevious ? "cursor-pointer text-blue-600 hover:bg-blue-50" : "cursor-not-allowed opacity-50 text-gray-400"} />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink onClick={() => goToPage(page)} isActive={currentPage === page} className={`cursor-pointer px-3 py-1 rounded-md transition-colors duration-200 ${currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext onClick={nextPage} className={hasNext ? "cursor-pointer text-blue-600 hover:bg-blue-50" : "cursor-not-allowed opacity-50 text-gray-400"} />
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