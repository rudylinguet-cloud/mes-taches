// On récupère les éléments de la page dont on a besoin
const formulaire = document.getElementById("formulaire");
const champTache = document.getElementById("champ-tache");
const liste = document.getElementById("liste");

// La liste des tâches, gardée en mémoire
let taches = [];

// Redessine toute la liste à l'écran à partir du tableau "taches"
function afficherTaches() {
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

    li.appendChild(caseACocher);
    li.appendChild(texte);
    liste.appendChild(li);
  }
}

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
