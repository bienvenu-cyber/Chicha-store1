export default = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit type rules
    'type-enum': [2, 'always', [
      'build',     // Changes to build system or external dependencies
      'chore',     // Maintenance tasks, no production code change
      'ci',        // CI configuration and scripts
      'docs',      // Documentation updates
      'feat',      // New feature implementation
      'fix',       // Bug fixes
      'perf',      // Performance improvements
      'refactor',  // Code restructuring without changing behavior
      'revert',    // Reverting previous commits
      'style',     // Code formatting, missing semicolons
      'test',      // Adding or modifying tests
      'security'   // Security-related changes
    ]],
    
    // Strict type and subject rules
    'type-case': [2, 'always', 'lowercase'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lowercase'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    
    // Length constraints
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    
    // Scope recommendations
    'scope-enum': [1, 'always', [
      'frontend',
      'backend',
      'deps',
      'auth',
      'cart',
      'products',
      'orders',
      'payments',
      'tests',
      'ci',
      'docs'
    ]],
    
    // Additional custom rules
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100]
  },
  
  // Prompt configuration for commitizen
  prompt: {
    questions: {
      type: {
        description: "Select the type of change you're committing",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: 'Code style changes (formatting, semicolons)',
            title: 'Code Style',
            emoji: '💎'
          },
          refactor: {
            description: 'Code refactoring without changing functionality',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: 'Performance improvements',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: 'Adding or modifying tests',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description: 'Build system or external dependency changes',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: 'CI configuration and scripts',
            title: 'Continuous Integration',
            emoji: '⚙️'
          },
          chore: {
            description: 'Other changes that don\'t modify source or test files',
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑'
          }
        }
      },
      scope: {
        description: 'What is the scope of this change?'
      },
      subject: {
        description: 'Write a short, imperative mood description of the change'
      },
      body: {
        description: 'Provide a longer description of the change'
      },
      breaking: {
        description: 'Describe any breaking changes'
      },
      issues: {
        description: 'Add issue references (e.g., "fix #123", "closes #456")'
      }
    }
  }
};
