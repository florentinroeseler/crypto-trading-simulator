# Build-Stage
FROM node:22-alpine AS build

WORKDIR /app

# Kopiere package.json und package-lock.json, um Abhängigkeiten zu installieren
COPY package*.json ./
RUN npm ci

# Kopiere den Rest des Projekts
COPY . .

# Build der Anwendung
RUN npm run build

# Runtime-Stage
FROM node:22-alpine AS runtime

WORKDIR /app

# Kopiere die gebaute Anwendung und notwendige Dateien
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

# Laufzeitabhängigkeiten
RUN npm prune --production

# Umgebungsvariablen setzen
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173

# Port freigeben
EXPOSE 5173

# Startet die Anwendung
CMD ["node", "build"]