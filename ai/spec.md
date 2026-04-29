# ed-starter1 — spec / handoff

## Cel bieżącej pracy

Dodać sortowanie po kolumnach w publicznym widoku FIDS `FlightBoard` dla czasu odlotu, terminala i statusu. Sortowanie ma działać po stronie klienta, po zastosowaniu istniejących filtrów, bez zmian w API i bez modyfikowania danych lotów.

## Aktualny stan

Sortowanie zostało zaimplementowane. Nagłówki `Time`, `Term.` i `Status` są klikalne i przełączają stan w cyklu `asc -> desc -> off`. Domyślny widok pozostaje niesortowany, czyli zachowuje kolejność danych otrzymanych z `initialFlights`. Worktree zawiera też zmiany config/docs niezwiązane z tą implementacją.

## Decyzje techniczne

- Stan sortowania trzymany jest w Zustand razem z filtrami i listą lotów.
- Widoczna lista lotów jest wyliczana w selektorze `selectVisibleFlights`: najpierw filtrowanie, potem stabilne sortowanie kopii wyników.
- Kliknięcie innej kolumny zaczyna sortowanie od kierunku rosnącego.
- Kolejność statusów bazuje na `ALL_STATUSES`: `On Time`, `Boarding`, `Departed`, `Delayed`, `Cancelled`; kierunek malejący odwraca tę kolejność.
- Kolejność terminali bazuje na `ALL_TERMINALS`.
- Sortowanie po czasie używa wartości `departureTime` w formacie `HH:MM`.
- Dla kompatybilności pozostawiono alias `selectFilteredFlights = selectVisibleFlights`.

## Zmienione pliki

- `store/flightsStore.ts` — dodany typ i stan sortowania, akcja `toggleSort`, porównywanie lotów i selektor `selectVisibleFlights`.
- `components/fids/FlightBoard.tsx` — nagłówki `Time`, `Term.` i `Status` zamienione na przyciski sortowania z wizualnym wskaźnikiem kierunku i `aria-sort`.
- `ai/spec.md` — aktualny handoff/spec tej pracy.
- Poza zakresem sortowania w worktree są też: `.codex/config.toml`, `AGENTS.md`, `next-env.d.ts`, `.codex/config-kopia.toml`, `.codex/hooks/`, `app/api/flights/stats/`.

## Testy / quality gates

- `npm run typecheck` — passed.
- `npm run lint` — passed z jednym istniejącym, niezwiązanym ostrzeżeniem w `app/admin/page.tsx` dotyczącym użycia `<a>` zamiast `next/link`.
- `npm run dev` — serwer uruchomiony na `http://localhost:3000`.
- `curl -I http://localhost:3000` — returned `200 OK`.

## Ryzyka

- Nie wykonano pełnego testu przeglądarkowego kliknięć w UI; potwierdzono kompilację, lint i odpowiedź serwera.
- `aria-sort` jest ustawione na elementach nagłówków opakowujących przyciski, żeby uniknąć ostrzeżenia lint dla roli `button`.
- `next-env.d.ts` zmienił ścieżkę importu po komendach Next.js; to wygląda na zmianę wygenerowaną przez środowisko, nie część funkcjonalna sortowania.
- Zmiany config/docs w worktree mogą wymagać osobnej decyzji przed commitem; nie były częścią implementacji sortowania.

## Następny krok

Manualnie sprawdzić w przeglądarce `http://localhost:3000`, że kliknięcia `Time`, `Term.` i `Status` przechodzą przez `asc -> desc -> off` oraz że sortowanie działa poprawnie razem z filtrami. Przed commitem rozdzielić zmiany sortowania od niezwiązanych zmian config/docs.

## Test-agent update — 2026-04-29

### Cel bieżącej pracy

Sprawdzić aktualny stan zmian i istniejący setup testowy oraz dodać brakujące testy tylko wtedy, gdy repo ma już framework testowy albo da się dodać minimalne testy bez nowych zależności i zmian configu.

### Decyzje

- Nie dodano testów: `package.json` nie ma skryptu `test`, repo nie ma plików `*.test.*` / `*.spec.*`, katalogów testowych ani aktywnej konfiguracji Jest/Vitest/Playwright/Cypress.
- Nie instalowano zależności i nie zmieniano konfiguracji, zgodnie z ograniczeniem pracy wyłącznie w warstwie testów.
- Potencjalne przyszłe testy powinny pokryć `selectVisibleFlights`, cykl `toggleSort` oraz widoczne zachowanie sortowania/`aria-sort` w `FlightBoard`.

