import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "@/lib/i18n";
import { Link, useLocation } from "wouter";

export default function Landing() {
  const { t, tBilingual } = useTranslation();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleRegister = () => {
    setLocation("/register");
  };

  // Demo access for showcasing functionality
  const handleDemoAccess = (role: 'community' | 'agent' | 'admin') => {
    // Navigate directly to role-based demo pages
    setLocation(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <i className="fas fa-tint text-primary text-2xl"></i>
              <h1 className="text-xl font-semibold text-gray-900">
                जल संरक्षण | Water Guard
              </h1>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {tBilingual('waterGuard')}
          </h2>
          <h3 className="text-2xl text-gray-600 mb-6">
            Rural Water Management Platform
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Community-driven water resource monitoring, reporting, and management 
            for sustainable rural development.
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-primary hover:bg-blue-700 text-white px-6 py-4 text-lg"
              data-testid="button-login"
            >
              {tBilingual('login')}
            </Button>
            <Button 
              onClick={handleRegister}
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white px-6 py-4 text-lg"
              data-testid="button-register"
            >
              Register | रजिस्टर करें
            </Button>
          </div>
          
          {/* Demo Access Section */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold mb-4 text-center">
              Demo Access | डेमो एक्सेस
            </h4>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button 
                onClick={() => handleDemoAccess('community')}
                variant="outline"
                size="sm"
                data-testid="button-demo-community"
              >
                {tBilingual('community')} Demo
              </Button>
              <Button 
                onClick={() => handleDemoAccess('agent')}
                variant="outline"
                size="sm"
                data-testid="button-demo-agent"
              >
                {tBilingual('agent')} Demo
              </Button>
              <Button 
                onClick={() => handleDemoAccess('admin')}
                variant="outline"
                size="sm"
                data-testid="button-demo-admin"
              >
                {tBilingual('admin')} Demo
              </Button>
            </div>
          </div> */}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="card-elevated hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-error text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">समस्या रिपोर्ट</h3>
              <p className="text-gray-600 mb-2">Problem Reporting</p>
              <p className="text-sm text-gray-500">
                Report water issues quickly with photo and GPS location
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marked-alt text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">मानचित्रण</h3>
              <p className="text-gray-600 mb-2">Asset Mapping</p>
              <p className="text-sm text-gray-500">
                Interactive maps showing all water assets and their status
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-secondary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">भविष्यवाणी</h3>
              <p className="text-gray-600 mb-2">AI Predictions</p>
              <p className="text-sm text-gray-500">
                Early warning system for water shortages and contamination
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Roles */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-2xl font-semibold text-center mb-8">
            उपयोगकर्ता भूमिकाएं | User Roles
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">समुदायिक सदस्य</h4>
              <p className="text-sm text-gray-600">Community Members</p>
              <p className="text-xs text-gray-500 mt-2">
                Report problems, view updates, track status
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-tie text-secondary text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">फील्ड एजेंट</h4>
              <p className="text-sm text-gray-600">Field Agents</p>
              <p className="text-xs text-gray-500 mt-2">
                Collect data, test water quality, maintain assets
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-cog text-purple-600 text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">प्रशासक</h4>
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-xs text-gray-500 mt-2">
                Manage system, analyze data, make decisions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
