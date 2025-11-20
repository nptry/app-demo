Before handing off work:
1. Run `npm run lint` to ensure Biome + TS checks pass.
2. Run relevant `npm test` suites (and `npm run test:coverage` if touching shared logic).
3. For release work, `npm run build` plus `npm run preview` to verify the production bundle.
4. Update mock data in `mock/` and localized copy in `src/locales/` when changing API contracts or menu labels.
5. Document notable changes in PRD docs (`prd.md`, `prd-detail.md`) if they shift scope.