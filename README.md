# 🚀 LoyaltyIQ - React Web Application

A modern, unified loyalty platform built with React, TypeScript, and Material-UI that combines frontend, backend, and AI/ML features into a single application.

## ✨ Features

- **🔐 Local Authentication** - No external backend needed
- **💾 Local Data Storage** - Uses browser localStorage
- **🤖 AI/ML Features** - Built-in sentiment analysis
- **🎯 Loyalty Points System** - Track points, transactions, user roles
- **🎨 Beautiful UI** - Modern Material Design interface
- **📱 Responsive Design** - Works on all devices
- **⚡ Fast Performance** - Built with React and TypeScript

## 🏗️ Architecture

This application uses a **unified architecture** where everything runs locally:

- **Frontend**: React with TypeScript and Material-UI
- **Backend**: Local service with authentication and data management
- **Database**: Browser localStorage + in-memory storage
- **AI/ML**: Simple sentiment analysis built into the service
- **No External Dependencies**: Everything works offline

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd loyaltyiq-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Credentials

### Admin User
- **Email**: `admin@loyaltyiq.co.zw`
- **Password**: `admin`
- **Role**: Administrator with full access

### Test User
- **Email**: `cvlised360@gmail.com`
- **Password**: `Cvlised@360`
- **Role**: Regular user with loyalty points

## 🛠️ Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (not recommended)

## 📁 Project Structure

```
loyaltyiq-web/
├── src/
│   ├── components/          # React components
│   │   ├── LoginScreen.tsx  # Authentication screen
│   │   └── Dashboard.tsx    # Main dashboard
│   ├── services/            # Business logic
│   │   └── UnifiedBackendService.ts  # Main service
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Application entry point
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🔧 Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: Material-UI's sx prop system
- **Data Storage**: Browser localStorage + in-memory Maps
- **Authentication**: Local JWT-like tokens
- **Build Tool**: Create React App

## 🎯 Key Components

### LoginScreen
- Beautiful gradient design
- Form validation
- Error handling
- Demo credentials display
- Data reset functionality for testing

### Dashboard
- User welcome section
- Loyalty points display
- Quick action buttons
- Recent transactions list
- Responsive grid layout

### UnifiedBackendService
- Singleton pattern for data consistency
- Local storage management
- User authentication
- Loyalty points tracking
- Transaction history
- AI sentiment analysis

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `build` folder contains static files that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting service

## 🔍 Troubleshooting

### Common Issues

1. **"User not found" error**
   - Click the "Reset Data (Testing)" button
   - Check browser console for debug messages
   - Ensure localStorage is enabled

2. **App not loading**
   - Check browser console for errors
   - Ensure all dependencies are installed
   - Try clearing browser cache

3. **Styling issues**
   - Ensure Material-UI is properly installed
   - Check for CSS conflicts
   - Verify theme configuration

### Debug Mode
Open browser console (F12) to see detailed logging:
- 🔧 Service initialization
- 👥 User management
- 🔐 Authentication
- 💾 Data operations

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced AI/ML features
- [ ] Offline-first capabilities
- [ ] Progressive Web App (PWA)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with external APIs

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review browser console logs
- Open an issue on GitHub

---

**Built with ❤️ using React, TypeScript, and Material-UI**
