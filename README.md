# Jak uruchomić stronę Don Kasjo

Strona to aplikacja **Next.js 16** z bazą danych **MongoDB**, opcjonalnym **Redis** i integracją z **Kick.com** oraz **Pusher** (real-time).

---

## Wymagania wstępne

Przed startem zainstaluj:

- [Node.js](https://nodejs.org/) — wersja **18 lub nowsza** (sprawdź: `node -v`)
- [MongoDB](https://www.mongodb.com/try/download/community) — lokalnie **lub** konto na [MongoDB Atlas](https://www.mongodb.com/atlas) (chmura, darmowa)
- **npm** — dołączony do Node.js

---

## Krok 1 — Zainstaluj zależności

```bash
npm install
```

---

## Krok 2 — Skonfiguruj zmienne środowiskowe

Plik `.env` jest już w folderze projektu. Uzupełnij go swoimi danymi:

```env
# Połączenie z bazą danych MongoDB (WYMAGANE)
MONGODB_URI=mongodb+srv://uzytkownik:haslo@cluster.mongodb.net/donkasjo

# Adres strony (WYMAGANE)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Nie zmieniaj tego
NODE_ENV=production

# Dane aplikacji Kick.com (wymagane do logowania przez Kick)
KICK_CLIENT_ID=
KICK_CLIENT_SECRET=
KICK_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_KICK_CHANNEL_ID=
```

### Jak zdobyć `MONGODB_URI`?

**Opcja A — MongoDB Atlas (chmura, polecana):**
1. Wejdź na [mongodb.com/atlas](https://www.mongodb.com/atlas) i załóż darmowe konto
2. Utwórz klaster (darmowy tier `M0`)
3. W zakładce **Database Access** dodaj użytkownika z hasłem
4. W zakładce **Network Access** dodaj swój IP lub `0.0.0.0/0` (wszędzie)
5. Kliknij **Connect → Drivers** i skopiuj URI — wygląda tak:
   ```
   mongodb+srv://uzytkownik:haslo@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**Opcja B — MongoDB lokalnie:**
```
MONGODB_URI=mongodb://localhost:27017/donkasjo
```

### Jak zdobyć dane Kick.com?

1. Wejdź na [kick.com/settings/developer](https://kick.com/settings/developer)
2. Utwórz nową aplikację OAuth
3. Jako **Redirect URI** wpisz: `http://localhost:3000/api/auth/callback`
4. Skopiuj **Client ID** i **Client Secret** do `.env`
5. `NEXT_PUBLIC_KICK_CHANNEL_ID` to numeryczne ID Twojego kanału na Kick (możesz je znaleźć przez API Kick lub w ustawieniach kanału)

---

## Krok 3 — Załaduj dane do bazy (opcjonalne)

Skrypty w `src/scripts/` wypełnią bazę przykładowymi danymi:

```bash
# Załaduj poradniki/instrukcje
node src/scripts/seed-instructions.js

# Załaduj partnerów
node src/scripts/seed-partners.mjs
```

> Możesz to pominąć — strona będzie działać, tylko sekcje z poradnikami i partnerami będą puste.

---

## Krok 4 — Uruchom aplikację

### Tryb deweloperski (na co dzień)

```bash
npm run dev
```

Strona będzie dostępna pod: **http://localhost:3000**

### Tryb produkcyjny

```bash
npm run build
npm run start
```

---

## Funkcje opcjonalne

### Redis (dla rate-limitingu i sesji)

Bez Redisa aplikacja działa z wbudowanym mock-em (dane w pamięci, znikają po restarcie). Jeśli chcesz prawdziwy Redis:

1. Zainstaluj Redis lokalnie **lub** użyj [Upstash](https://upstash.com/) (darmowy plan)
2. Dodaj do `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   # lub dla Upstash:
   REDIS_URL=rediss://default:haslo@xxxx.upstash.io:6379
   ```

### Pusher (dla czatu i powiadomień real-time)

Bez Pushera powiadomienia real-time nie działają, ale reszta strony działa normalnie.

1. Załóż konto na [pusher.com](https://pusher.com/) (darmowy plan)
2. Utwórz nową aplikację **Channels**
3. Dodaj do `.env`:
   ```env
   PUSHER_APP_ID=
   NEXT_PUBLIC_PUSHER_KEY=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_CLUSTER=eu
   ```

---

## Szybki start — minimalna konfiguracja

Jeśli chcesz jak najszybciej zobaczyć stronę działającą, wystarczą tylko **2 rzeczy**:

```env
MONGODB_URI=mongodb+srv://...   # Twój Atlas URI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Reszta (Redis, Pusher, Kick) możesz dodać później.

```bash
npm install
npm run dev
```

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---|---|
| `MongooseError: Could not connect` | Sprawdź `MONGODB_URI` i czy IP jest whitelistowane w Atlas |
| Strona nie ładuje się po `npm run dev` | Sprawdź czy port 3000 nie jest zajęty (`npx kill-port 3000`) |
| Logowanie przez Kick nie działa | Sprawdź `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET` i `KICK_REDIRECT_URI` |
| Real-time (czat, powiadomienia) nie działa | Uzupełnij dane Pushera w `.env` |
| `npm install` się sypie | Usuń `node_modules` i `package-lock.json`, potem `npm install` ponownie |
