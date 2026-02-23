# FlashLearn AI-Powered Flashcard App

## Project Overview & Vision

FlashLearn is designed to make studying engaging and efficient by combining AI automation with gamified learning mechanics. It aims to revolutionize how students learn and retain information by providing intelligent tools for creating and studying flashcards.

## Key Features

- **AI-Generated Flashcards:** Leverage the power of the OpenAI API to automatically generate flashcards from your input, saving you time and effort.
- **Structured JSON Output:** AI-generated content is provided in a structured JSON format for seamless integration and storage.
- **Deck Creation & Management:** Organize your study material into custom decks for efficient learning.
- **Manual & AI Flashcard Creation:** Create flashcards manually or let AI assist you in generating them.
- **Study Mode:** Engage in an interactive study session that tracks your correct and incorrect answers.
- **Progress Tracking:** Monitor your learning journey with mastery levels and study streaks.
- **User Authentication:** Securely manage your decks and progress with user accounts powered by Supabase.

_Note: Adaptive scheduling and personalization features are planned for future development._

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Radix UI components, Lucide React, Recharts, React Hook Form, Embla Carousel, Sonner, Vaul, Next-themes, and more.
- **Backend:** Supabase (for Authentication and PostgreSQL database).
- **AI Integration:** OpenAI API for intelligent flashcard generation.
- **Build Tool:** Vite.

## Architecture

FlashLearn utilizes a modern frontend architecture built with React and Vite. User data, authentication, and deck information are managed via Supabase, providing a robust and scalable backend solution. AI-powered flashcard generation is handled through direct integration with the OpenAI API.

## Design References

For design decisions on colors, typography, and components, please refer to the internal design guidelines: [Design Guidelines](./src/guidelines/Guidelines.md).

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed.

### Installation

```bash
npm install
# or
yarn install
```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

This will typically start the application at `http://localhost:5173`.

### Build

To create a production build:

```bash
npm run build
# or
yarn build
```

This command compiles the application and outputs the static assets to the `dist` (or `build`) directory.

## Contributing

We welcome contributions to FlashLearn! Please follow these guidelines:

- **Use TypeScript strictly.**
- **Develop modular React components.**
- **Use feature branches for new development.**
- **Submit clean Pull Requests (PRs).**
- **Write clear and concise commit messages.**

## License

This project is licensed under the MIT License.
