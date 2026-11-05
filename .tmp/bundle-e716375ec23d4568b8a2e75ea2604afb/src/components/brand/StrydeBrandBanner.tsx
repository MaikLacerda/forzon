import React from "react";
import { ForzonBrandBanner } from "./ForzonBrandBanner";

interface StrydeBrandBannerProps {
  onNavigateTab: (tab: string) => void;
}

export const StrydeBrandBanner: React.FC<StrydeBrandBannerProps> = ({ onNavigateTab }) => {
  return <ForzonBrandBanner onNavigateTab={onNavigateTab} />;
};

export { ForzonBrandBanner };
