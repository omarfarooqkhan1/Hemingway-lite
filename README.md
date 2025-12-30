# Hemingway Lite

A minimalist writing application inspired by the Hemingway Editor, designed to help writers focus on clear, readable prose by analyzing text readability and highlighting complex passages.

## Features

- Real-time readability analysis (grade level, word count, character count, reading time)
- Highlighting of complex sentences, passive voice, and adverbs
- Cross-platform desktop application with file open/save capabilities
- Web-based version for browser usage
- Clean, distraction-free writing interface

## Tech Stack

### Desktop Application
- **Electron**: Cross-platform desktop application framework
- **Node.js**: JavaScript runtime environment

### Web Application
- **React**: Frontend library for building user interfaces
- **Vite**: Fast build tool and development server
- **JavaScript/JSX**: Programming language for application logic

### Additional Dependencies
- **text-readability**: Library for readability analysis
- **electron-builder**: Packaging and distribution tool for Electron apps

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hemingway-lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This will start both the React development server and the Electron application simultaneously.

### Production Build

1. Build the web application:
   ```bash
   npm run build
   ```

2. Create the desktop application distribution:
   ```bash
   npm run dist
   ```

## Usage

- Type or paste text into the main editor area
- The application will automatically analyze your text and display readability statistics
- Complex sentences, adverbs, and passive voice will be highlighted for review
- Use the "Open" and "Save" buttons to work with files (desktop version only)

## Project Structure

- `/electron` - Electron main and preload scripts
- `/web` - React application source code
  - `/src` - Main React components and logic
  - `/dist` - Production build output