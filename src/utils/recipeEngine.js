/* Todfeed - Smart Recipe & AI Engine */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Pre-seeded database of baby food recipes across different developmental ages and regions.
export const LOCAL_RECIPES = [
  {
    id: "sweet-potato-puree",
    recipeName: "Velvety Sweet Potato Puree",
    ageMin: 4,
    ageMax: 6,
    ingredients: ["sweet potato", "water", "breastmilk", "formula"],
    texture: "Smooth, runny puree",
    prepTime: "5 mins",
    cookTime: "15 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "in", "jp", "it"],
    instructions: [
      "Peel the sweet potato and cut it into small, uniform cubes.",
      "Steam or boil the cubes for 12-15 minutes until easily pierced with a fork.",
      "Transfer to a blender and puree, adding breastmilk, formula, or cooking water until smooth and runny."
    ],
    safetyAlerts: "Sweet potato is an excellent, low-allergen starter food. Ensure it is fully pureed with no lumps for 4-6 months.",
    nutritionBenefit: "High in Beta-Carotene (Vitamin A) for healthy eye development and fiber for digestion."
  },
  {
    id: "carrot-puree",
    recipeName: "Creamy Carrot Puree",
    ageMin: 4,
    ageMax: 6,
    ingredients: ["carrot", "water", "breastmilk", "formula"],
    texture: "Smooth, runny puree",
    prepTime: "5 mins",
    cookTime: "12 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "in", "jp", "it"],
    instructions: [
      "Peel the carrots and slice them into thin rounds.",
      "Steam for 10-12 minutes until very soft.",
      "Blend until perfectly smooth, adding liquid (formula/breastmilk/water) to achieve a velvety consistency."
    ],
    safetyAlerts: "Nitrates can naturally occur in carrots. For babies under 6 months, commercial purees are tested, but if making at home, steam well and consume fresh.",
    nutritionBenefit: "Packed with antioxidants, Vitamin A, and Vitamin C to support a developing immune system."
  },
  {
    id: "avocado-mash",
    recipeName: "Simple Avocado Silk",
    ageMin: 4,
    ageMax: 8,
    ingredients: ["avocado", "breastmilk", "formula"],
    texture: "Velvety smooth mash",
    prepTime: "3 mins",
    cookTime: "0 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "it"],
    instructions: [
      "Cut a ripe avocado in half and scoop out the flesh.",
      "Place in a bowl and mash thoroughly with a fork.",
      "Whisk in a splash of breastmilk or formula to thin it out to a creamy, lump-free paste."
    ],
    safetyAlerts: "Avocado oxidizes (turns brown) quickly. Prepare right before serving to maintain appeal and freshness.",
    nutritionBenefit: "Excellent source of healthy monounsaturated fats, crucial for rapid infant brain development."
  },
  {
    id: "apple-puree",
    recipeName: "Golden Applesauce Puree",
    ageMin: 4,
    ageMax: 6,
    ingredients: ["apple", "water", "cinnamon"],
    texture: "Smooth fruit puree",
    prepTime: "5 mins",
    cookTime: "10 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "in", "it"],
    instructions: [
      "Peel, core, and chop the apple (Gala or Fuji work best) into chunks.",
      "Place chunks in a small saucepan with a splash of water and steam over medium heat for 10 minutes until tender.",
      "Puree in a blender until smooth. (For babies 7m+, you can add a tiny pinch of cinnamon)."
    ],
    safetyAlerts: "Apples must be cooked until soft before pureeing. Raw apples are a major choking hazard.",
    nutritionBenefit: "Rich in soluble fiber (pectin) and Vitamin C, promoting soft stools and digestive wellness."
  },
  {
    id: "banana-oat-mash",
    recipeName: "Mashed Banana & Warm Oat Porridge",
    ageMin: 7,
    ageMax: 9,
    ingredients: ["banana", "oats", "water", "breastmilk", "formula"],
    texture: "Thick mash with soft textures",
    prepTime: "3 mins",
    cookTime: "5 mins",
    diet: ["vegan", "vegetarian", "dairy-free"],
    countries: ["us", "in", "it"],
    instructions: [
      "Cook rolled oats in water for 5 minutes until fully softened.",
      "In a bowl, mash half a ripe banana until mostly smooth with small soft pieces.",
      "Mix the cooked oats and banana together, adding breastmilk or formula to achieve a warm, spoonable mash."
    ],
    safetyAlerts: "Ensure oats are thoroughly cooked and soft. Introduce oats gradually to check for gluten tolerance.",
    nutritionBenefit: "Complex carbohydrates provide sustained energy, while bananas offer potassium and vitamin B6."
  },
  {
    id: "pear-spinach-puree",
    recipeName: "Green Giant Pear & Spinach Puree",
    ageMin: 6,
    ageMax: 9,
    ingredients: ["pear", "spinach", "water"],
    texture: "Smooth green mash",
    prepTime: "5 mins",
    cookTime: "8 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "jp", "it"],
    instructions: [
      "Peel, core, and chop a ripe pear into chunks.",
      "Steam the pear for 5 minutes, then add clean spinach leaves and steam for another 2-3 minutes until wilted.",
      "Blend together until smooth, adding steam water if necessary."
    ],
    safetyAlerts: "Spinach contains nitrates. Feed in moderation as part of a varied diet.",
    nutritionBenefit: "Iron from spinach is better absorbed when paired with the Vitamin C naturally abundant in pears."
  },
  {
    id: "khichdi-soft",
    recipeName: "My First Moong Dal Khichdi",
    ageMin: 7,
    ageMax: 10,
    ingredients: ["rice", "lentils", "water", "turmeric", "cumin", "ghee"],
    texture: "Very soft, overcooked rice-lentil blend",
    prepTime: "10 mins",
    cookTime: "20 mins",
    diet: ["vegetarian", "gluten-free"],
    countries: ["in"],
    instructions: [
      "Wash 2 tablespoons of rice and 1 tablespoon of split yellow moong dal.",
      "Boil in a pressure cooker or saucepan with 1.5 cups of water, a tiny pinch of turmeric, and a tiny pinch of cumin powder.",
      "Cook until completely mushy and soft.",
      "Mash with the back of a spoon and stir in a few drops of ghee before serving warm."
    ],
    safetyAlerts: "Avoid adding salt to this recipe for babies under 12 months. Ensure the lentils are split and cooked to a complete mush.",
    nutritionBenefit: "A complete protein combination of grains and legumes, easy on the stomach and rich in iron."
  },
  {
    id: "okayu-tofu",
    recipeName: "Soft Rice Okayu with Tofu Silk",
    ageMin: 6,
    ageMax: 9,
    ingredients: ["rice", "tofu", "water"],
    texture: "Diluted rice porridge with soft tofu chunks",
    prepTime: "5 mins",
    cookTime: "25 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["jp"],
    instructions: [
      "Cook rice with water in a 1:10 ratio (1 part rice to 10 parts water) on low heat for 25 minutes to make traditional Japanese Okayu.",
      "Take silken tofu and press it through a fine sieve to make a smooth paste.",
      "Swirl the silken tofu paste into the warm rice okayu and serve at room temperature."
    ],
    safetyAlerts: "Soy (tofu) is a common allergen. Introduce individually and monitor for reactions over 3 days.",
    nutritionBenefit: "Extremely gentle on a baby's digestive tract while introducing plant-based calcium and protein."
  },
  {
    id: "semolina-porridge",
    recipeName: "Sweet Pear Semolina Porridge",
    ageMin: 7,
    ageMax: 10,
    ingredients: ["semolina", "pear", "water", "olive oil"],
    texture: "Smooth, warm porridge",
    prepTime: "5 mins",
    cookTime: "10 mins",
    diet: ["vegetarian", "dairy-free"],
    countries: ["it"],
    instructions: [
      "Grill or steam pear chunks until soft, then mash.",
      "Toast 2 tablespoons of semolina (suolino) in a pan with a drop of olive oil for 1 minute.",
      "Gradually whisk in water and cook on low for 5-8 minutes until thick and smooth.",
      "Fold in the mashed pear and let cool before feeding."
    ],
    safetyAlerts: "Semolina contains wheat (gluten). Do not feed if baby has gluten sensitivity or wheat allergy.",
    nutritionBenefit: "Provides iron-enriched wheat grains alongside healthy monounsaturated lipids from olive oil."
  },
  {
    id: "broccoli-florets-steamed",
    recipeName: "Tender Steamed Broccoli Trees",
    ageMin: 9,
    ageMax: 12,
    ingredients: ["broccoli", "water"],
    texture: "Soft finger food (Baby-Led Weaning style)",
    prepTime: "3 mins",
    cookTime: "8 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "it", "jp", "in"],
    instructions: [
      "Cut broccoli into medium-sized florets, keeping a long stem which acts as a natural handle for the baby.",
      "Steam for 7-8 minutes until the stem is completely soft when squeezed between fingers.",
      "Cool and hand it to the baby to feed themselves (Baby-Led Weaning)."
    ],
    safetyAlerts: "Broccoli must be soft enough to mash with gums. If the stem is woody or firm, it represents a choking hazard. Trim off tough outer skin.",
    nutritionBenefit: "Excellent for teaching self-feeding, pincer grasp, and packed with Vitamin K and Calcium."
  },
  {
    id: "sweet-potato-wedges",
    recipeName: "Baked Sweet Potato Fingers",
    ageMin: 9,
    ageMax: 12,
    ingredients: ["sweet potato", "olive oil", "cinnamon"],
    texture: "Soft baked finger food",
    prepTime: "5 mins",
    cookTime: "20 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["us", "it", "in"],
    instructions: [
      "Peel sweet potato and cut into thick, finger-sized wedges.",
      "Toss lightly with olive oil and a tiny pinch of cinnamon.",
      "Bake at 375°F (190°C) for 20 minutes until the wedges are completely soft in the middle but hold their shape."
    ],
    safetyAlerts: "Cut wedges into thick strips (about the size of an adult index finger) so the baby can grip and chew easily. Do not roast until crispy or hard.",
    nutritionBenefit: "High in dietary fiber, helping digest solid foods, and rich in potassium."
  },
  {
    id: "scrambled-egg-yolks",
    recipeName: "Golden Scrambled Egg Yolks",
    ageMin: 8,
    ageMax: 11,
    ingredients: ["egg", "breastmilk", "formula", "ghee"],
    texture: "Soft, crumbly paste",
    prepTime: "2 mins",
    cookTime: "4 mins",
    diet: ["vegetarian", "gluten-free"],
    countries: ["us", "in", "jp", "it"],
    instructions: [
      "Separate the yolk of a raw egg (egg whites are highly allergenic and best introduced carefully later).",
      "Whisk the yolk with 1 tablespoon of breastmilk or formula.",
      "Heat a drop of ghee or butter in a pan, pour in the yolk mixture, and cook on low heat, scrambling gently until fully cooked and soft."
    ],
    safetyAlerts: "Egg is a top allergen. Use only yolk first, ensuring it is thoroughly cooked. Do not feed if baby has a diagnosed egg allergy.",
    nutritionBenefit: "Egg yolks contain Choline and Lutein, which are fundamental building blocks for baby's brain and eye health."
  },
  {
    id: "banana-pancakes",
    recipeName: "Three-Ingredient Baby Pancakes",
    ageMin: 10,
    ageMax: 24,
    ingredients: ["banana", "oats", "egg", "cinnamon"],
    texture: "Soft, chewable pancake bites",
    prepTime: "5 mins",
    cookTime: "6 mins",
    diet: ["vegetarian", "dairy-free"],
    countries: ["us", "in", "it", "jp"],
    instructions: [
      "Mash 1 ripe banana in a bowl until liquid-like.",
      "Whisk in 1 whole egg (or 2 yolks for under 10m) and 3 tablespoons of finely ground oat flour, plus a pinch of cinnamon.",
      "Spoon small dollops onto a hot, lightly greased griddle.",
      "Cook for 2-3 minutes on each side until golden and cooked through. Cut into strips."
    ],
    safetyAlerts: "Contains whole egg. Make sure whole egg has been introduced successfully beforehand. Tear pancakes into tiny bite-sized strips.",
    nutritionBenefit: "High-protein, self-feeding finger food rich in potassium, protein, and dietary fiber."
  },
  {
    id: "lentil-veg-soup",
    recipeName: "Comforting Lentil & Zucchini Mash",
    ageMin: 8,
    ageMax: 12,
    ingredients: ["lentils", "zucchini", "carrot", "water", "olive oil"],
    texture: "Lumpy mash",
    prepTime: "5 mins",
    cookTime: "15 mins",
    diet: ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    countries: ["it", "in"],
    instructions: [
      "Boil red lentils (which cook quickly) with grated zucchini and carrots in water for 15 minutes.",
      "Once vegetables are soft and lentils have broken down, mash with a potato masher.",
      "Drizzle with a teaspoon of extra virgin olive oil before serving warm."
    ],
    safetyAlerts: "Ensure red lentils are completely soft. This recipe provides an excellent transition from purees to textured foods.",
    nutritionBenefit: "Lentils supply plant-based iron and zinc, while zucchini provides hydration and vitamins."
  }
];

