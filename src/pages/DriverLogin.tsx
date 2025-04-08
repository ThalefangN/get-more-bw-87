
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, LogIn, ChevronRight, User, AlertCircle, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const DriverLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resendEmailLoading, setResendEmailLoading] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Check URL parameters for verification status
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const verified = queryParams.get('verified');
    
    if (verified === 'true') {
      toast.success("Email verified successfully", {
        description: "You can now log in to your account."
      });
    }
    
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If session exists, check if driver application exists
        const { data: driverData, error } = await supabase
          .from('driver_applications')
          .select('*')
          .eq('user_auth_id', data.session.user.id)
          .maybeSingle();
          
        if (driverData && !error) {
          // Driver already logged in, redirect to dashboard
          navigate('/driver-dashboard');
        }
      }
    };
    
    checkSession();
  }, [navigate, location]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Function to resend verification email
  const handleResendVerification = async () => {
    if (!emailForVerification) return;
    
    setResendEmailLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForVerification,
        options: {
          emailRedirectTo: window.location.origin + '/driver-login?verified=true'
        }
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent", {
        description: "Please check your inbox and spam folder."
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email", {
        description: error.message
      });
    } finally {
      setResendEmailLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLoginError(null);
    setShowVerificationMessage(false);
    
    try {
      // Removed the admin.listUsers call that was causing the TypeScript error
      
      // First try to log in
      const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      // Handle email not confirmed error
      if (loginError && loginError.message?.includes('Email not confirmed')) {
        setEmailForVerification(values.email);
        setShowVerificationMessage(true);
        setLoginError("Please verify your email address before logging in.");
        setIsLoading(false);
        return;
      }
      
      if (loginError) throw loginError;
      
      // Use login from AuthContext instead of direct Supabase call
      await login(values.email, values.password);
      
      // After successful login, check if driver application exists
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser?.user) {
        throw new Error("Login failed");
      }
      
      const { data: driverData, error: driverError } = await supabase
        .from('driver_applications')
        .select('*')
        .eq('user_auth_id', currentUser.user.id)
        .maybeSingle();
        
      if (driverError) {
        if (driverError.code === 'PGRST116') {
          // No matching driver record found
          setLoginError("No driver account associated with this email. Please sign up first.");
          toast.error("Account not found", {
            description: "No driver account associated with this email. Please sign up first.",
          });
          await supabase.auth.signOut();
          return;
        }
        throw driverError;
      }
      
      if (!driverData) {
        setLoginError("No driver account associated with this email. Please sign up first.");
        toast.error("Account not found", {
          description: "No driver account associated with this email. Please sign up first.",
        });
        await supabase.auth.signOut();
        return;
      }
      
      // Check if the account is verified/approved by admin
      if (driverData.status === 'pending_profile_completion') {
        toast.info("Profile completion required", {
          description: "Please complete your profile information to continue with the application process.",
        });
      } else if (driverData.status === 'pending') {
        toast.info("Account pending verification", {
          description: "Your driver account is pending verification by our admin team. You can check your status in the dashboard.",
        });
      } else if (driverData.status === 'rejected') {
        toast.error("Account verification failed", {
          description: "Your driver application was not approved. Please contact support for more information.",
        });
      } else if (driverData.status === 'active') {
        toast.success("Login successful!", {
          description: "Welcome back to GetMore BW.",
        });
      }
      
      // Navigate to the driver dashboard after successful login
      setTimeout(() => {
        navigate('/driver-dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if this is a "Email not confirmed" error
      if (error.message?.includes('Email not confirmed')) {
        setEmailForVerification(values.email);
        setShowVerificationMessage(true);
        setLoginError("Please verify your email address before logging in.");
      } else {
        setLoginError(error.message || "Please check your credentials and try again.");
        toast.error("Login failed", {
          description: error.message || "Please check your credentials and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen flex items-center">
        <div className="container-custom max-w-lg">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-getmore-purple p-6 text-center text-white">
              <Car size={48} className="mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Driver Login</h1>
              <p className="text-sm opacity-80">Sign in to your driver account</p>
            </div>
            
            <div className="p-8">
              {loginError && !showVerificationMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              {showVerificationMessage && (
                <Alert className="mb-6 bg-amber-50 border-amber-300">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    Please verify your email address before logging in. 
                    <Button 
                      variant="link" 
                      className="text-amber-700 underline p-0 h-auto ml-1"
                      onClick={handleResendVerification}
                      disabled={resendEmailLoading}
                    >
                      {resendEmailLoading ? "Sending..." : "Resend verification email"}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-getmore-purple hover:bg-purple-700"
                    size="lg"
                    disabled={isLoading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="space-y-4 pt-4">
                    <div className="text-sm text-center">
                      <Link to="/forgot-password" className="text-getmore-purple hover:underline">
                        Forgot your password?
                      </Link>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Don't have an account yet?
                      </p>
                      <Link 
                        to="/driver-signup" 
                        className="inline-flex items-center text-getmore-purple hover:underline mt-1"
                      >
                        <User className="mr-1 h-4 w-4" />
                        Sign up as a driver
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DriverLogin;
