/**
 * Static export, because Phase 0 has no server to deploy.
 *
 * Every route is already prerendered — all state is local, generation is a pure
 * function, and nothing reads a request. A static host is not a compromise
 * here; it is what the architecture already implied.
 *
 * The base path is applied only when building for GitHub Pages, which serves a
 * project site from a subdirectory. Hard-coding it would move local dev to
 * /MoveHere for no reason, so CI opts in through the environment.
 *
 * trailingSlash makes the export emit park/index.html rather than park.html,
 * which is what GitHub Pages resolves reliably for an extensionless URL.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
export default {
  typedRoutes: true,
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};
