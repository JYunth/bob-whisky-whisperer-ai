
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useBobStore } from "@/store/bobStore";

const UsernameEntry: React.FC = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setUsername: storeUsername, fetchUserData } = useBobStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Please enter your BAXUS username");
      return;
    }
    
    setError(null);
    storeUsername(username);
    
    try {
      await fetchUserData(username);
      navigate("/loading");
    } catch (err) {
      console.error("Error:", err);
      setError("Could not process your request. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bob-bg-primary px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-bob-card shadow-bob-card p-8 animate-fade-through">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">🧠 Meet Bob</h1>
            <p className="text-bob-text-secondary">Your AI Whisky Expert</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block mb-2 text-bob-text-primary font-medium">
                Enter your BAXUS username to begin
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bob-input"
                placeholder="Your username"
              />
              {error && <p className="mt-2 text-bob-error text-sm">{error}</p>}
            </div>
            
            <Button 
              type="submit" 
              className="bob-button-primary w-full flex items-center justify-center"
            >
              <span className="mr-2">🔍</span>
              Get My Recommendations
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-bob-text-secondary">
            <p>
              Bob will analyze your virtual whisky collection and provide expert recommendations
              based on your existing preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameEntry;
