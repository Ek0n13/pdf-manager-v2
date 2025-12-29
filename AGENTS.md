# Repository Guidelines

## Project Structure & Module Organization
- `src/main` contains the Electron main process and app lifecycle wiring.
- `src/preload` holds preload scripts and IPC bridges exposed to the renderer.
- `src/renderer` is the React UI, including Tailwind styling and components.
- `resources` stores packaged assets used by the Electron builder.
- `build` and `out` are build outputs; do not edit by hand.
- `assetsBKP` is a local backup folder; treat it as read-only unless you are restoring assets.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies and runs `electron-builder install-app-deps`.
- `pnpm dev` starts the Electron Vite dev server with hot reload.
- `pnpm start` runs the preview build via Electron Vite.
- `pnpm build` typechecks and produces production bundles.
- `pnpm build:win|build:mac|build:linux` creates platform installers.
- `pnpm build:unpack` builds an unpacked app for local inspection.
- `pnpm lint` runs ESLint; `pnpm format` runs Prettier.

## Coding Style & Naming Conventions
- Indentation is 2 spaces with LF endings per `.editorconfig`.
- Prettier enforces single quotes, no semicolons, 100-char lines.
- ESLint uses Electron Toolkit + React/React Hooks recommendations.
- Prefer `PascalCase` for React components and `camelCase` for functions and vars.

## Testing Guidelines
- No automated test runner is configured in `package.json`.
- Until tests are added, treat `pnpm lint` and `pnpm typecheck` as required checks.
- If you introduce tests, add a script and document the command here.

## Commit & Pull Request Guidelines
- Commit messages in history are short, lowercase summaries (e.g., “basic ui design”).
- Keep commits focused; avoid mixing build artifacts with source changes.
- PRs should include a concise description, linked issues if any, and UI screenshots for renderer changes.

## Security & Configuration Tips
- Keep `electron-builder.yml` and `dev-app-update.yml` in sync with release targets.
- Avoid hardcoding secrets in `src` or config; prefer environment variables.
- Review preload APIs carefully; they are a security boundary between main and renderer.
