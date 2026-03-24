<<<<<<< HEAD
# whatsapp-saas
=======
# MyBooking WhatsApp SaaS

A complete, production-grade multi-tenant WhatsApp SaaS platform built with Next.js, NestJS, PostgreSQL, Redis, and BullMQ.

## Features

- **Multi-tenant Architecture**: Organization-based data isolation
- **Bulk Messaging**: Send messages to thousands of contacts
- **Real-time CRM Inbox**: Live chat interface with WebSockets
- **Campaign Management**: Create and schedule WhatsApp campaigns
- **Contact Management**: CSV upload with background processing
- **Queue-based Processing**: Scalable message sending with Redis + BullMQ
- **WhatsApp Integration**: Gupshup API integration
- **Billing System**: Razorpay subscription management
- **Analytics Dashboard**: Campaign and message statistics

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- ShadCN UI
- Zustand (State Management)
- Socket.io Client

### Backend
- NestJS
- PostgreSQL (Prisma ORM)
- Redis + BullMQ (Queue System)
- Socket.io
- JWT Authentication

### Integrations
- Gupshup WhatsApp API
- Razorpay Payments

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL & Redis (via Docker)

### Installation

1. Clone the repository
2. Start database services:
   ```bash
   cd docker
   docker-compose up -d
   ```

3. Backend setup:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npx prisma db push
   npm run start:dev
   ```

4. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## API Documentation

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### WhatsApp
- `POST /whatsapp/key` - Add WhatsApp API key
- `POST /whatsapp/send` - Send message
- `POST /whatsapp/webhook` - Gupshup webhook

### Contacts
- `POST /contacts/upload` - Upload CSV contacts
- `GET /contacts` - Get contacts

### Campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns` - List campaigns
- `POST /campaigns/:id/send` - Send campaign

### Billing
- `POST /billing/subscribe` - Create subscription
- `POST /billing/webhook` - Razorpay webhook

## Deployment

### Backend (Dockerized VPS)
```bash
docker build -t whatsapp-saas-backend .
docker run -p 3001:3001 whatsapp-saas-backend
```

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Database (Supabase)
- Use Supabase for PostgreSQL in production

### Queue (Upstash)
- Use Upstash Redis for production queue

## Environment Variables

### Backend
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
ENCRYPTION_KEY=encryption-key
REDIS_HOST=localhost
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

## License

MIT
>>>>>>> b6d217c (final production ready build)
