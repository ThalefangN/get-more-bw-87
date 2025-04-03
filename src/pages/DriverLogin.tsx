
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, LogIn, ChevronRight, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
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
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) throw error;
      
      if (data) {
        // Fetch the driver details to verify they exist
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('email', values.email)
          .single();
          
        if (driverError) {
          if (driverError.code === 'PGRST116') {
            // No matching driver record found
            toast.error("Account not found", {
              description: "No driver account associated with this email. Please sign up first.",
            });
            await supabase.auth.signOut();
            return;
          }
          throw driverError;
        }
        
        toast.success("Login successful!", {
          description: "Welcome back to GetMore BW.",
        });
        
        // Navigate to the driver dashboard after successful login
        setTimeout(() => {
          navigate('/driver-dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen flex items-center">
        <div className="container-custom max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-getmore-purple p-6 text-center text-white">
              <Car size={48} className="mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Driver Login</h1>
              <p className="text-sm opacity-80">Sign in to your driver account</p>
            </div>
            
            <div className="p-8">
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
                      <Link to="#" className="text-getmore-purple hover:underline">
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
