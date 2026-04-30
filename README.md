# TechNews — Real-time tech news with post engagement tools

TechNews is a responsive React news platform focused on technology content.  
It demonstrates practical frontend engineering patterns including reusable component architecture, API-based content rendering, interactive UI states, and clean scalable styling.

## Overview

The application allows users to:

- Browse tech posts in a modern card-based layout
- View a featured slider with curated/random highlighted posts
- React to posts with like/dislike interactions
- Create and submit new posts through a controlled form workflow
- Navigate seamlessly across responsive sidebar/navbar layouts

## Key Features

- **Responsive navigation system** (Sidebar for large screens, Navbar for small screens)
- **Featured posts slider** with smooth transitions and custom controls
- **Post cards** with image handling, metadata, tooltip titles, and quick actions
- **Like/Dislike counter** component with parent-controlled state management
- **Professional loading states** using animated placeholders
- **Create Post workflow** with controlled inputs, async submit handling, disabled-submit state, and toast feedback
- **Reusable design system components** (e.g., `MainButton`, `TooltipText`, shared utilities)
- **Local mock API integration** through `json-server`

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** CSS, Bootstrap 5
- **HTTP Client:** Axios
- **Notifications:** React Toastify
- **Icons:** Font Awesome
- **Mock Backend/Data:** json-server (`db.json`)

## Project Structure

```text
src/
  components/
    common/
    NavigationBars/
    Posts_Components/
    Explore_Components/
    Footer/
  pages/
    Home/
    Posts/
    Explore/
    CreatePost/
  utils/
    functions/
public/
db.json
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run mock API (json-server)

```bash
npx json-server --watch db.json --port 3000
```

### 3) Run frontend

```bash
npm run dev
```

### 4) Build for production

```bash
npm run build
```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Engineering Highlights

- Component decomposition for maintainability and reuse
- Responsive behavior handled via state + CSS media rules
- Controlled form design with explicit submit lifecycle (`isSubmitting`)
- Utility extraction for shared logic (e.g., date formatting)
- Defensive UI behavior (image fallback, disabled interactions during async operations)
