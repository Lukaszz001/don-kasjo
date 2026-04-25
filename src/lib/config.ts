import { getSetting } from "./db/models/settings"

/**
 * Priority: 1. Database (Setting model) -> 2. Environment Variables -> 3. Fallback value
 */
export async function getConfig(key: string, fallback?: string): Promise<string> {
  // We avoid server-side DB calls if we are in a purely static context, 
  // but for dynamic SSR it's fine.
  try {
    const dbValue = await getSetting<string>(`env:${key}`)
    if (dbValue !== null && dbValue !== undefined) {
      return dbValue
    }
  } catch (error) {
    console.error(`[Config] Error fetching key ${key} from DB:`, error)
  }

  // Fallback to process.env
  const envValue = process.env[key]
  if (envValue !== undefined) {
    return envValue
  }

  return fallback || ""
}

export const CONFIG_KEYS = {
  APP_URL: "NEXT_PUBLIC_APP_URL",
  KICK_CLIENT_ID: "KICK_CLIENT_ID",
  KICK_CLIENT_SECRET: "KICK_CLIENT_SECRET",
  KICK_REDIRECT_URI: "KICK_REDIRECT_URI",
  KICK_CHANNEL_ID: "NEXT_PUBLIC_KICK_CHANNEL_ID",
  BOT_NAME: "KICK_BOT_NAME", // Added as an example for "kick bot"
  BOT_CHANNEL: "KICK_BOT_CHANNEL",
}
