/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.html", "./**/*.js"],
  theme: {
    container: {
      center: true,
      padding: "18px",
    },
    extend: {
      colors: {
        primary: "#F3EEEA",
        secondary: "#EBE3D5",
        third: "#B0A695",
        fourth: "#776B5D",
        ig: "#c13584",
        wa: "#25D366",
        line: "#000000",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        lentur: "lentur 3s linear infinite",
        "fade-in": "fadeIn 0.8s ease-in-out",
        "slide-up": "slideUp 0.8s ease-out",
        float: "float 6s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        lentur: {
          "0%, 100%": {
            borderRadius: "38% 62% 21% 79% / 71% 23% 77% 29% ",
            backgroundColor: "#383838",
          },
          "25%": {
            borderRadius: "31% 69% 25% 75% / 86% 18% 82% 14% ",
            backgroundColor: "#383838",
          },
          "50%": {
            borderRadius: "35% 65% 29% 71% / 60% 31% 69% 40% ",
            backgroundColor: "#383838",
          },
          "75%": {
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70% ",
            backgroundColor: "#383838",
          },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(50px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
