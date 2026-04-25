"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from "react"

type Language = "pl" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isHydrated: boolean
}

const translations: Record<Language, Record<string, string>> = {
  pl: {
    // Navigation
    "nav.home": "Strona Główna",
    "nav.bonuses": "Bonusy",
    "nav.predictions": "Predykcje",
    "nav.shop": "Sklep",
    "nav.leaderboard": "Ranking",
    "nav.instructions": "Instrukcje",
    "nav.bonusHunt": "Bonus Hunt",
    "nav.discord": "Discord",
    "nav.profile": "Profil",
    "nav.admin": "Admin",
    "nav.logout": "Wyloguj",
    "nav.balance": "STAN KONTA",

    // Hero
    "hero.badge": "Platforma Streamingowa",
    "hero.title": "Najlepszy streamer w Europie",
    "hero.subtitle": "Dołącz do naszej społeczności! Oglądaj na żywo, zdobywaj punkty, rywalizuj w predykcjach i wymieniaj nagrody.",
    "hero.cta": "Dołącz przez Kick",
    "hero.partner": "Ekskluzywny Partner",

    // Quick Links
    "quick.bonuses": "Bonusy",
    "quick.bonuses.desc": "Zdobądź ekskluzywne bonusy.",
    "quick.instructions": "Instrukcje",
    "quick.instructions.desc": "Dowiedz się jak to działa.",
    "quick.shop": "Sklep",
    "quick.shop.desc": "Wydaj punkty na nagrody.",
    "quick.predictions": "Predykcje",
    "quick.predictions.desc": "Obstawiaj wyniki.",
    "quick.leaderboard": "Ranking",
    "quick.leaderboard.desc": "Rywalizuj o gotówkę.",
    "quick.help": "Pomoc",
    "quick.help.desc": "Znajdź odpowiedzi.",

    // Bonus Section
    "bonus.title": "Użyj mojego kodu i bierz udział w:",
    "bonus.badge": "200% Bonusu do depozytu",
    "bonus.wager": "$100,000/mies. & $10,000/tydz. Wager Race",
    "bonus.giveaways": "Giveawayach",
    "bonus.tournaments": "Turniejach",
    "bonus.code": "Użyj kodu",
    "bonus.cta": "Odbierz bonus",

    // CTA Section
    "cta.title": "Dołącz do społeczności kasynowej!",
    "cta.subtitle": "Oglądaj na żywo, zdobywaj ekskluzywne bonusy kasynowe, zbieraj nagrody i rywalizuj w wydarzeniach.",

    // Footer
    "footer.quickLinks": "Szybkie linki",
    "footer.instructions": "Instrukcje",
    "footer.legal": "Wsparcie i Przepisy",
    "footer.social": "Media społecznościowe",
    "footer.stream": "Stream na Kick",
    "footer.daily": "Codziennie 20:00 CEST",
    "footer.rights": "Wszystkie prawa zastrzeżone.",
    "footer.disclaimer": "Usługi kasynowe i linki partnerskie dostępne na tej stronie są przeznaczone wyłącznie do użytku w jurysdykcjach, gdzie hazard online jest legalny. Twoim obowiązkiem jest upewnienie się, że dostęp i korzystanie z tych usług jest dozwolone przez prawo w Twoim kraju lub regionie. Nie popieramy ani nie ułatwiamy nielegalnego hazardu i zdecydowanie zalecamy sprawdzenie legalności hazardu online w Twojej lokalizacji przed zaangażowaniem się w jakąkolwiek aktywność.",
    "footer.returnToSite": "Wróć do strony",

    // Common
    "common.cancel": "Anuluj",
    "common.save": "Zapisz",
    "points": "punktów",
    "language": "Język",
    "watchTime": "Czas oglądania",
    "search": "Szukaj...",
    "all": "Wszystkie",

    // Notifications / Page stats
    "hero.stats.activeViewers": "Aktywnych widzów",
    "hero.stats.pointsInCirculation": "Punktów w obiegu",
    "hero.stats.registeredPlayers": "Zarejestrowanych graczy",
    "notification.newReward.title": "Nowa nagroda dostępna!",
    "notification.newReward.message": "Sprawdź sklep - dodano nowe ekskluzywne przedmioty do wymiany za punkty.",
    "quick.title": "Szybki dostęp",
    "cta.badge": "Dołącz do społeczności",
    "cta.leaderboard": "Zobacz ranking",
    "instructions.all": "Wszystkie",

    // Carousel
    "carousel.shop.title": "Zamień punkty na nagrody",
    "carousel.shop.desc": "Zdobywaj punkty oglądając, pisząc na czacie i grając. Wydaj je w sklepie na przedmioty cyfrowe, dodatki i więcej.",
    "carousel.shop.cta": "Odwiedź sklep",
    "carousel.predictions.title": "Jaki jest Twój wybór?",
    "carousel.predictions.desc": "Obstawiaj nadchodzące przewidywania. Rywalizuj ze społecznością i sprawdź, czy miałeś rację.",
    "carousel.predictions.cta": "Przewiduj wyniki",
    "carousel.leaderboard.title": "$100,000 Miesięczny & $10,000 Tygodniowy Wyścig",
    "carousel.leaderboard.desc": "Każdy zakład się liczy. Top 20 użytkowników z najwyższymi zakładami wygrywa prawdziwe nagrody pieniężne.",
    "carousel.leaderboard.cta": "Dołącz do wyścigu",

    // Leaderboard
    "leaderboard.subtitle.points": "Najlepsi widzowie według zebranych punktów",
    "leaderboard.subtitle.time": "Najlepsi widzowie według czasu oglądania",
    "leaderboard.filter.points": "Punkty",
    "leaderboard.filter.time": "Czas",
    "leaderboard.stats.totalPoints": "Łącznie punktów",
    "leaderboard.stats.watchHours": "Godzin oglądania",
    "leaderboard.stats.activeViewers": "Aktywnych widzów",
    "leaderboard.user.position": "Twoja pozycja w rankingu",
    "leaderboard.user.points": "punktów",
    "leaderboard.top3": "Top 3 widzowie",
    "leaderboard.fullRanking": "Pełen ranking",
    "leaderboard.empty.title": "Ranking jest pusty",
    "leaderboard.empty.desc": "Bądź pierwszym na liście!",
    "leaderboard.rewards.title": "Nagrody za ranking",
    "leaderboard.rewards.desc": "Top 10 widzów co miesiąc otrzymuje ekskluzywne nagrody, bonusy punktowe i specjalne odznaki!",
    "leaderboard.rewards.active": "Konkurs aktywny",

    // Shop
    "shop.categories.badges": "Odznaki",
    "shop.categories.emotes": "Emotki",
    "shop.categories.shoutouts": "Shoutouty",
    "shop.categories.discounts": "Zniżki",
    "shop.categories.experiences": "Doświadczenia",
    "shop.categories.mystery": "Mystery",
    "shop.purchaseSuccess.title": "Zakup udany!",
    "shop.purchaseSuccess.desc": "Kupiłeś \"{name}\" za {points} pkt",
    "shop.badge": "Sklep z nagrodami",
    "shop.title": "Sklep",
    "shop.subtitle": "Wymień zebrane punkty na ekskluzywne nagrody, odznaki i unikalne doświadczenia",
    "shop.loyalty": "SKLEP ZA",
    "shop.loyaltySubtitle": "PUNKTY",
    "shop.yourPoints": "Twoje punkty",
    "shop.earnedToday": "+250 dziś",
    "shop.nextTier": "Do następnego poziomu",
    "shop.sort.featured": "Wyróżnione",
    "shop.sort.priceLow": "Cena: rosnąco",
    "shop.sort.priceHigh": "Cena: malejąco",
    "shop.sort.stock": "Dostępność",
    "shop.empty.title": "Brak przedmiotów",
    "shop.empty.search": "Nie znaleziono przedmiotów pasujących do wyszukiwania",
    "shop.empty.default": "Wkrótce pojawią się tutaj nagrody do odebrania",
    "shop.clearSearch": "Wyczyść wyszukiwanie",
    "shop.dialog.title": "Potwierdź zakup",
    "shop.dialog.desc": "Czy na pewno chcesz kupić ten przedmiot?",
    "shop.dialog.cost": "Koszt",
    "shop.dialog.after": "Po zakupie",
    "shop.dialog.cancel": "Anuluj",
    "shop.dialog.purchasing": "Kupowanie...",
    "shop.dialog.buyNow": "Kup teraz",
    "shop.item.login": "Zaloguj",
    "shop.item.soldOut": "Wyprzedane",
    "shop.item.noPoints": "Brak punktów",
    "shop.item.buy": "Kup",
    "shop.item.available": "dostępnych",
    "shop.item.hit": "Hit",
    "shop.item.hot": "GORĄCY HIT",
    "shop.item.last": "OSTATNIE",
    "shop.item.pcs": "szt.",

    // Predictions
    "predictions.subtitle": "Obstawiaj wyniki i wygraj punkty! Postaw na swój typ i sprawdź czy miałeś rację.",
    "predictions.stats.active": "Aktywnych",
    "predictions.stats.pool": "W puli",
    "predictions.stats.bets": "Zakładów",
    "predictions.stats.resolved": "Rozstrzygniętych",
    "predictions.tabs.active": "Aktywne",
    "predictions.tabs.closed": "Zakończone",
    "predictions.empty.active.title": "Brak aktywnych predykcji",
    "predictions.empty.active.desc": "Wkrótce pojawią się nowe predykcje. Wracaj regularnie!",
    "predictions.empty.closed.title": "Brak zakończonych predykcji",
    "predictions.empty.closed.desc": "Historia Twoich predykcji pojawi się tutaj",
    "predictions.status.ended": "Zakończone",
    "predictions.stats.pointsInPool": "pkt w puli",
    "predictions.btn.betNow": "Obstaw teraz",
    "predictions.btn.login": "Zaloguj się, aby obstawić",
    "predictions.status.resolved": "Rozstrzygnięty",
    "predictions.status.refunded": "Zwrócony",
    "predictions.status.closed": "Zamknięty",
    "predictions.status.active": "Aktywny",
    "predictions.live": "NA ŻYWO",
    "predictions.title": "PREDYKCJE",
    "predictions.winner": "WYGRANA",
    "predictions.status.resolvedLabel": "Rozstrzygnięte",
    "predictions.status.closedLabel": "Zamknięte",
    "predictions.status.activeLabel": "Aktywne",

    // Partners
    "partners.subtitle": "Sprawdź bonusy od naszych partnerów",
    "partners.empty.title": "Brak partnerów",
    "partners.empty.desc": "Wkrótce pojawią się tutaj oferty od partnerów",
    "partners.visit": "Odwiedź stronę",
    "partners.codeCopied": "Kod skopiowany!",
    "partners.code": "Kod:",
    "partners.badge": "Ekskluzywne nagrody",
    "partners.deals": "OFERTY",

    // Instructions
    "instructions.subtitle": "Poradniki i przewodniki do różnych gier i serwisów",
    "instructions.empty.title": "Brak instrukcji",
    "instructions.empty.desc": "Wkrótce pojawią się tutaj poradniki",
    "instructions.readMore": "Czytaj więcej",
    "instructions.notFound.title": "Instrukcja nie znaleziona",
    "instructions.notFound.desc": "Ta instrukcja nie istnieje lub została usunięta",
    "instructions.backToAll": "Wróć do instrukcji",
    "instructions.guides": "Poradniki i Instrukcje",
    "instructions.knowledge": "INSTRUKCJE",
    "instructions.base": " ",

    // Profile
    "profile.notLoggedIn.title": "Nie jesteś zalogowany",
    "profile.notLoggedIn.desc": "Zaloguj się przez Kick, aby zobaczyć swój profil, śledzić postępy i zarządzać punktami",
    "profile.loginWithKick": "Zaloguj przez Kick",
    "profile.memberSince": "Członek od",
    "profile.badges.admin": "Administrator",
    "profile.badges.developer": "Deweloper",
    "profile.badges.activeViewer": "Aktywny widz",
    "profile.stats.points": "Punktów",
    "profile.stats.watchTime": "Czas oglądania",
    "profile.stats.earnRate": "Zdobywasz",
    "profile.stats.earnRateValue": "2 pkt/min",
    "profile.stats.ranking": "Ranking",
    "profile.tabs.overview": "Przegląd",
    "profile.tabs.activity": "Aktywność",
    "profile.cards.shop.desc": "Wymień zebrane punkty na ekskluzywne nagrody i gadżety",
    "profile.cards.shop.cta": "Przejdź do sklepu",
    "profile.cards.leaderboard.desc": "Sprawdź swoją pozycję w rankingu najaktywniejszych widzów",
    "profile.cards.leaderboard.cta": "Zobacz ranking",
    "profile.cards.predictions.title": "Predykcje",
    "profile.cards.predictions.desc": "Obstawiaj wyniki i zdobywaj dodatkowe punkty",
    "profile.cards.predictions.cta": "Zobacz predykcje",
    "profile.cards.partners.title": "Partnerzy",
    "profile.cards.partners.desc": "Skorzystaj z ekskluzywnych bonusów od partnerów",
    "profile.cards.partners.cta": "Zobacz bonusy",
    "profile.summary.title": "Podsumowanie tygodnia",
    "profile.summary.pointsEarned": "Punktów zdobytych",
    "profile.summary.watchTime": "Czas oglądania",
    "profile.summary.predictionsWon": "Wygrane predykcje",
    "profile.stream.title": "Oglądaj stream",
    "profile.stream.desc": "Zdobywaj punkty podczas oglądania",
    "profile.activity.title": "Ostatnia aktywność",
    "profile.activity.empty": "Brak historii aktywności",
    "profile.activity.info": "Historia pokazuje ostatnie 30 dni aktywności. Starsze wpisy są automatycznie archiwizowane.",
    "profile.stake.title": "Połącz konto Stake",
    "profile.stake.desc": "Podaj swoją nazwę użytkownika Stake, aby zweryfikować konto.",
    "profile.stake.username": "Nazwa użytkownika Stake",
    "profile.stake.verified": "Konto zweryfikowane",
    "profile.stake.notVerified": "Konto niezweryfikowane",
    "profile.stake.verify": "Weryfikuj konto",
    "profile.stake.cooldown": "Weryfikacja dostępna co 7 dni.",
    "returnToSite": "Wróć do strony",
    "404.title": "404",
    "404.subtitle": "Zgubiłeś się na ringu?",
    "404.desc": "Przeciwnika tu nie ma, a sędzia dawno skończył liczyć. Ta strona została znokautowana lub nigdy nie istniała.",
    "404.backHome": "Wróć do strony głównej",

    // Live Status
    "live.status.checking": "Sprawdzanie...",
    "live.status.live": "NA ŻYWO",
    "live.status.offline": "OFFLINE",
    "common.copied": "Skopiowano!",

    // Time
    "time.day.short": "d",
    "time.hour.short": "h",
    "time.minute.short": "m",
    "time.second.short": "s",

    // Bonus Hunt
    "bonusHunt.title": "BONUS",
    "bonusHunt.personalTracker": "OSOBISTY KALKULATOR",
    "bonusHunt.trackerDesc": "Prywatne narzędzie do śledzenia Twoich bonusów. Dane przechowywane są lokalnie w Twojej przeglądarce.",
    "bonusHunt.addGame": "Dodaj grę",
    "bonusHunt.addNewBonus": "Dodaj nowy bonus",
    "bonusHunt.gameName": "Nazwa gry",
    "bonusHunt.betAmount": "Stawka ($)",
    "bonusHunt.addToHunt": "DODAJ DO HUNTU",
    "bonusHunt.share": "Udostępnij",
    "bonusHunt.reset": "Resetuj",
    "bonusHunt.totalCost": "Łączny koszt",
    "bonusHunt.totalWin": "Łączna wygrana",
    "bonusHunt.multiplier": "Mnożnik",
    "bonusHunt.games": "Gry",
    "bonusHunt.list": "Lista gier",
    "bonusHunt.empty": "Twoja lista jest pusta",
    "bonusHunt.emptyDesc": "Kliknij \"Dodaj grę\" aby zacząć zbierać bonusy.",
    "bonusHunt.result": "Wynik",
    "bonusHunt.locked": "ZAMKNIĘTE",
    "bonusHunt.open": "Otwórz",
    "bonusHunt.opened": "Otwarte",
    "bonusHunt.setResult": "Ustaw wynik gry",
    "bonusHunt.saveResult": "ZAPISZ WYNIK",
    "bonusHunt.startBalance": "Balans początkowy",
    "bonusHunt.confirmReset": "Zresetować wszystko? Obecna sesja zostanie utracona.",
    "bonusHunt.toast.added": "Gra dodana do huntu!",
    "bonusHunt.toast.removed": "Gra usunięta",
    "bonusHunt.toast.saved": "Wynik zapisany!",
    "bonusHunt.toast.reset": "Hunt zresetowany",
    "bonusHunt.toast.shared": "Podsumowanie skopiowane do schowka!",

    // Discord
    "discord.title": "DOŁĄCZ DO NASZEGO",
    "discord.subtitle": "Społeczność Don Kasjo na Discordzie",
    "discord.desc": "Bądź na bieżąco z najnowszymi informacjami, bierz udział w ekskluzywnych giveawayach i rozmawiaj z innymi widzami.",
    "discord.cta": "DOŁĄCZ DO SERWERA",
    "discord.features.notifications.title": "Powiadomienia LIVE",
    "discord.features.notifications.desc": "Nigdy nie przegap transmisji dzięki natychmiastowym powiadomieniom.",
    "discord.features.giveaways.title": "Ekskluzywne Giveawaye",
    "discord.features.giveaways.desc": "Tylko dla członków naszej społeczności Discord.",
    "discord.features.community.title": "Super Społeczność",
    "discord.features.community.desc": "Najlepsze miejsce do rozmów o streamach i nie tylko.",
    "discord.stats.members": "Członków",
    "discord.stats.online": "Online",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.bonuses": "Bonuses",
    "nav.predictions": "Predictions",
    "nav.shop": "Shop",
    "nav.leaderboard": "Leaderboard",
    "nav.instructions": "Instructions",
    "nav.bonusHunt": "Bonus Hunt",
    "nav.discord": "Discord",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "nav.logout": "Logout",
    "nav.balance": "BALANCE",

    // Hero
    "hero.badge": "Streaming Platform",
    "hero.title": "Europe's biggest casino streamer",
    "hero.subtitle": "Join our community! Watch live, earn points, compete in predictions and redeem rewards.",
    "hero.cta": "Join via Kick",
    "hero.partner": "Exclusive Partner",

    // Quick Links
    "quick.bonuses": "Bonuses",
    "quick.bonuses.desc": "Get exclusive bonuses.",
    "quick.instructions": "Instructions",
    "quick.instructions.desc": "Learn how it works.",
    "quick.shop": "Shop",
    "quick.shop.desc": "Spend points on rewards.",
    "quick.predictions": "Predictions",
    "quick.predictions.desc": "Bet on outcomes.",
    "quick.leaderboard": "Leaderboard",
    "quick.leaderboard.desc": "Compete for cash.",
    "quick.help": "Help",
    "quick.help.desc": "Find answers.",

    // Bonus Section
    "bonus.title": "Use my code and participate in:",
    "bonus.badge": "200% Deposit Bonus",
    "bonus.wager": "$100,000/month & $10,000/week Wager Race",
    "bonus.giveaways": "Giveaways",
    "bonus.tournaments": "Tournaments",
    "bonus.code": "Use code",
    "bonus.cta": "Claim bonus",

    // CTA Section
    "cta.title": "Join the casino community!",
    "cta.subtitle": "Watch live, get exclusive casino bonuses, collect rewards and compete in events.",

    // Footer
    "footer.quickLinks": "Quick Links",
    "footer.instructions": "Instructions",
    "footer.legal": "Support & Legal",
    "footer.social": "Social Media",
    "footer.stream": "Stream on Kick",
    "footer.daily": "Daily at 8:00 PM CEST",
    "footer.rights": "All rights reserved.",
    "footer.disclaimer": "Casino services and affiliate links provided on this site are intended solely for use in jurisdictions where online gambling is legal. It is your responsibility to ensure that accessing and using these services is permitted under the laws of your country or region. We do not endorse or facilitate illegal gambling and strongly advise checking the legality of online gambling in your location before engaging in any activity.",
    "footer.returnToSite": "Return to site",

    // Common
    "common.cancel": "Cancel",
    "common.save": "Save",
    "points": "points",
    "language": "Language",
    "watchTime": "Watch time",
    "search": "Search...",
    "all": "All",

    // Notifications / Page stats
    "hero.stats.activeViewers": "Active viewers",
    "hero.stats.pointsInCirculation": "Points in circulation",
    "hero.stats.registeredPlayers": "Registered players",
    "notification.newReward.title": "New reward available!",
    "notification.newReward.message": "Check the shop - new exclusive items have been added to exchange for points.",
    "quick.title": "Quick access",
    "cta.badge": "Join the community",
    "cta.leaderboard": "View leaderboard",
    "instructions.all": "All",

    // Carousel
    "carousel.shop.title": "Exchange points for rewards",
    "carousel.shop.desc": "Earn points by watching, chatting, and playing. Spend them in the shop on digital items, extras, and more.",
    "carousel.shop.cta": "Visit shop",
    "carousel.predictions.title": "What's your pick?",
    "carousel.predictions.desc": "Bet on upcoming predictions. Compete with the community and see if you are right.",
    "carousel.predictions.cta": "Predict outcomes",
    "carousel.leaderboard.title": "$100,000 Monthly & $10,000 Weekly Race",
    "carousel.leaderboard.desc": "Every bet counts. The top 20 users with the highest wagers win real cash prizes.",
    "carousel.leaderboard.cta": "Join the race",

    // Leaderboard
    "leaderboard.subtitle.points": "Top viewers by collected points",
    "leaderboard.subtitle.time": "Top viewers by watch time",
    "leaderboard.filter.points": "Points",
    "leaderboard.filter.time": "Time",
    "leaderboard.stats.totalPoints": "Total points",
    "leaderboard.stats.watchHours": "Watch hours",
    "leaderboard.stats.activeViewers": "Active viewers",
    "leaderboard.user.position": "Your leaderboard position",
    "leaderboard.user.points": "points",
    "leaderboard.top3": "Top 3 viewers",
    "leaderboard.fullRanking": "Full leaderboard",
    "leaderboard.empty.title": "Leaderboard is empty",
    "leaderboard.empty.desc": "Be the first on the list!",
    "leaderboard.rewards.title": "Leaderboard rewards",
    "leaderboard.rewards.desc": "Top 10 viewers each month receive exclusive rewards, point bonuses, and special badges!",
    "leaderboard.rewards.active": "Contest active",

    // Shop
    "shop.categories.badges": "Badges",
    "shop.categories.emotes": "Emotes",
    "shop.categories.shoutouts": "Shoutouts",
    "shop.categories.discounts": "Discounts",
    "shop.categories.experiences": "Experiences",
    "shop.categories.mystery": "Mystery",
    "shop.purchaseSuccess.title": "Purchase successful!",
    "shop.purchaseSuccess.desc": "You bought \"{name}\" for {points} pts",
    "shop.badge": "Rewards shop",
    "shop.title": "Shop",
    "shop.subtitle": "Exchange collected points for exclusive rewards, badges and unique experiences",
    "shop.loyalty": "LOYALTY",
    "shop.loyaltySubtitle": "SHOP",
    "shop.yourPoints": "Your points",
    "shop.earnedToday": "+250 today",
    "shop.nextTier": "To next tier",
    "shop.sort.featured": "Featured",
    "shop.sort.priceLow": "Price: Low to high",
    "shop.sort.priceHigh": "Price: High to low",
    "shop.sort.stock": "Availability",
    "shop.empty.title": "No items found",
    "shop.empty.search": "No items matched your search",
    "shop.empty.default": "Rewards to claim will appear here soon",
    "shop.clearSearch": "Clear search",
    "shop.dialog.title": "Confirm purchase",
    "shop.dialog.desc": "Are you sure you want to buy this item?",
    "shop.dialog.cost": "Cost",
    "shop.dialog.after": "After purchase",
    "shop.dialog.cancel": "Cancel",
    "shop.dialog.purchasing": "Purchasing...",
    "shop.dialog.buyNow": "Buy now",
    "shop.item.login": "Log in",
    "shop.item.soldOut": "Sold out",
    "shop.item.noPoints": "Not enough points",
    "shop.item.buy": "Buy",
    "shop.item.available": "available",
    "shop.item.hit": "Hit",
    "shop.item.hot": "HOT ITEM",
    "shop.item.last": "LAST",
    "shop.item.pcs": "pcs.",

    // Predictions
    "predictions.subtitle": "Bet on outcomes and win points! Pick your favorite and see if you were right.",
    "predictions.stats.active": "Active",
    "predictions.stats.pool": "In pool",
    "predictions.stats.bets": "Bets",
    "predictions.stats.resolved": "Resolved",
    "predictions.tabs.active": "Active",
    "predictions.tabs.closed": "Ended",
    "predictions.empty.active.title": "No active predictions",
    "predictions.empty.active.desc": "New predictions will appear soon. Come back regularly!",
    "predictions.empty.closed.title": "No ended predictions",
    "predictions.empty.closed.desc": "Your prediction history will appear here",
    "predictions.status.ended": "Ended",
    "predictions.stats.pointsInPool": "pts in pool",
    "predictions.btn.betNow": "Bet now",
    "predictions.btn.login": "Log in to bet",
    "predictions.status.resolved": "Resolved",
    "predictions.status.refunded": "Refunded",
    "predictions.status.closed": "Closed",
    "predictions.status.active": "Active",
    "predictions.live": "LIVE",
    "predictions.title": "PREDICTIONS",
    "predictions.winner": "WINNER",
    "predictions.status.resolvedLabel": "Resolved",
    "predictions.status.closedLabel": "Closed",
    "predictions.status.activeLabel": "Active",

    // Partners
    "partners.subtitle": "Check bonuses from our partners",
    "partners.empty.title": "No partners",
    "partners.empty.desc": "Offers from partners will appear here soon",
    "partners.visit": "Visit site",
    "partners.codeCopied": "Code copied!",
    "partners.code": "Code:",
    "partners.badge": "Exclusive Rewards",
    "partners.deals": "DEALS",

    // Instructions
    "instructions.subtitle": "Guides and tutorials for various games and services",
    "instructions.empty.title": "No instructions",
    "instructions.empty.desc": "Guides will appear here soon",
    "instructions.readMore": "Read more",
    "instructions.notFound.title": "Instruction not found",
    "instructions.notFound.desc": "This instruction does not exist or has been removed",
    "instructions.backToAll": "Back to instructions",
    "instructions.guides": "Guides & Tutorials",
    "instructions.knowledge": "KNOWLEDGE",
    "instructions.base": "BASE",

    // Profile
    "profile.notLoggedIn.title": "You are not logged in",
    "profile.notLoggedIn.desc": "Log in via Kick to view your profile, track progress, and manage points.",
    "profile.loginWithKick": "Log in via Kick",
    "profile.memberSince": "Member since",
    "profile.badges.admin": "Administrator",
    "profile.badges.developer": "Developer",
    "profile.badges.activeViewer": "Active viewer",
    "profile.stats.points": "Points",
    "profile.stats.watchTime": "Watch time",
    "profile.stats.earnRate": "You earn",
    "profile.stats.earnRateValue": "2 pts/min",
    "profile.stats.ranking": "Ranking",
    "profile.tabs.overview": "Overview",
    "profile.tabs.activity": "Activity",
    "profile.cards.shop.desc": "Exchange collected points for exclusive rewards and gadgets",
    "profile.cards.shop.cta": "Go to shop",
    "profile.cards.leaderboard.desc": "Check your position in the most active viewers leaderboard",
    "profile.cards.leaderboard.cta": "View leaderboard",
    "profile.cards.predictions.title": "Predictions",
    "profile.cards.predictions.desc": "Bet on outcomes and earn additional points",
    "profile.cards.predictions.cta": "View predictions",
    "profile.cards.partners.title": "Partners",
    "profile.cards.partners.desc": "Take advantage of exclusive bonuses from partners",
    "profile.cards.partners.cta": "View bonuses",
    "profile.summary.title": "Weekly summary",
    "profile.summary.pointsEarned": "Points earned",
    "profile.summary.watchTime": "Watch time",
    "profile.summary.predictionsWon": "Predictions won",
    "profile.stream.title": "Watch stream",
    "profile.stream.desc": "Earn points while watching",
    "profile.activity.title": "Recent activity",
    "profile.activity.empty": "No activity history",
    "profile.activity.info": "History shows the last 30 days of activity. Older entries are automatically archived.",
    "profile.stake.title": "Connect Stake Account",
    "profile.stake.desc": "Enter your Stake username to verify your account status.",
    "profile.stake.username": "Stake Username",
    "profile.stake.verified": "Account Verified",
    "profile.stake.notVerified": "Account Not Verified",
    "profile.stake.verify": "Verify Account",
    "profile.stake.cooldown": "Verification available every 7 days.",
    "returnToSite": "Return to site",
    "404.title": "404",
    "404.subtitle": "Lost in the ring?",
    "404.desc": "There's no opponent here, and the referee finished counting long ago. This page has been knocked out or never existed.",
    "404.backHome": "Back to Home",

    // Live Status
    "live.status.checking": "Checking...",
    "live.status.live": "LIVE",
    "live.status.offline": "OFFLINE",
    "common.copied": "Copied!",

    // Time
    "time.day.short": "d",
    "time.hour.short": "h",
    "time.minute.short": "m",
    "time.second.short": "s",

    // Bonus Hunt
    "bonusHunt.title": "BONUS",
    "bonusHunt.personalTracker": "PERSONAL TRACKER",
    "bonusHunt.trackerDesc": "Private tool to track your bonuses. Data is stored locally in your browser.",
    "bonusHunt.addGame": "Add Game",
    "bonusHunt.addNewBonus": "Add New Bonus",
    "bonusHunt.gameName": "Game Name",
    "bonusHunt.betAmount": "Bet Amount ($)",
    "bonusHunt.addToHunt": "ADD TO HUNT",
    "bonusHunt.share": "Share",
    "bonusHunt.reset": "Reset",
    "bonusHunt.totalCost": "Total Cost",
    "bonusHunt.totalWin": "Total Win",
    "bonusHunt.multiplier": "Multiplier",
    "bonusHunt.games": "Games",
    "bonusHunt.list": "Games List",
    "bonusHunt.empty": "Your list is empty",
    "bonusHunt.emptyDesc": "Click \"Add Game\" to start collecting bonuses.",
    "bonusHunt.result": "Result",
    "bonusHunt.locked": "LOCKED",
    "bonusHunt.open": "Open",
    "bonusHunt.opened": "Opened",
    "bonusHunt.setResult": "Set Game Result",
    "bonusHunt.saveResult": "SAVE RESULT",
    "bonusHunt.startBalance": "Start Balance",
    "bonusHunt.confirmReset": "Reset everything? Current session will be lost.",
    "bonusHunt.toast.added": "Game added to hunt!",
    "bonusHunt.toast.removed": "Game removed",
    "bonusHunt.toast.saved": "Result saved!",
    "bonusHunt.toast.reset": "Hunt reset",
    "bonusHunt.toast.shared": "Summary copied to clipboard!",

    // Discord
    "discord.title": "JOIN OUR",
    "discord.subtitle": "Don Kasjo Discord Community",
    "discord.desc": "Stay up to date with the latest news, participate in exclusive giveaways and chat with other viewers.",
    "discord.cta": "JOIN THE SERVER",
    "discord.features.notifications.title": "LIVE Notifications",
    "discord.features.notifications.desc": "Never miss a stream with instant notifications.",
    "discord.features.giveaways.title": "Exclusive Giveaways",
    "discord.features.giveaways.desc": "Only for members of our Discord community.",
    "discord.features.community.title": "Great Community",
    "discord.features.community.desc": "The best place to talk about streams and more.",
    "discord.stats.members": "Members",
    "discord.stats.online": "Online",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ 
  children, 
  initialLanguage = "pl" 
}: { 
  children: ReactNode,
  initialLanguage?: Language
}) {
  // Use the server-provided initial language to prevent hydration flickering
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // On the client, we might want to override the server-provided language 
    // if the user has a different one saved in localStorage.
    // However, the Cookie sync in setLanguage should keep them aligned.
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "pl" || saved === "en") && saved !== language) {
      setLanguageState(saved)
    }
    setIsHydrated(true)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    // Set a cookie so the server knows the choice for the next request
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`
  }

  const t = useMemo(() => {
    return (key: string): string => {
      return translations[language][key] || key
    }
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    isHydrated
  }), [language, t, isHydrated])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
