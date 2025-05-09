# Build-Stage
FROM node:22-alpine AS build

WORKDIR /app


ENV NODE_OPTIONS="--experimental-specifier-resolution=node --experimental-modules"


# Kopiere package.json und package-lock.json, um Abhängigkeiten zu installieren
COPY package*.json ./
# Installiere benötigte Abhängigkeiten
RUN npm ci
# Im Dockerfile nach dem RUN npm ci
RUN npm install oslo --save
RUN npm list oslo
# Kopiere Skripts zuerst, um sie ausführbar zu machen
COPY scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh

# Kopiere den Rest des Projekts
COPY . .

# Umgebungsvariablen setzen
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=5173
ENV VITE_ALLOW_WARNINGS=true

# Port freigeben
EXPOSE 5173

# Startet die Entwicklungsumgebung mit Hot-Reloading
CMD ["npm", "run", "dev", "--", "--host"]