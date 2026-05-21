import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Upload, 
  Gamepad2, 
  LogOut, 
  Home, 
  Plus, 
  RotateCw, 
  Trash2, 
  Lock, 
  Unlock, 
  Search, 
  Coins, 
  Compass, 
  User, 
  Info, 
  Check, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Shield, 
  Globe,
  Share2,
  Tv
} from "lucide-react";
import { House3D } from "./House3D";
import { loginWithGoogle, logoutHelper } from "./firebase";
import { FURNITURE_CATALOG, CatalogItem, FurnitureItem, HouseData, PlayerProfile, CharacterSpriteKey } from "./types";

// Static sprite icons / emojis representing character classes beautifully
const SPRITE_EMOJIS: Record<string, string> = {
  knight: "⚔️",
  mage: "🧙",
  rogue: "🥷",
  druid: "🧝",
  cyborg: "🤖",
  cybermage: "👾"
};

const DEFAULT_PLAYERS_SIMULATION: PlayerProfile[] = [
  {
    userId: "mock-uid-1",
    username: "NeoAtarax",
    email: "neo@atarax.io",
    status: "active",
    lastActive: Date.now(),
    characterClass: "CyberMage",
    characterHeight: 1.85,
    avatarUrl: "",
    hp: 120,
    gold: 500,
    stats: { strength: 8, intellect: 14, agility: 10, luck: 8 },
    characterBio: "Llegó mediante un portal de plasma. Experto en reprogramar código de la casa.",
    spriteKey: CharacterSpriteKey.CYBERMAGE,
    houseId: "mock-uid-1"
  },
  {
    userId: "mock-uid-2",
    username: "Kaelen_Shadow",
    email: "kaelen@atarax.io",
    status: "inactive",
    lastActive: Date.now() - 3600000,
    characterClass: "Rogue",
    characterHeight: 1.72,
    avatarUrl: "",
    hp: 95,
    gold: 240,
    stats: { strength: 7, intellect: 9, agility: 15, luck: 9 },
    characterBio: "Sigiloso como la estática. Construyó una casa llena de pasadizos secretos.",
    spriteKey: CharacterSpriteKey.ROGUE,
    houseId: "mock-uid-2"
  },
  {
    userId: "mock-uid-3",
    username: "Valkyrie_X",
    email: "valk@gmail.com",
    status: "active",
    lastActive: Date.now(),
    characterClass: "Knight",
    characterHeight: 2.10,
    avatarUrl: "",
    hp: 150,
    gold: 1450,
    stats: { strength: 15, intellect: 6, agility: 11, luck: 8 },
    characterBio: "Guardiana férrea. Su casa de 100x100 es prácticamente un búnker flotante.",
    spriteKey: CharacterSpriteKey.KNIGHT,
    houseId: "mock-uid-3"
  }
];

const DEFAULT_HOUSES_SIMULATION: HouseData[] = [
  {
    houseId: "mock-uid-1",
    ownerId: "mock-uid-1",
    ownerName: "NeoAtarax",
    isPublic: true,
    accessCode: "CASA-NEO-77",
    style: "Neon Cyber",
    furniture: [
      { id: "p1", itemId: "cyber_throne", name: "Cyber Trono", emoji: "💺", x: 48, y: 48, rotation: 0, category: "furniture", price: 350 },
      { id: "p2", itemId: "synthesizer", name: "Sintetizador Ambient", emoji: "🎹", x: 50, y: 48, rotation: 90, category: "appliances", price: 450 },
      { id: "p3", itemId: "neon_rose", name: "Rosa Neón", emoji: "🌹", x: 48, y: 50, rotation: 0, category: "nature", price: 80 }
    ]
  },
  {
    houseId: "mock-uid-2",
    ownerId: "mock-uid-2",
    ownerName: "Kaelen_Shadow",
    isPublic: false,
    accessCode: "SECRET-777",
    style: "Modern Minimalist",
    furniture: [
      { id: "h1", itemId: "magic_bed", name: "Cama Gravitatoria", emoji: "🛏️", x: 40, y: 40, rotation: 180, category: "furniture", price: 500 },
      { id: "h2", itemId: "cactus", name: "Cactus Radiante", emoji: "🌵", x: 42, y: 40, rotation: 0, category: "nature", price: 60 }
    ]
  },
  {
    houseId: "mock-uid-3",
    ownerId: "mock-uid-3",
    ownerName: "Valkyrie_X",
    isPublic: true,
    accessCode: "FORT-VALK",
    style: "High Castle",
    furniture: [
      { id: "v1", itemId: "wood_table", name: "Mesa de Taberna", emoji: "🪵", x: 55, y: 56, rotation: 0, category: "furniture", price: 100 },
      { id: "v2", itemId: "wooden_chair", name: "Silla de Roble", emoji: "🪑", x: 54, y: 56, rotation: 90, category: "furniture", price: 50 },
      { id: "v3", itemId: "wooden_chair", name: "Silla de Roble", emoji: "🪑", x: 56, y: 56, rotation: 270, category: "furniture", price: 50 }
    ]
  }
];

