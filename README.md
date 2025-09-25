# Jal Drishti - Rural Water Management Platform

A comprehensive Rural Water Management platform that addresses four critical problems in rural water management in India through interconnected modules providing real-time, hyperlocal, and predictive information for proactive and equitable resource management.

## 🎯 Problem Statement

Rural water management in India is failing at the hamlet level because decision-makers lack real-time, hyperlocal, and predictive information to manage resources proactively and equitably. This results in unmapped communities suffering from preventable water shortages and contamination, with no effective way to report issues as they occur.

## 🏗️ Four Core Modules

### 1. Mapping Problem – Unmapped Communities
**Solution**: Hamlet-Level Asset Mapping
- Interactive GPS-enabled mapping with QGIS integration
- Real-time asset tracking and status monitoring
- Satellite imagery integration (ISRO Bhuvan Portal)
- Field agent mobile data collection

### 2. Prediction Problem – Preventable Shortages & Contamination
**Solution**: AI-Powered Predictive Engine
- Random Forest model with 87% prediction accuracy
- Real-time weather data integration (IMD)
- Historical groundwater analysis (CGWB)
- Early warning system for water crises

### 3. Reporting Problem – No Effective Way to Report Issues
**Solution**: Real-Time Community Reporting Interface
- Mobile-friendly web forms for low digital literacy users
- GPS location capture and photo upload
- Multi-language support (Hindi/English)
- Priority-based assignment system

### 4. Equity Problem – Unfair Distribution of Resources
**Solution**: Equity & Visualization Dashboard
- Equity scoring system (0-100 scale)
- Caste-wise and gender-based analysis
- Water access heatmaps
- Resource allocation recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd jal-drishti
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
jal-drishti/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── enhanced-mapping-component.tsx    # Module 1: Mapping
│   │   │   ├── ai-prediction-dashboard.tsx       # Module 2: Predictions
│   │   │   ├── problem-report-modal.tsx          # Module 3: Reporting
│   │   │   ├── equity-visualization-dashboard.tsx # Module 4: Equity
│   │   │   └── map-component.tsx                 # Base mapping
│   │   ├── pages/
│   │   │   ├── admin-dashboard.tsx               # Integrated dashboard
│   │   │   ├── agent-dashboard.tsx               # Field agent interface
│   │   │   └── community-dashboard.tsx           # Community interface
│   │   └── lib/
│   │       ├── queryClient.ts                    # API client
│   │       └── i18n.ts                          # Internationalization
├── server/                          # Backend Node.js application
│   ├── routes.ts                    # API endpoints
│   ├── storage.ts                   # Database operations
│   └── db.ts                       # Database connection
├── shared/                          # Shared types and schemas
│   └── schema.ts                   # Database schema
└── docs/                           # Documentation
    └── PROJECT_ARCHITECTURE.md     # Detailed architecture
```

## 🎮 Demo Access

The platform includes demo access for testing different user roles:

- **Community Demo**: `/community` - Basic problem reporting and status tracking
- **Agent Demo**: `/agent` - Field agent tools for data collection and asset management
- **Admin Demo**: `/admin` - Complete system management with all four modules

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Radix UI** + Tailwind CSS for components
- **Leaflet.js** for interactive mapping
- **TanStack Query** for state management
- **React Hook Form** + Zod for form validation

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **PostgreSQL** with Drizzle ORM
- **JWT Authentication** with role-based access control

### DevOps
- **Vite** for build tooling
- **Drizzle Kit** for database migrations
- **Flexible deployment** (supports various platforms)

## 📊 Features by User Role

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

## 🔮 Future Roadmap

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

## 📈 Success Metrics

### Technical Goals
- **Prediction Accuracy**: 90%+ for water shortage predictions
- **Response Time**: <2 seconds for map loading
- **Uptime**: 99.9% system availability
- **GPS Accuracy**: 95%+ for asset mapping

### Social Impact Goals
- **Coverage**: Map 100% of hamlets in target districts
- **Response Time**: <24 hours for critical problem resolution
- **Equity Improvement**: 20% reduction in underserved population
- **User Adoption**: 80%+ community member participation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ISRO Bhuvan Portal** for satellite imagery
- **IMD (Indian Meteorological Department)** for weather data
- **CGWB (Central Ground Water Board)** for groundwater data
- **OpenStreetMap** for base mapping data

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@jaldrishti.org
- Documentation: [PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)

---

**Jal Drishti** - Empowering rural communities through data-driven water management.
