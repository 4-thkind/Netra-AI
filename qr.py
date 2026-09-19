"""
Minimal offline QR encoder - byte mode, error-correction level L.

Exists so `run.py` can print a scannable code with no pip install and no
network call (this machine's DNS is unreliable, and a QR web service is a
silly dependency for a demo launcher).

Supports versions 1-10, which covers any tunnel URL comfortably.
"""

from __future__ import annotations

# --- Galois field tables for Reed-Solomon ---------------------------------
_EXP = [0] * 512
_LOG = [0] * 256
_x = 1
for _i in range(255):
    _EXP[_i] = _x
    _LOG[_x] = _i
    _x <<= 1
    if _x & 0x100:
        _x ^= 0x11D
for _i in range(255, 512):
    _EXP[_i] = _EXP[_i - 255]


def _mul(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    return _EXP[_LOG[a] + _LOG[b]]


def _rs_generator(n: int) -> list[int]:
    g = [1]
    for i in range(n):
        g2 = g + [0]
        for j in range(len(g)):
            g2[j + 1] ^= _mul(g[j], _EXP[i])
        g = g2
    return g


def _rs_encode(data: list[int], n_ec: int) -> list[int]:
    gen = _rs_generator(n_ec)
    rem = [0] * n_ec
    for byte in data:
        factor = byte ^ rem[0]
        rem = rem[1:] + [0]
        for i in range(n_ec):
            rem[i] ^= _mul(gen[i + 1], factor)
    return rem


# --- per-version capacity (level L, byte mode) ----------------------------
# (version, total_codewords, ec_per_block, [(num_blocks, data_per_block), ...])
_SPECS = {
    1:  (26,   7, [(1, 19)]),
    2:  (44,  10, [(1, 34)]),
    3:  (70,  15, [(1, 55)]),
    4:  (100, 20, [(1, 80)]),
    5:  (134, 26, [(1, 108)]),
    6:  (172, 18, [(2, 68)]),
    7:  (196, 20, [(2, 78)]),
    8:  (242, 24, [(2, 97)]),
    9:  (292, 30, [(2, 116)]),
    10: (346, 18, [(2, 68), (2, 69)]),
}

_ALIGN = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
    6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
}

# Version information is only needed for version >= 7.
_VERSION_BITS = {
    7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3,
}

_FORMAT_L_MASK0 = 0x77C4  # level L, mask pattern 0


def _capacity(version: int) -> int:
    _, ec, blocks = _SPECS[version]
    return sum(n * d for n, d in blocks)


