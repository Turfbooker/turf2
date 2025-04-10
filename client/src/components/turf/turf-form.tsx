import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { insertTurfSchema, Turf } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface TurfFormProps {
  editMode?: boolean;
  turfData?: Turf;
}

// Custom schema with frontend validation
const turfFormSchema = insertTurfSchema
  .extend({
    // Add additional validation for frontend
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(100, "Price must be at least ₹100"),
  })
  .omit({ ownerId: true }); // Owner ID will be added from current user

type TurfFormValues = z.infer<typeof turfFormSchema>;

const sportTypes = [
  "Football",
  "Cricket",
  "Basketball",
  "Tennis",
  "Badminton",
  "Hockey",
  "Volleyball",
  "Other"
];

const locations = [
  "Downtown",
  "North Side",
  "South Side",
  "East End",
  "West End",
  "Central Park",
  "Riverside",
  "Suburban Area"
];

export function TurfForm({ editMode = false, turfData }: TurfFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Format time for default values (from 24h to HH:MM)
  const formatTime = (time: string | undefined) => {
    if (!time) return "";
    return time;
  };

  // Format price for default values (from cents to whole number)
  const formatPrice = (price: number | undefined) => {
    if (!price) return "";
    return (price / 100).toString();
  };

  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    defaultValues: {
      name: turfData?.name || "",
      description: turfData?.description || "",
      sportType: turfData?.sportType || "Football",
      location: turfData?.location || "Downtown",
      price: turfData ? turfData.price / 100 : 1000, // Convert cents to whole number
      imageUrl: turfData?.imageUrl || "",
      availableFrom: formatTime(turfData?.availableFrom) || "06:00",
      availableTo: formatTime(turfData?.availableTo) || "22:00",
    },
  });

  const createTurfMutation = useMutation({
    mutationFn: async (data: TurfFormValues) => {
      // Convert price to cents for storage
      const turfData = {
        ...data,
        price: Math.round(data.price * 100),
      };

      const res = await apiRequest("POST", "/api/turfs", turfData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Turf created",
        description: "Your turf has been successfully created",
      });

      // Invalidate turf queries
      queryClient.invalidateQueries({ queryKey: ["/api/turfs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/turfs`] });

      // Redirect to dashboard
      navigate("/owner/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTurfMutation = useMutation({
    mutationFn: async (data: TurfFormValues) => {
      if (!turfData) throw new Error("No turf data to update");

      // Convert price to cents for storage
      const updatedTurfData = {
        ...data,
        price: Math.round(data.price * 100),
      };

      const res = await apiRequest("PUT", `/api/turfs/${turfData.id}`, updatedTurfData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Turf updated",
        description: "Your turf has been successfully updated",
      });

      // Invalidate turf queries
      queryClient.invalidateQueries({ queryKey: ["/api/turfs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/turfs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/turfs/${turfData?.id}`] });

      // Redirect to dashboard
      navigate("/owner/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: TurfFormValues) {
    if (editMode && turfData) {
      updateTurfMutation.mutate(data);
    } else {
      createTurfMutation.mutate(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turf Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter turf name" {...field} />
              </FormControl>
              <FormDescription>
                The name of your sports facility
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sportType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sportTypes.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Primary sport for this turf
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter location" {...field} />
                </FormControl>
                <FormDescription>
                  Area where the turf is located
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your turf, facilities, amenities, etc." 
                  className="resize-none min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide details about your turf facilities
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Hour (₹)</FormLabel>
              <FormControl>
                <Input type="number" min="100" step="50" {...field} />
              </FormControl>
              <FormDescription>
                Hourly rate in Indian Rupees
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="availableFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available From</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>
                  Opening time of your turf
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availableTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available To</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>
                  Closing time of your turf
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                URL of an image of your turf (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createTurfMutation.isPending || updateTurfMutation.isPending}
        >
          {createTurfMutation.isPending || updateTurfMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            editMode ? "Update Turf" : "Create Turf"
          )}
        </Button>
      </form>
    </Form>
  );
}