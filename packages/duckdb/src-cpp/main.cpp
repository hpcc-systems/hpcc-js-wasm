#include <string>
#include <vector>
#include <cmath>
#include <limits>
#include <duckdb.hpp>

#include <emscripten/val.h>
#include <emscripten/bind.h>

#include "duckdb/main/stream_query_result.hpp"

// Statically initialize extensions without requiring SQL LOAD.
#include "duckdb/main/extension/extension_loader.hpp"

using namespace duckdb;

class ColumnarQueryResult
{
public:
    enum class Kind
    {
        F64 = 0,
        BOOL = 1,
        STRING = 2
    };

    ColumnarQueryResult() = default;

    explicit ColumnarQueryResult(const std::string &error)
    {
        _has_error = true;
        _error = error;
    }

    explicit ColumnarQueryResult(std::unique_ptr<MaterializedQueryResult> result)
    {
        if (!result)
        {
            return;
        }

        _column_count = (uint32_t)result->ColumnCount();
        _row_count = (uint32_t)result->RowCount();

        if (result->HasError())
        {
            _has_error = true;
            // Best-effort: this includes the error message in current DuckDB builds.
            _error = result->ToString();
        }

        _names.reserve(_column_count);
        _kinds.resize(_column_count, Kind::STRING);
        _types.reserve(_column_count);
        _validity.resize(_column_count);
        _f64.resize(_column_count);
        _u8.resize(_column_count);
        _str.resize(_column_count);

        for (uint32_t c = 0; c < _column_count; ++c)
        {
            _names.push_back(result->ColumnName(c));
            _types.push_back(std::string(""));
            _validity[c].resize(_row_count);

            // Infer a display type + storage kind from first non-null value.
            Kind inferred = Kind::STRING;
            std::string inferred_type;
            for (uint32_t r = 0; r < _row_count; ++r)
            {
                Value v = result->GetValue(c, r);
                if (!v.IsNull())
                {
                    inferred_type = v.type().ToString();
                    switch (v.type().id())
                    {
                    case LogicalTypeId::BOOLEAN:
                        inferred = Kind::BOOL;
                        break;
                    case LogicalTypeId::TINYINT:
                    case LogicalTypeId::SMALLINT:
                    case LogicalTypeId::INTEGER:
                    case LogicalTypeId::BIGINT:
                    case LogicalTypeId::FLOAT:
                    case LogicalTypeId::DOUBLE:
                        inferred = Kind::F64;
                        break;
                    default:
                        inferred = Kind::STRING;
                        break;
                    }
                    break;
                }
            }
            _kinds[c] = inferred;
            _types[c] = inferred_type;

            switch (inferred)
            {
            case Kind::F64:
                _f64[c].resize(_row_count);
                break;
            case Kind::BOOL:
                _u8[c].resize(_row_count);
                break;
            default:
                _str[c].resize(_row_count);
                break;
            }
        }

        for (uint32_t r = 0; r < _row_count; ++r)
        {
            for (uint32_t c = 0; c < _column_count; ++c)
            {
                Value v = result->GetValue(c, r);
                if (v.IsNull())
                {
                    _validity[c][r] = 0;
                    // Leave default value.
                    continue;
                }
                _validity[c][r] = 1;

                switch (_kinds[c])
                {
                case Kind::BOOL:
                    _u8[c][r] = v.GetValue<bool>() ? 1 : 0;
                    break;
                case Kind::F64:
                    switch (v.type().id())
                    {
                    case LogicalTypeId::FLOAT:
                    case LogicalTypeId::DOUBLE:
                        _f64[c][r] = v.GetValue<double>();
                        break;
                    case LogicalTypeId::TINYINT:
                    case LogicalTypeId::SMALLINT:
                    case LogicalTypeId::INTEGER:
                    case LogicalTypeId::BIGINT:
                        _f64[c][r] = (double)v.GetValue<int64_t>();
                        break;
                    default:
                        // Fallback: if conversion isn't supported, keep a default value.
                        _validity[c][r] = 0;
                        break;
                    }
                    break;
                default:
                    _str[c][r] = v.ToString();
                    break;
                }
            }
        }
    }

    bool hasError() const { return _has_error; }
    std::string error() const { return _error; }

    uint32_t rowCount() const { return _row_count; }
    uint32_t columnCount() const { return _column_count; }

