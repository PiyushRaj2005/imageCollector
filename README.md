Theek hai. Seedha **pure-ka-pure final README, sirf Markdown**, bina explanation, bina extra line.
**Full copy-paste ready.**
Yeh lo ↓

---

# Image Collection Platform – Humanness (Prototype)

## Overview

This project is a working prototype built for Task 1 of the Humanness Product Challenge. It implements a simple contributor-facing image-collection flow using React (Vite + TypeScript), Tailwind CSS, and Supabase. The platform allows users to upload an image and a short description, which is then stored in the Supabase database and storage bucket.

This repository includes only the contributor flow. Admin features and Task 2 logic are not part of this build.

---

## Features Implemented

### Image Upload Flow

* Select an image
* Add a caption or description
* Upload to Supabase Storage
* Store metadata (image URL, description, state, district, timestamp)

### Supabase Integration

* Migration file creating the `image_collection` table
* Storage upload + database insert
* Basic structure to extend later

### Frontend (Vite + React + TypeScript)

* `App.tsx` contains the main upload functionality
* `main.tsx` mounts the React app
* `index.css` includes Tailwind styles
* `components/` for UI elements

### Tailwind CSS Setup

Configured through:

* `tailwind.config.js`
* `postcss.config.js`
* `index.css`

### TypeScript + Build Setup

Includes:

* `vite.config.ts`
* `tsconfig.json`
* `tsconfig.app.json`
* `tsconfig.node.json`
* `eslint.config.js`

---

## Folder Structure

```
IMAGECOLLECTOR-MAIN/
│
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── superbase/
│   └── migrations/
│       └── 20251112025225_create_image_collection_...
│
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── eslint.config.js
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── README.md
```

---

## Database Schema (Supabase)

Migration creates:

```
image_collection (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  description TEXT,
  state TEXT,
  district TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## How to Run

### Install dependencies

```
npm install
```

### Start development server

```
npm run dev
```

### Environment variables

Create `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Submission Flow

1. User selects image
2. Image uploads to Supabase Storage
3. URL is returned
4. `image_collection` row is created with description + metadata
5. User sees success confirmation

---

## Scope of This Build

**Included**

* Contributor upload flow
* Supabase integration
* Tailwind + React UI
* Image + caption submission prototype

**Not Included**

* Admin dashboard
* Reviewer tools
* Coverage tracker
* Task 2 (transcriber analysis)

---

## Purpose

This prototype supports Task 1 by demonstrating how contributors across India can upload images with descriptions to build culturally rich datasets for AI model training.

---

If you want a **PRD**, **submission note**, or **final pitch summary**, bol dena — turant bana dunga.
