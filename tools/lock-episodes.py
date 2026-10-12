#!/usr/bin/env python3
"""
Lock the MY WAR episode players behind a password.

Asks for one shared password and the YouTube/Vimeo link of each episode,
encrypts each link, and writes it into index.html (data-locked="...").
The links never appear in the page in readable form.

Usage (from the website folder):
    python3 tools/lock-episodes.py
    python3 tools/lock-episodes.py --ep1 <link> --ep2 <link>   # only asks for the password
Then publish:
    git add index.html && git commit -m "Update locked episodes" && git push

Scheme (matched by decryptSpec() in js/main.js, using the browser's Web Crypto):
    keys      = PBKDF2-HMAC-SHA256(password, salt, ITERATIONS) -> 64 bytes (enc | mac)
    keystream = HMAC-SHA256(enc, nonce || uint32_be(block)) for block 0, 1, ...
    ct        = utf8(spec) XOR keystream
    tag       = HMAC-SHA256(mac, salt || nonce || ct)
"""
import argparse
import base64
import getpass
import hashlib
import hmac
import json
import os
import re
import sys

ITERATIONS = 310_000
EPISODES = {"1": "Episode 1 — The Hate", "2": "Episode 2 — No Rules"}


def to_spec(link: str) -> str:
    """Turn a pasted YouTube/Vimeo link (or an existing spec) into 'youtube:ID' / 'vimeo:ID[/hash]'."""
    link = link.strip()
    if re.fullmatch(r"(youtube|vimeo):[\w\-/]+", link):
        return link
    m = (re.search(r"youtu\.be/([\w\-]{6,})", link)
         or re.search(r"youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/|live/)([\w\-]{6,})", link))
    if m:
        return f"youtube:{m.group(1)}"
    m = re.search(r"vimeo\.com/(?:video/)?(\d+)(?:/([0-9a-f]+))?", link)
    if m:
        h = m.group(2) or (re.search(r"[?&]h=([0-9a-f]+)", link) or [None, None])[1]
        return f"vimeo:{m.group(1)}" + (f"/{h}" if h else "")
    raise ValueError(f"Not a YouTube or Vimeo link: {link!r}")


def _keystream_xor(enc_key: bytes, nonce: bytes, data: bytes) -> bytes:
    out = bytearray()
    for block in range((len(data) + 31) // 32):
        ks = hmac.new(enc_key, nonce + block.to_bytes(4, "big"), hashlib.sha256).digest()
        chunk = data[block * 32:(block + 1) * 32]
        out += bytes(a ^ b for a, b in zip(chunk, ks))
    return bytes(out)


def _keys(password: str, salt: bytes, iterations: int):
    km = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations, dklen=64)
    return km[:32], km[32:]


def encrypt(spec: str, password: str) -> str:
    salt, nonce = os.urandom(16), os.urandom(16)
    enc_key, mac_key = _keys(password, salt, ITERATIONS)
    ct = _keystream_xor(enc_key, nonce, spec.encode("utf-8"))
    tag = hmac.new(mac_key, salt + nonce + ct, hashlib.sha256).digest()
    b64 = lambda b: base64.b64encode(b).decode("ascii")
    return json.dumps({"v": 1, "i": ITERATIONS, "s": b64(salt), "n": b64(nonce), "c": b64(ct), "t": b64(tag)},
                      separators=(",", ":"))


def decrypt(payload: str, password: str):
    d = json.loads(payload)
    salt, nonce, ct, tag = (base64.b64decode(d[k]) for k in ("s", "n", "c", "t"))
    enc_key, mac_key = _keys(password, salt, d["i"])
    if not hmac.compare_digest(hmac.new(mac_key, salt + nonce + ct, hashlib.sha256).digest(), tag):
        return None
    return _keystream_xor(enc_key, nonce, ct).decode("utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--file", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "index.html"))
    ap.add_argument("--ep1", help="Episode 1 YouTube/Vimeo link (skips the prompt)")
    ap.add_argument("--ep2", help="Episode 2 YouTube/Vimeo link (skips the prompt)")
    args = ap.parse_args()
    given = {"1": args.ep1, "2": args.ep2}

    path = os.path.abspath(args.file)
    html = open(path, encoding="utf-8").read()

    print("MY WAR — lock the episode players\n")
    while True:
        pw = getpass.getpass("Password for the episodes (hidden): ")
        if len(pw) < 6:
            print("  Use at least 6 characters.\n")
            continue
        if pw != getpass.getpass("Type it again: "):
            print("  The two didn't match — try again.\n")
            continue
        break

    for ep, title in EPISODES.items():
        while True:
            try:
                link = given[ep] or input(f"\n{title} — paste the YouTube/Vimeo link: ")
                spec = to_spec(link)
                break
            except ValueError as err:
                print(f"  {err}")
                given[ep] = None
        payload = encrypt(spec, pw)
        assert decrypt(payload, pw) == spec  # self-check
        pattern = re.compile(r'(data-episode="%s"\s+data-locked=)\'[^\']*\'' % ep)
        if not pattern.search(html):
            sys.exit(f"Couldn't find the Episode {ep} player (data-episode=\"{ep}\") in {path}")
        html = pattern.sub(lambda m: f"{m.group(1)}'{payload}'", html, count=1)
        print(f"  ✓ {title} locked ({spec.split(':')[0]})")

    open(path, "w", encoding="utf-8").write(html)
    print(f"\nSaved {os.path.relpath(path)}. Publish with:\n"
          '  git add index.html && git commit -m "Update locked episodes" && git push')


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\nCancelled — nothing was changed.")
