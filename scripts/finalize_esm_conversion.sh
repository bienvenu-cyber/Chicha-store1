#!/bin/bash

# Convertir les imports et mocks pour les fichiers de test
for file in $(find ../backend/__tests__ -type f -name "*.js"); do
    # Convertir les require de Jest à des imports
    sed -i '' 's/const { jest, describe, test, expect, beforeEach, afterEach } = require("@jest\/globals")/import { jest, describe, test, expect, beforeEach, afterEach } from "@jest\/globals"/g' "$file"
    sed -i '' "s/const { jest, describe, test, expect, beforeEach, afterEach } = require('@jest\/globals')/import { jest, describe, test, expect, beforeEach, afterEach } from '@jest\/globals'/g" "$file"

    # Convertir les require de modules locaux à des imports
    sed -i '' 's/const \(.*\) = require("\.\(.*\)")/import \1 from ".\2.js"/g' "$file"
    sed -i '' "s/const \(.*\) = require('\.\(.*\)')/import \1 from '.\2.js'/g" "$file"

    # Convertir les require de modules avec destructuring
    sed -i '' 's/const { \(.*\) } = require("\.\(.*\)")/import { \1 } from ".\2.js"/g' "$file"
    sed -i '' "s/const { \(.*\) } = require('\.\(.*\)')/import { \1 } from '.\2.js'/g" "$file"

    # Convertir les mocks de logger
    sed -i '' 's/jest\.mock("\(.*\)\/logger", () => ({/jest.mock("\1\/logger.js", () => ({/g' "$file"
    sed -i '' "s/jest\.mock('\(.*\)\/logger', () => ({/jest.mock('\1\/logger.js', () => ({/g" "$file"

    # Convertir les mocks avec require
    sed -i '' 's/jest\.mock("\(.*\)", require("\(.*\)"))/jest.mock("\1", () => require("\2"))/g' "$file"
    sed -i '' "s/jest\.mock('\(.*\)', require('\(.*\)'))/jest.mock('\1', () => require('\2'))/g" "$file"
done

echo "Conversion finale des modules terminée !"
