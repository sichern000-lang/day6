# -*- coding: utf-8 -*-
"""jeju-map.svg(도로·해안선 선 그림)에서 섬 모양(땅/바다)을 뽑아 src/data/jeju-mask.json 으로 저장.
선을 격자에 그리고 → 틈을 메우도록 부풀리고 → 바깥에서 바다를 채워서 → 남은 곳을 땅으로 봄. (외부 라이브러리 없이 표준 라이브러리만 사용)
실행: python3 scripts/make-jeju-mask.py"""
import re, json, sys
from collections import deque
SRC, OUT = 'src/assets/jeju-map.svg', 'src/data/jeju-mask.json'
W0, H0, S = 1775, 886, 4                 # 원본 크기, 줄이는 배율
W, H = W0 // S + 1, H0 // S + 1
grid = [bytearray(W) for _ in range(H)]

def line(x0, y0, x1, y1):               # 브레젠햄 선 그리기
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        if 0 <= y0 < H and 0 <= x0 < W: grid[y0][x0] = 1
        if x0 == x1 and y0 == y1: break
        e2 = 2 * err
        if e2 >= dy: err += dy; x0 += sx
        if e2 <= dx: err += dx; y0 += sy

for m in re.finditer(r'<path d="M ([^"]+)"', open(SRC).read()):
    pts = [tuple(int(v) // S for v in p.split(',')) for p in m.group(1).split()]
    for a, b in zip(pts, pts[1:]): line(a[0], a[1], b[0], b[1])
    if len(pts) == 1: line(pts[0][0], pts[0][1], pts[0][0], pts[0][1])

def dilate(g, n=1):
    for _ in range(n):
        out = [bytearray(W) for _ in range(H)]
        for y in range(H):
            row = g[y]
            for x in range(W):
                if row[x]:
                    for yy in range(max(0, y - 1), min(H, y + 2)):
                        o = out[yy]
                        for xx in range(max(0, x - 1), min(W, x + 2)): o[xx] = 1
        g = out
    return g

closed = dilate(grid, 2)
# 바깥(바다) 채우기
sea = [bytearray(W) for _ in range(H)]
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if not closed[y][x]: sea[y][x] = 1; q.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        if not closed[y][x] and not sea[y][x]: sea[y][x] = 1; q.append((x, y))
while q:
    x, y = q.popleft()
    for xx, yy in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= xx < W and 0 <= yy < H and not closed[yy][xx] and not sea[yy][xx]:
            sea[yy][xx] = 1; q.append((xx, yy))
# 부풀린 만큼 바깥쪽 가장자리를 되돌리려고 땅을 한 칸 깎음(침식)
land = [bytearray(0 if sea[y][x] else 1 for x in range(W)) for y in range(H)]
def erode(g, n=1):
    for _ in range(n):
        out = [bytearray(W) for _ in range(H)]
        for y in range(H):
            for x in range(W):
                if g[y][x] and all(g[yy][xx] for yy in range(max(0, y - 1), min(H, y + 2)) for xx in range(max(0, x - 1), min(W, x + 2))):
                    out[y][x] = 1
        g = out
    return g
land = erode(land, 1)
# 가장 큰 덩어리(제주 본섬)만 남김 + 작은 섬은 따로 버림
seen = [bytearray(W) for _ in range(H)]
best = []
for y in range(H):
    for x in range(W):
        if land[y][x] and not seen[y][x]:
            comp, dq = [], deque([(x, y)]); seen[y][x] = 1
            while dq:
                cx, cy = dq.popleft(); comp.append((cx, cy))
                for xx, yy in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= xx < W and 0 <= yy < H and land[yy][xx] and not seen[yy][xx]:
                        seen[yy][xx] = 1; dq.append((xx, yy))
            if len(comp) > len(best): best = comp
final = [bytearray(W) for _ in range(H)]
for x, y in best: final[y][x] = 1
print('land cells', len(best), 'of', W * H, f'({len(best) / (W * H):.1%})')
# 미리보기(ASCII)
for y in range(0, H, 6):
    print(''.join('#' if final[y][x] else '.' for x in range(0, W, 4)))
# 행마다 0/1 연속 길이로 저장 (앞은 항상 0 시작)
rows = []
for y in range(H):
    runs, cur, n = [], 0, 0
    for x in range(W):
        if final[y][x] == cur: n += 1
        else: runs.append(n); cur = final[y][x]; n = 1
    runs.append(n); rows.append(runs)
json.dump({'w': W, 'h': H, 'scale': S, 'srcW': W0, 'srcH': H0, 'rows': rows}, open(OUT, 'w'), separators=(',', ':'))
print('saved', OUT)
