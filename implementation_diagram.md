# Jal Drishti - Technical Implementation Architecture

## System Overview

This document provides a detailed technical implementation diagram for the Jal Drishti Rural Water Management Platform, showing the complete architecture, data flow, and component relationships.

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React SPA]
        C[Service Worker]
        D[PWA Features]
    end
    
    subgraph "Frontend Application"
        E[React Router]
        F[Authentication Context]
        G[TanStack Query]
        H[UI Components]
        I[Map Components]
        J[Form Components]
    end
    
    subgraph "API Gateway"
        K[Express.js Server]
        L[Middleware Stack]
        M[Authentication]
        N[Rate Limiting]
        O[CORS & Security]
    end
    
    subgraph "Business Logic Layer"
        P[Auth Service]
        Q[Dashboard Service]
        R[Mapping Service]
        S[Prediction Service]
        T[Reporting Service]
        U[Equity Service]
    end
    
    subgraph "Data Access Layer"
        V[Drizzle ORM]
        W[Database Connection Pool]
        X[Query Builder]
        Y[Transaction Manager]
    end
    
    subgraph "Database Layer"
        Z[PostgreSQL]
        AA[Users Table]
        BB[Hamlets Table]
        CC[Water Assets Table]
        DD[Problem Reports Table]
        EE[Predictions Table]
        FF[Quality Tests Table]
        GG[Tasks Table]
        HH[Maintenance Records]
    end
    
    subgraph "External Services"
        II[IMD Weather API]
        JJ[CGWB Groundwater API]
        KK[ISRO Bhuvan Portal]
        LL[GPS Services]
        MM[Email Service]
        NN[SMS Service]
    end
    
    subgraph "AI/ML Services"
        OO[Prediction Engine]
        PP[Random Forest Model]
        QQ[Risk Assessment]
        RR[Trend Analysis]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    
    B --> K
    K --> L
    L --> M
    M --> N
    N --> O
    
    O --> P
    O --> Q
    O --> R
    O --> S
    O --> T
    O --> U
    
    P --> V
    Q --> V
    R --> V
    S --> V
    T --> V
    U --> V
    
    V --> W
    W --> X
    X --> Y
    Y --> Z
    
    Z --> AA
    Z --> BB
    Z --> CC
    Z --> DD
    Z --> EE
    Z --> FF
    Z --> GG
    Z --> HH
    
    S --> II
    S --> JJ
    R --> KK
    I --> LL
    T --> MM
    T --> NN
    
    S --> OO
    OO --> PP
    PP --> QQ
    QQ --> RR
    
    style A fill:#e1f5fe
    style K fill:#f3e5f5
    style Z fill:#e8f5e8
    style OO fill:#fff3e0
```

## Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant R as React App
    participant E as Express Server
    participant D as Database
    participant X as External APIs
    participant A as AI Engine
    
    Note over U,A: Authentication Flow
    U->>B: Access Application
    B->>R: Load React App
    R->>E: Check Authentication
    E->>D: Validate Session
    D-->>E: User Status
    E-->>R: Auth Response
    R-->>B: Render Dashboard
    
    Note over U,A: Problem Reporting Flow
    U->>B: Click Report Problem
    B->>R: Open Report Modal
    R->>B: Request GPS Location
    B-->>R: GPS Coordinates
    U->>B: Fill Report Form
    B->>R: Submit Form
    R->>E: POST /api/problem-reports
    E->>D: Insert Report
    D-->>E: Report Created
    E->>A: Trigger Risk Analysis
    A->>X: Fetch Weather Data
    X-->>A: Weather Information
    A-->>E: Risk Assessment
    E->>D: Update Predictions
    E-->>R: Success Response
    R-->>B: Show Success Message
    
    Note over U,A: Map Data Flow
    U->>B: View Map
    B->>R: Load Map Component
    R->>E: GET /api/water-assets
    E->>D: Query Assets & Hamlets
    D-->>E: Geographic Data
    E-->>R: Asset Data
    R->>B: Render Leaflet Map
    B-->>U: Interactive Map Display
    
    Note over U,A: Prediction Dashboard Flow
    U->>B: Access Predictions
    B->>R: Load AI Dashboard
    R->>E: GET /api/predictions
    E->>D: Query Active Predictions
    D-->>E: Prediction Data
    E->>A: Get Weather Forecast
    A->>X: IMD API Call
    X-->>A: Forecast Data
    A-->>E: Enhanced Predictions
    E-->>R: Prediction Response
    R->>B: Render Charts & Alerts
    B-->>U: Prediction Dashboard
```

