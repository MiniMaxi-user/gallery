import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(216,189,113,0.06) 0%, transparent 60%)' }}
    >
      <div className="text-center max-w-md w-full">
        <Image src="/logo.png" alt="Velaro" width={200} height={44} className="mx-auto mb-8" />
        <h1 className="font-serif text-5xl font-light mb-4 leading-tight">
          Uw <em className="text-velaro-gold not-italic">galerij</em>
        </h1>
        <p className="text-velaro-muted text-base leading-relaxed mb-8">
          Heb je een galerij-link ontvangen van je fotograaf? Gebruik die directe link om je foto&apos;s te bekijken en te selecteren.
        </p>
        <p className="text-velaro-muted text-sm">
          Fotograaf?{' '}
          <Link href="/admin" className="text-velaro-gold hover:opacity-80 transition-opacity">
            Ga naar het beheer →
          </Link>
        </p>
      </div>
    </div>
  );
}
