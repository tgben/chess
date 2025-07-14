import React from 'react';
import { VerticalBarChartComponent, OpeningPopularityChart } from './Charts';
import DottedSeparator from './DottedSeparator';
import { 
  whiteWinOpenings, 
  blackWinOpenings,
  whiteWinOpeningsBeginners,
  whiteWinOpeningsIntermediate,
  whiteWinOpeningsAdvanced,
  blackWinOpeningsBeginners,
  blackWinOpeningsIntermediate,
  blackWinOpeningsAdvanced,
  openingPopularityData
} from '../data/chessData';

interface SectionTitleProps {
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="font-[200] text-gray-600 text-md underline underline-offset-6 text-center">
      {" "}
      {title}{" "}
    </div>
  );
};

interface SectionProps {}

export const OpeningPopularitySection: React.FC<SectionProps> = () => {
  return (
    <>
      <DottedSeparator
        dotCount={80}
        dotColor="bg-gray-600"
      />
      <div className="p-4" />
      <SectionTitle title="Opening Popularity Trends (2012-2024)" />
      <div className="p-4" />
      
      <OpeningPopularityChart data={openingPopularityData} />
      
      <div className="p-4" />
      <div className="py-4">
        The Modern Defense surged in popularity between 2020-2022, jumping 29%
        from 1.95% to 2.52% of all games. Following this peak, it dropped back
        down to 1.62% by 2025. This opening thrives in shorter time controls
        like bullet and hyperbullet because of its aggressive and hypermodern
        playstyle. Players favor its early moves because they're typically
        safe to pre-move, creating time advantages and more tactical
        positions. I believe the opening's popularity spike stemmed primarily
        from the rise of short time control games rather than intrinsic
        qualities of the opening itself. Yet this raises a question: why
        didn't this trend persist into 2024 and 2025 as average time controls
        grew even shorter?
      </div>
      <div className="py-4">
        Interestingly, the five most popular openings collectively fell from
        representing 11.95% of total games in 2012 to merely 8.07% in 2025.
        This 32% decline doesn't necessarily indicate these openings lost
        favor. More likely, Lichess's expanding playerbase broadened the
        variety of openings used, diluting individual percentages. Greater
        player numbers naturally yield more total games and increased opening
        diversity.
      </div>
    </>
  );
};

export const BestOpeningsSection: React.FC<SectionProps> = () => {
  return (
    <>
      <div className="p-4" />
      <DottedSeparator
        dotCount={80}
        dotColor="bg-gray-600"
      />
      <div className="p-4" />
      <SectionTitle title="Most successful openings" />
      <div className="p-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VerticalBarChartComponent
          data={whiteWinOpenings}
          title="Best Openings for White"
          color="#FF6B6B"
          margin={{ top: 10, right: 0, left: -30, bottom: 10 }}
        />

        <VerticalBarChartComponent
          data={blackWinOpenings}
          title="Best Openings for Black"
          color="#8A2BE2"
        />
      </div>
      
      <div className="p-4" />
      <div className="py-4">
        The top five White openings boast an impressive 63.95% win rate, while
        the top five Black openings reach only 59.11%. This 4.84% gap seems
        striking – does it confirm White's significant advantage?
      </div>
      <div className="py-4">
        Not entirely. The overall difference between White and Black win rates
        is around 3%, which is insufficient to completely explain the nearly
        5% gap among successful openings. A key factor might be White's
        opening initiative – they choose the opening and thus control which
        positions emerge. White can select openings they've mastered and feel
        comfortable with, whereas Black must react to White's first move,
        often forced into unfamiliar positions. White's comfort advantage
        proves especially powerful at amateur levels, likely contributing
        substantially to the opening success disparity.
      </div>
      <div className="py-4">
        From my conversations with beginner and low-intermediate rated
        friends, many develop exclusively White repertoires. I've encountered
        players with solid e4 theory knowledge yet completely lacking d4
        responses, leaving them vulnerable when opponents open with d4. Most
        players maintain better-prepared White lines, resulting in markedly
        higher win rates for certain openings.
      </div>
    </>
  );
};

export const WhiteOpeningsByRatingSection: React.FC<SectionProps> = () => {
  return (
    <>
      <div className="p-4" />
      <DottedSeparator
        dotCount={80}
        dotColor="bg-gray-600"
      />
      <div className="p-4" />
      <SectionTitle title="Most successful openings for white across different ELO ratings" />
      <div className="p-4" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VerticalBarChartComponent
          data={whiteWinOpeningsBeginners}
          title='Beginner'
          color="#FF6B6B"
        />

        <VerticalBarChartComponent
          data={whiteWinOpeningsIntermediate}
          title='Intermediate'
          color="#4ECDC4"
        />

        <VerticalBarChartComponent
          data={whiteWinOpeningsAdvanced}
          title='Advanced'
          color="#F9C74F"
        />
      </div>
    </>
  );
};

export const BlackOpeningsByRatingSection: React.FC<SectionProps> = () => {
  return (
    <>
      <div className="p-6" />
      <div className="p-4" />
      <SectionTitle title="Most successful openings for black across different ELO ratings" />
      <div className="p-4" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VerticalBarChartComponent
          data={blackWinOpeningsBeginners}
          title='Beginner'
          color="#8A2BE2"
        />

        <VerticalBarChartComponent
          data={blackWinOpeningsIntermediate}
          title='Intermediate'
          color="#3CB371"
        />

        <VerticalBarChartComponent
          data={blackWinOpeningsAdvanced}
          title='Advanced'
          color="#20B2AA"
        />
      </div>
      
      <div className="p-4" />
      <div className="py-4">
        Aggressive openings clearly correlate with higher win rates,
        particularly for beginners under 1200 Elo. The Two Knights Defense,
        Knight Attack rewards white beginners with a staggering 68.52% win
        rate. While I anticipated this opening's success, nearly 70% across
        25,000 games is absurd. If you're a beginner, please learn this
        opening for free wins!
      </div>
      <div className="py-4">
        The Fried Liver Attack delivers a similar success rate at 68.54% for
        advanced players across 50,000 games. This surprised me because the
        Fried Liver represents a classic opening trap that beginners typically
        learn to outwit chess novices during casual party games. I had assumed
        advanced players would recognize and avoid this trap, yet this data
        suggests even experienced players fall victim to these tactical
        openings.
      </div>
      <div className="py-4">
        As players advance, Black's counter-attacking arsenal strengthens,
        boosting opening effectiveness. While beginner Black players peak at
        64.48% with the Irish Gambit, both intermediate and advanced players
        approach 70% with attacking responses such as the King's Pawn Opening:
        Speers (69.96%) and the Queen's Gambit Refused: Albin Countergambit
        (69.31%).
      </div>
      <div className="py-4">
        This pattern suggests experienced players develop more comprehensive
        repertoires including well-studied Black theory (featuring prepared
        aggressive lines). In my experience, players gravitate toward
        aggressive Black lines because these force White beyond familiar
        theory, steering the game toward tactical complexity rather than
        methodical positional play favoring prepared theory. The lesson stands
        clear: invest time studying your Black theory!
      </div>
    </>
  );
};