import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertReviewSchema, Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewFormProps {
  turfId: number;
}

// Extend the review schema with frontend validation
const reviewFormSchema = insertReviewSchema.extend({
  comment: z.string().min(5, "Please provide a comment with at least 5 characters")
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewForm({ turfId }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/turfs/${turfId}/reviews`],
    enabled: !!turfId
  });
  
  // Check if user has already submitted a review
  const hasReviewed = reviews?.some(review => review.userId === user?.id);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      turfId,
      userId: user?.id || 0,
      rating: 0,
      comment: ""
    },
  });
  
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      form.reset();
      setRating(0);
      
      // Invalidate reviews query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/turfs/${turfId}/reviews`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ReviewFormValues) => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    const reviewData = {
      ...data,
      rating,
    };
    
    reviewMutation.mutate(reviewData);
  };
  
  if (hasReviewed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
          <CardDescription>
            You have already submitted a review for this turf.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mt-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const userReview = reviews?.find(review => review.userId === user?.id);
              return (
                <Star
                  key={i}
                  className="h-6 w-6"
                  fill={i < (userReview?.rating || 0) ? "currentColor" : "none"}
                  color={i < (userReview?.rating || 0) ? "#FBBF24" : "#E5E7EB"}
                />
              );
            })}
          </div>
          <p className="mt-2 text-gray-700">
            {reviews?.find(review => review.userId === user?.id)?.comment}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>
          Share your experience with this turf
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Your Rating</FormLabel>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-8 w-8 cursor-pointer"
                    fill={(hoveredRating || rating) > i ? "currentColor" : "none"}
                    color={(hoveredRating || rating) > i ? "#FBBF24" : "#E5E7EB"}
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoveredRating(i + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
              {rating === 0 && form.formState.isSubmitted && (
                <p className="text-sm font-medium text-destructive">
                  Please select a rating
                </p>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share details of your experience at this turf"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your review will help others make better choices
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={reviewMutation.isPending || !user}
              className="w-full"
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            
            {!user && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                Please log in to leave a review
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
