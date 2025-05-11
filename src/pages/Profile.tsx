
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            // Fix property names to match what's available in the profiles table
            firstName: data.name ? data.name.split(' ')[0] : "",
            lastName: data.name ? data.name.split(' ')[1] || "" : "",
            email: user.email || "",
            phone: data.phone || "", // Add phone if it exists in the future
            address: data.street || "", // Use street as address
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      }
    };

    loadProfile();
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: `${userData.firstName} ${userData.lastName}`.trim(),
          street: userData.address,
          // Fix Date to string type issue
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </div>
              )}
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={userData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your delivery address"
                />
              </div>
            </form>
          </Card>

          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Password
                </Button>
                <Button variant="destructive" className="w-full sm:w-auto">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
