# Contributing to the CodePlus website

Thanks for wanting to help! The site is still under construction, so there's plenty to do,
and you don't need to be a web developer to contribute.

## Ways to help

- **Report a bug.** Something broken or looks off? [Open a bug report](https://github.com/ScorchedPearl/Codeplus/issues/new?template=bug_report.yml).
- **Suggest a feature.** [Open a feature request](https://github.com/ScorchedPearl/Codeplus/issues/new?template=feature_request.yml).
- **Suggest a resource.** Know a great blog, video, sheet or tool? [Suggest it](https://github.com/ScorchedPearl/Codeplus/issues/new?template=resource_suggestion.yml),
  or add it yourself in [`lib/resources.ts`](lib/resources.ts) and open a pull request.
- **Write code.** Pick an issue labelled `good first issue` or `help wanted`, or one you opened yourself.

## Making a code change

1. **Comment on the issue** you want to work on so others know it's taken. For bigger changes, describe your plan first.
2. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b fix/calendar-week-label
   ```
3. **Set up locally.** Follow [Running it locally](README.md#running-it-locally) in the README.
   Use your **own** free Supabase project. Never use or ask for the club's production database.
4. **Make your change.** Keep it focused on one thing.
5. **Check it:**
   ```bash
   npm run typecheck
   npm run build
   ```
   Then try your change in the browser in both light and dark mode, and at phone width.
6. **Open a pull request** against `main` and fill in the template. Add screenshots for anything visual.

A CodePlus member will review it. Small follow-up changes are normal, so don't worry if we ask for some.

## Guidelines

- **Match the existing style.** Look at nearby code and follow its naming, structure and comment style.
  Use the colour tokens from `app/globals.css` (`text-ink`, `bg-card`, `border-line`, `text-brand`, …)
  instead of hard-coded colours, so light and dark mode both work.
- **Keep the design calm.** Warm backgrounds, the CodePlus blues, serif headings. No glowing or blinking effects.
- **Database changes:** edit `lib/db/schema.ts`, run `npm run db:generate -- --name short_description`
  and commit the generated file in `drizzle/`.
- **No secrets in commits:** `.env.local`, passwords, API keys and personal phone numbers must never be committed.
- **Commit messages:** short and in the imperative, e.g. `Add week label to calendar`.

## Questions

Open a [discussion or issue](https://github.com/ScorchedPearl/Codeplus/issues) or email **codeplus@iiita.ac.in**.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE)
and that you'll follow our [Code of Conduct](CODE_OF_CONDUCT.md).
