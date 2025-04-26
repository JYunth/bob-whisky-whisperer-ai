
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBobStore } from '@/store/bobStore';
import TasteProfileCard from './TasteProfileCard';
import BottleCard from './BottleCard';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { username, collection, wishlist } = useBobStore();
  
  useEffect(() => {
    // Redirect to home if no username
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  return (
    <div className="min-h-screen bg-bob-bg-primary">
      <header className="bob-header">
        <h1 className="font-bold">Your Virtual Whisky Bar</h1>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Welcome, {username}</h1>
          <p className="text-bob-text-secondary">
            Bob has analyzed your collection of {collection.length} whiskies
          </p>
        </div>
        
        <div className="mb-8">
          <TasteProfileCard />
        </div>

        {/* Prominent Recommendations Section */}
        <div className="bg-bob-card p-6 rounded-lg shadow-md text-center mb-8">
          <h2 className="text-xl font-semibold mb-3 text-bob-text-primary">Bob has some elite recommendations for you!</h2>
          <p className="text-bob-text-secondary mb-4">Based on your taste profile and collection, check out what Bob thinks you'll love.</p>
          <Button
            onClick={() => navigate('/recommendations')}
            className="bob-button-primary"
          >
            Take a Look!
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Collection</h2>
          
          {/* Button moved to the section above */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collection.map(bottle => (
            <BottleCard
              key={bottle.id}
              bottle={bottle}
              inWishlist={wishlist.some(w => w.id === bottle.id)}
            />
          ))}
        </div>
        
        {collection.length === 0 && (
          <div className="text-center py-12">
            <p className="text-bob-text-secondary">No bottles in your collection yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
