/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(200, 59.80%, 64.90%)',
        'primary-op': 'hsl(287, 60%, 65%, 0.1)',
        'text-gray': 'hsl(218, 10.80%, 85.50%)',
        'gray-op': 'hsl(219, 14%, 71%, 0.1)',
        'bg-main': 'hsl(227, 13.20%, 20.80%)',
        'text-white': 'hsl(0, 0.00%, 100.00%)',
        // old colors
        // primary: 'hsl(287, 60%, 65%)',
        // 'primary-op': 'hsl(287, 60%, 65%, 0.1)',
        // 'text-gray': 'hsl(219, 14%, 71%)',
        // 'gray-op': 'hsl(219, 14%, 71%, 0.1)',
        // 'bg-main': 'hsl(218, 12%, 18%)',
        // 'text-white': 'hsl(0, 0%, 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(128, 193, 218, 0.3)',
        'glow': '0 0 20px rgba(128, 193, 218, 0.4)',
        'glow-lg': '0 0 30px rgba(128, 193, 218, 0.5)',
      },
      dropShadow: {
        'glow-sm': '0 0 10px rgba(128, 193, 218, 0.3)',
        'glow': '0 0 20px rgba(128, 193, 218, 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      }
    },
  },
  plugins: [],
}
