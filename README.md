# Train or Be Trained
<<<<<<< HEAD

[![CI](https://github.com/Stephen-Ch/Train-or-Be-Trained/actions/workflows/ci.yml/badge.svg)](https://github.com/Stephen-Ch/Train-or-Be-Trained/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-blue.svg)](https://train-or-be-trained.vercel.app)
=======
Train or Be Trained is a lightweight setup wizard that helps users generate a reusable “Working With Me” guide for AI assistants, built as a content-driven web app optimized for fast delivery, SEO, and social sharing.
>>>>>>> 8bbbaa5961da655f843c3cfcd5684ae71c81a8b9

Beta status: beta-ready and currently entering public beta.

Train or Be Trained is a short setup wizard that generates a reusable Working With Me guide for your AI assistant.

## What it is

Train or Be Trained helps people set up AI to work in a way that better fits their style.
It generates one reusable Working With Me document you can paste into your assistant setup.
The product is a collaboration agreement, not a personality profile.

## Problem it solves

Most AI sessions start with generic assumptions. People end up repeating the same preferences every time.
This tool gives you a structured way to state how you want an assistant to pace, challenge, and communicate.
It is not a psychometric diagnosis, not professional advice, and not a guarantee of truth or accuracy.

## How it works

1. Run a short setup wizard.
2. Answer practical questions about collaboration preferences.
3. Receive a generated Working With Me document.
4. Reuse that document across assistants and sessions.

Example output snippet:

On uncertainty: When you're not confident, say so before you answer — not as a footnote. Use "I think" or "I'm not sure" instead of stating uncertain things as fact.

## Design decisions

- No backend: runs fully in the browser.
- Content-driven: behavior is defined by explicit authored content, not opaque tuning.
- Plain-language output: instructions are written to be pasted and used immediately.
- Beta evidence: content was iterated through adversarial review and mixed-profile behavior testing before beta.
- Best fit today: writing, planning, analysis, coding, and repeated decision-support workflows.
- Current limitation: image-generation workflows are not the strongest fit right now.

## Tech stack

- Angular 20 + TypeScript
- Tailwind CSS
- Karma/Jasmine unit tests
- Playwright end-to-end tests

## Running locally

Prerequisite: Node.js.

- Install dependencies: `npm install`
- Start dev server: `npm start`
- Run tests: `npm test`
- Build production bundle: `npm run build`

Live site: https://train-or-be-trained.vercel.app

## Contributing

Contributions are welcome, especially content-quality improvements that make the generated Working With Me output clearer and more useful.
See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

<<<<<<< HEAD
MIT. See [LICENSE](LICENSE).
=======
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
>>>>>>> 8bbbaa5961da655f843c3cfcd5684ae71c81a8b9
