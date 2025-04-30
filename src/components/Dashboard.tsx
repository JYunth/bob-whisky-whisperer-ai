
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBobStore } from '@/store/bobStore';
import type { RecommendationType } from '@/store/types'; // Import the type
import { toast } from "sonner"; // Import toast
import TasteProfileCard from './TasteProfileCard';
import BottleCard from './BottleCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    username,
    collection,
    wishlist,
    isLoading,
    activeRecommendationType,
    recommendationParams,
    generalRecommendations,
    similarPriceRecommendations,
    similarProfileRecommendations,
    complementaryRecommendations,
    // fetchGeneralRecommendations, // Removed incorrect function
    fetchSimilarPriceRecommendations,
    fetchSimilarProfileRecommendations,
    fetchComplementaryRecommendations,
  } = useBobStore();

  // State for controls
  const [activeTab, setActiveTab] = useState<RecommendationType>('general');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [focus, setFocus] = useState('');

  // Handler to trigger fetches
  // Handler to trigger fetches (ensure toast is available)
  const handleFetchRecommendations = () => {
    if (!username) {
      toast.error("Username not found. Cannot fetch recommendations.");
      return;
    }

    switch (activeTab) {
      case 'general':
        // General recommendations are fetched initially.
        // Clicking 'Get Recommendations' on General won't trigger a new fetch here.
        // We rely on the initial load or other fetches setting the active type.
        console.log("Displaying initial general recommendations.");
        // If explicit activation is needed, a store action `setActiveRecommendationType` would be required.
        break;
      case 'similarPrice':
        const min = minPrice ? parseFloat(minPrice) : undefined;
        const max = maxPrice ? parseFloat(maxPrice) : undefined;
        if (min !== undefined && max !== undefined && min > max) {
            toast.error("Min price cannot be greater than max price.");
            return;
        }
        fetchSimilarPriceRecommendations(username, min, max);
        break;
      case 'similarProfile':
        // Ensure focus is not empty string, pass undefined if it is
        fetchSimilarProfileRecommendations(username, focus.trim() || undefined);
        break;
      case 'complementary':
        fetchComplementaryRecommendations(username);
        break;
      default:
        console.warn("Unknown recommendation type selected:", activeTab);
    }
  };

  // Helper to get the current recommendations based on active type
  const getCurrentRecommendations = () => {
    switch (activeRecommendationType) {
      case 'general':
        return generalRecommendations;
      case 'similarPrice':
        return similarPriceRecommendations;
      case 'similarProfile':
        return similarProfileRecommendations;
      case 'complementary':
        return complementaryRecommendations;
      default:
        return [];
    }
  };

  const currentRecommendations = getCurrentRecommendations();

  // Helper to display current parameters
  const renderCurrentParams = () => {
    if (isLoading) return null; // Don't show params while loading new ones

    const { minPrice, maxPrice, profileFocus } = recommendationParams;
    let paramText = '';

    switch (activeRecommendationType) {
      case 'general':
        paramText = 'Showing general recommendations.';
        break;
      case 'similarPrice':
        if (minPrice !== undefined && maxPrice !== undefined) {
          paramText = `Showing recommendations between $${minPrice} and $${maxPrice}.`;
        } else if (minPrice !== undefined) {
          paramText = `Showing recommendations above $${minPrice}.`;
        } else if (maxPrice !== undefined) {
          paramText = `Showing recommendations below $${maxPrice}.`;
        } else {
          paramText = 'Showing recommendations based on similar price (no specific range).';
        }
        break;
      case 'similarProfile':
        if (profileFocus) {
          paramText = `Showing recommendations similar to '${profileFocus}' profile.`;
        } else {
          paramText = 'Showing recommendations based on similar taste profile.';
        }
        break;
      case 'complementary':
        paramText = 'Showing recommendations complementary to your collection.';
        break;
      default:
        paramText = '';
    }
    // Only show param text if recommendations exist or were attempted
     if (paramText && (currentRecommendations.length > 0 || Object.keys(recommendationParams).length > 0 || activeRecommendationType !== 'general')) {
       return <p className="text-sm text-bob-text-secondary mb-4">{paramText}</p>;
     }
     return null;

  };


  useEffect(() => {
    // Redirect to home if no username
    if (!username) {
      navigate('/');
    }
    // Fetch initial general recommendations if not already loaded (optional, depends on desired UX)
    // if (username && generalRecommendations.length === 0 && !isLoading) {
    //   fetchUserData(username); // Or a dedicated general fetch if added
    // }
  }, [username, navigate]); // Removed generalRecommendations, isLoading, fetchUserData dependencies for now


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

        {/* Recommendation Controls and Display */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bob's Recommendations</h2>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RecommendationType)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="similarPrice">Similar Price</TabsTrigger>
              <TabsTrigger value="similarProfile">Similar Profile</TabsTrigger>
              <TabsTrigger value="complementary">Complementary</TabsTrigger>
            </TabsList>

            {/* Parameter Inputs - Conditionally Rendered (Logic to add) */}
            <div className="flex items-end space-x-2 mb-4 p-4 border rounded-md bg-bob-card">
              {activeTab === 'similarPrice' && (
                <>
                  <div className="flex-1">
                    <Label htmlFor="minPrice">Min Price ($)</Label>
                    <Input id="minPrice" type="number" placeholder="e.g., 50" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="bob-input" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="maxPrice">Max Price ($)</Label>
                    <Input id="maxPrice" type="number" placeholder="e.g., 100" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="bob-input" />
                  </div>
                </>
              )}
              {activeTab === 'similarProfile' && (
                <div className="flex-1">
                  <Label htmlFor="focus">Taste Focus</Label>
                  <Input id="focus" placeholder="e.g., Peaty, Fruity, Smooth" value={focus} onChange={(e) => setFocus(e.target.value)} className="bob-input" />
                </div>
              )}
              {(activeTab === 'general' || activeTab === 'complementary') && (
                 <div className="flex-1 text-sm text-bob-text-secondary flex items-center">No parameters needed for this type.</div>
              )}
              {/* Disable button while loading */}
              <Button onClick={handleFetchRecommendations} className="bob-button-primary" disabled={isLoading}>
                {isLoading ? 'Fetching...' : 'Get Recommendations'}
              </Button>
            </div>

            {/* Recommendation Display Area */}
            <div className="mt-4 min-h-[200px]"> {/* Added min-height */}
              {renderCurrentParams()} {/* Display current parameters */}

              {isLoading ? (
                // Loading State using Skeletons
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                     <div key={index} className="flex items-center space-x-4 p-4 border rounded-md bg-bob-card-secondary">
                       <Skeleton className="h-12 w-12 rounded-full" />
                       <div className="space-y-2 flex-1">
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-4 w-1/2" />
                       </div>
                       <Skeleton className="h-8 w-8" /> {/* Placeholder for add button */}
                     </div>
                  ))}
                </div>
              ) : currentRecommendations.length > 0 ? (
                // Recommendation List
                <div className="space-y-6">
                  {currentRecommendations.map(bottle => (
                    <BottleCard
                      key={`${activeRecommendationType}-${bottle.id}`} // Ensure unique key across types
                      bottle={bottle}
                      inWishlist={wishlist.some(w => w.id === bottle.id)}
                      rationale={bottle.rationale}
                      // showAlternatives={() => toast.info("Alternative feature coming soon!")} // Example if needed
                    />
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="text-center py-12">
                  <p className="text-bob-text-secondary">
                    {activeRecommendationType === 'general' && !recommendationParams.minPrice && !recommendationParams.maxPrice && !recommendationParams.profileFocus
                      ? "No general recommendations available yet. Try fetching specific types!"
                      : "No recommendations found for the selected criteria."}
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </div>


        {/* Collection Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Collection</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Adjusted grid for potentially more space */}
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
