import {meowl} from './creatures.js';
import {findPath} from './pathfinding.js';

export class Companion {
    constructor(wake) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'mouse-meowl';
        this.canvas.setAttribute('aria-hidden', 'true');
        const layer = document.createElement('div');
        layer.id = 'companion-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.append(this.canvas);
        document.body.append(layer);
        this.ctx = this.canvas.getContext('2d');
        this.cell = 22;
        this.x = 44;
        this.y = innerHeight * .64;
        this.target = {x: this.x, y: this.y};
        this.route = [];
        this.rects = [];
        this.blocked = new Set();
        this.speed = 0;
        this.facing = 1;
        this.walkTime = 0;
        this.pointerSeen = false;
        this.layoutDirty = true;
        this.pathDirty = true;
        this.nextPlan = 0;
        this.plans = 0;
        this.wake = wake;
        this.resize();
        addEventListener('pointermove', event => {
            if (event.pointerType === 'touch') return;
            this.follow(event.clientX, event.clientY);
        }, {passive: true});
        let touchStart;
        addEventListener('pointerdown', event => {
            if (event.pointerType === 'touch') touchStart = [event.clientX, event.clientY];
        }, {passive: true});
        addEventListener('pointerup', event => {
            if (event.pointerType === 'touch' && touchStart && Math.hypot(event.clientX - touchStart[0], event.clientY - touchStart[1]) < 12) this.follow(event.clientX, event.clientY);
            touchStart = null;
        }, {passive: true});
        addEventListener('scroll', () => { this.layoutDirty = true; this.pathDirty = true; wake(); }, {passive: true});
        addEventListener('resize', () => { this.resize(); wake(); });
        document.addEventListener('toggle', () => { this.layoutDirty = true; this.pathDirty = true; wake(); }, true);
        document.fonts.ready.then(() => { this.layoutDirty = true; this.pathDirty = true; wake(); });
    }

    resize() {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        this.canvas.width = 80 * dpr; this.canvas.height = 84 * dpr;
        this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.x = Math.max(24, Math.min(innerWidth - 24, this.x));
        this.y = Math.max(40, Math.min(innerHeight - 26, this.y));
        this.layoutDirty = this.pathDirty = true;
    }

    follow(x, y) {
        this.pointerSeen = true;
        // Wait a little below the pointer, leaving links and the cursor uncovered.
        this.target = {x: Math.max(24, Math.min(innerWidth - 24, x - 24)), y: Math.max(36, Math.min(innerHeight - 26, y + 35))};
        this.pathDirty = true;
        this.wake();
    }

    gather() {
        this.follow(innerWidth * .5, innerHeight * .7);
    }

    collectObstacles() {
        const selector = 'h1,h2,.hello-note,.scene-intro>p,.signoff>p,.call-window,.halo-cue,.game-field,.lot-demo>canvas,.site-header,.site-footer,button,summary';
        this.rects = [];
        for (const element of document.querySelectorAll(selector)) {
            const style = getComputedStyle(element), bounds = element.getBoundingClientRect();
            const cueEntering = element.matches('.halo-cue') && Number(element.closest('.call-wrap').dataset.phase) >= 2;
            if (style.display === 'none' || (!cueEntering && Number(style.opacity) < .1) || bounds.bottom < 0 || bounds.top > innerHeight) continue;
            let rectangles = [bounds];
            if (element.matches('h1,h2,p')) {
                const range = document.createRange(); range.selectNodeContents(element);
                rectangles = [...range.getClientRects()];
            }
            for (const r of rectangles) if (r.width && r.height) this.rects.push({left:r.left - 19, top:r.top - 25, right:r.right + 19, bottom:r.bottom + 21});
        }
        this.cols = Math.ceil(innerWidth / this.cell);
        this.rows = Math.ceil(innerHeight / this.cell);
        this.blocked.clear();
        for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
            const px = (x + .5) * this.cell, py = (y + .5) * this.cell;
            if (px < 20 || px > innerWidth - 20 || py < 28 || py > innerHeight - 20 || this.rects.some(r => px + 11 > r.left && px - 11 < r.right && py + 11 > r.top && py - 11 < r.bottom)) this.blocked.add(x + ',' + y);
        }
        this.layoutDirty = false;
    }

    plan(now) {
        if (this.layoutDirty) this.collectObstacles();
        const grid = v => Math.floor(v / this.cell);
        const route = findPath(this.cols, this.rows, this.blocked, [grid(this.x), grid(this.y)], [grid(this.target.x), grid(this.target.y)], true);
        this.route = route.map(([x,y]) => ({x:(x + .5) * this.cell,y:(y + .5) * this.cell}));
        // The first cell contains the current position. Don't backtrack to its centre on every retarget.
        if (this.route.length > 1 && Math.hypot(this.route[0].x - this.x, this.route[0].y - this.y) < this.cell * .72) this.route.shift();
        this.pathDirty = false;
        this.nextPlan = now + .11;
        this.plans++;
    }

    update(dt, now) {
        if (!this.ctx) return;
        if (this.pathDirty && (now >= this.nextPlan || !this.pointerSeen)) this.plan(now);
        const previousX = this.x, previousY = this.y;
        const remaining = this.route.reduce((total, point, i) => {
            const p = i ? this.route[i - 1] : this;
            return total + Math.hypot(point.x - p.x, point.y - p.y);
        }, 0);
        const wanted = this.pointerSeen && remaining > 2 ? Math.min(340, 75 + remaining * 2) : 0;
        this.speed += (wanted - this.speed) * (1 - Math.exp(-dt * 9));
        let travel = this.speed * dt;
        while (this.route.length && travel > 0) {
            const p = this.route[0], dx = p.x - this.x, dy = p.y - this.y, distance = Math.hypot(dx, dy);
            if (distance <= travel) { this.x = p.x; this.y = p.y; this.route.shift(); travel -= distance; }
            else { this.x += dx / distance * travel; this.y += dy / distance * travel; travel = 0; }
        }
        const moved = Math.hypot(this.x - previousX, this.y - previousY);
        this.walkTime += moved / 55;
        if (Math.abs(this.x - previousX) > .1) this.facing = Math.sign(this.x - previousX);
        this.canvas.style.transform = 'translate3d(' + (this.x - 40).toFixed(2) + 'px,' + (this.y - 43).toFixed(2) + 'px,0)';
        this.ctx.clearRect(0, 0, 80, 84);
        meowl(this.ctx,40,62,.62,{time:moved > .01 ? this.walkTime : now, speed:dt ? moved / dt : 0, look:this.pointerSeen ? Math.max(-3,Math.min(3,(this.target.x - this.x) / 40)) : 0, tilt:moved > .01 ? this.facing * .065 : 0, coat:'#e5dfcf',seed:4});
    }

    diagnostics() {
        return {x:this.x,y:this.y,target:this.target,route:this.route,blocked:[...this.blocked],cell:this.cell,plans:this.plans,pointerSeen:this.pointerSeen,rects:this.rects};
    }
}
