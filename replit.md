# Overview

This is a Rural Water Management Platform designed to solve four critical water-related challenges in rural communities: mapping unmapped hamlets and water assets, providing early warning systems for shortages and contamination, enabling fast issue reporting, and ensuring equitable water distribution. The platform is built as a full-stack web application with role-based access for Community Members, Field Agents, and Administrators, featuring GIS mapping capabilities, multilingual support, and offline functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + Vite**: Modern frontend framework with fast development and build tooling
- **TypeScript**: Type-safe development environment for better code quality
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built component library for consistent, responsive design
- **Wouter**: Lightweight client-side routing for single-page application navigation
- **React Query**: Server state management with caching, synchronization, and background updates

## Backend Architecture
- **Express.js**: Node.js web framework handling HTTP requests and middleware
- **TypeScript**: Type-safe server-side development
- **RESTful API**: Clean API endpoints for all CRUD operations and data access
- **Role-based routing**: Separate endpoints and access control for different user roles

## Data Storage Solutions
- **PostgreSQL with PostGIS**: Primary database with spatial data extensions for geographic information
- **Drizzle ORM**: Type-safe database queries and schema management
- **Neon Database**: Serverless PostgreSQL hosting for scalability
- **IndexedDB**: Client-side storage for offline functionality and data synchronization

## Authentication and Authorization
- **Replit Auth Integration**: OAuth-based authentication system
- **Session Management**: PostgreSQL-backed session storage with connect-pg-simple
- **Role-based Access Control**: Three user roles (community, agent, admin) with different permissions
- **JWT Token Handling**: Secure token-based authentication flow

## GIS and Mapping Features
- **Leaflet.js**: Interactive mapping library for displaying water assets and hamlet locations
- **Spatial Data Support**: PostGIS integration for storing and querying geographic coordinates
- **Real-time Map Updates**: Dynamic marker placement and status visualization

## Offline and PWA Capabilities
- **Progressive Web App**: Service worker implementation for offline functionality
- **Data Synchronization**: Queue-based system for offline data collection and sync
- **IndexedDB Storage**: Local data persistence for forms and reports

## Internationalization
- **Multilingual Support**: Framework for English and Hindi language switching
- **Cultural Adaptation**: Unicode support for Devanagari script and local language preferences

## State Management
- **React Query**: Server state caching and synchronization
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Local State**: React hooks for component-level state management

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with built-in connection pooling
- **PostGIS Extension**: Spatial database capabilities for geographic data storage and queries

## Authentication Services
- **Replit Auth**: OAuth provider for user authentication and profile management
- **Session Storage**: PostgreSQL-based session persistence

## Mapping and GIS
- **Leaflet.js**: Open-source mapping library for interactive maps
- **OpenStreetMap**: Tile provider for map rendering and geographic data

## UI and Styling
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern icon library for consistent iconography

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Monitoring and Error Handling
- **Runtime Error Overlay**: Development-time error reporting
- **Query Client**: Centralized error handling and retry logic for API requests