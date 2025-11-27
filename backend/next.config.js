/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar x-powered-by header
  poweredByHeader: false,
  
  // Headers de segurança para todas as rotas
  async headers() {
    return [
      {
        // Aplicar a todas as rotas da API
        source: '/api/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=()',
          },
        ],
      },
    ]
  },
  
  // Configurações de produção
  reactStrictMode: true,
  
  // Não expor source maps em produção
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
