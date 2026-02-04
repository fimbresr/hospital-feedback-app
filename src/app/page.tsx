import ConversationalForm from '@/components/ConversationalForm';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header / Logo Section */}
      <header className="pt-12 pb-6 px-4 flex flex-col items-center">
        <div className="mb-4">
          <div className="w-20 h-20 relative">
            <Image
              src="/logo-hsda.png"
              alt="Hospital San Diego de Alcalá Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-[0.2em] text-primary uppercase">
          Hospital San Diego
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-secondary uppercase mt-1">
          de alcalá
        </p>
      </header>

      {/* Hero / Form Area */}
      <section className="relative z-10">
        <ConversationalForm />
      </section>

      {/* Footer Branding */}
      <footer className="pb-12 pt-6 text-center text-secondary/50 text-xs font-medium uppercase tracking-widest">
        Calidad y Calidez en su atención
      </footer>

      {/* Background blobs for premium feel */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-primary-light/10 rounded-full blur-[180px] -z-10" />
    </main>
  );
}
