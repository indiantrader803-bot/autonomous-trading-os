/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B10",
        surface: "#0D1117",
        panel: "#111720",
        elevated: "#161D27",
        border: "#202936",
        primary: "#E8EDF5",
        secondary: "#8C9BAB",
        muted: "#647184",
        accent: "#00D6A3",
        positive: "#00C896",
        negative: "#FF5C68",
        warning: "#FFB547",
        info: "#4C9DFF",
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};
