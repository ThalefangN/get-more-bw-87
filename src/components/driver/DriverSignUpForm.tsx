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
  phone: z.string().min(8, {
    message: "Please enter a valid phone number.",
  }),
  id_number: z.string().min(4, {
    message: "ID number must be provided.",
  }),
  license_number: z.string().min(3, {
    message: "License number must be provided.",
  }),
  car_model: z.string().min(2, {
    message: "Car model must be provided.",
  }),
  car_year: z.string().min(4, {
    message: "Please enter a valid car year.",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const DriverSignUpForm: React.FC<DriverSignUpFormProps> = ({ onSignUpSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [signupError, setSignupError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      phone: "",
      id_number: "",
      license_number: "",
      car_model: "",
      car_year: ""
    },
  });

  const nextStep = async () => {
    // Validate just the fields for the current step
    if (step === 1) {
      const accountFields = ['full_name', 'email', 'password', 'confirm_password', 'phone'];
      const result = await form.trigger(accountFields as any);
      if (result) setStep(2);
      return result;
    }
    return true;
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setSignupError(null); // Clear any errors when going back
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSignupError(null);
    
    try {
      // Step 1: Create user account first in Supabase Auth with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            phone: values.phone,
            role: 'driver'
          },
          emailRedirectTo: window.location.origin + '/driver-login?verified=true'
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user?.id) {
        throw new Error("Failed to create user account");
      }
      
      // Step 2: Create driver record in our drivers table WITHOUT using the same ID
      // This is the key change - we'll create a driver record with its own UUID
      const driverData = {
        // Remove the ID field so Supabase generates a new UUID
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        id_number: values.id_number,
        license_number: values.license_number,
        car_model: values.car_model,
        car_year: values.car_year,
        status: 'pending'
      };
      
      const { error: driverError } = await supabase
        .from('drivers')
        .insert([driverData]);
      
      if (driverError) {
        console.error("Driver registration error:", driverError);
        
        // If specific error related to foreign key, provide a clearer message
        if (driverError.message?.includes('violates foreign key constraint') ||
            driverError.message?.includes('violates row-level security policy')) {
          throw new Error("Registration failed. Please try again later or contact support.");
        }
        
        throw driverError;
      }
      
      // All steps completed successfully
      toast.success("Application submitted successfully", {
        description: "Please check your email to confirm your account.",
      });
      
      // No need to sign out as we want them to verify their email
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
        
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-getmore-purple text-white' : 'bg-gray-200'} mr-2`}>
            1
          </div>
          <div className="h-1 w-8 bg-gray-200">
            <div className={`h-full ${step >= 2 ? 'bg-getmore-purple' : 'bg-gray-300'}`} style={{ width: `${step > 1 ? '100%' : '0%'}` }}></div>
          </div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-getmore-purple text-white' : 'bg-gray-200'} ml-2`}>
            2
          </div>
        </div>
        
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        {/* Step 2: Driver Information */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your national ID number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver's License Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your driver's license number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="car_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Model</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g., Toyota Corolla" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="car_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Year</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g., 2020" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="md:col-span-2">
              <FormDescription className="text-center">
                Note: After submission, your application will be reviewed by our team. 
                You will receive an email notification once your application is approved.
              </FormDescription>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button 
              type="button" 
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 2 ? (
            <Button 
              type="button" 
              onClick={nextStep}
            >
              Next
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="bg-getmore-purple hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default DriverSignUpForm;
