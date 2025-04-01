# Schritt 1: Basis-Image festlegen
FROM node:22.14.0 AS build

# Schritt 2: Arbeitsverzeichnis festlegen
WORKDIR /app

# Schritt 3: Paketabhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Schritt 4: Anwendungscode kopieren
COPY . .

# Schritt 5: Anwendung bauen
RUN npm run build

# Schritt 6: Produktions-Image
FROM node:22.14.0

# Arbeitsverzeichnis für die Produktionsumgebung
WORKDIR /app

# Nur das build-Verzeichnis und die package.json kopieren
COPY --from=build /app/.svelte-kit/output /app/.svelte-kit/output
COPY --from=build /app/package*.json /app/

# Produktionsabhängigkeiten installieren
RUN npm install --only=production

# Umgebungsvariable für den Server festlegen (falls erforderlich)
ENV NODE_ENV=production
ENV VITE_HOST=0.0.0.0

# Exponiere den Port, der im SvelteKit-Projekt verwendet wird (4173)
EXPOSE 4173

# Starten des Servers
CMD ["npm", "run", "preview"]
