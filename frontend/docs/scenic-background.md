# Scenic background

`MainLayout` wraps the existing user routes in `ScenicProvider` and
`ScenicLayout`. Authentication, OAuth callback, not-found and admin layouts
are independent and retain their existing presentation.

The central surface uses a mint/sky gradient. Two non-interactive photo
collages occupy only the outer gutters. Cards, forms, maps and dialogs keep
their own surfaces and interaction handlers. The normal content width is
preserved on smaller screens; the center remains up to 1320px wide.

## Selecting a scene

- Home: interleaved nature, coast, food, heritage, transport and city photos.
- Destination categories: `DestinationsPage` publishes the selected API
  category **names**, supporting both `categoryId` and `categoryIds`.
  Numeric IDs are never mapped to hardcoded categories.
- Search: the existing `search` parameter selects an appropriate theme when
  the keyword matches; unknown keywords retain a varied selection.
- Destination detail and favorites: `useScenicScene` shares photos and
  category names from the page's existing API responses.
- Trips and shared trips: transport plus photos from loaded itinerary stops.
- Preferences, AI chat and profile: a quieter variation of the same layout.

The provider keys scene data by pathname and query string, so a previous
page's photos cannot persist as the next route's scene. Decoration makes no
API requests. It never changes filters, pagination, authentication or data.

`scenic-scene.ts` interleaves multiple themes, deduplicates source photos,
and replaces known full-size local images with optimized local derivatives.

## Images and performance

The catalog is `src/data/scenic-photos.ts`. Managed WebP thumbnails live in
`public/images/scenic/`. Every thumbnail is at most 480px wide and 640px tall;
the complete 38-photo collection is approximately 0.97 MB. It is not loaded
all at once: every decoration is lazy-loaded, asynchronously decoded, and
marked low priority. Main page images retain their existing loading priority.

Original source links, authors, licenses and modification notes are recorded
in `credits.json`; the footer links to the readable `credits.html`.
When adding a photo, update the catalog and both credit files together.

Frames reserve their geometry before image decoding. A failed image is
replaced in the same frame by a branded gradient and compass, with no retry
loop. The collection is varied before images repeat on long pages.

## Responsive behavior

- 1280–1535px: slim rails, smaller frames and hidden captions.
- 1536px and wider: larger collages and destination captions.
- Below 1280px: insufficient side space; rails are not mounted and their
  images are not downloaded. The content gets the full viewport width.
- Rail length follows content size via `ResizeObserver`, without scroll
  handlers or continuous animation. Absolute rails never add page height.
- Reduced motion removes decorative rotations. Print hides the collages.

The layout stylesheet is scoped to `.scenic-shell`, `.scenic-layout` and
`.scenic-content`. `.scenic-page` opts a page canvas into the shared surface;
it does not make individual cards or dialogs transparent.

## File inventory

Created:

- `src/components/scenic/ScenicLayout.tsx` and `ScenicLayout.css`.
- `src/contexts/ScenicContext.tsx` and `src/hooks/useScenicScene.ts`.
- `src/utils/scenic-scene.ts` and `src/data/scenic-photos.ts`.
- `public/images/scenic/`: 38 WebP thumbnails, `credits.json`, `credits.html`.
- `tests/scenic-scene.test.mjs` and this document.

Modified:

- `src/layouts/MainLayout.tsx`: installs the shared provider and layout.
- `src/components/client/Footer.tsx`: links to photo attribution.
- `src/pages/client/HomePage.tsx`, `HomePage.css`: uses the tropical canvas.
- `src/pages/client/DestinationsPage.tsx`: publishes selected category names.
- `src/pages/client/DestinationDetailPage.tsx`, `FavoritesPage.tsx`,
  `TripDetailPage.tsx`, `SharedTripPage.tsx`: publishes already-loaded photos
  and opts the page canvas into the shared background.
- `src/pages/client/TripsPage.tsx`, `PreferencesPage.tsx`, `AiChatPage.tsx`,
  `ProfilePage.tsx`: opts the page canvas into the shared background.

No backend, router, API service, API type, authentication, database or
dependency files were changed.