export default function App() {
  // Authentication & session configs
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [setupUsername, setSetupUsername] = useState("");
  
  // Custom screen views
  // "welcome" | "character_scann" | "scann_result" | "game_world"
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "character_scann" | "scann_result" | "game_world">("welcome");
  
  // Gemini scan state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStats, setScannedStats] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // House setup & simulation
  const [userHouse, setUserHouse] = useState<HouseData | null>(null);
  const [publicHouses, setPublicHouses] = useState<HouseData[]>([]);
  const [visitedHouse, setVisitedHouse] = useState<HouseData | null>(null); // null means visiting own house
  
  // House Search Box state
  const [houseSearchQuery, setHouseSearchQuery] = useState("");
  const [privateSearchQuery, setPrivateSearchQuery] = useState("");
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // RPG Interactive Map state
  // Player coordinate starts in center of 100x100 grid (e.g., 50, 50)
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(50);
  const [viewportCols, setViewportCols] = useState(13); // grid view size
  const [goldCount, setGoldCount] = useState(1000);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Shopping / Editing stats
  const [editMode, setEditMode] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "furniture" | "appliances" | "nature" | "decor">("all");
  const [houseThemeStyle, setHouseThemeStyle] = useState("Neon Cyber");

  // Interaction logs (Atarax HUD status)
  const [hudMessage, setHudMessage] = useState<string>("¡Bienvenido a Atarax RPG! Usa los controles para caminar en tu espaciosa casa de 100x100.");

  // References for keyboard capture
  const gameViewportRef = useRef<HTMLDivElement>(null);

  // Initialization: Load state from LocalStorage if it exists
  useEffect(() => {
    const savedUser = localStorage.getItem("atarax_user");
    const savedHouse = localStorage.getItem("atarax_house");
    const savedAllHouses = localStorage.getItem("atarax_all_houses");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setGoldCount(JSON.parse(savedUser).gold || 1000);
      setCurrentScreen("game_world");
    }
    
    if (savedHouse) {
      setUserHouse(JSON.parse(savedHouse));
    }

    if (savedAllHouses) {
      setPublicHouses(JSON.parse(savedAllHouses));
    } else {
      setPublicHouses(DEFAULT_HOUSES_SIMULATION);
      localStorage.setItem("atarax_all_houses", JSON.stringify(DEFAULT_HOUSES_SIMULATION));
    }
  }, []);

  // Save current states to localStorage whenever altered
  const saveState = (updatedUser: PlayerProfile | null, updatedHouse: HouseData | null) => {
    if (updatedUser) {
      localStorage.setItem("atarax_user", JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem("atarax_user");
    }

    if (updatedHouse) {
      localStorage.setItem("atarax_house", JSON.stringify(updatedHouse));
    } else {
      localStorage.removeItem("atarax_house");
    }
  };

  // Keyboard Navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== "game_world" || editMode) return;
      
      const key = e.key.toLowerCase();
      let dx = 0;
      let dy = 0;

      if (key === "w" || e.key === "ArrowUp") {
        dy = -1;
      } else if (key === "s" || e.key === "ArrowDown") {
        dy = 1;
      } else if (key === "a" || e.key === "ArrowLeft") {
        dx = -1;
      } else if (key === "d" || e.key === "ArrowRight") {
        dx = 1;
      }

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        movePlayer(dx, dy);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playerX, playerY, currentScreen, editMode]);

  // Handle active status toggles or refresh tab focus
  useEffect(() => {
    if (!currentUser) return;

    // Direct active setting
    const updateActiveStatus = (status: "active" | "inactive") => {
      const updated = { ...currentUser, status, lastActive: Date.now() };
      setCurrentUser(updated);
      
      // Update in simulation array
      const allHouses = [...publicHouses];
      const matchIndex = allHouses.findIndex(h => h.ownerId === currentUser.userId);
      if (matchIndex !== -1) {
        allHouses[matchIndex].ownerName = currentUser.username;
        setPublicHouses(allHouses);
        localStorage.setItem("atarax_all_houses", JSON.stringify(allHouses));
      }
    };

    updateActiveStatus("active");

    const handleFocus = () => updateActiveStatus("active");
    const handleBlur = () => updateActiveStatus("inactive");

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [currentUser?.userId]);

  // RPG player movement function
  const movePlayer = (dx: number, dy: number) => {
    const newX = Math.min(99, Math.max(0, playerX + dx));
    const newY = Math.min(99, Math.max(0, playerY + dy));
    
    setPlayerX(newX);
    setPlayerY(newY);

    // Look if user stands on any furniture element
    const sourceHouse = visitedHouse || userHouse;
    if (sourceHouse) {
      const stoodItem = sourceHouse.furniture.find(item => item.x === newX && item.y === newY);
      if (stoodItem) {
        setHudMessage(`Te has parado junto a un(a) ${stoodItem.name} ${stoodItem.emoji}. Rotación: ${stoodItem.rotation}°`);
      } else {
        setHudMessage(`Caminas tranquilamente por las coordenadas [X: ${newX}, Y: ${newY}] de la parcela de 100x100.`);
      }
    }
  };

  // File choice for scan
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert File to Base64 easily for REST communication
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Trigger Gemini photo parser on backend
  const runGeminiAnalysis = async () => {
    if (!selectedFile) {
      setScanError("Por favor sube o selecciona una imagen válida.");
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: selectedFile.type
        })
      });

      if (!res.ok) {
        throw new Error("Ocurrió un error al contactar al servidor analítico Atarax.");
      }

      const data = await res.json();
      setScannedStats(data);
      setCurrentScreen("scann_result");
    } catch (err: any) {
      console.error(err);
      setScanError(err?.message || "Error al decodificar rasgos. Intenta de nuevo.");
    } finally {
      setIsScanning(false);
    }
  };

  // Accept and create the RPG character
  const handleCreateProfile = () => {
    if (!scannedStats) return;

    const mockUid = "user-" + Math.floor(Math.random() * 89999 + 10000);
    const newProfile: PlayerProfile = {
      userId: mockUid,
      username: setupUsername || "Viajero_" + Math.floor(Math.random() * 999),
      email: authEmail || "tester@atarax.io",
      status: "active",
      lastActive: Date.now(),
      characterClass: scannedStats.class || "CyberMage",
      characterHeight: scannedStats.height || 1.80,
      avatarUrl: previewUrl || "",
      hp: 100,
      gold: 1000,
      stats: {
        strength: scannedStats.stats?.strength || 10,
        intellect: scannedStats.stats?.intellect || 10,
        agility: scannedStats.stats?.agility || 10,
        luck: scannedStats.stats?.luck || 10,
      },
      characterBio: scannedStats.description || scannedStats.background || "Surgido misteriosamente de los éteres digitales.",
      spriteKey: (scannedStats.spriteKey || "mage") as CharacterSpriteKey,
      houseId: mockUid
    };

    // Instantiate a fresh 100x100 virtual house
    const newHouse: HouseData = {
      houseId: mockUid,
      ownerId: mockUid,
      ownerName: newProfile.username,
      isPublic: true,
      accessCode: `CASA-${newProfile.username.toUpperCase()}-${Math.floor(Math.random() * 89 + 10)}`,
      style: "Wood Lodge",
      furniture: [
        { id: "start-chair", itemId: "wooden_chair", name: "Silla de Roble", emoji: "🪑", x: 50, y: 52, rotation: 0, category: "furniture", price: 50 },
        { id: "start-bed", itemId: "magic_bed", name: "Cama Gravitatoria", emoji: "🛏️", x: 52, y: 49, rotation: 0, category: "furniture", price: 500 }
      ]
    };

    setCurrentUser(newProfile);
    setUserHouse(newHouse);
    setGoldCount(1000);

    // Save permanently in client
    saveState(newProfile, newHouse);

    // Add list simulation
    const updatedAll = [newHouse, ...publicHouses];
    setPublicHouses(updatedAll);
    localStorage.setItem("atarax_all_houses", JSON.stringify(updatedAll));

    setNotification("¡Tu personaje ha sido forjado con éxito! Bienvenido a Atarax.");
    setCurrentScreen("game_world");
  };

  // Quick setup with mock credentials
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setAuthEmail(user.email || "");
        setSetupUsername(user.displayName || "Viajero_" + Math.floor(Math.random() * 999));
        setPreviewUrl(user.photoURL);
        // Fake photo to file
        setSelectedFile(new File([""], "google_photo.jpg", { type: "image/jpeg" }));
        setNotification("Autenticado con Google con éxito.");
        setCurrentScreen("character_scann");
      }
    } catch (err: any) {
      setScanError("Error al iniciar sesión con Google: " + err.message);
    }
  };

  // Trigger Facebook mock register
  

  const handleLogout = async () => {
    await logoutHelper();
    localStorage.removeItem("atarax_user");
    localStorage.removeItem("atarax_house");
    setCurrentUser(null);
    setUserHouse(null);
    setVisitedHouse(null);
    setPreviewUrl(null);
    setScannedStats(null);
    setCurrentScreen("welcome");
  };

  // Interactive furniture layout tools
  const handleSelectCatalog = (item: CatalogItem) => {
    if (goldCount < item.price) {
      setHudMessage("⚠️ Oro insuficiente para comprar " + item.name);
      return;
    }
    setSelectedCatalogItem(item);
    setHudMessage(`⚒️ Modo Colocación: Elige una casilla en el visor de tu casa para ubicar un(a) ${item.emoji} ${item.name}.`);
  };

  // Click on coordinate cells to place or manage furniture
  const handleGridCellClick = (x: number, y: number) => {
    if (visitedHouse) {
      setHudMessage("⚠️ No puedes editar las pertenencias de otra casa. ¡Visita la tuya para redecorar!");
      return;
    }
    if (!userHouse) return;

    if (selectedCatalogItem) {
      // Placing new item
      const newItem: FurnitureItem = {
        id: "placed-" + Date.now() + "-" + Math.floor(Math.random() * 100),
        itemId: selectedCatalogItem.itemId,
        name: selectedCatalogItem.name,
        emoji: selectedCatalogItem.emoji,
        x,
        y,
        rotation: 0,
        category: selectedCatalogItem.category,
        price: selectedCatalogItem.price
      };

      const updatedFurniture = [...userHouse.furniture, newItem];
      const updatedHouse = { ...userHouse, furniture: updatedFurniture };
      setUserHouse(updatedHouse);
      
      const newGold = goldCount - selectedCatalogItem.price;
      setGoldCount(newGold);
      if (currentUser) {
        setCurrentUser({ ...currentUser, gold: newGold });
      }

      saveState(currentUser ? { ...currentUser, gold: newGold } : null, updatedHouse);
      
      // Update custom simulation arrays
      const allHList = publicHouses.map(h => h.houseId === userHouse.houseId ? updatedHouse : h);
      setPublicHouses(allHList);
      localStorage.setItem("atarax_all_houses", JSON.stringify(allHList));

      setHudMessage(`¡Colocaste ${selectedCatalogItem.emoji} ${selectedCatalogItem.name} en [X: ${x}, Y: ${y}]!`);
      setSelectedCatalogItem(null); // Clear placement choice
    } else {
      // Toggle or rotate existing item
      const existedItemIndex = userHouse.furniture.findIndex(item => item.x === x && item.y === y);
      if (existedItemIndex !== -1) {
        const item = userHouse.furniture[existedItemIndex];
        const updatedFurniture = [...userHouse.furniture];
        
        // Show context menu or rotate automatically
        const nextRotation = (item.rotation + 90) % 360;
        updatedFurniture[existedItemIndex] = { ...item, rotation: nextRotation };
        
        const updatedHouse = { ...userHouse, furniture: updatedFurniture };
        setUserHouse(updatedHouse);
        saveState(currentUser, updatedHouse);
        
        const allHList = publicHouses.map(h => h.houseId === userHouse.houseId ? updatedHouse : h);
        setPublicHouses(allHList);
        localStorage.setItem("atarax_all_houses", JSON.stringify(allHList));

        setHudMessage(`Rotaste ${item.emoji} ${item.name} a ${nextRotation} grados.`);
      }
    }
  };

  // Remove furniture and refund 50%
  const handleRemoveFurniture = (itemId: string) => {
    if (!userHouse) return;
    const item = userHouse.furniture.find(i => i.id === itemId);
    if (!item) return;

    const refund = Math.floor(item.price / 2);
    const updatedFurniture = userHouse.furniture.filter(i => i.id !== itemId);
    const updatedHouse = { ...userHouse, furniture: updatedFurniture };
    setUserHouse(updatedHouse);
    
    const newGold = goldCount + refund;
    setGoldCount(newGold);
    if (currentUser) {
      setCurrentUser({ ...currentUser, gold: newGold });
    }
    saveState(currentUser ? { ...currentUser, gold: newGold } : null, updatedHouse);

    const allHList = publicHouses.map(h => h.houseId === userHouse.houseId ? updatedHouse : h);
    setPublicHouses(allHList);
    localStorage.setItem("atarax_all_houses", JSON.stringify(allHList));

    setHudMessage(`Ganas +${refund} 🪙 de oro reembolsados tras vender tu ${item.name}.`);
  };

  // Toggle privacy switch
  const toggleHousePrivacy = () => {
    if (!userHouse) return;
    const updated = { ...userHouse, isPublic: !userHouse.isPublic };
    setUserHouse(updated);
    saveState(currentUser, updated);

    const allHList = publicHouses.map(h => h.houseId === userHouse.houseId ? updated : h);
    setPublicHouses(allHList);
    localStorage.setItem("atarax_all_houses", JSON.stringify(allHList));
    
    setHudMessage(updated.isPublic ? "Tu casa ahora es pública en el buscador." : "Tu casa es ahora privada. Solo puede accederse usando la clave secreta.");
  };

  // Search houses
  const handleSearchHouses = () => {
    setSearchFeedback(null);
    if (!houseSearchQuery) return;

    // Search by username on simulated houses
    const found = publicHouses.find(h => h.ownerName.toLowerCase().includes(houseSearchQuery.toLowerCase()) && h.isPublic);
    if (found) {
      setVisitedHouse(found);
      setPlayerX(50);
      setPlayerY(50);
      setHudMessage(`Entrando a la casa pública de ${found.ownerName}.`);
    } else {
      setSearchFeedback("No se encontró ninguna casa pública con ese nombre.");
    }
  };

  // Search hidden houses using access key
  const handlePrivateSearch = () => {
    setSearchFeedback(null);
    if (!privateSearchQuery) return;

    const found = publicHouses.find(h => h.accessCode.toLowerCase() === privateSearchQuery.trim().toLowerCase());
    if (found) {
      setVisitedHouse(found);
      setPlayerX(50); // reset inside visited house coordinates
      setPlayerY(50);
      setHudMessage(`¡Clave de Acceso Válida! Visitando morada oculta de ${found.ownerName}.`);
    } else {
      setSearchFeedback("Código de seguridad incorrecto o inexistente.");
    }
  };

  const handleReturnHome = () => {
    setVisitedHouse(null);
    setPlayerX(50);
    setPlayerY(50);
    setHudMessage("Regresaste a tu propia parcela.");
  };

  // Quick Daily task triggers to earn pocket gold for decorations
  const doDailyChore = () => {
    const rewards = [
      "Limpiaste el polvo cósmico de la alcoba. ¡Ganas 50 Monedas de Oro!",
      "Rojos duendes del jardín recolectaron brotes. ¡Ganas 80 Monedas de Oro!",
      "Afinaste la mesa holográfica de la entrada. ¡Ganas 60 Monedas de Oro!"
    ];
    const moneyGains = [50, 80, 60];
    const randomIndex = Math.floor(Math.random() * rewards.length);
    
    const nextGold = goldCount + moneyGains[randomIndex];
    setGoldCount(nextGold);
    if (currentUser) {
      const updated = { ...currentUser, gold: nextGold };
      setCurrentUser(updated);
      saveState(updated, userHouse);
    }
    setHudMessage(rewards[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-[#050505] grid-dot text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-atarax-cyan selection:text-black">
      {/* Dynamic Notifications */}
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-pink-600/95 border-b neon-border text-white font-medium px-6 py-3 rounded-full  flex items-center gap-3 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white animate-pulse" />
          <span className="text-sm">{notification}</span>
          <button onClick={() => setNotification(null)} className="hover:text-atarax-cyan atarax-glow transition-colors">
            <X className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="border-b border-white/10 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black serif atarax-glow text-white tracking-widest font-mono">
            ATARAX
          </span>
          <span className="glass border border-white/10 text-atarax-cyan atarax-glow text-[10px] px-2 py-0.5 rounded font-mono font-semibold tracking-wider">
            RPG v1.2
          </span>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border border-white/10">
              <Coins className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-mono text-amber-300 font-bold">{goldCount}g</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-rose-400 hover:glass rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* SCREEN ROUTER */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* VIEW 1: WELCOME LOG IN */}
        {currentScreen === "welcome" && (
          <div className="w-full max-w-md glass border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-lg flex flex-col gap-6  relative overflow-hidden">
            {/* Ambient gradients */}
            
            

            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl btn-primary flex items-center justify-center  shadow-[0_0_15px_rgba(100,255,218,0.3)]">
                <Gamepad2 className="w-9 h-9 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-black serif tracking-tight text-white mt-1">
                Bienvenido a <span className="text-atarax-cyan atarax-glow">Atarax</span>
              </h1>
              <p className="text-xs text-white/40 max-w-xs">
                Inicia sesión en un innovador reino RPG donde tu fotografía personal determina el destino y los poderes de tu avatar.
              </p>
            </div>

            {/* Google Quick Authentication */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-4 px-4 bg-white hover:bg-gray-100 text-[#050505] flex items-center justify-center gap-3 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]"
              >
                <div style={{ width: 24, height: 24 }}>
                   <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                </div>
                Iniciar sesión con Google
              </button>

              {scanError && (
                <div className="p-3 glass border-red-500 text-red-500 border border-rose-900 rounded-xl text-rose-300 text-xs flex gap-2">
                  <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: CHARACTER SCAN CAMERA / UPLOADER */}
        {currentScreen === "character_scann" && (
          <div className="w-full max-w-lg glass border border-white/10 rounded-3xl p-6 backdrop-blur-lg flex flex-col gap-6 ">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-atarax-cyan atarax-glow" />
                <h2 className="text-xl font-bold">Personalización con Gemini AI</h2>
              </div>
              <button 
                onClick={() => setCurrentScreen("welcome")}
                className="text-xs text-white/40 hover:text-white"
              >
                Volver
              </button>
            </div>

            <div className="text-center flex flex-col gap-1.5">
              <span className="text-xs text-atarax-cyan atarax-glow font-semibold tracking-wider uppercase font-mono">FORJA DE ASIGNACIONES</span>
              <p className="text-sm text-white/80">
                Sube la fotografía de un personaje, de ti mismo, o de algún amigo. Nuestro motor Gemini decodificará la pose, facciones y prendas para forjar rasgos Atarax nativos.
              </p>
            </div>

            {/* DRAG AND DROP AREA */}
            <div className="border-2 border-dashed border-white/10 hover:neon-border/50 rounded-2xl p-8 bg-[#050505]/40 transition-colors flex flex-col items-center justify-center gap-4 text-center group cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img 
                    src={previewUrl} 
                    alt="Preview avatar" 
                    className="w-32 h-32 rounded-xl object-cover border-2 neon-border shadow-md shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs text-white/40 font-mono italic">Imagen cargada con éxito.</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 glass rounded-full text-white/40 group-hover:text-atarax-cyan atarax-glow transition-colors">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Haz clic o arrastra una imagen aquí</p>
                    <p className="text-xs text-white/40 mt-1">Soporta PNG, JPG o WEBP (Máx. 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {scanError && (
              <div className="p-3 glass border-red-500 text-red-500 border border-rose-900 rounded-xl text-rose-300 text-xs flex gap-2">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{scanError}</span>
              </div>
            )}

            {/* ACTOR BUTTON */}
            <button
              onClick={runGeminiAnalysis}
              disabled={isScanning || !selectedFile}
              className={`w-full py-4 text-white font-bold rounded-xl  transition-all flex items-center justify-center gap-2 ${
                isScanning || !selectedFile
                  ? "btn-primary text-white/40 cursor-not-allowed"
                  : "btn-primary  cursor-pointer active:scale-[0.98]"
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Escaneando rasgos en el Nexo Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  <span>Escanear Imagen con Gemini AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* VIEW 3: GEMINI CHARACTER SHEET RESULT */}
        {currentScreen === "scann_result" && scannedStats && (
          <div className="w-full max-w-xl glass border border-white/10 rounded-3xl p-6 backdrop-blur-lg flex flex-col gap-6  relative">
            

            <div className="border-b border-white/10 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs text-atarax-cyan atarax-glow font-semibold uppercase tracking-widest font-mono">PERSONAJE CALCULADO</span>
                <h2 className="text-xl font-black serif">Planilla Forjada en Atarax</h2>
              </div>
              <div className="text-right">
                <span className="text-white/40 text-xs">Clase Sugerida:</span>
                <p className="text-yellow-400 font-bold border border-yellow-500/20 px-2 py-0.5 rounded text-xs bg-yellow-950/20 inline-block font-mono">
                  {SPRITE_EMOJIS[scannedStats.spriteKey] || "🧙"} {scannedStats.class}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Profile card left banner */}
              <div className="flex flex-col gap-3 items-center text-center bg-[#050505]/50 p-4 rounded-2xl border border-white/10 relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Scanned image profile" 
                    className="w-40 h-40 object-cover rounded-xl border-4 border-purple-500 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-40 h-40 glass text-6xl flex items-center justify-center rounded-xl border-4 border-white/10">
                    {SPRITE_EMOJIS[scannedStats.spriteKey] || "🧙"}
                  </div>
                )}
                
                <div>
                  <h3 className="font-bold text-lg text-white font-mono tracking-wide">
                    {setupUsername || "Vagabundo_Estelar"}
                  </h3>
                  <span className="text-xs text-atarax-cyan atarax-glow font-mono tracking-wider">
                    Estatura: {scannedStats.height || 1.8}m (1.5m - 5m)
                  </span>
                </div>

                <div className="glass px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-white/40">
                  ⚡ Nivel Corporal Atarax
                </div>
              </div>

              {/* Stats sheet details */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-white/40 tracking-wider font-mono">ATRIBUTOS EXTRAÍDOS</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#050505]/40 rounded-xl border border-white/10 flex flex-col">
                    <span className="text-white/40 font-mono">💪 FUERZA</span>
                    <span className="text-lg font-bold text-white/90">{scannedStats.stats?.strength || 10}</span>
                  </div>
                  <div className="p-3 bg-[#050505]/40 rounded-xl border border-white/10 flex flex-col">
                    <span className="text-white/40 font-mono">🧠 INTELECTO</span>
                    <span className="text-lg font-bold text-atarax-cyan">{scannedStats.stats?.intellect || 12}</span>
                  </div>
                  <div className="p-3 bg-[#050505]/40 rounded-xl border border-white/10 flex flex-col">
                    <span className="text-white/40 font-mono">⚡ AGILIDAD</span>
                    <span className="text-lg font-bold text-atarax-cyan atarax-glow">{scannedStats.stats?.agility || 10}</span>
                  </div>
                  <div className="p-3 bg-[#050505]/40 rounded-xl border border-white/10 flex flex-col">
                    <span className="text-white/40 font-mono">🍀 SUERTE</span>
                    <span className="text-lg font-bold text-amber-400">{scannedStats.stats?.luck || 8}</span>
                  </div>
                </div>

                <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-xs flex flex-col gap-1">
                  <span className="text-white/80 font-semibold font-mono">DESCRIPCIÓN FÍSICA IA:</span>
                  <p className="text-white/80 leading-relaxed italic">{scannedStats.description}</p>
                </div>

                <div className="p-3 bg-cyan-950/20 border neon-border/30 rounded-xl text-xs flex flex-col gap-1">
                  <span className="text-atarax-cyan font-semibold font-mono">TRASFONDO CREADO:</span>
                  <p className="text-white/80 leading-relaxed">{scannedStats.background}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/10 pt-4 mt-2">
              <button
                onClick={() => setCurrentScreen("character_scann")}
                className="flex-1 py-3 btn-primary hover:border-[#64ffda] hover:text-[#64ffda] text-white/80 font-semibold rounded-xl text-sm transition-all"
              >
                Denegar y Reintentar
              </button>
              <button
                onClick={handleCreateProfile}
                className="flex-1 py-3 btn-primary  text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2  shadow-[0_0_15px_rgba(100,255,218,0.3)]"
              >
                <Check className="w-4 h-4 text-white" />
                Aceptar y Forjar
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: MAIN RPG GAME WORLD */}
        {currentScreen === "game_world" && currentUser && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-2">
            
            {/* COLUMN LEFT: CHAR SHEET & DIRECTORY (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* ACTIVE CHARACTER PANEL */}
              <div className="glass border border-white/10 p-5 rounded-2xl flex flex-col gap-3 relative">
                <div className="absolute top-4 right-4 flex items-center gap-1.5 glass border-green-500/20 text-green-500 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-xs font-mono">
                  <span className="w-2 h-2 rounded-full glass border-green-500/20 text-green-500 animate-pulse"></span>
                  ACTIVO
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt="Mini avatar representation" 
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      SPRITE_EMOJIS[currentUser.spriteKey] || "🧙"
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white font-mono tracking-tight">{currentUser.username}</h3>
                    <p className="text-xs text-atarax-cyan atarax-glow font-medium font-mono">{currentUser.characterClass} ({currentUser.characterHeight}m)</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-mono mt-2">
                  <div className="bg-[#050505] p-2 rounded border border-white/10">
                    <p className="text-white/40">FUER</p>
                    <p className="font-bold text-white mt-0.5">{currentUser.stats.strength}</p>
                  </div>
                  <div className="bg-[#050505] p-2 rounded border border-white/10">
                    <p className="text-white/40">INTE</p>
                    <p className="font-bold text-white mt-0.5">{currentUser.stats.intellect}</p>
                  </div>
                  <div className="bg-[#050505] p-2 rounded border border-white/10">
                    <p className="text-white/40">AGIL</p>
                    <p className="font-bold text-white mt-0.5">{currentUser.stats.agility}</p>
                  </div>
                  <div className="bg-[#050505] p-2 rounded border border-white/10">
                    <p className="text-white/40">SUER</p>
                    <p className="font-bold text-white mt-0.5">{currentUser.stats.luck}</p>
                  </div>
                </div>

                <div className="text-[11px] text-white/40 border-t border-white/10 pt-2.5 mt-2 flex flex-col gap-1 leading-relaxed">
                  <span className="font-semibold text-white/80">BIOGRAFÍA:</span>
                  <p className="line-clamp-3">{currentUser.characterBio}</p>
                </div>

                {/* Simulated daily activity chore */}
                <button
                  onClick={doDailyChore}
                  className="w-full py-2.5 btn-primary hover:border-[#64ffda] hover:text-[#64ffda] text-white/80 rounded-xl text-xs font-semibold mt-2 border border-white/10 cursor-pointer"
                >
                  🧹 Realizar Tarea de Casa diaria (+Oro)
                </button>
              </div>

              {/* LOCAL LOCATION PINNING / HOUSE CONFIGS */}
              <div className="glass border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h4 className="font-bold text-sm tracking-wide font-mono text-white">Morada de Atarax</h4>
                  <span className="text-[10px] text-white/40 font-mono">100 × 100</span>
                </div>

                {/* Pin info / Access codes */}
                {!visitedHouse ? (
                  <>
                    <div className="flex items-center justify-between bg-[#050505] p-3 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        {userHouse?.isPublic ? (
                          <Unlock className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-500" />
                        )}
                        <div>
                          <p className="text-xs font-semibold">
                            {userHouse?.isPublic ? "Ubicación Pública" : "Dirección Oculta / Privada"}
                          </p>
                          <p className="text-[10px] text-white/40">
                            {userHouse?.isPublic ? "Visible en el buscador general." : "Solo accesible con clave de seguridad."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleHousePrivacy}
                        className="text-[10px] glass border border-white/10 text-white/80 font-mono px-2 py-1 rounded hover:neon-border transition-colors"
                      >
                        Cambiar
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-white/40 tracking-wider uppercase font-mono">Clave Secreta de tu Casa:</span>
                      <div className="flex items-center justify-between bg-[#050505] px-3 py-2 rounded-xl border border-white/10 font-mono text-xs">
                        <span className="text-atarax-cyan atarax-glow font-bold">{userHouse?.accessCode}</span>
                        <span className="text-[9px] text-white/40 glass border border-white/10 px-1.5 py-0.5 rounded">CON COMPAÑEROS</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-white/40 tracking-wider uppercase font-mono">Ubicación Local Registrada:</span>
                      <div className="text-[11px] text-white/40 bg-[#050505] p-3 rounded-xl border border-white/10 flex gap-2">
                        <Globe className="w-4 h-4 text-atarax-cyan shrink-0" />
                        <span>Fijada en la Zona Atarax de tu navegador (Lat/Lng simulado con IP de red local Atarax).</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="bg-[#050505] p-3 rounded-xl border border-white/10 text-xs">
                      <p className="text-white/40">Estás de visita en la casa de:</p>
                      <h5 className="font-bold text-sm text-yellow-400 font-mono mt-0.5">
                        {visitedHouse.ownerName}
                      </h5>
                      <span className="text-[10px] font-mono block glass mt-2 px-2 py-1 border border-white/10 text-center rounded">
                        🏠 Estilo: {visitedHouse.style || "Retro Cabin"}
                      </span>
                    </div>

                    <button
                      onClick={handleReturnHome}
                      className="w-full py-2.5 btn-primary hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer"
                    >
                      <Home className="w-4 h-4" />
                      Regresar a mi Casa
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN RIGHT: INTERACTIVE RPG PARCEL ENGINE (8 COLS) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* HUD / SYSTEM CONSOLE LOGGER */}
              <div className="bg-[#050505] border border-white/10 p-3.5 rounded-xl font-mono text-xs flex gap-2 items-center text-atarax-cyan atarax-glow shadow-inner">
                <span className="bg-pink-950 px-1.5 py-0.5 rounded text-[10px] text-white shrink-0 font-bold tracking-wider uppercase animate-pulse">HUD ATARAX</span>
                <span className="text-white/80 leading-tight block truncate md:overflow-visible md:whitespace-normal">
                  {hudMessage}
                </span>
              </div>

              {/* INTERACTIVE RPG HOUSE grid stage wrapper */}
              <div className="glass border border-white/10 rounded-3xl p-4 md:p-6  flex flex-col gap-4">
                
                {/* TOOLBAR FOR MAP */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#050505]/80 p-3 rounded-2xl border border-white/10 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">
                      {!visitedHouse ? "🏡 Tu Parcela (Editar)" : `👀 Casa de ${visitedHouse.ownerName}`}
                    </span>
                    {!visitedHouse && (
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={`px-3 py-1 rounded font-bold font-mono text-[10px] transition-all tracking-wider ${
                          editMode ? "bg-pink-500 text-white animate-pulse" : "glass text-white/40 border border-white/10 hover:neon-border"
                        }`}
                      >
                        {editMode ? "● MODO EDICIÓN ACTIVO" : "MODO CÁMARA / CAMINAR"}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px] text-white/40">
                    <span>Mover {currentUser.username}:</span>
                    <span className="glass p-1 border border-white/10 text-white/40 rounded">W A S D</span>
                    <span>o teclas de dirección de PC</span>
                  </div>
                </div>

                {/* MAIN 3D VIEWPORT */}
                <div className="flex justify-center relative bg-[#050505]/80 rounded-2xl border border-white/10" style={{ height: "450px" }}>
                  <House3D 
                    furniture={(visitedHouse || userHouse)?.furniture || []} 
                    playerX={playerX} 
                    playerY={playerY} 
                    playerSprite={SPRITE_EMOJIS[currentUser.spriteKey] || "🧙"}
                    onCellClick={handleGridCellClick}
                    isEditMode={editMode}
                  />
                  {/* Absolute Edit overlay mode warning */}
                  {selectedCatalogItem && (
                    <div className="absolute inset-x-0 bottom-4 text-center z-10 mx-6 bg-[#050505]/90 border neon-border/50 text-atarax-cyan atarax-glow rounded-xl px-4 py-2 text-[11px]  flex items-center justify-between backdrop-blur-md animate-pulse">
                      <span>⚒️ Colocando: <b>{selectedCatalogItem.emoji} {selectedCatalogItem.name} ({selectedCatalogItem.price}g)</b>. Haz clic en la cuadrilla superior.</span>
                      <button 
                        onClick={() => setSelectedCatalogItem(null)} 
                        className="p-1 text-atarax-cyan hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                
                {/* REMOTE MOVEMENT PAD FOR MOBILE DEVICES */}
                <div className="flex flex-col items-center gap-1 md:hidden py-2 bg-[#050505]/40 rounded-2xl border border-white/10">
                  <span className="text-[9px] font-mono text-white/40 tracking-wider">MANDO VIRTUAL</span>
                  <div className="flex flex-col gap-1.5 justify-center items-center">
                    <button 
                      onClick={() => movePlayer(0, -1)}
                      className="w-10 h-10 rounded-xl btn-primary text-white border border-white/10 flex items-center justify-center active:bg-pink-600 active:text-white"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => movePlayer(-1, 0)}
                        className="w-10 h-10 rounded-xl btn-primary text-white border border-white/10 flex items-center justify-center active:bg-pink-600 active:text-white"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10"></div>
                      <button 
                        onClick={() => movePlayer(1, 0)}
                        className="w-10 h-10 rounded-xl btn-primary text-white border border-white/10 flex items-center justify-center active:bg-pink-600 active:text-white"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => movePlayer(0, 1)}
                      className="w-10 h-10 rounded-xl btn-primary text-white border border-white/10 flex items-center justify-center active:bg-pink-600 active:text-white"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* FURNITURE LIST FOR CURRENT REALM PLACED ITEMS */}
                {!visitedHouse && userHouse && (
                  <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3">
                    <h5 className="font-bold text-xs font-mono text-white/40">MUEBLES INSTALADOS EN PARCELA ({userHouse.furniture.length})</h5>
                    {userHouse.furniture.length === 0 ? (
                      <p className="text-xs text-white/40 italic">No has colocado ningún mueble aún en Atarax.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                        {userHouse.furniture.map(item => (
                          <div 
                            key={item.id} 
                            className="text-xs bg-[#050505] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2"
                          >
                            <span>{item.emoji}</span>
                            <span className="text-gray-300 font-medium">{item.name}</span>
                            <span className="text-[10px] text-white/40 font-mono">[{item.x},{item.y}]</span>
                            <button
                              onClick={() => handleRemoveFurniture(item.id)}
                              className="text-white/40 hover:text-rose-400 p-0.5 ml-1 transition-colors"
                              title="Hacer clic para eliminar y recibir 50% reembolso"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SHOP & BROWSE HOUSES SECTION (TAB DESIGN) */}
              <div className="glass border border-white/10 rounded-3xl p-6  grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SHOP PANEL */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Coins className="w-4 h-4 text-atarax-cyan atarax-glow animate-spin" />
                    <h4 className="font-bold text-sm tracking-wide font-mono">Tienda de Diseño Atarax</h4>
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                    {(["all", "furniture", "appliances", "nature", "decor"] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tracking-wider transition-all uppercase ${
                          activeCategory === cat ? "bg-purple-600 text-white" : "bg-[#050505] hover:btn-primary text-white/40 border border-white/10"
                        }`}
                      >
                        {cat === "all" ? "Todos" : cat === "furniture" ? "Muebles" : cat === "appliances" ? "Tecno" : cat === "nature" ? "Naturaleza" : "Decorado"}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {FURNITURE_CATALOG
                      .filter(item => activeCategory === "all" || item.category === activeCategory)
                      .map(item => (
                        <div
                          key={item.itemId}
                          onClick={() => handleSelectCatalog(item)}
                          className="p-3 bg-[#050505]/60 hover:bg-[#050505] hover:neon-border/40 rounded-xl border border-white/10 transition-all cursor-pointer flex gap-1.5 items-start text-xs relative group"
                        >
                          <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white group-hover:text-atarax-cyan atarax-glow truncate">{item.name}</p>
                            <p className="text-[10px] text-white/40 line-clamp-2 mt-0.5 leading-tight">{item.description}</p>
                            <div className="flex items-center justify-between border-t border-white/10 mt-1.5 pt-1">
                              <span className="font-mono text-amber-400 tracking-wider font-semibold">{item.price}g</span>
                              <span className="text-[8px] glass px-1 py-0.2 rounded text-white/40 font-mono uppercase tracking-widest">{item.category}</span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* SEARCH HOUSES & VISIT LIST */}
                <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Compass className="w-4 h-4 text-atarax-cyan shrink-0" />
                    <h4 className="font-bold text-sm tracking-wide font-mono">Buscador Global de Casas</h4>
                  </div>

                  {/* Public search bar */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="block text-white/40 font-medium">Buscador Público (Nombre de Usuario)</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#050505] rounded-xl border border-white/10 flex items-center px-3 gap-2">
                        <Search className="w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          placeholder="Ej. NeoAtarax"
                          value={houseSearchQuery}
                          onChange={(e) => setHouseSearchQuery(e.target.value)}
                          className="w-full bg-transparent py-2 text-white/80 text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSearchHouses}
                        className="btn-primary hover:border-[#64ffda] hover:text-[#64ffda] text-white/80 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-xs"
                      >
                        Buscar
                      </button>
                    </div>
                  </div>

                  {/* Private Code search bar */}
                  <div className="flex flex-col gap-1 text-xs mt-1">
                    <label className="block text-white/40 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Morada Privada (Clave de Casa de Atarax)
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#050505] rounded-xl border border-white/10 flex items-center px-3 gap-2">
                        <Search className="w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          placeholder="Ej. SECRET-777"
                          value={privateSearchQuery}
                          onChange={(e) => setPrivateSearchQuery(e.target.value)}
                          className="w-full bg-transparent py-2 text-white/80 text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handlePrivateSearch}
                        className="btn-primary hover:border-[#64ffda] hover:text-[#64ffda] text-white/80 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-xs"
                      >
                        Clave
                      </button>
                    </div>
                  </div>

                  {searchFeedback && (
                    <p className="text-[10px] text-rose-400 font-mono italic">⚠️ {searchFeedback}</p>
                  )}

                  {/* Active Simulation Player Directory List */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-white/40 tracking-wider uppercase font-mono">CASAS PÚBLICAS RECOMENDADAS:</span>
                    <div className="flex flex-col gap-2 max-h-28 overflow-y-auto pr-1">
                      {publicHouses
                        .filter(h => h.isPublic && h.ownerId !== currentUser.userId)
                        .map(item => (
                          <div 
                            key={item.houseId}
                            onClick={() => {
                              setVisitedHouse(item);
                              setPlayerX(50);
                              setPlayerY(50);
                              setHudMessage(`Visitando casa pública de ${item.ownerName}.`);
                            }}
                            className="bg-[#050505]/60 hover:bg-[#050505]/90 border border-white/10 hover:neon-border/50 p-2.5 rounded-xl text-xs transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-white font-mono truncate">{item.ownerName}</span>
                              <span className="text-[10px] text-white/40">Muebles colocados: {item.furniture.length}</span>
                            </div>
                            <span className="text-[10px] text-atarax-cyan bg-cyan-950 px-2 py-0.5 rounded border neon-border/20 font-mono hover:bg-cyan-900 transition-colors">
                              VISITAR 🏠
                            </span>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER METADATA INFO */}
      <footer className="border-t border-white/10 bg-[#050505]/80 p-4 shrink-0 text-center text-xs text-white/40">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
          <p>Atarax RPG — Servidor de Base de Datos Real y Análisis de Retransmisión con Gemini.</p>
          <div className="flex gap-4">
            <span className="text-[10px]">● Firebase Firestore Sync Ready</span>
            <span className="text-[10px]">● 100 × 100 Grilla Virtual</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
