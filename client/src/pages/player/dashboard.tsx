import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TurfCard } from "@/components/turf/turf-card";
import { useAuth } from "@/hooks/use-auth";
import { Turf, Booking } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Search, MapPin, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PlayerDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useState<string>("");
  const [sportType, setSportType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Query to get all turfs
  const { data: turfs, isLoading: turfsLoading } = useQuery<Turf[]>({
    queryKey: ["/api/turfs"],
  });
  
  // Query to get player's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<
    (Booking & { turf?: Turf })[]
  >({
    queryKey: ["/api/bookings"],
  });
  
  // Extract unique locations and sport types for filters
  const uniqueLocations = [...new Set(turfs?.map(turf => turf.location) || [])];
  const uniqueSportTypes = [...new Set(turfs?.map(turf => turf.sportType) || [])];
  
  // Filter turfs based on selected criteria
  const filteredTurfs = turfs?.filter(turf => {
    if (location && turf.location !== location) return false;
    if (sportType && turf.sportType !== sportType) return false;
    if (searchQuery && !turf.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Group bookings by status
  const upcomingBookings = bookings?.filter(booking => booking.status !== "cancelled") || [];
  const pastBookings = bookings?.filter(booking => booking.status === "cancelled") || [];
  
  // Format date for display
  const formatBookingDate = (dateString: string, timeString: string) => {
    const date = parseISO(dateString);
    return `${format(date, "MMM dd, yyyy")} at ${timeString}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Player Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}! Find and book your next game.</p>
            </div>
          </div>
          
          <Tabs defaultValue="turfs" className="space-y-8">
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex">
              <TabsTrigger value="turfs">Available Turfs</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="turfs">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-2 flex items-center space-x-2">
                      <Search className="h-5 w-5 text-gray-400" />
                      <Input 
                        placeholder="Search turf by name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Any Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Location</SelectItem>
                          {uniqueLocations.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={sportType} onValueChange={setSportType}>
                        <SelectTrigger className="flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Any Sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Sport</SelectItem>
                          {uniqueSportTypes.map(sport => (
                            <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Turf Listings */}
              <div className="mt-6">
                {turfsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : filteredTurfs && filteredTurfs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTurfs.map((turf) => (
                      <TurfCard key={turf.id} turf={turf} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-64">
                      <Search className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900">No turfs found</h3>
                      <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="bookings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Your confirmed and pending bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      </div>
                    ) : upcomingBookings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <div key={booking.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{booking.turf?.name || "Unknown Turf"}</h3>
                                <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                {formatBookingDate(booking.date, `${booking.startTime} - ${booking.endTime}`)}
                              </p>
                              <p className="text-sm text-gray-500">
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {booking.turf?.location || "Location not available"}
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center">
                              <Button 
                                variant="outline" 
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => {
                                  /* Implement cancellation logic here */
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
                        <p className="mt-1 text-sm text-gray-500">Book a turf to start playing!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {pastBookings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Bookings</CardTitle>
                      <CardDescription>Your previous bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pastBookings.map((booking) => (
                          <div key={booking.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{booking.turf?.name || "Unknown Turf"}</h3>
                                <Badge variant="secondary">
                                  {booking.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                {formatBookingDate(booking.date, `${booking.startTime} - ${booking.endTime}`)}
                              </p>
                              <p className="text-sm text-gray-500">
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {booking.turf?.location || "Location not available"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
