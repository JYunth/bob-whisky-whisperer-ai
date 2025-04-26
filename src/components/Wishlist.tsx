
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBobStore } from '@/store/bobStore';
import BottleCard from './BottleCard';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { username, wishlist } = useBobStore();

  useEffect(() => {
    // Redirect to home if no username
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  return (
    <div className="min-h-screen bg-bob-bg-primary">
      <header className="bob-header">
        <h1 className="font-bold">Your Whisky Wishlist</h1>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">⭐ Whisky Wishlist</h2>
          <p className="text-bob-text-secondary">
            Your saved recommendations and favorite bottles
          </p>
        </div>
        
        <div className="space-y-4">
          {wishlist.map(bottle => (
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
            />
          ))}
        </div>
        
        {wishlist.length === 0 && (
          <div className="text-center py-12">
            <p className="text-bob-text-secondary">Your wishlist is empty. Add bottles from your recommendations!</p>
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
            onClick={() => navigate('/recommendations')}
            className="bob-button-secondary"
          >
            View Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
