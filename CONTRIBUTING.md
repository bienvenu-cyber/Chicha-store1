# Contributing to Chicha Store

## Welcome! 👋

We love your input and appreciate contributions from our community. This document provides guidelines for contributing to the Chicha Store project.

## Conventional Commits 📝

We use Conventional Commits to standardize our commit messages. This helps us generate changelogs and version our project automatically.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description                                | Emoji |
|------------|--------------------------------------------| ----- |
| `feat`     | New feature                                | ✨    |
| `fix`      | Bug fix                                    | 🐛    |
| `docs`     | Documentation changes                      | 📚    |
| `style`    | Code formatting                            | 💎    |
| `refactor` | Code refactoring                           | 📦    |
| `perf`     | Performance improvements                   | 🚀    |
| `test`     | Adding or modifying tests                  | 🚨    |
| `build`    | Build system changes                       | 🛠    |
| `ci`       | CI configuration changes                   | ⚙️    |
| `chore`    | Maintenance tasks                          | ♻️    |
| `revert`   | Reverting previous commits                 | 🗑    |
| `security` | Security-related changes                   | 🔒    |

### Examples

```bash
# Adding a new feature
git commit -m "feat(cart): add product quantity selector"

# Fixing a bug
git commit -m "fix(auth): resolve login error handling"

# Documentation update
git commit -m "docs: update README with setup instructions"
```

## Development Workflow 🚀

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linters
5. Commit with conventional commit message
6. Push and create a Pull Request

### Commit Tools

We use `commitizen` for interactive commit message creation:

```bash
# Stage your changes
git add .

# Use commitizen to create commit
npm run commit
```

## Code of Conduct 🤝

Please be respectful, inclusive, and considerate of others.

## Questions? 💬

Open an issue or reach out to the maintainers.

Happy Contributing! 🎉
