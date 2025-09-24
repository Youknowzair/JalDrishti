# Jal Drishti - Rural Water Management Platform Analysis

## Project Overview

**Jal Drishti** is a comprehensive Rural Water Management platform that addresses four critical problems in rural water management in India through interconnected modules providing real-time, hyperlocal, and predictive information for proactive and equitable resource management.

## System Architecture Analysis

### Core Problems Solved:
1. **Mapping Problem** - Unmapped Communities
2. **Prediction Problem** - Preventable Shortages & Contamination  
3. **Reporting Problem** - No Effective Way to Report Issues
4. **Equity Problem** - Unfair Distribution of Resources

### Technology Stack:
- **Frontend**: React 18 + TypeScript, Radix UI + Tailwind CSS, Leaflet.js
- **Backend**: Node.js + Express.js, PostgreSQL + Drizzle ORM
- **Authentication**: JWT-based with role-based access control
- **Deployment**: Vite build system, configurable for multiple platforms

## User Flow Diagram

```mermaid
graph TD
    A[User Access] --> B{Authentication}
    B -->|Not Authenticated| C[Landing Page]
    B -->|Authenticated| D{Role Check}
    
    C --> E[Login/Register]
    E --> F[Authentication Process]
    F --> G[JWT Token Generation]
    G --> D
    
    D -->|Community| H[Community Dashboard]
    D -->|Agent| I[Agent Dashboard]
    D -->|Admin| J[Admin Dashboard]
    
    H --> K[Report Problem]
    H --> L[View Status]
    H --> M[Basic Map View]
    
    I --> N[Enhanced Mapping]
    I --> O[Asset Management]
    I --> P[Problem Resolution]
    I --> Q[Water Testing]
    
    J --> R[All Four Modules]
    R --> S[Mapping Module]
    R --> T[Prediction Module]
    R --> U[Reporting Module]
    R --> V[Equity Module]
    
    K --> W[GPS Capture]
    K --> X[Photo Upload]
    K --> Y[Multi-language Form]
    
    N --> Z[QGIS Export]
    N --> AA[Real-time Asset Tracking]
    N --> BB[Satellite Imagery]
    
    T --> CC[AI Predictions]
    T --> DD[Weather Data Integration]
    T --> EE[Risk Assessment]
    
    V --> FF[Equity Scoring]
    V --> GG[Heatmaps]
    V --> HH[Resource Allocation]
```

## System Implementation Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App]
        B[Enhanced Mapping Component]
        C[AI Prediction Dashboard]
        D[Problem Report Modal]
        E[Equity Visualization]
        F[Authentication Context]
        G[TanStack Query Client]
    end
    
    subgraph "Backend Layer"
        H[Express.js Server]
        I[Authentication Middleware]
        J[Role-based Access Control]
        K[Rate Limiting]
        L[API Routes]
    end
    
    subgraph "Database Layer"
        M[PostgreSQL Database]
        N[Users Table]
        O[Hamlets Table]
        P[Water Assets Table]
        Q[Problem Reports Table]
        R[Predictions Table]
        S[Water Quality Tests]
        T[Tasks Table]
    end
    
    subgraph "External Services"
        U[IMD Weather API]
        V[CGWB Groundwater API]
        W[ISRO Bhuvan Portal]
        X[GPS Services]
    end
    
    subgraph "AI/ML Layer"
        Y[Random Forest Model]
        Z[Prediction Engine]
        AA[Risk Assessment]
    end
    
    A --> H
    B --> H
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    
    M --> N
    M --> O
    M --> P
    M --> Q
    M --> R
    M --> S
    M --> T
    
    H --> U
    H --> V
    H --> W
    A --> X
    
    H --> Y
    Y --> Z
    Z --> AA
    
    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style M fill:#e8f5e8
    style Y fill:#fff3e0
