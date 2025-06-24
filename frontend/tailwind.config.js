/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-black': '#000000',
        'chat-dark': '#1a1a1a',
        'chat-medium': '#2d2d2d',
        'chat-light': '#404040',
        'chat-text': '#e5e5e5',
        'chat-muted': '#9ca3af',
      }
    },
  },
  plugins: [],
}