import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { addDays, format, isToday, isSameDay, parseISO, isAfter, setHours, setMinutes } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Booking, Turf } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface BookingCalendarProps {
  turf: Turf;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export function BookingCalendar({ turf }: BookingCalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: [`/api/turfs/${turf.id}/bookings`],
    enabled: !!turf.id
  });
  
  // Generate time slots (hourly) based on turf availability
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = turf.availableFrom.split(":").map(Number);
    const [endHour, endMinute] = turf.availableTo.split(":").map(Number);
    
    const openingTime = setMinutes(setHours(date, startHour), startMinute);
    const closingTime = setMinutes(setHours(date, endHour), endMinute);
    
    // Current time used to disable past slots
    const now = new Date();
    
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = setMinutes(setHours(new Date(date), hour), 0);
      const slotEnd = setMinutes(setHours(new Date(date), hour + 1), 0);
      
      // Check if slot is in the past (for today)
      const isPastSlot = isToday(date) && isAfter(now, slotStart);
      
      // Check if slot is already booked
      const isBooked = bookings?.some(booking => {
        const bookingDate = new Date(booking.date);
        const [bookingStartHour] = booking.startTime.split(":").map(Number);
        
        return (
          isSameDay(bookingDate, date) && 
          bookingStartHour === hour &&
          booking.status !== "cancelled"
        );
      });
      
      slots.push({
        startTime: format(slotStart, "HH:mm"),
        endTime: format(slotEnd, "HH:mm"),
        isAvailable: !isPastSlot && !isBooked
      });
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots(selectedDate);
  
  const bookingMutation = useMutation({
    mutationFn: async (data: { turfId: number; date: Date; startTime: string; endTime: string }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking successful",
        description: `You have booked ${turf.name} on ${format(selectedDate, "MMM d, yyyy")} from ${selectedSlot?.startTime} to ${selectedSlot?.endTime}`,
      });
      
      // Invalidate bookings query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/turfs/${turf.id}/bookings`] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      
      // Reset selected slot
      setSelectedSlot(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book this turf",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedSlot) {
      toast({
        title: "No time slot selected",
        description: "Please select a time slot to book",
        variant: "destructive",
      });
      return;
    }
    
    bookingMutation.mutate({
      turfId: turf.id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime
    });
  };
  
  // Disable dates before today
  const disabledDays = { before: new Date() };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book a slot</CardTitle>
        <CardDescription>
          Select a date and time to book {turf.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-4">
          <div className="md:w-1/2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }
              }}
              disabled={disabledDays}
              className="rounded-md border"
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Slots for {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            
            {isLoadingBookings ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedSlot(slot)}
                    className="justify-start"
                  >
                    {slot.startTime} - {slot.endTime}
                  </Button>
                ))}
                
                {timeSlots.length === 0 && (
                  <p className="text-gray-500 col-span-2 text-center">No available slots for this date.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm font-medium text-gray-700">
          {selectedSlot ? `Selected: ${format(selectedDate, "MMM d")} ${selectedSlot.startTime}-${selectedSlot.endTime}` : "Select a time slot"}
        </p>
        <Button 
          onClick={handleBooking} 
          disabled={!selectedSlot || bookingMutation.isPending}
        >
          {bookingMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
