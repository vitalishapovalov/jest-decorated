import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.ts",
    output: [
        { file: "dist/index.umd.js", format: "umd", sourcemap: true },
        { file: "dist/index.esm.js", format: "es", sourcemap: true },
    ],
    watch: {
        include: 'src/**',
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            abortOnError: true,
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                }
            }
        }),
        commonjs(),
        resolve(),
        terser(),
        sourceMaps()
    ]
};
