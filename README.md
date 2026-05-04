# Anime Tracker

A modern web application for tracking your anime watching progress.

## Features

- Add and manage anime in your watchlist
- **Search the Jikan API** to find and import real anime data
- Track viewing progress (episodes watched, status)
- Search and filter your anime collection
- View statistics and insights
- Modern, responsive UI
- Installable as a standalone PWA app

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite
- **UI Components**: Lucide icons, shadcn/ui components

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Install as a Standalone App

- On Android: open the app in Chrome, then choose "Add to Home screen" or "Install app."
- On Windows/macOS: open the app in Chrome/Edge, then use "Install Anime Tracker" from the browser menu.
- In production: run `cd client && npm run build`, then `cd .. && npm start`.

This project is configured as a PWA so it can behave like a standalone app on both Android and PC.

## Project Structure

```
anime-tracker/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json
└── README.md        # This file
```
