import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/hover:bg-slate-[0-9]{3}/g, 'hover:border-[#64ffda] hover:text-[#64ffda]')
                 .replace(/hover:text-slate-[0-9]{3}/g, 'hover:text-[#64ffda]')
                 .replace(/text-gray-100/g, 'text-white')
                 .replace(/text-gray-200/g, 'text-white')
                 // Let's replace the top level bg if it's not grid-dot (in case my first script missed it)
                 .replace(/className="min-h-screen bg-\[\#050505\] text-white flex flex-col/g, 'className="min-h-screen bg-[#050505] grid-dot text-white flex flex-col')
                 .replace(/bg-gradient-to-tr from-pink-500 to-purple-600/g, 'glass')

                 // Any other bg-slate colors?
                 .replace(/bg-red-[a-z0-9\/]+/g, 'btn-primary text-red-500')
                 .replace(/bg-rose-[a-z0-9\/]+/g, 'glass border-red-500 text-red-500')
                 .replace(/bg-green-[a-z0-9\/]+/g, 'glass border-green-500/20 text-green-500')

                 // Check header layout styles
                 .replace(/border-slate-900/g, 'border-white/10')
                 .replace(/border-slate-800/g, 'border-white/10')
                 .replace(/border-pink-500/g, 'neon-border')
                 .replace(/border-cyan-500/g, 'neon-border');

// Replace any remaining btn-primary chained correctly
content = content.replace(/btn-primary btn-primary/g, 'btn-primary');

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx again");
