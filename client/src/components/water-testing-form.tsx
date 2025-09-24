import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
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
// Import type locally or define minimal shape expected by UI
type WaterAsset = {
  id: string;
  name: string;
  type: string;
};

const testSchema = z.object({
  waterAssetId: z.string().min(1, "Water asset is required"),
  phLevel: z.string().optional(),
  tdsLevel: z.string().optional(),
  contaminationLevel: z.string().optional(),
  turbidity: z.string().optional(),
  chlorineLevel: z.string().optional(),
  notes: z.string().optional(),
});

type TestForm = z.infer<typeof testSchema>;

export function WaterTestingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch water assets for dropdown
  const { data: waterAssets = [] } = useQuery<WaterAsset[]>({
    queryKey: ["/api/water-assets"],
  });

  const form = useForm<TestForm>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      waterAssetId: "",
      phLevel: "",
      tdsLevel: "",
      contaminationLevel: "",
      turbidity: "",
      chlorineLevel: "",
      notes: "",
    },
  });

  const testMutation = useMutation({
    mutationFn: async (data: TestForm) => {
      // Convert string values to numbers where needed
      const processedData = {
        ...data,
        phLevel: data.phLevel ? parseFloat(data.phLevel) : null,
        tdsLevel: data.tdsLevel ? parseInt(data.tdsLevel) : null,
        turbidity: data.turbidity ? parseFloat(data.turbidity) : null,
        chlorineLevel: data.chlorineLevel ? parseFloat(data.chlorineLevel) : null,
      };
      await apiRequest("POST", "/api/water-quality-tests", processedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "जल गुणवत्ता परीक्षण सफलतापूर्वक जमा किया गया | Water quality test submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/water-quality-tests"] });
      form.reset();
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
        description: "Failed to submit water quality test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TestForm) => {
    testMutation.mutate(data);
  };

  return (
    <Card className="card-elevated">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          जल गुणवत्ता परीक्षण | Water Quality Testing
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="waterAssetId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>जल स्रोत | Water Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-water-asset">
                          <SelectValue placeholder="Select water source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {waterAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>pH Level</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="7.0" 
                        {...field}
                        data-testid="input-ph-level"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tdsLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TDS (mg/L)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="500" 
                        {...field}
                        data-testid="input-tds-level"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="turbidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turbidity (NTU)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="1.0" 
                        {...field}
                        data-testid="input-turbidity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chlorineLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chlorine (mg/L)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.2" 
                        {...field}
                        data-testid="input-chlorine-level"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contaminationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contamination Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-contamination-level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>टिप्पणी | Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional observations or notes"
                        className="h-20"
                        {...field}
                        data-testid="textarea-test-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i className="fas fa-camera text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">फोटो अपलोड | Click to upload water source photo</p>
                  <p className="text-xs text-gray-500 mt-1">(Photo upload coming soon)</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-700 text-white"
                  disabled={testMutation.isPending}
                  data-testid="button-submit-test"
                >
                  {testMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  टेस्ट रिपोर्ट सबमिट करें | Submit Test Report
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
