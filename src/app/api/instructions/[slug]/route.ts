import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongodb"
import { Instruction } from "@/lib/db/models"

// Mock instructions data for when MongoDB is not configured
const mockInstructions: Record<string, {
  _id: string
  slug: string
  title: string
  shortDescription: string
  content: string
  imageUrl: string
  isPublished: boolean
}> = {
  "jak-zdobywac-punkty": {
    _id: "1",
    slug: "jak-zdobywac-punkty",
    title: "Jak zdobywac punkty",
    shortDescription: "Dowiedz sie jak zdobywac punkty ogladajac transmisje i uczestniczac w aktywnosciach.",
    content: `## Zdobywanie punktow

Punkty mozesz zdobywac na kilka sposobow:

### Ogladanie transmisji
Za kazda minute ogladania transmisji otrzymujesz **1 punkt**. Punkty sa naliczane automatycznie.

### Uczestnictwo w chacie
Aktywne uczestnictwo w chacie moze przyniesc dodatkowe punkty. Moderatorzy moga nagradzac aktywnych uzytkownikow.

### Predykcje
Poprawne przewidywanie wynikow w predykcjach pozwala mnozyc zdobyte punkty.

### Specjalne wydarzenia
Podczas specjalnych wydarzen mozna zdobyc bonusowe punkty.`,
    imageUrl: "",
    isPublished: true,
  },
  "system-nagrod": {
    _id: "2",
    slug: "system-nagrod",
    title: "System nagrod",
    shortDescription: "Poznaj dostepne nagrody i sposob ich wymiany za zebrane punkty.",
    content: `## System nagrod

### Dostepne nagrody
W sklepie znajdziesz rozne nagrody, ktore mozesz wymienic za punkty:

- **Emotikony** - unikalne emotki do uzycia na chacie
- **Odznaki** - specjalne odznaki przy nicku
- **Nagrody fizyczne** - koszulki, kubki i inne gadgety

### Jak wymienic punkty
1. Przejdz do sklepu
2. Wybierz interesujaca Cie nagrode
3. Kliknij "Wymien"
4. Potwierdz transakcje

Punkty zostana odjete z Twojego konta automatycznie.`,
    imageUrl: "",
    isPublished: true,
  },
  "predykcje-poradnik": {
    _id: "3",
    slug: "predykcje-poradnik",
    title: "Predykcje - poradnik",
    shortDescription: "Naucz sie jak uczestniczyc w predykcjach i zwiekszyc swoje szanse na wygrana.",
    content: `## Predykcje

### Czym sa predykcje?
Predykcje to zabawy, w ktorych zgadujesz wynik danego wydarzenia podczas transmisji.

### Jak wziac udzial
1. Poczekaj na ogloszenie predykcji przez streamera
2. Wybierz opcje, ktora Twoim zdaniem wygra
3. Okresl ile punktow chcesz postawic
4. Potwierdz swoj wybor

### Wyniki
Jesli Twoja predykcja okazala sie poprawna, wygrywasz punkty proporcjonalnie do stawki.

### Wskazowki
- Nie stawiaj wszystkich punktow na jedna predykcje
- Obserwuj transmisje, zeby lepiej przewidywac wyniki
- Analizuj poprzednie predykcje`,
    imageUrl: "",
    isPublished: true,
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const db = await connectToDatabase()

    // Return mock data if MongoDB is not configured
    if (!db) {
      const mockInstruction = mockInstructions[slug]
      if (!mockInstruction) {
        return NextResponse.json(
          { error: "Instruction not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({ instruction: mockInstruction })
    }

    const instruction = await Instruction.findOne({
      slug,
      isPublished: true,
    }).lean()

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      instruction: {
        ...instruction,
        _id: instruction._id.toString(),
      },
    })
  } catch (error) {
    console.error("Get instruction error:", error)
    return NextResponse.json(
      { error: "Failed to fetch instruction" },
      { status: 500 }
    )
  }
}