    std::string columnName(uint32_t column) const
    {
        if (column >= _names.size())
            return std::string("");
        return _names[column];
    }

    std::string columnType(uint32_t column) const
    {
        if (column >= _types.size())
            return std::string("");
        return _types[column];
    }

    uint32_t columnKind(uint32_t column) const
    {
        if (column >= _kinds.size())
            return (uint32_t)Kind::STRING;
        return (uint32_t)_kinds[column];
    }

    emscripten::val validity(uint32_t column)
    {
        if (column >= _validity.size())
            return emscripten::val::null();
        return emscripten::val(emscripten::typed_memory_view(_row_count, _validity[column].data()));
    }

    emscripten::val f64Column(uint32_t column)
    {
        if (column >= _f64.size() || _kinds[column] != Kind::F64)
            return emscripten::val::null();
        return emscripten::val(emscripten::typed_memory_view(_row_count, _f64[column].data()));
    }

    emscripten::val boolColumn(uint32_t column)
    {
        if (column >= _u8.size() || _kinds[column] != Kind::BOOL)
            return emscripten::val::null();
        return emscripten::val(emscripten::typed_memory_view(_row_count, _u8[column].data()));
    }

    emscripten::val stringColumn(uint32_t column)
    {
        if (column >= _str.size() || _kinds[column] != Kind::STRING)
            return emscripten::val::null();
        emscripten::val arr = emscripten::val::array();
        for (uint32_t r = 0; r < _row_count; ++r)
        {
            if (_validity[column][r] == 0)
            {
                arr.call<void>("push", emscripten::val::null());
            }
            else
            {
                arr.call<void>("push", emscripten::val(_str[column][r]));
            }
        }
        return arr;
    }

private:
    bool _has_error = false;
    std::string _error;
    uint32_t _row_count = 0;
    uint32_t _column_count = 0;

    std::vector<std::string> _names;
    std::vector<std::string> _types;
    std::vector<Kind> _kinds;

    std::vector<std::vector<uint8_t>> _validity;
    std::vector<std::vector<double>> _f64;
    std::vector<std::vector<uint8_t>> _u8;
    std::vector<std::vector<std::string>> _str;
};

extern "C"
{
    // Defined by DUCKDB_CPP_EXTENSION_ENTRY(core_functions, loader) inside DuckDB's core_functions extension.
    void core_functions_duckdb_cpp_init(duckdb::ExtensionLoader &loader);
}

class CoreFunctionsStaticExtension
{
public:
    void Load(duckdb::ExtensionLoader &loader)
    {
        core_functions_duckdb_cpp_init(loader);
    }

    std::string Name()
    {
        return "core_functions";
    }

    std::string Version() const
    {
        return "";
    }
};

bool try_emval_to_duckdb_value(const emscripten::val &v, Value &out, std::string &error)
{
    if (v.isNull() || v.isUndefined())
    {
        out = Value(LogicalType::SQLNULL);
        return true;
    }

    const std::string type = v.typeOf().as<std::string>();
    if (type == "string")
    {
        out = Value::CreateValue<string>(v.as<std::string>());
        return true;
    }
    if (type == "boolean")
    {
        out = Value::CreateValue<bool>(v.as<bool>());
        return true;
    }
    if (type == "number")
    {
        const double d = v.as<double>();
        if (!std::isfinite(d))
        {
            error = "Invalid number (non-finite)";
            return false;
        }
        const double i = std::floor(d);
        if (i == d && i >= (double)std::numeric_limits<int64_t>::min() && i <= (double)std::numeric_limits<int64_t>::max())
        {
            out = Value::CreateValue<int64_t>((int64_t)i);
        }
        else
        {
            out = Value::CreateValue<double>(d);
        }
        return true;
    }

    error = "Unsupported parameter type: " + type;
    return false;
}

namespace MaterializedQueryResultHelper
{
    emscripten::val GetValue(MaterializedQueryResult &obj, uint32_t column, uint32_t index)
    {
        Value val = obj.GetValue(column, index);
        if (val.IsNull())
        {
            return emscripten::val::null();
        }

        switch (val.type().id())
        {
        case LogicalTypeId::BOOLEAN:
            return emscripten::val(val.GetValue<bool>());
        case LogicalTypeId::TINYINT:
        case LogicalTypeId::SMALLINT:
        case LogicalTypeId::INTEGER:
        case LogicalTypeId::BIGINT:
            return emscripten::val((double)val.GetValue<int64_t>());
        case LogicalTypeId::FLOAT:
        case LogicalTypeId::DOUBLE:
            return emscripten::val(val.GetValue<double>());
        case LogicalTypeId::VARCHAR:
            return emscripten::val(val.GetValue<string>());
        default:
            return emscripten::val(val.ToString());
        }
    }
}

