# JSON Methods for DuckDB Results

This package provides two methods for converting query results to JSON:

1. `MaterializedQueryResult.toJSON()` - Convert an existing result to JSON
2. `Connection.queryToJSON(sql)` - Execute a query and get JSON in one call (recommended)

## Usage Examples

### Using queryToJSON (Recommended)

```javascript
import { DuckDB } from '@hpcc-js/wasm-duckdb';

const db = await DuckDB.load();
const connection = db.connect();

// Execute query and get JSON in one call
const jsonString = connection.queryToJSON(`
  SELECT 
    id,
    name,
    age
  FROM users
  WHERE age > 18
`);

console.log(jsonString);
// Output: [{"id":1,"name":"Alice","age":25},{"id":2,"name":"Bob","age":30}]

// Parse back to JavaScript objects
const data = JSON.parse(jsonString);
console.log(data);
// Output: [ { id: 1, name: 'Alice', age: 25 }, { id: 2, name: 'Bob', age: 30 } ]

// No need to call result.delete() - it's handled automatically!
```

### Using toJSON on MaterializedQueryResult

```javascript
import { DuckDB } from '@hpcc-js/wasm-duckdb';

const db = await DuckDB.load();
const connection = db.connect();

// Execute a query
const result = connection.query(`
  SELECT 
    id,
    name,
    age
  FROM users
  WHERE age > 18
`);

// Convert to JSON string
const jsonString = result.toJSON();
console.log(jsonString);
// Output: [{"id":1,"name":"Alice","age":25},{"id":2,"name":"Bob","age":30}]

// Must manually clean up
result.delete();

// Can be parsed back to JavaScript objects
const data = JSON.parse(jsonString);
console.log(data);
// Output: [ { id: 1, name: 'Alice', age: 25 }, { id: 2, name: 'Bob', age: 30 } ]
```

### When to Use Which Method

**Use `queryToJSON()`** when:
- You only need JSON output (most common case)
- You want cleaner code with automatic cleanup
- You're building APIs or data pipelines

**Use `query()` + `toJSON()`** when:
- You need to access individual values with `getValue()`
- You need result metadata (row count, column types, etc.)
- You need to perform multiple operations on the result

## Features

- **Efficient JSON Encoding**: Converts entire result sets to JSON in C++ for better performance
- **Automatic Memory Management**: `queryToJSON()` handles cleanup automatically
- **Proper Type Handling**: 
  - Numbers (integers and floats)
  - Strings (with proper escaping)
  - Booleans
  - NULL values
- **Special Character Escaping**: Handles newlines, quotes, backslashes, tabs, and other special characters
- **Multiple Rows**: Returns an array of objects, one per row
- **Column Names**: Uses column names as JSON object keys
- **Empty Results**: Returns `[]` for queries with no results

## Implementation Details

The `toJSON()` method is implemented in C++ using [nlohmann-json](https://github.com/nlohmann/json), a modern JSON library for C++, providing:
- Industry-standard JSON serialization
- Proper JSON escaping for all string values
- Efficient memory usage
- Robust handling of edge cases (NaN, Infinity converted to null)
- Type-safe conversions

## Type Conversions

| DuckDB Type | JSON Type |
|-------------|-----------|
| BOOLEAN | boolean |
| INTEGER types | number |
| FLOAT/DOUBLE | string (to preserve precision) |
| VARCHAR | string (with escaping) |
| NULL | null |
| Other types | string (via ToString()) |
