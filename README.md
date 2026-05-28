# Nest + Next AWS Todo App

Production-ready fullstack Todo application built with modern AWS serverless architecture.

## Live Demo

Frontend: https://main.d3jd8rwts3pkp8.amplifyapp.com

---

# Tech Stack

## Frontend

* Next.js 16 App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* react-oidc-context
* Sonner Toasts

## Backend

* Nest.js
* AWS Lambda
* API Gateway
* Serverless Framework v4

## AWS Services

* Amazon Cognito
* DynamoDB
* Amazon S3
* AWS Amplify Hosting

---

# Features

## Authentication

* Cognito Hosted UI login
* Protected routes
* JWT validation
* Logout flow

## Todo Management

* Create todos
* Edit todos
* Delete todos
* Update status
* View todo details

## File Uploads

* Upload files directly to S3
* Presigned upload URLs
* Presigned download URLs
* File metadata stored in DynamoDB

## UI

* Dark theme
* Responsive layout
* Toast notifications
* Modern dashboard UI

---

# Architecture

```txt
Next.js Frontend (Amplify Hosting)
        ↓
API Gateway
        ↓
AWS Lambda (Nest.js)
        ↓
DynamoDB + S3
        ↓
Amazon Cognito
```

---

# Monorepo Structure

```txt
root
├── client
│   ├── src
│   ├── public
│   ├── package.json
│   └── amplify.yml
│
├── server
│   ├── src
│   ├── serverless.yml
│   └── package.json
│
└── README.md
```

---

# Local Development

## Clone repository

```bash
git clone https://github.com/your-username/Nest-next-aws-todolist.git
cd Nest-next-aws-todolist
```

---

# Frontend Setup

```bash
cd client
npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000

NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.eu-central-1.amazonaws.com/YOUR_USER_POOL_ID

NEXT_PUBLIC_COGNITO_CLIENT_ID=YOUR_CLIENT_ID

NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://localhost:3001/callback

NEXT_PUBLIC_COGNITO_LOGOUT_URI=http://localhost:3001/login
```

Run frontend

```bash
npm run dev
```

---

# Backend Setup

```bash
cd server
npm install
```

Run locally

```bash
npm run start:offline
```

Backend runs on:

```txt
http://localhost:3000
```

---

# AWS Deployment

## Backend

Deploy Lambda:

```bash
cd server
npm run deploy
```

Uses:

* AWS Lambda
* API Gateway
* DynamoDB
* S3
* Cognito

## Frontend

Frontend deployed with AWS Amplify Hosting.

Amplify configuration supports:

* Next.js App Router
* SSR
* Monorepo structure

---

# Environment Variables

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_COGNITO_AUTHORITY=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_REDIRECT_URI=
NEXT_PUBLIC_COGNITO_LOGOUT_URI=
```

## Backend

Configured in `serverless.yml`

```yml
DYNAMODB_TODOS_TABLE=
S3_DOCUMENTS_BUCKET=
COGNITO_ISSUER=
COGNITO_CLIENT_ID=
```

---

# Screenshots

## Dashboard

Add screenshot here

## Todo Details

Add screenshot here

## File Upload

Add screenshot here

---

# Future Improvements

* Owner-based authorization
* Pagination
* Search & filters
* Drag & drop uploads
* CI/CD pipeline
* Infrastructure as Code improvements
* Refresh token handling
* Mobile sidebar

---

# Author

Vitalii Simonenko

Senior Frontend-oriented Fullstack Engineer

Tech:

* React.js
* Next.js
* TypeScript
* Node.js
* AWS
