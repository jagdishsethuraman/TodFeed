# Todfeed 🦖

> **Todfeed** is a premium, playful baby food preparation and routine planner web application. Designed to reduce the daily stress of deciding what to feed your baby, it leverages local smart matching and Gemini AI to suggest age-appropriate, safe, and culturally adapted recipes.

The user interface features a vibrant, cartoonish aesthetic inspired by the **Duolingo** app (bold HSL colors, flat 3D push buttons, tactile feedback, and a cute baby dinosaur mascot).

---

## 🌟 Key Features

*   👶 **Smart Baby Profile:** Log your baby's name, age (in months), dietary preferences (e.g., Vegetarian, Vegan, Dairy-Free), allergies, and country/culture of origin.
*   🍉 **Responsive Pantry & AI Recipes:** Pick available ingredients from your kitchen and match them with a pre-seeded local database of pediatrician-approved recipes.
*   ✨ **Gemini AI Generation:** Cascades through modern Gemini models (`gemini-3.5-flash`, `gemini-2.5-flash`, etc.) to generate personalized, safe, texture-correct recipes in real-time.
*   📝 **Interactive Daily Feed Sheet:** A playful timeline showing the baby's feeding schedule. Mark meals as "Eaten" (via 3D buttons) and log baby reaction emojis (Loved 😊, Ate Some 😐, Spit Out 😠). Reactions are locked until a meal is marked eaten to maintain clean logs.
*   🔒 **Pediatric Safety Warnings:** Scans ingredient selections for choking hazards (whole grapes, nuts) and dietary restrictions (e.g., honey under 12 months) before matching or generating.
*   🖨️ **Printable Routines:** Export/Print a beautifully formatted PDF daily routine sheet optimized to fit onto a single sheet of paper.
*   🔍 **Safety Guide & Search:** A dedicated guide for baby-led weaning (BLW) vs. purees, choking vs. gagging, and a search box to check specific foods (e.g., blueberry) instantly.

---

## 🛠️ Technology Stack

*   **Core Logic:** Vanilla JS (ES Modules)
*   **Styling:** Vanilla CSS with custom properties mapping to HSL colors for playful Duolingo styling
*   **Web Components:** Google Material Design 3 Web Components (`@material/web`)
*   **Bundler & Dev Server:** Vite (v8.0.x)
*   **AI SDK:** `@google/generative-ai`

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jagdishsethuraman/TodFeed.git
   cd TodFeed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   *Vite will start the server, typically at `http://localhost:8080`.*

4. Build for production:
   ```bash
   npm run build
   ```
   *The built files will be located in the `dist` folder.*

---

## 📁 Project Structure

```text
├── index.html                  # Main document entry point
├── package.json                # Project scripts and dependencies
├── src/
│   ├── main.js                 # Central coordinator and panel router
│   ├── theme.css               # Duolingo-inspired CSS system and M3 overrides
│   ├── components/
│   │   ├── profile.js          # Baby profile setup forms and milestones
│   │   ├── generator.js        # Pantry, custom input selector, and AI recipe generator
│   │   ├── planner.js          # Interactive daily routine timeline sheet
│   │   └── safety.js           # Pediatric safety guides and checker search
│   └── utils/
│       └── recipeEngine.js     # Safety check rules, local recipe DB, and Gemini client
└── public/
    └── app_icon_options.png    # Design assets
```

---

## 📄 Documentation

*   [ARCHITECTURE.md](ARCHITECTURE.md) - Project folder details and AI pipeline
*   [CHANGELOG.md](CHANGELOG.md) - History of features and bug fixes
*   [ROADMAP.md](ROADMAP.md) - Future plans and native app migrations
*   [SECURITY.md](SECURITY.md) - Security details regarding local storage of API keys
