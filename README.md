# SoundGravity-backend
Технології
Frontend: React, TypeScript, Redux Toolkit, React Router, Axios
Backend: NestJS, TypeScript
Database: PostgreSQL
ORM: Prisma або TypeORM
Storage: Local Storage → у майбутньому AWS S3 / Cloudflare R2
Streaming: HTTP Streaming / HLS
Realtime: Socket.IO / WebSocket
UI: MUI + Styled Components
Auth: JWT + Refresh Tokens
Deploy: Docker + Docker Compose + Nginx
CI/CD: GitHub Actions
Основна ідея

Створити повноцінну музичну платформу, де користувачі можуть:

завантажувати треки
слухати музику
створювати плейлисти
лайкати
підписуватись на авторів
отримувати рекомендації
взаємодіяти через коментарі
стрімити музику без перезавантаження сторінки

Проєкт має масштабуватись до рівня mini-Spotify / SoundCloud.

Архітектура
Backend (NestJS)
Модулі
Auth Module
Users Module
Tracks Module
Playlists Module
Streaming Module
Upload Module
Comments Module
Likes Module
Recommendation Module
Notifications Module
Analytics Module
Admin Module

Event-driven architecture
Microservices
Kafka/RabbitMQ
Kubernetes
AI recommendation engine
Audio transcoding pipeline
Distributed caching
Observability (Grafana + Prometheus)
Multi-region CDN
Blue/Green deployment
Feature flags
A/B testing
├── Modules
├── Guards
├── Interceptors
├── Prisma
├── Redis
├── BullMQ
├── WebSocket Gateway
└── JWT Auth
