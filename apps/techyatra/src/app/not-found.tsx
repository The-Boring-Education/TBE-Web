import { Button } from '@ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
