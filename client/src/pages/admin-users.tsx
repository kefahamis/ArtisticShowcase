import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, MoreVertical, Edit, Trash2, Search, Shield, User, Mail, Phone } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePagination } from "@/hooks/use-pagination";
import AdminHeader from "@/components/admin-header";
import AdminFooter from "@/components/admin-footer";
import AdminSidebar from "@/components/admin-sidebar";

const userAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["customer", "admin"]).default("customer"),
  isActive: z.boolean().default(true),
});

const editUserSchema = userAccountSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type UserAccount = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/user-accounts"],
  });

  const createForm = useForm({
    resolver: zodResolver(userAccountSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      role: "customer",
      isActive: true,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(editUserSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/user-accounts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "User account created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/user-accounts"] });
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
      await apiRequest(`/api/user-accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "User account updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/user-accounts"] });
      setIsEditOpen(false);
      setSelectedUser(null);
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
      await apiRequest(`/api/user-accounts/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({ title: "User account deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/user-accounts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users
  const filteredUsers = users.filter((user: UserAccount) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const {
    currentItems: currentUsers,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination({ data: filteredUsers, itemsPerPage: 10 });

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    editForm.reset({
      ...user,
      password: "", // Don't populate password
    });
    setIsEditOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "customer": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <AdminSidebar>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create User Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input {...createForm.register("firstName")} />
                      {createForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {createForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input {...createForm.register("lastName")} />
                      {createForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {createForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input {...createForm.register("email")} type="email" />
                    {createForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {createForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input {...createForm.register("password")} type="password" />
                    {createForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {createForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input {...createForm.register("phone")} />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Select onValueChange={(value) => createForm.setValue("role", value as "customer" | "admin")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : currentUsers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No users match your search criteria." : "Create your first user account to get started."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">User</th>
                          <th className="text-left p-4 font-medium text-gray-900">Contact</th>
                          <th className="text-left p-4 font-medium text-gray-900">Role</th>
                          <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Joined</th>
                          <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user: UserAccount) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  {user.role === 'admin' ? (
                                    <Shield className="w-5 h-5 text-gray-600" />
                                  ) : (
                                    <User className="w-5 h-5 text-gray-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.email.split('@')[0]
                                    }
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-4 h-4" />
                                  <span className={user.emailVerified ? "text-green-600" : "text-red-600"}>
                                    {user.emailVerified ? "Verified" : "Unverified"}
                                  </span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(user.isActive)}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteMutation.mutate(user.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
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
            <DialogTitle>Edit User Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit((data) => 
            selectedUser && updateMutation.mutate({ id: selectedUser.id, data })
          )} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input {...editForm.register("firstName")} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input {...editForm.register("lastName")} />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input {...editForm.register("email")} type="email" />
            </div>

            <div>
              <Label>New Password (leave blank to keep current)</Label>
              <Input {...editForm.register("password")} type="password" />
            </div>

            <div>
              <Label>Phone</Label>
              <Input {...editForm.register("phone")} />
            </div>

            <div>
              <Label>Role</Label>
              <Select onValueChange={(value) => editForm.setValue("role", value as "customer" | "admin")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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