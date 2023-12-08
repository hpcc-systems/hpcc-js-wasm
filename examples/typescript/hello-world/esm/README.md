# Hello World Example

This example shows how to use the `@hpcc-js/wasm` package within a modern ESM TypeScript project.

## Steps to build and test

1. Install dependencies

    ```bash
    npm install
    ```

2. Build the project

    ```bash
    npm run build
    ```

3. Execute in Node

    ```bash
    node index.js
    ```

## How this project was created

1. Create a generic typescript project

    ```bash
    mkdir hello-world
    cd hello-world
    npm init -y
    npm install --save-dev typescript
    npm install --save @types/node
    npx tsc --init
    ```

2. Edit package.json
    
    ```json
    {
        ...
        "type": "module",
        "main": "index.js",
        "scripts": {
            "build": "tsc -p tsconfig.json",
            "test": "npm run build && node ."
        },
        ...
    }
    ```

2. Edit tsconfig.json
    
    ```json
    {
        ...
        "module": "Node16",
        ...
    }
    ```
