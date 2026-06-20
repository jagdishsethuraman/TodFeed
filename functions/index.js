const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

exports.generateRecipe = onCall({ cors: ["https://todfeed-app-61326.web.app", "https://todfeed-app-61326.firebaseapp.com", "http://localhost:8080"], secrets: ["GEMINI_API_KEY"] }, async (request) => {
  // 1. Check Auth
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = request.auth.uid;
  const { selectedIngredients, profile } = request.data || {};

  if (!Array.isArray(selectedIngredients) || selectedIngredients.length === 0 || selectedIngredients.length > 20) {
    throw new HttpsError("invalid-argument", "selectedIngredients must be an array of 1-20 items.");
  }
  if (!selectedIngredients.every(i => typeof i === 'string' && i.length > 0 && i.length <= 100)) {
    throw new HttpsError("invalid-argument", "Each ingredient must be a non-empty string under 100 characters.");
  }
  if (!profile || typeof profile !== 'object') {
    throw new HttpsError("invalid-argument", "Missing or invalid profile.");
  }
  const age = typeof profile.age === 'number' ? profile.age : parseInt(profile.age, 10);
  if (isNaN(age) || age < 1 || age > 60) {
    throw new HttpsError("invalid-argument", "Age must be a number between 1 and 60.");
  }

  // 2. Daily limits enforcement in Firestore
  const todayStr = new Date().toISOString().split("T")[0];
  const limitsRef = admin.firestore().collection("rate_limits").doc(uid);

  let limitReached = false;
  let remaining = 5;

  await admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(limitsRef);
    let userData = {};
    if (userDoc.exists) {
      userData = userDoc.data();
    }

    if (userData.date !== todayStr) {
      // It's a new day, reset count to 1
      userData = { date: todayStr, count: 1 };
    } else {
      // Same day, check limit
      if (userData.count >= 5) {
        limitReached = true;
        remaining = 0;
        return;
      }
      userData.count += 1;
    }

    remaining = Math.max(0, 5 - userData.count);

    // Save limits in rate_limits collection (server-only writes)
    transaction.set(limitsRef, { date: userData.date, count: userData.count });
  });

  if (limitReached) {
    return {
      success: false,
      error: "LIMIT_EXCEEDED",
      message: "You have reached your limit of 5 free AI recipes for today. Please add your own Gemini API key in Settings for unlimited generations!"
    };
  }

  // 3. Retrieve Gemini API Key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "Developer Gemini API key is not configured on the server.");
  }

  // 4. Generate AI Recipe
  const { age, diet = [], allergies = [], country = "us" } = profile;

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.5-flash"
  ];

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting backend recipe generation with: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.response.text();
      const parsedRecipe = JSON.parse(responseText);

      return {
        success: true,
        recipe: parsedRecipe,
        remaining
      };
    } catch (e) {
      console.error(`Failed with model ${modelName}:`, e);
      lastError = e;
    }
  }

  // Fallback if strict mode fails
  try {
    console.log("Attempting fallback recipe generation without strict mime type");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "");
    }
    const parsedRecipe = JSON.parse(text);
    return {
      success: true,
      recipe: parsedRecipe,
      remaining
    };
  } catch (err) {
    console.error("Fallback generation failed:", err);
  }

  throw new HttpsError("internal", "AI recipe generation failed. Please try again later.");
});

exports.generatePairings = onCall({ cors: ["https://todfeed-app-61326.web.app", "https://todfeed-app-61326.firebaseapp.com", "http://localhost:8080"], secrets: ["GEMINI_API_KEY"] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = request.auth.uid;
  const { ingredient } = request.data || {};

  if (!ingredient || typeof ingredient !== 'string' || ingredient.trim().length === 0 || ingredient.length > 100) {
    throw new HttpsError("invalid-argument", "Ingredient must be a non-empty string under 100 characters.");
  }

  // Check limits
  const todayStr = new Date().toISOString().split("T")[0];
  const limitsRef = admin.firestore().collection("rate_limits").doc(uid);

  let limitReached = false;
  let remaining = 5;

  await admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(limitsRef);
    let userData = {};
    if (userDoc.exists) {
      userData = userDoc.data();
    }

    if (userData.date !== todayStr) {
      userData = { date: todayStr, count: 1 };
    } else {
      if (userData.count >= 5) {
        limitReached = true;
        remaining = 0;
        return;
      }
      userData.count += 1;
    }

    remaining = Math.max(0, 5 - userData.count);
    transaction.set(limitsRef, { date: userData.date, count: userData.count });
  });

  if (limitReached) {
    return {
      success: false,
      error: "LIMIT_EXCEEDED",
      message: "You have reached your daily limit of 5 free AI queries. Please add your own Gemini API key in Settings for unlimited queries!"
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "Developer Gemini API key is not configured on the server.");
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.5-flash"
  ];

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting pairings generation with: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.response.text();
      const parsedPairings = JSON.parse(responseText);

      return {
        success: true,
        pairings: parsedPairings,
        remaining
      };
    } catch (e) {
      console.error(`Failed with model ${modelName}:`, e);
      lastError = e;
    }
  }

  // Fallback
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "");
    }
    const parsedPairings = JSON.parse(text);
    return {
      success: true,
      pairings: parsedPairings,
      remaining
    };
  } catch (err) {
    console.error("Fallback pairings failed:", err);
  }

  throw new HttpsError("internal", "AI food pairings generation failed. Please try again later.");
});
