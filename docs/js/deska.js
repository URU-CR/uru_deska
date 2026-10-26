/* Sdílená logika úřední desky ÚRÚ ČR.
   Datumová logika vyvěšení a sejmutí běží v prohlížeči, protože obsah desky
   se po nasazení už negeneruje znovu — dokumenty musí ze seznamu zmizet samy
   v den, kdy jim uplyne doba vyvěšení. */
var Deska = (function () {

  function dnesIso() {
    var d = new Date();
    return d.getFullYear() + "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("0" + d.getDate()).slice(-2);
  }

  function dnesCesky() {
    var d = new Date();
    return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
  }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Dokument je vyvěšen, pokud dnešek spadá do intervalu od–do včetně.
     Prázdné datum znamená bez omezení na dané straně. */
  function vyveseneDnes(zaznamy, kIso) {
    var den = kIso || dnesIso();
    return zaznamy.filter(function (z) {
      return (!z.odIso || z.odIso <= den) && (!z.doIso || z.doIso >= den);
    });
  }

  function poradi(a, b) {
    return (b.odIso || "").localeCompare(a.odIso || "") ||
           (a.znacka || "").localeCompare(b.znacka || "");
  }

  function kategorie(zaznamy) {
    var m = {};
    zaznamy.forEach(function (z) { if (z.kategorie) m[z.kategorie] = 1; });
    return Object.keys(m).sort();
  }

  /* Dokumenty převzaté od jiného úřadu se označují, aby bylo zřejmé,
     že jde o pokračování vyvěšení zahájeného na desce původního úřadu. */
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

  return {
    dnesIso: dnesIso, dnesCesky: dnesCesky, esc: esc,
    vyveseneDnes: vyveseneDnes, poradi: poradi,
    kategorie: kategorie, znackaPuvodu: znackaPuvodu, najdi: najdi
  };
})();
