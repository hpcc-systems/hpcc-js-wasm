# toJSON Method for MaterializedQueryResult

The `toJSON()` method has been added to `MaterializedQueryResult` to convert query results directly to a JSON string.

## Usage Example

```javascript
import { DuckDB } from '@hpcc-js/wasm-duckdb';

const db = await DuckDB.load();
const connection = await db.connect();

// Execute a query
const result = await connection.query(`
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

// Can be parsed back to JavaScript objects
const data = JSON.parse(jsonString);
console.log(data);
// Output: [ { id: 1, name: 'Alice', age: 25 }, { id: 2, name: 'Bob', age: 30 } ]
```

## Features

- **Efficient JSON Encoding**: Converts entire result sets to JSON in C++ for better performance
- **Proper Type Handling**: 
  - Numbers (integers and floats)
  - Strings (with proper escaping)
  - Booleans
  - NULL values
- **Special Character Escaping**: Handles newlines, quotes, backslashes, tabs, and other special characters
- **Multiple Rows**: Returns an array of objects, one per row
- **Column Names**: Uses column names as JSON object keys

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
