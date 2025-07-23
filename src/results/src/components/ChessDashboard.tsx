import React from "react";
import {
  OpeningPopularitySection,
  BestOpeningsSection,
  WhiteOpeningsByRatingSection,
  BlackOpeningsByRatingSection,
} from "./Sections";
import Footer from "./Footer";

const ChessDashboard: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <div className="font-[200] w-full max-w-5xl px-4 py-16 tracking-wide">
        {/* Header and Description */}
        <div className="font-bold mb-8">
          <h1 className="text-3xl font-normal mb-6 text-center text-text-white drop-shadow-glow-sm">
            <span className="text-primary drop-shadow-glow">#</span>chess-opening-analysis
          </h1>
          <p className="font-[200] text-text-gray text-md text-center">
            Analysis of chess opening win rates and performance statistics
            across different ELO ratings and time controls.
          </p>
        </div>
        <OpeningPopularitySection />
        <BestOpeningsSection />
        <WhiteOpeningsByRatingSection />
        <BlackOpeningsByRatingSection />
        <Footer />
      </div>
    </div>
  );
};

export default ChessDashboard;
