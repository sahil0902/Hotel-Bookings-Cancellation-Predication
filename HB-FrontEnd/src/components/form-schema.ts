import * as z from 'zod';

export const formSchema = z.object({
  lead_time: z.coerce
    .number()
    .min(0, 'Lead time must be 0 or greater'),
  stays_in_weekend_nights: z.coerce
    .number()
    .min(0, 'Weekend nights must be 0 or greater'),
  stays_in_week_nights: z.coerce
    .number()
    .min(0, 'Week nights must be 0 or greater'),
  adults: z.coerce
    .number()
    .min(1, 'At least 1 adult is required'),
  children: z.coerce
    .number()
    .min(0, 'Children must be 0 or greater'),
  babies: z.coerce
    .number()
    .min(0, 'Babies must be 0 or greater'),
  adr: z.coerce
    .number()
    .min(0, 'Rate must be 0 or greater'),
  previous_cancellations: z.coerce
    .number()
    .min(0, 'Previous cancellations must be 0 or greater'),
  previous_bookings_not_canceled: z.coerce
    .number()
    .min(0, 'Previous bookings not canceled must be 0 or greater'),
  country: z.string().min(1, 'Country is required'),
  distribution_channel: z.string().min(1, 'Distribution channel is required'),
  deposit_type: z.string().min(1, 'Deposit type is required'),
});

export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: FormValues = {
  lead_time: 0,
  stays_in_weekend_nights: 0,
  stays_in_week_nights: 1,
  adults: 1,
  children: 0,
  babies: 0,
  adr: 0,
  previous_cancellations: 0,
  previous_bookings_not_canceled: 0,
  country: '',
  distribution_channel: '',
  deposit_type: '',
};