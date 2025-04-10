
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h1>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Players</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-primary-600 text-xl font-bold mb-2">1. Browse</div>
                  <p className="text-gray-600">Search for available turfs in your area and compare prices.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-primary-600 text-xl font-bold mb-2">2. Book</div>
                  <p className="text-gray-600">Select your preferred time slot and make a booking.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-primary-600 text-xl font-bold mb-2">3. Play</div>
                  <p className="text-gray-600">Show up at the venue and enjoy your game!</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Turf Owners</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-primary-600 text-xl font-bold mb-2">1. List</div>
                  <p className="text-gray-600">Add your turf details and available time slots.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-primary-600 text-xl font-bold mb-2">2. Manage</div>
                  <p className="text-gray-600">Accept bookings and manage your calendar.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-primary-600 text-xl font-bold mb-2">3. Earn</div>
                  <p className="text-gray-600">Receive payments for confirmed bookings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
