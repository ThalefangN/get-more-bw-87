
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, ChevronRight, User } from 'lucide-react';
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
import DriverSignUpForm from '@/components/driver/DriverSignUpForm';

const DriverSignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSignupSuccess = () => {
    // Navigate to login page with success message
    toast.success("Sign up successful", {
      description: "Please sign in to access your driver dashboard."
    });
    
    setTimeout(() => {
      navigate('/driver-login');
    }, 1500);
  };
  
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container-custom max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-getmore-purple p-6 text-center text-white">
              <Car size={48} className="mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Driver Application</h1>
              <p className="text-sm opacity-80">Join GetMore BW as a driver partner</p>
            </div>
            
            <div className="p-8">
              <DriverSignUpForm 
                onSignUpSuccess={handleSignupSuccess}
              />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?
                </p>
                <Link 
                  to="/driver-login" 
                  className="inline-flex items-center text-getmore-purple hover:underline mt-1"
                >
                  <User className="mr-1 h-4 w-4" />
                  Sign in as a driver
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
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
