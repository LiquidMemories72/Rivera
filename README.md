# Mireye Earth Ask API Interface

A sleek, glassmorphism-style web interface for interacting with the [Mireye Earth Ask API](https://docs.mireye.ai/api-reference/ask).

## Features
- **Flexible Location:** Ask questions about specific lat/lng coordinates or natural language addresses.
- **Premium Aesthetics:** Built with a modern, responsive design using Vanilla HTML/CSS/JS and smooth CSS background animations.
- **Secure Setup:** Uses Vite to securely inject API keys via environment variables instead of exposing them directly in the HTML.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your API Key:**
   Create a `.env` file in the root directory and add your Mireye API key:
   ```env
   VITE_MIREYE_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npx vite
   ```

4. Open your browser to the URL provided by Vite (usually `http://localhost:5173`) to view and interact with the application.
