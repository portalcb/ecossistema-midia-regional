const scriptPolicy=process.env.NODE_ENV==='development'?"script-src 'self' 'unsafe-inline' 'unsafe-eval'":"script-src 'self' 'unsafe-inline'";
const securityHeaders=[
  {key:'Content-Security-Policy',value:`default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; ${scriptPolicy}; connect-src 'self'; upgrade-insecure-requests`},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Cross-Origin-Opener-Policy',value:'same-origin'},
  {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'},
];

export default {
  poweredByHeader:false,
  async headers(){
    return [
      {source:'/:path*',headers:securityHeaders},
      {source:'/admin/:path*',headers:[{key:'Cache-Control',value:'private, no-store, max-age=0'}]},
      {source:'/login',headers:[{key:'Cache-Control',value:'private, no-store, max-age=0'}]},
      {source:'/premium/:path*',headers:[{key:'Cache-Control',value:'private, no-store, max-age=0'}]},
    ];
  },
};