namespace ConnectionHelper
{
    PreparedStatement *prepare(Connection &obj, const string &query)
    {
        return obj.Prepare(query).release();
    }
    MaterializedQueryResult *query(Connection &obj, const string &query)
    {
        return obj.Query(query).release();
    }

    ColumnarQueryResult *queryColumnar(Connection &obj, const string &query)
    {
        try
        {
            auto result = obj.Query(query);
            return new ColumnarQueryResult(std::move(result));
        }
        catch (const std::exception &e)
        {
            return new ColumnarQueryResult(std::string(e.what()));
        }
    }

    void interrupt(Connection &obj)
    {
        obj.Interrupt();
    }

    double queryProgress(Connection &obj)
    {
        return obj.GetQueryProgress();
    }

    void enableProfiling(Connection &obj)
    {
        obj.EnableProfiling();
    }

    void disableProfiling(Connection &obj)
    {
        obj.DisableProfiling();
    }

    std::string profilingInformation(Connection &obj)
    {
        return obj.GetProfilingInformation();
    }

    void beginTransaction(Connection &obj)
    {
        obj.BeginTransaction();
    }

    void commit(Connection &obj)
    {
        obj.Commit();
    }

    void rollback(Connection &obj)
    {
        obj.Rollback();
    }

    void setAutoCommit(Connection &obj, bool auto_commit)
    {
        obj.SetAutoCommit(auto_commit);
    }

    bool isAutoCommit(Connection &obj)
    {
        return obj.IsAutoCommit();
    }

    bool hasActiveTransaction(Connection &obj)
    {
        return obj.HasActiveTransaction();
    }
}

namespace DuckDBHelper
{
    DuckDB *create()
    {
        auto retVal = new DuckDB(nullptr);
        retVal->LoadStaticExtension<CoreFunctionsStaticExtension>();
        return retVal;
    }

    void close(DuckDB *db)
    {
        delete db;
    }

    std::string libraryVersion()
    {
        return std::string(DuckDB::LibraryVersion());
    }

    std::string sourceID()
    {
        return std::string(DuckDB::SourceID());
    }

    std::string releaseCodename()
    {
        return std::string(DuckDB::ReleaseCodename());
    }

    std::string platform()
    {
        return DuckDB::Platform();
    }

    uint32_t standardVectorSize()
    {
        return (uint32_t)DuckDB::StandardVectorSize();
    }

    Connection *connect(DuckDB &obj)
    {
        return new Connection(obj);
    }
}

namespace LogicalTypeHelper
{
    uint32_t id(const LogicalType &obj)
    {
        return (uint32_t)obj.id();
    }

    uint32_t physicalType(const LogicalType &obj)
    {
        return (uint32_t)obj.InternalType();
    }

    bool isValid(const LogicalType &obj)
    {
        return obj.IsValid();
    }

    bool isComplete(const LogicalType &obj)
    {
        return obj.IsComplete();
    }

    bool isSigned(const LogicalType &obj)
    {
        return obj.IsSigned();
    }

    bool isUnsigned(const LogicalType &obj)
    {
        return obj.IsUnsigned();
    }

    void setAlias(LogicalType &obj, const std::string &alias)
    {
        obj.SetAlias(alias);
    }

    bool hasAlias(const LogicalType &obj)
    {
        return obj.HasAlias();
    }

    std::string getAlias(const LogicalType &obj)
    {
        return obj.GetAlias();
    }
}

namespace ValueHelper
{
    Value copy(const Value &obj)
    {
        return obj.Copy();
    }

    std::string toSQLString(const Value &obj)
    {
        return obj.ToSQLString();
    }
}

namespace ErrorDataHelper
{
    std::string message(ErrorData &obj)
    {
        return obj.Message();
    }

    std::string rawMessage(ErrorData &obj)
    {
        return obj.RawMessage();
    }
}

namespace BaseQueryResultHelper
{
    uint32_t resultType(const BaseQueryResult &obj)
    {
        return (uint32_t)obj.type;
    }

    uint32_t statementType(const BaseQueryResult &obj)
    {
        return (uint32_t)obj.statement_type;
    }

    emscripten::val columnNames(const BaseQueryResult &obj)
    {
        emscripten::val arr = emscripten::val::array();
        for (auto &n : obj.names)
        {
            arr.call<void>("push", emscripten::val(n));
        }
        return arr;
    }

    emscripten::val columnTypes(const BaseQueryResult &obj)
    {
        emscripten::val arr = emscripten::val::array();
        for (auto &t : obj.types)
        {
            arr.call<void>("push", emscripten::val(t.ToString()));
        }
        return arr;
    }
}

namespace PreparedStatementHelper
{
    QueryResult *executeValues(PreparedStatement &obj, vector<Value> &values)
    {
        return obj.Execute(values, false).release();
    }

    QueryResult *execute(PreparedStatement &obj, const emscripten::val &args)
    {
        const uint32_t len = args["length"].as<uint32_t>();
        vector<Value> values;
        values.reserve(len);
        for (uint32_t i = 0; i < len; ++i)
        {
            Value v;
            std::string error;
            if (!try_emval_to_duckdb_value(args[i], v, error))
            {
                return new MaterializedQueryResult(ErrorData(error));
            }
            values.push_back(std::move(v));
        }
        return executeValues(obj, values);
    }

    emscripten::val names(PreparedStatement &obj)
    {
        emscripten::val arr = emscripten::val::array();
        for (auto &n : obj.GetNames())
        {
            arr.call<void>("push", emscripten::val(n));
        }
        return arr;
    }

    emscripten::val types(PreparedStatement &obj)
    {
        emscripten::val arr = emscripten::val::array();
        for (auto &t : obj.GetTypes())
        {
            arr.call<void>("push", emscripten::val(t.ToString()));
        }
        return arr;
    }

    uint32_t statementType(PreparedStatement &obj)
    {
        return (uint32_t)obj.GetStatementType();
    }
}

