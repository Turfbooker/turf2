import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookingCalendar } from "@/components/turf/booking-calendar";
import { ReviewForm } from "@/components/turf/review-form";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Turf, Review } from "@shared/schema";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Star, 
  ArrowLeft, 
  Phone, 
  Mail,
  Calendar, 
  Loader2 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TurfDetails() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id);
  const { user } = useAuth();
  
  // Query to get turf details
  const { data: turf, isLoading: turfLoading } = useQuery<Turf>({
    queryKey: [`/api/turfs/${numericId}`],
    enabled: !isNaN(numericId)
  });
  
  // Query to get turf reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/turfs/${numericId}/reviews`],
    enabled: !isNaN(numericId)
  });
  
  // Calculate average rating
  const avgRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : null;
  
  // Format price to currency
  const formattedPrice = turf 
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(turf.price / 100) 
    : "";
  
  // Loading state
  if (turfLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </main>
        <Footer />
      </div>
    );
  }
  
  // Error state - turf not found
  if (!turf) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Turf Not Found</h1>
            <p className="text-gray-600 mb-8">The turf you're looking for doesn't exist or has been removed.</p>
            <Link href="/player/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/player/dashboard">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Turfs
              </Button>
            </Link>
          </div>
          
          {/* Turf Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Turf Image and Basic Info */}
              <Card className="overflow-hidden">
                <div className="h-64 sm:h-80 relative">
                  <img 
                    src={turf.imageUrl || "https://images.unsplash.com/photo-1536122985607-4fe00c07ecf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1374&q=80"} 
                    alt={turf.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="text-sm bg-primary-500">
                      {turf.sportType}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{turf.name}</h1>
                      <div className="flex items-center mt-2">
                        <MapPin className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-gray-600">{turf.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-gray-900">{formattedPrice}</div>
                      <div className="text-gray-500 text-sm">per hour</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Available from {turf.availableFrom} to {turf.availableTo}
                      </span>
                    </div>
                    {avgRating && (
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-amber-400 mr-2" fill="currentColor" />
                        <span className="text-gray-600">
                          {avgRating} ({reviews?.length || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{turf.description}</p>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">+91 98765 43210</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">contact@{turf.name.toLowerCase().replace(/\s+/g, '')}turf.com</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 text-amber-400 mr-2" fill="currentColor" />
                    Reviews
                    {avgRating && <span className="ml-2 text-sm">({avgRating})</span>}
                  </CardTitle>
                  <CardDescription>See what others think about this turf</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                              {review.userId.toString().charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium">User {review.userId}</span>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className="h-4 w-4" 
                                    fill={i < review.rating ? "#FBBF24" : "#E5E7EB"}
                                    color={i < review.rating ? "#FBBF24" : "#E5E7EB"}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="ml-auto text-sm text-gray-500">
                              {format(new Date(review.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>
                          <p className="text-gray-600 mt-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Be the first to review this turf!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Booking and Review Section */}
            <div className="space-y-6">
              <Tabs defaultValue="booking">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="booking">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book
                  </TabsTrigger>
                  <TabsTrigger value="review">
                    <Star className="h-4 w-4 mr-2" />
                    Review
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="booking" className="pt-4">
                  <BookingCalendar turf={turf} />
                </TabsContent>
                <TabsContent value="review" className="pt-4">
                  <ReviewForm turfId={turf.id} />
                </TabsContent>
              </Tabs>
              
              {/* Amenities Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-2 gap-2">
                    <li className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Changing Rooms</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Parking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Floodlights</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Refreshments</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Equipment Rental</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Restrooms</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
