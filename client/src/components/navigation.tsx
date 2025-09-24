import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  currentRole: 'community' | 'agent' | 'admin';
}

export function Navigation({ currentRole }: NavigationProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const roleConfig = {
    community: {
      title: "समुदाय | Community",
      icon: "fas fa-users",
    },
    agent: {
      title: "एजेंट | Field Agent", 
      icon: "fas fa-user-tie",
    },
    admin: {
      title: "प्रशासक | Admin",
      icon: "fas fa-user-cog",
    },
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-tint text-primary text-2xl"></i>
                <h1 className="text-xl font-semibold text-gray-900">
                  जल संरक्षण | Water Guard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <i className="fas fa-user text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-700" data-testid="text-user-name">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Role Navigation */}
      {!isMobile && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto">
              <Link href="/community">
                <button 
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    currentRole === 'community' || location === '/community'
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  data-testid="nav-community"
                >
                  <i className="fas fa-users mr-2"></i>
                  समुदाय | Community
                </button>
              </Link>
              
              {user?.role === 'agent' || user?.role === 'admin' ? (
                <Link href="/agent">
                  <button 
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      currentRole === 'agent' || location === '/agent'
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    data-testid="nav-agent"
                  >
                    <i className="fas fa-user-tie mr-2"></i>
                    एजेंट | Field Agent
                  </button>
                </Link>
              ) : null}
              
              {user?.role === 'admin' ? (
                <Link href="/admin">
                  <button 
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      currentRole === 'admin' || location === '/admin'
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    data-testid="nav-admin"
                  >
                    <i className="fas fa-user-cog mr-2"></i>
                    प्रशासक | Admin
                  </button>
                </Link>
              ) : null}
            </div>
          </div>
        </nav>
      )}

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex justify-around py-2">
            <Link href="/community">
              <button 
                className={`flex flex-col items-center py-2 px-3 ${
                  currentRole === 'community' ? 'text-primary' : 'text-gray-500'
                }`}
                data-testid="mobile-nav-community"
              >
                <i className="fas fa-home text-xl mb-1"></i>
                <span className="text-xs">समुदाय</span>
              </button>
            </Link>
            
            {user?.role === 'agent' || user?.role === 'admin' ? (
              <Link href="/agent">
                <button 
                  className={`flex flex-col items-center py-2 px-3 ${
                    currentRole === 'agent' ? 'text-primary' : 'text-gray-500'
                  }`}
                  data-testid="mobile-nav-agent"
                >
                  <i className="fas fa-map-marker-alt text-xl mb-1"></i>
                  <span className="text-xs">एजेंट</span>
                </button>
              </Link>
            ) : null}
            
            {user?.role === 'admin' ? (
              <Link href="/admin">
                <button 
                  className={`flex flex-col items-center py-2 px-3 ${
                    currentRole === 'admin' ? 'text-primary' : 'text-gray-500'
                  }`}
                  data-testid="mobile-nav-admin"
                >
                  <i className="fas fa-chart-bar text-xl mb-1"></i>
                  <span className="text-xs">प्रशासक</span>
                </button>
              </Link>
            ) : null}
          </div>
        </nav>
      )}
    </>
  );
}
