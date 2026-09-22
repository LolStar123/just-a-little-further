// Shared by the Botato miniature and the mouse-following meowl.
// Breadth-first search returns a reachable fallback when the requested cell is blocked.
export function findPath(cols, rows, blocked, start, goal, diagonal = false) {
    const clamp = (v, max) => Math.max(0, Math.min(max - 1, Math.round(v)));
    const encode = (x, y) => y * cols + x;
    const decode = key => [key % cols, Math.floor(key / cols)];
    const occupied = (x, y) => x < 0 || y < 0 || x >= cols || y >= rows || blocked.has(x + ',' + y);
    let [sx, sy] = [clamp(start[0], cols), clamp(start[1], rows)];
    const [gx, gy] = [clamp(goal[0], cols), clamp(goal[1], rows)];
    if (occupied(sx, sy)) {
        let best = Infinity, free = null;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            const d = (x - sx) ** 2 + (y - sy) ** 2;
            if (!occupied(x, y) && d < best) { best = d; free = [x, y]; }
        }
        if (!free) return [];
        [sx, sy] = free;
    }
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    if (diagonal) directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    const initial = encode(sx, sy), queue = [initial], previous = new Map([[initial, null]]);
    let nearest = initial, distance = Infinity;
    for (let i = 0; i < queue.length; i++) {
        const key = queue[i], [x, y] = decode(key), d = (gx - x) ** 2 + (gy - y) ** 2;
        if (d < distance) { nearest = key; distance = d; }
        if (x === gx && y === gy) break;
        for (const [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy, next = encode(nx, ny);
            if (occupied(nx, ny) || previous.has(next)) continue;
            if (dx && dy && (occupied(x + dx, y) || occupied(x, y + dy))) continue;
            previous.set(next, key); queue.push(next);
        }
    }
    const route = [];
    for (let key = nearest; key !== null; key = previous.get(key)) route.push(decode(key));
    return route.reverse();
}
