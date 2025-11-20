import { EnhancedListTab } from './EnhancedListTab';

interface ListTabContentProps {
  similarExpsData: Array<{
    id: string;
    title: string;
    category: string;
    similarity_score?: number;
    location_text?: string;
    time_of_day?: string;
    created_at: string;
    user_profiles?: {
      username: string | null;
      display_name: string | null;
    } | null;
  }>;
  currentCategory: string;
  currentLocation?: string;
  currentTimeOfDay?: string;
}

export default function ListTabContent({
  similarExpsData,
  currentCategory,
  currentLocation,
  currentTimeOfDay,
}: ListTabContentProps) {
  return (
    <EnhancedListTab
      experiences={similarExpsData}
      currentCategory={currentCategory}
      currentLocation={currentLocation}
      currentTimeOfDay={currentTimeOfDay}
    />
  );
}
