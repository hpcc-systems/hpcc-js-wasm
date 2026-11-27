#pragma once

#include <cmath>
#include <functional>
#include <list>
#include <optional>
#include <string>
#include <string_view>
#include <unordered_map>

class TextMeasurementCache
{
public:
    struct Key
    {
        std::string_view text;
        std::string_view font;
        double size;
        unsigned int flags;
        int fontnames;

        bool operator==(const Key &) const = default;
    };

private:
    struct StoredKey
    {
        std::string text;
        std::string font;
        double size;
        unsigned int flags;
        int fontnames;

        operator Key() const { return {text, font, size, flags, fontnames}; }
    };

    struct Hash
    {
        using is_transparent = void;

        size_t operator()(Key key) const
        {
            size_t hash = std::hash<std::string_view>{}(key.text);
            const auto combine = [&hash](size_t value)
            {
                hash ^= value + 0x9e3779b9 + (hash << 6) + (hash >> 2);
            };
            combine(std::hash<std::string_view>{}(key.font));
            combine(std::hash<double>{}(key.size));
            combine(std::hash<unsigned int>{}(key.flags));
            combine(std::hash<int>{}(key.fontnames));
            return hash;
        }
    };

    struct Equal
    {
        using is_transparent = void;
        bool operator()(Key lhs, Key rhs) const { return lhs == rhs; }
    };

    using Recency = std::list<const StoredKey *>;
    struct Entry
    {
        double width;
        size_t bytes;
        Recency::iterator recency;
    };
    using Entries = std::unordered_map<StoredKey, Entry, Hash, Equal>;

    Entries _entries;
    Recency _recency;
    size_t _bytes = 0;
    const size_t _maxEntries;
    const size_t _maxBytes;

public:
    explicit TextMeasurementCache(size_t maxEntries = 32768, size_t maxBytes = 4 * 1024 * 1024)
        : _maxEntries(maxEntries), _maxBytes(maxBytes) {}

    TextMeasurementCache(const TextMeasurementCache &) = delete;
    TextMeasurementCache &operator=(const TextMeasurementCache &) = delete;

    std::optional<double> find(Key key)
    {
        const auto it = _entries.find(key);
        if (it == _entries.end())
            return std::nullopt;
        _recency.splice(_recency.begin(), _recency, it->second.recency);
        return it->second.width;
    }

    void insert(Key key, double width)
    {
        if (!std::isfinite(width) || width < 0 || !std::isfinite(key.size))
            return;
        if (const auto it = _entries.find(key); it != _entries.end())
        {
            it->second.width = width;
            _recency.splice(_recency.begin(), _recency, it->second.recency);
            return;
        }

        // Account for keys, values, strings and pointer allowances for nodes/buckets.
        // Allocator metadata and implementation-specific bucket overhead are not exact.
        constexpr size_t overhead = sizeof(Entries::value_type) + 6 * sizeof(void *) + 2;
        if (!_maxEntries || _maxBytes < overhead ||
            key.text.size() > _maxBytes - overhead ||
            key.font.size() > _maxBytes - overhead - key.text.size())
            return;
        const size_t bytes = overhead + key.text.size() + key.font.size();
        while (_entries.size() >= _maxEntries || _bytes > _maxBytes - bytes)
        {
            const auto oldest = _entries.find(*_recency.back());
            _bytes -= oldest->second.bytes;
            _recency.pop_back();
            _entries.erase(oldest);
        }

        const auto it = _entries.emplace(
            StoredKey{std::string(key.text), std::string(key.font), key.size, key.flags, key.fontnames},
            Entry{width, bytes, {}}).first;
        _recency.push_front(&it->first);
        it->second.recency = _recency.begin();
        _bytes += bytes;
    }

    void clear()
    {
        _recency.clear();
        _entries.clear();
        _bytes = 0;
    }

    size_t size() const { return _entries.size(); }
    size_t bytes() const { return _bytes; }
};
