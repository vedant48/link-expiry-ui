# link-expiry-ui

Production-ready frontend for the Temporary Message Sharing API.

## Features

- **Minimal & Calm Design**: Clean, light-themed utility application built with React, TypeScript, and pure Vanilla CSS.
- **Configurable API Endpoint**: Centralized API URL through `VITE_API_BASE_URL`.
- **Predefined Expirations**: Easy selection of 1 hour, 1 day, or 7 days.
- **Protection & Limits**: Optional access limits (max visits), password protection with show/hide controls, and one-time auto-destruction.
- **Clear State Handling**: Dedicated screens for public messages, password unlock forms, 410 expired/exhausted messages, and 404 not found.
- **Fast Copy UX**: Single-click share URL copying with instant visual feedback.
- **Accessible & Responsive**: Keyboard navigable, high-contrast, and optimized across mobile and desktop.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Running NestJS backend (by default on `http://localhost:3000`)

### Installation

```bash
npm install
```

### Configuration

Create or update `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```
