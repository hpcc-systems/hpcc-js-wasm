import { decompress } from "fzstd";

//  See:  https://github.com/Equim-chan/base91
const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

function decode(raw: string): Uint8Array {
    const len = raw.length;
    const ret: number[] = [];

    let b = 0;
    let n = 0;
    let v = -1;

    for (let i = 0; i < len; i++) {
        const p = table.indexOf(raw[i]);
        /* istanbul ignore next */
        if (p === -1) continue;
        if (v < 0) {
            v = p;
        } else {
            v += p * 91;
            b |= v << n;
            n += (v & 8191) > 88 ? 13 : 14;
            do {
                ret.push(b & 0xff);
                b >>= 8;
                n -= 8;
            } while (n > 7);
            v = -1;
        }
    }

    if (v > -1) {
        ret.push((b | v << n) & 0xff);
    }

    return new Uint8Array(ret);
}

export function extract(raw: string): Uint8Array {
    const compressed = decode(raw);
    return decompress(compressed);
}
