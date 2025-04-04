# Basis-Image mit Node.js
FROM node:22.14.0

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Paketabhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Anwendungscode kopieren
COPY . .

# Umgebungsvariablen für den Entwicklungsserver
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=5173

# Port exponieren (Standard für Vite/SvelteKit dev server)
EXPOSE 5173

# Starten des Entwicklungsservers
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]