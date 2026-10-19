// On récupère les éléments de la page dont on a besoin
const formulaire = document.getElementById("formulaire");
const champTache = document.getElementById("champ-tache");
const champEcheance = document.getElementById("champ-echeance");
const champCategorie = document.getElementById("champ-categorie");

// Les catégories possibles : le code enregistré → le nom affiché
const CATEGORIES = {
  maison: "Maison",
  courses: "Courses",
  pro: "Professionnel",
};
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

// La date du jour au format "AAAA-MM-JJ" (le même format que le champ date)
function dateDuJour() {
  const maintenant = new Date();
  const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
  const jour = String(maintenant.getDate()).padStart(2, "0");
  return maintenant.getFullYear() + "-" + mois + "-" + jour;
}

// Renvoie une copie des tâches triée par date d'échéance :
// la plus proche en haut, les tâches sans date à la fin.
// Deux tâches à la même date gardent leur ordre d'ajout.
function trierParEcheance(liste) {
  return liste.slice().sort(function (a, b) {
    if (!a.echeance && !b.echeance) return 0;
    if (!a.echeance) return 1; // a n'a pas de date : elle va après b
    if (!b.echeance) return -1; // b n'a pas de date : elle va après a
    return a.echeance.localeCompare(b.echeance);
  });
}

// Transforme "2026-10-25" en "25/10/2026" pour l'affichage
function formaterDate(date) {
  const morceaux = date.split("-");
  return morceaux[2] + "/" + morceaux[1] + "/" + morceaux[0];
}

// Redessine toute la liste à l'écran à partir du tableau "taches"
// et l'enregistre (elle est appelée après chaque changement)
function afficherTaches() {
  sauvegarderTaches();
  liste.innerHTML = "";

  for (const tache of trierParEcheance(taches)) {
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

    // Le texte et la date sont regroupés : sur un petit écran, la date passe dessous
    const contenu = document.createElement("div");
    contenu.className = "contenu";
    contenu.appendChild(texte);

    // L'étiquette de catégorie, si la tâche en a une
    if (CATEGORIES[tache.categorie]) {
      const categorie = document.createElement("span");
      categorie.className = "categorie categorie-" + tache.categorie; // la couleur vient du CSS
      categorie.textContent = CATEGORIES[tache.categorie];
      contenu.appendChild(categorie);
    }

    // La date d'échéance, si la tâche en a une
    if (tache.echeance) {
      const echeance = document.createElement("span");
      echeance.className = "echeance";
      echeance.textContent = "échéance : " + formaterDate(tache.echeance);

      // En rouge si la date est passée, en orange si c'est aujourd'hui
      // (sauf si la tâche est déjà faite)
      if (!tache.faite && tache.echeance < dateDuJour()) {
        echeance.classList.add("en-retard");
      } else if (!tache.faite && tache.echeance === dateDuJour()) {
        echeance.classList.add("aujourdhui");
      }

      contenu.appendChild(echeance);
    }

    li.appendChild(caseACocher);
    li.appendChild(contenu);
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

  taches.push({
    texte: texte,
    faite: false,
    echeance: champEcheance.value,
    categorie: champCategorie.value,
  });
  champTache.value = "";
  champEcheance.value = "";
  champCategorie.value = "";
  champTache.focus();

  afficherTaches();
});

// Au chargement de la page : on affiche les tâches retrouvées
afficherTaches();
