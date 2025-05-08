import React, { useState, useEffect } from "react";
import DottedSeparator from "./DottedSeparator";
import { 
  OpeningPopularitySection, 
  BestOpeningsSection,
  WhiteOpeningsByRatingSection,
  BlackOpeningsByRatingSection
} from "./Sections";

const ChessDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference initially
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }

    // Add listener for changes in system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`${
        darkMode ? "bg-[#111111] text-white" : "bg-white text-black"
      } min-h-screen w-full flex flex-col items-center transition-colors duration-300`}
    >
      <div className="p-6 w-full max-w-5xl mx-auto flex justify-end tracking-wide">
        <button
          onClick={toggleDarkMode}
          className={`font-mono text-sm py-2 px-4 rounded-sm border ${
            darkMode
              ? "bg-[#222] text-gray-200 border-[#222] hover:bg-[#333]"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
          } transition-colors duration-300`}
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
      <div className="font-mono font-[200] w-full max-w-5xl px-4 py-8 tracking-wide">
        {/* Header and Description */}
        <div className="font-bold mb-8">
          <h1 className="text-md mb-2 text-center">
            Chess Opening Success and Other Analyses
          </h1>
          <div className="p-4" />
          <p
            className={`font-[200] ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } text-md text-center`}
          >
            Analysis of chess opening win rates and performance statistics
            across different ELO ratings and time controls.
          </p>
        </div>

        {/* Sections */}
        <OpeningPopularitySection darkMode={darkMode} />
        <BestOpeningsSection darkMode={darkMode} />
        <WhiteOpeningsByRatingSection darkMode={darkMode} />
        <BlackOpeningsByRatingSection darkMode={darkMode} />

        {/* Footer */}
        <div className="p-4" />
        <DottedSeparator
          dotCount={80}
          dotColor={darkMode ? "bg-gray-300" : "bg-gray-600"}
        />
        <div className="p-4" />
        <div
          className={`w-full text-center mt-8 mb-4 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <a
            href="https://github.com/tgben/chess"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm border ${
              darkMode
              ? "bg-[#222] text-gray-200 border-[#222] hover:bg-[#333]"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            } transition-colors duration-200`}
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