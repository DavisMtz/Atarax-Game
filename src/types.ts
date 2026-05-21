export enum CharacterSpriteKey {
  KNIGHT = "knight",
  MAGE = "mage",
  ROGUE = "rogue",
  DRUID = "druid",
  CYBORG = "cyborg",
  CYBERMAGE = "cybermage",
}

export interface CharacterStats {
  strength: number;
  intellect: number;
  agility: number;
  luck: number;
}

export interface PlayerProfile {
  userId: string;
  username: string;
  email: string;
  status: "active" | "inactive";
  lastActive: number;
  characterClass: string;
  characterHeight: number; // between 1.5 and 5.0 meters
  avatarUrl: string; // preselected or base64 photo
  hp: number;
  gold: number;
  stats: CharacterStats;
  characterBio: string;
  spriteKey: CharacterSpriteKey;
  // House information linked
  houseId: string;
}

export interface FurnitureItem {
  id: string; // unique placement id
  itemId: string; // template reference e.g., "cyber_table"
  name: string;
  emoji: string;
  x: number; // grid position (0 to 99)
  y: number; // grid position (0 to 99)
  rotation: number; // 0, 90, 180, 270 degrees
  category: "furniture" | "appliances" | "nature" | "decor";
  price: number;
}

export interface HouseData {
  houseId: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  accessCode: string; // Clave de casa secreta
  furniture: FurnitureItem[];
  style: string; // Woods, Neon Cyber, High Castle, Modern Minimalist
  rating?: number;
}

// Items catalog available to purchase and place in the house
export interface CatalogItem {
  itemId: string;
  name: string;
  emoji: string;
  category: "furniture" | "appliances" | "nature" | "decor";
  price: number;
  description: string;
}

export const FURNITURE_CATALOG: CatalogItem[] = [
  // Furniture
  { itemId: "cyber_throne", name: "Cyber Trono", emoji: "💺", category: "furniture", price: 350, description: "Un trono metálico con luces RGB programables." },
  { itemId: "wooden_chair", name: "Silla de Roble", emoji: "🪑", category: "furniture", price: 50, description: "Hecha a mano, madera pulida de Atarax." },
  { itemId: "futon", name: "Sofá Moderno", emoji: "🛋️", category: "furniture", price: 200, description: "Increíblemente relajante, ideal para contemplar el vacío." },
  { itemId: "magic_bed", name: "Cama Gravitatoria", emoji: "🛏️", category: "furniture", price: 500, description: "Flota a unos centímetros del suelo para un sueño óptimo." },
  { itemId: "cyber_table", name: "Mesa Holográfica", emoji: "📺", category: "furniture", price: 300, description: "Proyecta animaciones relajantes mientras almuerzas." },
  { itemId: "wood_table", name: "Mesa de Taberna", emoji: "🪵", category: "furniture", price: 100, description: "Robusta y resistente a derrames de pociones." },
  
  // Appliances
  { itemId: "retrogaming", name: "Consola Retro", emoji: "🎮", category: "appliances", price: 400, description: "Para jugar Atarax dentro de Atarax." },
  { itemId: "synthesizer", name: "Sintetizador Ambient", emoji: "🎹", category: "appliances", price: 450, description: "Genera bucles relajantes para tu hogar." },
  { itemId: "hologram_pc", name: "Terminal Cuántica", emoji: "💻", category: "appliances", price: 600, description: "Acceso ilimitado a redes de Atarax." },
  { itemId: "jukebox", name: "Rocola Neon", emoji: "📻", category: "appliances", price: 250, description: "Toca las melodías del bosque místico." },
  
  // Nature
  { itemId: "bonsai", name: "Bonsái Ancestral", emoji: "🪴", category: "nature", price: 150, description: "Crece al ritmo de los latidos de Atarax." },
  { itemId: "neon_rose", name: "Rosa Neón", emoji: "🌹", category: "nature", price: 80, description: "Brilla suavemente en la oscuridad." },
  { itemId: "cactus", name: "Cactus Radiante", emoji: "🌵", category: "nature", price: 60, description: "Absorbe la radiación cósmica menor." },
  { itemId: "aquarium", name: "Acuario Virtual", emoji: "🐟", category: "nature", price: 400, description: "Peces flotantes nadando en antimateria." },
  
  // Decor
  { itemId: "cyber_door", name: "Puerta Corrediza", emoji: "🚪", category: "decor", price: 120, description: "Abre automáticamente con sensores térmicos." },
  { itemId: "stained_window", name: "Ventanal Mágico", emoji: "🖼️", category: "decor", price: 180, description: "Muestra vistas del espacio exterior constante." },
  { itemId: "mirror", name: "Espejo del Alma", emoji: "🪞", category: "decor", price: 140, description: "Refleja tus stats de combate en tiempo real." },
  { itemId: "portal", name: "Portal Miniatura", emoji: "🌀", category: "decor", price: 800, description: "Un decorado activo que zumba levemente." },
];
