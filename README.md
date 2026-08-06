# 🎵 SoundGravity API

REST API музичної платформи **SoundGravity**: авторизація (JWT + Google OAuth), завантаження та пошук треків, плейлисти, лайки й профілі користувачів. Бекенд розроблено на **NestJS + TypeORM + PostgreSQL** і спроєктовано так, щоб обслуговувати SPA-фронтенд (React) як окремий cross-origin сервіс.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)]()
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)]()

---

## 📖 Зміст
- [Особливості](#-особливості)
- [Стек технологій](#-стек-технологій)
- [Демо / Swagger](#-демо--swagger)
- [Вимоги](#-вимоги)
- [Встановлення та запуск](#-встановлення-та-запуск)
- [Використання](#-використання)
- [Конфігурація](#-конфігурація)
- [Безпека авторизації](#-безпека-авторизації)
- [Внесок у проєкт (Contributing)](#-внесок-у-проєкт-contributing)
- [Ліцензія](#-ліцензія)

---

## ✨ Особливості

- 🔒 **Безпечна автентифікація** — access token (JWT, 2 год) у памʼяті фронтенду, refresh token в `httpOnly`-cookie, CSRF-захист (double-submit token + перевірка `Origin`), Google OAuth **без токенів в URL**
- 🚀 **Модульна NestJS-архітектура** — `auth`, `users`, `tracks`, `playlists`, `likes`
- 🎵 **Треки та плейлисти** — завантаження аудіо, обкладинки, видимість (public/private), пагінація
- ❤️ **Лайки** — на треки й плейлисти з лічильниками
- ☁️ **Cloudinary** — стрім-завантаження аудіо, обкладинок і аватарів
- 📚 **Автодокументація** — Swagger (`/docs`), CORS з `credentials: true`
- 🔄 **Авто-оновлення токена** — middleware перевипускає access token, коли він протухає

---

## 🛠 Стек технологій

- **Мова:** TypeScript
- **Фреймворк:** NestJS 11
- **ORM / БД:** TypeORM + PostgreSQL (`pg`)
- **Авторизація:** Passport.js (JWT + Google OAuth 2.0), `bcrypt`
- **Зберігання файлів:** Cloudinary (streamifier)
- **Документація:** Swagger (`@nestjs/swagger`)

---

## 🖼 Демо / Swagger

Після запуску інтерактивна документація доступна за адресою:

```
http://localhost:3000/docs
```

Приклад прод-деплою на Render: `https://backend-on.render.com/docs`

---

## ⚙️ Вимоги

Перед початком переконайтеся, що у вас встановлено:

- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [PostgreSQL](https://www.postgresql.org/) `>= 14` (або віддалений host через `DATABASE_URL`)
- (опційно) облікові дані [Google Cloud OAuth 2.0](https://console.cloud.google.com/apis/credentials) і [Cloudinary](https://cloudinary.com/console)

---

## 🚀 Встановлення та запуск

1. **Клонуйте репозиторій:**
   ```bash
   git clone https://github.com/ArtemShabunevych/TPC-Sound-Backend.git
   cd TPC-Sound-Backend
   ```

2. **Встановіть залежності:**
   ```bash
   npm install
   ```

3. **Налаштуйте змінні середовища:**
   ```bash
   cp .env.example .env
   ```
   Заповніть `.env` — мінімально потрібні `DATABASE_URL` (або `DB_*`) та `JWT_SECRET` / `JWT_REFRESH_SECRET`. Див. [Конфігурація](#-конфігурація).

4. **Запустіть:**
   ```bash
   npm run start:dev      # режим розробки (watch)
   npm run start:prod     # зібрана версія (node dist/main)
   ```

5. **Перевірте:**
   ```bash
   curl http://localhost:3000/api
   # Hello World!
   ```

Додаткові скрипти: `npm run build`, `npm run lint`, `npm test`.

---

## 📦 Використання

Усі ендпоінти мають префікс **`/api`**. Авторизовані ендпоінти вимагають заголовок:

```
Authorization: Bearer <accessToken>
```

### Авторизація (`/api/auth`)

| Метод | Шлях | Опис |
| --- | --- | --- |
| `POST` | `/auth/register` | Реєстрація: повертає `{ user, accessToken, csrfToken }`, ставить cookie |
| `POST` | `/auth/login` | Вхід: повертає `{ user, accessToken, csrfToken }`, ставить cookie |
| `POST` | `/auth/refresh` | Оновлення access token з `refresh_token` cookie (+ заголовок `x-csrf-token`) |
| `POST` | `/auth/logout` | Очищає cookie сесії |
| `POST` | `/auth/verify` | Перевірка access token |
| `GET` | `/auth/csrf` | Повертає `{ csrfToken }` (потрібен після Google-редіректу) |
| `GET` | `/auth/google` | Початок Google OAuth |
| `GET` | `/auth/google/callback` | Callback: ставить cookie й редіректить на `FRONTEND_URL/auth/callback` |

### Ресурси

| Метод | Шлях | Опис |
| --- | --- | --- |
| `GET` / `PATCH` | `/users/me`, `/users/user`, `/users/:id` | Профілі користувачів |
| `PATCH` | `/users/description`, `/users/update-username`, `/users/avatar` | Редагування профілю |
| `GET` / `POST` | `/tracks` | Список / завантаження треків |
| `GET` | `/tracks/my-tracks`, `/tracks/liked`, `/tracks/user/:username` | Фільтри треків |
| `PATCH` / `DELETE` | `/tracks/:id`, `/tracks/:id/visibility` | Редагування / видалення |
| `POST` / `DELETE` | `/tracks/:id/like` | Лайк / анлайк треку |
| `GET` / `POST` | `/playlists` | Список / створення плейлистів |
| `PATCH` / `DELETE` | `/playlists/:id`, `/playlists/:id/cover` | Редагування плейлистів |
| `POST` / `DELETE` | `/playlists/:playlistId/tracks/:trackId` | Додати / прибрати трек |
| `POST` / `DELETE` | `/playlists/:id/like` | Лайк / анлайк плейлисту |

### Приклади

```bash
# Вхід (cookies зберігаються у cookies.txt)
curl -X POST http://localhost:3000/api/auth/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"secret123"}'

# Оновлення access token (csrfToken беруть з body login або GET /auth/csrf)
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -H "x-csrf-token: <csrfToken>"

# Захищений ендпоінт
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## ⚙️ Конфігурація

Всі змінні — у `.env` (шаблон: `.env.example`).

### Підключення до БД

| Змінна | Опис |
| --- | --- |
| `DATABASE_URL` | Повний connection string PostgreSQL (пріоритетний) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Або набір параметрів підключення окремо |

### Токени та cookie

| Змінна | Опис |
| --- | --- |
| `JWT_SECRET` | Секрет для access token (2 год) |
| `JWT_REFRESH_SECRET` | Секрет для refresh token (7 днів) |
| `COOKIE_SAMESITE` | Порожньо = авто: `none` у продакшені (cross-site), `lax` у dev. Перевизначення: `none` / `lax` / `strict` |
| `COOKIE_SECURE` | Порожньо = авто: `true` у продакшені або коли `COOKIE_SAMESITE=none`. Перевизначення: `true` / `false` |

### OAuth та фронтенд

| Змінна | Опис |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Ключі Google OAuth 2.0 |
| `GOOGLE_CALLBACK_URL` | Напр. `https://backend-on.render.com/api/auth/google/callback` |
| `CORS_ORIGIN` | Дозволені origin фронтенду (через кому) |
| `FRONTEND_URL` | URL, куди редіректить після Google-входу (`<FRONTEND_URL>/auth/callback`) |

### Інші

| Змінна | Опис |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Хмара для аудіо/зображень |
| `PORT` | Порт сервера (за замовчуванням `3000`) |

---

## 🔒 Безпека авторизації

- **Google OAuth** — токени **не** передаються в query-параметрах URL (не осідають в історії браузера, логах проксі та Referer). Після callback бек ставить cookie й редіректить на `FRONTEND_URL/auth/callback`.
- **Refresh token** — зберігається лише в `httpOnly`-cookie (`refresh_token`) з `Secure` і `SameSite`, тому недоступний для JavaScript (захист від XSS).
- **CSRF** — для cookie-залежних POST-ендпоінтів (`/auth/refresh`, `/auth/logout`) діє подвійна перевірка: співпадіння `csrf_token` cookie з заголовком `x-csrf-token` (timing-safe) + дозволений `Origin`.
- **Access token** — віддається лише в тілі відповіді та заголовку `Authorization: Bearer`; фронтенд тримає його в памʼяті, не в `localStorage`.
- **Авто-рефреш** — `RefreshAccessTokenMiddleware` оновлює access token через refresh-cookie на захищених маршрутах.

> ⚠️ Фронтенд має надсилати запити з `credentials: 'include'`, зберігати access token у памʼяті (React state), а refresh викликати з заголовком `x-csrf-token`. Без цього cookie-флоу не працюватиме.

---

## 🤝 Внесок у проєкт (Contributing)

1. Форкніть репозиторій і створіть гілку `feature/your-feature`.
2. Дотримуйтесь стилю коду (Prettier/ESLint: `npm run lint`, `npm run format`).
3. Відкрийте Pull Request з описом змін.

---

## 📄 Ліцензія

Приватний проєкт (`UNLICENSED`). Використання, копіювання та розповсюдження без письмового дозволу заборонено.

---

## 📧 Контакти

- Автори:
- **Artem Shabunevych** - Github @ArtemShabunevych
- **Oleksiy Roschin** - Github @Qefor
- Репозиторій: [github.com/ArtemShabunevych/TPC-Sound-Backend](https://github.com/ArtemShabunevych/TPC-Sound-Backend)