EMSCRIPTEN_BINDINGS(duckdblib_bindings)
{
    using namespace emscripten;

    enum_<ColumnarQueryResult::Kind>("ColumnarQueryResultKind")
        .value("F64", ColumnarQueryResult::Kind::F64)
        .value("BOOL", ColumnarQueryResult::Kind::BOOL)
        .value("STRING", ColumnarQueryResult::Kind::STRING);

    class_<ColumnarQueryResult>("ColumnarQueryResult")
        .constructor<>()
        .function("hasError", &ColumnarQueryResult::hasError)
        .function("error", &ColumnarQueryResult::error)
        .function("rowCount", &ColumnarQueryResult::rowCount)
        .function("columnCount", &ColumnarQueryResult::columnCount)
        .function("columnName", &ColumnarQueryResult::columnName)
        .function("columnType", &ColumnarQueryResult::columnType)
        .function("columnKind", &ColumnarQueryResult::columnKind)
        .function("validity", &ColumnarQueryResult::validity)
        .function("f64Column", &ColumnarQueryResult::f64Column)
        .function("boolColumn", &ColumnarQueryResult::boolColumn)
        .function("stringColumn", &ColumnarQueryResult::stringColumn);

    class_<LogicalType>("LogicalType")
        .constructor<>()
        .function("toString", &LogicalType::ToString)
        .function("id", &LogicalTypeHelper::id)
        .function("physicalType", &LogicalTypeHelper::physicalType)
        .function("isIntegral", &LogicalType::IsIntegral)
        .function("isFloating", &LogicalType::IsFloating)
        .function("isNumeric", select_overload<bool() const>(&LogicalType::IsNumeric))
        .function("isTemporal", &LogicalType::IsTemporal)
        .function("isValid", &LogicalTypeHelper::isValid)
        .function("isComplete", &LogicalTypeHelper::isComplete)
        .function("isSigned", &LogicalTypeHelper::isSigned)
        .function("isUnsigned", &LogicalTypeHelper::isUnsigned)
        .function("setAlias", &LogicalTypeHelper::setAlias)
        .function("hasAlias", &LogicalTypeHelper::hasAlias)
        .function("getAlias", &LogicalTypeHelper::getAlias)

        ;

    class_<Value>("Value")
        .constructor<>()
        .function("type", &Value::type)
        .function("isNull", &Value::IsNull)
        .function("toString", &Value::ToString)
        .function("toSQLString", &ValueHelper::toSQLString)
        .function("copy", &ValueHelper::copy)
        .function("getBoolean", &Value::GetValue<bool>)
        .function("getInt32", &Value::GetValue<int32_t>)
        .function("getFloat", &Value::GetValue<float>)
        .function("getDouble", &Value::GetValue<double>)
        .function("getString", &Value::GetValue<std::string>)

        ;

    class_<ErrorData>("ErrorData")
        .constructor<>()
        .function("hasError", &ErrorData::HasError)
        .function("message", &ErrorDataHelper::message)
        .function("rawMessage", &ErrorDataHelper::rawMessage)

        ;

    class_<BaseQueryResult>("BaseQueryResult")
        .function("throwError", &BaseQueryResult::ThrowError)
        .function("setError", &BaseQueryResult::SetError)
        .function("hasError", &BaseQueryResult::HasError)
        .function("getError", &BaseQueryResult::GetError)
        .function("columnCount", &BaseQueryResult::ColumnCount)
        .function("resultType", &BaseQueryResultHelper::resultType)
        .function("statementType", &BaseQueryResultHelper::statementType)
        .function("columnNames", &BaseQueryResultHelper::columnNames)
        .function("columnTypes", &BaseQueryResultHelper::columnTypes)

        ;

    class_<QueryResult, base<BaseQueryResult>>("QueryResult")
        .function("toString_", &QueryResult::ToString)
        .function("print", &QueryResult::Print)
        .function("columnCount", &QueryResult::ColumnCount)
        .function("columnName", &QueryResult::ColumnName)

        ;

    class_<ColumnDataCollection>("ColumnDataCollection")
        .function("count", &ColumnDataCollection::Count)
        .function("columnCount", &ColumnDataCollection::ColumnCount)

        ;

    class_<MaterializedQueryResult, base<QueryResult>>("MaterializedQueryResult")
        .function("rowCount", &MaterializedQueryResult::RowCount)
        .function("collection", &MaterializedQueryResult::Collection)
        .function("getValue", &MaterializedQueryResultHelper::GetValue)

        ;

    class_<PreparedStatement>("PreparedStatement")
        .function("execute", &PreparedStatementHelper::execute, return_value_policy::take_ownership())
        .function("hasError", &PreparedStatement::HasError)
        .function("getError", &PreparedStatement::GetError)
        .function("columnCount", &PreparedStatement::ColumnCount)
        .function("statementType", &PreparedStatementHelper::statementType)
        .function("names", &PreparedStatementHelper::names)
        .function("types", &PreparedStatementHelper::types)

        ;

    class_<Connection>("Connection")
        .function("prepare", &ConnectionHelper::prepare, return_value_policy::take_ownership())
        .function("query", &ConnectionHelper::query, return_value_policy::take_ownership())
        .function("queryColumnar", &ConnectionHelper::queryColumnar, return_value_policy::take_ownership())
        .function("interrupt", &ConnectionHelper::interrupt)
        .function("queryProgress", &ConnectionHelper::queryProgress)
        .function("enableProfiling", &ConnectionHelper::enableProfiling)
        .function("disableProfiling", &ConnectionHelper::disableProfiling)
        .function("profilingInformation", &ConnectionHelper::profilingInformation)
        .function("beginTransaction", &ConnectionHelper::beginTransaction)
        .function("commit", &ConnectionHelper::commit)
        .function("rollback", &ConnectionHelper::rollback)
        .function("setAutoCommit", &ConnectionHelper::setAutoCommit)
        .function("isAutoCommit", &ConnectionHelper::isAutoCommit)
        .function("hasActiveTransaction", &ConnectionHelper::hasActiveTransaction)

        ;

    class_<DuckDB>("DuckDB")
        .function("connect", &DuckDBHelper::connect, return_value_policy::take_ownership())
        .function("numberOfThreads", &DuckDB::NumberOfThreads)
        .function("close", &DuckDBHelper::close, allow_raw_pointers())

        ;

    function("create", &DuckDBHelper::create, return_value_policy::take_ownership());
    function("libraryVersion", &DuckDBHelper::libraryVersion);
    function("sourceID", &DuckDBHelper::sourceID);
    function("releaseCodename", &DuckDBHelper::releaseCodename);
    function("platform", &DuckDBHelper::platform);
    function("standardVectorSize", &DuckDBHelper::standardVectorSize);
}
