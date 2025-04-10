import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TurfForm } from "@/components/turf/turf-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Turf } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ManageTurf() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Query to get turf details
  const { data: turf, isLoading } = useQuery<Turf>({
    queryKey: [`/api/turfs/${numericId}`],
    enabled: !isNaN(numericId)
  });
  
  // Delete turf mutation
  const deleteTurfMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/turfs/${numericId}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Turf deleted",
        description: "Your turf has been successfully deleted",
      });
      
      // Invalidate turf queries
      queryClient.invalidateQueries({ queryKey: ["/api/turfs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/turfs`] });
      
      // Redirect to dashboard
      navigate("/owner/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete turf
  const handleDeleteTurf = () => {
    deleteTurfMutation.mutate();
    setDeleteDialogOpen(false);
  };
  
  // Check if user is the owner of the turf
  const isOwner = turf && user && turf.ownerId === user.id;
  
  // Loading state
  if (isLoading) {
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
  
  // Error state - turf not found or not owner
  if (!turf || !isOwner) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {!turf ? "Turf Not Found" : "Unauthorized Access"}
            </h1>
            <p className="text-gray-600 mb-8">
              {!turf 
                ? "The turf you're looking for doesn't exist or has been removed." 
                : "You don't have permission to manage this turf."}
            </p>
            <Link href="/owner/dashboard">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <Link href="/owner/dashboard">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Turf
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your turf
                    and remove all associated bookings and reviews.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteTurf}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteTurfMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Turf"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Manage Turf: {turf.name}</CardTitle>
              <CardDescription>Update your turf details and settings</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <TurfForm editMode={true} turfData={turf} />
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Turf Statistics</CardTitle>
                <CardDescription>View performance metrics for your turf</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary-600">Total Bookings</p>
                    <p className="text-2xl font-bold mt-1">0</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary-600">Avg. Rating</p>
                    <p className="text-2xl font-bold mt-1">N/A</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary-600">Revenue</p>
                    <p className="text-2xl font-bold mt-1">₹0</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Statistics will update as you receive bookings and reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
