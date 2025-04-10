import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TurfCard } from "@/components/turf/turf-card";
import { useAuth } from "@/hooks/use-auth";
import { Turf, Booking } from "@shared/schema";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  PlusCircle, 
  Calendar, 
  Layers, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Query to get owner's turfs
  const { data: turfs, isLoading: turfsLoading } = useQuery<Turf[]>({
    queryKey: [`/api/users/${user?.id}/turfs`],
    enabled: !!user?.id
  });
  
  // Function to get bookings for a turf
  const fetchTurfBookings = async (turfId: number) => {
    const res = await fetch(`/api/turfs/${turfId}/bookings`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return await res.json();
  };
  
  // Fetch all bookings for all turfs
  const [selectedTurfId, setSelectedTurfId] = useState<number | null>(null);
  
  // Query to get bookings for selected turf
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: [`/api/turfs/${selectedTurfId}/bookings`],
    enabled: !!selectedTurfId,
    queryFn: () => fetchTurfBookings(selectedTurfId!),
  });
  
  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({id, status}: {id: number, status: "confirmed" | "cancelled"}) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully",
      });
      
      // Invalidate bookings query to refresh data
      if (selectedTurfId) {
        queryClient.invalidateQueries({ queryKey: [`/api/turfs/${selectedTurfId}/bookings`] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle booking status change
  const handleBookingStatusChange = (bookingId: number, status: "confirmed" | "cancelled") => {
    updateBookingStatusMutation.mutate({ id: bookingId, status });
  };
  
  // Get active turf name
  const activeTurfName = selectedTurfId 
    ? turfs?.find(turf => turf.id === selectedTurfId)?.name 
    : null;
  
  // Group bookings by status
  const pendingBookings = bookings?.filter(booking => booking.status === "pending") || [];
  const confirmedBookings = bookings?.filter(booking => booking.status === "confirmed") || [];
  const cancelledBookings = bookings?.filter(booking => booking.status === "cancelled") || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Turf Owner Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your sports facilities and bookings</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/owner/add-turf">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Turf
                </Button>
              </Link>
            </div>
          </div>
          
          <Tabs defaultValue="turfs" className="space-y-8">
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex">
              <TabsTrigger value="turfs">My Turfs</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="turfs">
              {turfsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : turfs && turfs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {turfs.map((turf) => (
                    <TurfCard key={turf.id} turf={turf} showBookButton={false} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-64">
                    <Layers className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No turfs yet</h3>
                    <p className="text-gray-500 mt-2">Add your first turf to start receiving bookings</p>
                    <Link href="/owner/add-turf">
                      <Button className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Turf
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="bookings">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Turfs</CardTitle>
                      <CardDescription>Select a turf to view bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {turfsLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                        </div>
                      ) : turfs && turfs.length > 0 ? (
                        <div className="space-y-2">
                          {turfs.map((turf) => (
                            <Button 
                              key={turf.id} 
                              variant={selectedTurfId === turf.id ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setSelectedTurfId(turf.id)}
                            >
                              {turf.name}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No turfs available</p>
                          <Link href="/owner/add-turf">
                            <Button size="sm" className="mt-2">
                              Add Turf
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-3">
                  {!selectedTurfId ? (
                    <Card>
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-64">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No turf selected</h3>
                        <p className="text-gray-500 mt-2">Select a turf to view its bookings</p>
                      </CardContent>
                    </Card>
                  ) : bookingsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Bookings for {activeTurfName}</CardTitle>
                          <CardDescription>Manage booking requests and reservations</CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <Tabs defaultValue="pending">
                            <TabsList className="w-full grid grid-cols-3">
                              <TabsTrigger value="pending" className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                Pending ({pendingBookings.length})
                              </TabsTrigger>
                              <TabsTrigger value="confirmed" className="flex items-center">
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Confirmed ({confirmedBookings.length})
                              </TabsTrigger>
                              <TabsTrigger value="cancelled" className="flex items-center">
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Cancelled ({cancelledBookings.length})
                              </TabsTrigger>
                            </TabsList>
                            
                            {/* Pending Bookings Tab */}
                            <TabsContent value="pending" className="mt-4">
                              {pendingBookings.length > 0 ? (
                                <div className="space-y-4">
                                  {pendingBookings.map((booking) => (
                                    <Card key={booking.id}>
                                      <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row justify-between">
                                          <div className="space-y-1">
                                            <div className="flex items-center">
                                              <Badge variant="outline" className="mr-2">Pending</Badge>
                                              <h3 className="font-medium">Booking #{booking.id}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                              <Calendar className="inline h-4 w-4 mr-1" />
                                              {format(new Date(booking.date), "MMM dd, yyyy")}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              <Clock className="inline h-4 w-4 mr-1" />
                                              {booking.startTime} - {booking.endTime}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              <User className="inline h-4 w-4 mr-1" />
                                              User ID: {booking.userId}
                                            </p>
                                          </div>
                                          <div className="mt-4 md:mt-0 flex items-center space-x-2">
                                            <Button 
                                              onClick={() => handleBookingStatusChange(booking.id, "confirmed")}
                                              disabled={updateBookingStatusMutation.isPending}
                                            >
                                              {updateBookingStatusMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              ) : (
                                                <ThumbsUp className="mr-2 h-4 w-4" />
                                              )}
                                              Confirm
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                              onClick={() => handleBookingStatusChange(booking.id, "cancelled")}
                                              disabled={updateBookingStatusMutation.isPending}
                                            >
                                              {updateBookingStatusMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              ) : (
                                                <ThumbsDown className="mr-2 h-4 w-4" />
                                              )}
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending bookings</h3>
                                  <p className="mt-1 text-sm text-gray-500">When someone books your turf, it will appear here</p>
                                </div>
                              )}
                            </TabsContent>
                            
                            {/* Confirmed Bookings Tab */}
                            <TabsContent value="confirmed" className="mt-4">
                              {confirmedBookings.length > 0 ? (
                                <div className="space-y-4">
                                  {confirmedBookings.map((booking) => (
                                    <Card key={booking.id}>
                                      <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row justify-between">
                                          <div className="space-y-1">
                                            <div className="flex items-center">
                                              <Badge className="mr-2">Confirmed</Badge>
                                              <h3 className="font-medium">Booking #{booking.id}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                              <Calendar className="inline h-4 w-4 mr-1" />
                                              {format(new Date(booking.date), "MMM dd, yyyy")}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              <Clock className="inline h-4 w-4 mr-1" />
                                              {booking.startTime} - {booking.endTime}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              <User className="inline h-4 w-4 mr-1" />
                                              User ID: {booking.userId}
                                            </p>
                                          </div>
                                          <div className="mt-4 md:mt-0 flex items-center">
                                            <Button 
                                              variant="outline" 
                                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                              onClick={() => handleBookingStatusChange(booking.id, "cancelled")}
                                              disabled={updateBookingStatusMutation.isPending}
                                            >
                                              {updateBookingStatusMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              ) : (
                                                <ThumbsDown className="mr-2 h-4 w-4" />
                                              )}
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <ThumbsUp className="mx-auto h-12 w-12 text-gray-400" />
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">No confirmed bookings</h3>
                                  <p className="mt-1 text-sm text-gray-500">Confirm pending bookings to see them here</p>
                                </div>
                              )}
                            </TabsContent>
                            
                            {/* Cancelled Bookings Tab */}
                            <TabsContent value="cancelled" className="mt-4">
                              {cancelledBookings.length > 0 ? (
                                <div className="space-y-4">
                                  {cancelledBookings.map((booking) => (
                                    <Card key={booking.id}>
                                      <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row justify-between">
                                          <div className="space-y-1">
                                            <div className="flex items-center">
                                              <Badge variant="secondary" className="mr-2">Cancelled</Badge>
                                              <h3 className="font-medium">Booking #{booking.id}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                              <Calendar className="inline h-4 w-4 mr-1" />
                                              {format(new Date(booking.date), "MMM dd, yyyy")}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              <Clock className="inline h-4 w-4 mr-1" />
                                              {booking.startTime} - {booking.endTime}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              <User className="inline h-4 w-4 mr-1" />
                                              User ID: {booking.userId}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <ThumbsDown className="mx-auto h-12 w-12 text-gray-400" />
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">No cancelled bookings</h3>
                                  <p className="mt-1 text-sm text-gray-500">Cancelled bookings will appear here</p>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                      
                      {/* Reviews Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Star className="h-5 w-5 text-amber-400 mr-2" fill="currentColor" />
                            Reviews
                          </CardTitle>
                          <CardDescription>Customer feedback for {activeTurfName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <Star className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Reviews coming soon</h3>
                            <p className="mt-1 text-sm text-gray-500">Your customers' reviews will appear here</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