## Database Schema Implementation

```mermaid
erDiagram
    USERS {
        int id PK "Primary Key"
        string email UK "Unique Email"
        string password "Hashed Password"
        string firstName "First Name"
        string lastName "Last Name"
        string phone "Phone Number"
        enum role "admin|agent|community"
        string profileImage "Profile Image URL"
        boolean isActive "Account Status"
        timestamp lastLogin "Last Login Time"
        boolean emailVerified "Email Verification"
        boolean phoneVerified "Phone Verification"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
    }
    
    HAMLETS {
        int id PK "Primary Key"
        string name "Hamlet Name"
        string nameHindi "Hindi Name"
        string district "District"
        string state "State"
        string pincode "Postal Code"
        decimal latitude "GPS Latitude"
        decimal longitude "GPS Longitude"
        int population "Population Count"
        int households "Household Count"
        string riskLevel "Risk Assessment"
        string waterCrisisLevel "Crisis Level"
        text description "Description"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
    }
    
    WATER_ASSETS {
        int id PK "Primary Key"
        int hamletId FK "Hamlet Reference"
        string name "Asset Name"
        enum type "handpump|well|borewell|tank|tap|pipeline"
        enum status "functional|non-functional|needs-maintenance|under-repair"
        enum condition "excellent|good|fair|poor|critical"
        decimal latitude "GPS Latitude"
        decimal longitude "GPS Longitude"
        decimal capacity "Capacity"
        string unit "Capacity Unit"
        timestamp installationDate "Installation Date"
        timestamp lastInspection "Last Inspection"
        timestamp nextInspection "Next Inspection"
        jsonb maintenanceHistory "Maintenance Records"
        jsonb photos "Photo URLs"
        text notes "Notes"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
    }
    
    PROBLEM_REPORTS {
        int id PK "Primary Key"
        int userId FK "Reporter"
        int hamletId FK "Location"
        int waterAssetId FK "Related Asset"
        string title "Report Title"
        text description "Description"
        string type "Problem Type"
        enum status "pending|in-progress|resolved|closed"
        enum priority "low|medium|high|critical"
        decimal latitude "GPS Latitude"
        decimal longitude "GPS Longitude"
        jsonb photos "Photo Evidence"
        int assignedTo FK "Assigned Agent"
        int estimatedResolutionTime "Hours"
        int actualResolutionTime "Hours"
        text resolutionNotes "Resolution Notes"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
        timestamp resolvedAt "Resolution Time"
    }
    
    PREDICTIONS {
        int id PK "Primary Key"
        int waterAssetId FK "Asset Reference"
        int hamletId FK "Hamlet Reference"
        string type "Prediction Type"
        decimal probability "Probability 0-100"
        string severity "low|medium|high|critical"
        timestamp predictedDate "Predicted Date"
        enum status "active|resolved|expired"
        decimal confidence "Confidence Score"
        jsonb factors "Contributing Factors"
        text recommendations "Recommendations"
        boolean isActive "Active Status"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
    }
    
    WATER_QUALITY_TESTS {
        int id PK "Primary Key"
        int waterAssetId FK "Asset Reference"
        int testedBy FK "Tester"
        timestamp testDate "Test Date"
        decimal phLevel "pH Level"
        int tdsLevel "TDS in mg/L"
        decimal turbidity "Turbidity"
        decimal chlorineLevel "Chlorine Level"
        decimal nitrateLevel "Nitrate Level"
        decimal fluorideLevel "Fluoride Level"
        decimal arsenicLevel "Arsenic Level"
        decimal ironLevel "Iron Level"
        enum contaminationLevel "safe|moderate|high-risk|unsafe"
        enum overallQuality "safe|moderate|high-risk|unsafe"
        jsonb photos "Test Photos"
        text notes "Test Notes"
        text recommendations "Recommendations"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
    }
    
    TASKS {
        int id PK "Primary Key"
        string title "Task Title"
        text description "Description"
        int assignedTo FK "Assignee"
        int assignedBy FK "Assigner"
        string status "Task Status"
        string priority "Priority Level"
        timestamp dueDate "Due Date"
        timestamp completedAt "Completion Time"
        int relatedReportId FK "Related Report"
        int relatedAssetId FK "Related Asset"
        text notes "Task Notes"
        timestamp createdAt "Creation Time"
        timestamp updatedAt "Last Update"
    }
    
    USERS ||--o{ PROBLEM_REPORTS : creates
    USERS ||--o{ WATER_QUALITY_TESTS : performs
    USERS ||--o{ TASKS : assigned
    HAMLETS ||--o{ WATER_ASSETS : contains
    HAMLETS ||--o{ PROBLEM_REPORTS : located_in
    HAMLETS ||--o{ PREDICTIONS : analyzed_for
    WATER_ASSETS ||--o{ PROBLEM_REPORTS : reported_for
    WATER_ASSETS ||--o{ WATER_QUALITY_TESTS : tested
    WATER_ASSETS ||--o{ PREDICTIONS : predicted_for
    PROBLEM_REPORTS ||--o{ TASKS : generates
```

