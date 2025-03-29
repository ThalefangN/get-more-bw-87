
import { Smartphone, Clock, Box } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Place your order",
    description: "Browse products and add them to your cart. Checkout when you're ready.",
    icon: <Smartphone size={36} className="text-getmore-turquoise" />
  },
  {
    id: 2,
    title: "Wait 10-15 minutes",
    description: "Our couriers will prepare your order and head to your location.",
    icon: <Clock size={36} className="text-getmore-turquoise" />
  },
  {
    id: 3,
    title: "Receive at your door",
    description: "Your items will be delivered straight to your doorstep.",
    icon: <Box size={36} className="text-getmore-turquoise" />
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-getmore-purple text-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How Get More BW Works</h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Getting your groceries and essentials has never been easier. Follow these simple steps.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-white rounded-full flex items-center justify-center text-getmore-purple font-bold text-xl">
                {step.id}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 bg-white/10 p-4 rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/80">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="btn-secondary">
            Download the App
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
