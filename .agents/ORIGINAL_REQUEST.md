# Original User Request

## 2026-08-26T00:27:21Z

Evolve and scale the Dopamine luxury streetwear platform in-place into an enterprise-grade full-stack web application with modular interactive frontend architecture, 60fps WebGL/Canvas 3D experiences, robust Node/Serverless backend APIs, secure Supabase/PostgreSQL database persistence and authentication, conversion-focused streetwear brand copy, and comprehensive QA/Core Web Vitals auditing.

Working directory: c:/Users/manu/Downloads/dopamine_actualizado_1/dopamine_actualizado
Integrity mode: development

## Team Structure & Specialized Roles

1. **Lead Orchestrator**: High-level technical architecture, task breakdown, API data contract definitions, and multi-agent artifact integration.
2. **UI/UX & Visual Designer**: Visual fidelity with `design.md`, floating liquid glass header capsule, responsive container layouts (wide canvas), and 3D canvas/motion choreography.
3. **Frontend Engineer**: Modular client state architecture (`cart.js`, `products.js`, `product-detail.js`, `theme.js`, `i18n.js`), 3D globe and garment viewers, search indexing, and Nike-style multi-step checkout.
4. **Backend & API Engineer**: Node / Serverless API routes, database schema (customers, orders, inventory), authentication handlers (OAuth + email verification), and Mercado Pago payment webhooks with idempotent processing.
5. **Copywriter & Brand Voice**: High-impact editorial streetwear storytelling, product descriptions, microcopy, and dynamic ES/EN localization dictionaries.
6. **QA & Performance Auditor**: Automated multi-page DOM validation, Core Web Vitals (LCP, CLS, INP), security checks, and cross-device testing.

## Requirements

### R1. Lead Orchestration & Full-Stack Data Contracts
- Formalize TypeScript / JSON Schema data contracts for all core entities: `Product`, `CustomerProfile`, `CartSession`, `OrderTransaction`, `VerificationCode`, `ShippingRate`.
- Ensure clean decoupling between client-side rendering and backend API handlers.

### R2. UI/UX Design System & 3D WebGL Motion
- Adhere strictly to `design.md` color tokens (`#0066cc` / `#2997ff` Action Blue, `#0A0A0C` / `#ffffff` Canvas) and typography (Space Grotesk / SF Pro Display).
- Ensure interactive 3D WebGL / Canvas modules (3D Globe with inverted controls, 360° viewer) run at smooth 60 FPS without memory leaks.
- Preserve the Rotten Future Floating Liquid Glass capsule header across all pages and viewports.

### R3. Frontend Modular State & Interactive Commerce
- Shopping bag & drawer system (`CartStore`) with reactive totals, installments calculations, and free shipping trackers.
- Instant search filter overlay and category faceted filtering.
- Complete internationalization (ES / EN) dynamically applied without full page reloads.

### R4. Backend API Routes & Secure Data Persistence
- Implement serverless API endpoints:
  - `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-code`, `/api/auth/oauth`
  - `/api/checkout/create-preference`, `/api/webhooks/mercadopago`
  - `/api/admin/customers`, `/api/admin/orders`
- Persistent database adapter supporting both local storage fallback and Supabase / PostgreSQL tables.

### R5. Brand Storytelling & Conversion Copywriting
- Polished high-fashion streetwear copy across Hero, Atelier Manifiesto, Product Descriptions, Checkout Microcopy, and Exit-Intent VIP Vouchers.

### R6. Automated QA & Zero-Defect Standard
- Guarantee zero console errors, balanced HTML tags across all 9 pages, WCAG AA contrast compliance, and full keyboard/touch accessibility.

## Acceptance Criteria

### Visual & Motion Fidelity
- [ ] 100% compliance with `design.md` specifications and zero layout shift (CLS < 0.1).
- [ ] 3D Canvas / WebGL components render smoothly at 60fps with touch-action and responsive viewport scaling.

### Backend & Functional Integrity
- [ ] All API endpoints adhere to structured JSON contracts with error handling and status codes.
- [ ] Authentication flows (credentials, verification code, OAuth) persist session state securely.
- [ ] Mercado Pago preference generation and webhook payload processing are validated and idempotent.

### Internationalization & QA
- [ ] ES and EN localization dictionaries have 100% key parity and instant reactivity.
- [ ] Multi-page diagnostic audit validates 0 HTML errors, 0 broken links, and 0 memory leaks.
