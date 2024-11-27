import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './form-schema';

interface FormInputProps {
  form: UseFormReturn<FormValues>;
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  type?: string;
  step?: string;
}

export function FormInput({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  step,
}: FormInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              step={step}
              placeholder={placeholder}
              {...field}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}