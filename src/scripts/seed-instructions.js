import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/donkasjo';

const instructionSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  htmlContent: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

const Instruction = mongoose.models.Instruction || mongoose.model('Instruction', instructionSchema);

const instructions = [
  {
    slug: 'stake-guide',
    title: 'Vademecum Stake: Pełny Tutorial od DONKASJO',
    shortDescription: 'Kompleksowy poradnik – od pierwszej wpłaty BLIK, przez grę, aż po bezpieczną wypłatę wygranych.',
    htmlContent: `
      <div class="space-y-12">
        <!-- Hero Section -->
        <div class="relative overflow-hidden rounded-[2.5rem] border border-primary/30 bg-[#080808] p-10 lg:p-16 shadow-[0_0_50px_rgba(0,255,0,0.05)]">
           <div class="absolute -right-40 -top-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]"></div>
           <div class="relative z-10 space-y-6">
              <div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-[0.3em] text-primary">Masterclass</div>
              <h2 class="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Twierdza Stake<br/><span class="text-primary italic">Z DONKASJO</span></h2>
              <p class="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-3xl">
                Zacznij grać tam, gdzie najwięksi. Ten poradnik to nie tylko instrukcja – to Twoja przewaga na platformie Stake. Dowiesz się jak błyskawicznie deponować, optymalizować koszty transakcji i unikać błędów nowicjuszy.
              </p>
           </div>
        </div>

        <!-- Section 1: Intro -->
        <div class="grid gap-8 lg:grid-cols-12">
           <div class="lg:col-span-4 space-y-4">
              <div class="h-1 w-20 bg-primary rounded"></div>
              <h3 class="text-3xl font-black italic uppercase text-white tracking-tight">Dostęp i Bonusy</h3>
              <p class="text-sm text-muted-foreground">Pierwszym krokiem jest wejście na pokład. DONKASJO poleca rejestrację z kodem, który otwiera drzwi do wszystkich konkursów i rankingów na tej stronie.</p>
           </div>
           <div class="lg:col-span-8 space-y-6">
              <div class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.05]">
                 <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h4 class="text-xl font-bold text-white uppercase italic">Kod: SZYMOOL</h4>
                    <span class="rounded-lg bg-primary/20 px-3 py-1 text-[10px] font-black uppercase text-primary tracking-widest">+200% DEPOSIT BONUS</span>
                 </div>
                 <p class="text-sm text-muted-foreground mb-6">Używając tego kodu, stajesz się częścią elitarnej społeczności DONKASJO. Zyskujesz automatyczny dostęp do wyścigów o sumarycznej wartości $100,000 miesięcznie oraz specjalnych turniejów widowni.</p>
                 <div class="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive uppercase tracking-widest">
                    Pamiętaj: Napisz do supportu na czacie od razu po wpłacie! Poproś o aktywację bonusu, powołując się na kod SZYMOOL.
                 </div>
              </div>
           </div>
        </div>

        <!-- Section 2: BLIK -->
        <div class="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 p-1">
           <div class="bg-[#0c0c0c] rounded-[2.9rem] p-10 lg:p-16 space-y-8">
              <div class="space-y-2">
                 <h3 class="text-4xl font-black italic uppercase text-white">Wpłata BLIK / PSC</h3>
                 <p class="text-muted-foreground text-lg italic">Najszybsza droga do akcji. Zero komplikacji.</p>
              </div>
              
              <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <div class="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div class="text-primary font-black uppercase italic text-sm">Krok 01</div>
                    <p class="text-sm text-muted-foreground">Wchodzisz w zakładkę <span class="text-white font-bold">Portfel</span> na Stake i wybierasz <span class="text-white font-bold">Kup kryptowaluty</span>.</p>
                 </div>
                 <div class="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div class="text-primary font-black uppercase italic text-sm">Krok 02</div>
                    <p class="text-sm text-muted-foreground">Wybierasz walutę <span class="text-white font-bold">LTC (Litecoin)</span> lub USDT. LTC ma najniższe prowizje.</p>
                 </div>
                 <div class="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div class="text-primary font-black uppercase italic text-sm">Krok 03</div>
                    <p class="text-sm text-muted-foreground">Wybierz operatora <span class="text-primary">Swapped</span>. To on obsługuje BLIKa w Polsce.</p>
                 </div>
              </div>

              <div class="pt-8 border-t border-white/10 flex flex-col lg:flex-row gap-8 items-center">
                 <div class="flex-1 space-y-4">
                    <h4 class="text-xl font-bold text-white italic uppercase">Dlaczego Swapped?</h4>
                    <p class="text-sm text-muted-foreground leading-relaxed leading-relaxed leading-relaxed">
                       To sprawdzony partner DONKASJO. Proces jest w pełni zautomatyzowany – wpisujesz kod BLIK, zatwierdzasz w banku, a Swapped przesyła krypto bezpośrednio na Twoje saldo Stake. Środki pojawiają się zwykle w mniej niż 15 minut. Możesz też użyć karty płatniczej lub PaySafeCard.
                    </p>
                 </div>
                 <div class="hidden lg:block w-px h-24 bg-white/10"></div>
                 <div class="flex-1 space-y-4">
                    <h4 class="text-xl font-bold text-white italic uppercase">Protip DONKASJO</h4>
                    <ul class="space-y-2 text-sm text-muted-foreground">
                       <li class="flex items-center gap-2"><span class="h-1 w-1 bg-primary rounded-full"></span> Zawsze weryfikuj adres email w Swapped</li>
                       <li class="flex items-center gap-2"><span class="h-1 w-1 bg-primary rounded-full"></span> Unikaj wpłat w ETH – wysokie prowizje sieciowe</li>
                       <li class="flex items-center gap-2"><span class="h-1 w-1 bg-primary rounded-full"></span> Sprawdzaj limity dzienne operatora</li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>

        <!-- Section 3: Wypłaty -->
        <div class="space-y-8">
           <h3 class="text-4xl font-black italic uppercase text-white border-b border-white/10 pb-4">Wypłata Wygranych</h3>
           <div class="grid gap-8 lg:grid-cols-2">
              <div class="space-y-6">
                 <p class="text-muted-foreground leading-relaxed text-lg">
                    W Stake wypłaty są praktycznie natychmiastowe. Jak tylko wygrasz i zdecydujesz się wyjść z gry, Twoje środki trafiają do portfela krypto w kilka minut.
                 </p>
                 <div class="space-y-4">
                    <div class="flex items-start gap-4">
                       <div class="mt-1 h-6 w-6 rounded border border-primary/40 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</div>
                       <p class="text-sm text-muted-foreground"><strong class="text-white">Portfel docelowy:</strong> Zawsze wypłacaj na własny portfel, np. Trust Wallet lub bezpośrednio na giełdę taką jak BingX.</p>
                    </div>
                    <div class="flex items-start gap-4">
                       <div class="mt-1 h-6 w-6 rounded border border-primary/40 bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">✓</div>
                       <p class="text-sm text-muted-foreground"><strong class="text-white">Opłaty:</strong> Wypłacaj w LTC – opłata za wypłatę to kilka groszy, niezależnie od kwoty.</p>
                    </div>
                 </div>
              </div>
              <div class="rounded-3xl bg-primary/5 border border-primary/20 p-8 space-y-4 text-center">
                 <div class="text-5xl mb-4">🏆</div>
                 <h4 class="text-2xl font-black italic uppercase text-white">DONKASJO WIN MODE</h4>
                 <p class="text-sm text-muted-foreground italic">"Nie goń strat, ale też naucz się wypłacać profity. Nawet najmniejsza wygrana cieszy, jeśli jest na Twoim koncie bankowym, a nie tylko na saldzie kasyna!"</p>
              </div>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'omijanie-ograniczen',
    title: 'Dostęp bez barier: Przewodnik DNS i VPN od DONKASJO',
    shortDescription: 'Masz problemy z wejściem na stronę? Dowiedz się, jak w prosty sposób przywrócić dostęp do platformy Stake.',
    htmlContent: `
      <div class="space-y-12">
        <div class="space-y-6">
           <h2 class="text-4xl font-black italic uppercase text-white tracking-tighter">Problemy z połączeniem?</h2>
           <p class="text-lg text-muted-foreground leading-relaxed">
             Dostawcy internetu w Polsce często blokują adresy kasyn online. To standardowa procedura, którą można obejść w mniej niż minutę. DONKASJO nie lubi barier, dlatego przygotowaliśmy ten tutorial.
           </p>
        </div>

        <div class="grid gap-12 lg:grid-cols-2">
           <!-- DNS Section -->
           <div class="rounded-3xl border border-white/10 bg-white/[0.02] p-10 space-y-6">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <h3 class="text-2xl font-black italic uppercase text-white">Metoda 01: Zmiana DNS</h3>
              <p class="text-sm text-muted-foreground italic border-l-2 border-primary pl-4">To najskuteczniejsze i najszybsze rozwiązanie. Zamiast serwerów dostawcy, użyjesz wolnych serwerów Google lub Cloudflare.</p>
              
              <div class="space-y-4">
                 <div class="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div class="text-[10px] font-black uppercase text-primary tracking-widest">Procedura Windows</div>
                    <ol class="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                       <li>Centrum Sieci i Udostępniania -> Zmień ustawienia karty</li>
                       <li>Właściwości aktywnej sieci -> Protokół IPv4</li>
                       <li>Odznacz automatyczne i wpisz adresy poniżej</li>
                    </ol>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                       <div class="text-xs text-muted-foreground uppercase mb-1 font-bold">Google</div>
                       <div class="text-lg font-black text-white">8.8.8.8</div>
                    </div>
                    <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                       <div class="text-xs text-muted-foreground uppercase mb-1 font-bold">Cloudflare</div>
                       <div class="text-lg font-black text-white">1.1.1.1</div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- VPN Section -->
           <div class="rounded-3xl border border-white/10 bg-white/[0.02] p-10 space-y-6">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 class="text-2xl font-black italic uppercase text-white">Metoda 02: VPN</h3>
              <p class="text-sm text-muted-foreground italic border-l-2 border-blue-500 pl-4">Jeśli DNS zawiedzie lub masz problem z licencją IP (komunikat przy logowaniu), VPN to Twój najlepszy przyjaciel.</p>
              
              <div class="space-y-4">
                 <p class="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-blue-500/40 pl-4">
                    Stake to platforma, która nie zabrania korzystania z VPN. Jeśli widzisz komunikat o ograniczeniach regionalnych, zainstaluj prostą aplikację i połącz się przez <span class="text-white font-bold">Kanadę, Cypr lub Niemcy</span>. Restart przeglądarki i możesz grać dalej z DONKASJO.
                 </p>
              </div>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'krypto-guide',
    title: 'Kryptowaluty od A do Z: Przewodnik DONKASJO',
    shortDescription: 'Dowiedz się jak kupować, przechowywać i przesyłać kryptowaluty z maksymalnym bezpieczeństwem.',
    htmlContent: `
      <div class="space-y-12">
        <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white">Pieniądz Przyszłości</h2>
        
        <div class="grid gap-8 lg:grid-cols-3">
           <div class="p-8 rounded-3xl border border-white/10 bg-white/[0.03] space-y-4">
              <div class="text-4xl text-primary mb-2">💳</div>
              <h4 class="text-xl font-bold text-white uppercase italic">Zakup</h4>
              <p class="text-sm text-muted-foreground">Kupuj na giełdach jak <span class="text-white font-bold">BingX</span> za pomocą karty, Apple Pay lub Google Pay. To najbezpieczniejsza opcja dla widowni DONKASJO.</p>
           </div>
           <div class="p-8 rounded-3xl border border-white/10 bg-white/[0.03] space-y-4">
              <div class="text-4xl text-white mb-2">📱</div>
              <h4 class="text-xl font-bold text-white uppercase italic">Portfel</h4>
              <p class="text-sm text-muted-foreground">Nie trzymaj wszystkiego na giełdzie. <span class="text-white font-bold">Trust Wallet</span> na Twoim telefonie to Twój prywatny sejf, do którego tylko Ty masz klucze.</p>
           </div>
           <div class="p-8 rounded-3xl border border-white/10 bg-white/[0.03] space-y-4">
              <div class="text-4xl text-white mb-2">⚡</div>
              <h4 class="text-xl font-bold text-white uppercase italic">Transfer</h4>
              <p class="text-sm text-muted-foreground">Przesyłaj środki za pomocą sieci <span class="text-primary font-bold italic uppercase">Litecoin (LTC)</span>. Minimalne prowizje i duża szybkość.</p>
           </div>
        </div>

        <div class="p-10 rounded-[2.5rem] border border-primary/20 bg-primary/5 space-y-6">
           <h3 class="text-2xl font-black italic uppercase text-white">Dlaczego DONKASJO wybiera krypto?</h3>
           <p class="text-muted-foreground leading-relaxed italic">
              Standardowe przelewy bankowe trwają wieczność i są pod stałą lupą. Kryptowaluty dają Ci pełną kontrolę. Zarabiasz punkty, grasz i wypłacasz kiedy chcesz, bez pytań. Stake oferuje dziesiątki walut, ale my skupiamy się na LTC ze względu na optymalizację kosztów. Pamiętaj: każda giełda i każdy portfel to Twoja prywatna sprawa – dbaj o swoje dane!
           </p>
        </div>
      </div>
    `
  },
  {
    slug: 'wyplata-wygranych',
    title: 'Wygrana w kieszeni: Jak wypłacać środki?',
    shortDescription: 'Poznaj skuteczne i anonimowe sposoby na zamianę krypto na gotówkę lub środki na karcie.',
    htmlContent: `
      <div class="space-y-12">
        <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white uppercase">Czas na PROFIT</h2>
        
        <div class="grid gap-8 lg:grid-cols-2">
           <!-- Bitomat -->
           <div class="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-10 transition-all hover:bg-white/[0.05]">
              <div class="absolute -right-10 -bottom-10 opacity-10 blur-2xl transition-all group-hover:opacity-30">
                 <div class="h-40 w-40 rounded-full bg-orange-500"></div>
              </div>
              <h3 class="text-2xl font-black italic uppercase text-white mb-4">Metoda 01: Bitomaty</h3>
              <p class="text-sm text-muted-foreground leading-relaxed mb-6">
                 Jeśli zależy Ci na gotówce "do ręki" i pełnej anonimowości, Bitomaty to najlepszy wybór. W Polsce jest ich setki – znajdują się w niemal każdym większym centrum handlowym. 
              </p>
           </div>

           <!-- Card -->
           <div class="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-10 transition-all hover:bg-white/[0.05]">
              <div class="absolute -right-10 -bottom-10 opacity-10 blur-2xl transition-all group-hover:opacity-30">
                 <div class="h-40 w-40 rounded-full bg-blue-500"></div>
              </div>
              <h3 class="text-2xl font-black italic uppercase text-white mb-4">Metoda 02: Giełda + Karta</h3>
              <p class="text-sm text-muted-foreground leading-relaxed mb-6">
                 Chcesz płacić wygranymi direkt w sklepie żabka lub przez Apple Pay? Skonfiguruj giełdę BingX z Twoim kontem bankowym lub wirtualną kartą ZEN/Revolut.
              </p>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'odpowiedzialna-gra',
    title: 'Graj z Głową: Dekalog DONKASJO',
    shortDescription: 'Hazard to rozrywka. Dowiedz się jak grać odpowiedzialnie i trzymać emocje na wodzy.',
    htmlContent: `
      <div class="space-y-12">
        <div class="bg-destructive/5 border border-destructive/20 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
           <div class="relative z-10 space-y-6">
              <h2 class="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white uppercase">Ważny Przekaz</h2>
              <p class="text-muted-foreground text-lg lg:text-xl max-w-3xl mx-auto border-y border-white/10 py-6 italic">
                 Hazard to ma być dodatek do życia, a nie jego centrum. DONKASJO gra dla emocji i zabawy – Ty powinieneś robić tak samo. 
              </p>
           </div>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
           <div class="space-y-8">
              <h3 class="text-3xl font-black italic uppercase text-white tracking-tight">Zasady DONKASJO</h3>
              <div class="space-y-4">
                 <div class="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4">
                    <span class="text-primary font-black italic text-xl">01</span>
                    <p class="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-4"><strong class="text-white">Limit Budżetu:</strong> Nigdy nie graj za pieniądze, które są Ci potrzebne na życie, rachunki czy długi.</p>
                 </div>
                 <div class="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-4">
                    <span class="text-primary font-black italic text-xl">02</span>
                    <p class="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-4"><strong class="text-white">Systematyczne Przerwy:</strong> Jeśli czujesz zmęczenie lub irytację – przestań grać.</p>
                 </div>
              </div>
           </div>

           <div class="space-y-8">
              <h3 class="text-3xl font-black italic uppercase text-white tracking-tight">Wsparcie</h3>
              <div class="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-center space-y-6">
                 <div class="text-[10px] font-black uppercase text-destructive tracking-widest">LINIA POMOCY (POLSKA)</div>
                 <div class="text-3xl font-black text-white italic">800 199 990</div>
              </div>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'bonusy-obrot',
    title: 'Materiały o Bonusach: Wager i Rollover',
    shortDescription: 'Wszystko co musisz wiedzieć o bonusach kasynowych. Jak z nich korzystać i jak skutecznie je obracać.',
    htmlContent: `
      <div class="space-y-12">
        <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white">Inżynieria Bonusów</h2>
        
        <div class="rounded-[2.5rem] bg-[#0c0c0c] border border-white/10 p-10 lg:p-16 space-y-10">
           <div class="flex flex-col lg:flex-row gap-10">
              <div class="flex-1 space-y-4">
                 <h3 class="text-4xl font-black italic uppercase text-primary">Co to jest Wager?</h3>
                 <p class="text-muted-foreground leading-relaxed text-lg italic border-l-4 border-primary/40 pl-6">
                    Wager (lub Rollover) to wymóg obrotu. Kasyno daje Ci bonus, ale wymaga, abyś postawił określoną sumę pieniędzy, zanim będziesz mógł te środki wypłacić. 
                 </p>
              </div>
              <div class="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col justify-center text-center">
                 <div class="text-2xl font-black text-white leading-tight italic tracking-tighter">WPŁATA: $100<br/>BONUS: $100 (100%)<br/>WAGER: 35x<br/><span class="text-primary mt-2 block shadow-lg glow-green">OBRÓT: $7,000</span></div>
              </div>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'bezpieczenstwo-konta',
    title: 'Bezpieczeństwo Poziom DONKASJO',
    shortDescription: 'Twoje konto na Stake to Twoje pieniądze. Dowiedz się, jak je skutecznie chronić.',
    htmlContent: `
      <div class="space-y-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-500/20 via-transparent p-12 lg:p-20 border border-green-500/30">
           <h2 class="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-white mb-6">Operacja: SEJF</h2>
           <p class="text-muted-foreground text-lg italic border-l-2 border-green-500 pl-6">Hakerzy nie śpią, ale my też nie. DONKASJO stawia na bezkompromisowe bezpieczeństwo.</p>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
           <div class="p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] space-y-4">
              <div class="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl font-black italic">1</div>
              <h3 class="text-xl font-black text-white uppercase italic">Ustaw 2FA</h3>
              <p class="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-green-500/40 pl-4">Zainstaluj Google Authenticator. Kod z aplikacji to jedyna droga do Twoich środków.</p>
           </div>
           <div class="p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] space-y-4">
              <div class="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl font-black italic">2</div>
              <h3 class="text-xl font-black text-white uppercase italic">Unikalne Hasło</h3>
              <p class="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-green-500/40 pl-4">Nigdy nie używaj tego samego hasła na więcej niż jednej stronie!</p>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'rozumienie-gier-rtp',
    title: 'Mechanika Gier: Szanse i Algorytmy',
    shortDescription: 'Zrozum jak działają sloty i gry stołowe. Poznaj matematyczną stronę hazardu z DONKASJO.',
    htmlContent: `
      <div class="space-y-12">
        <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white">Algorytmik</h2>
        
        <div class="p-10 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
           <h3 class="text-2xl font-black italic uppercase text-primary italic">RTP: Return to Player</h3>
           <p class="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-4">
              Statystyczny zwrot dla gracza. Szukaj gier z RTP blisko 96-97% dla najlepszych szans w sesji u DONKASJO.
           </p>
           <div class="h-px w-full bg-white/10"></div>
           <h3 class="text-2xl font-black italic uppercase text-white italic">Zmienność</h3>
           <p class="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-white/40 pl-4">
              Wysoka = rzadkie, ale wielkie wygrane. Niska = częste, ale małe trafienia. Wybierz swój styl gry!
           </p>
        </div>
      </div>
    `
  },
  {
    slug: 'weryfikacja-kyc',
    title: 'KYC Express: Szybka Weryfikacja',
    shortDescription: 'Przejdź przez proces weryfikacji tożsamości bez zbędnych komplikacji. Instrukcja DONKASJO.',
    htmlContent: `
      <div class="space-y-12">
        <div class="p-10 lg:p-16 rounded-[3rem] bg-white/[0.02] border border-white/10 space-y-8">
           <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white">Weryfikacja</h2>
           <div class="grid gap-8 md:grid-cols-2">
              <div class="space-y-4">
                 <h4 class="text-xl font-black text-primary uppercase italic">01. Dokument Tożsamości</h4>
                 <p class="text-sm text-muted-foreground italic">Zdjęcie dowodu lub paszportu. Musi być ostre i zawierać wszystkie cztery narożniki dokumentu.</p>
              </div>
              <div class="space-y-4">
                 <h4 class="text-xl font-black text-white uppercase italic">02. Dokument Adresowy</h4>
                 <p class="text-sm text-muted-foreground italic">Wyciąg z banku (PDF) lub rachunek za media. Ważny max 3 miesiące.</p>
              </div>
           </div>
        </div>
      </div>
    `
  },
  {
    slug: 'rakeback-vip',
    title: 'VIP Masterclass: Rakeback i Reload',
    shortDescription: 'Zyskuj na każdym zakładzie. Poznaj potęgę programu lojalnościowego u DONKASJO.',
    htmlContent: `
      <div class="space-y-12">
        <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white">Elita VIP</h2>
        <div class="p-10 lg:p-16 rounded-[3rem] bg-[#0c0c0c] border border-primary/20 space-y-6">
           <h3 class="text-3xl font-black italic uppercase text-primary italic tracking-tight shadow-sm">RAKEBACK 15%</h3>
           <p class="text-lg text-muted-foreground italic leading-relaxed border-l-4 border-primary/40 pl-6">Oddajemy Ci 15% przewagi kasyna z każdego postawionego dolara. To Twoja stała, darmowa gotówka, która rośnie z każdym spinem u DONKASJO!</p>
           <div class="flex flex-wrap gap-4 pt-6 border-t border-white/10">
              <div class="px-6 py-2 rounded-full border border-white/10 text-xs font-bold text-white bg-white/5 uppercase italic tracking-widest">Daily Reload</div>
              <div class="px-6 py-2 rounded-full border border-white/10 text-xs font-bold text-white bg-white/5 uppercase italic tracking-widest">Weekly Boost</div>
              <div class="px-6 py-2 rounded-full border border-white/10 text-xs font-bold text-white bg-white/5 uppercase italic tracking-widest">Monthly Bonus</div>
           </div>
        </div>
      </div>
    `
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Usuwamy stare instrukcje przed wgraniem nowych
    console.log('Cleaning up old instructions...');
    await Instruction.deleteMany({});
    console.log('Old instructions removed.');

    for (const inst of instructions) {
      await Instruction.create(inst);
      console.log(`Seeded: ${inst.slug}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
