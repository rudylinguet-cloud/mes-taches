// On récupère les éléments de la page dont on a besoin
const formulaire = document.getElementById("formulaire");
const champTache = document.getElementById("champ-tache");
const liste = document.getElementById("liste");
const compteur = document.getElementById("compteur");
const boutonEffacerTerminees = document.getElementById("effacer-terminees");

// Le nom sous lequel les tâches sont rangées dans le navigateur
const CLE_STOCKAGE = "mes-taches";

// Récupère les tâches enregistrées dans le navigateur (liste vide s'il n'y en a pas)
function chargerTaches() {
  try {
    const donnees = localStorage.getItem(CLE_STOCKAGE);
    return donnees ? JSON.parse(donnees) : [];
  } catch (erreur) {
    return []; // stockage indisponible ou abîmé : on repart d'une liste vide
  }
}

// Enregistre les tâches dans le navigateur pour les retrouver plus tard
function sauvegarderTaches() {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(taches));
  } catch (erreur) {
    // stockage indisponible (navigation privée...) : l'appli marche quand même
  }
}

// La liste des tâches, gardée en mémoire
let taches = chargerTaches();

// Redessine toute la liste à l'écran à partir du tableau "taches"
// et l'enregistre (elle est appelée après chaque changement)
function afficherTaches() {
  sauvegarderTaches();
  liste.innerHTML = "";

  for (const tache of taches) {
    const li = document.createElement("li");

    // La case à cocher : cochée si la tâche est faite
    const caseACocher = document.createElement("input");
    caseACocher.type = "checkbox";
    caseACocher.checked = tache.faite;
    caseACocher.addEventListener("change", function () {
      tache.faite = caseACocher.checked;
      afficherTaches();
    });

    const texte = document.createElement("span");
    texte.textContent = tache.texte;
    if (tache.faite) {
      texte.classList.add("faite"); // le CSS va barrer le texte
    }

    // Le bouton « Supprimer » : retire cette tâche de la liste
    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.className = "supprimer";
    boutonSupprimer.addEventListener("click", function () {
      taches = taches.filter(function (t) {
        return t !== tache; // on garde toutes les tâches sauf celle-ci
      });
      afficherTaches();
    });

    li.appendChild(caseACocher);
    li.appendChild(texte);
    li.appendChild(boutonSupprimer);
    liste.appendChild(li);
  }

  afficherCompteur();
}

// Affiche combien de tâches ne sont pas encore cochées
function afficherCompteur() {
  const restantes = taches.filter(function (t) {
    return !t.faite;
  }).length;

  if (taches.length === 0) {
    compteur.textContent = ""; // pas de tâche : rien à afficher
  } else if (restantes === 0) {
    compteur.textContent = "Tout est fait !";
  } else if (restantes === 1) {
    compteur.textContent = "1 tâche restante";
  } else {
    compteur.textContent = restantes + " tâches restantes";
  }

  // Le bouton « Effacer les tâches terminées » n'apparaît que s'il y en a
  const terminees = taches.length - restantes;
  boutonEffacerTerminees.hidden = terminees === 0;
}

// Quand on clique sur « Effacer les tâches terminées »
boutonEffacerTerminees.addEventListener("click", function () {
  taches = taches.filter(function (t) {
    return !t.faite; // on garde seulement les tâches pas encore faites
  });
  afficherTaches();
});

// Quand on clique sur « Ajouter » (ou qu'on appuie sur Entrée)
formulaire.addEventListener("submit", function (evenement) {
  evenement.preventDefault(); // empêche la page de se recharger

  const texte = champTache.value.trim();
  if (texte === "") return; // on n'ajoute pas de tâche vide

  taches.push({ texte: texte, faite: false });
  champTache.value = "";
  champTache.focus();

  afficherTaches();
});

// Au chargement de la page : on affiche les tâches retrouvées
afficherTaches();
