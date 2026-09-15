import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF7ED',  // Light orange
          100: '#FFEDD5', // Very light orange
          500: '#F97316', // Primary orange
          600: '#EA580C', // Dark orange
        },
        darkText: '#1F2937',
        secondaryText: '#6B7280',
        appBorder: '#E5E7EB',
      },
    },
  },
  plugins: [],
};
export default config;