## API Endpoint Architecture

```mermaid
graph TD
    A[API Root /api] --> B[Authentication Routes /auth]
    A --> C[Dashboard Routes /dashboard]
    A --> D[Mock Data Routes /mocks]
    
    B --> E[POST /register<br/>User Registration]
    B --> F[POST /login<br/>User Authentication]
    B --> G[GET /profile<br/>Get User Profile]
    B --> H[PUT /profile<br/>Update Profile]
    B --> I[PUT /change-password<br/>Change Password]
    B --> J[POST /logout<br/>User Logout]
    
    C --> K[GET /stats<br/>General Statistics]
    C --> L[GET /user-stats<br/>User-specific Stats]
    C --> M[GET /admin-stats<br/>Admin Statistics]
    C --> N[GET /agent-stats<br/>Agent Statistics]
    
    D --> O[GET /hamlets<br/>Hamlet Data]
    D --> P[GET /water-assets<br/>Asset Data]
    D --> Q[GET /problem-reports<br/>Report Data]
    D --> R[GET /predictions<br/>Prediction Data]
    D --> S[GET /water-quality-tests<br/>Quality Test Data]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

## Security Implementation

```mermaid
graph TD
    A[Incoming Request] --> B[CORS Check]
    B --> C[Rate Limiting]
    C --> D[Helmet Security Headers]
    D --> E[Input Validation]
    E --> F{Authentication Required?}
    
    F -->|No| G[Public Endpoint]
    F -->|Yes| H[JWT Token Validation]
    
    H --> I{Token Valid?}
    I -->|No| J[Return 401 Unauthorized]
    I -->|Yes| K{User Active?}
    
    K -->|No| L[Return 401 Inactive]
    K -->|Yes| M{Role Check}
    
    M -->|Insufficient| N[Return 403 Forbidden]
    M -->|Sufficient| O[Process Request]
    
    G --> P[Execute Handler]
    O --> P
    P --> Q[Database Query]
    Q --> R[Response Generation]
    R --> S[Response Headers]
    S --> T[Return Response]
    
    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style M fill:#e8f5e8
    style Q fill:#fff3e0
