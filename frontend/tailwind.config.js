/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        primary: "#0f766e",
        accent: "#fb7185",
        warm: "#f59e0b"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      backgroundImage: {
        "study-grid":
          "radial-gradient(circle at top left, rgba(15,118,110,0.14), transparent 32%), radial-gradient(circle at bottom right, rgba(245,158,11,0.12), transparent 28%)"
      }
    }
  },
  plugins: []
};
