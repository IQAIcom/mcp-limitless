# Contributing to MCP Limitless

Thank you for your interest in contributing to MCP Limitless! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## Code of Conduct

Please be respectful and constructive in all interactions. We're here to build great software together.

## Getting Started

1. **Fork the repository**
   ```bash
   gh repo fork IQAIcom/mcp-limitless
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-limitless.git
   cd mcp-limitless
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Project Structure

```
src/
├── services/      # Business logic and API interactions
├── tools/         # MCP tool definitions
├── lib/           # Shared utilities
└── index.ts       # Main entry point

tests/
├── unit/          # Unit tests
├── integration/   # Integration tests
└── helpers/       # Test utilities and fixtures
```

### Running the Server

```bash
# Development mode with auto-rebuild
pnpm run watch

# Build and run
pnpm run build
pnpm run start
```

### Adding a New Tool

1. **Create a service** in `src/services/[tool-name].ts`:
   ```typescript
   export class MyToolService {
     async execute(params: any): Promise<any> {
       // API interaction
     }

     format(response: any): string {
       // Format response for display
     }
   }
   ```

2. **Create a tool** in `src/tools/[tool-name].ts`:
   ```typescript
   import { z } from "zod";
   import { MyToolService } from "../services/[tool-name].js";

   const myToolParams = z.object({
     param: z.string().describe("Description"),
   });

   export const myTool = {
     name: "MY_TOOL",
     description: "Tool description",
     parameters: myToolParams,
     execute: async (params) => {
       const service = new MyToolService();
       const result = await service.execute(params.param);
       return service.format(result);
     },
   };
   ```

3. **Register the tool** in `src/index.ts`:
   ```typescript
   import { myTool } from "./tools/[tool-name].js";
   server.addTool(myTool);
   ```

4. **Add tests** (see [Testing](#testing))

## Testing

### Running Tests

```bash
# Run all unit tests
pnpm test:unit

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run integration tests (optional)
pnpm test:integration
```

### Writing Tests

Follow the existing test patterns in `tests/unit/`:

1. **Service tests**: Test API interaction and formatting
2. **Tool tests**: Test parameter validation and execution flow

See `tests/README.md` for detailed testing guidelines.

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks locally**
   ```bash
   pnpm run lint
   pnpm run format
   pnpm test:unit
   pnpm run build
   ```

3. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**
   - Use the PR template
   - Link any related issues
   - Ensure CI passes
   - Request review

### PR Requirements

- ✅ All tests pass
- ✅ Linting passes
- ✅ Build succeeds
- ✅ Code coverage maintained or improved
- ✅ Documentation updated if needed
- ✅ No merge conflicts

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use `const` for immutable values
- Avoid `any` - use proper types

### Code Style

- Use Biome for formatting and linting
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions small and focused

### File Organization

- One tool/service per file
- Use barrel exports (`index.ts`) for modules
- Keep related code together

### Error Handling

```typescript
try {
  const result = await service.execute();
  return result;
} catch (error) {
  if (error instanceof Error) {
    console.log(`Error in TOOL_NAME: ${error.message}`);
    return `Error: ${error.message}`;
  }
  return "An unknown error occurred";
}
```

## Commit Messages

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(tools): add get-historical-price tool
fix(auth): handle expired session tokens
docs(readme): add installation instructions
test(services): add tests for search-markets service
chore(deps): update dependencies
```

## Questions?

- Open a [Discussion](https://github.com/IQAIcom/mcp-limitless/discussions)
- Check existing [Issues](https://github.com/IQAIcom/mcp-limitless/issues)
- Read the [Documentation](https://github.com/IQAIcom/mcp-limitless#readme)

Thank you for contributing! 🎉
