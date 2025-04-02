
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, FileText, Shield, Users, Clock, Car } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const DriverTerms = () => {
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="container-custom max-w-4xl">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-getmore-purple p-6 flex items-center justify-between">
              <div className="flex items-center text-white">
                <FileText className="mr-3" size={28} />
                <h1 className="text-2xl font-bold">Driver Terms and Conditions</h1>
              </div>
              <Link to="/driver-signup">
                <Button variant="secondary" size="sm" className="flex items-center">
                  <ChevronLeft className="mr-1" size={16} />
                  Back to Signup
                </Button>
              </Link>
            </div>
            
            <div className="p-8">
              <div className="prose max-w-none">
                <h2>GetMore BW Driver Agreement</h2>
                <p className="text-gray-600">
                  Last Updated: June 15, 2023
                </p>
                
                <p>
                  This Driver Agreement ("Agreement") is made between GetMore BW ("Company," "we," "us," or "our") 
                  and you, as a driver ("Driver," "you," or "your"). This Agreement governs your relationship with 
                  the Company and your use of our platform to provide transportation services to passengers.
                </p>
                
                <h3>1. Relationship</h3>
                <p>
                  <strong>1.1 Independent Contractor Status.</strong> You acknowledge and agree that you are an independent 
                  contractor and not an employee of GetMore BW. This Agreement does not create an employment relationship, 
                  partnership, or joint venture between you and the Company.
                </p>
                <p>
                  <strong>1.2 No Authority.</strong> You have no authority to bind the Company and will not hold yourself out 
                  as an employee, agent, or authorized representative of the Company.
                </p>
                
                <h3>2. Driver Requirements</h3>
                <p>
                  <strong>2.1 Eligibility.</strong> To be eligible to provide transportation services through our platform, you must:
                </p>
                <ul>
                  <li>Be at least 21 years of age</li>
                  <li>Hold a valid Botswana driver's license for at least 2 years</li>
                  <li>Own or have access to a vehicle that meets our vehicle requirements</li>
                  <li>Possess a valid Omang ID or passport</li>
                  <li>Pass our background check and vehicle inspection</li>
                  <li>Maintain a valid insurance policy that meets the minimum requirements for your vehicle</li>
                </ul>
                
                <p>
                  <strong>2.2 Documentation.</strong> You agree to provide accurate and complete information and documentation 
                  as requested by the Company, including but not limited to your driver's license, vehicle registration, 
                  insurance policy, and other relevant documents.
                </p>
                
                <p>
                  <strong>2.3 Background Check.</strong> You consent to undergo a background check, which may include a 
                  criminal record check, driving history check, and other relevant screenings. You acknowledge that your 
                  ability to use our platform is contingent upon passing these checks to our satisfaction.
                </p>
                
                <h3>3. Service Standards</h3>
                <p>
                  <strong>3.1 Professional Conduct.</strong> You agree to:
                </p>
                <ul>
                  <li>Provide safe, reliable, and professional transportation services</li>
                  <li>Maintain a clean and well-maintained vehicle</li>
                  <li>Be courteous and respectful to all passengers</li>
                  <li>Follow all applicable traffic laws and regulations</li>
                  <li>Not discriminate against passengers based on race, color, religion, national origin, disability, sexual orientation, gender, or age</li>
                  <li>Not engage in any harassing or inappropriate behavior</li>
                </ul>
                
                <p>
                  <strong>3.2 Rating System.</strong> You acknowledge that passengers may rate their experience with you after each ride. 
                  You agree to maintain a minimum average rating as determined by the Company. Failure to maintain such rating may 
                  result in temporary or permanent deactivation from the platform.
                </p>
                
                <h3>4. Payment Terms</h3>
                <p>
                  <strong>4.1 Fare Calculation.</strong> The fare for each ride will be calculated based on factors including 
                  distance, time, and demand. The Company reserves the right to modify the fare calculation method at any time.
                </p>
                
                <p>
                  <strong>4.2 Commission.</strong> The Company will retain a commission from each fare you receive. The commission 
                  rate will be communicated to you and may be updated from time to time. Your acceptance of rides constitutes your 
                  acceptance of the applicable commission rate.
                </p>
                
                <p>
                  <strong>4.3 Payment Processing.</strong> The Company will process payments from passengers and remit your portion 
                  of the fare to you according to the payment schedule communicated to you. You acknowledge that passengers may 
                  pay using various methods, including but not limited to cash, credit cards, or mobile payments.
                </p>
                
                <p>
                  <strong>4.4 Taxes.</strong> You are solely responsible for reporting and paying all applicable taxes on income 
                  earned through the platform. The Company may provide you with relevant tax documentation but does not withhold 
                  taxes from your earnings.
                </p>
                
                <h3>5. Insurance and Liability</h3>
                <p>
                  <strong>5.1 Insurance Requirements.</strong> You must maintain valid insurance coverage for your vehicle that 
                  complies with all legal requirements in Botswana and meets the minimum requirements set by the Company.
                </p>
                
                <p>
                  <strong>5.2 Limitation of Liability.</strong> The Company shall not be liable for any damages, injuries, or losses 
                  arising from your provision of transportation services, your use of the platform, or your violation of this Agreement.
                </p>
                
                <p>
                  <strong>5.3 Indemnification.</strong> You agree to indemnify, defend, and hold harmless the Company, its affiliates, 
                  officers, directors, employees, agents, and representatives from any and all claims, liabilities, damages, losses, 
                  costs, expenses, or fees (including reasonable attorneys' fees) arising from:
                </p>
                <ul>
                  <li>Your provision of transportation services</li>
                  <li>Your use of the platform</li>
                  <li>Your violation of this Agreement</li>
                  <li>Your violation of any rights of a third party</li>
                  <li>Your violation of any applicable law, rule, or regulation</li>
                </ul>
                
                <h3>6. Term and Termination</h3>
                <p>
                  <strong>6.1 Term.</strong> This Agreement shall remain in effect until terminated by either party as provided herein.
                </p>
                
                <p>
                  <strong>6.2 Termination by Driver.</strong> You may terminate this Agreement at any time by providing written 
                  notice to the Company and ceasing use of the platform.
                </p>
                
                <p>
                  <strong>6.3 Termination by Company.</strong> The Company may terminate this Agreement and your access to the 
                  platform at any time, with or without cause, and with or without notice.
                </p>
                
                <p>
                  <strong>6.4 Effect of Termination.</strong> Upon termination of this Agreement, you shall immediately cease using 
                  the platform and any related materials provided by the Company.
                </p>
                
                <h3>7. Modifications</h3>
                <p>
                  The Company reserves the right to modify this Agreement at any time. We will notify you of any material changes. 
                  Your continued use of the platform after such notification constitutes your acceptance of the modified Agreement.
                </p>
                
                <h3>8. Governing Law</h3>
                <p>
                  This Agreement shall be governed by and construed in accordance with the laws of Botswana, without giving effect 
                  to any choice of law or conflict of law provisions.
                </p>
                
                <h3>9. Dispute Resolution</h3>
                <p>
                  Any dispute arising from or relating to this Agreement shall be resolved through arbitration in accordance 
                  with the rules of the Botswana Institute of Arbitrators. The arbitration shall take place in Gaborone, Botswana.
                </p>
                
                <div className="mt-8">
                  <p className="font-semibold">
                    By signing up as a driver, you acknowledge that you have read, understood, and agree to be bound by all the 
                    terms and conditions contained in this Agreement.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/driver-signup">
                  <Button className="w-full bg-getmore-purple hover:bg-purple-700">
                    Return to Signup Form
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DriverTerms;
