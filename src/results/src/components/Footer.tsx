import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
          <a
            href="https://github.com/tgben/chess"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-gray hover:text-primary transition-colors text-center hover:drop-shadow-glow"
          >
            {`</>`} tgben/chess
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
