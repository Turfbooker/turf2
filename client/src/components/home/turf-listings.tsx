import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TurfCard } from "@/components/turf/turf-card";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Turf } from "@shared/schema";

export function TurfListings() {
  const [location, setLocation] = useState("any");
  const [sportType, setSportType] = useState("any");
  
  const { data: turfs, isLoading } = useQuery<Turf[]>({
    queryKey: ["/api/turfs"],
  });
  
  // Filter turfs based on selected filters
  const filteredTurfs = turfs?.filter(turf => {
    if (location !== "any" && turf.location !== location) return false;
    if (sportType !== "any" && turf.sportType !== sportType) return false;
    return true;
  });
  
  // Get unique locations and sport types for filters
  const uniqueLocations = [...new Set(turfs?.map(turf => turf.location) || [])];
  const uniqueSportTypes = [...new Set(turfs?.map(turf => turf.sportType) || [])];
  
  return (
    <div id="turfs" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Featured Turfs</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover the best sports facilities near you
          </p>
        </div>

        {/* Turf Search Bar */}
        <div className="max-w-3xl mx-auto mt-10">
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Any Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Location</SelectItem>
                  {uniqueLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label htmlFor="sport-type" className="block text-sm font-medium text-gray-700">Sport</label>
              <Select value={sportType} onValueChange={setSportType}>
                <SelectTrigger id="sport-type">
                  <SelectValue placeholder="Any Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Sport</SelectItem>
                  {uniqueSportTypes.map(sport => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:self-end">
              <Button type="button" className="w-full">
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Turf Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : filteredTurfs && filteredTurfs.length > 0 ? (
          <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
            {filteredTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">No turfs found matching your criteria.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/player/dashboard">
            <Button variant="outline" className="inline-flex items-center text-primary-700 bg-primary-100 hover:bg-primary-200">
              View all turfs
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