```

## Module Integration Flow

```mermaid
graph LR
    subgraph "Module 1: Mapping"
        A1[GPS Data Collection]
        A2[Asset Registration]
        A3[QGIS Export]
        A4[Real-time Updates]
    end
    
    subgraph "Module 2: Prediction"
        B1[Weather Data]
        B2[Historical Analysis]
        B3[AI Model Processing]
        B4[Risk Alerts]
    end
    
    subgraph "Module 3: Reporting"
        C1[Community Reports]
        C2[GPS Location]
        C3[Photo Evidence]
        C4[Status Tracking]
    end
    
    subgraph "Module 4: Equity"
        D1[Census Data]
        D2[Access Analysis]
        D3[Heatmaps]
        D4[Recommendations]
    end
    
    A1 --> B2
    A2 --> B3
    C1 --> A4
    C2 --> A2
    B4 --> D3
    D1 --> A2
    C4 --> D2
    B3 --> C4
    
    style A1 fill:#e3f2fd
    style B1 fill:#f1f8e9
    style C1 fill:#fce4ec
    style D1 fill:#fff8e1
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant E as External APIs
    participant A as AI Engine
    
    U->>F: Access Platform
    F->>B: Authentication Request
    B->>D: Validate User
    D-->>B: User Data
    B-->>F: JWT Token
    
    F->>B: Request Dashboard Data
    B->>D: Query Multiple Tables
    D-->>B: Aggregated Data
    B-->>F: Dashboard Response
    
    U->>F: Report Problem
    F->>F: Capture GPS Location
    F->>B: Submit Report
    B->>D: Store Report
    B->>A: Trigger Analysis
    A->>E: Fetch Weather Data
    E-->>A: Weather Information
    A-->>B: Risk Assessment
    B->>D: Update Predictions
    
    U->>F: View Map
    F->>B: Request Asset Data
    B->>D: Query Assets & Hamlets
    D-->>B: Geographic Data
    B-->>F: Map Data
    F->>F: Render Leaflet Map
```

## Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ PROBLEM_REPORTS : creates
    USERS ||--o{ WATER_QUALITY_TESTS : performs
    USERS ||--o{ TASKS : assigned
    USERS ||--o{ MAINTENANCE_RECORDS : performs
    
    HAMLETS ||--o{ WATER_ASSETS : contains
    HAMLETS ||--o{ PROBLEM_REPORTS : located_in
    HAMLETS ||--o{ PREDICTIONS : analyzed_for
    
    WATER_ASSETS ||--o{ PROBLEM_REPORTS : reported_for
    WATER_ASSETS ||--o{ WATER_QUALITY_TESTS : tested
    WATER_ASSETS ||--o{ PREDICTIONS : predicted_for
    WATER_ASSETS ||--o{ MAINTENANCE_RECORDS : maintained
    
    PROBLEM_REPORTS ||--o{ TASKS : generates
    
    USERS {
        int id PK
        string email UK
        string password
        string firstName
        string lastName
        string role
        boolean isActive
        timestamp createdAt
    }
    
    HAMLETS {
        int id PK
        string name
        string nameHindi
        decimal latitude
        decimal longitude
        int population
        string riskLevel
    }
    
    WATER_ASSETS {
        int id PK
        int hamletId FK
        string name
        string type
        string status
        decimal latitude
        decimal longitude
    }
    
    PROBLEM_REPORTS {
        int id PK
        int userId FK
        int hamletId FK
        int waterAssetId FK
        string title
        string status
        string priority
    }
    
    PREDICTIONS {
        int id PK
        int waterAssetId FK
        int hamletId FK
        string type
        decimal probability
        string severity
    }
```

## Authentication & Authorization Flow

```mermaid
graph TD
    A[User Request] --> B{Has Token?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Validate JWT]
    
    D --> E{Token Valid?}
    E -->|No| F[Return 401 Unauthorized]
    E -->|Yes| G{User Active?}
    
    G -->|No| H[Return 401 Inactive]
    G -->|Yes| I[Extract User Role]
    
    I --> J{Role Check}
    J -->|Community| K[Community Access]
    J -->|Agent| L[Agent Access]
    J -->|Admin| M[Admin Access]
    
    K --> N[Report Problems<br/>View Status<br/>Basic Map]
    L --> O[Asset Management<br/>Problem Resolution<br/>Field Tools]
    M --> P[All Modules<br/>Analytics<br/>System Management]
    
    C --> Q[Login Form]
    Q --> R[Validate Credentials]
    R --> S{Valid?}
    S -->|No| T[Show Error]
    S -->|Yes| U[Generate JWT]
    U --> V[Store Token]
    V --> W[Redirect to Dashboard]
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style J fill:#e8f5e8
    style U fill:#fff3e0
```

