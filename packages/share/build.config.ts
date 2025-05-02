import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index"], // pack entry: packages/share/src/index
  outDir: "./dist", // outDir after pack: packages/share/dist
  declaration: true, // exprot ts code(rather than js) so other project (like client, server) can use type hint
  rollup: {
    emitCJS: true, //  output commonjs code
  },
  externals: ["react", "react-dom", "antd", "@ant-design/icons"], // exclude external dependencies, client has already downloaded
});