```

## Frontend Component Architecture

```mermaid
graph TD
    A[App Component] --> B[Router]
    B --> C[Landing Page]
    B --> D[Login Page]
    B --> E[Register Page]
    B --> F[Dashboard Routes]
    
    F --> G[Community Dashboard]
    F --> H[Agent Dashboard]
    F --> I[Admin Dashboard]
    
    G --> J[Problem Report Modal]
    G --> K[Status Tracking]
    G --> L[Basic Map View]
    
    H --> M[Enhanced Mapping]
    H --> N[Water Testing Form]
    H --> O[Asset Management]
    H --> P[Problem Resolution]
    
    I --> Q[AI Prediction Dashboard]
    I --> R[Equity Visualization]
    I --> S[Complete Mapping]
    I --> T[System Analytics]
    
    M --> U[Leaflet Map]
    M --> V[GPS Integration]
    M --> W[QGIS Export]
    M --> X[Satellite Imagery]
    
    Q --> Y[Weather Integration]
    Q --> Z[Risk Assessment]
    Q --> AA[Trend Analysis]
    Q --> BB[Alert System]
    
    R --> CC[Heatmaps]
    R --> DD[Demographics]
    R --> EE[Access Analysis]
    R --> FF[Recommendations]
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style M fill:#e8f5e8
    style Q fill:#fff3e0
    style R fill:#fce4ec
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        A[CloudFlare/AWS ALB]
        B[SSL Termination]
        C[Rate Limiting]
    end
    
    subgraph "Application Layer"
        D[App Server 1]
        E[App Server 2]
        F[App Server N]
        G[PM2 Process Manager]
    end
    
    subgraph "Database Layer"
        H[PostgreSQL Primary]
        I[PostgreSQL Replica 1]
        J[PostgreSQL Replica 2]
        K[Connection Pooler]
    end
    
    subgraph "Cache Layer"
        L[Redis Cluster]
        M[Session Store]
        N[Query Cache]
    end
    
    subgraph "Storage Layer"
        O[AWS S3/Cloud Storage]
        P[Static Assets]
        Q[User Uploads]
        R[Backups]
    end
    
    subgraph "Monitoring Layer"
        S[Application Monitoring]
        T[Database Monitoring]
        U[Error Tracking]
        V[Performance Metrics]
    end
    
    subgraph "External Services"
        W[IMD Weather API]
        X[CGWB Groundwater API]
        Y[ISRO Bhuvan Portal]
        Z[Email Service]
        AA[SMS Service]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    
    D --> G
    E --> G
    F --> G
    
    G --> K
    K --> H
    K --> I
    K --> J
    
    G --> L
    L --> M
    L --> N
    
    G --> O
    O --> P
    O --> Q
    O --> R
    
    G --> S
    H --> T
    G --> U
    G --> V
    
    G --> W
    G --> X
    G --> Y
    G --> Z
    G --> AA
    
    style A fill:#e1f5fe
    style H fill:#e8f5e8
    style L fill:#fff3e0
    style O fill:#f3e5f5
```

## Data Processing Pipeline

```mermaid
graph LR
    A[Raw Data Input] --> B[Data Validation]
    B --> C[Data Transformation]
    C --> D[Data Storage]
    D --> E[Data Processing]
    E --> F[AI Model Training]
    F --> G[Prediction Generation]
    G --> H[Alert Processing]
    H --> I[Notification Dispatch]
    
    subgraph "Data Sources"
        J[GPS Coordinates]
        K[Weather Data]
        L[Water Quality Tests]
        M[Problem Reports]
        N[Asset Maintenance]
    end
    
    subgraph "Processing Steps"
        O[Geographic Analysis]
        P[Temporal Analysis]
        Q[Quality Assessment]
        R[Risk Calculation]
        S[Trend Detection]
    end
    
    subgraph "Output Actions"
        T[Dashboard Updates]
        U[Email Alerts]
        V[SMS Notifications]
        W[Map Updates]
        X[Report Generation]
    end
    
    J --> A
    K --> A
    L --> A
    M --> A
    N --> A
    
    E --> O
    E --> P
    E --> Q
    E --> R
    E --> S
    
    I --> T
    I --> U
    I --> V
    I --> W
    I --> X
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style G fill:#fff3e0
    style I fill:#e8f5e8
```

This comprehensive implementation diagram shows the complete technical architecture of the Jal Drishti platform, including all layers from frontend to database, security implementation, deployment architecture, and data processing pipeline. The system is designed for scalability, security, and maintainability while addressing the four core problems in rural water management.

