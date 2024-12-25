#!/usr/bin/env python3
import os
import re
import sys

def convert_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Convert CommonJS requires to ES imports
    # Handle different import scenarios
    conversions = [
        # Jest globals import
        (r'const { (.*) } = require\("@jest/globals"\);', r'import { \1 } from "@jest/globals";'),
        (r'const { (.*) } = require\(@jest/globals\);', r'import { \1 } from "@jest/globals";'),
        
        # Local module imports
        (r'const (.*) = require\("\.([^"]+)"\);', r'import \1 from ".\2.js";'),
        (r'const (.*) = require\("\.([^"]+)\'\);', r'import \1 from ".\2.js";'),
        
        # Destructured imports
        (r'const { (.*) } = require\("\.([^"]+)"\);', r'import { \1 } from ".\2.js";'),
        (r'const { (.*) } = require\("\.([^"]+)\'\);', r'import { \1 } from ".\2.js";'),
        
        # External module imports
        (r'const (.*) = require\("([^"]+)"\);', r'import \1 from "\2";'),
        (r'const (.*) = require\("([^"]+)\'\);', r'import \1 from "\2";'),
        
        # Module.exports to export default
        (r'module\.exports\s*=\s*([^;]+);', r'export default \1;'),
        
        # Exports with multiple items
        (r'module\.exports\s*=\s*{([^}]+)};', r'export { \1 };')
    ]

    for pattern, replacement in conversions:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

    # Special handling for Jest mocks
    content = re.sub(
        r'jest\.mock\("([^"]+)", require\("([^"]+)"\)\);', 
        r'jest.mock("\1", () => require("\2"));', 
        content
    )
    content = re.sub(
        r"jest\.mock\('([^']+)', require\('([^']+)'\)\);", 
        r"jest.mock('\1', () => require('\2'));", 
        content
    )

    # Ensure logger mocks use .js extension
    content = re.sub(
        r'jest\.mock\("([^"]+)/logger"', 
        r'jest.mock("\1/logger.js"', 
        content
    )
    content = re.sub(
        r"jest\.mock\('([^']+)/logger'", 
        r"jest.mock('\1/logger.js'", 
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

def main():
    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
    
    # Convert all .js files in backend
    for root, _, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.js'):
                filepath = os.path.join(root, file)
                try:
                    convert_file(filepath)
                    print(f"Converted: {filepath}")
                except Exception as e:
                    print(f"Error converting {filepath}: {e}")

    # Update Jest config
    jest_config_path = os.path.join(os.path.dirname(__file__), '..', 'jest.config.js')
    with open(jest_config_path, 'w') as f:
        f.write('''export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/(?!express)/'
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js$',
    moduleFileExtensions: ['js', 'json', 'node']
};''')

    print("Conversion to ES Modules complete!")

if __name__ == '__main__':
    main()
