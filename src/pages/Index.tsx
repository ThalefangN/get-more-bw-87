
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryCarousel from "@/components/CategoryCarousel";
import HowItWorks from "@/components/HowItWorks";
import CabSection from "@/components/CabSection";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <CategoryCarousel />
        <ProductGrid />
        <CabSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
