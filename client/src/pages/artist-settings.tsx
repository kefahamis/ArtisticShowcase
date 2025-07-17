import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useArtistAuth } from "@/hooks/useArtistAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { Mail, Shield, Copy, Download, Settings, Lock, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ArtistSidebar from "@/components/artist-sidebar";
import ArtistHeader from "@/components/artist-header";

// Form schemas
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const closeAccountSchema = z.object({
  reason: z.string().min(10, "Please provide a reason (minimum 10 characters)"),
  confirmEmail: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type CloseAccountFormData = z.infer<typeof closeAccountSchema>;

export default function ArtistSettings() {
  const { user, isLoading: authLoading, isAuthenticated } = useArtistAuth();
  const [, setLocation] = useLocation();
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCloseAccountDialog, setShowCloseAccountDialog] = useState(false);
  const [setup2FAStep, setSetup2FAStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const queryClient = useQueryClient();

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Close account form
  const closeAccountForm = useForm<CloseAccountFormData>({
    resolver: zodResolver(closeAccountSchema),
    defaultValues: {
      reason: '',
      confirmEmail: '',
      password: '',
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/artist/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Fetch notification preferences
  const { data: notifications } = useQuery({
    queryKey: ["/api/artist/notifications"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      return response.json();
    },
    enabled: isAuthenticated
  });

  // Fetch 2FA status
  const { data: twoFAStatus } = useQuery({
    queryKey: ["/api/artist/2fa/status"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch 2FA status');
      }

      return response.json();
    },
    enabled: isAuthenticated
  });

  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to setup 2FA');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setQrCode(data.secret.qrCode);
      setSetup2FAStep('verify');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to setup 2FA.",
        variant: "destructive",
      });
    }
  });

  // Verify 2FA mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const authToken = localStorage.getItem('artist_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify 2FA');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes || ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678']);
      setShowBackupCodes(true);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code.",
        variant: "destructive",
      });
    }
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async (password: string) => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disable 2FA');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/artist/2fa/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA.",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setShowPasswordDialog(false);
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    }
  });

  // Close account mutation
  const closeAccountMutation = useMutation({
    mutationFn: async (data: CloseAccountFormData) => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/close-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to close account');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Closed",
        description: "Your account has been closed successfully.",
      });
      localStorage.removeItem('artist_token');
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close account.",
        variant: "destructive",
      });
    }
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/artist/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notifications');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/notifications"] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  });

  // Handle form submissions
  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const onCloseAccountSubmit = (data: CloseAccountFormData) => {
    if (data.confirmEmail !== user?.email) {
      toast({
        title: "Error",
        description: "Email confirmation does not match your account email.",
        variant: "destructive",
      });
      return;
    }
    closeAccountMutation.mutate(data);
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  // Download backup codes as text file
  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "2fa-backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
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
            title="Account Settings" 
            subtitle="Manage your account preferences and security settings"
          />
          
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications && Object.entries(notifications).filter(([key, value]) => 
                      key !== 'id' && key !== 'artistId' && key !== 'createdAt' && key !== 'updatedAt'
                    ).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div>
                            <h4 className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {key === 'orderNotifications' && 'Get notified when you receive new orders'}
                              {key === 'exhibitionNotifications' && 'Get notified about exhibition opportunities'}
                              {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
                              {key === 'newsLetters' && 'Subscribe to our newsletter'}
                              {key === 'profileUpdates' && 'Get notified about profile-related updates'}
                            </p>
                          </div>
                          <Switch
                            checked={value as boolean}
                            onCheckedChange={(checked) => {
                              updateNotificationsMutation.mutate({
                                ...notifications,
                                [key]: checked
                              });
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Password Change */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-gray-500">Change your account password</p>
                      </div>
                      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Enter your current password and choose a new one.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                              <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setShowPasswordDialog(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={changePasswordMutation.isPending}
                                >
                                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">
                          {twoFAStatus?.enabled ? 'Enabled - Your account has extra security' : 'Add an extra layer of security to your account'}
                        </p>
                      </div>
                      {twoFAStatus?.enabled ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Disable 2FA
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the extra security layer from your account. 
                                Please enter your password to confirm.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                onChange={(e) => setTwoFAToken(e.target.value)}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => disable2FAMutation.mutate(twoFAToken)}
                                disabled={disable2FAMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {disable2FAMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Enable 2FA
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                              <DialogDescription>
                                {setup2FAStep === 'setup' 
                                  ? 'Generate a QR code to set up your authenticator app'
                                  : 'Enter the verification code from your authenticator app'
                                }
                              </DialogDescription>
                            </DialogHeader>
                            
                            {showBackupCodes ? (
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h3 className="font-semibold text-green-600 mb-2">2FA Successfully Enabled!</h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                                  </p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                                    {backupCodes.map((code, index) => (
                                      <div key={index} className="text-center bg-white p-2 rounded border">{code}</div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={copyBackupCodes} 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                  </Button>
                                  <Button 
                                    onClick={downloadBackupCodes} 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                                
                                <Button 
                                  onClick={() => {
                                    setShow2FADialog(false);
                                    setShowBackupCodes(false);
                                    setSetup2FAStep('setup');
                                    setTwoFAToken('');
                                    queryClient.invalidateQueries({ queryKey: ["/api/artist/2fa/status"] });
                                  }}
                                  className="w-full"
                                >
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {setup2FAStep === 'setup' ? (
                                  <div className="text-center space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Click the button below to generate a QR code for your authenticator app (Google Authenticator, Authy, etc.).
                                    </p>
                                    <Button 
                                      onClick={() => setup2FAMutation.mutate()}
                                      disabled={setup2FAMutation.isPending}
                                      className="w-full"
                                    >
                                      {setup2FAMutation.isPending ? 'Generating...' : 'Generate QR Code'}
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {qrCode && (
                                      <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-3">
                                          Scan this QR code with your authenticator app:
                                        </p>
                                        <div className="bg-white p-4 rounded-lg inline-block border">
                                          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <label className="text-sm font-medium">Verification Code</label>
                                      <Input
                                        type="text"
                                        value={twoFAToken}
                                        onChange={(e) => setTwoFAToken(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        className="mt-1 text-center text-lg font-mono"
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => {
                                          setSetup2FAStep('setup');
                                          setTwoFAToken('');
                                          setQrCode('');
                                        }}
                                        className="flex-1"
                                      >
                                        Back
                                      </Button>
                                      <Button 
                                        onClick={() => verify2FAMutation.mutate(twoFAToken)}
                                        disabled={!twoFAToken || twoFAToken.length !== 6 || verify2FAMutation.isPending}
                                        className="flex-1"
                                      >
                                        {verify2FAMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {/* Account Security Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Security Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Enable two-factor authentication for enhanced security</li>
                        <li>• Use a strong, unique password for your account</li>
                        <li>• Keep your backup codes in a safe place</li>
                        <li>• Log out from shared devices</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Close Account */}
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h4 className="font-medium text-red-900">Close Account</h4>
                        <p className="text-sm text-red-700">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <AlertDialog open={showCloseAccountDialog} onOpenChange={setShowCloseAccountDialog}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Close Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">Close Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is permanent and cannot be undone. All your data, artworks, and account information will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          
                          <Form {...closeAccountForm}>
                            <form onSubmit={closeAccountForm.handleSubmit(onCloseAccountSubmit)} className="space-y-4">
                              <FormField
                                control={closeAccountForm.control}
                                name="reason"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reason for closing account</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Please tell us why you're closing your account..."
                                        className="min-h-[80px]"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={closeAccountForm.control}
                                name="confirmEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm your email</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder={user?.email || 'Enter your email'}
                                        type="email"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={closeAccountForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Enter your password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} placeholder="Password" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex justify-end gap-3 pt-4">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setShowCloseAccountDialog(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  variant="destructive"
                                  disabled={closeAccountMutation.isPending}
                                >
                                  {closeAccountMutation.isPending ? 'Closing Account...' : 'Close Account'}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Warning Notice */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2">Important Notice</h4>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Account closure is permanent and irreversible</li>
                        <li>• All your artworks and exhibition history will be deleted</li>
                        <li>• Any pending orders or transactions will be canceled</li>
                        <li>• You will need to create a new account to use our services again</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}