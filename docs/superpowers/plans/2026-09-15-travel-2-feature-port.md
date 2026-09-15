# Travel_2 Feature Port Implementation Plan

> For agentic workers: execute the tasks in order and verify each task before continuing.

**Goal:** Bring the new destination, map, home-page, and AI-agent behavior from Travel_2 into the current Travel Platform branch while retaining its OAuth, password recovery, admin profile, and design-system work.

**Architecture:** Port the incremental Travel_2 commit and its current AI changes against their common ancestor, then resolve conflicts in the destination, map, AI, and frontend flows against the current branch. Keep local `.env` files and installed/generated dependencies outside the port.

**Follow-up configuration:** At the user's request, Gemini is the default provider. The target backend `.env` has only its AI settings synchronized with Travel_2: the Gemini key, Flash planner, Flash-Lite chat model, 120-second timeout, and zero retries.

**Tech Stack:** Node.js, TypeScript, Express, Prisma, React, Vite, and Node test runner.

## Global Constraints

- Do not replace either project's real `.env` files.
- Keep target-only OAuth, password reset, admin profile, and design-system features.
- Do not copy `node_modules`, `dist`, or other generated build output from Travel_2.
- Restore missing trip source files from the target branch before testing; the baseline build currently fails because of those deletions.

## Task 1: Restore and verify the target baseline

- [x] Restore the deleted trip modules and favicon from the target branch without changing other existing features.
- [x] Reinstall dependencies from the target lockfiles and regenerate the Prisma client.
- [x] Run backend and frontend build commands and record any remaining baseline failures.

## Task 2: Destination data, photos, and verified map coordinates

- [x] Add the Travel_2 destination data, photos, import scripts, migration, provenance fields, and tests.
- [x] Integrate seed, repository, service, validator, and map changes with the current Prisma schema and existing API behavior.
- [x] Run the focused backend tests and build.

## Task 3: Destination search, map cache, and home presentation

- [x] Add the Travel_2 frontend search, tile, cache, motion utilities, images, docs, and tests.
- [x] Integrate the destination list/detail, itinerary map, home page, and shared styles with the current design system.
- [x] Run focused frontend tests, type check, and build.

## Task 4: AI itinerary agent and draft preview

- [x] Add the current Travel_2 AI tests and preview component before implementation changes; confirm the tests expose the missing behavior.
- [x] Integrate provider settings, search/repository tools, draft creation, and chat preview into the current AI flow.
- [x] Run backend/frontend AI tests and both full test suites. The backend smoke subset needs a live Redis service; four existing integration cases fail when Redis is unavailable.

## Task 5: Final review

- [x] Check the diff for unintended changes to OAuth, password reset, admin profile, `.env`, and generated files.
- [x] Run backend/frontend build, tests, and lint where available; report any environment-dependent limitations.
