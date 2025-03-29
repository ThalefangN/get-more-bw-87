
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
import HowItWorksPage from "./pages/HowItWorksPage";
import CourierPage from "./pages/CourierPage";
import StoreSignUp from "./pages/StoreSignUp";
import StoreSignIn from "./pages/StoreSignIn";
import StoreDashboard from "./pages/StoreDashboard";
import CourierLogin from "./pages/CourierLogin";
import CourierDashboard from "./pages/CourierDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/learn-more" element={<LearnMore />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/become-courier" element={<CourierPage />} />
              <Route path="/store-signup" element={<StoreSignUp />} />
              <Route path="/store-signin" element={<StoreSignIn />} />
              <Route path="/store-dashboard/*" element={<StoreDashboard />} />
              <Route path="/courier-login" element={<CourierLogin />} />
              <Route path="/courier-dashboard/*" element={<CourierDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
