import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/forms/login-form";
import { SignupForm } from "@/components/forms/signup-form";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const defaultTab = params.get("tab") || "login";
  const defaultRole = (params.get("role") as "player" | "owner") || "player";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === "player" ? "/player/dashboard" : "/owner/dashboard");
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
            <div className="md:col-span-1">
              <Card className="shadow-xl">
                <CardContent className="pt-6">
                  <div className="pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeTab === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="text-gray-500 mt-2">
                      {activeTab === "login" 
                        ? "Sign in to access turf bookings and management" 
                        : "Join TurfBooker to book or list your sports facilities"}
                    </p>
                  </div>
                  
                  <Tabs defaultValue={defaultTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <LoginForm defaultRole={defaultRole} />
                    </TabsContent>
                    <TabsContent value="signup">
                      <SignupForm defaultRole={defaultRole} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-1 mt-8 md:mt-0">
              <div className="text-center md:text-left md:pl-12">
                <h1 className="text-4xl font-bold text-gray-900">
                  <span className="block">Your one-stop platform for</span>
                  <span className="block text-primary-600 mt-2">sports turf booking</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto md:mx-0">
                  {activeTab === "login" 
                    ? "Log back in to check your upcoming games or manage your turf facilities." 
                    : "Join our community of sports enthusiasts and turf owners."}
                </p>
                
                <div className="mt-8 space-y-4 max-w-md mx-auto md:mx-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Find the best turfs</h3>
                      <p className="mt-1 text-gray-500">
                        Search and filter by location, sport type, and available time slots.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Easy booking</h3>
                      <p className="mt-1 text-gray-500">
                        Book and manage your turf reservations in just a few clicks.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Turf management</h3>
                      <p className="mt-1 text-gray-500">
                        For turf owners: manage your listings, schedules, and bookings efficiently.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
