
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBobStore } from '@/store/bobStore';
import BottleCard from './BottleCard';
import { toast } from "sonner";

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const { username, recommendations } = useBobStore();

  useEffect(() => {
    // Redirect to home if no username
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  const handleShowAlternatives = () => {
    toast.info("Feature coming soon: Alternative recommendations");
  };

  return (
    <div className="min-h-screen bg-bob-bg-primary">
      <header className="bob-header">
        <h1 className="font-bold">Bob's Recommendations</h1>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">🧠 Bob's Picks for You</h2>
          <p className="text-bob-text-secondary">
            Based on your taste profile and collection, Bob suggests these bottles
          </p>
        </div>
        
        <div className="space-y-4">
          {recommendations.map(bottle => (
            <BottleCard
              key={bottle.id}
              id={bottle.id}
              name={bottle.name}
              distillery={bottle.distillery}
              region={bottle.region}
              age={bottle.age}
              price={bottle.price}
              image={bottle.image}
              tags={bottle.tags}
              inWishlist={bottle.inWishlist}
              rationale={bottle.rationale}
              showAlternatives={handleShowAlternatives}
            />
          ))}
        </div>
        
        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-bob-text-secondary">No recommendations available yet.</p>
          </div>
        )}
        
        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bob-button-secondary"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/wishlist')}
            className="bob-button-primary"
          >
            View Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
