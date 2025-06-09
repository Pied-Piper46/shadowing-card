# CLAUDE.md
First of all, please have every conversation with me in Japanese. But in any scripts you will make, English would be better.
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Creates production build 
- **Production server**: `npm run start` - Runs production server
- **Linting**: `npm run lint` - Runs ESLint to check code quality

## Architecture Overview

This is a **shadowing card application** built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It helps users practice English pronunciation through interactive flashcards with audio playback.

### Core Components Structure

- **Main App** (`src/app/page.tsx`): Card carousel with swipe/drag navigation, speech synthesis integration, and complex animation states
- **Card Component** (`src/components/Card.tsx`): Individual flashcard with expandable content, audio controls, and neumorphic design
- **Data Management** (`src/hooks/useScriptGroups.ts`): Dynamic script loading from JSON files organized by groups
- **Speech Integration** (`src/hooks/useSpeechSynthesis.ts`): Browser TTS API wrapper

### Data Architecture

Scripts are organized in a **two-tier system**:
1. **Group metadata** in `src/data/scriptGroups.json` - contains group info and categories
2. **Script content** in `src/data/scripts-by-group/[groupId].json` - actual script data loaded dynamically

Each script contains:
- `englishText`: Primary content for TTS and display
- `japaneseTranslation`: Japanese translation
- `explanation`: Additional context/grammar notes

### Animation & Interaction

Uses **Framer Motion** for complex card stack animations:
- 5-card rendering window with stacked positioning
- Drag-to-navigate with velocity-based thresholds
- Press-and-hold for continuous scrolling
- Expandable cards with scroll detection
- State persistence via localStorage

### Key Technical Features

- **Neumorphic UI**: Custom Tailwind shadows and styling
- **Responsive design**: Mobile-first with touch gestures
- **State management**: React hooks with localStorage persistence
- **Dynamic imports**: Lazy loading of script data by group
- **Accessibility**: ARIA labels and keyboard navigation support

## File Organization

- `src/components/`: Reusable UI components including icons
- `src/hooks/`: Custom React hooks for data and speech
- `src/types/`: TypeScript interfaces for Script and ScriptGroup
- `src/data/`: JSON data files with script groups and content