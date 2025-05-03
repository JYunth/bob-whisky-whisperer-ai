
import React from 'react';
import type { SpiritProfile } from '@/types/bottle'; // Import SpiritProfile type
import type { TasteProfile } from '@/store/types'; // Re-import original TasteProfile type
import { Radar } from 'recharts';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define props interface
interface TasteProfileCardProps {
  spiritProfile: SpiritProfile | null; // Renamed for clarity
  statsProfile: TasteProfile | null; // Add prop for the stats profile
}

const TasteProfileCard: React.FC<TasteProfileCardProps> = ({ spiritProfile, statsProfile }) => {
  // Use the props instead of fetching from store

  if (!spiritProfile) { // Keep loading based on spiritProfile calculation
    // Show skeleton loaders if profile is null (still calculating or not available)
    return (
      <div className="bob-card p-6">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="h-64 flex items-center justify-center">
          <Skeleton className="h-56 w-56 rounded-full" />
        </div>
      </div>
    );
  }

  // Format SpiritProfile data for radar chart
  const profileData = (Object.keys(spiritProfile) as Array<keyof SpiritProfile>).map(key => ({
    subject: key,
    value: spiritProfile[key] || 0, // Use the value from the spiritProfile prop
    fullMark: 5 // Assuming a max score of 5 for each profile attribute
  }));

  // Check if all values are zero (default profile)
  const isDefaultProfile = profileData.every(item => item.value === 0);

  return (
    <div className="bob-card p-6"> {/* Added padding */}
      <h2 className="font-semibold text-xl mb-4">Your Aggregate Taste Profile</h2>

      {isDefaultProfile ? (
         <div className="text-center py-12 text-bob-text-secondary">
           Your taste profile is being calculated. Add some whiskies to your collection!
         </div>
      ) : (
        <div className="h-64"> {/* Adjusted height */}
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profileData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              {/* Hide radius axis labels/ticks for cleaner look */}
              <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
              <Radar
                name="Taste Profile"
                dataKey="value" // Use 'value' which holds the profile score
                stroke="#C2A878" // Bob's primary accent
                fill="#C2A878"
                fillOpacity={0.7} // Slightly more opaque
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Re-add the stats section, using statsProfile prop */}
      {statsProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-bob-bg-secondary rounded-bob-card text-center">
            <p className="text-bob-text-secondary text-sm">Average Price</p>
            {/* Use statsProfile here */}
            <p className="text-2xl font-bold">${Math.round(statsProfile.averagePrice)}</p>
          </div>

          <div className="p-4 bg-bob-bg-secondary rounded-bob-card text-center">
            {/* Note: 'agePreference' actually stores proof range in the current calculation */}
            <p className="text-bob-text-secondary text-sm">Proof Range</p>
            <p className="text-2xl font-bold">
              {/* Use statsProfile here */}
              {statsProfile.agePreference.min && statsProfile.agePreference.max
               ? `${statsProfile.agePreference.min}-${statsProfile.agePreference.max}`
               : 'N/A'}
            </p>
          </div>

          <div className="p-4 bg-bob-bg-secondary rounded-bob-card text-center">
            <p className="text-bob-text-secondary text-sm">Top Style</p>
             {/* Use statsProfile here */}
            <p className="text-2xl font-bold">{statsProfile.styles[0]?.name || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasteProfileCard;
