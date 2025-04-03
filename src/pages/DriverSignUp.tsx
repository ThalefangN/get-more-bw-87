
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, ChevronRight, FileText, Upload } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
  phone: z.string().min(8, {
    message: "Please enter a valid phone number.",
  }),
  idNumber: z.string().min(6, {
    message: "Please enter a valid ID number.",
  }),
  licenseNumber: z.string().min(6, {
    message: "Please enter a valid license number.",
  }),
  carModel: z.string().min(2, {
    message: "Please enter your car model.",
  }),
  carYear: z.string().min(4, {
    message: "Please enter a valid year.",
  }),
  // Using boolean().refine() instead of literal(true)
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const DriverSignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [carPhotos, setCarPhotos] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      idNumber: "",
      licenseNumber: "",
      carModel: "",
      carYear: "",
      termsAgreed: false,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  async function uploadFile(file: File, path: string): Promise<string | null> {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      // 1. First create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: 'driver',
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("User creation failed");
      }
      
      // 2. Upload documents to Supabase Storage
      let idDocUrl = null;
      let licenseDocUrl = null;
      let carPhotosUrl = null;
      let profilePhotoUrl = null;
      
      if (idDocument) {
        idDocUrl = await uploadFile(idDocument, 'id-documents');
      }
      
      if (licenseDocument) {
        licenseDocUrl = await uploadFile(licenseDocument, 'license-documents');
      }
      
      if (carPhotos) {
        carPhotosUrl = await uploadFile(carPhotos, 'car-photos');
      }
      
      if (profilePhoto) {
        profilePhotoUrl = await uploadFile(profilePhoto, 'profile-photos');
      }
      
      // 3. Insert driver details into our drivers table
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          id: authData.user.id,
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          id_number: values.idNumber,
          license_number: values.licenseNumber,
          car_model: values.carModel,
          car_year: values.carYear,
          status: 'pending',
          id_document_url: idDocUrl,
          license_document_url: licenseDocUrl,
          car_photos_url: carPhotosUrl,
          profile_photo_url: profilePhotoUrl
        });
      
      if (driverError) throw driverError;
      
      toast.success("Application submitted successfully!", {
        description: "Please check your email to verify your account. Once verified, you can log in.",
      });
      
      // Navigate to the login page after successful signup
      setTimeout(() => {
        navigate('/driver-login');
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("Signup failed", {
        description: error.message || "Please check your details and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container-custom max-w-xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-getmore-purple p-6 text-center text-white">
              <Car size={48} className="mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Driver Sign Up</h1>
              <p className="text-sm opacity-80">Join our team of drivers today</p>
            </div>
            
            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Personal Information</h2>
                    
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <Input placeholder="e.g. 71234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h2 className="text-lg font-semibold">Vehicle & License Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
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
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your license number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h2 className="text-lg font-semibold">Document Upload</h2>
                    <p className="text-sm text-gray-500">Please upload the required documents for verification</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="block mb-2">ID Document</FormLabel>
                        <div className="border border-gray-300 rounded-lg p-3">
                          <label className="flex flex-col items-center space-y-2 cursor-pointer">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {idDocument ? idDocument.name : 'Upload ID'}
                            </span>
                            <span className="text-xs text-gray-500">JPG, PNG or PDF</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileChange(e, setIdDocument)}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <FormLabel className="block mb-2">Driver's License</FormLabel>
                        <div className="border border-gray-300 rounded-lg p-3">
                          <label className="flex flex-col items-center space-y-2 cursor-pointer">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {licenseDocument ? licenseDocument.name : 'Upload License'}
                            </span>
                            <span className="text-xs text-gray-500">JPG, PNG or PDF</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleFileChange(e, setLicenseDocument)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="block mb-2">Car Photos</FormLabel>
                        <div className="border border-gray-300 rounded-lg p-3">
                          <label className="flex flex-col items-center space-y-2 cursor-pointer">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {carPhotos ? carPhotos.name : 'Upload Car Photos'}
                            </span>
                            <span className="text-xs text-gray-500">JPG or PNG</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setCarPhotos)}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <FormLabel className="block mb-2">Profile Photo</FormLabel>
                        <div className="border border-gray-300 rounded-lg p-3">
                          <label className="flex flex-col items-center space-y-2 cursor-pointer">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {profilePhoto ? profilePhoto.name : 'Upload Profile Photo'}
                            </span>
                            <span className="text-xs text-gray-500">JPG or PNG</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, setProfilePhoto)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <FormField
                      control={form.control}
                      name="termsAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{" "}
                              <Link to="/driver-terms" className="text-getmore-purple hover:underline">
                                Terms and Conditions
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-getmore-purple hover:bg-purple-700"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting Application..." : "Submit Application"}
                  </Button>
                  
                  <div className="text-center text-sm">
                    <p className="text-gray-500">
                      Already have an account?{" "}
                      <Link to="/driver-login" className="text-getmore-purple hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start">
              <FileText className="text-getmore-purple h-6 w-6 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">What happens next?</h3>
                <ul className="text-gray-600 mt-2 space-y-2 text-sm list-disc pl-5">
                  <li>Your application will be reviewed by our team.</li>
                  <li>You'll receive a verification email - please verify your email address.</li>
                  <li>After verification, our team will review your documents.</li>
                  <li>Once approved, you'll be able to log in and start accepting ride requests.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-500">
                  For any questions, please contact our support team at support@getmorebw.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DriverSignUp;
