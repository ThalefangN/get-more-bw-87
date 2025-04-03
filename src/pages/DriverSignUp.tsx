
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, FileCheck, Shield, Info, Upload, Check, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(8, {
    message: "Phone number must be at least 8 digits.",
  }),
  idNumber: z.string().min(4, {
    message: "ID number must be provided.",
  }),
  licenseNumber: z.string().min(4, {
    message: "License number must be provided.",
  }),
  carModel: z.string().min(2, {
    message: "Car model must be provided.",
  }),
  carYear: z.string().min(4, {
    message: "Please enter a valid year.",
  }),
  // The key fix is here - using boolean().refine() instead of literal(true)
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  }),
});

const DriverSignUp = () => {
  const navigate = useNavigate();
  const [idDocUploaded, setIdDocUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [carPhotoUploaded, setCarPhotoUploaded] = useState(false);
  const [profilePhotoUploaded, setProfilePhotoUploaded] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      idNumber: "",
      licenseNumber: "",
      carModel: "",
      carYear: "",
      termsAgreed: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if all required files are uploaded
    if (!idDocUploaded || !licenseUploaded || !carPhotoUploaded || !profilePhotoUploaded) {
      toast.error("Please upload all required documents", {
        description: "Your application cannot be processed without these documents."
      });
      return;
    }
    
    console.log(values);
    
    // In a real application, this would send the form data to the backend
    toast.success("Application submitted successfully!", {
      description: "We'll review your application and get back to you soon.",
    });
    
    // Navigate to the driver login page after submission
    setTimeout(() => {
      navigate('/driver-login');
    }, 2000);
  }

  const simulateFileUpload = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    toast.info("Uploading document...");
    
    // Simulate API call
    setTimeout(() => {
      setter(true);
      toast.success("Document uploaded successfully!");
    }, 1500);
  };
  
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">Join <span className="text-getmore-purple">GetMore</span> as a Driver</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start earning by driving with us. Complete the form below to begin your application process.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Kabo Moeng" {...field} />
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
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+267 71234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Omang ID Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your ID number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver's License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your license number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="carModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Car Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Toyota Corolla" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="carYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Car Year</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2018" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col">
                        <span className="font-medium mb-2">Omang ID (Both sides)</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className={`min-h-[60px] ${idDocUploaded ? 'border-green-500 text-green-700' : ''}`}
                          onClick={() => simulateFileUpload(setIdDocUploaded)}
                        >
                          {idDocUploaded ? (
                            <><Check className="mr-2" /> ID Document Uploaded</>
                          ) : (
                            <><Upload className="mr-2" /> Upload ID Document</>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium mb-2">Driver's License (Both sides)</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className={`min-h-[60px] ${licenseUploaded ? 'border-green-500 text-green-700' : ''}`}
                          onClick={() => simulateFileUpload(setLicenseUploaded)}
                        >
                          {licenseUploaded ? (
                            <><Check className="mr-2" /> License Uploaded</>
                          ) : (
                            <><Upload className="mr-2" /> Upload License</>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium mb-2">Car Photos (Front, Side, Back)</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className={`min-h-[60px] ${carPhotoUploaded ? 'border-green-500 text-green-700' : ''}`}
                          onClick={() => simulateFileUpload(setCarPhotoUploaded)}
                        >
                          {carPhotoUploaded ? (
                            <><Check className="mr-2" /> Car Photos Uploaded</>
                          ) : (
                            <><Upload className="mr-2" /> Upload Car Photos</>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium mb-2">Profile Photo</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className={`min-h-[60px] ${profilePhotoUploaded ? 'border-green-500 text-green-700' : ''}`}
                          onClick={() => simulateFileUpload(setProfilePhotoUploaded)}
                        >
                          {profilePhotoUploaded ? (
                            <><Check className="mr-2" /> Profile Photo Uploaded</>
                          ) : (
                            <><Upload className="mr-2" /> Upload Profile Photo</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="termsAgreed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the <Link to="/driver-terms" className="text-getmore-purple hover:underline">Driver Terms and Conditions</Link>
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you confirm that you have read and agree to our terms for drivers.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col gap-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-getmore-purple hover:bg-purple-700"
                      size="lg"
                    >
                      Submit Application
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <p className="text-sm text-gray-500 text-center">
                      Already a driver? <Link to="/driver-login" className="text-getmore-purple hover:underline">Sign in here</Link>
                    </p>
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

export default DriverSignUp;
