import React from 'react';
import type { Bottle } from '@/types/bottle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Included as per user context, though not explicitly used yet
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge'; // Import Badge
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'; // Import general chart components
import {
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
} from 'recharts'; // Import specific radar chart components


interface BottleDetailModalProps {
  bottle: Bottle | null; // Allow null in case no bottle is selected
  isOpen: boolean;
  onClose: () => void;
}

const BottleDetailModal: React.FC<BottleDetailModalProps> = ({ bottle, isOpen, onClose }) => {
  if (!bottle) {
    return null; // Don't render anything if no bottle is provided
  }

  // Handler for changes in Dialog's open state
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(); // Call onClose when the dialog requests to be closed
    }
  };

  // Prepare data for the radar chart
  const chartData = React.useMemo(() => {
    if (!bottle?.spirit_profile) {
      return [];
    }
    return Object.entries(bottle.spirit_profile).map(([subject, value]) => ({
      subject,
      value,
    }));
  }, [bottle?.spirit_profile]);

  const chartConfig = React.useMemo(() => {
    if (!chartData.length) return {};
    return {
      value: {
        label: "Score",
        color: "hsl(var(--chart-1))", // Use theme color
      },
    };
  }, [chartData]);


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[600px] lg:max-w-[800px]"> {/* Adjusted max-width */}
        {/* Main grid for two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Image */}
          <div className="p-4 border rounded-md"> {/* Removed flex, center, bg-muted */}
            <img
              src={bottle.image_url}
              alt={bottle.name}
              className="w-full h-auto object-contain max-h-[70vh] rounded-md" // Added rounded-md
            />
          </div>

          {/* Right Column: Details */}
          <div className="p-4 space-y-4"> {/* Removed border, added space-y */}
            <DialogHeader className="p-0"> {/* Moved Header here, removed padding */}
              <DialogTitle className="text-2xl font-bold">{bottle.name}</DialogTitle>
              {/* Display Brand as subtitle */}
              <p className="text-sm text-muted-foreground">{bottle.brand}</p>
            </DialogHeader>

            {/* Badges for Type and Size */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{bottle.spirit_type}</Badge>
              <Badge variant="outline">{bottle.size}</Badge>
            </div>

            {/* Description */}
            {bottle.description && ( // Conditionally render description
              <p className="text-sm text-muted-foreground mt-2">{bottle.description}</p>
            )}

            {/* Spirit Profile Section */}
            {chartData.length > 0 && (
              <div className="mt-4 pt-4 border-t"> {/* Add top margin and border */}
                <h4 className="text-lg font-semibold mb-2">Spirit Profile</h4>
                <ChartContainer config={chartConfig} className="w-full aspect-square h-[250px]">
                  <RadarChart
                    data={chartData}
                    cx="50%" // Center horizontally
                    cy="50%" // Center vertically
                    outerRadius="80%" // Adjust size relative to container
                  >
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    {/* PolarRadiusAxis is often omitted if only one dataset and scale is obvious */}
                    <Radar
                      name={bottle.name} // Optional: name for the tooltip series
                      dataKey="value"
                      stroke="hsl(var(--chart-1))" // Use theme color
                      fill="hsl(var(--chart-1))" // Use theme color
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ChartContainer>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BottleDetailModal;