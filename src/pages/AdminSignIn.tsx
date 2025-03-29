
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminSignIn = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would validate against a backend
      // For this demo, we'll just check if the admin exists in localStorage
      const adminInfo = localStorage.getItem('adminInfo');
      
      if (adminInfo) {
        const admin = JSON.parse(adminInfo);
        
        // For demo purposes, we're just checking if the email matches
        // In a real app, you would also verify the password
        if (admin.email === formData.email) {
          toast.success("Signed in successfully!");
          navigate("/admin-dashboard");
          return;
        }
      }
      
      // If we're here, authentication failed
      toast.error("Invalid email or password");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-getmore-purple/10 rounded-full mb-4">
                <Shield size={32} className="text-getmore-purple" />
              </div>
              <h1 className="text-2xl font-bold">
                Admin Sign In
              </h1>
              <p className="text-gray-600 mt-2">
                Sign in to access the admin dashboard
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="#" className="text-xs text-getmore-purple hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-getmore-purple hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                Don't have an admin account?{" "}
                <Link to="/admin-signup" className="text-getmore-purple hover:underline">
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSignIn;