## API Endpoints Structure

```mermaid
graph TD
    A[API Root /api] --> B[Authentication /auth]
    A --> C[Dashboard /dashboard]
    A --> D[Mock Data /mocks]
    
    B --> E[POST /register]
    B --> F[POST /login]
    B --> G[GET /profile]
    B --> H[PUT /profile]
    B --> I[PUT /change-password]
    B --> J[POST /logout]
    
    C --> K[GET /stats]
    C --> L[GET /user-stats]
    C --> M[GET /admin-stats]
    C --> N[GET /agent-stats]
    
    D --> O[GET /hamlets]
    D --> P[GET /water-assets]
    D --> Q[GET /problem-reports]
    D --> R[GET /predictions]
    D --> S[GET /water-quality-tests]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[Load Balancer]
        B[App Server 1]
        C[App Server 2]
        D[Database Primary]
        E[Database Replica]
        F[Redis Cache]
        G[CDN]
    end
    
    subgraph "External Services"
        H[IMD API]
        I[CGWB API]
        J[ISRO Bhuvan]
        K[Email Service]
        L[SMS Service]
    end
    
    A --> B
    A --> C
    B --> D
    B --> F
    C --> D
    C --> F
    D --> E
    
    B --> H
    B --> I
    B --> J
    B --> K
    B --> L
    
    G --> A
    
    style A fill:#e1f5fe
    style D fill:#e8f5e8
    style F fill:#fff3e0
    style G fill:#f3e5f5
```

## Key Features by User Role

### Community Members
- ✅ Report water problems with GPS location
- ✅ Track problem resolution status  
- ✅ View basic map of local water assets
- ✅ Multi-language support (Hindi/English)

### Field Agents
- ✅ GPS-enabled asset mapping
- ✅ Water quality testing and recording
- ✅ Problem resolution tracking
- ✅ Mobile-friendly interface for field work

### Administrators
- ✅ Complete system overview with all four modules
- ✅ AI-powered prediction dashboard
- ✅ Equity analysis and heatmaps
- ✅ Resource allocation recommendations
- ✅ Export capabilities for QGIS integration

## Technical Implementation Details

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query for server state, React Context for auth
- **Mapping**: Leaflet.js with custom overlays and GPS integration
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight routing

### Backend Architecture  
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: JWT with role-based access control
- **Security**: Helmet, CORS, rate limiting, input validation
- **API Design**: RESTful with consistent response format

### Database Design
- **Tables**: 8 core tables with proper relationships
- **Enums**: Type-safe enums for status fields
- **Indexes**: Optimized for geographic and temporal queries
- **Relations**: Foreign key constraints with cascade options
- **JSONB**: Flexible storage for photos and metadata

## Success Metrics & KPIs

### Technical Metrics
- **Prediction Accuracy**: Target 90%+ for water shortage predictions
- **Response Time**: <2 seconds for map loading, <5 seconds for reports
- **Uptime**: 99.9% system availability
- **Data Accuracy**: 95%+ GPS accuracy for asset mapping

### Social Impact Metrics
- **Coverage**: Map 100% of hamlets in target districts
- **Response Time**: <24 hours for critical problem resolution
- **Equity Improvement**: 20% reduction in underserved population
- **User Adoption**: 80%+ community member participation

## Future Roadmap

### Short-term (3-6 months)
- [ ] Photo upload functionality
- [ ] Offline support for poor connectivity areas
- [ ] SMS-based reporting
- [ ] Voice input support

### Medium-term (6-12 months)
- [ ] Advanced ML models for better predictions
- [ ] IoT sensor integration
- [ ] Native mobile applications
- [ ] Blockchain for transparent resource tracking

### Long-term (1-2 years)
- [ ] AI chatbot for multilingual support
- [ ] Predictive maintenance systems
- [ ] AI-driven resource optimization
- [ ] Government policy compliance tracking