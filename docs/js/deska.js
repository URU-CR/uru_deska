/* Sdílená logika úřední desky.
   -------------------------------------------------------------------------
   Deska má dvě období. Do okamžiku přechodu (window.EDESKA_PRECHOD) vystupuje
   jako deska DESÚ a zobrazuje jen jeho vlastní vyvěšení; od toho okamžiku
   vystupuje jako deska ÚRÚ ČR a přidá i vyvěšení převzatá od MMR, MD a MPO.
   Okamžik přechodu se nastavuje v administraci a zapisuje do data.js.

   Datumová logika běží v prohlížeči, protože obsah desky se po nasazení už
   negeneruje znovu — dokumenty musí ze seznamu zmizet samy v den, kdy jim
   uplyne doba vyvěšení. */
var Deska = (function () {

  /* Obě podoby hlavičky a patičky. Změna názvu nebo adresy se dělá zde. */
  var URADY = {
    desu: {
      nazev: "Dopravní a energetický stavební úřad",
      odkaz: "https://www.desu.gov.cz/",
      adresat: "Dopravní a energetický stavební úřad, Úřední deska, IČO: 19139314",
      adresa: "Dopravní a energetický stavební úřad · nábřeží Ludvíka Svobody 1222/12, 110 00 Praha 1"
    },
    uru: {
      nazev: "Úřad rozvoje území České republiky",
      odkaz: "https://www.uru.gov.cz/",
      adresat: "Úřad rozvoje území České republiky, Úřední deska, IČO: 24858234",
      adresa: "Úřad rozvoje území České republiky · nábřeží Ludvíka Svobody 1222/12, 110 00 Praha 1"
    }
  };

  function okamzikPrechodu() {
    var t = window.EDESKA_PRECHOD;
    if (!t) return null;
    /* Zápis bez časové zóny se záměrně čte jako místní čas. */
    var d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }

  function jePoPrechodu(kdy) {
    var p = okamzikPrechodu();
    if (!p) return true;              // bez nastavení se deska chová jako ÚRÚ
    return (kdy || new Date()) >= p;
  }

  function klicUradu(kdy) { return jePoPrechodu(kdy) ? "uru" : "desu"; }
  function urad(kdy) { return URADY[klicUradu(kdy)]; }

  function dnesIso(kdy) {
    var d = kdy || new Date();
    return d.getFullYear() + "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("0" + d.getDate()).slice(-2);
  }

  function dnesCesky(kdy) {
    var d = kdy || new Date();
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
  }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Dokument se zobrazí, pokud dnešek spadá do intervalu od–do včetně
     a pokud jeho původ odpovídá aktuálnímu období desky. */
  function vyveseneDnes(zaznamy, kIso, kdy) {
    var den = kIso || dnesIso(kdy);
    var prevzataZobrazit = jePoPrechodu(kdy);
    return zaznamy.filter(function (z) {
      if (!prevzataZobrazit && z.puvod && z.puvod !== "DESÚ") return false;
      return (!z.odIso || z.odIso <= den) && (!z.doIso || z.doIso >= den);
    });
  }

  function poradi(a, b) {
    return (b.odIso || "").localeCompare(a.odIso || "") ||
           (a.znacka || "").localeCompare(b.znacka || "");
  }

  function kategorie(zaznamy) {
    var m = {};
    vyveseneDnes(zaznamy).forEach(function (z) { if (z.kategorie) m[z.kategorie] = 1; });
    return Object.keys(m).sort();
  }

  /* Převzatá vyvěšení se označují, aby bylo zřejmé, že jde o pokračování
     vyvěšení zahájeného na desce původního úřadu. */
  function znackaPuvodu(z) {
    if (!z.puvod || z.puvod === "DESÚ") return "";
    return ' <span class="puvod">převzato: ' + esc(z.puvod) + '</span>';
  }

  function najdi(zaznamy, id) {
    for (var i = 0; i < zaznamy.length; i++) {
      if (String(zaznamy[i].id) === String(id)) return zaznamy[i];
    }
    return null;
  }

  /* Na kiosku zůstává stránka otevřená celé dny. Bez hlídání by o půlnoci
     nezmizely dokumenty s uplynulou dobou vyvěšení a v okamžik přechodu by
     se deska nepřepnula.

     Nestačí jeden setTimeout: prohlížeče časovače na neaktivní kartě silně
     zpomalují, takže by se spustil se zpožděním. Proto se stav kontroluje
     opakovaně a navíc vždy, když se stránka vrátí do popředí. */
  function stav(kdy) { return klicUradu(kdy) + "|" + dnesIso(kdy); }

  function hlidejCas(prekresli) {
    var posledni = stav();

    function zkontroluj() {
      var ted = stav();
      if (ted === posledni) return;
      posledni = ted;

      /* Nejdřív překreslit na místě — to nemůže selhat ani bez sítě. */
      document.documentElement.setAttribute("data-urad", klicUradu());
      try { prekresli(); } catch (e) { /* překreslení nesmí shodit hlídání */ }

      /* Teprve pak znovu načíst, aby se zároveň projevila nová data.
         Bez sítě se o to nepokoušíme, kiosek by skončil na chybové stránce. */
      if (navigator.onLine !== false) {
        setTimeout(function () { location.reload(); }, 2000);
      }
    }

    setInterval(zkontroluj, 20000);
    document.addEventListener("visibilitychange", zkontroluj);
    window.addEventListener("focus", zkontroluj);
    window.addEventListener("pageshow", zkontroluj);
  }

  return {
    URADY: URADY, urad: urad, klicUradu: klicUradu,
    jePoPrechodu: jePoPrechodu, okamzikPrechodu: okamzikPrechodu,
    dnesIso: dnesIso, dnesCesky: dnesCesky, esc: esc,
    vyveseneDnes: vyveseneDnes, poradi: poradi,
    kategorie: kategorie, znackaPuvodu: znackaPuvodu, najdi: najdi,
    hlidejCas: hlidejCas
  };
})();
