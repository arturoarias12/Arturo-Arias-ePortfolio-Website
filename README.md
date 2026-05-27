# Arturo Arias ePortfolio Website

Personal portfolio website built from scratch with vanilla HTML, CSS, and JavaScript. Live at **[arturoarias.me](https://arturoarias.me)**.

## Features

- Multiple project case studies with client-side search, filters, sort, and grid/list toggle
- Experience, education, achievements, certifications, and skills sections
- AI chat assistant that answers questions about my background and projects
- Dark mode with preference persisted in localStorage
- Responsive layout with sticky frosted-glass navbar
- Contact form via Google Apps Script
- GTM/GA4 analytics with full dataLayer event tracking

## AI Chat Assistant

Every page includes a floating assistant powered by a Cloudflare Workers API, a RAG pipeline over Cloudflare KV (20 Markdown documents), and Llama 3.1 8B Instruct running on Cloudflare Workers AI. The system prompt and RAG retrieval are handled entirely server-side (no API keys are exposed to the browser).

## Stack

HTML5, CSS3, Vanilla JavaScript, Cloudflare Workers, Cloudflare Workers AI, Llama 3.1 8B, RAG, Cloudflare KV, Cloudflare WAF, Google Tag Manager, GA4, GitHub Pages, Google Apps Script

## Deployment

Deployed to GitHub Pages with a custom domain managed through Cloudflare DNS.
