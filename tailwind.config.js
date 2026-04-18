/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#e8f2ff",
        mist: "#94a8c6",
      },
      boxShadow: {
        scene: "0 30px 70px rgba(8, 14, 28, 0.45)",
      },
    },
  },
  plugins: [],
};
