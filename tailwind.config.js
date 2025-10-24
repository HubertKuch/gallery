module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "apple-light": {
          "primary": "#007aff",
          "secondary": "#ff9500",
          "accent": "#ff2d55",
          "neutral": "#f5f5f7",
          "base-100": "#ffffff",
          "info": "#5ac8fa",
          "success": "#34c759",
          "warning": "#ffcc00",
          "error": "#ff3b30",
        },
        "apple-dark": {
          "primary": "#0a84ff",
          "secondary": "#ff9f0a",
          "accent": "#ff375f",
          "neutral": "#1c1c1e",
          "base-100": "#000000",
          "info": "#64d2ff",
          "success": "#30d158",
          "warning": "#ffcf0a",
          "error": "#ff453a",
        },
      },
    ],
  },
}
