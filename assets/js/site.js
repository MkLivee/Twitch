/* MkLive — petits comportements du site : recherche de commandes et bouton « Copier ». */
(function () {
  'use strict';

  // Recherche dans la liste des commandes
  var champ = document.getElementById('recherche');
  if (champ) {
    var lignes = Array.prototype.slice.call(document.querySelectorAll('.commandes .commande'));
    var message = document.getElementById('aucun');
    champ.addEventListener('input', function () {
      var terme = champ.value.trim().toLowerCase();
      var visibles = 0;
      lignes.forEach(function (ligne) {
        var ok = !terme || ligne.textContent.toLowerCase().indexOf(terme) !== -1;
        ligne.hidden = !ok;
        if (ok) visibles++;
      });
      if (message) message.hidden = visibles !== 0;
    });
  }

  // Filigrane animé : le logo s'écrit, puis repart en boucle (3,8 s d'animation + une pause)
  var filigrane = document.getElementById('filigrane-svg');
  if (filigrane) {
    var CYCLE_MS = 10000;
    var DUREE_S = 3.9;
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dessin = function () {
      try { return filigrane.contentDocument && filigrane.contentDocument.documentElement; } catch (err) { return null; }
    };
    var rejouer = function () {
      var svg = dessin();
      if (svg && svg.setCurrentTime) { svg.setCurrentTime(0); svg.unpauseAnimations(); }
    };
    var lance = false;
    var demarrer = function () {
      var svg = dessin();
      if (lance || !svg || !svg.setCurrentTime) return;
      lance = true;
      if (reduit) { svg.setCurrentTime(DUREE_S); svg.pauseAnimations(); return; }
      rejouer();
      setInterval(rejouer, CYCLE_MS);
    };
    filigrane.addEventListener('load', demarrer);
    if (dessin() && dessin().tagName === 'svg') demarrer();
  }

  // Bouton « Copier »
  document.addEventListener('click', function (e) {
    var bouton = e.target.closest ? e.target.closest('.copier') : null;
    if (!bouton) return;
    var texte = bouton.getAttribute('data-texte') || '';
    var fait = function () {
      var ancien = bouton.textContent;
      bouton.textContent = 'Copié';
      bouton.classList.add('copie');
      setTimeout(function () { bouton.textContent = ancien; bouton.classList.remove('copie'); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(fait, function () {});
    } else {
      var zone = document.createElement('textarea');
      zone.value = texte;
      zone.setAttribute('readonly', '');
      zone.style.position = 'absolute';
      zone.style.left = '-9999px';
      document.body.appendChild(zone);
      zone.select();
      try { document.execCommand('copy'); fait(); } catch (err) { /* rien */ }
      document.body.removeChild(zone);
    }
  });
  // Filtres de la galerie du musée des fails
  var barre = document.querySelector("[data-filtres]");
  if (barre) {
    var boutons = barre.querySelectorAll("[data-filtre]");
    var cartes = document.querySelectorAll(".carte-clip");
    var videFiltre = document.getElementById("vide-filtre");
    var appliquer = function (cle) {
      var visibles = 0;
      Array.prototype.forEach.call(cartes, function (carte) {
        var ok = cle === "tous" || carte.getAttribute("data-categorie") === cle;
        carte.hidden = !ok;
        if (ok) visibles++;
      });
      Array.prototype.forEach.call(boutons, function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === cle ? "true" : "false");
      });
      if (videFiltre) videFiltre.hidden = !(cartes.length > 0 && visibles === 0);
    };
    Array.prototype.forEach.call(boutons, function (b) {
      b.addEventListener("click", function () { appliquer(b.getAttribute("data-filtre")); });
    });
  }
})();
