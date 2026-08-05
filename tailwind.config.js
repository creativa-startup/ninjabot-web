/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Token de borde enterprise para división de paneles (border-r border-border)
        // Regla estricta: borde translúcido, nunca sólido opaco.
        border: 'rgba(0,0,0,0.05)',
        // Color primario de marca (near-black zinc neutro, consistente con el primary actual)
        brand: '#18181B',
      },
      boxShadow: {
        // Sombra ambiental desenfocada — regla estricta (prohibido shadow-md/lg/xl)
        soft: '0 20px 40px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}