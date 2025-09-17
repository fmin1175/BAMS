# Badminton Academy Management System (BAMS)

A Next.js application for managing badminton academy students with CRUD operations.

## Features

- Student Management (Create, Read, Update, Delete)
- Responsive UI with Tailwind CSS
- SQLite database with Prisma ORM

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd bams
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up the database**

```bash
npx prisma generate
npx prisma db push
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── students/    # Student management pages
│   │   └── page.tsx     # Home page
│   ├── components/      # React components
│   ├── lib/             # Utility functions and libraries
│   └── types/           # TypeScript type definitions
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## API Routes

- `GET /api/students` - Get all students
- `POST /api/students` - Create a new student
- `GET /api/students/:id` - Get a specific student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Prisma](https://www.prisma.io/) - ORM
- [SQLite](https://www.sqlite.org/) - Database
- [React Hook Form](https://react-hook-form.com/) - Form handling

## Future Enhancements

- User authentication and authorization
- Schedule management
- Payment tracking
- Performance analytics
- Attendance tracking