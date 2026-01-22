# Code Style Guidelines

## Formatting (enforced by Prettier)
- 2-space indentation
- No semicolons (unless required)
- Single quotes for strings
- Trailing commas
- 100 character line width

## TypeScript
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and mapped types
- No `any` - use `unknown` if type is truly unknown
- Use Zod schemas for runtime validation

## React Components
- Use function components with arrow syntax
- Props interface named `[ComponentName]Props`
- Destructure props in function signature
- Use `cn()` for conditional Tailwind classes

```tsx
interface CourseCardProps {
  course: Course;
  onEdit: (id: string) => void;
}

export const CourseCard = ({ course, onEdit }: CourseCardProps) => {
  return (
    <div className={cn("p-4", isActive && "bg-primary")}>
      {/* ... */}
    </div>
  );
};
```

## Imports
- Group imports: React/Next → external libs → internal modules → types
- Use absolute imports with `@/` prefix (maps to project root)
- Named exports preferred over default exports

```tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Course } from "@/lib/courses/types";
```

## Naming Conventions
| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CourseCard` |
| Hooks | camelCase with `use` prefix | `useCourses` |
| Files (components) | kebab-case | `course-card.tsx` |
| Files (utilities) | kebab-case | `format-date.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `CourseInput` |
| Zod schemas | camelCase with `Schema` suffix | `courseSchema` |

## CSS / Tailwind
- Use Tailwind utilities, avoid custom CSS
- Use CSS variables for colors (defined in `globals.css`):
  - `text-primary`, `bg-primary`, `border-primary`
  - `text-muted-foreground`, `bg-muted`
  - `text-destructive`, `bg-destructive`
- Use `cn()` for conditional classes
- Mobile-first responsive design (`sm:`, `md:`, `lg:`)

## Error Handling
- Use try/catch in async functions
- Return typed error responses from API routes
- Use Zod `.safeParse()` for validation with error handling
- Toast notifications for user-facing errors (sonner)

## Comments
- Comment the "why", not the "what"
- Use JSDoc for public functions/components
- TODO format: `// TODO: description`
