import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size limit for high-resolution photo uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Character analysis will run on simulated data.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API endpoint to analyze character photo and generate character sheet
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 payload" });
    }

    // Check if GEMINI_API_KEY is real
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      console.log("Using Mock analyzer because GEMINI_API_KEY is missing or template default");
      // Return a simulated high-quality response if API Key is not set up yet
      // This ensures a beautiful offline/bootstrap experience for developers!
      const mockClasses = ["Knight", "Mage", "Rogue", "Druid", "Cyborg", "CyberMage"];
      const chosenClass = mockClasses[Math.floor(Math.random() * mockClasses.length)];
      const spriteKeys = {
        "Knight": "knight",
        "Mage": "mage",
        "Rogue": "rogue",
        "Druid": "druid",
        "Cyborg": "cyborg",
        "CyberMage": "cybermage"
      };
      
      const responseDesc = {
        class: chosenClass,
        height: Number((Math.random() * (5.0 - 1.5) + 1.5).toFixed(2)),
        stats: {
          strength: Math.floor(Math.random() * 11) + 5,
          intellect: Math.floor(Math.random() * 11) + 5,
          agility: Math.floor(Math.random() * 11) + 5,
          luck: Math.floor(Math.random() * 11) + 5
        },
        description: `Un combatiente formidable que emana poder y confianza, con rasgos delineados por la tecnología y la magia de Atarax.`,
        background: `Transportado desde el mundo terrenal tras interactuar con un portal fotográfico interdimensional. Ahora explora las tierras pixeladas del reino de Atarax en busca de su morada ideal.`,
        spriteKey: spriteKeys[chosenClass as keyof typeof spriteKeys] || "mage"
      };

      // Add a slight delay to feel realistic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json(responseDesc);
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };

    const promptPart = {
      text: "Analyze the person or character in this photo and design an RPG character based on them. Define their RPG class, aesthetic traits, and estimated height in meters (strictly limited between 1.5 and 5.0 meters based on their style, posture, or look). Fill out all stats so they are balanced. Fill out a short backstory in Spanish.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, promptPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            class: { type: Type.STRING, description: "Suggested RPG class (e.g. Knight, Mage, Rogue, Druid, Cyborg, CyberMage) based on clothing or posture" },
            height: { type: Type.NUMBER, description: "Physical height in meters. MUST be strictly between 1.5 and 5.0" },
            stats: {
              type: Type.OBJECT,
              properties: {
                strength: { type: Type.INTEGER, description: "Strength score from 5 to 15" },
                intellect: { type: Type.INTEGER, description: "Intellect score from 5 to 15" },
                agility: { type: Type.INTEGER, description: "Agility score from 5 to 15" },
                luck: { type: Type.INTEGER, description: "Luck score from 5 to 15" }
              },
              required: ["strength", "intellect", "agility", "luck"]
            },
            description: { type: Type.STRING, description: "A detailed physical description in Spanish of the character's facial/style features matching the picture" },
            background: { type: Type.STRING, description: "A creative 2-sentence backstory in Spanish explaining how they arrived in Atarax" },
            spriteKey: { type: Type.STRING, description: "Corresponding gameplay sprite key. Must be exact choice of: 'knight', 'mage', 'rogue', 'druid', 'cyborg', or 'cybermage'" }
          },
          required: ["class", "height", "stats", "description", "background", "spriteKey"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const resultObj = JSON.parse(jsonStr);
    return res.json(resultObj);

  } catch (error) {
    console.error("Gemini character generation error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Atarax App Server] Node Express dev server running on http://localhost:${PORT}`);
  });
}

startServer();
