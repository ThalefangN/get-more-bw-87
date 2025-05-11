
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "GetMore BW has transformed how I shop. Their quick deliveries and wide selection of stores make life easier for me and my family.",
      name: "Sarah Moatswi",
      designation: "Regular Customer",
      src: "/lovable-uploads/01d2ceff-9de2-4626-aa77-33bfa880b0df.png",
    },
    {
      quote:
        "Since partnering with GetMore BW, our small grocery store has seen a 30% increase in orders. The platform is simple to use and the support is excellent.",
      name: "Michael Pule",
      designation: "Store Owner",
      src: "/lovable-uploads/c7119ca1-52f5-4438-88b8-e2873ef332fb.png",
    },
    {
      quote:
        "As a courier partner, I've been able to earn a reliable income while setting my own hours. The GetMore BW team truly values their drivers.",
      name: "Emily Sebina",
      designation: "Courier Partner",
      src: "/lovable-uploads/01d2ceff-9de2-4626-aa77-33bfa880b0df.png",
    },
    {
      quote:
        "The cab service is prompt and professional. I use it daily for my commute and have never been disappointed.",
      name: "James Kgosi",
      designation: "Daily Commuter",
      src: "/lovable-uploads/c7119ca1-52f5-4438-88b8-e2873ef332fb.png",
    },
    {
      quote:
        "GetMore BW has become essential to how Botswana shops online. Their platform is reliable, fast, and has excellent customer service.",
      name: "Lisa Motsumi",
      designation: "Tech Journalist",
      src: "/lovable-uploads/01d2ceff-9de2-4626-aa77-33bfa880b0df.png",
    },
  ];

  return (
    <div className="bg-gray-50 py-10">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our customers, store owners, and courier partners about their experience with GetMore BW.
          </p>
        </div>
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </div>
  );
};

export default Testimonials;
