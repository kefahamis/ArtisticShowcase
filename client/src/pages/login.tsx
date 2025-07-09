import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, User, Mail, UserPlus } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginCredentials, setLoginCredentials] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const { toast } = useToast();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginCredentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("admin_token", data.token);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel.",
      });
      
      setLocation("/admin");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupLoading(true);

    // Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsSignupLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signupData.email,
          email: signupData.email,
          password: signupData.password,
          firstName: signupData.firstName,
          lastName: signupData.lastName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      toast({
        title: "Account Created Successfully",
        description: "You can now sign in with your credentials.",
      });
      
      // Clear signup form
      setSignupData({ 
        firstName: "", 
        lastName: "", 
        email: "", 
        password: "", 
        confirmPassword: "" 
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-wide">
            MY ACCOUNT
          </h1>
          <p className="text-lg text-gray-300 font-light">
            Sign in to your account or create a new one to access exclusive features
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Login Form */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-serif font-light tracking-wide">
                  CUSTOMER LOGIN
                </CardTitle>
                <p className="text-gray-600 font-light">
                  Sign in to access your account
                </p>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-sm font-medium tracking-wide uppercase">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginCredentials.username}
                        onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium tracking-wide uppercase">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginCredentials.password}
                        onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                        className="pl-10 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-gray-600 hover:text-black transition-colors">
                      Forgot Password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-800 font-medium tracking-widest uppercase text-sm py-4 h-12"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? "SIGNING IN..." : "SIGN IN"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}