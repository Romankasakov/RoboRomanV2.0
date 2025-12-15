import tailwindPlugin from "prettier-plugin-tailwindcss";

/** @type {import("prettier").Config} */
const config = {
  plugins: [tailwindPlugin],
  tailwindFunctions: ["cn"],
};

export default config;
