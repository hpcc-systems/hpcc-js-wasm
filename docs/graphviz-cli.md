# Command Line Interface

To call `dot-wasm` without installing:
```sh
npx -p @hpcc-js/wasm dot-wasm [options] fileOrDot
```

To install the global command `dot-wasm` via NPM:
```sh
npm install --global @hpcc-js/wasm
```

Usage:
```sh
Usage: dot-wasm [options] fileOrDot

Options:
      --version      Show version number                               [boolean]
  -K, --layout       Set layout engine (circo | dot | fdp | sfdp | neato | osage
                     | patchwork | twopi | nop | nop2). By default, dot is used.
  -T, --format       Set output language to one of the supported formats (svg,
                     dot, json, dot_json, xdot_json, plain, plain-ext). By
                     default, svg is produced.
  -n, --neato-no-op  Sets no-op flag in neato.
                     "-n 1" assumes neato nodes have already been positioned and
                     all nodes have a pos attribute giving the positions. It
                     then performs an optional adjustment to remove node-node
                     overlap, depending on the value of the overlap attribute,
                     computes the edge layouts, depending on the value of the
                     splines attribute, and emits the graph in the appropriate
                     format.
                     "-n 2" Use node positions as specified, with no adjustment
                     to remove node-node overlaps, and use any edge layouts
                     already specified by the pos attribute. neato computes an
                     edge layout for any edge that does not have a pos
                     attribute. As usual, edge layout is guided by the splines
                     attribute.
  -y, --invert-y     By default, the coordinate system used in generic output
                     formats, such as attributed dot, extended dot, plain and
                     plain-ext, is the standard cartesian system with the origin
                     in the lower left corner, and with increasing y coordinates
                     as points move from bottom to top. If the -y flag is used,
                     the coordinate system is inverted, so that increasing
                     values of y correspond to movement from top to bottom.
  -v                 Echo GraphViz library version
  -h, --help         Show help                                         [boolean]

Examples:
  dot-wasm -K neato -T xdot ./input.dot  Execute NEATO layout and outputs XDOT
                                         format.
```