// Helper to run ingredient and profile safety validation
export function runSafetyChecks(selectedIngredients, babyAgeMonths) {
  const warnings = [];

  const lowerIngredients = selectedIngredients.map(i => i.toLowerCase().trim());

  // Honey warning (Clostridium botulinum risk under 12 months)
  if (lowerIngredients.includes("honey") && babyAgeMonths < 12) {
    warnings.push({
      type: "DANGER",
      title: "Infant Botulism Warning (Honey)",
      message: "Never give honey to a baby under 12 months. It can contain spores of Clostridium botulinum, which can cause infant botulism, a serious and potentially fatal illness."
    });
  }

  // Cow's Milk warning (kidney strain / gut bleeding under 12 months)
  if ((lowerIngredients.includes("cow's milk") || lowerIngredients.includes("milk")) && babyAgeMonths < 12) {
    warnings.push({
      type: "WARNING",
      title: "Cow's Milk Limit",
      message: "Whole cow's milk should not be introduced as a primary drink before 12 months. A small amount cooked into purees is fine, but breastmilk or formula must remain the primary source of nutrition."
    });
  }

  // Salt & Sugar warning (under 12 months)
  if ((lowerIngredients.includes("salt") || lowerIngredients.includes("sugar")) && babyAgeMonths < 12) {
    warnings.push({
      type: "WARNING",
      title: "No Added Salt or Sugar",
      message: "Do not add salt or sugar to baby food. A baby's kidneys are too immature to handle added sodium, and sugar can cause tooth decay and establish unhealthy taste preferences."
    });
  }

  // Choking Hazard Warnings (under 24 months)
  const hazards = ["whole grapes", "grapes", "nuts", "whole nuts", "peanuts", "raw carrots", "popcorn", "honey chunks", "cherry tomatoes"];
  const matchingHazards = lowerIngredients.filter(i => hazards.includes(i));
  if (matchingHazards.length > 0) {
    warnings.push({
      type: "DANGER",
      title: "Choking Hazard Identified",
      message: `The following items are choking hazards: ${matchingHazards.join(", ")}. Ensure these items are finely ground, pureed to a smooth paste, or sliced into quarters lengthwise (for grapes/tomatoes) before feeding.`
    });
  }

  // General Solid Food advice
  if (babyAgeMonths < 6) {
    warnings.push({
      type: "INFO",
      title: "Pediatric Consultation Recommended",
      message: "Pediatric guidelines recommend exclusive breastfeeding or formula feeding for the first 6 months. Consult your pediatrician before introducing any solids."
    });
  }

  return warnings;
}

