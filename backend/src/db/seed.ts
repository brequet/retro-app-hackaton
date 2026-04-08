import db from './database';
import { v4 as uuidv4 } from 'uuid';

export function seedDatabaseIfEmpty() {
  // Check if activities table has data
  const count = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number };
  
  if (count.count > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }

  console.log('Seeding database with default activities...');

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
      tags: JSON.stringify(['Réflexion', 'Amélioration', 'Équipe']),
      description:
        "La rétrospective Starfish est un format visuel qui permet à l'équipe d'évaluer ses pratiques selon 5 axes : continuer, plus de, moins de, commencer, arrêter. C'est un excellent moyen de structurer le feedback et d'identifier des actions concrètes.",
      instructions: JSON.stringify([
        "Dessinez une étoile de mer à 5 branches sur un tableau blanc ou utilisez un outil digital",
        "Étiquetez chaque branche : Continuer, Plus de, Moins de, Commencer, Arrêter",
        "Donnez 10 minutes à chaque participant pour écrire ses idées sur des post-its",
        "Collez les post-its sur la branche correspondante",
        "Discutez en groupe des thèmes récurrents",
        "Votez pour les 3 actions prioritaires à mettre en place"
      ]),
      materials: JSON.stringify(['Tableau blanc ou outil digital', 'Post-its de 5 couleurs', 'Marqueurs', 'Timer']),
      is_global: 1,
      creator_id: null,
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
      tags: JSON.stringify(['Émotions', 'Sprint', 'Équipe']),
      description:
        "Mad Sad Glad est une rétrospective émotionnelle qui invite les membres de l'équipe à partager ce qui les a rendus en colère, tristes ou contents durant le sprint. Ce format favorise l'expression des ressentis et renforce la cohésion d'équipe.",
      instructions: JSON.stringify([
        "Créez 3 colonnes : Mad (En colère), Sad (Triste), Glad (Content)",
        "Chaque participant écrit ses ressentis sur des post-its (5 minutes)",
        "Tour de table : chacun colle et explique ses post-its",
        "Groupez les thèmes similaires",
        "Identifiez 2-3 actions pour transformer les Mad/Sad en Glad"
      ]),
      materials: JSON.stringify(['Tableau avec 3 colonnes', 'Post-its', 'Marqueurs']),
      is_global: 1,
      creator_id: null,
    },
    // Add a couple icebreakers
    {
      id: uuidv4(),
      title: 'Deux vérités et un mensonge',
      type: 'icebreaker',
      duration: '10-15 min',
      duration_min: 10,
      duration_max: 15,
      team_size: '3-20 personnes',
      team_size_min: 3,
      team_size_max: 20,
      tags: JSON.stringify(['Fun', 'Découverte', 'Communication']),
      description:
        "Chaque participant partage trois affirmations sur lui-même : deux vraies et une fausse. Les autres doivent deviner laquelle est le mensonge. C'est un excellent moyen de mieux se connaître tout en s'amusant.",
      instructions: JSON.stringify([
        "Chaque participant prépare 3 affirmations personnelles (2 vérités + 1 mensonge)",
        "À tour de rôle, chacun partage ses 3 affirmations",
        "Les autres participants votent pour celle qu'ils pensent être fausse",
        "La personne révèle le mensonge et peut développer les vérités si elle le souhaite"
      ]),
      materials: JSON.stringify(['Aucun matériel nécessaire']),
      is_global: 1,
      creator_id: null,
    },
  ];

  const insertActivity = db.prepare(`
    INSERT INTO activities (
      id, title, type, duration, duration_min, duration_max,
      team_size, team_size_min, team_size_max, tags,
      description, instructions, materials, is_global, creator_id
    ) VALUES (
      @id, @title, @type, @duration, @duration_min, @duration_max,
      @team_size, @team_size_min, @team_size_max, @tags,
      @description, @instructions, @materials, @is_global, @creator_id
    )
  `);

  const insertMany = db.transaction((activities) => {
    for (const activity of activities) {
      insertActivity.run(activity);
    }
  });

  insertMany(activities);
  
  console.log(`Seeded ${activities.length} activities`);
}
