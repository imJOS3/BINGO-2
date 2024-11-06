// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        digital: ['"DS-Digital"', 'sans-serif'], // Nombre de la fuente personalizada
      },
    },
  },
  plugins: [
    require("tailwindcss-animated"), // Asegúrate de que esta línea esté aquí
  ],
};
