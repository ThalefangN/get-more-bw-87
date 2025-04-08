
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DriverSignUpFormProps {
  onSignUpSuccess: () => void;
}

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const DriverSignUpForm: React.FC<DriverSignUpFormProps> = ({ onSignUpSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSignupError(null);
    
    try {
      // Create user account in Supabase Auth with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            role: 'driver'
          },
          emailRedirectTo: window.location.origin + '/driver-login?verified=true'
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user?.id) {
        throw new Error("Failed to create user account");
      }
      
      console.log("Auth user created successfully:", authData.user.id);

      // Create driver application record
      const { error: driverError } = await supabase
        .from('driver_applications')
        .insert({
          user_auth_id: authData.user.id,
          full_name: values.full_name,
          email: values.email,
          phone: "", // Will be collected later
          id_number: "", // Will be collected later
          license_number: "", // Will be collected later
          car_model: "", // Will be collected later
          car_year: "", // Will be collected later
          status: 'pending_profile_completion'
        });
      
      if (driverError) {
        console.error("Driver application creation error:", driverError);
        throw new Error("Registration failed. Please try again later.");
      }
      
      // Success message
      toast.success("Account created successfully", {
        description: "Please check your email to confirm your account.",
      });
      
      onSignUpSuccess();
      
    } catch (error: any) {
      console.error("Driver signup error:", error);
      
      // Set a user-friendly error message
      setSignupError(error.message || "Registration failed. Please try again later.");
      
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Error alert */}
        {signupError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{signupError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                    placeholder="Create a password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm your password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormDescription className="text-center">
          After creating your account, you'll need to complete your driver profile 
          with additional information and documents.
        </FormDescription>
        
        <Button 
          type="submit" 
          className="w-full bg-getmore-purple hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create Driver Account
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default DriverSignUpForm;