// Local Recipe Matching Engine
export function matchLocalRecipes(selectedIngredients, profile) {
  const { age, diet = [], allergies = [], country = "us" } = profile;
  const babyAge = parseInt(age, 10) || 6;

  // Filter recipes based on age limits and dietary constraints
  let candidates = LOCAL_RECIPES.filter(recipe => {
    // 1. Age check
    if (babyAge < recipe.ageMin) return false;
    
    // 2. Diet check (if profile lists vegetarian, recipe must contain vegetarian tag)
    for (const d of diet) {
      if (!recipe.diet.includes(d)) return false;
    }

    // 3. Allergies check (if recipe has an ingredient in allergies, skip)
    for (const allergen of allergies) {
      const lowerAllergen = allergen.toLowerCase().trim();
      if (recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerAllergen))) {
        return false;
      }
    }

    return true;
  });

  // Score candidates based on matching ingredients
  const scored = candidates.map(recipe => {
    let matchCount = 0;
    selectedIngredients.forEach(selected => {
      const lowerSel = selected.toLowerCase().trim();
      if (recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerSel))) {
        matchCount++;
      }
    });

    // Boost score if recipe targets baby's country
    let countryBoost = recipe.countries.includes(country) ? 1.5 : 0;

    // Standard scoring
    const score = matchCount + countryBoost;

    return { ...recipe, matchCount, score };
  });

  // Sort by score (descending) and matchCount (descending)
  scored.sort((a, b) => b.score - a.score || b.matchCount - a.matchCount);

  // Return candidates with at least some relevance, or the best ones for the age group
  return scored;
}

