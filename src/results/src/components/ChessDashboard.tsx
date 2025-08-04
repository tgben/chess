import {
  OpeningPopularitySection,
  BestOpeningsSection,
  WhiteOpeningsByRatingSection,
  BlackOpeningsByRatingSection,
} from "./Sections";
import Footer from "./Footer";

export default () => (
  <div className="min-h-screen w-full flex flex-col items-center">
    <div className="font-[200] w-full max-w-5xl px-4 py-16 tracking-wide">
      <div className="font-bold mb-8">
        <h1 className="text-2xl md:text-3xl font-normal mb-6 text-center text-text-white drop-shadow-glow-sm">
          Chess Opening Analysis
        </h1>
        <div className="font-[200] text-text-gray text-sm md:text-lg text-center">
          How opening success differs across different ELO ratings.
        </div>
      </div>
      <OpeningPopularitySection />
      <BestOpeningsSection />
      <WhiteOpeningsByRatingSection />
      <BlackOpeningsByRatingSection />
      <Footer />
    </div>
  </div>
);
