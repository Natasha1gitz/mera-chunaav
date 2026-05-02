# Contributing to Mera Chunaav

Thank you for your interest in contributing to **Mera Chunaav**, an open-source civic education platform. 

## Code of Conduct
Please ensure all interactions are respectful and constructive. We are building a platform to empower citizens, and our community reflects those values.

## Development Setup
1. Fork and clone the repository.
2. Run `npm install` to install testing and linting dependencies.
3. Add your `config.js` with your Firebase, Gemini, and Google Maps API keys (this file is gitignored).
4. Start the local server: `npm start`.

## Pull Request Process
1. Create a feature branch (`git checkout -b feature/your-feature`).
2. Ensure your code passes all linting rules (`npm run lint`).
3. Ensure all 40 end-to-end and unit tests pass (`npm test`).
4. Submit your PR with a clear description of the changes.

## Architecture Guidelines
- **No heavy frameworks:** We use Vanilla JS for maximum efficiency and accessibility.
- **JSDoc:** All new functions must include standard JSDoc comments.
- **Security:** All user input must pass through the `sanitizeHTML` utility.

Thank you for helping build a stronger democracy!