### Zmienione pliki

- `ai/spec.md` — dopisany bieżący status testowy.
- Nie zmieniono plików testowych ani produkcyjnych.
- W worktree pozostają istniejące, nietknięte zmiany: `.codex/config.toml`, `AGENTS.md`, `.codex/agents/`, `.codex/hooks/`.

### Testy / quality gates

- `npm run typecheck` — passed.
- `npm run lint` — passed z istniejącym ostrzeżeniem w `app/admin/page.tsx:56` dotyczącym `<a>` zamiast `next/link`.
- `npm test` — failed: brak skryptu `test`.
- `npm ls @playwright/test vitest jest @testing-library/react` — failed/empty: brak aktywnych zależności testowych.

### Ryzyka

- Brak automatycznych testów regresji dla sortowania i filtrowania FIDS.
- Dodanie realnych testów wymaga decyzji o frameworku i najpewniej zmian w zależnościach/skryptach.

### Następny krok

Przed merge uruchomić `npm run typecheck` i `npm run lint`. Jeśli zespół chce testy regresji, najpierw zatwierdzić dodanie frameworka testowego, np. Vitest dla logiki store/selectorów i opcjonalnie Playwright dla ścieżek UI.

## UI redesign update — 2026-04-29

### Cel bieżącej pracy

Znacząco poprawić ekran listy lotów pod kątem UX, czytelności, hierarchii informacji, responsywności i dostępności, bez zmian w API, store ani modelu danych lotów.

### Decyzje projektowe

- Zachowano estetykę operacyjnego FIDS, ale podniesiono kontrast, rytm siatki i wagę najważniejszych informacji.
- Dodano panel podsumowania: liczba widocznych lotów, opóźnione, boarding i aktywny zakres filtrów.
- Dodano sygnał "Next boardable" wyliczany z aktualnie widocznych lotów, bez utrwalania nowych danych.
- Filtry dostały jawne etykiety, większe pola i widoczne focus states.
- Desktop używa gęstej tabeli porównawczej, a mobile osobnych kart z czasem, kierunkiem, terminalem, bramką i statusem.
- Statusy dostały bardziej czytelne badge z kropką statusu i mocniejsze rozróżnienie kolorystyczne.
- Poprawiono animację zmiany statusu w `FlightRow`, usuwając `setState` wykonywany podczas renderu.
- Dodano `prefers-reduced-motion` w globalnych stylach.

### Zmienione pliki

- `components/fids/FlightBoard.tsx` — przebudowany header, podsumowania, filtry, responsive layout listy i empty state.
- `components/fids/FlightRow.tsx` — osobny układ mobile/desktop, lepsza hierarchia informacji i poprawiona animacja statusu.
- `components/fids/StatusBadge.tsx` — nowe warianty wizualne statusów.
- `components/fids/LiveClock.tsx` — dopasowany wygląd zegara do nowego headera.
- `app/globals.css` — odświeżone tokeny kolorów, subtelna tekstura tła i reduced motion.
- `next.config.ts` — jawny `turbopack.root` dla tego projektu.
- `package.json` — `npm run dev` uruchamia Next w trybie webpack, bo Turbopack dev w tym workspace rozwiązywał `tailwindcss` względem katalogu nadrzędnego.
- `ai/spec.md` — aktualny handoff tej zmiany.

### Testy / quality gates

- `npm run typecheck` — passed.
- `npm run lint` — passed z istniejącym ostrzeżeniem w `app/admin/page.tsx:56` dotyczącym użycia `<a>` zamiast `next/link`.
- `npm run build` — passed po uruchomieniu poza sandboxem, wymagane przez lokalne ograniczenia Turbopack/PostCSS dotyczące procesów pomocniczych.
- `npm run dev` — starts at `http://localhost:3000` using webpack mode; `curl -I http://127.0.0.1:3000` returned `200 OK`.

### Ryzyka

- Nie dodano nowych zależności ani testów automatycznych.
- Ekran nadal nie ma danych cenowych/czasu podróży, więc UX wyboru najlepszej oferty opiera się na dostępnych polach: czasie, statusie, terminalu, bramce, linii i kierunku.
- Playwright MCP zwrócił błąd zamkniętego kontekstu przeglądarki, więc automatyczny screenshot nie został wykonany w tej sesji.
