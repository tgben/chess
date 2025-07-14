import React from "react";
import DottedSeparator from "./DottedSeparator";
import { 
  OpeningPopularitySection, 
  BestOpeningsSection,
  WhiteOpeningsByRatingSection,
  BlackOpeningsByRatingSection
} from "./Sections";

const ChessDashboard: React.FC = () => {

  return (
    <div className="bg-white text-black min-h-screen w-full flex flex-col items-center">
      <div className="font-mono font-[200] w-full max-w-5xl px-4 py-8 tracking-wide">
        {/* Header and Description */}
        <div className="font-bold mb-8">
          <h1 className="text-md mb-2 text-center">
            Chess Opening Success and Other Analyses
          </h1>
          <div className="p-4" />
          <p className="font-[200] text-gray-600 text-md text-center">
            Analysis of chess opening win rates and performance statistics
            across different ELO ratings and time controls.
          </p>
        </div>

        {/* Sections */}
        <OpeningPopularitySection />
        <BestOpeningsSection />
        <WhiteOpeningsByRatingSection />
        <BlackOpeningsByRatingSection />

        {/* Footer */}
        <div className="p-4" />
        <DottedSeparator
          dotCount={80}
          dotColor="bg-gray-600"
        />
        <div className="p-4" />
        <div className="w-full text-center mt-8 mb-4 text-gray-600">
          <a
            href="https://github.com/tgben/chess"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-sm border bg-white text-gray-800 border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="font-mono text-sm">{`</>`}</span>
            <span className="text-sm">View on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChessDashboard;