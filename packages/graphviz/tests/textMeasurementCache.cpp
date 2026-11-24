#include "../src-cpp/textMeasurementCache.hpp"

#include <cassert>
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <malloc.h>
#endif

int main()
{
    using Key = TextMeasurementCache::Key;
    const Key a{"a", "Arial", 14, 0, 0};
    const Key b{"b", "Arial", 14, 0, 0};
    const Key c{"c", "Arial", 14, 0, 0};
    const Key d{"d", "Arial", 14, 0, 0};

    {
        TextMeasurementCache cache(3);
        cache.insert(a, 1);
        cache.insert(b, 2);
        cache.insert(c, 3);
        assert(cache.find(a) == 1);
        cache.insert(d, 4);
        assert(!cache.find(b));
        assert(cache.find(a) == 1);
        assert(cache.find(c) == 3);
        assert(cache.find(d) == 4);
        cache.insert(a, 5);
        assert(cache.find(a) == 5);
        cache.clear();
        assert(!cache.find(a));
        assert(cache.bytes() == 0);
    }

    {
        TextMeasurementCache cache;
        {
            std::string text = "temporary text";
            std::string font = "temporary font";
            cache.insert({text, font, 14, 1, 2}, 10);
        }
        assert(cache.find({"temporary text", "temporary font", 14, 1, 2}) == 10);
        assert(!cache.find({"temporary text", "temporary font", 15, 1, 2}));
        assert(!cache.find({"temporary text", "temporary font", 14, 0, 2}));
        assert(!cache.find({"temporary text", "temporary font", 14, 1, 0}));
        assert(!cache.find({"temporary text", "other font", 14, 1, 2}));
    }

    {
        TextMeasurementCache probe;
        probe.insert(a, 1);
        const size_t entryBytes = probe.bytes();
        TextMeasurementCache cache(100, 2 * entryBytes);
        cache.insert(a, 1);
        cache.insert(b, 2);
        assert(cache.bytes() == 2 * entryBytes);
        assert(cache.find(a) == 1);
        cache.insert(c, 3);
        assert(!cache.find(b));
        assert(cache.find(a) == 1);
        assert(cache.find(c) == 3);
        assert(cache.bytes() <= 2 * entryBytes);
    }

    {
        constexpr size_t budget = 4 * 1024 * 1024;
        TextMeasurementCache cache;
        cache.insert(a, 1);
        const size_t overhead = cache.bytes() - a.text.size() - a.font.size();
        const std::string exactFit(budget - overhead - a.font.size(), 'x');
        cache.insert({exactFit, a.font, 14, 0, 0}, 2);
        assert(cache.bytes() == budget);
        assert(!cache.find(a));
        assert(cache.find({exactFit, a.font, 14, 0, 0}) == 2);
        const std::string oversized(exactFit.size() + 1, 'y');
        cache.insert({oversized, a.font, 14, 0, 0}, 3);
        assert(!cache.find({oversized, a.font, 14, 0, 0}));
        assert(cache.find({exactFit, a.font, 14, 0, 0}) == 2);
        assert(cache.bytes() == budget);
    }

    {
        TextMeasurementCache cache;
#ifdef __EMSCRIPTEN__
        const auto initialHeapBytes = mallinfo().uordblks;
#endif
        for (size_t i = 0; i < 40000; ++i)
        {
            const std::string text = std::to_string(i);
            cache.insert({text, "Arial", 14, 0, 0}, static_cast<double>(i));
            assert(cache.size() <= 32768);
            assert(cache.bytes() <= 4 * 1024 * 1024);
        }
        assert(!cache.find({"0", "Arial", 14, 0, 0}));
        assert(cache.find({"39999", "Arial", 14, 0, 0}) == 39999);
#ifdef __EMSCRIPTEN__
        const auto heapBytes = mallinfo().uordblks - initialHeapBytes;
        std::cout << "WASM cache: " << cache.size() << " entries, "
                  << cache.bytes() << " accounted bytes, " << heapBytes << " allocated bytes\n";
#endif
    }

    std::cout << "Text measurement cache tests passed\n";
}
