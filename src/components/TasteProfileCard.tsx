
import React from 'react';
import { useBobStore, TasteProfile } from "@/store/bobStore";
import { Radar } from 'recharts';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts';

const TasteProfileCard: React.FC = () => {
  const { tasteProfile } = useBobStore();
  
  if (!tasteProfile) {
    return <div className="bob-card animate-pulse h-64"></div>;
  }
  
  // Format regions data for radar chart
  const regionData = tasteProfile.regions.slice(0, 5).map(region => ({
    subject: region.name,
    A: region.value,
    fullMark: Math.max(...tasteProfile.regions.map(r => r.value)) + 1
  }));
  
  // Format styles data for radar chart
  const styleData = tasteProfile.styles.slice(0, 5).map(style => ({
    subject: style.name,
    A: style.value,
    fullMark: Math.max(...tasteProfile.styles.map(s => s.value)) + 1
  }));

  return (
    <div className="bob-card">
      <h2 className="font-semibold text-xl mb-4">Your Whisky Taste Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Preferred Regions</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={regionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Regions"
                  dataKey="A"
                  stroke="#C2A878"
                  fill="#C2A878"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Flavor Profile</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={styleData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Styles"
                  dataKey="A"
                  stroke="#B9A18D"
                  fill="#B9A18D"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-bob-bg-secondary rounded-bob-card text-center">
          <p className="text-bob-text-secondary text-sm">Average Price</p>
          <p className="text-2xl font-bold">${Math.round(tasteProfile.averagePrice)}</p>
        </div>
        
        <div className="p-4 bg-bob-bg-secondary rounded-bob-card text-center">
          <p className="text-bob-text-secondary text-sm">Age Range</p>
          <p className="text-2xl font-bold">
            {tasteProfile.agePreference.min}-{tasteProfile.agePreference.max} yrs
          </p>
        </div>
        
        <div className="p-4 bg-bob-bg-secondary rounded-bob-card text-center">
          <p className="text-bob-text-secondary text-sm">Top Style</p>
          <p className="text-2xl font-bold">{tasteProfile.styles[0]?.name || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default TasteProfileCard;
