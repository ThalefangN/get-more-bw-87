
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cart } from "@/components/Cart";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import CategoryCarousel from "@/components/CategoryCarousel";
import HowItWorks from "@/components/HowItWorks";
import CabSection from "@/components/CabSection";

const Index = () => (
  <>
    <Navbar />
    <div className="pt-20">
      <Hero />
      <CategoryCarousel />
      <ProductGrid />
      <CabSection />
      <HowItWorks />
      <Cart />
    </div>
    <Footer />
  </>
);

export default Index;
