# Art Battle IA 🎨🤖

**Art Battle IA** is an interactive web application where AI-generated artist personas compete to create the most compelling artwork. Powered by **Google Gemini** for creative writing and **Pollinations.ai** for image generation, this app simulates a complete artistic journey from casting to exhibition.

## ✨ Features

### 1. The Casting (Le Casting)
- **AI Personas**: Generates 4 unique, eccentric artist profiles with distinct names, styles, obsessions, and personalities.
- **Veteran Selection**: Swap any generated artist with a "Veteran" from previous battles stored in the library.
- **Soul Fusion**: Select two Veteran artists to fuse their styles and personalities into a completely new entity.

### 2. The Creation (La Création)
- **Prompt Generation**: Each artist "dreams" of an artwork based on their unique personality and style.
- **Visual Feedback**: Watch the artists "type" and conceive their masterpieces in real-time.

### 3. The Vernissage (Le Vernissage)
- **AI Image Generation**: Actual images are generated using the artists' prompts via Pollinations.ai.
- **Blind Voting**: Vote for your favorite artwork without knowing which artist created it.
- **Reveal**: After voting, the artist's identity and the prompt used are revealed.

### 4. The Library (La Bibliothèque)
- **Archives**: Browse past battles and view the generated artworks.
- **Persistence**: All rounds, artists, and images are saved locally on the server.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS (with glassmorphism aesthetic).
- **Backend**: Node.js, Express (for local storage and API).
- **AI**: 
  - **Google Gemini 2.0 Flash**: For generating artist personas and image prompts.
  - **Pollinations.ai**: For generating the actual artwork images.
- **State Management**: Zustand.

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- A Google Gemini API Key.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/JeanjeanAdrien/AI_Artist_Contest.git
    cd AI_Artist_Contest
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Environment Setup**:
    - Create a `.env` file in the root directory.
    - Add your Gemini API Key:
      ```env
      VITE_GEMINI_API_KEY=your_api_key_here
      ```

### Running the App

1.  **Start the Backend Server** (in a separate terminal):
    ```bash
    node server/index.js
    ```
    *The server runs on port 3001.*

2.  **Start the Frontend** (in another terminal):
    ```bash
    npm run dev
    ```
    *The app will be available at http://localhost:5173.*

## 📂 Project Structure

- `/src`: React frontend code.
  - `/components`: UI components for each game phase.
  - `/services`: API integrations (Gemini, Backend).
  - `/store`: Zustand state management.
- `/server`: Node.js Express server.
  - `/public/gallery`: Stores generated images.
  - `db.json`: Stores round metadata.

## 🤝 Contributing

Feel free to fork the project and submit pull requests!

## 📄 License

MIT