const { build } = require("esbuild");
const path = require("node:path");

const define = {};
for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

build({
  platform: "node",
  target: "node18",
  bundle: true,
  minify: true,
  sourcemap: true,
  define,
  tsconfig: "tsconfig.json",
  entryPoints: [path.join(__dirname, "./src/index.ts")],
  outdir: "dist",
}).catch(() => process.exit(1));
