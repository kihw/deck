# Branch Cleanup

This file documents branch cleanup processes.

## Completed Branch Cleanups

- ✅ `feature/complete-implementation` - Merged into main on 2025-05-05

## Development Workflow

We now use a direct-to-main development workflow. All changes are pushed directly to the main branch.

To push changes to the main branch, you can use the provided script:

```bash
./scripts/push-to-main.sh "Your commit message"
```

This script will:
1. Pull the latest changes from main
2. Stage all your changes
3. Commit with your message
4. Push directly to main

For more information on our development workflow, see the README.md file.
