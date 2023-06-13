import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
import esbuild from "esbuild";

/** Mapping from module paths to global variables */
const globals = {
  ethers: {
    varName: "ethers",
    // namedExports: ["ethers"],
    defaultExport: true,
  },
};

esbuild.build({
  entryPoints: ["lit_actions/src/multisig.action.ts"],
  outdir: "dist",
  bundle: true,
  plugins: [globalExternals(globals)],
});
