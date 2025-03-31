
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Truck, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Courier } from "@/types/courier";

interface CourierSelectionProps {
  address: string;
  selectedCourierId: string | null;
  onCourierSelect: (courierId: string) => void;
}

const CourierSelection = ({ address, selectedCourierId, onCourierSelect }: CourierSelectionProps) => {
  const [availableCouriers, setAvailableCouriers] = useState<Courier[]>([]);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableCouriers = async () => {
      setIsLoadingCouriers(true);
      try {
        const { data, error } = await supabase
          .from('couriers')
          .select('*')
          .eq('status', 'active');

        if (error) {
          console.error("Error fetching available couriers:", error);
          toast({
            title: "Error",
            description: "Failed to fetch available couriers.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          console.log("Fetched couriers:", data);
          setAvailableCouriers(data as Courier[]);
        }
      } catch (error) {
        console.error("Unexpected error fetching couriers:", error);
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred while fetching couriers.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCouriers(false);
      }
    };

    fetchAvailableCouriers();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 p-4 rounded-lg mb-4 border border-emerald-100">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 mr-2" />
          <div>
            <p className="font-medium text-emerald-800">Delivery Address:</p>
            <p className="text-gray-700">{address}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <Truck className="h-5 w-5 text-emerald-600 mr-2" />
        <h3 className="text-lg font-medium">Select a courier:</h3>
      </div>
      
      {isLoadingCouriers ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : availableCouriers.length > 0 ? (
        <RadioGroup value={selectedCourierId || ""} onValueChange={onCourierSelect} className="grid grid-cols-1 gap-3">
          {availableCouriers.map(courier => (
            <div 
              key={courier.id}
              className={`border p-4 rounded-lg flex items-center cursor-pointer transition-all ${
                selectedCourierId === courier.id 
                  ? 'border-emerald-400 bg-emerald-50 shadow-sm' 
                  : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'
              }`}
            >
              <RadioGroupItem value={courier.id} id={courier.id} className="mr-4" />
              <div className="flex-1">
                <label htmlFor={courier.id} className="font-medium cursor-pointer block">
                  {courier.name}
                </label>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-3">Vehicle: {courier.vehicle_type}</span>
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>{courier.deliveries} deliveries</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                  courier.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {courier.status === 'active' ? 'Available' : 'Busy'}
                </div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-3 h-3 ${star <= courier.rating ? 'text-amber-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-lg flex items-center">
          <Clock className="h-5 w-5 text-amber-600 mr-2" />
          <p>No couriers available at the moment. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default CourierSelection;
