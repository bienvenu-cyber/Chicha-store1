#!/bin/bash

# Semantic Release Script for Chicha Store

# Ensure script stops on any error
set -e

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "Error: Git working directory is not clean. Commit or stash changes first."
    exit 1
fi

# Prompt for version bump type
echo "Select version bump type:"
select version_type in "patch" "minor" "major"; do
    case $version_type in
        patch|minor|major ) break;;
        * ) echo "Invalid selection. Please choose patch, minor, or major.";;
    esac
done

# Bump version in package.json
npm version $version_type -m "Bump version to %s"

# Run tests
npm test

# Build production assets
npm run build

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Commit changelog
git add CHANGELOG.md
git commit -m "docs: update changelog for $version_type release"

# Push changes and tags
git push origin main
git push origin --tags

# Publish to npm
npm publish

echo "Release $version_type completed successfully!"
