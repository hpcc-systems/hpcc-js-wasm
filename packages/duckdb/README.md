# @hpcc-js/wasm-duckdb

A WebAssembly wrapper for [DuckDB](https://github.com/duckdb/duckdb), an in-process SQL OLAP database management system. This package provides a consistent loading experience with the rest of the @hpcc-js/wasm library.

## Features

- ✅ In-process SQL database (no server required)
- ✅ OLAP-optimized for analytical queries
- ✅ Full SQL support with DuckDB's rich feature set
- ✅ Prepared statements with parameter binding
- ✅ Transaction management (commit/rollback)
- ✅ Virtual file system for CSV, JSON, and other formats
- ✅ JSON export of query results
- ✅ Type-safe value handling

## Installation

```sh
npm install @hpcc-js/wasm-duckdb
```

## Quick Start

```typescript
import { DuckDB } from "@hpcc-js/wasm-duckdb";

// Load the WASM module
const duckdb = await DuckDB.load();

// Create a connection
const connection = duckdb.connect();

// Execute a query
const result = connection.query("SELECT 'Hello, DuckDB!' AS message");
console.log(result.getValue(0, 0)); // "Hello, DuckDB!"

// Clean up
result.delete();
connection.delete();
```

## API Reference

### DuckDB Class

#### Static Methods

##### `DuckDB.load(): Promise<DuckDB>`
Loads and initializes the DuckDB WASM module. Returns a singleton instance.

```typescript
const duckdb = await DuckDB.load();
```

##### `DuckDB.unload(): void`
Unloads the WASM instance (useful for cleanup in tests).

#### Instance Methods

##### `version(): string`
Returns the DuckDB version string.

```typescript
console.log(duckdb.version()); // e.g., "v1.4.3"
```

##### `numberOfThreads(): number`
Returns the number of threads available.

```typescript
console.log(duckdb.numberOfThreads()); // e.g., 1
```

##### `connect(): Connection`
Creates a new database connection.

```typescript
const connection = duckdb.connect();
```

##### `registerFile(path: string, content: Uint8Array): void`
Registers a file in the virtual file system with binary content.

```typescript
const csvContent = "id,name\n1,Alice\n2,Bob";
const bytes = new TextEncoder().encode(csvContent);
duckdb.registerFile("data.csv", bytes);
```

##### `registerFileString(fileName: string, content: string): void`
Registers a file in the virtual file system with string content.

```typescript
const data = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
duckdb.registerFileString("data.json", JSON.stringify(data));
```

### Connection Class

#### Query Execution

##### `query(sql: string): MaterializedQueryResult`
Executes a SQL query and returns the result.

```typescript
const result = connection.query("SELECT * FROM users WHERE age > 18");
console.log(result.rowCount()); // Number of rows
result.delete(); // Always clean up!
```

##### `prepare(sql: string): PreparedStatement`
Creates a prepared statement for repeated execution with different parameters.

```typescript
const stmt = connection.prepare("SELECT * FROM users WHERE id = ?");
const result = stmt.execute([42]);
result.delete();
stmt.delete();
```

##### `interrupt(): void`
Interrupts the currently running query.

```typescript
connection.interrupt();
```

##### `getQueryProgress(): number`
Gets the progress of the currently executing query (0.0 to 1.0).

```typescript
const progress = connection.getQueryProgress();
console.log(`Query is ${progress * 100}% complete`);
```

##### `queryToJSON(sql: string): string`
Executes a SQL query and returns the result directly as a JSON string. This is a convenience method that combines `query()` and `toJSON()` into a single call.

```typescript
const json = connection.queryToJSON("SELECT * FROM users WHERE age > 18");
// Returns: '[{"id":1,"name":"Alice","age":30},{"id":2,"name":"Bob","age":25}]'

const users = JSON.parse(json);
console.log(users[0].name); // "Alice"
```

**Features:**
- No need to manually delete the result (automatic cleanup)
- Returns an empty array `[]` for queries with no results
- Handles all data types including NULL, numbers, strings, and booleans
- Proper JSON escaping for special characters
- NaN and Infinity are converted to `null`

#### Transaction Management

##### `beginTransaction(): void`
Starts a new transaction.

```typescript
connection.beginTransaction();
connection.query("INSERT INTO users VALUES (1, 'Alice')").delete();
connection.commit();
```

##### `commit(): void`
Commits the current transaction.

##### `rollback(): void`
Rolls back the current transaction.

```typescript
connection.beginTransaction();
connection.query("INSERT INTO users VALUES (1, 'Alice')").delete();
connection.rollback(); // Changes discarded
```

##### `setAutoCommit(enabled: boolean): void`
Enables or disables auto-commit mode (default: enabled).

```typescript
connection.setAutoCommit(false);
// Multiple operations in a single transaction
connection.setAutoCommit(true);
```

##### `isAutoCommit(): boolean`
Checks if auto-commit is enabled.

```typescript
console.log(connection.isAutoCommit()); // true
```

##### `hasActiveTransaction(): boolean`
Checks if there's an active transaction.

```typescript
console.log(connection.hasActiveTransaction()); // false
connection.beginTransaction();
console.log(connection.hasActiveTransaction()); // true
```

### PreparedStatement Class

Prepared statements allow you to execute the same query multiple times with different parameters efficiently.

##### `execute(params: any[]): QueryResult`
Executes the prepared statement with the provided parameters.

```typescript
const stmt = connection.prepare("SELECT * FROM users WHERE age > ? AND city = ?");
const result1 = stmt.execute([18, "New York"]);
const result2 = stmt.execute([25, "London"]);

result1.delete();
result2.delete();
stmt.delete();
```

**Supported parameter types:**
- `string` - VARCHAR
- `number` - INTEGER or DOUBLE
- `boolean` - BOOLEAN
- `null` or `undefined` - NULL

##### `names(): string[]`
Returns the column names that will be returned by the query.

```typescript
const stmt = connection.prepare("SELECT id, name FROM users");
console.log(stmt.names()); // ["id", "name"]
stmt.delete();
```

##### `types(): string[]`
Returns the column type names.

```typescript
const stmt = connection.prepare("SELECT id, name FROM users");
console.log(stmt.types()); // ["INTEGER", "VARCHAR"]
stmt.delete();
```

##### `columnCount(): number`
Returns the number of columns in the result.

```typescript
console.log(stmt.columnCount()); // 2
```

##### `statementType(): number`
Returns the statement type as a numeric code.

##### `hasError(): boolean`
Checks if the statement has an error.

```typescript
const stmt = connection.prepare("SELECT * FROM invalid_syntax WHERE");
if (stmt.hasError()) {
    console.error(stmt.getError());
}
stmt.delete();
```

##### `getError(): string`
Returns the error message if `hasError()` is true.

### MaterializedQueryResult Class

Represents the result of a query execution.

#### Result Metadata

##### `rowCount(): bigint`
Returns the number of rows in the result.

```typescript
const result = connection.query("SELECT * FROM users");
console.log(Number(result.rowCount())); // e.g., 10
result.delete();
```

##### `columnCount(): bigint`
Returns the number of columns in the result.

```typescript
console.log(Number(result.columnCount())); // e.g., 3
```

##### `columnNames(): string[]`
Returns an array of column names.

```typescript
const result = connection.query("SELECT id, name, age FROM users LIMIT 1");
console.log(result.columnNames()); // ["id", "name", "age"]
result.delete();
```

##### `columnName(index: bigint): string`
Returns the name of a specific column by index.

```typescript
console.log(result.columnName(0n)); // "id"
console.log(result.columnName(1n)); // "name"
```

##### `columnTypes(): string[]`
Returns an array of column type names.

```typescript
console.log(result.columnTypes()); // ["INTEGER", "VARCHAR", "INTEGER"]
```

##### `resultType(): number`
Returns the result type as a numeric code.

##### `statementType(): number`
Returns the statement type that produced this result.

#### Data Access

##### `getValue(column: number, row: number): any`
Returns the value at the specified column and row.

```typescript
const result = connection.query("SELECT id, name FROM users LIMIT 1");
const id = result.getValue(0, 0);    // First column, first row
const name = result.getValue(1, 0);  // Second column, first row
console.log(`User ${id}: ${name}`);
result.delete();
```

**Return types:**
- `null` for NULL values
- `boolean` for BOOLEAN columns
- `number` for numeric columns (TINYINT, SMALLINT, INTEGER, BIGINT, FLOAT, DOUBLE)
- `string` for VARCHAR and other types

##### `toJSON(): string`
Converts the entire result to a JSON string (array of objects).

```typescript
const result = connection.query("SELECT id, name, age FROM users");
const json = result.toJSON();
// Returns: '[{"id":1,"name":"Alice","age":30},{"id":2,"name":"Bob","age":25}]'

const data = JSON.parse(json);
console.log(data[0].name); // "Alice"
result.delete();
```

**Features:**
- Returns a JSON array with one object per row
- Column names become object keys
- NULL values are represented as `null`
- Proper JSON escaping for special characters
- NaN and Infinity are converted to `null`

##### `collection(): ColumnDataCollection`
Returns the underlying column data collection.

```typescript
const collection = result.collection();
console.log(Number(collection.count())); // Row count
console.log(Number(collection.columnCount())); // Column count
```

#### Output

##### `stringify(): string`
Returns a string representation of the result.

```typescript
const result = connection.query("SELECT * FROM users LIMIT 3");
console.log(result.stringify());
result.delete();
```

##### `print(): void`
Prints the result to the console.

```typescript
result.print();
// Outputs formatted table to console
```

#### Error Handling

##### `hasError(): boolean`
Checks if the query resulted in an error.

```typescript
const result = connection.query("SELECT * FROM nonexistent_table");
if (result.hasError()) {
    console.error("Query failed:", result.getError());
}
result.delete();
```

##### `getError(): string`
Returns the error message if one occurred.

```typescript
const errorMsg = result.getError();
console.log(errorMsg); // Error message string
```

## Usage Examples

### Basic Query

```typescript
import { DuckDB } from "@hpcc-js/wasm-duckdb";

const duckdb = await DuckDB.load();
const connection = duckdb.connect();

const result = connection.query(`
    SELECT 
        id,
        name,
        age
    FROM (VALUES 
        (1, 'Alice', 30),
        (2, 'Bob', 25),
        (3, 'Charlie', 35)
    ) AS users(id, name, age)
    WHERE age > 25
`);

console.log(`Found ${result.rowCount()} users`);
for (let i = 0; i < Number(result.rowCount()); i++) {
    const id = result.getValue(0, i);
    const name = result.getValue(1, i);
    const age = result.getValue(2, i);
    console.log(`${id}: ${name} (${age} years old)`);
}

result.delete();
connection.delete();
```

### Prepared Statements

```typescript
const connection = duckdb.connect();

// Create a table
connection.query("CREATE TABLE users (id INTEGER, name VARCHAR, age INTEGER)").delete();

// Insert data using prepared statement
const insertStmt = connection.prepare("INSERT INTO users VALUES (?, ?, ?)");
insertStmt.execute([1, "Alice", 30]).delete();
insertStmt.execute([2, "Bob", 25]).delete();
insertStmt.execute([3, "Charlie", 35]).delete();
insertStmt.delete();

// Query with prepared statement
const queryStmt = connection.prepare("SELECT * FROM users WHERE age > ?");
const result = queryStmt.execute([26]);

console.log(result.toJSON());
// [{"id":1,"name":"Alice","age":30},{"id":3,"name":"Charlie","age":35}]

result.delete();
queryStmt.delete();
connection.delete();
```

### Working with JSON Files

```typescript
const duckdb = await DuckDB.load();
const connection = duckdb.connect();

// Register JSON data as a file
const data = [
    { product: "Laptop", price: 999.99, quantity: 5 },
    { product: "Mouse", price: 29.99, quantity: 20 },
    { product: "Keyboard", price: 79.99, quantity: 15 }
];
duckdb.registerFileString("products.json", JSON.stringify(data));

// Query the JSON file
const result = connection.query(`
    SELECT 
        product,
        price,
        quantity,
        price * quantity AS total_value
    FROM read_json_auto('products.json')
    ORDER BY total_value DESC
`);

console.log(result.toJSON());
result.delete();
connection.delete();
```

### Working with CSV Files

```typescript
const csvData = `id,name,department,salary
1,Alice,Engineering,120000
2,Bob,Sales,80000
3,Charlie,Engineering,110000
4,Diana,HR,75000`;

duckdb.registerFileString("employees.csv", csvData);

const result = connection.query(`
    SELECT 
        department,
        COUNT(*) as employee_count,
        AVG(salary) as avg_salary
    FROM read_csv_auto('employees.csv')
    GROUP BY department
    ORDER BY avg_salary DESC
`);

result.print(); // Prints formatted table
result.delete();
```

### Transaction Management

```typescript
const connection = duckdb.connect();

connection.query("CREATE TABLE accounts (id INTEGER, balance DECIMAL)").delete();
connection.query("INSERT INTO accounts VALUES (1, 1000), (2, 500)").delete();

// Transfer money between accounts
connection.setAutoCommit(false);
connection.beginTransaction();

try {
    connection.query("UPDATE accounts SET balance = balance - 200 WHERE id = 1").delete();
    connection.query("UPDATE accounts SET balance = balance + 200 WHERE id = 2").delete();
    connection.commit();
    console.log("Transfer successful");
} catch (error) {
    connection.rollback();
    console.error("Transfer failed, rolled back");
}

connection.delete();
```

### JSON Export

```typescript
const result = connection.query("SELECT * FROM users ORDER BY age");

// Export entire result as JSON
const jsonString = result.toJSON();

// Save to file or send to API
console.log(jsonString);
// [{"id":2,"name":"Bob","age":25},{"id":1,"name":"Alice","age":30},...]

// Parse back to JavaScript
const users = JSON.parse(jsonString);
users.forEach(user => {
    console.log(`${user.name} is ${user.age} years old`);
});

result.delete();
```

### Direct JSON Query (queryToJSON)

```typescript
const connection = duckdb.connect();

// Convenience method: execute query and get JSON in one call
const json = connection.queryToJSON("SELECT * FROM users ORDER BY age");

// No need to delete result - it's automatic!
const users = JSON.parse(json);
users.forEach(user => {
    console.log(`${user.name} is ${user.age} years old`);
});

// Use with aggregations
const stats = connection.queryToJSON(`
    SELECT 
        department,
        COUNT(*) as count,
        AVG(salary) as avg_salary
    FROM employees
    GROUP BY department
`);
console.log(stats);

connection.delete();
```

### Error Handling

```typescript
const connection = duckdb.connect();

// Query error handling
const result = connection.query("SELECT * FROM nonexistent_table");
if (result.hasError()) {
    console.error("Query error:", result.getError());
} else {
    console.log("Query succeeded");
}
result.delete();

// Prepared statement error handling
const stmt = connection.prepare("SELECT * FROM invalid_syntax WHERE");
if (stmt.hasError()) {
    console.error("Statement preparation error:", stmt.getError());
}
stmt.delete();

connection.delete();
```

## Memory Management

**Important:** Always call `.delete()` on results, prepared statements, and connections when done to free memory:

```typescript
const result = connection.query("SELECT * FROM users");
// Use result...
result.delete(); // Clean up!

const stmt = connection.prepare("SELECT * FROM users WHERE id = ?");
// Use stmt...
stmt.delete(); // Clean up!

connection.delete(); // Clean up when done with connection
```

## TypeScript Support

This package includes full TypeScript type definitions for type-safe development.

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/duckdb/src/duckdb/classes/DuckDB.html)
* [DuckDB Documentation](https://duckdb.org/docs/)
* [DuckDB WASM](https://github.com/duckdb/duckdb-wasm)

## License

See the root package for license information.
