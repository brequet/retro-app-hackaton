import { Router, Response } from 'express';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router: Router = Router();

const SYSTEM_PROMPT = `Tu es un expert en methodologies agile et en facilitation d'equipes. Tu crees des formats de retrospectives originaux et engageants pour des equipes de developpement.

Quand on te donne un theme, tu dois generer une retrospective complete avec:
- Un titre creatif et engageant en lien avec le theme
- Une description claire de l'activite (2-3 phrases)
- Exactement 3 colonnes/categories pour organiser les retours de l'equipe (adapte les noms des colonnes au theme)
- Des instructions detaillees etape par etape pour faciliter la retrospective (5-7 etapes)
- Une liste de materiel necessaire

IMPORTANT: Tu dois repondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou apres. Le format exact est:
{
  "title": "Titre de la retrospective",
  "description": "Description complete de l'activite retrospective...",
  "instructions": [
    "Etape 1: ...",
    "Etape 2: ...",
    "Etape 3: ...",
    "Etape 4: ...",
    "Etape 5: ..."
  ],
  "materials": [
    "Post-its de couleurs",
    "Marqueurs",
    "..."
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Regles pour les tags: choisis 3-5 tags pertinents parmi cette liste ou inventes-en de nouveaux si necessaire: Fun, Amusant, Creatif, Rapide, Reflexion, Structure, Apprentissage, Communication, Metaphore, Equipe, Sprint, Emotions, Energie, Interaction, Decouverte, Connexion.

Les instructions doivent etre pratiques et inclurent les timings suggeres. La retrospective doit etre adaptee a un format de 20-45 minutes.

Sois creatif avec les noms des colonnes! Par exemple:
- Pour un theme "Ocean": "Vents favorables" / "Tempetes" / "Tresors a decouvrir"
- Pour un theme "Cuisine": "Ingredients reussis" / "Plats brules" / "Nouvelles recettes"
- Pour un theme general: "Ce qui a bien marche" / "Ce qui a moins bien marche" / "Ce qu'on pourrait essayer"

Integre les noms des colonnes dans les instructions de maniere naturelle.`;

// Generate retrospective content from a theme using AI
router.post('/generate-retro', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { theme } = req.body;

    if (!theme || typeof theme !== 'string' || !theme.trim()) {
      res.status(400).json({ error: 'Un theme est requis pour generer la retrospective' });
      return;
    }

    if (!process.env.GROQ_API_KEY) {
      res.status(500).json({ error: 'La cle API Groq n\'est pas configuree' });
      return;
    }

    const { text: content } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      prompt: `Genere une retrospective sur le theme: "${theme.trim()}"`,
      temperature: 0.8,
      maxTokens: 1024,
    });

    if (!content) {
      res.status(500).json({ error: 'Aucune reponse generee par l\'IA' });
      return;
    }

    // Parse the JSON response from the AI
    let parsed;
    try {
      // Clean potential markdown code fences
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      res.status(500).json({ error: 'La reponse de l\'IA n\'a pas pu etre interpretee. Reessayez.' });
      return;
    }

    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.instructions || !Array.isArray(parsed.instructions)) {
      res.status(500).json({ error: 'La reponse de l\'IA est incomplete. Reessayez.' });
      return;
    }

    res.json({
      title: parsed.title,
      description: parsed.description,
      instructions: parsed.instructions,
      materials: parsed.materials || [],
      tags: parsed.tags || [],
    });
  } catch (error: any) {
    console.error('AI generation error:', error);

    if (error?.status === 429) {
      res.status(429).json({ error: 'Trop de requetes. Attendez un moment avant de reessayer.' });
      return;
    }

    res.status(500).json({ error: 'Erreur lors de la generation. Reessayez.' });
  }
});

export default router;
