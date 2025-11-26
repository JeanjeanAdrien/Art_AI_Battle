const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for base64 images

const GALLERY_DIR = path.join(__dirname, 'public', 'gallery');
const DATA_FILE = path.join(__dirname, 'db.json');

// Ensure gallery directory exists
if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

// Load database
let db = { rounds: [] };
if (fs.existsSync(DATA_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        console.error("Error reading db.json:", e);
    }
}

function saveDb() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// Serve static files
app.use('/gallery', express.static(GALLERY_DIR));

// Save a round
app.post('/api/save-round', async (req, res) => {
    const { roundId, artists, winnerId } = req.body;

    if (!roundId || !artists) {
        return res.status(400).json({ error: 'Missing roundId or artists' });
    }

    const roundData = {
        id: roundId,
        timestamp: new Date().toISOString(),
        winnerId,
        artists: []
    };

    for (const artist of artists) {
        const imageFileName = `${roundId}_${artist.id}.png`;
        const imagePath = path.join(GALLERY_DIR, imageFileName);

        let savedImagePath = '';

        if (artist.generatedImage) {
            try {
                if (artist.generatedImage.startsWith('data:image')) {
                    // Handle Base64
                    const base64Data = artist.generatedImage.replace(/^data:image\/\w+;base64,/, "");
                    fs.writeFileSync(imagePath, base64Data, 'base64');
                    savedImagePath = `/gallery/${imageFileName}`;
                } else if (artist.generatedImage.startsWith('http')) {
                    // Handle URL (Pollinations.ai)
                    const response = await fetch(artist.generatedImage);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(imagePath, buffer);
                    savedImagePath = `/gallery/${imageFileName}`;
                }
            } catch (error) {
                console.error(`Failed to save image for artist ${artist.name}:`, error);
                // Keep original URL if download fails, or set to null
                savedImagePath = artist.generatedImage;
            }
        }

        roundData.artists.push({
            ...artist,
            generatedImage: savedImagePath
        });
    }

    db.rounds.push(roundData);
    saveDb();

    res.json({ success: true, round: roundData });
});

// Get all rounds
app.get('/api/rounds', (req, res) => {
    res.json(db.rounds);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
