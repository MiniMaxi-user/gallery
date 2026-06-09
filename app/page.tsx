import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card text-center max-w-sm w-full">
        <Image src="/logo.png" alt="Velaro" width={200} height={44} className="mx-auto mb-4" />
        <h1 className="font-bold text-2xl mb-2">Velaro</h1>
        <p className="text-warm-muted text-sm leading-relaxed">
          Heb je een galerij-link ontvangen van je fotograaf? Gebruik die directe link om je foto&apos;s te bekijken.
        </p>
        <p className="text-warm-muted text-xs mt-4">
          Fotograaf?{' '}
          <Link href="/admin" className="text-velaro underline">
            Ga naar het beheer
          </Link>
        </p>
      </div>
    </div>
  );
}
