module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Define type-enum rule as a function
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Changes that do not affect the meaning of the code (white-space, formatting, etc.)
        'refactor', // Code changes that neither fix a bug nor add a feature
        'perf', // Performance improvement
        'test', // Adding missing tests
        'chore', // Changes to the build process or auxiliary tools and libraries such as documentation generation
        'build', // Changes that affect the build system or external dependencies
        'ci', // Changes to our CI configuration files and scripts
        'revert', // Reverts a previous commit
        // Add more types if needed
      ],
    ],
  },
};