// Gemini AI Recipe Generator Integration
export async function generateAiRecipe(selectedIngredients, profile) {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error("API key not found. Please click the settings icon in the top right to configure your Gemini API key.");
  }

  const { age, diet = [], allergies = [], country = "us" } = profile;

  // Set up prompt for Gemini
  const prompt = `You are an expert pediatric nutritionist. Write a single, highly healthy and safe baby food recipe.
Profile of the Baby:
- Age: ${age} months
- Country/Region: ${country} (use appropriate local naming, tastes, and mild spices if appropriate for age)
- Dietary Restrictions: ${diet.join(", ") || "None"}
- Allergies to AVOID: ${allergies.join(", ") || "None"}
- Target Ingredients to use: ${selectedIngredients.join(", ")}

Generate a recipe. The recipe MUST be safe for this specific age (e.g., texture must match: smooth purees for 4-6m, thicker mashes/lumps for 7-9m, soft finger foods/minced for 10-12m, family table food cut small for 12m+). Never include honey for babies under 12 months. Never include whole nuts or raw hard veggies.

Return ONLY a JSON object. Do not include markdown code block formatting (no \`\`\`json tags), just raw JSON. The JSON structure MUST be:
{
  "recipeName": "...",
  "texture": "...",
  "prepTime": "...",
  "cookTime": "...",
  "ingredients": ["...", "..."],
  "instructions": ["...", "..."],
  "safetyAlerts": "...",
  "nutritionBenefit": "..."
}`;

  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro'
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  const errors = [];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting recipe generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = result.response.text();
      // Parse JSON safely
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error);
      
      const errMsg = error.message || String(error);
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes("api key") || lowerMsg.includes("api_key") || lowerMsg.includes("invalid key")) {
        throw new Error(`Invalid API Key: Please check your Gemini API Key in the settings dialog.`);
      }
      
      errors.push(`${modelName}: ${errMsg}`);
    }
  }

  throw new Error(`Failed to generate recipe via Gemini. Checked models: [${modelsToTry.join(', ')}]. Details:\n${errors.map(e => `- ${e}`).join('\n')}`);
}

