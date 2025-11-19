# LibroHive – Digital Reading & Publishing Platform

LibroHive is a modern digital reading and publishing platform designed for seamless exploration of books, immersive chapter-wise reading, and a full social experience for both readers and authors. Built with **Next.js 15**, **TypeScript**, **Prisma**, and **PostgreSQL**, it delivers a performant, responsive, and feature-rich environment for storytelling.

---

##  Features

### Interactive Book Discovery
- Instagram Reels–style **vertical scroll reading feed**
- Infinite scroll for smooth exploration
- Trending, popular, and personalized recommendations

### Authentication & User System
- Email, Google, and GitHub login via NextAuth
- **Two-Factor Authentication (2FA)**
- User profiles with bio, avatar, and social links
- Follow/unfollow authors

### Book & Chapter Management
- Create, edit, and publish books
- Rich text editor for writing chapters
- Draft + publish workflow
- Upload book covers and add metadata (genre, tags, description)
- Reorder and manage chapters easily

### Reading Experience
- Reading progress tracking
- Bookmarks & favorites
- Comments, replies, and chapter discussions
- Ratings and reviews
- Reading statistics and history

### Social Layer
- Like, save, comment on books and chapters
- Follow authors to get their latest content
- Activity feed with real-time updates

### UI/UX Highlights
- Mobile-first responsive UI
- Light/Dark themes
- Smooth transitions and animations
- Toast notifications and clean interactions

---

## Tech Stack

| Category | Technologies |
|---------|--------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Next.js App Router API, Prisma ORM |
| Database | PostgreSQL |
| Auth | NextAuth (OAuth + Credentials + 2FA) |
| Validation | Zod |
| Email | Resend |

---

##Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jitendraSingh23/Librohive.git
cd librohive
```
##2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```env
DATABASE_URL=
DATABASE_URL_UNPOOLED=

AUTH_SECRET="your-secret"

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RESEND_API_KEY=

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
### 4. Prisma Setup
```
npx prisma generate
```

### 5. Prisma Setup
```
npx prisma migrate dev
```
### 6. Start Development Server
```
npm run dev
```
Your app will now be available at:
```
http://localhost:3000
```
