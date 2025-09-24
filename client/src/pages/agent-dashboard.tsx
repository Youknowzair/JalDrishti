import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/navigation";
import { MapComponent } from "@/components/map-component";
import { WaterTestingForm } from "@/components/water-testing-form";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
type Task = {
  id: string | number;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueDate?: string;
};

type WaterAsset = {
  id: string | number;
  name: string;
  type: string;
  status: string;
  condition: string;
  latitude: number;
  longitude: number;
};

export default function AgentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or insufficient permissions
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'agent'))) {
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
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch agent tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user && user.role === 'agent',
  });

  // Fetch water assets
  const { data: waterAssets = [], isLoading: assetsLoading } = useQuery<WaterAsset[]>({
    queryKey: ["/api/water-assets"],
    enabled: !!user,
  });

  // Sync offline data mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      // Simulate offline sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "डेटा सिंक हो गया | Data synced successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingTasks = tasks.filter((task) => task.status === 'pending');
  const completedTasks = tasks.filter((task) => task.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-error text-white";
      case "medium": return "bg-warning text-white";
      case "low": return "bg-secondary text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTaskTypeText = (type: string) => {
    switch (type) {
      case "inspection": return "निरीक्षण | Inspection";
      case "maintenance": return "रखरखाव | Maintenance";
      case "testing": return "परीक्षण | Testing";
      case "survey": return "सर्वेक्षण | Survey";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole="agent" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map and Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    असाइन किए गए क्षेत्र | Assigned Areas
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    data-testid="button-sync-data"
                  >
                    {syncMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    ) : (
                      <i className="fas fa-sync-alt mr-2"></i>
                    )}
                    Sync Data
                  </Button>
                </div>
                <MapComponent 
                  waterAssets={waterAssets}
                  userRole="agent"
                  height="400px"
                />
              </CardContent>
            </Card>

            {/* Water Testing Form */}
            <WaterTestingForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Summary */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  आज के कार्य | Today's Tasks
                </h3>
                {tasksLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        कुल कार्य | Total Tasks
                      </span>
                      <span className="font-semibold text-xl" data-testid="text-total-tasks">
                        {tasks.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        पूर्ण | Completed
                      </span>
                      <span className="font-semibold text-xl text-secondary" data-testid="text-completed-tasks">
                        {completedTasks.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        लंबित | Pending
                      </span>
                      <span className="font-semibold text-xl text-warning" data-testid="text-pending-tasks">
                        {pendingTasks.length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  लंबित कार्य | Pending Tasks
                </h3>
                {tasksLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : pendingTasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <i className="fas fa-check-circle text-2xl mb-2 text-gray-300"></i>
                    <p className="text-sm">कोई लंबित कार्य नहीं | No pending tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.map((task: any) => (
                      <div 
                        key={task.id} 
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        data-testid={`task-item-${task.id}`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`status-indicator ${
                            task.priority === 'high' ? 'bg-error' :
                            task.priority === 'medium' ? 'bg-warning' :
                            'bg-secondary'
                          }`}></span>
                          <span className="font-medium text-sm">
                            {getTaskTypeText(task.type)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {task.title}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Offline Status */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="font-medium text-sm">
                    ऑफलाइन मोड | Offline Mode
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3" data-testid="text-offline-reports">
                  0 reports stored locally
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  data-testid="button-sync-offline"
                >
                  {syncMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  ) : (
                    <i className="fas fa-cloud-upload-alt mr-2"></i>
                  )}
                  Sync When Online
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