// Daily meal sheet planner generator based on baby profile and country
export function generateDailyMealSheet(profile) {
  const { age, diet = [], allergies = [], country = "us" } = profile;
  const babyAge = parseInt(age, 10) || 6;

  // Adjust timing schedules and count based on age
  let schedule = [];

  // Define default routines based on age milestones
  if (babyAge >= 4 && babyAge <= 6) {
    schedule = [
      {
        time: "07:00 AM",
        mealType: "Morning Feed",
        title: "Breastmilk or Formula",
        desc: "A full feeding of milk to start the day. 6-8 oz.",
        isSolid: false
      },
      {
        time: "10:30 AM",
        mealType: "Mid-Morning Taster (First Solid)",
        title: "Single-Ingredient Puree",
        desc: "2-3 spoonfuls of a velvety vegetable puree (e.g. sweet potato or carrot) to explore flavors.",
        isSolid: true
      },
      {
        time: "01:00 PM",
        mealType: "Midday Feed",
        title: "Breastmilk or Formula",
        desc: "Follow-up liquid feeding. 6-8 oz.",
        isSolid: false
      },
      {
        time: "04:30 PM",
        mealType: "Late Afternoon Feed",
        title: "Breastmilk or Formula",
        desc: "Routine liquid feeding. 6-8 oz.",
        isSolid: false
      },
      {
        time: "07:30 PM",
        mealType: "Bedtime Feed",
        title: "Breastmilk or Formula",
        desc: "Comfort feed before sleep. 7-8 oz.",
        isSolid: false
      }
    ];
  } else if (babyAge >= 7 && babyAge <= 9) {
    schedule = [
      {
        time: "07:00 AM",
        mealType: "Morning Feed",
        title: "Breastmilk or Formula",
        desc: "Start the day with liquid hydration. 6-7 oz.",
        isSolid: false
      },
      {
        time: "08:30 AM",
        mealType: "Breakfast",
        title: "Thick Oat & Banana Mash",
        desc: "Cooked porridge oats combined with sweet mashed banana. Warm and textured.",
        isSolid: true
      },
      {
        time: "12:00 PM",
        mealType: "Lunch",
        title: "Savoury Vegetable & Lentil Mash",
        desc: "Moong dal khichdi or soft lentil-vegetable blend. Introduce small, soft textures.",
        isSolid: true
      },
      {
        time: "03:30 PM",
        mealType: "Afternoon Feed",
        title: "Breastmilk, Formula or Soft Fruit Snack",
        desc: "Breastmilk (5-6 oz) or a soft pear/avocado snack.",
        isSolid: true
      },
      {
        time: "06:30 PM",
        mealType: "Dinner",
        title: "Root Veggie & Tofu Mash",
        desc: "Warm carrot or pumpkin mash with mashed silken tofu swirl.",
        isSolid: true
      },
      {
        time: "08:00 PM",
        mealType: "Bedtime Feed",
        title: "Breastmilk or Formula",
        desc: "Bedtime feeding. 7-8 oz.",
        isSolid: false
      }
    ];
  } else {
    // 10 months and older
    schedule = [
      {
        time: "07:30 AM",
        mealType: "Breakfast",
        title: "Soft Baby Pancakes or Oatmeal",
        desc: "Banana oat pancake strips or thick oatmeal with fruit chunks, encouraging self-feeding.",
        isSolid: true
      },
      {
        time: "10:00 AM",
        mealType: "Morning Snack",
        title: "Soft Fruit & Yogurt",
        desc: "Steamed apple chunks or soft banana slices with a few dollops of plain whole milk yogurt.",
        isSolid: true
      },
      {
        time: "12:30 PM",
        mealType: "Lunch",
        title: "Lentil Zucchini Mash & Soft Rice",
        desc: "Soft cooked rice and dal or pasta shells cooked extremely soft with pureed veggies.",
        isSolid: true
      },
      {
        time: "03:30 PM",
        mealType: "Afternoon Snack",
        title: "Steamed Broccoli Trees & Avocado wedges",
        desc: "Soft-steamed broccoli florets and avocado strips, perfect for practicing pincer grasp.",
        isSolid: true
      },
      {
        time: "06:00 PM",
        mealType: "Dinner",
        title: "Family Dinner Mash-up",
        desc: "Soft-cooked vegetables, soft meatballs or mashed tofu, cooked with baby-safe mild herbs.",
        isSolid: true
      },
      {
        time: "07:30 PM",
        mealType: "Bedtime Feed",
        title: "Breastmilk or Formula",
        desc: "Top-up liquid feed before sleep. 6-8 oz.",
        isSolid: false
      }
    ];
  }

  // Adjust titles/descriptions based on region/country
  if (country === "in") {
    schedule.forEach(slot => {
      if (slot.title.includes("Lentil & Zucchini Mash")) slot.title = "Zucchini & Moong Dal Khichdi";
      if (slot.title.includes("Savoury Vegetable")) slot.title = "Mashed Khichdi with Steamed Veg";
      if (slot.title.includes("Oat & Banana")) slot.title = "Banana & Ragi (Millet) Porridge";
      if (slot.desc.includes("porridge oats")) slot.desc = "Ragi porridge cooked soft with ghee and banana.";
      if (slot.title.includes("Family Dinner")) slot.title = "Soft Curd Rice & Mashed Carrots";
    });
  } else if (country === "jp") {
    schedule.forEach(slot => {
      if (slot.title.includes("Lentil & Zucchini")) slot.title = "Rice Okayu with Silken Tofu";
      if (slot.title.includes("Savoury Vegetable")) slot.title = "Steamed Kabocha Pumpkin & Tofu";
      if (slot.title.includes("Soft Baby Pancakes")) slot.title = "Soft Shirasu (Tiny Fish) Rice Porridge";
      if (slot.title.includes("Oat & Banana")) slot.title = "Apple & Sweet Potato Okayu Porridge";
    });
  } else if (country === "it") {
    schedule.forEach(slot => {
      if (slot.title.includes("Lentil & Zucchini")) slot.title = "Semolina Zucchini Porridge with Olive Oil";
      if (slot.title.includes("Savoury Vegetable")) slot.title = "Soft Cheese and Squash Mash";
      if (slot.title.includes("Oat & Banana")) slot.title = "Plum and Semolina Porridge";
    });
  }

  // Filter based on allergies: if allergy is egg, change pancake title
  allergies.forEach(allergen => {
    const lowerAllergen = allergen.toLowerCase().trim();
    if (lowerAllergen === "egg" || lowerAllergen === "eggs") {
      schedule.forEach(slot => {
        if (slot.title.includes("Pancakes")) {
          slot.title = "Oat & Banana Porridge Bites";
          slot.desc = "Egg-free baked oat and banana fingers, soft and easy to chew.";
        }
      });
    }
    if (lowerAllergen === "dairy" || lowerAllergen === "milk") {
      schedule.forEach(slot => {
        if (slot.title.includes("Yogurt")) {
          slot.title = "Coconut Milk Yogurt or Fruit Puree";
          slot.desc = "Dairy-free plant-based yogurt alternative or a soft fruit pouch.";
        }
      });
    }
  });

  return schedule;
}

