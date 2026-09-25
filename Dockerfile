# syntax=docker/dockerfile:1
# Multi-stage build for the static export: build the site with Node, serve
# the generated files with nginx. There is no Node server at runtime.

# ---- Build stage ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build-time config, baked into the HTML (see .env.example).
ARG SITE_URL
ARG NEXT_PUBLIC_CONTACT_EMAIL
ENV SITE_URL=$SITE_URL \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN npm run build

# ---- Runtime stage: serve static files -----------------------------------
FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 3000
# nginx runs in the foreground by default in this image.