def _build_codewords(data: bytes, version: int) -> list[int]:
    total, ec_per_block, blocks = _SPECS[version]
    cap = _capacity(version)

    # Mode indicator 0100 (byte) + length + payload, per ISO/IEC 18004.
    bits: list[int] = [0, 1, 0, 0]
    length_bits = 8 if version < 10 else 16
    for i in range(length_bits - 1, -1, -1):
        bits.append((len(data) >> i) & 1)
    for byte in data:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)

    bits.extend([0] * min(4, cap * 8 - len(bits)))       # terminator
    while len(bits) % 8:                                  # pad to byte
        bits.append(0)

    words = [int("".join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
    for pad in (0xEC, 0x11):                              # alternating pad bytes
        while len(words) < cap:
            words.append(pad)
            pad = 0x11 if pad == 0xEC else 0xEC
    words = words[:cap]

    # Split into blocks, compute EC, then interleave.
    data_blocks: list[list[int]] = []
    ec_blocks: list[list[int]] = []
    pos = 0
    for count, size in blocks:
        for _ in range(count):
            blk = words[pos:pos + size]
            pos += size
            data_blocks.append(blk)
            ec_blocks.append(_rs_encode(blk, ec_per_block))

    out: list[int] = []
    for i in range(max(len(b) for b in data_blocks)):
        for b in data_blocks:
            if i < len(b):
                out.append(b[i])
    for i in range(ec_per_block):
        for b in ec_blocks:
            out.append(b[i])
    return out


def _matrix(version: int, codewords: list[int]) -> list[list[int]]:
    size = version * 4 + 17
    m: list[list[int | None]] = [[None] * size for _ in range(size)]

    def finder(r: int, c: int) -> None:
        for dr in range(-1, 8):
            for dc in range(-1, 8):
                rr, cc = r + dr, c + dc
                if not (0 <= rr < size and 0 <= cc < size):
                    continue
                inside = 0 <= dr <= 6 and 0 <= dc <= 6
                ring = dr in (0, 6) or dc in (0, 6) or (2 <= dr <= 4 and 2 <= dc <= 4)
                m[rr][cc] = 1 if (inside and ring) else 0

    finder(0, 0)
    finder(0, size - 7)
    finder(size - 7, 0)

    for i in range(8, size - 8):                          # timing patterns
        bit = 1 if i % 2 == 0 else 0
        m[6][i] = bit
        m[i][6] = bit

    for r in _ALIGN[version]:                             # alignment patterns
        for c in _ALIGN[version]:
            if (r < 8 and c < 8) or (r < 8 and c > size - 9) or (r > size - 9 and c < 8):
                continue
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    m[r + dr][c + dc] = 1 if (abs(dr) == 2 or abs(dc) == 2
                                              or (dr == 0 and dc == 0)) else 0

    m[size - 8][8] = 1                                    # dark module

    # Reserve format areas so data placement skips them.
    for i in range(9):
        if m[8][i] is None:
            m[8][i] = 0
        if m[i][8] is None:
            m[i][8] = 0
    for i in range(8):
        if m[8][size - 1 - i] is None:
            m[8][size - 1 - i] = 0
        if m[size - 1 - i][8] is None:
            m[size - 1 - i][8] = 0

    if version >= 7:
        vbits = _VERSION_BITS[version]
        for i in range(18):
            bit = (vbits >> i) & 1
            m[size - 11 + i % 3][i // 3] = bit
            m[i // 3][size - 11 + i % 3] = bit

    # Place data bits, zig-zagging upward/downward in 2-column strips.
    bits = [(w >> i) & 1 for w in codewords for i in range(7, -1, -1)]
    idx = 0
    col = size - 1
    upward = True
    while col > 0:
        if col == 6:
            col -= 1
        rows = range(size - 1, -1, -1) if upward else range(size)
        for row in rows:
            for c in (col, col - 1):
                if m[row][c] is None:
                    bit = bits[idx] if idx < len(bits) else 0
                    idx += 1
                    # Mask pattern 0: invert where (row + col) is even.
                    m[row][c] = bit ^ (1 if (row + c) % 2 == 0 else 0)
        upward = not upward
        col -= 2

    # Format info (level L, mask 0). bit 14 is the MSB; the two copies are laid
    # out per ISO/IEC 18004 figure 25.
    fmt = _FORMAT_L_MASK0
    bit = [(fmt >> i) & 1 for i in range(15)]             # bit[i] = weight 2^i

    # Copy 1: row 8 leftwards, then column 8 upwards.
    for i in range(6):
        m[8][i] = bit[14 - i]
    m[8][7] = bit[8]
    m[8][8] = bit[7]
    m[7][8] = bit[6]
    for i in range(6):
        m[5 - i][8] = bit[5 - i]

    # Copy 2: the high 7 bits run up column 8 from the bottom edge, the low 8
    # bits run right along row 8 to the corner.
    for i in range(7):
        m[size - 1 - i][8] = bit[14 - i]
    for i in range(8):
        m[8][size - 8 + i] = bit[7 - i]

    return [[int(v or 0) for v in row] for row in m]


def get_grid(text: str, quiet: int = 4) -> list[list[int]]:
    """Return 2D grid of modules (0=white, 1=black) with quiet zone."""
    data = text.encode("utf-8")
    version = next((v for v in sorted(_SPECS) if _capacity(v) >= len(data) + 3), None)
    if version is None:
        raise ValueError("text too long for versions 1-10")

    m = _matrix(version, _build_codewords(data, version))
    size = len(m)
    pad = [0] * (size + quiet * 2)
    grid = [pad[:] for _ in range(quiet)]
    grid += [[0] * quiet + row + [0] * quiet for row in m]
    grid += [pad[:] for _ in range(quiet)]
    return grid


def save_image(text: str, filename: str = "phone-qr.png", scale: int = 12, quiet: int = 4) -> str:
    """Save QR code as a high-resolution image (PNG or BMP)."""
    grid = get_grid(text, quiet=quiet)
    dim = len(grid) * scale

    try:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (dim, dim), "white")
        draw = ImageDraw.Draw(img)
        for r, row in enumerate(grid):
            for c, val in enumerate(row):
                if val == 1:
                    draw.rectangle(
                        [c * scale, r * scale, (c + 1) * scale - 1, (r + 1) * scale - 1],
                        fill="#722F37"  # Netra wine brand color
                    )
        img.save(filename)
        return filename
    except Exception:
        # Fallback pure-Python BMP writer if PIL is missing
        bmp_file = filename if filename.endswith(".bmp") else filename.replace(".png", ".bmp")
        w, h = dim, dim
        row_bytes = w * 3
        padding = (4 - (row_bytes % 4)) % 4
        file_size = 54 + (row_bytes + padding) * h
        with open(bmp_file, "wb") as f:
            # BMP Header
            f.write(b"BM" + file_size.to_bytes(4, "little") + b"\x00\x00\x00\x00\x36\x00\x00\x00")
            # DIB Header (BITMAPINFOHEADER)
            f.write((40).to_bytes(4, "little") + w.to_bytes(4, "little") + (-h).to_bytes(4, "little", signed=True))
            f.write((1).to_bytes(2, "little") + (24).to_bytes(2, "little") + (0).to_bytes(4, "little"))
            f.write(((row_bytes + padding) * h).to_bytes(4, "little") + (2835).to_bytes(4, "little") * 2 + (0).to_bytes(8, "little"))
            # Pixel Data (BGR)
            wine_bgr = bytes([0x37, 0x2F, 0x72])
            white_bgr = bytes([0xFF, 0xF8, 0xF0])
            for r in range(h):
                grid_r = r // scale
                for c in range(w):
                    grid_c = c // scale
                    f.write(wine_bgr if grid[grid_r][grid_c] == 1 else white_bgr)
                f.write(b"\x00" * padding)
        return bmp_file


def render(text: str, quiet: int = 2) -> str:
    """Return the QR for `text` as text using half-block characters."""
    grid = get_grid(text, quiet=quiet)
    # Two module rows per text row: dark module -> light glyph on dark bg.
    lines = []
    for y in range(0, len(grid), 2):
        top = grid[y]
        bot = grid[y + 1] if y + 1 < len(grid) else [0] * len(top)
        line = "".join(
            {(0, 0): "█", (1, 1): " ", (1, 0): "▄", (0, 1): "▀"}[(t, b)]
            for t, b in zip(top, bot)
        )
        lines.append(line)
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    import socket
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    def get_lan_ip() -> str | None:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except Exception:
            return None

    import re
    from pathlib import Path

    target_url = sys.argv[1] if len(sys.argv) > 1 else None

    if not target_url:
        log_file = Path(__file__).resolve().parent / "tunnel.log"
        if log_file.exists():
            try:
                m = re.search(r"https://[-a-z0-9]+\.trycloudflare\.com", log_file.read_text(encoding="utf-8", errors="replace"))
                if m:
                    target_url = m.group()
            except Exception:
                pass

    if not target_url:
        target_url = "http://localhost:3000"

    print(f"\n========================================================")
    print(f"  NETRĀ Phone Access QR Code")
    print(f"  Target URL: {target_url}")
    print(f"========================================================\n")
    print(render(target_url))
    
    saved = save_image(target_url, "phone-qr.png")
    print(f"\nSaved image QR code to: {saved}\n")
