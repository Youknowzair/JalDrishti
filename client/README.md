# Jal Drishti - Frontend Only

A modern React-based water management platform built with TypeScript and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Mapbox Token

Create a `.env` file in `client/` with:

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── main.tsx        # App entry point
├── dist/               # Production build output
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── vite.config.ts      # Vite build configuration
```

## ✨ Features

- 🔐 **Client-side Authentication** - No backend required
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Built with Shadcn/ui components
- 🌐 **Multi-language Support** - Hindi/English
- 🗺️ **Interactive Maps** - Leaflet.js integration
- 📊 **Dashboard Views** - Admin, Agent, Community

## 🎯 Available Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/admin` - Admin dashboard
- `/agent` - Field agent dashboard
- `/community` - Community dashboard

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Component library
- **Wouter** - Client-side routing
- **Leaflet.js** - Interactive maps

## 🔧 Development

The application runs entirely in the browser with mock data stored in localStorage. No backend server is required.

## 📦 Build

```bash
npm run build
```

This creates a `dist/` folder with the production-ready application that can be deployed to any static hosting service.

## 🚀 Deployment

Simply upload the contents of the `dist/` folder to any static hosting service like:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server
