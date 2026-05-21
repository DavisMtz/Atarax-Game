import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* MAIN GRID VIEWPORT \*\/\}[\s\S]*?(?=\{\/\* REMOTE MOVEMENT PAD FOR MOBILE DEVICES \*\/\}|\{\/\* VISUAL INVENTORY AND CATALOG \*\/\}|\{\/\* EDITING INVENTORY \*\/\}|\{\/\* COMPASS AND LORE BAR \*\/\}|\{\/\* SHOPPING INVENTORY \(IF IN EDIT MODE\) \*\/\}|\{\/\* END OF THE VISUAL GRID \*\/\}|\{\/\* END OF MAIN GRID VIEWPORT \*\/\}|\{\/\* INTERACTIVE RPG PARCEL ENGINE \(8 COLS\) \*\/\}|\{\/\* HUD \/ SYSTEM CONSOLE LOGGER \*\/\}|\{\/\* COLUMN RIGHT: INTERACTIVE RPG PARCEL ENGINE \(8 COLS\) \*\/\}|\<div className="flex flex-col items-center gap-1 md:hidden)/i;

// Replace the grid container with our House3D component
content = content.replace(
  regex,
  `{/* MAIN 3D VIEWPORT */}
                <div className="flex justify-center relative bg-[#050505]/80 rounded-2xl border border-white/10" style={{ height: "450px" }}>
                  <House3D 
                    furniture={(visitedHouse || userHouse)?.furniture || []} 
                    playerX={playerX} 
                    playerY={playerY} 
                    playerSprite={SPRITE_EMOJIS[currentUser.spriteKey] || "🧙"}
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
                
                `
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx (Part 2/2)");
