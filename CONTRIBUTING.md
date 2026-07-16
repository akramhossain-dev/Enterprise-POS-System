# Contribution Guidelines — Enterprise POS System

Welcome! Thank you for participating in the development of the Enterprise POS System. Please review this guide before opening issues or submitting pull requests.

---

## Code of Conduct

- Maintain a polite, professional, and collaborative environment.
- Ensure clear communication in PR descriptions and comments.

---

## Development Branching Strategy

Our release process is structured using feature branches pointing to an integration branch:

```
                  ┌───────────────────────┐
                  │    develop Branch     │  (Default integration targets)
                  └─────▲───────────▲─────┘
                        │           │
       ┌────────────────┴┐         ┌┴────────────────┐
       │   feature/...   │         │     fix/...     │  (Short-lived task branches)
       └─────────────────┘         └─────────────────┘
```

- **develop** — Active development integration branch. All feature branches must branch from and PR into `develop`.
- **main** — Locked branch containing stable production releases. Merged only via release pipelines from `develop`.
- **feature/F-XXX-\<desc\>** — Feature branches. Target a single tickets scope (`F-XXX`).
- **fix/F-XXX-\<desc\>** — Issue resolution and bug fixes.

---

## Commit Message Conventions

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) structure:

```
<type>(<scope>): <description>

[optional body]
```

### Supported Types

- `feat` — A new feature additions.
- `fix` — A bug resolution.
- `refactor` — Restructuring source code without changing execution logic.
- `test` — Adding or updating test cases.
- `docs` — Modifying documentation only.
- `chore` — Auxiliary repository tasks (dependency updates, tool config).

_Example commit:_
`feat(auth): integrate multi-tab logout notification channel`

---

## Pull Request Submission Checks

Before requesting reviews on a Pull Request, verify that all local checks pass successfully:

1.  **Format Code:** Ensure Prettier styling rules are clean:
    ```bash
    pnpm format
    ```
2.  **Lint Check:** Run the static code quality checks:
    ```bash
    pnpm lint
    ```
3.  **Type Checks:** Confirm TypeScript compiler builds cleanly:
    ```bash
    pnpm type-check
    ```
4.  **Unit Tests:** Run all tests and verify coverage thresholds are met:
    ```bash
    pnpm test:coverage
    ```

---

## Pull Request Guidelines

- Provide a clear, descriptive summary of changes in the PR description.
- Link the PR to the relevant issue or ticket.
- Reviewers will ensure code meets performance, accessibility, security, and test coverage standards before approvals.
