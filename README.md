# Train or Be Trained
Train or Be Trained is a lightweight setup wizard that helps users generate a reusable “Working With Me” guide for AI assistants, built as a content-driven web app optimized for fast delivery, SEO, and social sharing.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (for development and build)

### Development (Angular Dev Server — Port 4200)

```bash
npm ci           # Install dependencies
npm start        # Start dev server → http://localhost:4200
```

### Production Build (Static Dist — Port 8080)

```bash
npm run build           # Build to dist/rawls-game/browser
npm run serve:dist      # Serve dist → http://localhost:8080
```

> ⚠️ **WARNING: Port Collision**
> 
> Never serve the production dist on port 4200. If you do, the PWA service worker
> can take over 4200 and you'll see stale JS even after you restart `ng serve`.
> 
> **Safe workflow:**
> - Dev: `npm start` → 4200
> - Prod dist: `npm run serve:dist` → 8080
> - If 4200 is "stuck", use `npm run start:4201` or see `docs/status/stale-browser-code-runbook.md`

### Testing
```bash
npm test         # Run all tests (Karma + ChromeHeadless)
```

## 📁 Site Structure

### Main Pages
- **Homepage** (`/`) - Landing page with site introduction
- **Survey** (`/survey/`) - Interactive political philosophy assessment
- **Results Preview** (`/results/preview/`) - Sample results with radar chart
- **Resources** (`/resources/`) - Additional reading and information
- **Profiles Hub** (`/profiles/`) - Overview of all philosophy profiles

### Individual Profile Pages
- **The Visionary Realist** (`/profiles/visionary-realist/`)
- **Individual profile pages available only for The Visionary Realist** (`/profiles/visionary-realist/`)

### Development Tools
- **OG Image Builder** (`/og-builder/`) - Generate social media cards

## 🛠️ Development Features

### Performance Optimizations
- ✅ Critical CSS inlined on all pages (~1-2KB per page)
- ✅ Non-blocking CSS loading with `media="print" onload` technique
- ✅ JavaScript deferred for better loading performance
- ✅ Font preconnecting for Google Fonts optimization

### SEO Ready
- ✅ Unique title tags and meta descriptions for all pages
- ✅ Open Graph and Twitter Card meta tags
- ✅ Structured data (JSON-LD) for rich snippets
- ✅ XML sitemap with all pages (`/sitemap.xml`)
- ✅ Search engine friendly robots.txt (`/robots.txt`)
- ✅ Canonical URLs for duplicate content prevention

### Social Sharing
- ✅ Share buttons for Twitter/X, Facebook, LinkedIn
- ✅ Copy link functionality with modern Clipboard API
- ✅ Profile card PNG export (1200×630 pixels)
- ✅ UTM tracking parameters for analytics
- ✅ Toast notifications for user feedback

### Accessibility
- ✅ Semantic HTML5 structure
- ✅ Proper heading hierarchy
- ✅ ARIA labels and landmarks
- ✅ Keyboard navigation support
- ✅ Mobile-responsive Bootstrap 5.3.3 layout
- ✅ Touch-friendly interfaces (44px minimum targets)

## 📊 Testing

### Automated Testing (236 tests)
```bash
npm test
```

**Test Coverage:**
- Step 00: Smoke tests (1 test)
- Step 01: Site structure (24 tests)  
- Step 03: Structured data (8 tests)
- Step 04: Profiles hub (8 tests)
- Step 05: Profile pages (30 tests)
- Step 06: Share cards (18 tests)
- Step 07: Share links (28 tests)
- Step 08: Survey accessibility (24 tests)
- Step 09: Results page (26 tests)
- Step 10: Performance/SEO (33 tests)
- Step 11: OG builder (18 tests)
- Step 12: QA checklist (18 tests)

### Manual QA
Follow the comprehensive checklist in `QA.md` for manual testing:
- SEO meta tag validation
- Social media preview testing
- Mobile responsiveness
- Cross-browser compatibility
- Performance verification

## 🔧 Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styles + Bootstrap 5.3.3
- **Vanilla JavaScript** - No frameworks, pure JS
- **Bootstrap 5.3.3** - Responsive layout and components
- **Font Awesome 6.5.2** - Icons

### Development
- **Node.js** - Build and test scripts
- **Cheerio 1.0.0-rc.12** - HTML parsing for tests
- **Python HTTP Server** - Local development serving

### External Services
- **Google Fonts** - Typography (La Belle Aurore)
- **CDN Resources** - Bootstrap and Font Awesome via jsDelivr

## 📱 Browser Support

### Desktop
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Samsung Internet 14+

## 🚀 Deployment

### Static Hosting Ready
This is a static site that works on any web server:
- **Netlify** - Deploy via Git or drag-and-drop
- **Vercel** - Connect to repository for automatic deploys
- **GitHub Pages** - Host directly from repository
- **Apache/Nginx** - Traditional web server hosting
- **CDN** - CloudFlare, AWS CloudFront, etc.

### Pre-Deployment Checklist
1. Run `npm run build` to validate all files
2. Run `npm test` to ensure all tests pass
3. Complete manual QA using `QA.md` checklist
4. Update domain URLs in `sitemap.xml` and `robots.txt`
5. Set up analytics tracking if needed
6. Configure HTTPS redirect on your hosting platform

### Build Output Analysis
- **HTML files**: ~124 KB total (8 pages with inline critical CSS)
- **CSS files**: ~8 KB (site.css with Bootstrap loading externally)
- **JS files**: ~101 KB (state, scoring, share utilities)
- **JSON files**: ~18 KB (profiles and values data)
- **Assets**: ~48 KB (images, icons, other resources)

## 📄 License

MIT License - Based on the philosophical work of John Rawls

## 🤝 Contributing

This project follows a test-driven development approach:
1. All changes must pass the existing test suite
2. New features should include corresponding tests
3. Follow the established code style and structure
4. Update documentation as needed

---

**Dev Server URL**: http://localhost:4200  
**Prod Dist URL**: http://localhost:8080 (via `npm run serve:dist`)  
**Test Command**: `npm test`  
**Build Command**: `npm run build`
