import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
=======

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> a949fc9b4fbfb7b4395d28a96cca36ee8440da6e
})
