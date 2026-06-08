# Changelog

All notable changes to the **Todfeed** project will be documented in this file.

## [1.2.1] - 2026-06-08

### Fixed
*   **Gemini Model Lineup:** Cleaned up the API fallback model chain. Removed retired `gemini-1.5-flash` and invalid `gemini-3.1-pro` models. Added stable backup models `gemini-2.0-flash` and `gemini-3.1-flash-lite` to bypass temporary 503 high demand spikes and free-tier 429 quota limits.
*   **API Error Transparency:** Updated the AI engine to collect and report errors from all attempted models (`gemini-3.5-flash`, `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-pro`) upon complete fallback exhaustion, rather than only reporting the error of the last model.

### Added
*   **Caregiver Profiling & Greetings:** Added fields for the caregiver's name and role (Mom 👩, Dad 👨, Caregiver 🧑, Grandparent 👵) in both the first-time onboarding wizard and the Baby Profile settings panel, dynamically personalizing the Home Dashboard greeting (e.g., "Hi, Sarah!").

---

## [1.2.0] - 2026-06-08

### Added
*   **Hybrid Onboarding Experience:** Implemented a full-screen onboarding wizard for first-time users. Includes a 3-step feature introduction carousel and a 4-step interactive profile setup questionnaire (Name, Age in months slider, Country adaptation dropdown, Diet/Allergen multi-select chips) with dynamic baby dinosaur mascot sprites.
*   **Safety Checker AI Integration:** Added support for Gemini AI in the food safety search box. In addition to standard safety alerts, it now suggests 3-4 baby-safe food pairings (with '+ Pantry' buttons to inject them into active ingredients list) and custom cooking tips.
*   **Home Dashboard Panel:** Introduced a new default landing Dashboard screen featuring the selected baby dinosaur mascot logo, interactive progress stats, next meal shortcut checklist, and quick links.
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
