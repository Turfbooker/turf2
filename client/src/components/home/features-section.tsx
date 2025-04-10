import { Search, Calendar, Clock, Zap } from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Benefits</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to book sports facilities
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            TurfBooker makes it simple to find, book and manage sports facility rentals.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Search className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Find the perfect turf</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Search for sports facilities based on location, sport type, amenities, and availability.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Book in seconds</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Check availability and book your slot instantly without phone calls or waiting.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Save time</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Manage all your bookings in one place - view, reschedule or cancel with ease.
              </dd>
            </div>

            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Turf owners</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                List your turf, manage bookings, and grow your business with our intuitive platform.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
