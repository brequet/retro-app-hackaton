import dotenv from 'dotenv';
dotenv.config();

import db, { initializeDatabase } from './db/database';
import { v4 as uuidv4 } from 'uuid';

initializeDatabase();

const activities = [
  // RETROS
  {
    id: uuidv4(),
    title: 'Starfish',
    type: 'retro',
    duration: '30-45 min',
    duration_min: 30,
    duration_max: 45,
    team_size: '3-10 personnes',
    team_size_min: 3,
    team_size_max: 10,
    tags: ['Réflexion', 'Amélioration', 'Équipe'],
    description:
      "La rétrospective Starfish est un format visuel qui permet à l'équipe d'évaluer ses pratiques selon 5 axes : continuer, plus de, moins de, commencer, arrêter. C'est un excellent moyen de structurer le feedback et d'identifier des actions concrètes.",
    instructions: [
      "Dessinez une étoile de mer à 5 branches sur un tableau blanc ou utilisez un outil digital",
      "Étiquetez chaque branche : Continuer, Plus de, Moins de, Commencer, Arrêter",
      "Donnez 10 minutes à chaque participant pour écrire ses idées sur des post-its",
      "Collez les post-its sur la branche correspondante",
      "Discutez en groupe des thèmes récurrents",
      "Votez pour les 3 actions prioritaires à mettre en place"
    ],
    materials: ['Tableau blanc ou outil digital', 'Post-its de 5 couleurs', 'Marqueurs', 'Timer'],
  },
  {
    id: uuidv4(),
    title: 'Mad Sad Glad',
    type: 'retro',
    duration: '20-30 min',
    duration_min: 20,
    duration_max: 30,
    team_size: '3-15 personnes',
    team_size_min: 3,
    team_size_max: 15,
    tags: ['Émotions', 'Sprint', 'Équipe'],
    description:
      "Mad Sad Glad est une rétrospective émotionnelle qui invite les membres de l'équipe à partager ce qui les a rendus en colère, tristes ou contents durant le sprint. Ce format favorise l'expression des ressentis et renforce la cohésion d'équipe.",
    instructions: [
      "Créez 3 colonnes : Mad (En colère), Sad (Triste), Glad (Content)",
      "Chaque participant écrit ses ressentis sur des post-its (5 minutes)",
      "Tour de table : chacun colle et explique ses post-its",
      "Regroupez les thèmes similaires",
      "Identifiez les actions pour résoudre les points Mad et Sad",
      "Célébrez les points Glad ensemble"
    ],
    materials: ['Post-its de 3 couleurs (rouge, bleu, vert)', 'Marqueurs', 'Tableau à 3 colonnes'],
  },
  {
    id: uuidv4(),
    title: 'Voilier',
    type: 'retro',
    duration: '30-40 min',
    duration_min: 30,
    duration_max: 40,
    team_size: '5-12 personnes',
    team_size_min: 5,
    team_size_max: 12,
    tags: ['Métaphore', 'Obstacles', 'Objectifs'],
    description:
      "La rétrospective du Voilier utilise la métaphore d'un bateau naviguant vers une île. Le vent représente ce qui pousse l'équipe vers ses objectifs, l'ancre ce qui la ralentit, les récifs les risques, et l'île la vision. Un format créatif et engageant.",
    instructions: [
      "Dessinez un voilier sur l'eau avec une île au loin",
      "Ajoutez les éléments : vent (moteurs), ancre (freins), récifs (risques), île (objectifs)",
      "Les participants placent leurs idées sur chaque zone (7 minutes)",
      "Partagez et discutez de chaque zone en commençant par le vent",
      "Identifiez les actions pour lever les ancres et éviter les récifs",
      "Définissez les prochaines étapes vers l'île"
    ],
    materials: ['Grand tableau blanc', 'Post-its de 4 couleurs', 'Marqueurs de couleurs', 'Dessin du voilier'],
  },
  {
    id: uuidv4(),
    title: '4Ls',
    type: 'retro',
    duration: '25-35 min',
    duration_min: 25,
    duration_max: 35,
    team_size: '3-12 personnes',
    team_size_min: 3,
    team_size_max: 12,
    tags: ['Apprentissage', 'Structure', 'Simple'],
    description:
      "La rétrospective 4Ls examine le sprint sous 4 angles : Liked (aimé), Learned (appris), Lacked (manqué), Longed for (souhaité). Ce format simple mais puissant aide l'équipe à identifier ce qui fonctionne et ce qui doit changer.",
    instructions: [
      "Divisez le tableau en 4 quadrants : Liked, Learned, Lacked, Longed for",
      "Expliquez chaque catégorie avec des exemples",
      "Phase d'écriture individuelle (5 minutes)",
      "Chaque participant partage ses post-its quadrant par quadrant",
      "Regroupez les idées similaires et discutez",
      "Définissez 2-3 actions concrètes basées sur Lacked et Longed for"
    ],
    materials: ['Tableau divisé en 4', 'Post-its', 'Marqueurs', 'Timer'],
  },
  {
    id: uuidv4(),
    title: 'Timeline',
    type: 'retro',
    duration: '40-60 min',
    duration_min: 40,
    duration_max: 60,
    team_size: '4-12 personnes',
    team_size_min: 4,
    team_size_max: 12,
    tags: ['Chronologie', 'Détaillé', 'Sprint'],
    description:
      "La rétrospective Timeline retrace chronologiquement les événements du sprint. Chaque participant ajoute les moments clés, positifs et négatifs, sur une frise temporelle. Ce format est idéal pour les sprints chargés ou complexes.",
    instructions: [
      "Tracez une ligne horizontale représentant la durée du sprint",
      "Marquez les dates/jours clés sur la timeline",
      "Chaque participant ajoute les événements marquants (positifs en haut, négatifs en bas)",
      "Parcourez la timeline chronologiquement en discutant",
      "Identifiez les patterns et les moments critiques",
      "Définissez des actions préventives pour le prochain sprint"
    ],
    materials: ['Long tableau blanc ou papier kraft', 'Post-its verts et rouges', 'Marqueurs', 'Calendrier du sprint'],
  },
  {
    id: uuidv4(),
    title: 'Speedboat',
    type: 'retro',
    duration: '30-45 min',
    duration_min: 30,
    duration_max: 45,
    team_size: '5-15 personnes',
    team_size_min: 5,
    team_size_max: 15,
    tags: ['Vitesse', 'Obstacles', 'Objectifs'],
    description:
      "Le Speedboat est similaire au Voilier mais orienté vitesse. Le moteur représente les accélérateurs, l'ancre les freins. L'équipe identifie ce qui accélère ou ralentit sa progression vers ses objectifs.",
    instructions: [
      "Dessinez un speedboat avec un moteur (accélérateurs) et une ancre (freins)",
      "Ajoutez une île représentant l'objectif du prochain sprint",
      "Les participants ajoutent leurs observations (5-7 minutes)",
      "Discutez des moteurs : comment les renforcer",
      "Discutez des ancres : comment les lever",
      "Priorisez 3 actions à mettre en place immédiatement"
    ],
    materials: ['Tableau blanc', 'Post-its verts (moteurs) et rouges (ancres)', 'Marqueurs', 'Gommettes pour le vote'],
  },
  // ICEBREAKERS
  {
    id: uuidv4(),
    title: 'Two Truths and a Lie',
    type: 'icebreaker',
    duration: '10-15 min',
    duration_min: 10,
    duration_max: 15,
    team_size: '4-20 personnes',
    team_size_min: 4,
    team_size_max: 20,
    tags: ['Connaissance', 'Fun', 'Rapide'],
    description:
      "Chaque participant partage 3 affirmations sur lui-même : 2 vraies et 1 fausse. Le groupe doit deviner laquelle est le mensonge. Un classique indémodable pour apprendre à se connaître de manière ludique.",
    instructions: [
      "Expliquez les règles : chacun prépare 2 vérités et 1 mensonge",
      "Donnez 2 minutes de réflexion à chacun",
      "Un premier volontaire présente ses 3 affirmations",
      "Le groupe vote pour identifier le mensonge",
      "Le joueur révèle la réponse et raconte l'anecdote",
      "Passez au participant suivant"
    ],
    materials: ['Aucun matériel nécessaire', 'Optionnel : papier et stylo pour noter'],
  },
  {
    id: uuidv4(),
    title: "Dessin à l'aveugle",
    type: 'icebreaker',
    duration: '15-20 min',
    duration_min: 15,
    duration_max: 20,
    team_size: '6-16 personnes',
    team_size_min: 6,
    team_size_max: 16,
    tags: ['Communication', 'Créatif', 'Amusant'],
    description:
      "En binômes, un participant décrit une image pendant que l'autre dessine sans voir l'original. Cet exercice met en lumière l'importance de la communication claire et crée beaucoup de fous rires.",
    instructions: [
      "Formez des binômes (un descripteur et un dessinateur)",
      "Distribuez une image différente à chaque descripteur (sans que le dessinateur ne voie)",
      "Le descripteur a 3 minutes pour décrire l'image verbalement",
      "Le dessinateur dessine uniquement à partir des instructions verbales",
      "Comparez les dessins avec les originaux",
      "Échangez les rôles et recommencez avec une nouvelle image"
    ],
    materials: ['Images imprimées', 'Feuilles blanches', 'Crayons/stylos', 'Timer'],
  },
  {
    id: uuidv4(),
    title: "Si j'étais...",
    type: 'icebreaker',
    duration: '10-15 min',
    duration_min: 10,
    duration_max: 15,
    team_size: '3-15 personnes',
    team_size_min: 3,
    team_size_max: 15,
    tags: ['Créatif', 'Métaphore', 'Personnel'],
    description:
      "Chaque participant complète des phrases commençant par \"Si j'étais...\" (un animal, un plat, une ville, etc.). Les réponses révèlent la personnalité de chacun de manière créative et détendue.",
    instructions: [
      "Préparez 3-5 catégories : animal, plat, ville, super-pouvoir, époque historique",
      "Chaque participant réfléchit à ses réponses (2 minutes)",
      "Tour de table : chacun partage ses réponses et explique ses choix",
      "Encouragez les questions et les discussions spontanées",
      "Optionnel : votez pour la réponse la plus originale de chaque catégorie"
    ],
    materials: ['Liste des catégories affichée', 'Optionnel : post-its pour écrire les réponses'],
  },
  {
    id: uuidv4(),
    title: 'Speed Networking',
    type: 'icebreaker',
    duration: '20-30 min',
    duration_min: 20,
    duration_max: 30,
    team_size: '8-30 personnes',
    team_size_min: 8,
    team_size_max: 30,
    tags: ['Réseau', 'Énergie', 'Connexion'],
    description:
      "Inspiré du speed dating, les participants se rencontrent en tête-à-tête pendant 2-3 minutes avant de changer de partenaire. Idéal pour les grandes équipes ou les événements de team building.",
    instructions: [
      "Formez deux rangées face à face (ou un cercle intérieur/extérieur)",
      "Affichez une question de conversation au mur ou écran",
      "Lancez le timer : 2-3 minutes par échange",
      "Au signal, la rangée de droite (ou cercle extérieur) se décale d'une place",
      "Changez la question à chaque rotation",
      "Après 5-6 rotations, regroupez tout le monde pour un debrief rapide"
    ],
    materials: ['Timer visible', 'Liste de questions', 'Signal sonore (cloche/gong)', 'Espace suffisant pour circuler'],
  },
  {
    id: uuidv4(),
    title: 'Questions insolites',
    type: 'icebreaker',
    duration: '15-20 min',
    duration_min: 15,
    duration_max: 20,
    team_size: '3-20 personnes',
    team_size_min: 3,
    team_size_max: 20,
    tags: ['Amusant', 'Créatif', 'Réflexion'],
    description:
      "Des questions décalées et inattendues qui sortent des sentiers battus. Exemples : \"Si tu pouvais dîner avec n'importe qui, mort ou vivant, qui choisirais-tu ?\" Parfait pour briser la glace avec humour.",
    instructions: [
      "Préparez une liste de 10-15 questions insolites",
      "Tirez une question au sort (ou utilisez un générateur aléatoire)",
      "Le participant désigné répond à la question",
      "Les autres peuvent poser des questions de suivi",
      "Passez à la question suivante avec un nouveau participant",
      "Continuez jusqu'à ce que chacun ait répondu à au moins une question"
    ],
    materials: ['Liste de questions imprimée ou digitale', 'Optionnel : dé ou outil de tirage au sort', 'Bonne humeur obligatoire !'],
  },
  {
    id: uuidv4(),
    title: 'Bingo Humain',
    type: 'icebreaker',
    duration: '15-25 min',
    duration_min: 15,
    duration_max: 25,
    team_size: '10-50 personnes',
    team_size_min: 10,
    team_size_max: 50,
    tags: ['Interaction', 'Mouvement', 'Découverte'],
    description:
      "Chaque participant reçoit une grille de bingo avec des caractéristiques (\"parle 3 langues\", \"a voyagé en Asie\", etc.). Le but : trouver une personne correspondant à chaque case et la faire signer. Le premier à compléter une ligne gagne !",
    instructions: [
      "Distribuez les grilles de bingo (5x5 cases avec des caractéristiques variées)",
      "Expliquez les règles : trouver une personne par case, obtenir sa signature",
      "Une même personne ne peut signer qu'une seule case par grille",
      "Lancez le timer : 10-15 minutes",
      "Les participants circulent et échangent pour compléter leur grille",
      "Le premier à compléter une ligne (ou la grille entière) crie BINGO !"
    ],
    materials: ['Grilles de bingo imprimées', 'Stylos pour chaque participant', 'Petit prix pour le gagnant', 'Timer'],
  },
];

// Clear only seeded activities (those with no creator) and insert seed data
const deleteStmt = db.prepare('DELETE FROM activities WHERE creator_id IS NULL');
const insertStmt = db.prepare(`
  INSERT INTO activities (id, title, type, duration, duration_min, duration_max, team_size, team_size_min, team_size_max, tags, description, instructions, materials)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  deleteStmt.run();
  for (const activity of activities) {
    insertStmt.run(
      activity.id,
      activity.title,
      activity.type,
      activity.duration,
      activity.duration_min,
      activity.duration_max,
      activity.team_size,
      activity.team_size_min,
      activity.team_size_max,
      JSON.stringify(activity.tags),
      activity.description,
      JSON.stringify(activity.instructions),
      JSON.stringify(activity.materials)
    );
  }
});

seed();
console.log(`Seeded ${activities.length} activities successfully!`);
process.exit(0);
