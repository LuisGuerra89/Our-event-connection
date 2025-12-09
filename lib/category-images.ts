// Mapping of category slugs to their background images
export const CATEGORY_BACKGROUND_IMAGES: Record<string, string> = {
  "after-work-activities": "/after_work.jpg",
  "extreme-sports": "/extreme_sports.jpg",
  "water-sports": "/water_sports.jpg",
  "weekend-activities": "/weekend_activities.jpg",
  "winter-sports": "/winter_sports.jpg",
  "travel": "/travel.jpg",
}

export function getCategoryBackgroundImage(categorySlug: string): string {
  return CATEGORY_BACKGROUND_IMAGES[categorySlug] || "/background.jpg"
}
