
import { useState } from "react";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { 
  Home, Package, Store, Truck, Users, Settings, LogOut 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardHome from "./DashboardHome";
import CouriersTab from "./CouriersTab";
import StoresTab from "./StoresTab";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/admin-signin");
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <div className="font-bold text-xl flex items-center">
            <span className="text-getmore-purple">Get</span>
            <span className="text-getmore-turquoise">More</span>
            <span className="text-gray-800 ml-1">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://ui-avatars.com/api/?name=Admin&background=8B5CF6&color=fff" alt="Admin" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-red-500"
          >
            <LogOut size={18} />
            <span className="ml-2 text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: Home,
    },
    {
      name: "Stores",
      path: "/admin-dashboard/stores",
      icon: Store,
    },
    {
      name: "Couriers",
      path: "/admin-dashboard/couriers",
      icon: Truck,
    },
    {
      name: "Orders",
      path: "/admin-dashboard/orders",
      icon: Package,
    },
    {
      name: "Users",
      path: "/admin-dashboard/users",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/admin-dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="bg-gray-50 w-64 border-r shadow-sm">
      <nav className="flex flex-col h-full p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                currentPath === item.path
                  ? "bg-getmore-purple text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} className="mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/couriers" element={<CouriersTab />} />
            <Route path="/stores" element={<StoresTab />} />
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
