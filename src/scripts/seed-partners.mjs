import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env from .env file (handled by node --env-file=.env)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('PROSZĘ DOPISAĆ MONGODB_URI DO PLIKU .env');
  process.exit(1);
}

// Define Schema for the script (to avoid importing from app structure which might fail in raw node)
const partnerSiteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    bonus: { type: String, required: true },
    description: { type: String, default: "" },
    code: { type: String, default: null },
    link: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    color: { type: String, default: "blue" },
    htmlContent: { type: String, default: "" },
  },
  { timestamps: true }
);

const PartnerSite = mongoose.models.PartnerSite || mongoose.model("PartnerSite", partnerSiteSchema);

const partnersToSeed = [
  {
    name: "Stake",
    bonus: "3.5% DOŻYWOTNIEGO ZWROTU",
    description: "Z kodem KASJOWIN 3.5% dożywotniego rakebacku oraz codzienne turnieje z wysokimi nagrodami.",
    htmlContent: `
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 shadow-lg shadow-blue-500/10 border border-blue-500/20">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-400">Oferta Limitowana</span>
        </div>
        <p class="text-white/90 leading-relaxed">Z kodem <strong class="text-blue-400">KASJOWIN</strong> otrzymujesz stały bonus:</p>
        <ul class="space-y-2">
          <li class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_var(--blue-500)]"></div>
            <span class="text-sm">3.5% dożywotniego rakebacku</span>
          </li>
          <li class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_var(--blue-500)]"></div>
            <span class="text-sm">Codzienne turnieje z wysokimi nagrodami</span>
          </li>
        </ul>
      </div>
    `,
    imageUrl: "/Kasyno1.png",
    code: "KASJOWIN",
    link: "https://stake.com",
    color: "blue",
    order: 1
  },
  {
    name: "WPT Global",
    bonus: "BATTLE OF MALTA TRIP",
    description: "Wygraj wyjazd na Battle of Malta! Codzienne satelity oraz darmowe freerolle co tydzień!",
    htmlContent: `
      <div class="space-y-3">
        <h4 class="text-indigo-400 font-black italic uppercase tracking-tighter text-lg">Wygraj wyjazd na Battle of Malta!</h4>
        <div class="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
          <div class="flex items-start gap-3">
            <span class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">✓</span>
            <p class="text-xs text-white/70">Codzienne satelity już od <strong class="text-white">$1.10</strong></p>
          </div>
          <div class="flex items-start gap-3">
            <span class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">✓</span>
            <p class="text-xs text-white/70">Darmowe <strong class="text-white">freerolle</strong> co tydzień!</p>
          </div>
        </div>
      </div>
    `,
    imageUrl: "/Kasyno2.png",
    code: "KASJO",
    link: "https://wptglobal.com",
    color: "purple-blue",
    order: 2
  },
  {
    name: "Lanista",
    bonus: "125% BONUS + 250FS",
    description: "Bonus powitalny 125% aż do 3500 PLN, 250 darmowych spinów. Bonus na sport: 100% do 450 PLN!",
    htmlContent: `
      <div class="space-y-3">
        <div class="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p class="text-sm font-bold text-amber-400 uppercase italic">Multi-Bonus Pack</p>
        </div>
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs p-1.5 hover:bg-white/5 rounded-md transition-colors">
            <span class="text-white/60">Kasyno 125% do:</span>
            <span class="text-amber-400 font-bold">3500 PLN</span>
          </div>
          <div class="flex items-center justify-between text-xs p-1.5 hover:bg-white/5 rounded-md transition-colors">
            <span class="text-white/60">Darmowe Spiny:</span>
            <span class="text-amber-400 font-bold">250 FS</span>
          </div>
          <div class="flex items-center justify-between text-xs p-1.5 hover:bg-white/5 rounded-md transition-colors">
            <span class="text-white/60">Bonus Sport:</span>
            <span class="text-amber-400 font-bold">450 PLN</span>
          </div>
        </div>
      </div>
    `,
    imageUrl: "/Kasyno3.png",
    code: "KASJO",
    link: "https://lanista.com",
    color: "amber",
    order: 3
  },
  {
    name: "Sportuna",
    bonus: "PAKIET 225% DO 13500 PLN",
    description: "Największy pakiet powitalny: 225% do 13500 PLN i 250 darmowych spinów!",
    htmlContent: `
      <div class="space-y-4">
        <div class="relative p-3 rounded-xl border border-lime-500/30 bg-gradient-to-br from-lime-500/10 to-transparent overflow-hidden">
          <div class="absolute -right-2 -top-2 opacity-10 text-lime-500">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h5 class="text-lime-400 font-black italic uppercase text-xs mb-1">GIGA PAKIET POWITALNY</h5>
          <p class="text-2xl font-black text-white tracking-tighter italic">225% <span class="text-xs font-medium text-white/60 not-italic">aż do</span> 13500 PLN</p>
        </div>
        <div class="flex items-center gap-4 text-[10px] font-bold uppercase text-white/50 tracking-widest pl-2">
          <span class="flex items-center gap-1.5"><div class="h-1 w-1 rounded-full bg-lime-500"></div> 250 FS</span>
          <span class="flex items-center gap-1.5"><div class="h-1 w-1 rounded-full bg-lime-500"></div> Sport 450 PLN</span>
        </div>
      </div>
    `,
    imageUrl: "/Kasyno4.png",
    code: "KASJO",
    link: "https://sportuna.com",
    color: "lime",
    order: 4
  },
  {
    name: "Punter",
    bonus: "100% BONUS + 200 FS",
    description: "Bonus powitalny 100% aż do 2250 PLN + 200 darmowych spinów!",
    htmlContent: `
      <div class="space-y-4">
        <div class="relative p-3 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent overflow-hidden">
          <div class="absolute -right-2 -top-2 opacity-10 text-red-500">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M11.75 3.14l3.15 6.37 7.03 1.02-5.09 4.96 1.2 7.01-6.29-3.32-6.29 3.32 1.2-7.01-5.09-4.96 7.03-1.02 3.15-6.37z"/></svg>
          </div>
          <h5 class="text-red-400 font-black italic uppercase text-xs mb-1">POWITALNY START</h5>
          <p class="text-2xl font-black text-white tracking-tighter italic">100% <span class="text-xs font-medium text-white/60 not-italic">aż do</span> 2250 PLN</p>
        </div>
        <div class="flex items-center gap-4 text-[10px] font-bold uppercase text-white/50 tracking-widest pl-2">
          <span class="flex items-center gap-1.5"><div class="h-1 w-1 rounded-full bg-red-500"></div> 200 FS</span>
          <span class="flex items-center gap-1.5"><div class="h-1 w-1 rounded-full bg-red-500"></div> VIP Entry</span>
        </div>
      </div>
    `,
    imageUrl: "/Kasyno5.png",
    code: "KASJO",
    link: "https://punter.com",
    color: "red",
    order: 5
  },
  {
    name: "Slotuna",
    bonus: "100% BONUS + 200FS + CRAB",
    description: "Bonus powitalny 100% do 2250 PLN, 200 darmowych spinów i 1 Bonus Crab.",
    htmlContent: `
      <div class="flex flex-col gap-4">
        <p class="text-sm font-medium text-purple-200/80 italic leading-relaxed pl-4 border-l-2 border-purple-500/40">
          "Z kodem KASJO bonus powitalny 100% do 2250 PLN, 200 darmowych spinów i 1 Bonus Crab."
        </p>
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase">100% Bonus</span>
          <span class="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase">200 FS</span>
          <span class="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase">Wypłacone: 166k</span>
        </div>
      </div>
    `,
    imageUrl: "/Kasyno6.png",
    code: "KASJO",
    link: "https://slotuna.com",
    color: "purple",
    order: 6
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Połączono z MongoDB.');

    // Clear existing (optional, but requested for a "clean" import)
    // await PartnerSite.deleteMany({});
    
    for (const partner of partnersToSeed) {
      await PartnerSite.updateOne(
        { name: partner.name },
        { $set: partner },
        { upsert: true }
      );
      console.log(`Zaimportowano/Zaktualizowano: ${partner.name}`);
    }

    console.log('Sukces: Wszystkie dane zostały zaimportowane.');
    process.exit(0);
  } catch (error) {
    console.error('Błąd podczas importu:', error);
    process.exit(1);
  }
}

seed();
