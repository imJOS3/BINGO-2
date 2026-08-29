// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        digital: ['"DS-Digital"', 'sans-serif'], // Nombre de la fuente personalizada
      },
      // Tailwind solo genera modificadores de opacidad múltiplos de 5.
      opacity: {
        8: '0.08',
        12: '0.12',
        14: '0.14',
      },
      // Registrar la paleta aquí es lo que permite usar opacidad
      // (text-bingo-felt/55). Con text-[var(--bingo-felt)]/55 Tailwind no
      // genera ninguna regla y el texto hereda el color del padre.
      colors: {
        bingo: {
          felt: 'rgb(var(--bingo-felt-rgb) / <alpha-value>)',
          'felt-deep': 'rgb(var(--bingo-felt-deep-rgb) / <alpha-value>)',
          'felt-light': 'rgb(var(--bingo-felt-light-rgb) / <alpha-value>)',
          red: 'rgb(var(--bingo-red-rgb) / <alpha-value>)',
          amber: 'rgb(var(--bingo-amber-rgb) / <alpha-value>)',
          ink: 'rgb(var(--bingo-ink-rgb) / <alpha-value>)',
          paper: 'rgb(var(--bingo-paper-rgb) / <alpha-value>)',
          ticket: 'rgb(var(--bingo-ticket-rgb) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animated"), // Asegúrate de que esta línea esté aquí
  ],
};
