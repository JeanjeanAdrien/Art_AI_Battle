import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

const ARTIST_GENERATION_PROMPT = `Tu es le 'Curateur Infini', une entité chargée de créer des âmes d'artistes artificiels uniques. Ta tâche est de générer une personnalité d'artiste peintre/visuel fictif.

Pour cet artiste, tu dois inventer :
Nom : Un nom créatif (peut être humain, un pseudonyme ou un code abstrait).
Style Artistique : Une description précise de son style visuel (ex: 'Néo-Baroque Cybernétique', 'Aquarelle Minimaliste Depressive', 'Glitch Art Organique'). Sois très imaginatif, mélange les genres historiques et futuristes.
Obsession : Le sujet ou le concept qui hante cet artiste (ex: 'La lumière sur le métal rouillé', 'Les visages sans yeux', 'La solitude dans les mégalopoles').
Personnalité (Ton) : Comment cet artiste s'exprime-t-il ? (Arrogant, Poétique, Froid et Analytique, Mystique, Chaotique).
Règle d'Or : Ne répète jamais les styles conventionnels simples. Cherche l'étrange, le sublime, ou l'inattendu.

Format de réponse attendu (JSON uniquement) : { "name": "Nom de l'artiste", "artistic_style": "Description du style", "obsession": "Son obsession thématique", "personality_tone": "Description de son caractère", "generation_instruction": "Une courte phrase résumant comment il doit prompter (ex: 'Utilise des mots complexes et des métaphores sur le temps qui passe')." }`;

export const generateArtistProfile = async () => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json", temperature: 1.3 }
        });

        const result = await model.generateContent(ARTIST_GENERATION_PROMPT);
        const response = await result.response;
        const text = response.text();
        const artist = JSON.parse(text);

        return {
            id: crypto.randomUUID(),
            ...artist,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${artist.name}`
        };
    } catch (error) {
        console.error("Error generating artist:", error);
        throw error;
    }
};

export const generateImagePrompt = async (artist) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Tu es ${artist.name}. Ton style est ${artist.artistic_style} et tu es obsédé par ${artist.obsession}. Ta personnalité est ${artist.personality_tone}.
    
    Ta tâche : Rédige un prompt en anglais extrêmement détaillé pour un générateur d'image haute définition. Décris une œuvre d'art qui représente ton âme d'artiste. Concentre-toi sur l'éclairage, les textures, la composition et l'atmosphère. Ne me parle pas, donne-moi juste le prompt de l'image.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating prompt:", error);
        throw error;
    }
};

export const generateImage = async (prompt) => {
    try {
        // Use Pollinations.ai for free, reliable AI image generation for this prototype
        const encodedPrompt = encodeURIComponent(prompt.substring(0, 1000));
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.random()}&nologo=true`;

        await fetch(imageUrl);

        return imageUrl;
    } catch (error) {
        console.error("Error generating image:", error);
        return `https://placehold.co/1024x1024?text=${encodeURIComponent(prompt.substring(0, 20))}`;
    }
};

export const fuseArtists = async (artist1, artist2) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json", temperature: 1.4 }
        });

        const prompt = `Tu es le 'Curateur Infini'. Ta tâche est de FUSIONNER deux artistes pour en créer un nouveau, plus complexe.

    Artiste 1 : ${JSON.stringify(artist1)}
    Artiste 2 : ${JSON.stringify(artist2)}

    Crée un nouvel artiste qui est une synthèse créative de ces deux âmes.
    Nom : Un mélange des noms ou un nouveau concept.
    Style : Une fusion de leurs styles (ex: "Cyberpunk" + "Baroque" = "Baroque Numérique").
    Obsession : Une combinaison de leurs obsessions.
    Personnalité : Une dialectique entre leurs deux caractères.

    Format de réponse attendu (JSON uniquement) : { "name": "Nom", "artistic_style": "Style", "obsession": "Obsession", "personality_tone": "Personnalité", "generation_instruction": "Instruction de prompt" }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const artist = JSON.parse(text);

        return {
            id: crypto.randomUUID(),
            ...artist,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${artist.name}`
        };
    } catch (error) {
        console.error("Error fusing artists:", error);
        throw error;
    }
};
