/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paisa: {
          primary: "#4A8DFF",
          navy: "#223981",
          sky: "#6FA8FF",
          light: "#E4EEFF",
          darkText: "#1E293B",
          secondaryText: "#717983",
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'paisa-card': '0 8px 30px rgba(34, 57, 129, 0.08)',
        'paisa-hover': '0 14px 40px rgba(74, 141, 255, 0.18)',
        'paisa-glow': '0 0 20px rgba(111, 168, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