// Gemini AI Food Pairings Generator
export async function generateAiPairings(ingredient) {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error("Gemini API key not found. Configure it in Settings.");
  }

  const prompt = `You are a pediatric nutritionist. For the food ingredient "${ingredient}", suggest 3 to 4 baby-safe ingredients/foods that it goes well with (food pairings) for a baby. For each pairing, explain why they match nutritionally or flavor-wise.
Return ONLY a JSON object. Do not include markdown code block formatting (no \`\`\`json tags), just raw JSON. The JSON structure MUST be exactly:
{
  "ingredient": "${ingredient}",
  "pairings": [
    {
      "name": "Pairing Ingredient Name",
      "reason": "Brief explanation why they match."
    }
  ],
  "tips": "Brief advice on preparing these combinations safely."
}`;

  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro'
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  const errors = [];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting pairings generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.warn(`Model ${modelName} failed for pairings:`, error);
      
      const errMsg = error.message || String(error);
      const lowerMsg = errMsg.toLowerCase();
      if (lowerMsg.includes("api key") || lowerMsg.includes("api_key") || lowerMsg.includes("invalid key")) {
        throw new Error(`Invalid API Key: Please check your Gemini API Key in the settings dialog.`);
      }
      
      errors.push(`${modelName}: ${errMsg}`);
    }
  }

  throw new Error(`Failed to generate pairings via Gemini. Checked models: [${modelsToTry.join(', ')}]. Details:\n${errors.map(e => `- ${e}`).join('\n')}`);
}
