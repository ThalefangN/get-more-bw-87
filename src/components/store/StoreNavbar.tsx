
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Building, Package, ShoppingBag, MessageSquare, BarChart2, Users, LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import the settings modal
import StoreSettings from "./StoreSettings";

const StoreNavbar = () => {
  const { currentStore, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      toast.success("Signed out successfully");
      navigate("/store-signin");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/store-dashboard", icon: BarChart2 },
    { name: "Products", href: "/store-dashboard/products", icon: Package },
    { name: "Orders", href: "/store-dashboard/orders", icon: ShoppingBag },
    { name: "Queries", href: "/store-dashboard/queries", icon: MessageSquare },
    { name: "Customers", href: "/store-dashboard/customers", icon: Users },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold text-getmore-purple">Get</span>
                  <span className="text-xl font-bold text-getmore-turquoise">More</span>
                  <span className="text-lg font-bold text-gray-700">BW</span>
                </Link>
                <span className="ml-3 text-gray-300">|</span>
                <span className="ml-3 font-semibold">Store Dashboard</span>
              </div>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="flex items-center space-x-4">
                {currentStore && (
                  <div className="flex items-center">
                    <img
                      src={currentStore.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStore.name)}&background=8B5CF6&color=fff`}
                      alt={currentStore.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{currentStore.name}</span>
                    {/* Profile/Settings button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 p-2"
                      onClick={() => setShowSettings(true)}
                      aria-label="Store Settings"
                    >
                      <User size={18} />
                    </Button>
                  </div>
                )}

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-getmore-purple hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-getmore-purple"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {currentStore && (
                <div className="flex items-center px-3 py-2">
                  <img
                    src={currentStore.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStore.name)}&background=8B5CF6&color=fff`}
                    alt={currentStore.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{currentStore.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1"
                    onClick={() => setShowSettings(true)}
                    aria-label="Store Settings"
                  >
                    <User size={18} />
                  </Button>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-getmore-purple hover:bg-gray-100 rounded-md"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Secondary Navigation for store sections */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between overflow-x-auto">
              <div className="flex">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium",
                      isActive(item.href)
                        ? "border-getmore-purple text-getmore-purple"
                        : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                    )}
                  >
                    <item.icon className="mr-2" size={16} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Store profile/settings modal */}
      {showSettings && (
        <StoreSettings open={showSettings} onOpenChange={setShowSettings} />
      )}
    </>
  );
};

export default StoreNavbar;
