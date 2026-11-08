/*
 * The address of the StayBy backend.
 *
 * Set VITE_API_URL in your .env files:
 *   development: leave it out (defaults to http://localhost:8080)
 *   production : VITE_API_URL=https://api.your-domain.com
 */
const raw = import.meta.env.VITE_API_URL as string | undefined;

export const API_BASE_URL = (raw && raw.trim() ? raw.trim() : "http://localhost:8080").replace(/\/+$/, "");
