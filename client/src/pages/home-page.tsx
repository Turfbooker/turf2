import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { TurfListings } from "@/components/home/turf-listings";
import React, { Suspense, Component, ReactNode } from 'react';

// Custom error boundary component
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Error fallback component
function ErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b shadow-sm bg-white"></div>
      <div className="flex-grow flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the page. Please try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b shadow-sm bg-white"></div>
      <div className="flex-grow flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingPage />}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <HeroSection />
            <FeaturesSection />
            <TurfListings />
          </main>
          <Footer />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
