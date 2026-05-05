/** @type {import('next').NextConfig} */

// A Supabase Storage host kinyerése a SUPABASE_URL-ből.
// Pl. https://okwzsyjganoivpuupkcb.supabase.co → okwzsyjganoivpuupkcb.supabase.co
let supabaseHost = '';
try {
  if (process.env.SUPABASE_URL) {
    supabaseHost = new URL(process.env.SUPABASE_URL).hostname;
  }
} catch {
  // ha nincs még beállítva, ignoráljuk
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: 'https',
            hostname: supabaseHost,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
};

export default nextConfig;
