import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const reportSchema = z.object({
  type: z.string().min(1, "Problem type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

interface ProblemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProblemReportModal({ isOpen, onClose }: ProblemReportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
      latitude: "",
      longitude: "",
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: ReportForm) => {
      await apiRequest("POST", "/api/problem-reports", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "रिपोर्ट सफलतापूर्वक जमा की गई | Report submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/problem-reports"] });
      form.reset();
      onClose();
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
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const captureLocation = () => {
    setIsCapturingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude.toString());
          form.setValue("longitude", position.coords.longitude.toString());
          setIsCapturingLocation(false);
          toast({
            title: "Success",
            description: "स्थान कैप्चर हो गया | Location captured",
          });
        },
        (error) => {
          setIsCapturingLocation(false);
          toast({
            title: "Error",
            description: "Unable to capture location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsCapturingLocation(false);
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ReportForm) => {
    // Generate title based on type if not provided
    const title = data.title || getProblemTypeText(data.type);
    reportMutation.mutate({ ...data, title });
  };

  const getProblemTypeText = (type: string) => {
    switch (type) {
      case "handpump-broken": return "हैंडपंप खराब | Handpump Broken";
      case "water-quality": return "पानी की गुणवत्ता | Water Quality Issue";
      case "water-shortage": return "पानी की कमी | Water Shortage";
      case "pipe-leakage": return "पाइप लीकेज | Pipe Leakage";
      case "other": return "अन्य | Other";
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            समस्या रिपोर्ट करें | Report Problem
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>समस्या का प्रकार | Problem Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-problem-type">
                        <SelectValue placeholder="Select problem type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="handpump-broken">
                        हैंडपंप खराब | Handpump Broken
                      </SelectItem>
                      <SelectItem value="water-quality">
                        पानी की गुणवत्ता | Water Quality Issue
                      </SelectItem>
                      <SelectItem value="water-shortage">
                        पानी की कमी | Water Shortage
                      </SelectItem>
                      <SelectItem value="pipe-leakage">
                        पाइप लीकेज | Pipe Leakage
                      </SelectItem>
                      <SelectItem value="other">
                        अन्य | Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>शीर्षक | Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief description of the problem" 
                      {...field} 
                      data-testid="input-report-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>विवरण | Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="समस्या का विस्तार से वर्णन करें | Describe the problem in detail" 
                      className="h-20"
                      {...field}
                      data-testid="textarea-report-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Auto-detected" 
                        {...field}
                        data-testid="input-latitude"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Auto-detected" 
                        {...field}
                        data-testid="input-longitude"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={captureLocation}
              disabled={isCapturingLocation}
              className="w-full"
              data-testid="button-capture-location"
            >
              {isCapturingLocation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              ) : (
                <i className="fas fa-crosshairs mr-2"></i>
              )}
              स्थान कैप्चर करें | Capture Location
            </Button>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <i className="fas fa-camera text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-600 text-sm">फोटो लें | Tap to take photo</p>
              <p className="text-xs text-gray-500 mt-1">(Photo upload coming soon)</p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-report"
              >
                रद्द करें | Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-error hover:bg-red-700 text-white"
                disabled={reportMutation.isPending}
                data-testid="button-submit-report"
              >
                {reportMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                रिपोर्ट करें | Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
