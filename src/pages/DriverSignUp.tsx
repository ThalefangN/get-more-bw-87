
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, ChevronRight, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import DriverSignUpForm from '@/components/driver/DriverSignUpForm';

const DriverSignUp = () => {
  const navigate = useNavigate();
  
  const handleSignupSuccess = () => {
    // Navigate to login page with success message
    toast.success("Sign up successful", {
      description: "Please check your email to verify your account, then sign in to access your driver dashboard."
    });
    
    setTimeout(() => {
      navigate('/driver-login');
    }, 1500);
  };
  
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container-custom max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-getmore-purple p-6 text-center text-white">
              <Car size={48} className="mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Driver Sign Up</h1>
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
