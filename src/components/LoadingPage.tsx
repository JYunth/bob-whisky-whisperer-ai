
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBobStore } from "@/store/bobStore";

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, username } = useBobStore();
  
  useEffect(() => {
    // If someone navigates directly to this route without a username
    if (!username) {
      navigate("/");
      return;
    }
    
    // Minimum loading time for UX + navigate when done
    const timer = setTimeout(() => {
      if (!isLoading) {
        navigate("/dashboard");
      }
    }, 3000); // Minimum 3 seconds for UX

    return () => clearTimeout(timer);
  }, [isLoading, navigate, username]);

  const loadingMessages = [
    "Analyzing your collection...",
    "Identifying your whisky preferences...",
    "Curating expert bottle recommendations...",
    "Discovering unique flavor profiles...",
    "Finding your next favorite whisky..."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bob-bg-primary px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-8">🔄 Bob is working...</h1>
        
        <div className="space-y-6">
          {loadingMessages.map((message, index) => (
            <p 
              key={index}
              className={`text-lg transition-opacity duration-1000 ${index < 3 ? 'opacity-100' : 'opacity-50'}`}
            >
              {message}
            </p>
          ))}
        </div>
        
        <div className="mt-12">
          <div className="w-16 h-16 border-4 border-bob-accent-primary border-t-transparent rounded-full mx-auto animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
