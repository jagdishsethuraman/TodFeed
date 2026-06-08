# Changelog

All notable changes to the **Todfeed** project will be documented in this file.

---

## [1.2.0] - 2026-06-08

### Added
*   **Mascot & Favicon Integration:** Cropped and set Option C ("Excited Dino holding a bowl and spoon with yellow background") as the official app logo in the header and `favicon.png` in the browser tab.
*   **Custom Ingredient Input:** Added a text input field and "Add" button to the AI Recipe Generator panel. Parents can now type any custom ingredient (e.g., Quinoa, Salmon, Blueberries) and inject it as a tag directly into the active pantry selection list.
*   **Mascot Design Assets:** Generated and added the high-resolution app icon options grid and baby dinosaur mascot variations grid (`public/app_icon_options.png` and `public/todfeed_dino_mascot_variations.png`) to public assets.

### Changed
*   **Daily Planner Redesign:** Replaced the simple card planner layout with a playful vertical timeline track (`.timeline-container` and `.timeline-dot`).
*   **Tactile 3D Buttons:** Replaced standard HTML checkboxes with playful 3D "Mark Eaten" toggle buttons that transition to a solid green 3D pressed state when checked.
*   **UX Reaction Gates:** Reaction emojis (Loved 😊, Ate Some 😐, Spit Out 😠) are now disabled and greyed out until a meal is marked eaten, preventing blank or erroneous logs.
*   **Reaction Highlight Styling:** Emoji rating buttons now highlight with their own emotional color themes (red for disliked, yellow for neutral, green for loved).
*   **Gemini Model Defaulting:** Upgraded the AI client to use **`gemini-3.5-flash`** as the default model.
*   **Cascading Fallback Models:** Updated the Gemini API SDK client to cascade through actual available model IDs (`gemini-3.5-flash`, `gemini-2.5-flash`, `gemini-2.5-pro`, and `gemini-1.5-flash`) if the primary model is deprecated or not enabled.

---

## [1.1.0] - 2026-06-07

### Fixed
*   **M3 Navigation Event Bug:** Patched `src/main.js` to listen for the correct custom Material Design 3 event (`navigation-bar-activated` instead of `navigation-tab-change`), resolving tab panel routing issues.
*   **API Settings Modal Centering:** Replaced the buggy `<md-dialog>` styling (which floated to the top-left corner) with a fully custom `.duo-modal-overlay` wrapper that centers the modal card perfectly in the viewport with a beautiful backdrop glassy blur (`backdrop-filter: blur(5px)`).
*   **Button Width Collapse:** Replaced collapsable `@material/web` buttons with custom standard HTML `<button>` elements styled with the custom `.duo-btn` class, ensuring perfect spacing and preventing width collapses inside flex slots.

### Added
*   **M3 Shadow Font Overrides:** Added root declarations for all `--md-sys-typescale-...-font` and `--md-ref-typeface-...` variables to force `@material/web` component labels, text fields, and chips to inherit `Outfit` and `Plus Jakarta Sans` fonts instead of falling back to default serif fonts in the browser shadow DOM.

---

## [1.0.0] - 2026-06-06

### Added
*   **Initial Project Setup:** Configured Vite bundler with Vanilla JS.
*   **Duolingo-inspired CSS:** Mapped HSL colors to M3 CSS design tokens in `theme.css`. Created solid borders and custom bottom shadow classes for 3D buttons.
*   **Modular Rendering Panels:** Implemented four core panels:
    *   `profile.js`: Log baby details and view developmental milestones.
    *   `generator.js`: Multi-category ingredient pantry selector and safety checks.
    *   `planner.js`: Meal scheduling routine template.
    *   `safety.js`: Weaning guidelines and searchable food safety checkers.
*   **Recipe & Safety Engine:** Created `recipeEngine.js` containing 14 pre-seeded recipes, allergen indicators, choking hazard warnings, and a client-side Gemini API SDK integration.
*   **Local Storage Sync:** State synchronization for the baby profile, daily schedules, and API keys.
