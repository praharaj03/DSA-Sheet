# DSA Sheet Tracker

Static Next.js page for the Apna College DSA sheet (375 questions, 16 topics).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out (deploy to Vercel, Netlify, GitHub Pages)
```

- Progress (checkboxes) is saved in the browser's localStorage.
- Edit questions in `data/sheet.ts`. Company names are turned into logos by `lib/companies.ts`.
- Company logos load from Google's favicon service, so they need an internet connection.
- "LeetCode" links open a LeetCode search and "GFG" opens a Google search limited to geeksforgeeks.org.
  To use direct links, add a 4th value per row in `data/sheet.ts` and use it in `lib/data.ts`.
