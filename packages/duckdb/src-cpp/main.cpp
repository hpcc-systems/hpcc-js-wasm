#include <string>
#include <vector>
#include <cmath>
#include <limits>
#include <duckdb.hpp>

#include <emscripten/val.h>
#include <emscripten/bind.h>

#include <nlohmann/json.hpp>

#include "duckdb/main/stream_query_result.hpp"

// Statically initialize extensions without requiring SQL LOAD.
#include "duckdb/main/extension/extension_loader.hpp"

using namespace duckdb;

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

//  --- Helper functions for emscripten bindings ---
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

    nlohmann::json valueToJSON(const Value &val)
    {
        if (val.IsNull())
        {
            return nullptr;
        }

        switch (val.type().id())
        {
        case LogicalTypeId::BOOLEAN:
            return val.GetValue<bool>();
        case LogicalTypeId::TINYINT:
        case LogicalTypeId::SMALLINT:
        case LogicalTypeId::INTEGER:
        case LogicalTypeId::BIGINT:
            return val.GetValue<int64_t>();
        case LogicalTypeId::FLOAT:
        case LogicalTypeId::DOUBLE:
        {
            double d = val.GetValue<double>();
            if (std::isnan(d) || std::isinf(d))
            {
                return nullptr;
            }
            return d;
        }
        case LogicalTypeId::VARCHAR:
            return val.GetValue<string>();
        default:
            return val.ToString();
        }
    }

    std::string toJSON(MaterializedQueryResult &obj)
    {
        nlohmann::json result = nlohmann::json::array();
        const size_t rowCount = obj.RowCount();
        const size_t colCount = obj.ColumnCount();

        for (size_t row = 0; row < rowCount; ++row)
        {
            nlohmann::json rowObj = nlohmann::json::object();
            for (size_t col = 0; col < colCount; ++col)
            {
                Value val = obj.GetValue(col, row);
                rowObj[obj.ColumnName(col)] = valueToJSON(val);
            }
            result.push_back(rowObj);
        }
        return result.dump();
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
    std::string queryToJSON(Connection &obj, const string &query)
    {
        auto result = obj.Query(query);
        if (result->HasError())
        {
            auto err = result->GetError();
            throw std::runtime_error(err.c_str());
        }
        return MaterializedQueryResultHelper::toJSON(*result);
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

EMSCRIPTEN_BINDINGS(duckdblib_bindings)
{
    using namespace emscripten;

    class_<LogicalType>("LogicalType")
        .constructor<>()
        .function("stringify", &LogicalType::ToString)
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
        .function("stringify", &Value::ToString)
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
        .function("stringify", &QueryResult::ToString)
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
        .function("toJSON", &MaterializedQueryResultHelper::toJSON)

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
        .function("queryToJSON", &ConnectionHelper::queryToJSON)
        .function("interrupt", &Connection::Interrupt)
        .function("getQueryProgress", &Connection::GetQueryProgress)
        // .function("enableProfiling", &Connection::EnableProfiling)
        // .function("disableProfiling", &Connection::DisableProfiling)
        // .function("getProfilingInformation", &Connection::GetProfilingInformation)
        .function("beginTransaction", &Connection::BeginTransaction)
        .function("commit", &Connection::Commit)
        .function("rollback", &Connection::Rollback)
        .function("setAutoCommit", &Connection::SetAutoCommit)
        .function("isAutoCommit", &Connection::IsAutoCommit)
        .function("hasActiveTransaction", &Connection::HasActiveTransaction)

        ;

    class_<DuckDB>("DuckDB")
        .function("connect", &DuckDBHelper::connect, return_value_policy::take_ownership())
        .function("terminate", &DuckDBHelper::close, allow_raw_pointers())
        .function("numberOfThreads", &DuckDB::NumberOfThreads)
        .class_function("sourceID", &DuckDBHelper::sourceID)
        .class_function("libraryVersion", &DuckDBHelper::libraryVersion)
        .class_function("releaseCodename", &DuckDBHelper::releaseCodename)
        .class_function("platform", &DuckDBHelper::platform)
        .class_function("standardVectorSize", &DuckDBHelper::standardVectorSize)

        ;

    function("create", &DuckDBHelper::create, return_value_policy::take_ownership());
    function("libraryVersion", &DuckDBHelper::libraryVersion);
    function("sourceID", &DuckDBHelper::sourceID);
    function("releaseCodename", &DuckDBHelper::releaseCodename);
    function("platform", &DuckDBHelper::platform);
    function("standardVectorSize", &DuckDBHelper::standardVectorSize);
}
