import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Global replacements
content = content.replace(/bg-slate-950/g, 'bg-[#050505]')
                 .replace(/bg-slate-900\/60/g, 'glass')
                 .replace(/bg-slate-900/g, 'glass')
                 .replace(/bg-slate-800/g, 'btn-primary')
                 .replace(/border-slate-[0-9]{3}(\/[0-9]+)?/g, 'border-white/10')
                 .replace(/border-pink-[0-9]{3}/g, 'neon-border')
                 .replace(/border-cyan-[0-9]{3}/g, 'neon-border')
                 .replace(/text-pink-[0-9]{3}/g, 'text-atarax-cyan atarax-glow')
                 .replace(/text-purple-[0-9]{3}/g, 'text-white/80')
                 .replace(/text-slate-100/g, 'text-white')
                 .replace(/text-gray-[1-2]00/g, 'text-white')
                 .replace(/text-slate-[2-3]00/g, 'text-white/80')
                 .replace(/text-slate-[4-5]00/g, 'text-white/40')
                 .replace(/text-cyan-[0-9]{3}/g, 'text-atarax-cyan')
                 .replace(/text-indigo-[0-9]{3}/g, 'text-white/90')
                 .replace(/selection:bg-pink-[0-9]{3}/g, 'selection:bg-atarax-cyan selection:text-black')
                 .replace(/bg-gradient-to-[a-z]+\s+from-[a-z]+-[0-9]{3}\s+(via-[a-z]+-[0-9]{3}\s+)?to-[a-z]+-[0-9]{3}/g, 'btn-primary')
                 .replace(/hover:from-pink-[0-9]{3}\s+hover:to-[a-z]+-[0-9]{3}/g, '')
                 .replace(/shadow-pink-[0-9]{3}\/[0-9]+/g, 'shadow-[0_0_15px_rgba(100,255,218,0.3)]')
                 .replace(/shadow-purple-[0-9]{3}\/[0-9]+/g, 'shadow-[0_0_15px_rgba(100,255,218,0.3)]')
                 .replace(/shadow-cyan-[0-9]{3}\/[0-9]+/g, 'shadow-[0_0_15px_rgba(100,255,218,0.3)]')
                 .replace(/shadow-lg/g, '')
                 .replace(/shadow-xl/g, '')
                 .replace(/shadow-2xl/g, '')
                 // Fix specific block replacements for main headers and layout items
                 .replace(/min-h-screen\s+bg-\[#050505\]\s+text-white\s+flex\s+flex-col\s+font-sans\s+relative/g, 'min-h-screen bg-[#050505] grid-dot text-white flex flex-col font-sans relative')
                 .replace(/<div className="absolute -top-24 -left-20 w-48 h-48 rounded-full bg-[^"]+"><\/div>/g, '')
                 .replace(/<div className="absolute -bottom-24 -right-20 w-48 h-48 rounded-full bg-[^"]+"><\/div>/g, '')
                 .replace(/<div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[^"]+"><\/div>/g, '')
                 // Typography
                 .replace(/font-black/g, 'font-black serif')
                 .replace(/font-serif/g, 'serif');

// Fix double btn-primary if they occur
content = content.replace(/btn-primary btn-primary/g, 'btn-primary')
                 .replace(/glass glass/g, 'glass')
                 .replace(/btn-primary\s+bg-clip-text\s+text-transparent/g, 'atarax-glow text-white')
                 .replace(/btn-primary\s+text-transparent/g, 'atarax-glow text-white');

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx");
