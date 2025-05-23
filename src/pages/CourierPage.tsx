import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Bike, Clock, CreditCard, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CourierPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    hasVehicle: "",
    experience: "",
    heardFrom: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.city || !formData.hasVehicle) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store in localStorage first as a backup
      const applications = JSON.parse(localStorage.getItem('courierApplications') || '[]');
      const newApplication = {
        id: `app-${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        vehicle: formData.hasVehicle,
        experience: formData.experience,
        heardFrom: formData.heardFrom,
        status: 'pending',
        appliedAt: new Date().toISOString()
      };
      
      applications.push(newApplication);
      localStorage.setItem('courierApplications', JSON.stringify(applications));

      // Then try to submit to Supabase
      try {
        // Submit the application to Supabase
        const { data, error } = await supabase
          .from('courier_applications')
          .insert([
            {
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              city: formData.city,
              vehicle_type: formData.hasVehicle,
              experience: formData.experience,
              heard_from: formData.heardFrom,
              status: 'pending'
            }
          ]);
          
        if (error) {
          console.error("Supabase insert error:", error);
          // Continue anyway as we've already saved to localStorage
        }
      } catch (supabaseError) {
        console.error("Error submitting to Supabase:", supabaseError);
        // Continue anyway as we've already saved to localStorage
      }
      
      toast.success("Your application has been submitted! We'll contact you soon.", {
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        hasVehicle: "",
        experience: "",
        heardFrom: "",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-white to-gray-100 py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-getmore-purple">Become a</span>{" "}
              <span className="text-getmore-turquoise">Courier</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mb-12">
              Join our team of delivery partners and earn money on your own schedule. 
              Deliver groceries and essentials around your city with GetMore BW.
            </p>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Become a GetMore BW Courier?</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="bg-getmore-turquoise/10 p-1 rounded-full">
                        <Check className="text-getmore-turquoise" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Flexible Hours</h3>
                      <p className="text-gray-600">Work when you want. Set your own schedule and deliver during hours that work for you.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="bg-getmore-turquoise/10 p-1 rounded-full">
                        <Check className="text-getmore-turquoise" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Competitive Pay</h3>
                      <p className="text-gray-600">Earn competitive rates per delivery, plus keep 100% of your tips.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="bg-getmore-turquoise/10 p-1 rounded-full">
                        <Check className="text-getmore-turquoise" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Instant Payments</h3>
                      <p className="text-gray-600">Get paid immediately for every delivery you complete, right on the spot.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="bg-getmore-turquoise/10 p-1 rounded-full">
                        <Check className="text-getmore-turquoise" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Be Your Own Boss</h3>
                      <p className="text-gray-600">Enjoy the freedom of being an independent contractor with no boss looking over your shoulder.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1592805144716-feeccccef5ac?q=80&w=1000&auto=format&fit=crop" 
                  alt="Delivery courier" 
                  className="rounded-xl shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow-md mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-getmore-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bike size={32} className="text-getmore-purple" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Apply & Get Approved</h3>
                  <p className="text-gray-600">
                    Fill out the application form. Once approved, we'll set you up with everything you need.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-getmore-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-getmore-turquoise" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Deliver On Your Schedule</h3>
                  <p className="text-gray-600">
                    Open the app when you're ready to work. Accept orders and make deliveries.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-getmore-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={32} className="text-getmore-orange" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Get Paid Instantly</h3>
                  <p className="text-gray-600">
                    Receive your earnings immediately after each delivery is completed.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-center">Apply To Become a Courier</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                    >
                      <option value="">Select a city</option>
                      <option value="Gaborone">Gaborone</option>
                      <option value="Francistown">Francistown</option>
                      <option value="Molepolole">Molepolole</option>
                      <option value="Maun">Maun</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="hasVehicle" className="block text-sm font-medium text-gray-700 mb-1">Do you have a vehicle? *</label>
                    <select
                      id="hasVehicle"
                      name="hasVehicle"
                      value={formData.hasVehicle}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                    >
                      <option value="">Select an option</option>
                      <option value="Car">Yes, I have a car</option>
                      <option value="Motorcycle">Yes, I have a motorcycle</option>
                      <option value="Bicycle">Yes, I have a bicycle</option>
                      <option value="No">No, I don't have a vehicle</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Previous Delivery Experience</label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                    >
                      <option value="">Select an option</option>
                      <option value="None">No experience</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3+ years">3+ years</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="heardFrom" className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us?</label>
                  <select
                    id="heardFrom"
                    name="heardFrom"
                    value={formData.heardFrom}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
                  >
                    <option value="">Select an option</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Friend/Family">Friend or Family</option>
                    <option value="Website">GetMore BW Website</option>
                    <option value="Ad">Advertisement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 text-getmore-purple focus:ring-getmore-purple border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-getmore-purple hover:underline">Terms and Conditions</a> and <a href="#" className="text-getmore-purple hover:underline">Privacy Policy</a>
                  </label>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <div className="flex items-center justify-center mb-6">
              <HelpCircle size={32} className="text-getmore-purple mr-2" />
              <h2 className="text-2xl font-bold">Still Have Questions?</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">
              Contact our courier support team for more information about becoming a delivery partner.
            </p>
            <div className="flex justify-center">
              <a href="mailto:couriers@getmorebw.com" className="btn-secondary">
                Email Courier Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourierPage;
