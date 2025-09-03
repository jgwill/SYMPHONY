export interface Sample {
  label: string;
  value: string;
}

export const WORKSPACE_CONCEPTUALIZATION_SAMPLES: Sample[] = [
    {
        label: "Recipe Sharing App",
        value: "Develop a simple recipe sharing app. Users should be able to create accounts, submit recipes with ingredients and instructions, and view a list of all recipes. Add a feature for rating recipes."
    },
    {
        label: "Project Management Tool",
        value: "Create a lightweight project management tool. Core features should include creating projects, adding tasks with due dates, assigning tasks to users, and a dashboard to view upcoming tasks."
    },
    {
        label: "AI-Powered Blog Writer",
        value: "Build a blog writing assistant. The user provides a topic, and the AI suggests titles, outlines, and helps draft paragraphs. The editor should support markdown and have a live preview."
    }
];

export const WORKSPACE_QA_SAMPLES: Sample[] = [
    { label: "Technical Question", value: "How should I structure the database schema for the recipe app?" },
    { label: "Follow-up", value: "Can you elaborate on the authentication flow?" },
    { label: "High-level", value: "What are the key priorities for the MVP?" },
];

export const SPECLANG_SAMPLES: Sample[] = [
    {
        label: "Recipe App SpecLang",
        value: `## Overview
A simple recipe sharing application. It allows users to view, create, and rate recipes. The main goal is to provide a community-driven platform for cooking enthusiasts.

## Screens
- Screen: Home
  - Purpose: Display a gallery of recent or popular recipes.
  - Key Elements: Search bar, list of recipe cards, navigation to recipe detail.
- Screen: Recipe Detail
  - Purpose: Show the full details of a single recipe.
  - Key Elements: Recipe title, image, ingredients list, instructions, rating widget.
- Screen: Submit Recipe
  - Purpose: A form for authenticated users to add a new recipe.
  - Key Elements: Form fields for title, description, ingredients, instructions, image upload.

## Components
- Component: RecipeCard
  - Function: A compact display of a recipe for lists and galleries.
  - Properties: title (string), image (url), rating (number), author (string).
- Component: RatingWidget
  - Function: Allows users to view and submit a 1-5 star rating.
  - Properties: currentRating (number), onRate (function).

## Global Behaviors & Data
- Behavior: User Authentication
  - Explanation: Users must be able to register and log in. Only logged-in users can submit recipes or rate them.
- Data: Recipe
  - Explanation: Stores recipe details including ID, title, ingredients (array of strings), instructions (string), authorId, and average rating.

## Clarifying Questions for User
1. How should ingredients be structured? As a single text block or as a structured list of {amount, unit, name}?
2. Should there be recipe categories (e.g., dessert, main course) for filtering?
`
    },
    {
        label: "Project Management SpecLang",
        value: `## Overview
A Kanban-style project management tool for small teams. It focuses on visual task management.

## Screens
- Screen: Project Board
  - Purpose: Main view showing tasks organized into columns (e.g., To Do, In Progress, Done).
  - Key Elements: Draggable task cards, columns, button to add a new task.

## Components
- Component: TaskCard
  - Function: Represents a single task on the board.
  - Properties: title (string), assignee (avatar), dueDate (date).

## Clarifying Questions for User
1. Should users be able to create custom columns for the board?
2. What details should be visible on a task card versus in a detailed task view?
`
    }
];

export const AETHERIAL_IDEATION_SAMPLES: Sample[] = [
    {
        label: "Recipe Card Component",
        value: `## Component: RecipeCard
Function: A compact display of a recipe for lists and galleries.
Properties: title (string), image (url), rating (number), author (string).`
    },
    {
        label: "User Profile Screen",
        value: `## Screen: User Profile
Purpose: Display user information and their submitted recipes.
Key Elements: Avatar, username, bio, gallery of user's recipe cards.`
    }
];

export const AETHERIAL_REVISE_SAMPLES: Sample[] = [
    { label: "Add Feature", value: "Add a 'servings' property to the component and display it." },
    { label: "Refactor", value: "Refactor this component to use TypeScript interfaces for its props." },
    { label: "Add Styling", value: "Use TailwindCSS to style the card with a border and shadow." },
];

export const VISUALS_SAMPLES: Sample[] = [
    { label: "App Logo", value: "An artistic, abstract logo for 'SYMPHONY', a human-AI collaboration platform. It should evoke harmony, technology, and creativity. Use shades of cyan and indigo." },
    { label: "UI Wireframe", value: "A wireframe diagram for a user profile page. It should include a profile picture, username, user bio, and a list of their recent posts." },
    { label: "System Architecture", value: "A flowchart diagram showing a simple client-server architecture. A user makes a request from a browser, which goes to a load balancer, then to one of several web servers, and finally to a database." },
];

export const MIETTE_STORY_SAMPLES: Sample[] = [
    { label: "Recipe Search", value: "As a user, I want to be able to search for recipes by ingredient so I can find what to cook with what I have at home." },
    { label: "Task Assignment", value: "As a project manager, I need to assign tasks to team members so everyone knows what they are responsible for." },
];

export const MIETTE_CONCEPT_SAMPLES: Sample[] = [
    { label: "React Hooks", value: "React Hooks" },
    { label: "API Gateway", value: "API Gateway" },
    { label: "Structural Tension", value: "Structural Tension" },
];

export const MIETTE_EMPATHY_SAMPLES: Sample[] = [
    { label: "Login Page", value: "The user login experience." },
    { label: "Onboarding Flow", value: "A new user's onboarding flow for a project management tool." },
];

export const NYRO_SAMPLES: Sample[] = [
    { 
        label: "JS Code Snippet",
        value: `function get_user(id) {
    fetch('/api/users?id=' + id).then(res => {
        return res.json()
    }).then(data => {
        console.log(data.name);
    })
}`
    },
    {
        label: "SpecLang Section",
        value: `## Component: User Profile
Function: Shows user info.
Properties: name, email, avatar.`
    }
];

export const SERAPHINE_SAMPLES: Sample[] = [
    { label: "Milestone Reached", value: "Completed the MVP for the user authentication feature. The team celebrated with a virtual high-five." },
    { label: "Key Decision", value: "Decision: We will use PostgreSQL for the primary database instead of MongoDB to leverage its relational capabilities for complex queries." },
];
