import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import { Turf } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";

interface TurfCardProps {
  turf: Turf;
  showBookButton?: boolean;
}

export function TurfCard({ turf, showBookButton = true }: TurfCardProps) {
  const { user } = useAuth();
  
  // Query to get turf reviews
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/turfs/${turf.id}/reviews`],
    enabled: !!turf.id
  });
  
  // Calculate average rating
  const avgRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : "New";
  
  // Format price to currency
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(turf.price / 100);

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="h-48 overflow-hidden">
        <img 
          src={turf.imageUrl || "https://images.unsplash.com/photo-1536122985607-4fe00c07ecf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1374&q=80"} 
          alt={turf.name} 
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary-600">
            {turf.sportType}
          </p>
          <div className="flex justify-between items-center mt-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {turf.name}
            </h3>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
              <span className="ml-1 text-gray-600">{avgRating}</span>
            </div>
          </div>
          <p className="mt-3 text-base text-gray-500 line-clamp-2">
            {turf.description}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            {turf.location}
          </div>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            Available from {turf.availableFrom} to {turf.availableTo}
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-1">
            <p className="text-xl font-semibold text-gray-900">{formattedPrice}</p>
            <p className="text-sm text-gray-500">per hour</p>
          </div>
          <div className="ml-4">
            {showBookButton && (
              <Link href={user?.role === "player" ? `/player/turf/${turf.id}` : "/auth?tab=login&role=player"}>
                <Button>
                  {user?.role === "player" ? "Book Now" : "Login to Book"}
                </Button>
              </Link>
            )}
            {!showBookButton && user?.role === "owner" && turf.ownerId === user.id && (
              <Link href={`/owner/turf/${turf.id}`}>
                <Button variant="outline">
                  Manage
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
