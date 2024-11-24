import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  rules: {
    // Allow console statements
    'no-console': 'off',
  },
})
