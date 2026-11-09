/**
 * Every photo, icon and video the site itself shows. The files live on
 * Cloudinary and the site uses these links. Product photos are not here: they
 * are saved with each product from the dashboard.
 */
export const MEDIA = {
  // Logo mark and browser icons
  mark: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234672/riziq-khamar/brand/mark.png",
  icon: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234676/riziq-khamar/brand/icon.png",
  appleIcon: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234678/riziq-khamar/brand/apple-icon.png",
  og: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234673/riziq-khamar/brand/og.jpg",

  // Photos on the home and About pages
  heroPalms: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234679/riziq-khamar/site/hero-palms.jpg",
  storyGachi: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234680/riziq-khamar/site/story-gachi.jpg",
  storyClimb: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234681/riziq-khamar/site/story-climb.jpg",
  aboutGrove: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234682/riziq-khamar/site/about-grove.jpg",
  farmBanner: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234683/riziq-khamar/site/farm-banner.jpg",
  promoBanner: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234690/riziq-khamar/promo/khejur-gur-banner.jpg",

  // The farm video and the frame shown before it plays
  farmStoryPoster: "https://res.cloudinary.com/dbildjokv/image/upload/v1794234686/riziq-khamar/site/farm-story-poster.webp",
  farmStoryVideo: "https://res.cloudinary.com/dbildjokv/video/upload/v1794234689/riziq-khamar/site/farm-story.mp4",
} as const;
