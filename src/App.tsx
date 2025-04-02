
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import LearnMore from "./pages/LearnMore";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import CourierPage from "./pages/CourierPage";
import StoreSignUp from "./pages/StoreSignUp";
import StoreSignIn from "./pages/StoreSignIn";
import StoreDashboard from "./pages/StoreDashboard";
import CourierLogin from "./pages/CourierLogin";
import CourierDashboard from "./pages/CourierDashboard";
import AdminSignUp from "./pages/AdminSignUp";
import AdminSignIn from "./pages/AdminSignIn";
import AdminDashboard from "./pages/AdminDashboard";
import AllProducts from "./pages/AllProducts";
import BookCab from "./pages/BookCab";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { CourierProvider } from "@/contexts/CourierContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <CourierProvider>
              <NotificationProvider>
                <BrowserRouter>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/all-products" element={<AllProducts />} />
                      <Route path="/learn-more" element={<LearnMore />} />
                      <Route path="/sign-in" element={<SignIn />} />
                      <Route path="/sign-up" element={<SignUp />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/categories/:categoryName" element={<CategoryProductsPage />} />
                      <Route path="/how-it-works" element={<HowItWorksPage />} />
                      <Route path="/become-courier" element={<CourierPage />} />
                      <Route path="/book-cab" element={<BookCab />} />
                      <Route path="/store-signup" element={<StoreSignUp />} />
                      <Route path="/store-signin" element={<StoreSignIn />} />
                      <Route path="/store-dashboard/*" element={<StoreDashboard />} />
                      <Route path="/courier-login" element={<CourierLogin />} />
                      <Route path="/courier-dashboard/*" element={<CourierDashboard />} />
                      <Route path="/admin-signup" element={<AdminSignUp />} />
                      <Route path="/admin-signin" element={<AdminSignIn />} />
                      <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </BrowserRouter>
              </NotificationProvider>
            </CourierProvider>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
