import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/navigation";
import { ProblemReportModal } from "@/components/problem-report-modal";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
type ProblemReport = {
  id: string | number;
  type: string;
  status: string;
  createdAt: string;
};

export default function CommunityDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReportModal, setShowReportModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's problem reports
  const { data: problemReports = [], isLoading: reportsLoading } = useQuery<ProblemReport[]>({
    queryKey: ["/api/problem-reports"],
    enabled: !!user,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-secondary text-white";
      case "in-progress": return "bg-warning text-white";
      case "pending": return "bg-error text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "resolved": return "हल हो गया | Resolved";
      case "in-progress": return "प्रगति में | In Progress";
      case "pending": return "लंबित | Pending";
      default: return status;
    }
  };

  const getProblemTypeText = (type: string) => {
    switch (type) {
      case "handpump-broken": return "हैंडपंप खराब | Handpump Broken";
      case "water-quality": return "पानी की गुणवत्ता | Water Quality";
      case "water-shortage": return "पानी की कमी | Water Shortage";
      case "pipe-leakage": return "पाइप लीकेज | Pipe Leakage";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole="community" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            स्वागत है | Welcome
          </h2>
          <p className="text-gray-600">
            अपने पानी की समस्याओं को रिपोर्ट करें | Report your water issues
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Report Problem Card */}
          <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setShowReportModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                <i className="fas fa-exclamation-triangle text-error text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                समस्या रिपोर्ट करें
              </h3>
              <p className="text-gray-600 text-center mb-4">Report Water Problem</p>
              <Button 
                className="w-full bg-error hover:bg-red-700 text-white"
                data-testid="button-report-problem"
              >
                रिपोर्ट करें | Report Now
              </Button>
            </CardContent>
          </Card>

          {/* View Updates Card */}
          <Card className="card-elevated hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                <i className="fas fa-bell text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                स्थानीय अपडेट
              </h3>
              <p className="text-gray-600 text-center mb-4">View Local Updates</p>
              <Button 
                className="w-full bg-primary hover:bg-blue-700 text-white"
                data-testid="button-view-updates"
              >
                अपडेट देखें | View Updates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Status */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              आपकी रिपोर्ट्स | Your Reports
            </h3>
            
            {reportsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : problemReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                <p>कोई रिपोर्ट नहीं मिली | No reports found</p>
                <p className="text-sm">Start by reporting a water issue</p>
              </div>
            ) : (
              <div className="space-y-4">
                {problemReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    data-testid={`report-item-${report.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`status-indicator ${
                        report.status === 'resolved' ? 'bg-secondary' :
                        report.status === 'in-progress' ? 'bg-warning' :
                        'bg-error'
                      }`}></span>
                      <div>
                        <p className="font-medium">
                          {getProblemTypeText(report.type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString('hi-IN')} | {' '}
                          {new Date(report.createdAt).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-sm ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button for Mobile */}
        <Button
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg btn-fab bg-error hover:bg-red-700 text-white md:hidden"
          onClick={() => setShowReportModal(true)}
          data-testid="button-floating-report"
        >
          <i className="fas fa-plus text-xl"></i>
        </Button>
      </main>

      {/* Problem Report Modal */}
      <ProblemReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
