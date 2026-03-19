import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type Artist } from "@shared/schema";
import AdminSidebar from "@/components/admin-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Mail,
  Loader2,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminArtistApprovals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    artist: Artist;
  } | null>(null);
  const [processingArtistId, setProcessingArtistId] = useState<number | null>(null);

  // Check authentication on mount
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
      setLocation("/login");
      throw new Error("No authentication token");
    }

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

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the status text or a generic message
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch {
      // Handle case where response is not JSON
      throw new Error("Invalid response format from server");
    }
  };

  // Query for pending artists with real-time refresh
  const { data: pendingArtists = [], isLoading, error, refetch } = useQuery({
    queryKey: ["pendingArtists"],
    queryFn: () => authenticatedRequest("GET", "/api/admin/artists/pending"),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Approve artist mutation with optimistic updates
  const approveArtistMutation = useMutation({
    mutationFn: async (artistId: number) => {
      setProcessingArtistId(artistId);
      return authenticatedRequest("POST", `/api/admin/artists/${artistId}/approve`);
    },
    onMutate: async (artistId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["pendingArtists"] });
      
      // Snapshot the previous value
      const previousArtists = queryClient.getQueryData(["pendingArtists"]);
      
      // Optimistically update by removing the artist from pending list
      queryClient.setQueryData(["pendingArtists"], (old: Artist[] = []) => 
        old.filter(artist => artist.id !== artistId)
      );
      
      return { previousArtists };
    },
    onSuccess: (data) => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["pendingArtists"] });
      queryClient.invalidateQueries({ queryKey: ["adminArtists"] });
      toast({ 
        title: "Artist Approved", 
        description: `${data.artist.name} has been approved and notified by email.` 
      });
      setConfirmAction(null);
      setProcessingArtistId(null);
    },
    onError: (error: any, artistId, context) => {
      // Revert optimistic update on error
      if (context?.previousArtists) {
        queryClient.setQueryData(["pendingArtists"], context.previousArtists);
      }
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
      setProcessingArtistId(null);
    },
  });

  // Reject artist mutation with optimistic updates
  const rejectArtistMutation = useMutation({
    mutationFn: async (artistId: number) => {
      setProcessingArtistId(artistId);
      return authenticatedRequest("POST", `/api/admin/artists/${artistId}/reject`);
    },
    onMutate: async (artistId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["pendingArtists"] });
      
      // Snapshot the previous value
      const previousArtists = queryClient.getQueryData(["pendingArtists"]);
      
      // Optimistically update by removing the artist from pending list
      queryClient.setQueryData(["pendingArtists"], (old: Artist[] = []) => 
        old.filter(artist => artist.id !== artistId)
      );
      
      return { previousArtists };
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["pendingArtists"] });
      queryClient.invalidateQueries({ queryKey: ["adminArtists"] });
      toast({ 
        title: "Artist Rejected", 
        description: "Artist registration has been rejected and they have been notified." 
      });
      setConfirmAction(null);
      setProcessingArtistId(null);
    },
    onError: (error: any, artistId, context) => {
      // Revert optimistic update on error
      if (context?.previousArtists) {
        queryClient.setQueryData(["pendingArtists"], context.previousArtists);
      }
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
      setProcessingArtistId(null);
    },
  });

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'approve') {
      approveArtistMutation.mutate(confirmAction.artist.id);
    } else {
      rejectArtistMutation.mutate(confirmAction.artist.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error loading pending artists: {error.message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header Section */}
        <header className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold">Artist Approvals</h1>
            <Badge variant="secondary" className="text-sm">
              {pendingArtists.length} Pending
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="text-xs animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Updating...
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingArtists.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {processingArtistId ? 1 : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions Today</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Approvals/rejections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Artists Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Pending Artist Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingArtists.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pending Approvals
                </h3>
                <p className="text-gray-500">
                  All artist registrations have been processed.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingArtists.map((artist) => (
                    <TableRow key={artist.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{artist.name}</div>
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-1" />
                          {artist.userId ? "Linked Account" : "No Email"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{artist.specialty}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {artist.bio}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(artist.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setConfirmAction({ type: 'approve', artist })}
                            disabled={processingArtistId === artist.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingArtistId === artist.id && confirmAction?.type === 'approve' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmAction({ type: 'reject', artist })}
                            disabled={processingArtistId === artist.id}
                          >
                            {processingArtistId === artist.id && confirmAction?.type === 'reject' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.type === 'approve' ? 'Approve Artist' : 'Reject Artist'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.type === 'approve' ? (
                  <>
                    Are you sure you want to approve <strong>{confirmAction?.artist.name}</strong>?
                    They will receive an email notification and be able to log into their account.
                  </>
                ) : (
                  <>
                    Are you sure you want to reject <strong>{confirmAction?.artist.name}</strong>?
                    Their account and registration will be permanently deleted, and they will be notified by email.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                className={confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminSidebar>
  );
}