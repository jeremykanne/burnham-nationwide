// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.burnhamnationwide.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  redirects: {
    // Live-site URLs that moved in the rebuild
    '/portfolio/vista-tower-cleared-to-rise-to-supertall-status/': '/portfolio/vista/',
    '/about-us/': '/about/why-burnham/',
    '/careers/': '/about/careers/',
    '/ask-us-anything/': '/about/faq/',
    '/experience/': '/portfolio/',
    '/services/': '/who-we-help/',
    '/permit-mapper/': '/our-technology/permit-mapper/',
    '/burnham-eye/': '/our-technology/burnham-eye/',
    '/building-permits/': '/what-we-do/permit-management/',
    '/code-compliance/': '/what-we-do/code-consulting/',
  },
});
