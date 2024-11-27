import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Loader2, Hotel } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BorderBeam } from "@/components/ui/border-beam";
import { FormInput } from './form-input';
import { FormSelect } from './form-select';
import { formSchema, defaultValues, type FormValues } from './form-schema';

interface PredictionResponse {
  status: string;
  duration: string;
  result: {
    prediction: boolean;
    cancel_probability: number;
    not_cancel_probability: number;
    feature_importance: Record<string, number>;
    duration: string;
    input_features: {
      numerical: Record<string, number>;
      categorical: Record<string, string>;
    };
  };
}

const countryOptions = [
  { value: 'DEU', label: 'Germany' },
  { value: 'FRA', label: 'France' },
  { value: 'GBR', label: 'United Kingdom' },
  { value: 'ESP', label: 'Spain' },
  { value: 'ITA', label: 'Italy' },
  { value: 'PRT', label: 'Portugal' },
];

const channelOptions = [
  { value: 'Direct', label: 'Direct' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Online TA', label: 'Online Travel Agency' },
  { value: 'Offline TA', label: 'Offline Travel Agency' },
  { value: 'Wholesale', label: 'Wholesale' },
];

const depositOptions = [
  { value: 'No Deposit', label: 'No Deposit' },
  { value: 'Non Refund', label: 'Non-Refundable' },
  { value: 'Refundable', label: 'Refundable' },
];

const FeatureImportance = ({ featureImportance }: { featureImportance: Record<string, number> | undefined }) => {
  if (!featureImportance || Object.keys(featureImportance).length === 0) {
    return null;
  }

  // Prepare data for the chart
  const chartData = Object.entries(featureImportance)
    .map(([key, value]) => ({
      feature: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      importance: parseFloat((value * 100).toFixed(2)),
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10); // Display top 10 factors

  // State to handle responsive dimensions
  const [chartHeight, setChartHeight] = useState(350);
  const [chartMargin, setChartMargin] = useState({ top: 40, right: 50, left: 150, bottom: 40 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // Small screens
        setChartHeight(250);
        setChartMargin({ top: 30, right: 30, left: 120, bottom: 30 });
      } else if (window.innerWidth < 1024) { // Medium screens
        setChartHeight(300);
        setChartMargin({ top: 35, right: 40, left: 130, bottom: 35 });
      } else { // Large screens
        setChartHeight(350);
        setChartMargin({ top: 40, right: 50, left: 150, bottom: 40 });
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 shadow-md">
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-center">Key Influencing Factors</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={chartMargin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 'dataMax + 10']}
            tickFormatter={(value) => `${value}%`}
            stroke="#4F46E5"
            fontSize={window.innerWidth < 640 ? 12 : 14}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={window.innerWidth < 640 ? 120 : 150}
            tick={{ fontSize: window.innerWidth < 640 ? 12 : 14 }}
          />
          <Tooltip 
            formatter={(value: number) => `${value}%`} 
            contentStyle={{ backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Bar
            dataKey="importance"
            fill="#4F46E5"
            animationDuration={1500}
            barSize={window.innerWidth < 640 ? 15 : 20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export function BookingForm() {
  const { toast } = useToast();
  const [predictionResult, setPredictionResult] = useState<PredictionResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const response = await axios.post<PredictionResponse>(`${import.meta.env.VITE_URL}`, data);
      if (response.data.status === 'success' && response.data.result) {
        // console.log(response);
        setPredictionResult(response.data.result);
        
        const durationInSeconds = (parseFloat(response.data.duration) / 1000).toFixed(2);
        toast({
          title: "Prediction Complete",
          description: `Prediction completed in ${durationInSeconds} seconds`,
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="relative rounded-xl bg-white shadow-lg overflow-hidden">
        <BorderBeam className="absolute inset-0" />
        <div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Hotel className="h-10 w-10 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-center">Hotel Booking Prediction</h2>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <FormInput
                  form={form}
                  name="lead_time"
                  label="Lead Time (days)"
                  placeholder="e.g., 50"
                  type="number"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stay duration inputs */}
                  <FormInput
                    form={form}
                    name="stays_in_weekend_nights"
                    label="Weekend Nights"
                    type="number"
                  />
                  <FormInput
                    form={form}
                    name="stays_in_week_nights"
                    label="Week Nights"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Guest counts */}
                  <FormInput form={form} name="adults" label="Adults" type="number" />
                  <FormInput form={form} name="children" label="Children" type="number" />
                  <FormInput form={form} name="babies" label="Babies" type="number" />
                </div>

                <FormInput
                  form={form}
                  name="adr"
                  label="Average Daily Rate (£)"
                  type="number"
                  step="0.01"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    form={form}
                    name="previous_cancellations"
                    label="Previous Cancellations"
                    type="number"
                  />
                  <FormInput
                    form={form}
                    name="previous_bookings_not_canceled"
                    label="Previous Not Canceled"
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Dropdowns */}
                  <FormSelect
                    form={form}
                    name="country"
                    label="Country"
                    options={countryOptions}
                  />
                  <FormSelect
                    form={form}
                    name="distribution_channel"
                    label="Distribution Channel"
                    options={channelOptions}
                  />
                  <FormSelect
                    form={form}
                    name="deposit_type"
                    label="Deposit Type"
                    options={depositOptions}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoading ? 'Processing...' : 'Predict Booking'}
              </Button>
            </form>
          </Form>

          {/* Prediction Results */}
          {predictionResult && (
            <div className="space-y-8 mt-8">
              <div className={`p-6 rounded-lg shadow ${
                predictionResult.prediction ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
                  {predictionResult.prediction 
                    ? '⚠️ High Risk of Cancellation' 
                    : '✅ Low Risk of Cancellation'}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Cancellation Probability:</span>
                    <span className={predictionResult.prediction ? 'text-red-600' : 'text-green-600'}>
                      {(predictionResult.cancel_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Retention Probability:</span>
                    <span className={!predictionResult.prediction ? 'text-green-600' : 'text-red-600'}>
                      {(predictionResult.not_cancel_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  {/* Additional Information can be added here */}
                </div>
              </div>

              {/* Key Factors */}
              <FeatureImportance featureImportance={predictionResult.feature_importance} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}