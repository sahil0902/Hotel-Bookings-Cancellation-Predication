import { BookingForm } from '@/components/booking-form';
import { Toaster } from '@/components/ui/toaster';


function App() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <BookingForm />

      <Toaster />
    </main>
  );
}

export default App;