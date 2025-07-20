import { readFile } from 'fs/promises';

const processedFiles = new Map();

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatchingBrace(contents, openBraceIndex) {
    let braceCount = 1;
    let currentIndex = openBraceIndex + 1;
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let commentType = '';

    while (currentIndex < contents.length && braceCount > 0) {
        const char = contents[currentIndex];
        const nextChar = contents[currentIndex + 1];

        if (!inComment && (char === '"' || char === "'" || char === '`')) {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar && contents[currentIndex - 1] !== '\\') {
                inString = false;
                stringChar = '';
            }
        }

        if (!inString && !inComment) {
            if (char === '/' && nextChar === '/') {
                inComment = true;
                commentType = 'line';
                currentIndex++;
            } else if (char === '/' && nextChar === '*') {
                inComment = true;
                commentType = 'block';
                currentIndex++;
            }
        } else if (inComment) {
            if (commentType === 'line' && char === '\n') {
                inComment = false;
                commentType = '';
            } else if (commentType === 'block' && char === '*' && nextChar === '/') {
                inComment = false;
                commentType = '';
                currentIndex++;
            }
        }

        if (!inString && !inComment) {
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
            }
        }

        currentIndex++;
    }

    return braceCount === 0 ? currentIndex - 1 : -1;
}

function replaceFunctionByName(contents, functionName, replacement, patterns) {
    let result = contents;

    for (const pattern of patterns) {
        pattern.lastIndex = 0;

        let match;
        while ((match = pattern.exec(result)) !== null) {
            const startIndex = match.index;
            const matchEnd = match.index + match[0].length;

            const closingBraceIndex = findMatchingBrace(result, matchEnd - 1);

            if (closingBraceIndex !== -1) {
                result = result.slice(0, startIndex) + replacement + result.slice(closingBraceIndex + 1);

                pattern.lastIndex = 0;
                break;
            }
        }
    }

    return result;
}
export const replaceString = (replacements) => {
    if (!replacements || typeof replacements !== 'object') {
        throw new Error('replaceString: replacements must be an object');
    }

    return {
        name: 'replace-string',
        setup(build) {
            // Store the original write option
            const originalWrite = build.initialOptions.write !== false;

            // Disable writing so we can intercept the output
            build.initialOptions.write = false;

            build.onEnd(async (result) => {
                if (result.errors.length > 0 || !result.outputFiles) return;

                const { writeFile, mkdir } = await import('fs/promises');
                const { dirname } = await import('path');

                for (const outputFile of result.outputFiles) {
                    let contents = new TextDecoder().decode(outputFile.contents);
                    let modified = false;

                    // Check if any of the target strings exist in the file
                    const hasTargetString = Object.keys(replacements).some(searchString =>
                        contents.includes(searchString)
                    );

                    if (hasTargetString) {
                        // Replace all occurrences of each string
                        for (const [searchString, replacement] of Object.entries(replacements)) {
                            if (contents.includes(searchString)) {
                                contents = contents.replaceAll(searchString, replacement);
                                modified = true;
                            }
                        }
                    }

                    // Write the file (modified or not)
                    if (originalWrite) {
                        try {
                            // Ensure directory exists
                            await mkdir(dirname(outputFile.path), { recursive: true });
                            await writeFile(outputFile.path, contents, 'utf8');
                        } catch (error) {
                            console.warn(`[replace-string] Failed to write ${outputFile.path}:`, error.message);
                        }
                    }
                }
            });
        },
    };
};

export const replaceFunction = (replacements) => {
    if (!replacements || typeof replacements !== 'object') {
        throw new Error('replaceFunction: replacements must be an object');
    }

    const functionPatterns = Object.keys(replacements).map(functionName => ({
        name: functionName,
        replacement: replacements[functionName],
        patterns: [
            new RegExp(`function\\s+${escapeRegExp(functionName)}\\s*\\([^)]*\\)\\s*{`, 'g'),
            new RegExp(`const\\s+${escapeRegExp(functionName)}\\s*=\\s*function\\s*\\([^)]*\\)\\s*{`, 'g'),
            new RegExp(`let\\s+${escapeRegExp(functionName)}\\s*=\\s*function\\s*\\([^)]*\\)\\s*{`, 'g'),
            new RegExp(`var\\s+${escapeRegExp(functionName)}\\s*=\\s*function\\s*\\([^)]*\\)\\s*{`, 'g'),
            new RegExp(`${escapeRegExp(functionName)}\\s*:\\s*function\\s*\\([^)]*\\)\\s*{`, 'g'),
            new RegExp(`${escapeRegExp(functionName)}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{`, 'g'),
            new RegExp(`const\\s+${escapeRegExp(functionName)}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{`, 'g'),
            new RegExp(`let\\s+${escapeRegExp(functionName)}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{`, 'g'),
            new RegExp(`var\\s+${escapeRegExp(functionName)}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{`, 'g')
        ]
    }));

    return {
        name: 'replace-function',
        setup(build) {
            build.onLoad({ filter: /\.js$/ }, async (args) => {
                try {
                    const cacheKey = `${args.path}:${JSON.stringify(replacements)}`;
                    if (processedFiles.has(cacheKey)) {
                        return processedFiles.get(cacheKey);
                    }

                    let contents = await readFile(args.path, 'utf8');
                    let modified = false;

                    const hasTargetFunction = functionPatterns.some(({ name }) =>
                        contents.includes(name)
                    );

                    if (!hasTargetFunction) {
                        const result = { contents, loader: 'js' };
                        processedFiles.set(cacheKey, result);
                        return result;
                    }

                    for (const { name, replacement, patterns } of functionPatterns) {
                        const result = replaceFunctionByName(contents, name, replacement, patterns);
                        if (result !== contents) {
                            contents = result;
                            modified = true;
                        }
                    }

                    const result = { contents, loader: 'js' };

                    processedFiles.set(cacheKey, result);

                    return result;
                } catch (error) {
                    console.warn(`[replace-function] Failed to process ${args.path}:`, error.message);
                    return null;
                }
            });
        },
    };
};

export function clearCache() {
    processedFiles.clear();
}
