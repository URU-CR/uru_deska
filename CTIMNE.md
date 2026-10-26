# Úřední deska ÚRÚ ČR — náhradní řešení pro přechod DESÚ → ÚRÚ

## Co je co

```
deska-admin.html     ← lokální nástroj. Otevřeš dvojklikem, na web NEPATŘÍ.
docs/                ← obsah, který se nahrává na web
  index.html           přehled desky
  detail.html          detail vyvěšení (jedna stránka pro všechny záznamy)
  data.js              ← JEDINÝ soubor, který se při aktualizaci mění
  js/deska.js          datumová logika vyvěšení a sejmutí
  css/deska.css        ← veškerý vzhled; po dodání návrhu se mění jen tady
  logo-uru.svg         logo ÚRÚ (podoba desky po přechodu)
  znak.svg             státní znak (podoba desky do přechodu)
  prilohy/             sem patří PDF dokumenty
```

## Postup

**1. Vytěžení desky DESÚ** (plán: 29. 12. 2026, před začátkem přechodového okna)

Otevři **`https://espis.desu.gov.cz/eDeska/eDeskaAktualni.jsp`** — přímo výpis.
Adresa `/eDeska/` je frameset a zkopíroval by se jen prázdný rám.

Přepni počet záznamů na stránku na 100. V konzoli prohlížeče
(Safari ⌥⌘C, nejdřív napsat `allow pasting`):

```
copy(document.documentElement.outerHTML)
```

Obsah schránky vlož v `deska-admin.html` do kroku 1.

**2. Přílohy**

V kroku 4 klikni na *Stáhnout všechny přílohy z desky*. Prohlížeč se jednou zeptá,
jestli povolit stahování více souborů — povol to. Soubory přistanou ve složce
Stahování; přesuň je do `docs/prilohy/` **beze změny názvu**.

Pak stáhni kontrolní seznam CSV a porovnej, že ve složce nic nechybí.

Rychlejší cesta přes Terminál (vyžaduje důvěryhodný certifikát serveru):

```
cd ~/Documents/deska/docs/prilohy
tail -n +2 ~/Downloads/prilohy-ke-stazeni.csv | while IFS=';' read -r p cj soubor vel url; do
  curl -fsS -o "$soubor" "$url" || echo "NESTÁHLO: $soubor"
done
```

**3. Dokumenty z MMR, MD a MPO**

Krok 2 v administraci. Jako datum vyvěšení se uvádí **původní datum z desky
mateřského úřadu** — jde o pokračování vyvěšení, ne o nové. PDF zkopíruj do
`docs/prilohy/` pod původním názvem.

**4. Export a nasazení**

Krok 4 → *Stáhnout data.js* → nahradit soubor `docs/data.js` → nahrát na web.
Nic jiného se nemění.

## Dvě podoby desky

Deska se sama přepne v okamžiku, který nastavíš v kroku 4 administrace
(výchozí 1. 1. 2027, 00:00):

| | do přechodu | od přechodu |
|---|---|---|
| hlavička | modrý pruh, státní znak, DESÚ | bílý pruh, logo ÚRÚ |
| převzatá vyvěšení (MMR, MD, MPO) | skrytá | zobrazená |
| adresát v detailu, patička | DESÚ | ÚRÚ ČR |

Lze ji proto nasadit **kdykoli předem** — do nastaveného času se tváří jako
deska DESÚ. Pro vyzkoušení podoby ÚRÚ posuň čas do minulosti, pro podobu
DESÚ do budoucna; náhled pod poli rovnou říká, co deska zrovna zobrazuje.

Stránka se sama obnoví o půlnoci a v okamžik přechodu, takže se přepne
i na kiosku, kde zůstává otevřená celé dny.

Názvy úřadů a adresy v patičce jsou v `js/deska.js` na začátku, v `URADY`.

## Co si hlídat

- **Zálohuj.** Rozpracovaný stav drží prohlížeč (localStorage). Tlačítko
  *Stáhnout zálohu (JSON)* dělá soubor, který přežije i vymazání dat prohlížeče.
- **Opakovaný import nepřepíše ruční záznamy.** Záznamy z desky DESÚ se podle ID
  aktualizují, ručně přidané zůstávají.
- **Deska se bude vyprazdňovat.** Dokumenty mizí samy v den, kdy jim uplyne doba
  vyvěšení. Po dvou týdnech jich zbude jen pár — to je správně, ale je dobré to
  čekat.
- **Po obnovení ESPISu** ověř u dokumentů, kterým doba vyvěšení uplynula během
  přechodu, že mají ve spisové službě zapsané správné datum sejmutí.

## Změna vzhledu

Barvy, rozměry a písmo jsou v proměnných na začátku `css/deska.css`.
Rozložení stránky je v `index.html` a `detail.html`, logika v `js/deska.js`
na vzhled nesahá — výměna vizuálu podle návrhu od dodavatele znamená
přepsat CSS, ne přestavovat aplikaci.
