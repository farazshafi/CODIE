import Link from 'next/link';
export default function NotFound() {
    return (
        <div style={{ background: 'linear-gradient(to bottom, #1f2125, #000000)' }} className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                {/* Left Text Section */}
                <div className="text-white space-y-6">
                    <h1 className="text-5xl font-extrabold">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-gray-400">
                        Oops! The page you&apos;re looking for doesn’t exist or has been moved.
                        Let’s get you back on track.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-green-400 hover:bg-green-600 hover:text-white text-black px-6 py-3 rounded-lg font-semibold transition"
                    >
                        Go Home
                    </Link>
                </div>

                {/* Right Code Block */}
                <div className="bg-black rounded-xl shadow-xl overflow-hidden border border-gray-700">
                    <div className="flex items-center px-4 py-2 space-x-2 bg-gray-800">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <pre className="p-6 text-sm overflow-x-auto">
                        <code className="text-green-400">
                            {`// 404.tsx
export default function NotFound() {
  throw new Error("Page not found");
}

// Possible reasons:
// 1. Mistyped URL
// 2. Outdated link
// 3. The page was removed

// Fix: Navigate back home
`}
                        </code>
                    </pre>
                </div>

            </div>
        </div>
    );
}
