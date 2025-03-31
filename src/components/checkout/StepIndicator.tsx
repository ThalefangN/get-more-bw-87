
import { CheckCheck } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex justify-center mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === index 
                ? 'bg-emerald-600 text-white' 
                : currentStep > index 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {currentStep > index ? <CheckCheck className="h-4 w-4" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div 
              className={`h-1 w-10 ${
                currentStep > index ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
