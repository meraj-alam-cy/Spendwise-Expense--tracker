# SpendWise — Expense Tracker

A responsive personal expense tracker built with HTML, CSS, and vanilla JavaScript.

## Live demo

After enabling GitHub Pages, the intended URL is:
**https://meraj-alam-cy.github.io/Spendwise-Expense--tracker/**

## Features
- Add expenses with a title, amount, category, and date.
- Filter and delete transactions.
- Set a monthly budget and see remaining funds.
- View spending by category and budget progress.
- Responsive layout for mobile and desktop.
- Saves data in your browser using `localStorage`; no server or API keys required.

## Run locally
Download or clone this repository and open `index.html` in a modern browser. Alternatively, run `python -m http.server 8000` from the project directory and open `http://localhost:8000`.

## Files
- `index.html` — page structure and dialogs
- `style.css` — responsive dashboard styles
- `script.js` — expense and budget logic
- `.github/workflows/deploy-pages.yml` — automatic Pages deployment

## Deployment
1. In repository Settings → Pages, choose **Deploy from a branch**, then select `main` and `/(root)` and save; **or** use GitHub Actions and the included workflow.
2. For the included workflow, go to Settings → Pages and set the source to **GitHub Actions** if that option is available.
3. Open the **Actions** tab and wait for “Deploy SpendWise to GitHub Pages” to finish successfully.
4. Visit the live demo URL above. The first deployment can take a few minutes.

## Privacy
Entries are stored locally in the browser. They are not uploaded to a server. Clearing browser data or switching devices can remove or hide saved expenses.

## License
MIT — see `LICENSE`.
