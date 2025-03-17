# SciCommons GSoC 2025 - Feature List and Breakdown

## Project Overview
SciCommons is an open-source platform aimed at improving the scientific peer review process through better user experience and web application optimization. This GSoC, we focus on refining the frontend UI, following best practices, and enhancing performance. Contributors will work on UI improvements, optimizing API performance, and ensuring cross-platform compatibility.

## Primary Features
### 1. Frontend Redesign & UI Enhancements
**Adapting Kotahi’s UI Concepts:**  
- Improve the article browsing interface for better readability.  
- Gmail-style layout for managing research articles efficiently.  
- Store articles in XML format (like RSS feeds) - Refer arXiv.  
  
**Mobile-Friendly Interface:**  
- Ensure a fully responsive design with a Progressive Web App (PWA) approach.  
- Side-panel navigation with overlay functionality on mobile.    

### 2. PWA & Cross-Platform Compatibility
**Optimizing SciCommons for PWA:**  
- Enable offline support for article viewing.  
- Improve installability on different devices.  
  
**Mobile & Tablet Adaptations:**  
- Adapt UI for smaller screens with a dynamic panel system.  
- Ensure touch-friendly navigation.  

### 3. Zotero Plugin Integration (Secondary Priority)
**Plugin Features:**  
- Directly integrate with Zotero to manage citations and references.  
- Enable seamless importing of references into SciCommons.  
  
**Implementation Considerations:**  
- Use Zotero’s API for integration.  
- Provide a browser extension or a web-based import feature.  

## Advanced Features  
*(require more expertise, advanced contributions will be appreciated, but we prioritize primary features first)*  
- Implement real-time discussions with threaded conversations, utilizing Django Channels and WebSockets. (Refer Zulip’s system architecture)  
- Markdown support, LaTeX rendering, and mentions.  
- Real-time notifications for messages, comments, and peer review updates. Use Redis, Celery, and WebSockets for push notifications. Allow customizable notification settings.  
- Optimize API performance and caching with Redis. Improve authentication with JWT and rate limiting.  

## Skill Requirements
- **Frontend:** Next.js, React, Server-Side Rendering (SSR), TanStack Query, Radix UI/ShadCN UI, modular design patterns.  
- **Backend:** Django, Django Channels, Redis, Celery, PostgreSQL, WebSockets.  
- **DevOps & Optimization:** Caching, API performance tuning, authentication best practices.  

## Time Commitment & Discussion Forum
- **Commitment:** Full-time (350 hours)  
- **Discussion Forum:** [Neurostars](https://neurostars.org/t/gsoc-2025-project-23-scicommons-a-social-web-tool-for-scientific-discussion-interaction-rating-and-peer-review-350h/32040) 

## Summary
This GSoC project focuses on improving UI/UX, optimizing performance, and following best web development practices. Contributors will work on refining the interface, ensuring responsiveness, implementing a PWA, and integrating features like Zotero. Advanced contributors may explore real-time chat, notifications, and API enhancements. The goal is to create a seamless, efficient platform for scientific discourse.  

**Website:** [www.scicommons.org](https://www.scicommons.org)
