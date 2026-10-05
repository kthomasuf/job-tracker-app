import type { NextConfig } from "next";

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/,
// so the build needs to know its own base path. GITHUB_ACTIONS is set
// automatically by the CI runner, so local `npm run dev`/`npm run build`
// stay at the site root.
const repoName = "job-tracker-app";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGithubActions ? `/${repoName}` : "",
  assetPrefix: isGithubActions ? `/${repoName}/` : "",
};

export default nextConfig;
