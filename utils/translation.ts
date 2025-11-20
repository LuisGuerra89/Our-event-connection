/**
 * Translation utility function for internationalization (i18n)
 *
 * This is a placeholder implementation. In a production app,
 * this would integrate with a proper i18n library like next-intl or i18next.
 *
 * @param key - The translation key
 * @param params - Optional parameters for dynamic content
 * @returns The translated string (currently returns the key as-is)
 */
export function t(key: string, params?: Record<string, string | number>): string {
  // Placeholder implementation - returns the key as-is
  // In production, this would look up translations from a dictionary
  let translation = key

  // If params are provided, replace placeholders
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(`{${paramKey}}`, String(value))
    })
  }

  return translation
}

/**
 * Get current locale
 */
export function getLocale(): string {
  return "en" // Default to English
}

/**
 * Set locale
 */
export function setLocale(locale: string): void {
  // Placeholder for setting locale
  console.log(`Locale set to: ${locale}`)
}
