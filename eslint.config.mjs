import dsaireadable from '@dsaireadable/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.cache', 'node_modules', 'src/components/ui', 'src/runtime/claude/contract'] },
  ...tseslint.configs.recommended,
  ...dsaireadable.createConfig({ ignores: ['src/components/ui/**'] }),
  {
    settings: { 'better-tailwindcss': { entryPoint: 'src/index.css' } },
    rules: {
      // Candidate components (absent from the DS) live outside components/ui.
      'dsaireadable/no-external-ui-imports': [
        'error',
        { allowedOrigins: ['@/components/ui/', '@/components/candidates/'] },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
)
