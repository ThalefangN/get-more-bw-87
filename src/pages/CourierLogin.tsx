
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCourier } from "@/contexts/CourierContext";
import { supabase } from "@/integrations/supabase/client";

const CourierLogin = () => {
  const navigate = useNavigate();
  const { login } = useCourier();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const userRole = data.session.user?.user_metadata?.role;
        if (userRole === 'courier') {
          // Check if courier exists in the database
          try {
            const { data: courierData } = await supabase
              .from('couriers')
              .select('*')
              .eq('email', data.session.user.email)
              .maybeSingle();
              
            if (courierData) {
              const courierInfo = {
                id: courierData.id,
                name: courierData.name,
                email: courierData.email,
                phone: courierData.phone,
                vehicleType: courierData.vehicle_type,
                isAvailable: true,
                rating: courierData.rating || 0,
                completedDeliveries: courierData.deliveries || 0
              };
              
              login(courierInfo);
              navigate("/courier-dashboard");
            }
          } catch (error) {
            console.error("Error checking courier data:", error);
          }
        }
      }
    };
    checkSession();
  }, [navigate, login]);

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
      // First try to authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (!authError && authData.user) {
        // Successfully authenticated with Supabase
        const userRole = authData.user?.user_metadata?.role;
        
        if (userRole !== 'courier') {
          // Not a courier account
          await supabase.auth.signOut();
          toast.error("This account does not have courier access");
          setIsLoading(false);
          return;
        }
        
        // Check if courier exists in the database
        const { data: courierData, error: courierError } = await supabase
          .from('couriers')
          .select('*')
          .eq('email', formData.email)
          .maybeSingle();
          
        if (!courierError && courierData) {
          // Courier found in database
          const courierInfo = {
            id: courierData.id,
            name: courierData.name,
            email: courierData.email,
            phone: courierData.phone,
            vehicleType: courierData.vehicle_type,
            isAvailable: true,
            rating: courierData.rating || 0,
            completedDeliveries: courierData.deliveries || 0
          };
          
          login(courierInfo);
          toast.success("Signed in successfully!");
          navigate("/courier-dashboard");
          return;
        }
      } else {
        // Fallback to direct courier table check for admin-created accounts
        // that might not have Supabase Auth entries
        const { data: courierData, error: courierError } = await supabase
          .from('couriers')
          .select('*')
          .eq('email', formData.email)
          .maybeSingle();
          
        if (!courierError && courierData) {
          // Check if password matches (for admin-created accounts)
          if (courierData.password === formData.password) {
            const courierInfo = {
              id: courierData.id,
              name: courierData.name,
              email: courierData.email,
              phone: courierData.phone,
              vehicleType: courierData.vehicle_type,
              isAvailable: true,
              rating: courierData.rating || 0,
              completedDeliveries: courierData.deliveries || 0
            };
            
            login(courierInfo);
            toast.success("Signed in successfully!");
            navigate("/courier-dashboard");
            return;
          }
        }
        
        // If we get here, authentication failed
        toast.error("Invalid email or password", {
          description: "Please check your credentials and try again"
        });
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      toast.error("Failed to sign in", {
        description: error.message || "Please check your credentials and try again."
      });
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
                <Truck size={32} className="text-getmore-purple" />
              </div>
              <h1 className="text-2xl font-bold">Courier Sign In</h1>
              <p className="text-gray-600 mt-2">
                Sign in to access your courier dashboard
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
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
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
              
              <Button 
                type="submit" 
                className="w-full bg-getmore-purple hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              
              <p className="text-center text-sm text-gray-600">
                Don't have an account yet?{" "}
                <Link to="/become-courier" className="text-getmore-purple hover:underline">
                  Apply to become a courier
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

export default CourierLogin;
