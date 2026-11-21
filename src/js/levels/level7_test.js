// =========================================================================
// LEVEL 8: 测试关卡 · 指挥中心全图 (COMMAND CENTER - FULL MAP TEST LEVEL)
// 2026-11-09 重组 V2：显示名改为 Level 8（避免与 L7 混淆）；内部 id 仍为 level7_test（见 DEV_NOTES Record 021）。
// 依据用户最新草图与指令构建的巨型眼睛地图 (The Eye Map)
// 2026-11-09 重组 V1：原 L7 全图（三房间）改作测试关卡，继承 L8 特性；正式 L7 只留中间房间（见 level7_lab.js）。
// =========================================================================

window.level7TestMapWidth = 3200;
window.level7TestMapHeight = 2400;

// =========================================================================
// 全新扇形战术控制台绘制系统 (自 Level 8 移植，完全依据手绘草稿 IMG_7693 设计)
// 包含 5 大核心要素：
// 1. 控制台本身呈扇形（弧形外边、内凹弧形座舱边缘、径向收拢侧翼）
// 2. 前部三个连在一起的弧面显示屏（一体化铰链连接，雷达、频谱、动力监测，角度贴合弧度）
// 3. 屏幕后方中央的机械键盘与操作员滑轮座椅（紧贴内凹工位，带腰托高靠背与扶手，无黑影）
// 4. 左侧操作翼多排控制按钮（方块按键、指示摇臂、金属防护拨动开关）
// 5. 右侧操作翼多排控制按钮（双推子电位器、旋转刻度旋钮、微动矩阵、带黄黑警示圈的大型紧急制动按钮）
// =========================================================================
function getCircularPodWorkstation(cx, cy, angle = 0, scale = 1.0, label = "CIRCULAR POD CONSOLE") {
    const boundR = 65 * scale; // 剔除框半径（比视觉略大，用于视锥剔除）
    const collR = 62 * scale; // 碰撞半径 = 视觉外壳 R_out，16边形逼近
    // 16边形碰撞多边形，贴近圆形视觉
    const points = [];
    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        points.push({ x: cx + Math.cos(a) * collR, y: cy + Math.sin(a) * collR });
    }
    return {
        type: "circular_pod_workstation",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundR,
        y: cy - boundR,
        w: boundR * 2,
        h: boundR * 2,
        points: points,
        label: label,
        displayName: "CIRCULAR ENCLOSED COMMAND POD",
        noCollision: false,
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__podCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const sz = Math.ceil(boundR * 2 + 20);
                const off = document.createElement('canvas');
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(sz / 2, sz / 2);
                // 静态绘制（时间冻结在0），反向补偿让 (cx,cy) 落在 offscreen 中心
                octx.translate(-cx, -cy);
                drawCircularPodWorkstation(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2);
            // 动态元素每帧叠加
            drawCircularPodWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}




// =========================================================
// 三联方形隔间战术控制台 (从 Level 8 移植，2026-11-05)
// =========================================================
function getTripleCubicleWorkstation(cx, cy, angle = 0, scale = 1.0, label = "TRIPLE CUBICLE WORKSTATION") {
    const boundW = 280 * scale;
    const boundH = 106 * scale;
    return {
        type: "triple_cubicle_workstation",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundW / 2,
        y: cy - boundH / 2,
        w: boundW,
        h: boundH,
        label: label,
        displayName: "TRIPLE CUBICLE COMMAND POD",
        noCollision: false,
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__tripleCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const cw = Math.ceil(boundW + 20), ch = Math.ceil(boundH + 20);
                const off = document.createElement('canvas');
                off.width = cw; off.height = ch;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(cw / 2, ch / 2);
                octx.translate(-cx, -cy);
                drawTripleCubicleWorkstation(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2);
            drawTripleCubicleWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}




// =========================================================
// 指挥讲台 (从 Level 8 移植，2026-11-05)
// =========================================================
// =========================================================================
function getPodium(cx, cy, angle = 0, scale = 1.0, label = "COMMAND PODIUM") {
    const boundW = 60 * scale;
    const boundH = 50 * scale;
    return {
        type: "command_podium",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundW / 2,
        y: cy - boundH / 2,
        w: boundW,
        h: boundH,
        label: label,
        displayName: "COMMAND PODIUM",
        noCollision: true, // 确保角色能自然走入护翼并站上底座
        hideLabel: true,
        draw: (ctx) => {
            drawPodium(ctx, cx, cy, angle, scale);
        }
    };
}

// 生成扇形控制台的高精度物理碰撞多边形顶点及道具对象
function getSectorWorkstation(cx, cy, angle = 0, scale = 1.0, label = "SECTOR WORKSTATION") {
    const R_out = 114 * scale;
    const R_in = 50 * scale;
    const maxTheta = 38 * Math.PI / 180;
    const pts = [];
    const steps = 8;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i <= steps; i++) {
        const t = -maxTheta + (2 * maxTheta) * (i / steps);
        const lx = Math.sin(t) * R_out;
        const ly = -Math.cos(t) * R_out;
        pts.push({
            x: Math.round(cx + (lx * cosA - ly * sinA)),
            y: Math.round(cy + (lx * sinA + ly * cosA))
        });
    }
    for (let i = steps; i >= 0; i--) {
        const t = -maxTheta + (2 * maxTheta) * (i / steps);
        const lx = Math.sin(t) * R_in;
        const ly = -Math.cos(t) * R_in;
        pts.push({
            x: Math.round(cx + (lx * cosA - ly * sinA)),
            y: Math.round(cy + (lx * sinA + ly * cosA))
        });
    }

    const boundR = 135 * scale;
    return {
        type: "sector_workstation",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundR,
        y: cy - boundR,
        w: boundR * 2,
        h: boundR * 2,
        points: pts,
        label: label,
        displayName: "SECTOR COMMAND CONSOLE",
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-04)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__wsCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const sz = Math.ceil(boundR * 2);
                const off = document.createElement('canvas');
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(boundR, boundR);
                // 静态绘制（时间冻结在0），注意：原函数内部会 translate(cx,cy)，
                // 这里我们反向补偿，让 (cx,cy) 落在 offscreen 中心
                octx.translate(-cx, -cy);
                drawSectorWorkstation(octx, cx, cy, angle, scale, true);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - boundR, cy - boundR);
            // 动态元素每帧叠加
            drawSectorWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}

// =========================================================
// 服务器集群 (从 Level 8 移植，2026-11-05)
// =========================================================
// =========================================================================


function getServerCluster(cx, cy, angle = 0, scale = 1.0, label = "TACTICAL 5-RACK SERVER CLUSTER") {
    // 整体尺寸放大 2.35 倍：宽 330px，高 96px (单柜宽 66px 远超角色宽度，气势磅礴)
    const boundW = 330 * scale;
    const boundH = 96 * scale;
    const halfW = boundW / 2;
    const halfH = boundH / 2;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const localCorners = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ];
    const points = localCorners.map(p => ({
        x: Math.round(cx + (p.x * cosA - p.y * sinA)),
        y: Math.round(cy + (p.x * sinA + p.y * cosA))
    }));

    return {
        type: "server_cluster",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - halfW,
        y: cy - halfH,
        w: boundW,
        h: boundH,
        points: points,
        label: label,
        displayName: "SERVER CLUSTER RACK ARRAY",
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__serverCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const sz = Math.ceil(Math.hypot(boundW + 10, boundH + 14) + 20);
                const off = document.createElement('canvas');
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(sz / 2, sz / 2);
                octx.translate(-cx, -cy);
                drawServerCluster(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2);
            // 动态元素每帧叠加
            drawServerClusterDynamic(ctx, cx, cy, angle, scale);
        }
    };
}

// =========================================================================
// Level 8 缓冲区 · 更衣区精密道具绘制系统 (等比 ×0.7 缩放，减细节保清晰)
// 全区总量对标三联工作站 (~140图元, ~60色, 线宽中位 0.8/最大 1.8)
// =========================================================================
function buildCorridorPropBox(cx, cy, angle, w, h, noCollision, type, label, displayName, drawStatic, drawDynamic, cachePrefix) {
    const halfW = w / 2;
    const halfH = h / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const points = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(pt => ({
        x: +(cx + pt.x * cosA - pt.y * sinA).toFixed(1),
        y: +(cy + pt.x * sinA + pt.y * cosA).toFixed(1)
    }));
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        type: type,
        cx: cx,
        cy: cy,
        angle: angle,
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        points: points,
        label: label,
        displayName: displayName,
        noCollision: noCollision,
        hideLabel: true,
        draw: (ctx) => {
            const cacheKey = cachePrefix + '_v2_ss4_' + cx.toFixed(1) + '_' + cy.toFixed(1) + '_' + angle.toFixed(4);
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const sz = Math.ceil(Math.hypot(w + 18, h + 18) + 12);
                const off = document.createElement('canvas');
                off.width = sz * SS;
                off.height = sz * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(sz / 2, sz / 2);
                octx.translate(-cx, -cy);
                drawStatic(octx, cx, cy, angle);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2, c.size, c.size);
            ctx.restore();
            if (drawDynamic) {
                drawDynamic(ctx, cx, cy, angle);
            }
        }
    };
}

// -------------------------------------------------------------------------
// 1. 更衣区：4 门洁净室储物柜 (78.4 x 21.0 = 112x30 ×0.7，靠北墙朝南面向通道)
// -------------------------------------------------------------------------
function drawBufferDressingLockersStatic(ctx, cx, cy, angle) {
    const W = 78.4;
    const H = 21.0;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 地面阴影与前缘木塑踏台 (朝向 +y 通道中央)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.5, -halfH + 1.2, W + 3.0, H + 2.2);

    ctx.fillStyle = '#5e432a';
    ctx.fillRect(-halfW + 1, halfH - 4.0, W - 2, 4.0);
    ctx.strokeStyle = '#9c754d';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-halfW + 1, halfH - 4.0, W - 2, 4.0);

    // 柜体钢制主外壳 (浅灰绿面板 + 深色打底 + 0.8 翡翠倒角)
    const bodyGrad = ctx.createLinearGradient(0, -halfH, 0, halfH - 3.5);
    bodyGrad.addColorStop(0, '#2a423b');
    bodyGrad.addColorStop(0.5, '#3b5c52');
    bodyGrad.addColorStop(1, '#233831');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-halfW, -halfH, W, H - 3.5);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, -halfH, W, H - 3.5);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW, -halfH, W, H - 3.5);

    // 4 扇清晰大块门扇 (每门 ~18x13px，并碎成整块)
    const pitch = 19.0;
    const bayW = 17.6;
    const startX = -halfW + 1.9;
    const doorY = -halfH + 3.8;
    const doorH = 12.6;

    for (let i = 0; i < 4; i++) {
        const dx = startX + i * pitch;
        ctx.fillStyle = '#476b60';
        ctx.fillRect(dx, doorY, bayW, doorH);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(dx, doorY, bayW, doorH);

        // 合并式百叶通风槽块 (5.6 x 4.6)
        ctx.fillStyle = '#0a1814';
        ctx.fillRect(dx + 1.6, doorY + 1.6, 5.8, 4.4);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(dx + 1.6, doorY + 1.6, 5.8, 4.4);

        // 清晰编号铭牌 (L1..L4)
        ctx.font = 'bold 4.2px monospace';
        ctx.fillStyle = '#d1fae5';
        ctx.textAlign = 'center';
        ctx.fillText(`0${i + 1}`, dx + 4.5, doorY + 10.6);

        // 右侧竖向锁柄条 (4.2 x 8.4)
        ctx.fillStyle = '#142326';
        ctx.fillRect(dx + 11.4, doorY + 2.0, 4.4, 8.6);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(dx + 11.4, doorY + 2.0, 4.4, 8.6);
    }

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDressingLockersDynamic(ctx, cx, cy, angle) {
    __dynDrawCached(ctx, 'drawBufferDressingLockersDynamic', 200, 160, cx, cy, (octx) => drawBufferDressingLockersDynamicImpl(octx, cx, cy, angle));
}
function drawBufferDressingLockersDynamicImpl(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const startX = -39.2 + 1.9;
    const doorY = -10.5 + 3.8;
    for (let i = 0; i < 4; i++) {
        const dx = startX + i * 19.0;
        const pulse = Math.sin(time * 2.2 + i * 1.7) > 0;
        ctx.fillStyle = (i === 2) ? (pulse ? '#f59e0b' : '#78350f') : (pulse ? '#34d399' : '#064e3b');
        ctx.fillRect(dx + 12.6, doorY + 4.8, 2.0, 3.0);
    }
    ctx.restore();
}

function getBufferDressingLockers(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 78.4, 21.0, false,
        'buffer_dressing_lockers',
        'BUFFER DRESSING LOCKERS',
        'SEALED DRESSING LOCKERS',
        drawBufferDressingLockersStatic,
        drawBufferDressingLockersDynamic,
        '__bufLockersCache'
    );
}

// -------------------------------------------------------------------------
// 2. 更衣区：缓冲区环境监控屏幕 (64.4 x 18.2 = 92x26 ×0.7，靠北墙朝南面向通道)
// -------------------------------------------------------------------------
function drawBufferDressingMonitorStatic(ctx, cx, cy, angle) {
    const W = 64.4;
    const H = 18.2;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 投影 + 墙体安装悬臂板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW + 1.0, -halfH + 1.8, W + 1.0, H - 0.5);

    ctx.fillStyle = '#2d4046';
    ctx.fillRect(-20, -halfH, 40, 4.2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-20, -halfH, 40, 4.2);

    // 主机金属壳体 (62 x 14.8)
    const boxX = -31.0;
    const boxY = -halfH + 3.0;
    const boxW = 62.0;
    const boxH = 14.8;
    const frameGrad = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
    frameGrad.addColorStop(0, '#475f66');
    frameGrad.addColorStop(1, '#202e33');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // 清晰高对比度蓝色监控液晶面板 (56.4 x 11.2，保留外壳翡翠色描边)
    const scrX = boxX + 2.8;
    const scrY = boxY + 1.8;
    const scrW = boxW - 5.6;
    const scrH = boxH - 3.6;
    const scrGrad = ctx.createLinearGradient(scrX, scrY, scrX + scrW, scrY + scrH);
    scrGrad.addColorStop(0, '#020617');
    scrGrad.addColorStop(0.45, '#075985');
    scrGrad.addColorStop(0.75, '#0369a1');
    scrGrad.addColorStop(1, '#020617');
    ctx.fillStyle = scrGrad;
    ctx.fillRect(scrX, scrY, scrW, scrH);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(scrX, scrY, scrW, scrH);

    // 屏幕内部水平扫描底纹
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 0.4;
    for (let sy = scrY + 1.6; sy < scrY + scrH - 0.8; sy += 2.0) {
        ctx.beginPath();
        ctx.moveTo(scrX + 0.5, sy);
        ctx.lineTo(scrX + scrW - 0.5, sy);
        ctx.stroke();
    }

    // 双分栏隔线 + 蓝色等宽读数 (气压 / 温度 / O2)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(scrX + 20.5, scrY + 0.8);
    ctx.lineTo(scrX + 20.5, scrY + scrH - 0.8);
    ctx.moveTo(scrX + 39.0, scrY + 0.8);
    ctx.lineTo(scrX + 39.0, scrY + scrH - 0.8);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 3.1px monospace';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText('PRESS', scrX + 1.4, scrY + 3.2);
    ctx.fillText('TEMP', scrX + 21.8, scrY + 3.2);
    ctx.fillText('O2', scrX + 40.4, scrY + 3.2);

    ctx.font = '3.2px monospace';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText('+18.4P', scrX + 1.4, scrY + 6.5);
    ctx.fillText('21.4C', scrX + 21.8, scrY + 6.5);
    ctx.fillStyle = '#bae6fd';
    ctx.fillText('21.0%', scrX + 40.4, scrY + 6.5);

    // 底部三栏动态指示条暗槽背景
    const barY = scrY + 7.7;
    const barH = 2.2;
    [
        { x: scrX + 1.4, w: 17.5 },
        { x: scrX + 21.8, w: 15.6 },
        { x: scrX + 40.4, w: 14.4 }
    ].forEach(slot => {
        ctx.fillStyle = '#082f49';
        ctx.fillRect(slot.x, barY, slot.w, barH);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(slot.x, barY, slot.w, barH);
    });

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDressingMonitorDynamic(ctx, cx, cy, angle) {
    __dynDrawCached(ctx, 'drawBufferDressingMonitorDynamic', 200, 160, cx, cy, (octx) => drawBufferDressingMonitorDynamicImpl(octx, cx, cy, angle));
}
function drawBufferDressingMonitorDynamicImpl(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    const scrX = -28.2;
    const scrY = -4.3;
    const scrW = 56.4;
    const scrH = 11.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 1. 屏幕扫描光束 (柔和循环扫过蓝屏)
    const sweepT = (time * 0.42) % 1;
    const sweepX = scrX + 1.0 + sweepT * (scrW - 5.0);
    const sweepGrad = ctx.createLinearGradient(sweepX, 0, sweepX + 4.0, 0);
    sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    sweepGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.22)');
    sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(sweepX, scrY + 0.5, 4.0, scrH - 1.0);

    // 2. 三栏实时动态指示条 (PRESS / TEMP / O2)
    const barY = scrY + 8.05;
    const barH = 1.5;
    const bars = [
        { x: scrX + 1.75, maxW: 16.8, ratio: 0.68 + 0.16 * Math.sin(time * 2.1) },
        { x: scrX + 22.15, maxW: 14.9, ratio: 0.58 + 0.14 * Math.sin(time * 1.6 + 1.2) },
        { x: scrX + 40.75, maxW: 13.7, ratio: 0.78 + 0.10 * Math.sin(time * 2.6 + 2.4) }
    ];
    bars.forEach(b => {
        const fillW = Math.max(2.0, b.maxW * b.ratio);
        const barGrad = ctx.createLinearGradient(b.x, 0, b.x + fillW, 0);
        barGrad.addColorStop(0, '#0284c7');
        barGrad.addColorStop(0.75, '#38bdf8');
        barGrad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = barGrad;
        ctx.fillRect(b.x, barY, fillW, barH);
        // 高亮前端游标线
        ctx.fillStyle = '#f0f9ff';
        ctx.fillRect(b.x + fillW - 0.8, barY - 0.15, 0.8, barH + 0.3);
    });

    // 3. 右上角闪烁蓝屏在线指示灯 + 左上呼吸脉冲点
    const blink = Math.sin(time * 3.8) > 0;
    ctx.fillStyle = blink ? '#38bdf8' : '#0c4a6e';
    ctx.fillRect(22.4, -3.6, 4.0, 1.8);
    if (blink) {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(23.1, -3.2, 2.6, 1.0);
    }
    const pulseAlpha = 0.45 + 0.55 * (Math.sin(time * 3.0) * 0.5 + 0.5);
    ctx.fillStyle = `rgba(56, 189, 248, ${pulseAlpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(scrX + 17.4, scrY + 2.2, 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function getBufferDressingMonitor(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 64.4, 18.2, true,
        'buffer_dressing_monitor',
        'BUFFER ENV TELEMETRY MONITOR',
        'BUFFER PRESSURE & TEMP MONITOR',
        drawBufferDressingMonitorStatic,
        drawBufferDressingMonitorDynamic,
        '__bufMonitorCacheV2'
    );
}

// -------------------------------------------------------------------------
// 3. 更衣区：双联防污染洗手池 (57.4 x 20.3 = 82x29 ×0.7，靠南墙朝北面向通道)
// -------------------------------------------------------------------------
function drawBufferDressingSinkStatic(ctx, cx, cy, angle) {
    const W = 57.4;
    const H = 20.3;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 地面投影 + 拉丝不锈钢主台面
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.4, -halfH - 1.2, W + 2.8, H + 2.0);

    const deckGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    deckGrad.addColorStop(0, '#5a7882');
    deckGrad.addColorStop(0.5, '#688a96');
    deckGrad.addColorStop(1, '#394f57');
    ctx.fillStyle = deckGrad;
    ctx.fillRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW, -halfH, W, H);

    // 南侧加厚后挡板 (+y 靠南墙) + 前沿木塑防撞条 (-y 朝通道)
    ctx.fillStyle = '#25363c';
    ctx.fillRect(-halfW + 0.8, halfH - 4.2, W - 1.6, 3.6);
    ctx.fillStyle = '#694b31';
    ctx.fillRect(-halfW + 1.0, -halfH + 0.4, W - 2.0, 2.0);

    // 双洁净洗池盆腔 + 排水口 + 朝北探出鹅颈水龙头
    [-11.5, 11.5].forEach(bx => {
        const bw = 18.0;
        const bh = 12.2;
        const by = -halfH + 3.4;

        ctx.fillStyle = '#102722';
        ctx.fillRect(bx - bw / 2, by, bw, bh);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.75;
        ctx.strokeRect(bx - bw / 2, by, bw, bh);

        // 排水孔圆环 (>=4px)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(bx, by + bh * 0.56, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.55;
        ctx.stroke();

        // 鹅颈水龙头 (由南侧后挡板朝北探出)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, halfH - 2.2);
        ctx.lineTo(bx, by + 4.4);
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bx - 1.8, by + 3.2, 3.6, 2.2);
    });

    // 左侧点睛：琥珀皂液器 (4.2 x 9.0)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW + 1.8, -halfH + 5.0, 4.2, 8.8);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 1.8, -halfH + 5.0, 4.2, 8.8);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDressingSinkDynamic(ctx, cx, cy, angle) {
    __dynDrawCached(ctx, 'drawBufferDressingSinkDynamic', 200, 160, cx, cy, (octx) => drawBufferDressingSinkDynamicImpl(octx, cx, cy, angle));
}
function drawBufferDressingSinkDynamicImpl(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const fBaseY = 10.15 - 2.2;
    [-11.5, 11.5].forEach((bx, idx) => {
        const active = Math.sin(time * 2.6 + idx * 1.4) > -0.3;
        ctx.fillStyle = active ? '#34d399' : '#064e3b';
        ctx.fillRect(bx - 5.2, fBaseY - 1.0, 2.4, 1.8);
    });
    ctx.restore();
}

function getBufferDressingSink(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 57.4, 20.3, false,
        'buffer_dressing_sink',
        'BUFFER DECON WASH BASIN',
        'DUAL DECON WASH SINK',
        drawBufferDressingSinkStatic,
        drawBufferDressingSinkDynamic,
        '__bufSinkCache'
    );
}

// -------------------------------------------------------------------------
// 4. 更衣区：壁挂一体式正压防护服 ×4 + 供氧软管 (86.8 x 21.7 = 124x31 ×0.7)
// -------------------------------------------------------------------------
function drawBufferDressingSuitRackStatic(ctx, cx, cy, angle) {
    const W = 86.8;
    const H = 21.7;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 投影与不锈钢防潮托盘
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.4, -halfH - 1.0, W + 2.8, H + 1.8);

    const trayGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    trayGrad.addColorStop(0, '#273f38');
    trayGrad.addColorStop(1, '#182823');
    ctx.fillStyle = trayGrad;
    ctx.fillRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW, -halfH, W, H);

    // 墙面主供氧总管 (+y 靠南墙) + 1 个点睛琥珀截止阀
    const pipeY = halfH - 2.6;
    ctx.fillStyle = '#536e77';
    ctx.fillRect(-halfW + 1.5, pipeY - 1.6, W - 3.0, 3.2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 1.5, pipeY - 1.6, W - 3.0, 3.2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW + 2.6, pipeY - 2.2, 4.4, 2.2);

    // 4 套正压防护服 (留足间隔，每套 3~4 个大块清晰零件 >=4px)
    const suitPositions = [-30.6, -10.2, 10.2, 30.6];
    suitPositions.forEach(sx => {
        // 1) 一体式防护服肩胸+袖轮廓
        const suitGrad = ctx.createLinearGradient(sx - 7, -6, sx + 7, 4);
        suitGrad.addColorStop(0, '#628374');
        suitGrad.addColorStop(1, '#395246');
        ctx.fillStyle = suitGrad;
        ctx.beginPath();
        ctx.moveTo(sx - 7.8, 4.6);
        ctx.lineTo(sx - 8.2, -3.6);
        ctx.lineTo(sx - 5.2, -6.8);
        ctx.lineTo(sx + 5.2, -6.8);
        ctx.lineTo(sx + 8.2, -3.6);
        ctx.lineTo(sx + 7.8, 4.6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // 2) 充气头罩 + 朝北(-y)深色全景面罩
        ctx.fillStyle = '#587869';
        ctx.beginPath();
        ctx.ellipse(sx, 0.2, 4.8, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.65;
        ctx.stroke();

        ctx.fillStyle = '#07221b';
        ctx.beginPath();
        ctx.ellipse(sx, -2.0, 3.6, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.65;
        ctx.stroke();

        // 3) 墙面垂下供氧软管 (统一弧线，无碎虚线)
        const tapX = sx + 5.2;
        const portX = sx + 2.8;
        const portY = -3.8;
        ctx.strokeStyle = '#1f2f35';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tapX, pipeY);
        ctx.bezierCurveTo(tapX + 3.2, pipeY - 5.5, portX + 4.4, portY - 3.2, portX, portY);
        ctx.stroke();
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(tapX, pipeY);
        ctx.bezierCurveTo(tapX + 3.2, pipeY - 5.5, portX + 4.4, portY - 3.2, portX, portY);
        ctx.stroke();
    });

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDressingSuitRackDynamic(ctx, cx, cy, angle) {
    __dynDrawCached(ctx, 'drawBufferDressingSuitRackDynamic', 200, 160, cx, cy, (octx) => drawBufferDressingSuitRackDynamicImpl(octx, cx, cy, angle));
}
function drawBufferDressingSuitRackDynamicImpl(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const suitPositions = [-30.6, -10.2, 10.2, 30.6];
    suitPositions.forEach((sx, idx) => {
        const pulse = Math.sin(time * 2.0 + idx * 1.3) > 0;
        ctx.fillStyle = (idx === 3) ? (pulse ? '#f59e0b' : '#78350f') : (pulse ? '#34d399' : '#064e3b');
        ctx.beginPath();
        ctx.arc(sx + 2.8, -3.8, 1.3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function getBufferDressingSuitRack(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 86.8, 21.7, false,
        'buffer_dressing_suit_rack',
        'POSITIVE PRESSURE SUIT RACK',
        'POSITIVE-PRESSURE SUIT & O2 RACK',
        drawBufferDressingSuitRackStatic,
        drawBufferDressingSuitRackDynamic,
        '__bufSuitRackCache'
    );
}

// =========================================================================
// Level 8 缓冲区 · 消毒区精密道具绘制系统 (等比 ×0.7 缩放，减细节保清晰)
// 全区总量对标三联工作站 (~140图元, ~60色)；红绿指示灯直接读取通道状态字段
// =========================================================================

// 状态驱动的三态指示灯 (没轮到/暂停=琥珀 #f59e0b，喷洒中=红 #ef4444，已完成=绿 #10b981)
function drawNozzleDualIndicatorLamps(ctx, bx, yRed, yGreen, isSpraying, isDone) {
    if (isSpraying) {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fca5a5';
    } else if (isDone) {
        ctx.fillStyle = '#3b0d0d';
        ctx.strokeStyle = '#1f2937';
    } else {
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fde68a';
    }
    ctx.beginPath();
    ctx.arc(bx, yRed, 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = isDone ? '#10b981' : (isSpraying ? '#052e22' : '#0b4a35');
    ctx.beginPath();
    ctx.arc(bx, yGreen, 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isDone ? '#6ee7b7' : '#1f2937';
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

// -------------------------------------------------------------------------
// 5. 消毒区：地面格栅与废液收集槽 (67.2 x 46.2 = 96x66 ×0.7)
// -------------------------------------------------------------------------
function drawBufferDeconGratingStatic(ctx, cx, cy, angle) {
    const W = 67.2;
    const H = 46.2;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 沉坑投影与集液槽底盘
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.2, -halfH - 1.2, W + 2.4, H + 2.4);

    ctx.fillStyle = '#061a14';
    ctx.fillRect(-halfW + 1.5, -halfH + 1.5, W - 3.0, H - 3.0);

    // 中央废液收集槽道 + 双多孔排污口 (直径 6.8px)
    ctx.fillStyle = '#0e2d25';
    ctx.fillRect(-halfW + 3.0, -6.5, W - 6.0, 13.0);
    ctx.strokeStyle = '#4f6d63';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-halfW + 3.0, -6.5, W - 6.0, 13.0);

    [-15, 15].forEach(dx => {
        ctx.fillStyle = '#475f66';
        ctx.beginPath();
        ctx.arc(dx, 0, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.fillStyle = '#040a08';
        ctx.beginPath();
        ctx.arc(dx, 0, 1.3, 0, Math.PI * 2);
        ctx.fill();
    });

    // 疏朗清晰的横向拉丝钢格栅条 (8条，留出暗底槽空隙，缩放下明晰不发糊)
    for (let gy = -halfH + 4.8; gy <= halfH - 4.8; gy += 5.2) {
        ctx.fillStyle = '#455e66';
        ctx.fillRect(-halfW + 2.5, gy - 0.9, W - 5.0, 1.8);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(-halfW + 2.6, gy - 0.8);
        ctx.lineTo(halfW - 2.6, gy - 0.8);
        ctx.stroke();
    }

    // 纵向工字梁 + 外框 + 单一点睛琥珀液位视窗
    [-17, 17].forEach(bx => {
        ctx.fillStyle = '#2d4047';
        ctx.fillRect(bx - 1.2, -halfH + 2.2, 2.4, H - 4.4);
    });

    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW, -halfH, W, H);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(halfW - 3.6, -6.0, 2.2, 12.0);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDeconGratingDynamic(ctx, cx, cy, angle, getCorridor) {
    __dynDrawCached(ctx, 'drawBufferDeconGratingDynamic', 480, 200, cx, cy, (octx) => drawBufferDeconGratingDynamicImpl(octx, cx, cy, angle, getCorridor));
}
function drawBufferDeconGratingDynamicImpl(ctx, cx, cy, angle, getCorridor) {
    const corridor = typeof getCorridor === 'function' ? getCorridor() : getCorridor;
    const isAir = !!(corridor && corridor.airSpraying);
    const isLiq = !!(corridor && corridor.liquidSpraying);
    const isActive = isAir || isLiq;
    const duration = (corridor && corridor.sprayDuration) ? corridor.sprayDuration : 180;
    const activeRatio = corridor
        ? (isLiq
            ? Math.min(1, (corridor.liquidProgress || 0) / duration)
            : (isAir ? Math.min(1, (corridor.airProgress || 0) / duration) : Math.max(0, Math.min(1, ((corridor.airProgress || 0) + (corridor.liquidProgress || 0)) / (duration * 2)))))
        : 0;
    const time = Date.now() * 0.001;
    const halfW = 33.6;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 1. 右侧液位视窗动态液柱条 (联动喷淋进度与实时波动)
    const gx = halfW - 3.6;
    const gy = -6.0;
    const gw = 2.2;
    const gh = 12.0;
    ctx.fillStyle = '#082f49';
    ctx.fillRect(gx, gy, gw, gh);
    const levelRatio = isLiq
        ? (0.35 + 0.55 * activeRatio + 0.08 * Math.sin(time * 7.0))
        : (isAir ? (0.30 + 0.45 * activeRatio + 0.08 * Math.sin(time * 5.0)) : (0.28 + 0.12 * Math.sin(time * 1.8)));
    const clampedLevel = Math.max(0.15, Math.min(0.96, levelRatio));
    const fillH = Math.max(2.0, (gh - 0.8) * clampedLevel);
    const fillY = gy + gh - 0.4 - fillH;
    ctx.fillStyle = isLiq ? '#22d3ee' : (isAir ? '#bae6fd' : '#f59e0b');
    ctx.fillRect(gx + 0.35, fillY, gw - 0.7, fillH);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(gx + 0.25, fillY, gw - 0.5, 0.9);
    ctx.strokeStyle = isActive ? '#38bdf8' : '#0ea5e9';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(gx, gy, gw, gh);

    // 2. 格栅左框角双遥测脉冲指示灯
    [-19.5, 19.5].forEach((ly, idx) => {
        const pulse = Math.sin(time * (isActive ? 7.0 : 2.6) + idx * Math.PI) > 0;
        ctx.fillStyle = isActive
            ? (pulse ? (isLiq ? '#22d3ee' : '#e0f2fe') : '#075985')
            : (pulse ? '#34d399' : '#064e3b');
        ctx.beginPath();
        ctx.arc(-halfW + 1.8, ly, 0.9, 0, Math.PI * 2);
        ctx.fill();
    });

    // 3. 喷淋/气流激活时，双排污口动态排水波纹与液体积水反光
    if (isLiq) {
        ctx.fillStyle = `rgba(34, 211, 238, ${(0.18 + 0.08 * Math.sin(time * 4.5)).toFixed(2)})`;
        ctx.fillRect(-halfW + 3.5, -6.0, (halfW - 4.0) * 2, 12.0);
    }
    if (isActive) {
        [-15, 15].forEach((dx, idx) => {
            for (let rIdx = 0; rIdx < 2; rIdx++) {
                const wave = (time * (isLiq ? 1.5 : 2.2) + idx * 0.35 + rIdx * 0.5) % 1;
                const r = 3.2 + wave * (isLiq ? 6.5 : 4.6);
                const alpha = (1 - wave) * (isLiq ? 0.75 : 0.45);
                ctx.strokeStyle = isLiq
                    ? `rgba(34, 211, 238, ${alpha.toFixed(2)})`
                    : `rgba(224, 242, 254, ${alpha.toFixed(2)})`;
                ctx.lineWidth = isLiq ? 0.85 : 0.55;
                ctx.beginPath();
                ctx.arc(dx, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }

    ctx.restore();
}

function getBufferDeconGrating(cx, cy, angle, getCorridor) {
    return buildCorridorPropBox(
        cx, cy, angle, 67.2, 46.2, true,
        'buffer_decon_grating',
        'DECON FLOOR GRATING & WASTE SUMP',
        'DECON DRAINAGE GRATING & SUMP',
        drawBufferDeconGratingStatic,
        (ctx, x, y, a) => drawBufferDeconGratingDynamic(ctx, x, y, a, getCorridor),
        '__bufDeconGratingCache'
    );
}

// -------------------------------------------------------------------------
// 6. 消毒区：高压气流喷嘴组 (64.4 x 18.2 = 92x26 ×0.7，每侧 4 枚大间距喷嘴)
// -------------------------------------------------------------------------
const BUFFER_DECON_AIR_NOZZLE_XS = [-21.0, -7.0, 7.0, 21.0];

function drawBufferDeconAirNozzlesStatic(ctx, cx, cy, angle, isNorth) {
    const W = 64.4;
    const H = 18.2;
    const halfW = W / 2;
    const halfH = H / 2;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 地面与墙体投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.2, -halfH + (isNorth ? 0.5 : -1.5), W + 2.4, H + 1.0);

    // 墙面安装底座与高压不锈钢供气总管
    const baseH = 7.6;
    const baseRectY = isNorth ? wallY : (wallY - baseH);
    ctx.fillStyle = '#243832';
    ctx.fillRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);

    const pipeY = wallY + dir * 3.8;
    ctx.fillStyle = '#47616b';
    ctx.fillRect(-halfW + 2.5, pipeY - 1.7, W - 5.0, 3.4);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 2.5, pipeY - 1.7, W - 5.0, 3.4);

    // 点睛：左端琥珀截断阀块
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW + 2.2, pipeY - 1.5, 4.0, 3.0);

    // 4 枚清晰大间距高压气流喷嘴 (每枚 3~4 个大块零件 >=4px)
    BUFFER_DECON_AIR_NOZZLE_XS.forEach(nx => {
        // 1) 主阀管体 + 铜螺母融合块
        const tubeY0 = wallY + dir * 5.2;
        const tubeY1 = wallY + dir * 11.4;
        const tTop = Math.min(tubeY0, tubeY1);
        const tH = Math.abs(tubeY1 - tubeY0);
        ctx.fillStyle = '#4d6770';
        ctx.fillRect(nx - 2.4, tTop, 4.8, tH);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(nx - 2.4, tTop, 4.8, tH);

        const nutY = wallY + dir * 10.6;
        ctx.fillStyle = '#8b683e';
        ctx.fillRect(nx - 3.2, nutY - 1.3, 6.4, 2.6);

        // 2) 高压气流锥形喷嘴头
        const coneY0 = wallY + dir * 12.2;
        const coneY1 = wallY + dir * 17.2;
        ctx.fillStyle = '#5a7680';
        ctx.beginPath();
        ctx.moveTo(nx - 2.8, coneY0);
        ctx.lineTo(nx + 2.8, coneY0);
        ctx.lineTo(nx + 1.8, coneY1);
        ctx.lineTo(nx - 1.8, coneY1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // 3) 独立红绿灯座底框 (4.0 x 6.0)
        const ledX = nx + 4.4;
        const ledMidY = wallY + dir * 9.2;
        ctx.fillStyle = '#07120f';
        ctx.fillRect(ledX - 2.0, ledMidY - 3.0, 4.0, 6.0);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(ledX - 2.0, ledMidY - 3.0, 4.0, 6.0);
    });

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDeconAirNozzlesDynamic(ctx, cx, cy, angle, isNorth, getCorridor) {
    __dynDrawCached(ctx, 'drawBufferDeconAirNozzlesDynamic', 480, 200, cx, cy, (octx) => drawBufferDeconAirNozzlesDynamicImpl(octx, cx, cy, angle, isNorth, getCorridor));
}
function drawBufferDeconAirNozzlesDynamicImpl(ctx, cx, cy, angle, isNorth, getCorridor) {
    const corridor = typeof getCorridor === 'function' ? getCorridor() : getCorridor;
    const duration = (corridor && corridor.sprayDuration) ? corridor.sprayDuration : 180;
    const progress = corridor ? (corridor.airProgress || 0) : 0;
    const progressRatio = Math.max(0, Math.min(1, progress / duration));
    const isSpraying = !!(corridor && corridor.airSpraying);
    const isDone = !!(corridor && (corridor.airStatus === 'done' || progress >= duration));
    const time = Date.now() * 0.001;

    const W = 64.4;
    const halfW = W / 2;
    const halfH = 9.1;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;
    const pipeY = wallY + dir * 3.8;

    // 尺寸按通道几何推导：从喷嘴末端 (wallY + dir * 17.2) 到通道中线 (wallY + dir * corridor.width * 0.5)
    const corridorHalfW = ((corridor && corridor.width) ? corridor.width : 91.5) * 0.5;
    const tipOffset = 17.2;
    const centerReach = Math.max(18, corridorHalfW - tipOffset);
    const jetReach = centerReach + 4.0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 1. 左端截断阀块动态脉冲指示灯 (待机琥珀 / 吹扫高亮青白 / 完成绿)
    const valvePulse = isSpraying
        ? (Math.sin(time * 9.0) > 0)
        : (Math.sin(time * 2.4) > 0);
    ctx.fillStyle = isSpraying
        ? (valvePulse ? '#e0f2fe' : '#38bdf8')
        : (isDone ? '#10b981' : (valvePulse ? '#fbbf24' : '#b45309'));
    ctx.fillRect(-halfW + 3.0, pipeY - 0.75, 2.4, 1.5);

    // 2. 供气总管上的分段计时进度反馈条 (仅在有进度/喷洒中/已完成时叠加，不改静态底座)
    if (isSpraying || progress > 0) {
        const trackX = -halfW + 7.2;
        const trackW = W - 10.2;
        const trackY = pipeY - 1.3;
        const trackH = 2.6;
        ctx.fillStyle = 'rgba(2, 12, 22, 0.85)';
        ctx.fillRect(trackX, trackY, trackW, trackH);
        const fillW = Math.max(1.2, trackW * progressRatio);
        if (isDone) {
            ctx.fillStyle = '#10b981';
        } else if (isSpraying) {
            const pGrad = ctx.createLinearGradient(trackX, 0, trackX + fillW, 0);
            pGrad.addColorStop(0, '#0284c7');
            pGrad.addColorStop(0.75, '#7dd3fc');
            pGrad.addColorStop(1, '#f0f9ff');
            ctx.fillStyle = pGrad;
        } else {
            ctx.fillStyle = '#f59e0b';
        }
        ctx.fillRect(trackX + 0.4, trackY + 0.4, Math.max(0, fillW - 0.8), trackH - 0.8);
        if (isSpraying && progressRatio < 1) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(trackX + fillW - 1.0, trackY + 0.2, 1.2, trackH - 0.4);
        }
        // 3 秒刻度线
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(trackX + trackW / 3 - 0.3, trackY + 0.3, 0.6, trackH - 0.6);
        ctx.fillRect(trackX + (trackW * 2) / 3 - 0.3, trackY + 0.3, 0.6, trackH - 0.6);
        ctx.strokeStyle = isDone ? '#6ee7b7' : (isSpraying ? '#7dd3fc' : '#fbbf24');
        ctx.lineWidth = 0.45;
        ctx.strokeRect(trackX, trackY, trackW, trackH);
    }

    // 3. 喷头指示灯 + 气喷流动态粒子层 (快而淡，向通道中线高压喷射)
    BUFFER_DECON_AIR_NOZZLE_XS.forEach((nx, idx) => {
        const ledX = nx + 4.4;
        const yRed = wallY + dir * 7.8;
        const yGreen = wallY + dir * 10.6;
        drawNozzleDualIndicatorLamps(ctx, ledX, yRed, yGreen, isSpraying, isDone);

        if (isSpraying) {
            const tipY = wallY + dir * tipOffset;
            const endY = tipY + dir * jetReach;

            // A) 淡白青高速气流扩散锥
            const coneGrad = ctx.createLinearGradient(nx, tipY, nx, endY);
            coneGrad.addColorStop(0, 'rgba(224, 242, 254, 0.30)');
            coneGrad.addColorStop(0.55, 'rgba(186, 230, 253, 0.14)');
            coneGrad.addColorStop(1, 'rgba(186, 230, 253, 0.0)');
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(nx - 1.8, tipY);
            ctx.lineTo(nx + 1.8, tipY);
            ctx.lineTo(nx + 6.8, endY);
            ctx.lineTo(nx - 6.8, endY);
            ctx.closePath();
            ctx.fill();

            // B) 高速锐利气流线 (8 条/喷头，高速冲向通道中线)
            for (let k = 0; k < 8; k++) {
                const p = (time * 6.2 + idx * 0.27 + k * 0.125) % 1;
                const latSeed = (k - 3.5) / 3.5;
                const x0 = nx + latSeed * (1.4 + p * 3.4);
                const x1 = nx + latSeed * (1.6 + Math.min(1, p + 0.22) * 4.4);
                const sLen = 5.0 + (k % 3) * 2.2;
                const yStart = tipY + dir * (p * (jetReach - 2.0));
                const yEnd = yStart + dir * sLen;
                const alpha = Math.max(0.08, (1 - p) * 0.72);
                ctx.strokeStyle = (k % 2 === 0)
                    ? `rgba(240, 249, 255, ${alpha.toFixed(2)})`
                    : `rgba(186, 230, 253, ${(alpha * 0.85).toFixed(2)})`;
                ctx.lineWidth = (k % 3 === 0) ? 1.15 : 0.8;
                ctx.beginPath();
                ctx.moveTo(x0, yStart);
                ctx.lineTo(x1, yEnd);
                ctx.stroke();
            }

            // C) 淡白气旋微粒 (7 粒/喷头，中线附近微微散开)
            for (let m = 0; m < 7; m++) {
                const mp = (time * 5.0 + idx * 0.31 + m * 0.143) % 1;
                const jitter = Math.sin(time * 14.0 + m * 2.1 + idx) * 1.6;
                const px = nx + ((m - 3) / 3) * (1.5 + mp * 4.2) + jitter * mp;
                const py = tipY + dir * (mp * jetReach);
                const mAlpha = Math.max(0.05, (1 - mp * 0.85) * 0.52);
                ctx.fillStyle = `rgba(240, 249, 255, ${mAlpha.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(px, py, 0.8 + mp * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    ctx.restore();
}

function getBufferDeconAirNozzles(cx, cy, angle, isNorth, getCorridor) {
    const sideTag = isNorth ? 'N' : 'S';
    return buildCorridorPropBox(
        cx, cy, angle, 64.4, 18.2, false,
        `buffer_decon_air_${sideTag.toLowerCase()}`,
        `HIGH-PRESSURE AIR NOZZLES (${sideTag})`,
        `AIR-JET DECON NOZZLE BANK (${sideTag})`,
        (ctx, x, y, a) => drawBufferDeconAirNozzlesStatic(ctx, x, y, a, isNorth),
        (ctx, x, y, a) => drawBufferDeconAirNozzlesDynamic(ctx, x, y, a, isNorth, getCorridor),
        `__bufDeconAir${sideTag}Cache`
    );
}

// -------------------------------------------------------------------------
// 7. 消毒区：消毒液雾化喷头组 (68.6 x 18.2 = 98x26 ×0.7，每侧 4 枚宽幅雾化喷头)
// -------------------------------------------------------------------------
const BUFFER_DECON_LIQ_NOZZLE_XS = [-22.5, -7.5, 7.5, 22.5];

function drawBufferDeconLiquidNozzlesStatic(ctx, cx, cy, angle, isNorth) {
    const W = 68.6;
    const H = 18.2;
    const halfW = W / 2;
    const halfH = H / 2;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 地面与墙体投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.2, -halfH + (isNorth ? 0.5 : -1.5), W + 2.4, H + 1.0);

    // 防腐底座板 + 双色供液管(钢+铜)区分于气流组
    const baseH = 8.0;
    const baseRectY = isNorth ? wallY : (wallY - baseH);
    ctx.fillStyle = '#253a3d';
    ctx.fillRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);

    const mainPipeY = wallY + dir * 2.8;
    ctx.fillStyle = '#4e6972';
    ctx.fillRect(-halfW + 2.5, mainPipeY - 1.4, W - 5.0, 2.8);

    const secPipeY = wallY + dir * 5.6;
    ctx.fillStyle = '#7c5b36';
    ctx.fillRect(-halfW + 3.5, secPipeY - 1.0, W - 7.0, 2.0);

    // 点睛：左侧琥珀药液视窗
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW + 1.8, wallY + dir * 4.0 - 2.2, 4.0, 4.4);

    // 4 枚宽幅喇叭雾化喷头 (每枚 3~4 个大块零件 >=4px)
    BUFFER_DECON_LIQ_NOZZLE_XS.forEach(nx => {
        // 1) 电磁阀方体
        const solY = wallY + dir * 8.2;
        ctx.fillStyle = '#33484f';
        ctx.fillRect(nx - 3.2, solY - 2.2, 6.4, 4.4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(nx - 3.2, solY - 2.2, 6.4, 4.4);

        // 2) 铜质锁紧大螺母
        const nutY = wallY + dir * 11.4;
        ctx.fillStyle = '#9c754d';
        ctx.fillRect(nx - 3.4, nutY - 1.3, 6.8, 2.6);

        // 3) 宽幅喇叭形雾化喷嘴钟罩
        const coneY0 = wallY + dir * 12.6;
        const coneY1 = wallY + dir * 17.4;
        ctx.fillStyle = '#5f7d87';
        ctx.beginPath();
        ctx.moveTo(nx - 2.4, coneY0);
        ctx.lineTo(nx + 2.4, coneY0);
        ctx.lineTo(nx + 4.2, coneY1);
        ctx.lineTo(nx - 4.2, coneY1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 4) 红绿指示灯座框 (4.0 x 6.0)
        const ledX = nx + 4.8;
        const ledMidY = wallY + dir * 9.2;
        ctx.fillStyle = '#07120f';
        ctx.fillRect(ledX - 2.0, ledMidY - 3.0, 4.0, 6.0);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(ledX - 2.0, ledMidY - 3.0, 4.0, 6.0);
    });

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawBufferDeconLiquidNozzlesDynamic(ctx, cx, cy, angle, isNorth, getCorridor) {
    __dynDrawCached(ctx, 'drawBufferDeconLiquidNozzlesDynamic', 480, 200, cx, cy, (octx) => drawBufferDeconLiquidNozzlesDynamicImpl(octx, cx, cy, angle, isNorth, getCorridor));
}
function drawBufferDeconLiquidNozzlesDynamicImpl(ctx, cx, cy, angle, isNorth, getCorridor) {
    const corridor = typeof getCorridor === 'function' ? getCorridor() : getCorridor;
    const duration = (corridor && corridor.sprayDuration) ? corridor.sprayDuration : 180;
    const progress = corridor ? (corridor.liquidProgress || 0) : 0;
    const progressRatio = Math.max(0, Math.min(1, progress / duration));
    const isSpraying = !!(corridor && corridor.liquidSpraying);
    const isDone = !!(corridor && (corridor.liquidStatus === 'done' || progress >= duration));
    const time = Date.now() * 0.001;

    const W = 68.6;
    const halfW = W / 2;
    const halfH = 9.1;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;
    const mainPipeY = wallY + dir * 2.8;

    // 尺寸按通道几何推导：从喷嘴末端 (wallY + dir * 17.4) 到通道中线格栅区 (wallY + dir * corridor.width * 0.5)
    const corridorHalfW = ((corridor && corridor.width) ? corridor.width : 91.5) * 0.5;
    const tipOffset = 17.4;
    const centerReach = Math.max(18, corridorHalfW - tipOffset);
    const mistReach = centerReach + 3.0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 1. 左侧药液视窗动态液位条
    const winX = -halfW + 1.8;
    const winY = wallY + dir * 4.0 - 2.2;
    const winW = 4.0;
    const winH = 4.4;
    ctx.fillStyle = '#082f49';
    ctx.fillRect(winX, winY, winW, winH);
    const liqRatio = isSpraying
        ? (0.45 + 0.45 * Math.sin(time * 7.5))
        : (isDone ? 0.85 : (0.55 + 0.20 * Math.sin(time * 2.0)));
    const liqH = Math.max(1.0, (winH - 0.6) * liqRatio);
    ctx.fillStyle = isSpraying ? '#22d3ee' : (isDone ? '#10b981' : '#f59e0b');
    ctx.fillRect(winX + 0.4, winY + winH - 0.3 - liqH, winW - 0.8, liqH);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(winX + 0.3, winY + winH - 0.3 - liqH, winW - 0.6, 0.7);
    ctx.strokeStyle = isSpraying ? '#22d3ee' : '#64748b';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(winX, winY, winW, winH);

    // 2. 供液总管分段计时进度反馈条 (仅在有进度/喷洒中/已完成时叠加，不改静态底座)
    if (isSpraying || progress > 0) {
        const trackX = -halfW + 7.2;
        const trackW = W - 10.2;
        const trackY = mainPipeY - 1.3;
        const trackH = 2.6;
        ctx.fillStyle = 'rgba(2, 16, 18, 0.88)';
        ctx.fillRect(trackX, trackY, trackW, trackH);
        const fillW = Math.max(1.2, trackW * progressRatio);
        if (isDone) {
            ctx.fillStyle = '#10b981';
        } else if (isSpraying) {
            const pGrad = ctx.createLinearGradient(trackX, 0, trackX + fillW, 0);
            pGrad.addColorStop(0, '#059669');
            pGrad.addColorStop(0.65, '#22d3ee');
            pGrad.addColorStop(1, '#cffafe');
            ctx.fillStyle = pGrad;
        } else {
            ctx.fillStyle = '#f59e0b';
        }
        ctx.fillRect(trackX + 0.4, trackY + 0.4, Math.max(0, fillW - 0.8), trackH - 0.8);
        if (isSpraying && progressRatio < 1) {
            ctx.fillStyle = '#ecfeff';
            ctx.fillRect(trackX + fillW - 1.0, trackY + 0.2, 1.2, trackH - 0.4);
        }
        // 3 秒刻度线
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(trackX + trackW / 3 - 0.3, trackY + 0.3, 0.6, trackH - 0.6);
        ctx.fillRect(trackX + (trackW * 2) / 3 - 0.3, trackY + 0.3, 0.6, trackH - 0.6);
        ctx.strokeStyle = isDone ? '#6ee7b7' : (isSpraying ? '#22d3ee' : '#fbbf24');
        ctx.lineWidth = 0.45;
        ctx.strokeRect(trackX, trackY, trackW, trackH);
    }

    // 3. 喷头指示灯 + 消毒液雾化喷流与落地溅射 (慢、带色、粒密清晰)
    BUFFER_DECON_LIQ_NOZZLE_XS.forEach((nx, idx) => {
        const ledX = nx + 4.8;
        const yRed = wallY + dir * 7.8;
        const yGreen = wallY + dir * 10.6;
        drawNozzleDualIndicatorLamps(ctx, ledX, yRed, yGreen, isSpraying, isDone);

        if (isSpraying) {
            const tipY = wallY + dir * tipOffset;
            const impY = tipY + dir * (centerReach - 1.0);
            const endY = tipY + dir * mistReach;

            // A) 浓郁带色翡翠青雾锥
            const mistGrad = ctx.createLinearGradient(nx, tipY, nx, endY);
            mistGrad.addColorStop(0, 'rgba(16, 185, 129, 0.34)');
            mistGrad.addColorStop(0.55, 'rgba(34, 211, 238, 0.44)');
            mistGrad.addColorStop(1, 'rgba(56, 189, 248, 0.14)');
            ctx.fillStyle = mistGrad;
            ctx.beginPath();
            ctx.moveTo(nx - 3.6, tipY);
            ctx.lineTo(nx + 3.6, tipY);
            ctx.lineTo(nx + 8.4, endY);
            ctx.lineTo(nx - 8.4, endY);
            ctx.closePath();
            ctx.fill();

            // B) 较慢且密集的带色药液液滴 (10 粒/喷头，带高亮核，缩放下清晰)
            for (let k = 0; k < 10; k++) {
                const p = (time * 2.0 + idx * 0.21 + k * 0.1) % 1;
                const spreadSeed = (k - 4.5) / 4.5;
                const dropReach = centerReach * (0.76 + (k % 3) * 0.13);
                const dx = nx + spreadSeed * (2.6 + p * 5.2) + Math.sin(time * 5.0 + k) * 0.6;
                const dy = tipY + dir * (p * dropReach);
                const alpha = Math.max(0.25, 1 - p * 0.45);
                const r = 1.25 + (k % 3) * 0.35;
                ctx.fillStyle = (k % 2 === 0)
                    ? `rgba(34, 211, 238, ${alpha.toFixed(2)})`
                    : `rgba(52, 211, 153, ${alpha.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(dx, dy, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(207, 250, 254, ${(alpha * 0.85).toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(dx, dy, r * 0.42, 0, Math.PI * 2);
                ctx.fill();
            }

            // C) 落地积液光晕 + 扩散水花波纹 + 四散溅射微滴
            ctx.fillStyle = 'rgba(34, 211, 238, 0.22)';
            ctx.beginPath();
            ctx.ellipse(nx, impY, 6.2, 3.4, 0, 0, Math.PI * 2);
            ctx.fill();

            for (let rIdx = 0; rIdx < 2; rIdx++) {
                const rp = (time * 2.3 + idx * 0.28 + rIdx * 0.5) % 1;
                const rr = 1.6 + rp * 5.6;
                const rAlpha = (1 - rp) * 0.72;
                ctx.strokeStyle = (rIdx === 0)
                    ? `rgba(34, 211, 238, ${rAlpha.toFixed(2)})`
                    : `rgba(110, 231, 183, ${rAlpha.toFixed(2)})`;
                ctx.lineWidth = 0.85;
                ctx.beginPath();
                ctx.ellipse(nx, impY, rr, rr * 0.62, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            for (let sp = 0; sp < 6; sp++) {
                const spProg = (time * 2.9 + idx * 0.19 + sp * 0.167) % 1;
                const ang = (sp / 6) * Math.PI * 2 + idx * 0.7;
                const dist = 1.8 + spProg * 5.8;
                const sx = nx + Math.cos(ang) * dist;
                const sy = impY + Math.sin(ang) * dist * 0.65 - Math.sin(spProg * Math.PI) * 1.6;
                const sAlpha = (1 - spProg) * 0.85;
                ctx.fillStyle = (sp % 2 === 0)
                    ? `rgba(165, 243, 252, ${sAlpha.toFixed(2)})`
                    : `rgba(52, 211, 153, ${sAlpha.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.95 + (1 - spProg) * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    ctx.restore();
}

function getBufferDeconLiquidNozzles(cx, cy, angle, isNorth, getCorridor) {
    const sideTag = isNorth ? 'N' : 'S';
    return buildCorridorPropBox(
        cx, cy, angle, 68.6, 18.2, false,
        `buffer_decon_liquid_${sideTag.toLowerCase()}`,
        `DISINFECTANT LIQUID NOZZLES (${sideTag})`,
        `DISINFECTANT SPRAY NOZZLE BANK (${sideTag})`,
        (ctx, x, y, a) => drawBufferDeconLiquidNozzlesStatic(ctx, x, y, a, isNorth),
        (ctx, x, y, a) => drawBufferDeconLiquidNozzlesDynamic(ctx, x, y, a, isNorth, getCorridor),
        `__bufDeconLiq${sideTag}Cache`
    );
}

// =========================================================================
// Level 8 缓冲区 · 全新气密防爆门系统 (2026-11-15)
// 严格遵循 drawTripleCubicleWorkstation 锚点分层画法：
// - 实验室气闸 / 洁净气密门风格（对标更衣区：浅色复合面板 + 钢化玻璃观察窗 + 翡翠 #10b981 edge 光）
// - 保留机械转轮锁与掌纹/虹膜识别终端，改瘦改贴平，少铆钉少装甲片；线宽 0.4–1.0 为主（<=1.6）
// - 4倍超采样(SS=4)离屏精灵 + 实时读取 openProgress / wheelAngle / isLocked
// =========================================================================
function createCorridorDoorSprite(logicalW, logicalH, drawFn) {
    const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
    const off = document.createElement('canvas');
    off.width = Math.ceil(logicalW * SS);
    off.height = Math.ceil(logicalH * SS);
    const octx = off.getContext('2d');
    octx.save();
    octx.scale(SS, SS);
    octx.translate(logicalW / 2, logicalH / 2);
    drawFn(octx);
    octx.restore();
    return { canvas: off, w: logicalW, h: logicalH };
}

function drawBiometricTerminalStatic(ctx, sideSign) {
    // 贴平紧凑型实验室门侧生物识别终端 (位于北侧门垛肩部 px: ±[6.3..16.8], py: [-45.5..-21.5])
    const cx = sideSign * 11.55;
    const cy = -33.5;
    const bw = 10.5;
    const bh = 24.0;
    const x0 = cx - bw / 2;
    const y0 = cy - bh / 2;

    // 1. 贴平轻阴影
    ctx.fillStyle = 'rgba(2, 10, 18, 0.42)';
    ctx.fillRect(x0 + sideSign * 0.5 - 0.25, y0 + 0.5, bw + 0.5, bh + 0.5);

    // 2. 浅灰实验室复合面板外壳 (与门板同调：#94a3b8 / #e2e8f0 / #cbd5e1 + 细描边，贴平安装)
    const bodyGrad = ctx.createLinearGradient(x0, y0, x0 + bw, y0 + bh);
    bodyGrad.addColorStop(0, '#cbd5e1');
    bodyGrad.addColorStop(0.35, '#e2e8f0');
    bodyGrad.addColorStop(0.75, '#cbd5e1');
    bodyGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x0, y0, bw, bh);

    // 细描边与贴平高光倒角
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(x0, y0, bw, bh);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(x0 + 0.7, y0 + bh - 0.7);
    ctx.lineTo(x0 + 0.7, y0 + 0.7);
    ctx.lineTo(x0 + bw - 0.7, y0 + 0.7);
    ctx.stroke();

    // 顶部状态灯槽底座 (由 drawAirtightBlastDoor 动态填充 isLocked/openProgress 灯条)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 2.8, y0 + 1.0, 5.6, 1.9);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.4;
    ctx.strokeRect(cx - 2.8, y0 + 1.0, 5.6, 1.9);

    // 3. 主科技蓝屏 (与控制台屏幕同色系 #38bdf8 / #0369a1 / #020617)
    const scrX = x0 + 1.0;
    const scrY = y0 + 3.7;
    const scrW = bw - 2.0; // 8.5px
    const scrH = 17.6;     // 17.6px
    const scrGrad = ctx.createLinearGradient(scrX, scrY, scrX + scrW, scrY + scrH);
    scrGrad.addColorStop(0, '#020617');
    scrGrad.addColorStop(0.45, '#075985');
    scrGrad.addColorStop(0.7, '#0369a1');
    scrGrad.addColorStop(1, '#020617');
    ctx.fillStyle = scrGrad;
    ctx.fillRect(scrX, scrY, scrW, scrH);

    // 屏幕细边框 (#38bdf8)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(scrX, scrY, scrW, scrH);

    // 屏幕内部水平扫描底纹
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.lineWidth = 0.45;
    for (let sy = scrY + 1.6; sy < scrY + scrH - 1.0; sy += 2.2) {
        ctx.beginPath();
        ctx.moveTo(scrX + 0.5, sy);
        ctx.lineTo(scrX + scrW - 0.5, sy);
        ctx.stroke();
    }

    // 3A. 上区：虹膜识别准星环
    const irisY = scrY + 4.3;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(cx, irisY, 2.75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(cx, irisY, 1.65, -0.4, Math.PI * 1.35);
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(cx, irisY, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 虹膜准星十字微标
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 3.6, irisY); ctx.lineTo(cx - 2.3, irisY);
    ctx.moveTo(cx + 2.3, irisY); ctx.lineTo(cx + 3.6, irisY);
    ctx.stroke();

    // 分隔扫描线
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(scrX + 0.7, scrY + 8.4);
    ctx.lineTo(scrX + scrW - 0.7, scrY + 8.4);
    ctx.stroke();

    // 3B. 下区：掌纹扫描界面 + 高亮扫描激光线
    const palmTop = scrY + 9.4;
    ctx.fillStyle = 'rgba(14, 165, 233, 0.24)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    // 掌心主体
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cx - 2.3, palmTop + 2.7, 4.6, 4.1, 1.2) : ctx.rect(cx - 2.3, palmTop + 2.7, 4.6, 4.1);
    ctx.fill();
    ctx.stroke();
    // 4根清晰手指条 + 拇指
    ctx.fillStyle = '#7dd3fc';
    [-1.8, -0.6, 0.6, 1.8].forEach((fx, idx) => {
        const fh = (idx === 1 || idx === 2) ? 2.4 : 2.0;
        ctx.fillRect(cx + fx - 0.38, palmTop + (2.4 - fh), 0.76, fh);
    });
    ctx.fillRect(cx - 3.2, palmTop + 3.4, 0.85, 2.0);

    // 亮蓝白色横向激光扫描线
    const scanY = palmTop + 3.7;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(scrX + 0.5, scanY);
    ctx.lineTo(scrX + scrW - 0.5, scanY);
    ctx.stroke();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(scrX + 0.7, scanY);
    ctx.lineTo(scrX + scrW - 0.7, scanY);
    ctx.stroke();

    // 屏幕玻璃斜向高光反光
    ctx.fillStyle = 'rgba(224, 242, 254, 0.14)';
    ctx.beginPath();
    ctx.moveTo(scrX + 0.4, scrY + 0.4);
    ctx.lineTo(scrX + scrW * 0.65, scrY + 0.4);
    ctx.lineTo(scrX + 0.4, scrY + scrH * 0.45);
    ctx.closePath();
    ctx.fill();

    // 4. 底部齐平蓝色读卡指示槽
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 1.5, y0 + bh - 1.7, 3.0, 0.8);
}

function drawPneumaticManifoldBoxStatic(ctx, sideSign) {
    // 贴平型气密压差阀盒 (位于南侧门垛肩部 px: ±[6.5..12.7], py: [+29.5..+45.5])
    const cx = sideSign * 9.6;
    const cy = 37.5;
    const bw = 6.2;
    const bh = 16.0;
    const x0 = cx - bw / 2;
    const y0 = cy - bh / 2;

    ctx.fillStyle = 'rgba(2, 10, 8, 0.50)';
    ctx.fillRect(x0 + sideSign * 0.6 - 0.3, y0 + 0.7, bw + 0.6, bh + 0.6);

    const boxGrad = ctx.createLinearGradient(x0, y0, x0 + bw, y0 + bh);
    boxGrad.addColorStop(0, '#cbd5e1');
    boxGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = boxGrad;
    ctx.fillRect(x0, y0, bw, bh);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x0, y0, bw, bh);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(x0, y0, bw, bh);

    // 圆形微型压差表
    const gy = y0 + 5.2;
    ctx.fillStyle = '#062019';
    ctx.beginPath();
    ctx.arc(cx, gy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(cx, gy);
    ctx.lineTo(cx + 1.3, gy - 1.0);
    ctx.stroke();

    // 齐平应急泄压拨片
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x0 + 1.1, y0 + 10.0, bw - 2.2, 4.2);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 1.6, y0 + 11.4, 3.2, 1.4);
}

function drawDoorLeafHalf(ctx, isNorth) {
    // 实验室气闸半扇门体: 宽 13.5 (px: -6.75..+6.75), 高 31.5 (py: -15.75..+15.75)
    const W = 13.5;
    const H = 31.5;
    const halfW = W / 2;
    const halfH = H / 2;
    const seamSign = isNorth ? 1 : -1;

    // [零件1] 轻柔侧向投影
    ctx.fillStyle = 'rgba(2, 12, 9, 0.45)';
    ctx.fillRect(-halfW - 1.0, -halfH, W + 2.0, H);

    // [零件2] 浅色洁净实验室复合门板主体 (铝钛浅灰 + 翡翠 edge 光)
    const leafGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    leafGrad.addColorStop(0, '#94a3b8');
    leafGrad.addColorStop(0.28, '#e2e8f0');
    leafGrad.addColorStop(0.72, '#cbd5e1');
    leafGrad.addColorStop(1, '#7c909d');
    ctx.fillStyle = leafGrad;
    ctx.fillRect(-halfW, -halfH, W, H);

    // 深色打底描边 + 翡翠 edge 光亮边
    ctx.strokeStyle = '#061511';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-halfW, -halfH, W, H);

    // 门板表面极简高光倒角线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-halfW + 1.0, -halfH + 1.2);
    ctx.lineTo(-halfW + 1.0, halfH - 1.2);
    ctx.stroke();

    // [零件3] 纵向钢化玻璃观察窗 (深翡翠透视感 + 边缘亮光，显著区分于旧装甲门)
    const winW = 7.4;
    const winH = 14.5;
    const winY = isNorth ? -8.8 : -5.7;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-winW / 2 - 0.7, winY - 0.7, winW + 1.4, winH + 1.4);

    const glassGrad = ctx.createLinearGradient(-winW / 2, winY, winW / 2, winY + winH);
    glassGrad.addColorStop(0, '#04231b');
    glassGrad.addColorStop(0.45, '#0b4a38');
    glassGrad.addColorStop(1, '#041b14');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(-winW / 2, winY, winW, winH);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-winW / 2, winY, winW, winH);

    // 玻璃斜向高光反光条
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.50)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-winW / 2 + 1.2, winY + 3.5);
    ctx.lineTo(winW / 2 - 1.2, winY + 1.4);
    ctx.moveTo(-winW / 2 + 1.2, winY + 6.5);
    ctx.lineTo(winW / 2 - 2.0, winY + 4.8);
    ctx.stroke();

    // [零件4] 齐平不锈钢推拉传动滑轨条 (替代粗重斜肋装甲板)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-0.9, -halfH + 1.2, 1.8, H - 2.4);

    // [零件5] 合拢缝 EPDM 气密胶条 + 翡翠密封亮线
    const sealY = isNorth ? (halfH - 2.2) : (-halfH);
    ctx.fillStyle = '#0a1f18';
    ctx.fillRect(-halfW + 0.4, sealY, W - 0.8, 2.2);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(-halfW + 0.8, seamSign * (halfH - 1.1));
    ctx.lineTo(halfW - 0.8, seamSign * (halfH - 1.1));
    ctx.stroke();
}

function drawMechanicalWheelLockSprite(ctx) {
    // 实验室瘦身版精密机械转轮锁 (半径 R=10.2，清晰可读且不臃肿厚重)
    // 1. 轻阴影
    ctx.fillStyle = 'rgba(2, 12, 9, 0.55)';
    ctx.beginPath();
    ctx.arc(0.6, 0.8, 10.6, 0, Math.PI * 2);
    ctx.fill();

    // 2. 4 根纤细拉丝不锈钢辐条
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(2.6, -0.85, 6.8, 1.7);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(2.6, -0.85, 6.8, 1.7);
        ctx.restore();
    }

    // 3. 光滑外手轮环 (浅铝灰主体 + 翡翠 edge 高光环，去掉厚重 12 齿齿轮)
    ctx.beginPath();
    ctx.arc(0, 0, 10.2, 0, Math.PI * 2);
    ctx.arc(0, 0, 7.9, 0, Math.PI * 2, true);
    const rimGrad = ctx.createLinearGradient(-10, -10, 10, 10);
    rimGrad.addColorStop(0, '#e2e8f0');
    rimGrad.addColorStop(0.5, '#94a3b8');
    rimGrad.addColorStop(1, '#475569');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    ctx.strokeStyle = '#061511';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 10.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(0, 0, 10.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, 7.9, 0, Math.PI * 2);
    ctx.stroke();

    // 4. 0 号位琥珀转动标识块 + 4 处纤细握持凸点 (保证 wheelAngle 旋转一目了然)
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const bx = Math.cos(ang) * 9.1;
        const by = Math.sin(ang) * 9.1;
        ctx.fillStyle = (i === 0) ? '#f59e0b' : '#475569';
        ctx.beginPath();
        ctx.arc(bx, by, 1.05, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(4.8, -0.65, 2.8, 1.3);

    // 5. 中心洁净不锈钢轴毂 + 翡翠点缀环
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.75;
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, 1.25, 0, Math.PI * 2);
    ctx.fill();
}

function ensureAirtightBlastDoorSprites() {
    if (window.__airtightDoorSpritesV2) return window.__airtightDoorSpritesV2;

    // 1. 地面洁净不锈钢门槛轨道槽 (20 x 66，适配 91.5px 窄通道)
    const sillSprite = createCorridorDoorSprite(24, 70, (ctx) => {
        ctx.fillStyle = 'rgba(2, 12, 9, 0.45)';
        ctx.fillRect(-10.0, -32.5, 20.0, 65.0);

        const sillGrad = ctx.createLinearGradient(-9, 0, 9, 0);
        sillGrad.addColorStop(0, '#64748b');
        sillGrad.addColorStop(0.3, '#cbd5e1');
        sillGrad.addColorStop(0.5, '#334155');
        sillGrad.addColorStop(0.7, '#cbd5e1');
        sillGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = sillGrad;
        ctx.fillRect(-9.0, -31.5, 18.0, 63.0);

        ctx.strokeStyle = '#061511';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(-9.0, -31.5, 18.0, 63.0);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.65;
        ctx.strokeRect(-9.0, -31.5, 18.0, 63.0);

        // 中央气密滑槽 + 翡翠导引亮线
        ctx.fillStyle = '#061a14';
        ctx.fillRect(-2.6, -31.0, 5.2, 62.0);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(0, -30.5);
        ctx.lineTo(0, 30.5);
        ctx.stroke();
    });

    // 2. 贴平实验室门框收纳门兜 + 放大版蓝屏生物识别与气密阀盒 (严格落在 ±45.75 内)
    const housingSprite = createCorridorDoorSprite(40, 96, (ctx) => {
        // 南北两侧门兜 (py: -46..-30.5 与 +30.5..+46, 宽 13.0)
        [-1, 1].forEach(ySign => {
            const jy = (ySign < 0) ? -46.0 : 30.5;
            const jh = 15.5;

            ctx.fillStyle = 'rgba(2, 12, 9, 0.52)';
            ctx.fillRect(-7.2, jy - (ySign < 0 ? 0.3 : 0.6), 14.4, jh + 0.9);

            const jGrad = ctx.createLinearGradient(-6.5, jy, 6.5, jy + jh);
            jGrad.addColorStop(0, '#cbd5e1');
            jGrad.addColorStop(0.55, '#94a3b8');
            jGrad.addColorStop(1, '#64748b');
            ctx.fillStyle = jGrad;
            ctx.fillRect(-6.5, jy, 13.0, jh);

            ctx.strokeStyle = '#061511';
            ctx.lineWidth = 1.4;
            ctx.strokeRect(-6.5, jy, 13.0, jh);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 0.75;
            ctx.strokeRect(-6.5, jy, 13.0, jh);

            // 门兜收口边 + 翡翠边光条
            const lipY = (ySign < 0) ? (jy + jh - 2.4) : jy;
            ctx.fillStyle = '#334155';
            ctx.fillRect(-6.2, lipY, 12.4, 2.4);
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 0.6;
            ctx.strokeRect(-6.2, lipY, 12.4, 2.4);

            // 中央锁状态指示灯座
            ctx.fillStyle = '#062019';
            ctx.fillRect(-2.6, jy + 5.8, 5.2, 3.6);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 0.45;
            ctx.strokeRect(-2.6, jy + 5.8, 5.2, 3.6);
        });

        // 北侧门垛东西两侧：贴平生物识别终端
        drawBiometricTerminalStatic(ctx, 1);
        drawBiometricTerminalStatic(ctx, -1);

        // 南侧门垛东西两侧：贴平气密压差阀盒
        drawPneumaticManifoldBoxStatic(ctx, 1);
        drawPneumaticManifoldBoxStatic(ctx, -1);
    });

    // 3. 北门扇 & 南门扇 (13.5 x 31.5)
    const leafNorthSprite = createCorridorDoorSprite(20, 38, (ctx) => drawDoorLeafHalf(ctx, true));
    const leafSouthSprite = createCorridorDoorSprite(20, 38, (ctx) => drawDoorLeafHalf(ctx, false));

    // 4. 瘦身机械转轮锁
    const wheelSprite = createCorridorDoorSprite(26, 26, drawMechanicalWheelLockSprite);

    window.__airtightDoorSpritesV2 = {
        sillSprite,
        housingSprite,
        leafNorthSprite,
        leafSouthSprite,
        wheelSprite
    };
    return window.__airtightDoorSpritesV2;
}

function drawAirtightBlastDoor(ctx, door) {
    if (!door) return;
    const sprites = ensureAirtightBlastDoorSprites();
    const openProg = Math.max(0, Math.min(1, door.openProgress !== undefined ? door.openProgress : 0));
    const wheelAng = door.wheelAngle || 0;
    const isLocked = !!door.isLocked;
    const time = Date.now() * 0.001;
    const phase = door.id === 'airtight_door_2' ? 1.4 : (door.id === 'airtight_door_3' ? 0.7 : (door.id === 'airtight_door_4' ? 2.1 : 0));

    ctx.save();
    ctx.translate(door.cx, door.cy);
    ctx.rotate(door.angle);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;

    // 1. 底层洁净门槛导轨槽
    const sill = sprites.sillSprite;
    ctx.drawImage(sill.canvas, -sill.w / 2, -sill.h / 2, sill.w, sill.h);

    // 2. 滑动实验室气闸门扇 + 机械旋转转轮锁 (裁剪在 ±45.75 通道内)
    const slideOffset = 31.5 * openProg;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-14, -46, 28, 92);
    ctx.clip();

    const ln = sprites.leafNorthSprite;
    ctx.drawImage(ln.canvas, -ln.w / 2, -15.75 - slideOffset - ln.h / 2, ln.w, ln.h);

    const ls = sprites.leafSouthSprite;
    ctx.drawImage(ls.canvas, -ls.w / 2, 15.75 + slideOffset - ls.h / 2, ls.w, ls.h);

    // 机械转轮锁：闭合时居中 (0,0)，开启时随北门扇缩入门兜并按 wheelAngle 转动
    const wh = sprites.wheelSprite;
    const wheelY = -32.0 * openProg;
    ctx.save();
    ctx.translate(0, wheelY);
    ctx.rotate(wheelAng);
    ctx.drawImage(wh.canvas, -wh.w / 2, -wh.h / 2, wh.w, wh.h);
    ctx.restore();

    ctx.restore();

    // 3. 顶层南北门兜、贴平生物识别终端与气密阀盒
    const hsg = sprites.housingSprite;
    ctx.drawImage(hsg.canvas, -hsg.w / 2, -hsg.h / 2, hsg.w, hsg.h);

    // 4. 动态状态指示灯 + 生物识别蓝屏动态扫描 + 气密表指针微动 (不改门扇、转轮与 edge 光)
    const ledColor = isLocked ? '#ef4444' : (openProg > 0.05 ? '#10b981' : '#f59e0b');
    const ledRim = isLocked ? '#fca5a5' : (openProg > 0.05 ? '#a7f3d0' : '#fde68a');
    const ledCore = isLocked ? '#fee2e2' : (openProg > 0.05 ? '#d1fae5' : '#fef3c7');
    const ledPulse = isLocked
        ? (0.45 + 0.55 * (Math.sin(time * 5.2 + phase) * 0.5 + 0.5))
        : (openProg > 0.05 ? (0.72 + 0.28 * (Math.sin(time * 2.4 + phase) * 0.5 + 0.5)) : (0.55 + 0.45 * (Math.sin(time * 3.2 + phase) * 0.5 + 0.5)));

    // 南北门垛锁状态小灯 (动态脉动)
    [-38.4, 38.1].forEach(ly => {
        ctx.save();
        ctx.globalAlpha = ledPulse;
        ctx.fillStyle = ledColor;
        ctx.fillRect(-1.8, ly - 0.9, 3.6, 1.8);
        ctx.strokeStyle = ledRim;
        ctx.lineWidth = 0.45;
        ctx.strokeRect(-1.8, ly - 0.9, 3.6, 1.8);
        ctx.fillStyle = ledCore;
        ctx.fillRect(-0.9, ly - 0.35, 1.8, 0.7);
        ctx.restore();
    });

    // 东西两侧生物识别蓝屏与顶部状态条动态层
    [-1, 1].forEach(sideSign => {
        const bx = sideSign * 11.55;
        const scrX = bx - 4.25;
        const scrY = -41.8;
        const scrW = 8.5;
        const scrH = 17.6;

        // 顶部状态条动态闪烁/呼吸
        ctx.save();
        ctx.globalAlpha = ledPulse;
        ctx.fillStyle = ledColor;
        ctx.fillRect(bx - 2.4, -44.2, 4.8, 1.3);
        ctx.fillStyle = ledCore;
        ctx.fillRect(bx - 1.4, -43.9, 2.8, 0.7);
        ctx.restore();

        // 蓝屏内部动态扫描线 + 虹膜准星旋转 + 掌纹高亮波
        ctx.save();
        ctx.beginPath();
        ctx.rect(scrX + 0.3, scrY + 0.3, scrW - 0.6, scrH - 0.6);
        ctx.clip();

        // 虹膜动态旋转弧线
        const irisY = scrY + 4.3;
        const rotAng = time * 1.9 * sideSign + phase;
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(bx, irisY, 2.15, rotAng, rotAng + Math.PI * 0.75);
        ctx.stroke();

        // 掌纹区呼吸亮点
        const palmPulse = 0.14 + 0.16 * (Math.sin(time * 3.1 + phase) * 0.5 + 0.5);
        ctx.fillStyle = `rgba(56, 189, 248, ${palmPulse.toFixed(2)})`;
        ctx.fillRect(bx - 2.6, scrY + 9.4, 5.2, 7.2);

        // 全屏上下往返激光扫描线
        const scanNorm = Math.sin(time * 2.3 + phase) * 0.5 + 0.5;
        const scanY = scrY + 1.2 + scanNorm * (scrH - 2.4);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(scrX + 0.4, scanY);
        ctx.lineTo(scrX + scrW - 0.4, scanY);
        ctx.stroke();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(scrX + 0.6, scanY);
        ctx.lineTo(scrX + scrW - 0.6, scanY);
        ctx.stroke();
        ctx.restore();

        // 底部蓝色读卡指示槽动态闪烁
        const cardPulse = Math.sin(time * 4.0 + phase + sideSign) > 0;
        ctx.fillStyle = cardPulse ? '#e0f2fe' : '#0284c7';
        ctx.fillRect(bx - 1.5, -23.2, 3.0, 0.8);

        // 南侧气密压差阀盒：动态微振压差表指针 + 底部阀门闪烁微灯
        const mx = sideSign * 9.6;
        const gy = 34.7;
        ctx.fillStyle = '#062019';
        ctx.beginPath();
        ctx.arc(mx, gy, 1.8, 0, Math.PI * 2);
        ctx.fill();
        const needleAng = -0.65 + (openProg > 0.05 ? 0.5 : 0) + 0.28 * Math.sin(time * 3.4 + phase + sideSign);
        ctx.strokeStyle = openProg > 0.05 ? '#34d399' : '#7dd3fc';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(mx, gy);
        ctx.lineTo(mx + Math.cos(needleAng) * 1.45, gy + Math.sin(needleAng) * 1.45);
        ctx.stroke();

        const valveBlink = Math.sin(time * 2.8 + phase) > 0;
        ctx.fillStyle = valveBlink ? '#fbbf24' : '#78350f';
        ctx.fillRect(mx - 1.6, 40.9, 3.2, 1.4);
    });

    ctx.restore();
}

function getAirtightBlastDoor(id, cx, cy, angle, isLocked) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rotPt = (lx, ly) => ({
        x: +(cx + lx * cosA - ly * sinA).toFixed(1),
        y: +(cy + lx * sinA + ly * cosA).toFixed(1)
    });

    // 门体碰撞与视线遮挡多边形 (覆盖中央 63px 净门洞，闭合时阻挡通行与视野，开启后 engine.js 置 noCollision=true)
    const points = [
        rotPt(-7, -32.5),
        rotPt(7, -32.5),
        rotPt(7, 32.5),
        rotPt(-7, 32.5)
    ];

    // 视锥剔除包围盒 (包含 36x94 完整门框+贴平生物识别终端)
    const boundPts = [
        rotPt(-18, -47),
        rotPt(18, -47),
        rotPt(18, 47),
        rotPt(-18, 47)
    ];
    const xs = boundPts.map(p => p.x);
    const ys = boundPts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        id: id,
        type: 'airtight_blast_door',
        cx: cx,
        cy: cy,
        angle: angle,
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        points: points,
        openProgress: 0,
        wheelAngle: 0,
        isLocked: !!isLocked,
        noCollision: false,
        playerWasInDressing: false,
        label: id === 'airtight_door_1' ? 'AIRTIGHT BLAST DOOR 1' : (id === 'airtight_door_2' ? 'AIRTIGHT BLAST DOOR 2' : (id === 'airtight_door_3' ? 'AIRTIGHT BLAST DOOR 3' : 'AIRTIGHT BLAST DOOR 4')),
        displayName: id === 'airtight_door_1' ? 'AIRLOCK BLAST GATE 01' : (id === 'airtight_door_2' ? 'AIRLOCK BLAST GATE 02' : (id === 'airtight_door_3' ? 'AIRLOCK BLAST GATE 03' : 'AIRLOCK BLAST GATE 04')),
        hideLabel: true,
        draw: function(ctx) {
            drawAirtightBlastDoor(ctx, this);
        }
    };
}

// =========================================================================
// 斜向缓冲通道外壳（长 392px / 宽 91.5px 实验室气闸底盘）
// =========================================================================
function drawBufferCorridorSystem(ctx, corridor) {
    const L = corridor.length || 392; // 通道总长 (通道1=392px，通道2按南端至北端实算)
    const W = corridor.width || 91.5; // 通道净宽 91.5px
    const halfL = L / 2;
    const halfW = W / 2;
    // 更衣区与消毒区分界局部 x (默认 0 = halfL，通道2按门3实算偏移)
    const splitX = (typeof corridor.deconSplitS === 'number') ? (corridor.deconSplitS - halfL) : 0;

    ctx.save();
    ctx.translate(corridor.cx, corridor.cy);
    ctx.rotate(corridor.angle);

    // 若该通道带东侧门洞衔接踏步区 (通道2留口跨越东外墙 14px)，先铺设银白门洞过渡地坪
    if (corridor.doorwayThresholdLocal) {
        const th = corridor.doorwayThresholdLocal;
        ctx.save();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(th.x, th.y, th.w, th.h);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        for (let tx = th.x; tx <= th.x + th.w + 0.1; tx += 14) {
            ctx.beginPath(); ctx.moveTo(tx, th.y); ctx.lineTo(tx, th.y + th.h); ctx.stroke();
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(th.x, th.y + th.h);
        ctx.lineTo(th.x + th.w, th.y + th.h);
        ctx.stroke();
        ctx.restore();
    }

    // 若指定了斜切多边形裁剪区（通道2南端贴底部墙斜切），将地坪、网格与警戒带严密裁剪在通道轮廓内
    if (Array.isArray(corridor.floorClipLocal) && corridor.floorClipLocal.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(corridor.floorClipLocal[0].x, corridor.floorClipLocal[0].y);
        for (let i = 1; i < corridor.floorClipLocal.length; i++) {
            ctx.lineTo(corridor.floorClipLocal[i].x, corridor.floorClipLocal[i].y);
        }
        ctx.closePath();
        ctx.clip();
    }

    // =========================================================
    // 1. 缓冲区银白高洁净金属地坪与屏幕蓝警戒线
    // 更衣区: minX ~ splitX (通道1内端斜切时 minX < -halfL)
    // 消毒区: splitX ~ +halfL
    // =========================================================
    const minX = Array.isArray(corridor.floorClipLocal) && corridor.floorClipLocal.length > 0
        ? Math.min(-halfL, ...corridor.floorClipLocal.map(p => p.x))
        : -halfL;
    const dressW = Math.max(1, splitX - minX);
    const deconW = Math.max(1, halfL - splitX);

    // 更衣区地坪 (银白复合洁净地坪，对标门板浅灰渐变 #94a3b8 / #e2e8f0 / #cbd5e1)
    const gradDress = ctx.createLinearGradient(minX, 0, splitX, 0);
    gradDress.addColorStop(0, '#cbd5e1');
    gradDress.addColorStop(0.5, '#e2e8f0');
    gradDress.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gradDress;
    ctx.fillRect(minX, -halfW, dressW, W);

    // 消毒区地坪 (银灰拉丝不锈钢工业地坪，稍深一阶以区分功能区)
    const gradDecon = ctx.createLinearGradient(splitX, 0, halfL, 0);
    gradDecon.addColorStop(0, '#94a3b8');
    gradDecon.addColorStop(0.5, '#cbd5e1');
    gradDecon.addColorStop(1, '#94a3b8');
    ctx.fillStyle = gradDecon;
    ctx.fillRect(splitX, -halfW, deconW, W);

    // 导静电防滑网格与焊缝 (屏幕蓝 #38bdf8 点缀)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
    ctx.lineWidth = 1;
    const gridStartX = minX < -halfL ? (-halfL - Math.ceil((-halfL - minX) / 28) * 28) : -halfL;
    for (let lx = gridStartX; lx <= halfL; lx += 28) {
        ctx.beginPath(); ctx.moveTo(lx, -halfW); ctx.lineTo(lx, halfW); ctx.stroke();
    }
    for (let ly = -halfW; ly <= halfW; ly += 15.25) {
        ctx.beginPath(); ctx.moveTo(minX, ly); ctx.lineTo(halfL, ly); ctx.stroke();
    }

    // 更衣区 / 消毒区中央蓝色分界标线
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(splitX, -halfW);
    ctx.lineTo(splitX, halfW);
    ctx.stroke();

    // 两侧屏幕蓝高光防滑斜纹警戒带 (4px 窄带适配 91.5px 宽度，改蓝，不留琥珀色)
    const stripeStartX = minX < -halfL ? (-halfL - Math.ceil((-halfL - minX) / 12) * 12) : -halfL;
    const drawHazardStripe = (startY) => {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(minX, startY, halfL - minX, 4);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.88)';
        for (let hx = stripeStartX; hx < halfL; hx += 12) {
            ctx.beginPath();
            ctx.moveTo(hx, startY + 4);
            ctx.lineTo(hx + 5, startY);
            ctx.lineTo(hx + 8, startY);
            ctx.lineTo(hx + 3, startY + 4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };
    drawHazardStripe(-halfW);
    drawHazardStripe(halfW - 4);

    ctx.restore();
}

// =========================================================================
// Level 8 西侧三角房 · 0.7x 等比重建法医解剖室与四联胶囊培养舱 (2026-11-18)
// 尺寸锚点：地狱犬实际尺寸 68px (影子椭圆 68x44)，全屋等比 ×0.7 缩小
// 约束：文字 >= 2.4px；描边 lineWidth <= 1.8 (中位 ~0.8)；仅改 level7_test.js
// =========================================================================

function drawAutopsySupineHoundHead(ctx, hx, hy, baseAng, isAlpha) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(baseAng);
    const scale = isAlpha ? 1.22 : 0.96;
    ctx.scale(scale, scale);

    // 1) 颈部肌肉连接（暗哑黑炭色）
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 7.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2-3) 后掠暗色角刺（去发光）
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 0.8;
    [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(-2, side * 4.6);
        ctx.quadraticCurveTo(-7.5, side * 11, -13, side * 13);
        ctx.quadraticCurveTo(-6.5, side * 7.2, 0, side * 3.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // 4-5) 仰躺犬耳轮廓
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.7;
    [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(-2.5, side * 4.0);
        ctx.lineTo(-6.2, side * 8.0);
        ctx.lineTo(1.2, side * 5.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // 6) 仰躺犬颅骨轮廓
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-4, -4.8);
    ctx.lineTo(8, -3.8);
    ctx.lineTo(12.8, -1.9);
    ctx.lineTo(14.5, 0);
    ctx.lineTo(12.8, 1.9);
    ctx.lineTo(8, 3.8);
    ctx.lineTo(-4, 4.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 7-8) 颅骨眉脊毛发纹理
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 0.65;
    [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(-2.2, side * 2.2);
        ctx.lineTo(3.5, side * 3.0);
        ctx.lineTo(6.2, side * 2.0);
        ctx.stroke();
    });

    // 9-10) 吻部鼻梁 + 鼻尖软骨块
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(8.8, 0, 5.5, 2.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.ellipse(13.2, 0, 1.4, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 11-12) 微张暗红口腔 + 哑白上下利齿
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(9.8, 0, 4.0, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.moveTo(8.5, -2.5); ctx.lineTo(10.3, -2.5); ctx.lineTo(9.4, -0.6); ctx.closePath();
    ctx.moveTo(8.5, 2.5); ctx.lineTo(10.3, 2.5); ctx.lineTo(9.4, 0.6); ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(10.8, -1.1, 1.0, 2.2);

    // 13-14) 失去光芒的死眼裂隙
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(3.8, -2.8, isAlpha ? 1.9 : 1.5, 1.0, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4c1d1d';
    ctx.beginPath();
    ctx.ellipse(3.8, -2.8, isAlpha ? 1.2 : 0.9, 0.55, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawAutopsySupineCerberus(ctx, cx, cy, angle) {
    // 复用 engine.js Cerberus 模型改平躺姿态：总长严格对齐 68px（敌人实际尺寸 68x44），颜色调暗、去发光
    // 模型局部 x ∈ [-52, +43] (跨度 95)，缩放 0.715 -> 95 * 0.715 ≈ 67.9px 长
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(0.715, 0.70);

    // 1) 尸体贴槽柔和接触影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(-2, 0, 34, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2) 四肢仰躺外摊
    [-1, 1].forEach(side => {
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(-15, side * 14.5, 7.5, 4.5, side * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(-19, side * 17.5, 3.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(-19, side * 17.8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-21, side * 17.0); ctx.lineTo(-24.5, side * 18.2);
        ctx.moveTo(-20.4, side * 18.6); ctx.lineTo(-23.8, side * 19.9);
        ctx.stroke();

        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(10, side * 15.2, 8.2, 4.8, -side * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(15.5, side * 17.8, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(15.8, side * 18.0, 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 0.95;
        ctx.beginPath();
        ctx.moveTo(17.5, side * 17.0); ctx.lineTo(21.5, side * 18.0);
        ctx.moveTo(16.8, side * 18.8); ctx.lineTo(20.5, side * 20.0);
        ctx.stroke();
    });

    // 3) 分节龙尾骨脊与尾端蛇首
    const tailPts = [
        { x: -19, y: 0, r: 3.1 },
        { x: -25, y: 2.2, r: 2.7 },
        { x: -31, y: 4.1, r: 2.3 },
        { x: -37, y: 3.6, r: 1.9 },
        { x: -42.5, y: 1.2, r: 1.6 },
        { x: -46.8, y: -1.6, r: 1.3 }
    ];
    for (let i = 0; i < tailPts.length - 1; i++) {
        const p1 = tailPts[i], p2 = tailPts[i + 1];
        ctx.fillStyle = (i % 2 === 0) ? '#18181b' : '#27272a';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.ellipse((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5, 4.2, p1.r, Math.atan2(p2.y - p1.y, p2.x - p1.x), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#5c1919';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - 1.0);
        ctx.lineTo(p1.x - 1.5, p1.y - p1.r - 1.8);
        ctx.lineTo(p1.x - 3.0, p1.y - 0.8);
        ctx.closePath();
        ctx.fill();
    }
    ctx.save();
    ctx.translate(-48, -2.5);
    ctx.rotate(Math.PI + 0.55);
    ctx.fillStyle = '#2c0b0e';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -2.8);
    ctx.lineTo(6.8, 0);
    ctx.lineTo(0, 2.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#52525b';
    ctx.beginPath();
    ctx.arc(2.5, -1.0, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4) 躯干仰躺轮廓与法医开胸解剖切口
    ctx.fillStyle = '#141417';
    ctx.beginPath();
    ctx.ellipse(2, 0, 23, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    const torsoGrad = ctx.createLinearGradient(-16, 0, 18, 0);
    torsoGrad.addColorStop(0, '#09090b');
    torsoGrad.addColorStop(0.45, '#27272a');
    torsoGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.ellipse(2.5, 0, 20, 11.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c080b';
    ctx.beginPath();
    ctx.ellipse(3, 0, 12.2, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(3, 0, 9.8, 4.0, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 0.85;
    [-6.5, -2.0, 2.5, 7.0].forEach(rx => {
        ctx.beginPath();
        ctx.moveTo(rx, -7.2);
        ctx.quadraticCurveTo(rx + 2.2, -4.5, rx + 1.2, -1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx, 7.2);
        ctx.quadraticCurveTo(rx + 2.2, 4.5, rx + 1.2, 1.5);
        ctx.stroke();
    });

    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();

    // 5) 垂落颈侧的暗化蛇毛
    [
        { bx: 7, by: -10, ex: 13, ey: -17 },
        { bx: 11, by: -8, ex: 18, ey: -15 },
        { bx: 14, by: -5, ex: 21, ey: -10 },
        { bx: 7, by: 10, ex: 13, ey: 17 },
        { bx: 11, by: 8, ex: 18, ey: 15 },
        { bx: 14, by: 5, ex: 21, ey: 10 }
    ].forEach((sn, idx) => {
        ctx.strokeStyle = (idx % 2 === 0) ? '#18181b' : '#3b0d0d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sn.bx, sn.by);
        ctx.quadraticCurveTo((sn.bx + sn.ex) * 0.5, sn.by * 1.15, sn.ex, sn.ey);
        ctx.stroke();

        ctx.fillStyle = '#3b0d0d';
        ctx.beginPath();
        ctx.arc(sn.ex, sn.ey, 1.6, 0, Math.PI * 2);
        ctx.fill();
    });

    // 6) 三颗仰躺地狱犬首
    drawAutopsySupineHoundHead(ctx, 16, -12.5, -0.56, false);
    drawAutopsySupineHoundHead(ctx, 16, 12.5, 0.56, false);
    drawAutopsySupineHoundHead(ctx, 22, 0, 0.06, true);

    ctx.restore();
}

function drawWestAutopsyTableDeckStatic(ctx, cx, cy, angle = 0) {
    // 0.7x 等比缩小：桌下胶垫 + 台身(2抽屉/下层搁板/交叉撑/调平脚/向东电源线插头) + 140x45 304不锈钢台面 + 28x34一体水槽 + 台面小件
    const W = 140;
    const H = 45;
    const halfW = W / 2;   // 70
    const halfH = H / 2;   // 22.5

    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);

    // 0) 桌下深色防疲劳胶垫（比台面略大 154x58，无碰撞）
    ctx.fillStyle = '#090d11';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-77, -29, 154, 58, 4) : ctx.rect(-77, -29, 154, 58);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-74.5, -26.5, 149, 53);
    for (let mx = -70; mx <= 70; mx += 14) {
        ctx.beginPath();
        ctx.moveTo(mx, -25.5); ctx.lineTo(mx, -23.5);
        ctx.moveTo(mx, 23.5); ctx.lineTo(mx, 25.5);
        ctx.stroke();
    }

    // 0.5) 电源线（台身向东接墙方向延伸 + 地面线卡 + 三脚工业插头与地板插座盒）
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(68, -4);
    ctx.bezierCurveTo(86, -4, 96, -10, 114, -6);
    ctx.bezierCurveTo(126, -3, 134, -5, 143, -5);
    ctx.stroke();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(68, -4);
    ctx.bezierCurveTo(86, -4, 96, -10, 114, -6);
    ctx.bezierCurveTo(126, -3, 134, -5, 143, -5);
    ctx.stroke();

    // 2 个线卡 + 插头 + 墙面/地脚接线插座盒
    [94, 122].forEach(kx => {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(kx - 1.5, -8.5, 3, 3.2);
    });
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.65;
    ctx.fillRect(138, -7.8, 6.2, 5.6);
    ctx.strokeRect(138, -7.8, 6.2, 5.6);
    ctx.fillStyle = '#334155';
    ctx.fillRect(144, -9.5, 7, 9);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(144, -9.5, 7, 9);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(147.5, -7.0, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 0.7) 台身地面投影、调平脚、桌腿交叉撑、下层搁板（瓶子+叠布）、中央立柱与南面 2 个抽屉
    ctx.fillStyle = 'rgba(2, 10, 8, 0.56)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-halfW - 1.5, -halfH + 1, W + 3, H + 7, 3.5) : ctx.rect(-halfW - 1.5, -halfH + 1, W + 3, H + 7);
    ctx.fill();

    // 4 个调平脚 + 防滑垫（四角微探出，增强立体台身感）
    [
        [-64, -22.5], [60, -22.5], [-64, 24.5], [60, 24.5]
    ].forEach(([fx, fy]) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(fx, fy - 1.2, 4.5, 3.2);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(fx + 0.8, fy - 1.6, 2.9, 1.5);
    });

    // 桌腿交叉撑（在南缘微露与下层框架）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-61, halfH); ctx.lineTo(-42, halfH + 5.2);
    ctx.moveTo(-42, halfH); ctx.lineTo(-61, halfH + 5.2);
    ctx.moveTo(42, halfH); ctx.lineTo(61, halfH + 5.2);
    ctx.moveTo(61, halfH); ctx.lineTo(42, halfH + 5.2);
    ctx.stroke();

    // 中央单立柱基座法兰
    ctx.fillStyle = '#334155';
    ctx.fillRect(-14, halfH - 0.5, 28, 5.2);
    ctx.strokeStyle = '#061511';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-14, halfH - 0.5, 28, 5.2);

    // 下层搁板（居中在桌下南缘可视带 y ∈ [22.5, 28.5]，上放玻璃瓶 2 个 + 叠布 1 叠）
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-44, halfH + 0.6, 88, 5.2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-44, halfH + 0.6, 88, 5.2);
    // 搁板上的试剂瓶 + 叠布
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-38, halfH + 1.5, 3.5, 3.4);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-33, halfH + 1.5, 3.5, 3.4);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(28, halfH + 1.8, 10, 2.8);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(29, halfH + 1.2, 8, 1.3);

    // 南面 2 个不锈钢抽屉（带拉手与标签槽，位于 y ∈ [21.5, 25.6]）
    [-22, 4].forEach(dx => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(dx, halfH - 0.8, 18, 4.2);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(dx, halfH - 0.8, 18, 4.2);
        // 拉手 + 锁孔
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(dx + 5.5, halfH + 0.8, 7, 1.2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(dx + 15.0, halfH + 0.9, 1.2, 1.2);
    });

    // 1) 304 不锈钢主台面 (140x45)
    const deckGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    deckGrad.addColorStop(0, '#94a3b8');
    deckGrad.addColorStop(0.28, '#e2e8f0');
    deckGrad.addColorStop(0.62, '#cbd5e1');
    deckGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = deckGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-halfW, -halfH, W, H, 2.5) : ctx.rect(-halfW, -halfH, W, H);
    ctx.fill();

    ctx.strokeStyle = '#061511';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.52)';
    ctx.lineWidth = 0.65;
    ctx.stroke();

    // 四周 4.2px 高凸边与斜接角线
    const rim = 4.2;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-halfW + 1.0, -halfH + 1.0, W - 2.0, H - 2.0);

    ctx.fillStyle = '#aebbc9';
    ctx.fillRect(-halfW + rim, -halfH + rim, W - rim * 2, H - rim * 2);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-halfW + rim, -halfH + rim, W - rim * 2, H - rim * 2);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH); ctx.lineTo(-halfW + rim, -halfH + rim);
    ctx.moveTo(halfW, -halfH); ctx.lineTo(halfW - rim, -halfH + rim);
    ctx.moveTo(halfW, halfH); ctx.lineTo(halfW - rim, halfH - rim);
    ctx.moveTo(-halfW, halfH); ctx.lineTo(-halfW + rim, halfH - rim);
    ctx.stroke();

    // 台面精细激光网格蚀刻
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.lineWidth = 0.4;
    for (let ex = -60; ex <= 30; ex += 10) {
        ctx.beginPath();
        ctx.moveTo(ex, -halfH + rim);
        ctx.lineTo(ex, halfH - rim);
        ctx.stroke();
    }

    // 2) 解剖槽 (92x31 @ x ∈ [-61.5, +30.5], y ∈ [-15.5, +15.5])
    const slotX = -61.5, slotY = -15.5, slotW = 92, slotH = 31;
    const slotGrad = ctx.createLinearGradient(0, slotY, 0, slotY + slotH);
    slotGrad.addColorStop(0, '#1e293b');
    slotGrad.addColorStop(0.5, '#334155');
    slotGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = slotGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(slotX, slotY, slotW, slotH, 1.8) : ctx.rect(slotX, slotY, slotW, slotH);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 槽内格栅肋条与排水孔 (9 条)
    [-45, -36, -27, -18, -9, 0, 9, 18, 26].forEach(gx => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(gx - 1.5, slotY + 1.8, 3.0, slotH - 3.6);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(gx - 1.5, slotY + 1.8, 3.0, slotH - 3.6);
        [-8.5, 0, 8.5].forEach(hy => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(gx, hy, 0.85, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // 槽内排污滤网孔
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(19, 0, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.55;
    ctx.stroke();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(17, 0); ctx.lineTo(21, 0);
    ctx.moveTo(19, -2); ctx.lineTo(19, 2);
    ctx.stroke();

    // 3) 西端头枕小凸台
    const hrGrad = ctx.createLinearGradient(-59.5, 0, -47, 0);
    hrGrad.addColorStop(0, '#64748b');
    hrGrad.addColorStop(0.5, '#cbd5e1');
    hrGrad.addColorStop(1, '#475569');
    ctx.fillStyle = hrGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-59.5, -7.8, 12.5, 15.6, 2.5) : ctx.rect(-59.5, -7.8, 12.5, 15.6);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(-52, 0, 3.6, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4) 东端一体水槽 (28x34 @ x ∈ [35, 63], y ∈ [-17, +17])
    const sinkX = 35, sinkY = -17, sinkW = 28, sinkH = 34;
    // 槽边挡水沿
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(sinkX - 1.5, sinkY - 1.5, sinkW + 3.0, sinkH + 3.0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(sinkX - 1.5, sinkY - 1.5, sinkW + 3.0, sinkH + 3.0);

    const sinkGrad = ctx.createLinearGradient(sinkX, sinkY, sinkX + sinkW, sinkY + sinkH);
    sinkGrad.addColorStop(0, '#09111e');
    sinkGrad.addColorStop(0.55, '#1e293b');
    sinkGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = sinkGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(sinkX, sinkY, sinkW, sinkH, 2.2) : ctx.rect(sinkX, sinkY, sinkW, sinkH);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.85;
    ctx.stroke();

    // 排水口 + 橡胶塞 + 珠链
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(48, 2, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(48, 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(44.5, 5.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(44.5, 5.2);
    ctx.quadraticCurveTo(42, 0, 41, -7.5);
    ctx.stroke();

    // 双龙头 + 冷热红蓝点 (#ef4444 / #38bdf8)
    [
        { fy: -12.5, dot: '#ef4444', nx: 49, ny: -7.5 },
        { fy: -6.5, dot: '#38bdf8', nx: 51.5, ny: -4.2 }
    ].forEach(f => {
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(59, f.fy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = f.dot;
        ctx.beginPath();
        ctx.arc(60.2, f.fy, 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(59, f.fy);
        ctx.quadraticCurveTo(54, f.fy, f.nx, f.ny);
        ctx.stroke();

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(59, f.fy);
        ctx.quadraticCurveTo(54, f.fy, f.nx, f.ny);
        ctx.stroke();
    });

    // 皂液器（水槽北西角）
    ctx.fillStyle = '#bae6fd';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(38.5, -13.5, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(38.0, -14.2, 2.5, 1.0);

    // 弹簧软管喷头（水槽东南侧）
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(58, 5.5, 2.4, 2.4);
    [
        { cx: 57, cy: 10.5, r: 4.0, a0: -0.5, a1: Math.PI * 1.15 },
        { cx: 56.2, cy: 10.7, r: 2.7, a0: 0.2, a1: Math.PI * 1.65 }
    ].forEach(seg => {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(seg.cx, seg.cy, seg.r, seg.a0, seg.a1);
        ctx.stroke();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(seg.cx, seg.cy, seg.r, seg.a0, seg.a1);
        ctx.stroke();
    });
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.55;
    ctx.fillRect(46.5, 11.8, 4.2, 2.2);
    ctx.strokeRect(46.5, 11.8, 4.2, 2.2);

    // 晾架挂 2 件工具（水槽东侧不锈钢挂杆 + 刷子与探针）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(65.5, -13);
    ctx.lineTo(65.5, 13);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(64.5, -9, 2.2, 6.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(64.8, 2, 1.6, 8);

    // 5) 台面两侧刻度标尺线 + 标本编号钢印 (SPEC-00)
    [-20.2, 20.2].forEach(ry => {
        const dir = ry < 0 ? 1 : -1;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-56, ry);
        ctx.lineTo(28, ry);
        ctx.stroke();
        for (let tx = -56; tx <= 28; tx += 4) {
            const off = tx + 56;
            const isMaj = (off % 16 === 0);
            const len = isMaj ? 2.6 : 1.2;
            ctx.strokeStyle = isMaj ? '#1e293b' : '#475569';
            ctx.lineWidth = isMaj ? 0.7 : 0.45;
            ctx.beginPath();
            ctx.moveTo(tx, ry);
            ctx.lineTo(tx, ry + dir * len);
            ctx.stroke();
        }
    });

    // 标本编号钢印 (SPEC-00 @ 西南边框凸缘旁)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-67, 15.8, 18, 5.2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-67, 15.8, 18, 5.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('SPEC-00', -58, 18.5);

    // 6) 台面小件（不遮挡尸体，分布于台面西端与槽边空位）：
    // 6A) 标本罐（台面西端 x=-65.5, y=-9：玻璃罐 + 绿液 + 小标本 + 盖）
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(-65.5, -10, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(-65.5, -10, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(-65.3, -9.8, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // 6B) 试剂瓶（带标签 @ x=-65.5, y=6）
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-67.8, 3.0, 4.6, 6.2);
    ctx.strokeRect(-67.8, 3.0, 4.6, 6.2);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-67.4, 4.6, 3.8, 2.6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-66.6, 1.8, 2.2, 1.2);

    // 6C) 写字板（板+纸+夹+2-3行潦草字 @ x=25, y=17.5）
    ctx.fillStyle = '#451a03';
    ctx.fillRect(19, 13.8, 11.5, 7.8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(19.8, 14.5, 9.9, 6.4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(22.8, 13.6, 4.0, 1.4);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(21, 16.2); ctx.lineTo(28.5, 16.2);
    ctx.moveTo(21, 17.8); ctx.lineTo(27.0, 17.8);
    ctx.moveTo(21, 19.4); ctx.lineTo(28.0, 19.4);
    ctx.stroke();

    // 6D) 叠巾（@ x=-40, y=-18.5）
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-45, -20.5, 10, 4.2);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-44.2, -19.8, 8.4, 2.8);
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-45, -20.5, 10, 4.2);

    // 6E) 工具卷（卷布 + 露出工具柄 @ x=4, y=16.5）
    ctx.fillStyle = '#334155';
    ctx.fillRect(-4, 15.0, 14, 5.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-4, 15.0, 14, 5.2);
    [-1.5, 1.8, 5.0, 7.8].forEach(tx => {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(tx, 13.2, 1.3, 2.5);
    });

    // 6F) 摇臂放大镜（从北沿 x=-26 伸出，镜片直径 12 @ (-18, -16)，不遮挡尸体）
    ctx.fillStyle = '#475569';
    ctx.fillRect(-29, -22.2, 4.5, 3.0);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-26.8, -20.5);
    ctx.lineTo(-24, -17.5);
    ctx.lineTo(-18, -16);
    ctx.stroke();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.34)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(-18, -16, 6.0, 0, Math.PI * 2); // 直径 12
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(-18, -16, 4.0, -2.5, -1.2);
    ctx.stroke();

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestAutopsyTableGlowDynamic(ctx, cx, cy, time, angle = 0) {
    __dynDrawCached(ctx, 'drawWestAutopsyTableGlowDynamic', 360, 320, cx, cy, (octx) => drawWestAutopsyTableGlowDynamicImpl(octx, cx, cy, time, angle));
}
function drawWestAutopsyTableGlowDynamicImpl(ctx, cx, cy, time, angle = 0) {
    // 淡蓝白光晕椭圆 140x56 (×0.7 缩小)，透明度呼吸 (0.05 - 0.25)，周期 2 秒
    const breath = 0.5 + 0.5 * Math.sin(time * Math.PI);
    const centerAlpha = 0.05 + 0.20 * breath;
    const midAlpha = centerAlpha * 0.72;

    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);
    ctx.scale(70, 28); // 140x56
    const glowGrad = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 1);
    glowGrad.addColorStop(0, `rgba(224, 242, 254, ${centerAlpha.toFixed(3)})`);
    glowGrad.addColorStop(0.55, `rgba(56, 189, 248, ${midAlpha.toFixed(3)})`);
    glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawWestAutopsyCorpseLayerStatic(ctx, cx, cy, angle = 0) {
    // 槽内暗色血迹 + 68px 仰躺三头犬尸体 + 2 条固定束带（皮带+扣）+ Ø37 环形灯组支架/拉链/灯控盒
    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);

    // 暗色血迹
    [
        { x: -32, y: 8.5, rx: 7.4, ry: 3.4, rot: 0.25 },
        { x: -10, y: -9.5, rx: 8.5, ry: 3.1, rot: -0.18 },
        { x: 12, y: 6.2, rx: 6.0, ry: 2.8, rot: 0.15 }
    ].forEach(bp => {
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.ellipse(bp.x, bp.y, bp.rx, bp.ry, bp.rot, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
        ctx.beginPath();
        ctx.ellipse(bp.x - 0.8, bp.y - 0.4, bp.rx * 0.68, bp.ry * 0.62, bp.rot, 0, Math.PI * 2);
        ctx.fill();
    });

    // 68px 平躺三头犬尸体（居中于解剖槽）
    drawAutopsySupineCerberus(ctx, -14, 0, Math.PI);

    // 2 条固定束带（横过尸体：棕色皮带 + 金属带扣 + 扣孔）
    [-22, -6].forEach(bx => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(bx - 1.6, -15.5, 3.2, 31);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(bx - 1.6, -15.5, 3.2, 31);
        // 金属皮带扣
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.55;
        ctx.fillRect(bx - 2.1, -2.0, 4.2, 4.0);
        ctx.strokeRect(bx - 2.1, -2.0, 4.2, 4.0);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx - 0.8, -0.8, 1.6, 1.6);
    });

    // 环形灯组静态支架：北侧吊臂 (550, 1278) -> (550, 1262) 即 (0, -22) -> (0, -38)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-1.4, -38, 2.8, 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-0.9, -38, 1.8, 16);

    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(0, -38, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 吊臂上的灯控盒（小盒 + 开关 + 绿色指示灯）+ 细珠拉链
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-3.6, -34.5, 7.2, 4.5);
    ctx.strokeRect(-3.6, -34.5, 7.2, 4.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2.4, -33.0, 2.2, 1.4);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(1.8, -32.2, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 拉链（细珠链从灯控盒右侧垂下）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([0.8, 0.8]);
    ctx.beginPath();
    ctx.moveTo(4.2, -31.5);
    ctx.lineTo(4.6, -23.0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(4.6, -22.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 环形灯框：直径 37 (r = 18.5)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 18.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(0, 0, 18.5, 0, Math.PI * 2);
    ctx.stroke();

    // 8 盏灯直径 7 (r = 3.5)
    for (let i = 0; i < 8; i++) {
        const theta = -Math.PI / 2 + i * (Math.PI / 4);
        const lx = Math.cos(theta) * 18.5;
        const ly = Math.sin(theta) * 18.5;

        const housingGrad = ctx.createRadialGradient(lx - 0.8, ly - 0.8, 0.4, lx, ly, 3.5);
        housingGrad.addColorStop(0, '#f1f5f9');
        housingGrad.addColorStop(0.7, '#94a3b8');
        housingGrad.addColorStop(1, '#475569');
        ctx.fillStyle = housingGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // 暗态基底：蓝环与灯芯保留可见
        ctx.fillStyle = '#0c4a6e';
        ctx.beginPath();
        ctx.arc(lx, ly, 2.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.arc(lx, ly, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestAutopsyRingLampsDynamic(ctx, cx, cy, time, angle = 0) {
    __dynDrawCached(ctx, 'drawWestAutopsyRingLampsDynamic', 360, 320, cx, cy, (octx) => drawWestAutopsyRingLampsDynamicImpl(octx, cx, cy, time, angle));
}
function drawWestAutopsyRingLampsDynamicImpl(ctx, cx, cy, time, angle = 0) {
    // 8 盏灯单双号反相呼吸：周期 2 秒，亮度 0.30 - 1.00，直径 7 (r = 3.5)
    const phaseBase = Math.sin(time * Math.PI);
    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);
    for (let i = 0; i < 8; i++) {
        const theta = -Math.PI / 2 + i * (Math.PI / 4);
        const lx = Math.cos(theta) * 18.5;
        const ly = Math.sin(theta) * 18.5;
        const groupWave = (i % 2 === 0) ? (0.5 + 0.5 * phaseBase) : (0.5 - 0.5 * phaseBase);
        const brightness = 0.30 + 0.70 * groupWave;

        ctx.save();
        ctx.globalAlpha = brightness;

        if (brightness > 0.42) {
            const haloGrad = ctx.createRadialGradient(lx, ly, 1.0, lx, ly, 6.0);
            haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
            haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(lx, ly, 6.0, 0, Math.PI * 2);
            ctx.fill();
        }

        const lensGrad = ctx.createRadialGradient(lx, ly, 0.3, lx, ly, 2.35);
        lensGrad.addColorStop(0, '#ffffff');
        lensGrad.addColorStop(0.45, '#7dd3fc');
        lensGrad.addColorStop(0.85, '#0284c7');
        lensGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 0.55;
        ctx.stroke();

        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.arc(lx, ly, 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    ctx.restore();
}

function drawWestAutopsyTableAssembly(ctx, cx, cy, time = 0, angle = 0) {
    drawWestAutopsyTableDeckStatic(ctx, cx, cy, angle);
    drawWestAutopsyTableGlowDynamic(ctx, cx, cy, time, angle);
    drawWestAutopsyCorpseLayerStatic(ctx, cx, cy, angle);
    drawWestAutopsyRingLampsDynamic(ctx, cx, cy, time, angle);
}

function drawDetailedHeartOrgan(ctx, hx, hy, sc, hasCore, time = 0, phase = 0) {
    // 心脏搏动不变：周期约 1 秒，缩放 1.0 - 1.06，裂纹与核心呼吸 0.5 - 1.0
    const beatWave = 0.5 + 0.5 * Math.sin(time * Math.PI * 2 + phase);
    const beatScale = 1.0 + 0.06 * beatWave;
    const crackAlpha = 0.5 + 0.5 * beatWave;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(sc * beatScale, sc * beatScale);

    ctx.fillStyle = 'rgba(15, 5, 5, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0.6, 1.4, 5.4, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c1414';
    ctx.strokeStyle = '#2c0808';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-2.1, -7.0, 2.0, 2.8);
    ctx.strokeRect(-2.1, -7.0, 2.0, 2.8);
    ctx.fillRect(0.5, -6.6, 1.8, 2.5);
    ctx.strokeRect(0.5, -6.6, 1.8, 2.5);

    const hGrad = ctx.createRadialGradient(-1.2, -1.2, 0.8, 0, 0, 7.0);
    hGrad.addColorStop(0, '#991b1b');
    hGrad.addColorStop(0.65, '#7f1d1d');
    hGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.moveTo(0, 6.0);
    ctx.bezierCurveTo(-6.4, 2.5, -6.8, -4.2, -2.1, -5.0);
    ctx.bezierCurveTo(0, -5.2, 0, -3.1, 0, -3.1);
    ctx.bezierCurveTo(0, -3.1, 0, -5.2, 2.1, -5.0);
    ctx.bezierCurveTo(6.8, -4.2, 6.4, 2.5, 0, 6.0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2c0808';
    ctx.lineWidth = 0.85;
    ctx.stroke();

    ctx.strokeStyle = '#3b0707';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-0.3, -2.9);
    ctx.quadraticCurveTo(0.8, 1.1, -0.2, 5.2);
    ctx.stroke();

    ctx.strokeStyle = '#4c0519';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-1.0, -2.1); ctx.quadraticCurveTo(-3.1, -0.2, -3.6, 2.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.4, -1.5); ctx.quadraticCurveTo(2.9, 0.2, 3.5, 2.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.2, 0.8); ctx.quadraticCurveTo(-2.1, 2.4, -1.5, 4.2);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = crackAlpha;
    ctx.strokeStyle = hasCore ? '#fb923c' : '#ea580c';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(-3.1, -2.4); ctx.lineTo(-0.8, 0.2); ctx.lineTo(2.7, -1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.8, 0.2); ctx.lineTo(0.4, 3.9);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(254, 202, 202, 0.42)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(-2.3, -1.9, 2.1, -2.6, -1.1);
    ctx.stroke();

    if (hasCore) {
        const coreAlpha = 0.55 + 0.45 * beatWave;
        ctx.save();
        ctx.globalAlpha = coreAlpha;
        ctx.fillStyle = 'rgba(249, 115, 22, 0.48)';
        ctx.beginPath();
        ctx.arc(-0.4, 0.3, 2.3 + 0.35 * beatWave, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(-0.4, 0.3, 1.25 + 0.2 * beatWave, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.restore();
}

function drawWestAutopsyTrayStatic(ctx, cx, cy, trayKind, angle = 0) {
    // 0.7x 托盘 30x20：盘脚 + 外翻盘沿 + 角排水孔 + 蚀刻小标签 (HEART/TOOLS/LIVER/GUT)
    const W = 30, H = 20;
    const halfW = W / 2, halfH = H / 2;
    const tagText = trayKind === 'hearts' ? 'HEART' : (trayKind === 'organs' ? 'LIVER' : (trayKind === 'intestines' ? 'GUT' : 'TOOLS'));

    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);

    // 1) 盘脚 + 地面投影
    ctx.fillStyle = 'rgba(2, 10, 8, 0.55)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-halfW - 0.8, -halfH + 0.6, W + 1.6, H + 1.6, 2.8) : ctx.rect(-halfW - 0.8, -halfH + 0.6, W + 1.6, H + 1.6);
    ctx.fill();
    [
        [-halfW + 1.5, -halfH + 1.5], [halfW - 1.5, -halfH + 1.5],
        [-halfW + 1.5, halfH - 1.5], [halfW - 1.5, halfH - 1.5]
    ].forEach(([fx, fy]) => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.3, 0, Math.PI * 2);
        ctx.fill();
    });

    // 2) 不锈钢浅口盘外翻沿
    const rimGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    rimGrad.addColorStop(0, '#f1f5f9');
    rimGrad.addColorStop(0.5, '#cbd5e1');
    rimGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-halfW, -halfH, W, H, 2.8) : ctx.rect(-halfW, -halfH, W, H);
    ctx.fill();
    ctx.strokeStyle = '#061511';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 0.55;
    ctx.stroke();

    // 3) 内盘底 (25x15) + 四角排水孔
    const innerGrad = ctx.createLinearGradient(-halfW + 2.5, -halfH + 2.5, halfW - 2.5, halfH - 2.5);
    innerGrad.addColorStop(0, '#64748b');
    innerGrad.addColorStop(0.5, '#94a3b8');
    innerGrad.addColorStop(1, '#475569');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-halfW + 2.4, -halfH + 2.4, W - 4.8, H - 4.8, 1.8) : ctx.rect(-halfW + 2.4, -halfH + 2.4, W - 4.8, H - 4.8);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.65;
    ctx.stroke();

    [
        [-halfW + 3.6, -halfH + 3.6], [halfW - 3.6, -halfH + 3.6],
        [-halfW + 3.6, halfH - 3.6], [halfW - 3.6, halfH - 3.6]
    ].forEach(([dx, dy]) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(dx, dy, 0.55, 0, Math.PI * 2);
        ctx.fill();
    });

    // 4) 内容（按 0.64 缩放在内盘排布）
    if (trayKind === 'hearts') {
        ctx.save();
        ctx.scale(0.64, 0.64);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20, 4, 4, 0.50)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-16.5, 6.2); ctx.bezierCurveTo(-11.5, 10.6, -4.0, 3.2, 2.8, 8.2);
        ctx.stroke();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-16.5, 5.6); ctx.bezierCurveTo(-11.5, 10.0, -4.0, 2.6, 2.8, 7.6);
        ctx.stroke();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(-16.2, 5.3); ctx.bezierCurveTo(-11.5, 9.6, -4.0, 2.2, 2.5, 7.2);
        ctx.stroke();
        ctx.restore();
    } else if (trayKind === 'organs') {
        ctx.save();
        ctx.scale(0.64, 0.64);
        const liverGrad = ctx.createLinearGradient(-17, -8.5, -1, 3.5);
        liverGrad.addColorStop(0, '#6b21a8');
        liverGrad.addColorStop(0.6, '#4c1d95');
        liverGrad.addColorStop(1, '#3b0764');
        ctx.fillStyle = liverGrad;
        ctx.beginPath();
        ctx.moveTo(-17.2, 1.5);
        ctx.quadraticCurveTo(-16.5, -8.8, -5.5, -8.4);
        ctx.quadraticCurveTo(0.2, -6.6, -1.8, 0.5);
        ctx.quadraticCurveTo(-9.0, 3.5, -17.2, 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.fillRect(8.3, -9.8, 2.4, 4.4);
        [-1, 1].forEach(side => {
            const lx = 9.5 + side * 4.5;
            const lungGrad = ctx.createRadialGradient(lx - 1.0, -2.0, 0.5, lx, -0.5, 6.5);
            lungGrad.addColorStop(0, '#6b21a8');
            lungGrad.addColorStop(0.65, '#581c87');
            lungGrad.addColorStop(1, '#3b0764');
            ctx.fillStyle = lungGrad;
            ctx.beginPath();
            ctx.ellipse(lx, -0.5, 3.8, 6.1, side * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2e1065';
            ctx.lineWidth = 0.75;
            ctx.stroke();
        });
        ctx.restore();
    } else if (trayKind === 'intestines') {
        ctx.save();
        ctx.scale(0.64, 0.64);
        const bowelLoops = [
            { x0: -15.5, y0: -5.5, cx: -11.5, cy: -10.5, x1: -7.5, y1: -5.2 },
            { x0: -7.5, y0: -5.2, cx: -3.5, cy: 0.2, x1: 0.5, y1: -5.0 },
            { x0: 0.5, y0: -5.0, cx: 4.5, cy: -10.2, x1: 8.2, y1: -4.8 },
            { x0: -15.2, y0: 0.2, cx: -11.2, cy: -4.5, x1: -7.2, y1: 0.5 },
            { x0: -7.2, y0: 0.5, cx: -3.2, cy: 5.5, x1: 0.8, y1: 0.5 },
            { x0: 0.8, y0: 0.5, cx: 4.8, cy: -4.2, x1: 8.5, y1: 1.0 },
            { x0: -14.8, y0: 5.5, cx: -10.8, cy: 1.2, x1: -6.8, y1: 6.0 },
            { x0: -6.8, y0: 6.0, cx: -2.8, cy: 10.6, x1: 1.2, y1: 5.8 },
            { x0: 1.2, y0: 5.8, cx: 5.2, cy: 1.5, x1: 9.0, y1: 6.2 }
        ];
        ctx.lineCap = 'round';
        bowelLoops.forEach((lp, idx) => {
            ctx.strokeStyle = '#2e1065';
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(lp.x0, lp.y0);
            ctx.quadraticCurveTo(lp.cx, lp.cy, lp.x1, lp.y1);
            ctx.stroke();
            ctx.strokeStyle = (idx % 2 === 0) ? '#6b21a8' : '#7e22ce';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(lp.x0, lp.y0);
            ctx.quadraticCurveTo(lp.cx, lp.cy, lp.x1, lp.y1);
            ctx.stroke();
        });
        const gbGrad = ctx.createRadialGradient(13.2, -5.2, 0.6, 14.0, -4.4, 4.5);
        gbGrad.addColorStop(0, '#6ee7b7');
        gbGrad.addColorStop(0.55, '#10b981');
        gbGrad.addColorStop(1, '#065f46');
        ctx.fillStyle = gbGrad;
        ctx.beginPath();
        ctx.ellipse(14.0, -4.4, 3.8, 2.5, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else {
        // TOOLS：解剖刀x2 + 手术刀柄 + 手术剪 + 镊子 + 止血钳 + 缝合针 + 持针器
        ctx.save();
        ctx.scale(0.64, 0.64);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.65;

        // 解剖刀 x2 + 额外手术刀柄
        [-16.2, -11.4].forEach(sx => {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(sx - 1.0, -2.0, 2.0, 10.5);
            ctx.strokeRect(sx - 1.0, -2.0, 2.0, 10.5);
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(sx - 0.8, -2.0);
            ctx.lineTo(sx - 0.8, -8.5);
            ctx.quadraticCurveTo(sx + 1.8, -6.2, sx + 0.8, -2.0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
        // 备用手术刀柄（带刻槽与接口）
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-7.2, -7.8, 1.8, 15.5);
        ctx.strokeRect(-7.2, -7.8, 1.8, 15.5);

        // 手术剪
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-2.5, -8.2); ctx.lineTo(1.2, 3.8);
        ctx.moveTo(1.2, -8.2); ctx.lineTo(-2.5, 3.8);
        ctx.stroke();
        [-2.8, 1.5].forEach(rx => {
            ctx.fillStyle = '#cbd5e1';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.arc(rx, 6.5, 2.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // 镊子
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(5.6, -8.2); ctx.lineTo(4.1, 7.6);
        ctx.moveTo(5.6, -8.2); ctx.lineTo(7.1, 7.6);
        ctx.stroke();

        // 止血钳
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.6;
        ctx.fillRect(9.5, -8.2, 2.0, 12.2);
        ctx.strokeRect(9.5, -8.2, 2.0, 12.2);
        [8.7, 12.2].forEach(rx => {
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(rx, 6.5, 1.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // 持针器 + 弯缝合针（最东侧）
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(15.0, -5.5, 1.8, 12.5);
        ctx.strokeRect(15.0, -5.5, 1.8, 12.5);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(15.8, -7.2, 2.4, 0.2, Math.PI * 1.15);
        ctx.stroke();
        ctx.restore();
    }

    // 5) 蚀刻小标签 (HEART / TOOLS / LIVER / GUT，最小字号 >= 2.4px)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(-10.5, halfH - 3.6, 21, 3.3);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(tagText, 0, halfH - 1.9);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestAutopsyTrayDynamic(ctx, cx, cy, trayKind, time, angle = 0) {
    __dynDrawCached(ctx, 'drawWestAutopsyTrayDynamic', 90, 90, cx, cy, (octx) => drawWestAutopsyTrayDynamicImpl(octx, cx, cy, trayKind, time, angle));
}
function drawWestAutopsyTrayDynamicImpl(ctx, cx, cy, trayKind, time, angle = 0) {
    if (trayKind === 'tools') return;

    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);
    ctx.scale(0.64, 0.64);

    if (trayKind === 'hearts') {
        drawDetailedHeartOrgan(ctx, -8.2, -2.0, 1.00, true, time, 0.0);
        drawDetailedHeartOrgan(ctx, 8.8, -4.5, 0.66, false, time, 2.1);
        drawDetailedHeartOrgan(ctx, 10.2, 4.6, 0.63, false, time, 4.2);
    } else if (trayKind === 'organs') {
        const arcaneVessels = [
            { x0: -14.5, y0: 6.2, cx: -6.0, cy: 9.8, x1: 3.5, y1: 6.8, glow: 'rgba(16,185,129,0.42)', core: '#34d399' },
            { x0: 3.5, y0: 6.8, cx: 9.5, cy: 5.0, x1: 15.5, y1: 8.0, glow: 'rgba(16,185,129,0.42)', core: '#34d399' },
            { x0: -9.5, y0: 7.4, cx: -4.5, cy: 4.5, x1: 0.5, y1: 3.2, glow: 'rgba(52,211,153,0.38)', core: '#6ee7b7' },
            { x0: -9.0, y0: -4.2, cx: -1.5, cy: -2.2, x1: 4.2, y1: 0.8, glow: 'rgba(192,132,252,0.45)', core: '#e9d5ff' },
            { x0: 4.2, y0: 0.8, cx: 7.5, cy: -1.5, x1: 12.2, y1: -2.8, glow: 'rgba(192,132,252,0.45)', core: '#d8b4fe' },
            { x0: -4.2, y0: -1.8, cx: -1.2, cy: 2.2, x1: 1.2, y1: 5.5, glow: 'rgba(168,85,247,0.40)', core: '#c084fc' }
        ];
        ctx.lineCap = 'round';
        arcaneVessels.forEach((v, idx) => {
            const pulseA = 0.75 + 0.25 * Math.sin(time * Math.PI + idx * 0.55);
            ctx.save();
            ctx.globalAlpha = pulseA;
            ctx.strokeStyle = v.glow;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(v.x0, v.y0);
            ctx.quadraticCurveTo(v.cx, v.cy, v.x1, v.y1);
            ctx.stroke();
            ctx.strokeStyle = v.core;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(v.x0, v.y0);
            ctx.quadraticCurveTo(v.cx, v.cy, v.x1, v.y1);
            ctx.stroke();
            ctx.restore();
        });
    } else if (trayKind === 'intestines') {
        const gbPulse = 0.75 + 0.25 * Math.sin(time * Math.PI + 0.8);
        ctx.save();
        ctx.globalAlpha = gbPulse;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.34)';
        ctx.beginPath();
        ctx.ellipse(13.8, -4.5, 4.6, 3.4, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d1fae5';
        ctx.beginPath();
        ctx.ellipse(13.4, -5.0, 1.3, 0.75, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        [
            { x0: -12.5, y0: -7.2, cx: -8.0, cy: -2.0, x1: -3.8, y1: 1.5, c: '#c084fc' },
            { x0: -4.2, y0: -6.5, cx: 0.5, cy: -1.8, x1: 5.0, y1: -5.5, c: '#34d399' },
            { x0: -10.5, y0: 3.5, cx: -6.0, cy: 7.5, x1: -1.5, y1: 4.2, c: '#e9d5ff' },
            { x0: 1.2, y0: 2.5, cx: 5.5, cy: 6.2, x1: 9.8, y1: 3.5, c: '#34d399' }
        ].forEach((v, idx) => {
            ctx.save();
            ctx.globalAlpha = 0.75 + 0.25 * Math.sin(time * Math.PI + idx * 0.7);
            ctx.strokeStyle = v.c;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(v.x0, v.y0);
            ctx.quadraticCurveTo(v.cx, v.cy, v.x1, v.y1);
            ctx.stroke();
            ctx.restore();
        });
    }

    ctx.restore();
}

function drawWestAutopsyTray(ctx, cx, cy, trayKind, time = 0, angle = 0) {
    drawWestAutopsyTrayStatic(ctx, cx, cy, trayKind, angle);
    drawWestAutopsyTrayDynamic(ctx, cx, cy, trayKind, time, angle);
}

function getWestAutopsyTableObstacle(cx, cy, angle = 0) {
    const W = 140;
    const H = 45;
    const halfW = W / 2;
    const halfH = H / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const worldPts = angle ? [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    })) : null;

    const obs = {
        type: 'solid',
        cx: cx,
        cy: cy,
        label: 'WEST AUTOPSY TABLE',
        displayName: 'FORENSIC AUTOPSY TABLE',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 200 < camX || cx - 200 > camX + vw || cy + 180 < camY || cy - 180 > camY + vh) return;

            const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
            const cw = 360, ch = 320;

            const deckKey = '__westAutopsyDeckV5_' + cx + '_' + cy + '_' + angle;
            if (!window[deckKey]) {
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestAutopsyTableDeckStatic(octx, cx, cy, angle);
                octx.restore();
                window[deckKey] = { canvas: off, w: cw, h: ch };
            }

            const corpseKey = '__westAutopsyCorpseV5_' + cx + '_' + cy + '_' + angle;
            if (!window[corpseKey]) {
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestAutopsyCorpseLayerStatic(octx, cx, cy, angle);
                octx.restore();
                window[corpseKey] = { canvas: off, w: cw, h: ch };
            }

            const time = Date.now() * 0.001;
            const dCache = window[deckKey];
            const cCache = window[corpseKey];

            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(dCache.canvas, cx - dCache.w / 2, cy - dCache.h / 2, dCache.w, dCache.h);
            drawWestAutopsyTableGlowDynamic(ctx, cx, cy, time, angle);
            ctx.drawImage(cCache.canvas, cx - cCache.w / 2, cy - cCache.h / 2, cCache.w, cCache.h);
            drawWestAutopsyRingLampsDynamic(ctx, cx, cy, time, angle);
            ctx.restore();
        }
    };
    if (worldPts) {
        obs.points = worldPts;
    } else {
        obs.x = cx - halfW;
        obs.y = cy - halfH;
        obs.w = W;
        obs.h = H;
    }
    return obs;
}

function getWestAutopsyTrayObstacle(cx, cy, trayKind, label, angle = 0) {
    const W = 30;
    const H = 20;
    const halfW = W / 2;
    const halfH = H / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const worldPts = angle ? [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    })) : null;

    const obs = {
        type: 'solid',
        cx: cx,
        cy: cy,
        label: label,
        displayName: label,
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 45 < camX || cx - 45 > camX + vw || cy + 45 < camY || cy - 45 > camY + vh) return;

            const cacheKey = '__westAutopsyTrayV5_' + trayKind + '_' + cx + '_' + cy + '_' + angle;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 52, ch = 52;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestAutopsyTrayStatic(octx, cx, cy, trayKind, angle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestAutopsyTrayDynamic(ctx, cx, cy, trayKind, time, angle);
            ctx.restore();
        }
    };
    if (worldPts) {
        obs.points = worldPts;
    } else {
        obs.x = cx - halfW;
        obs.y = cy - halfH;
        obs.w = W;
        obs.h = H;
    }
    return obs;
}

// =========================================================================
// 解剖室地面设施：水桶 (14x14 solid)、踏凳 (20x14 solid)、盘管 (Ø24 无碰撞)、器械推车 + 4 培养皿 (50x36 solid)
// =========================================================================
function drawWestBucketStatic(ctx, cx, cy, angle = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);
    // 地面投影
    ctx.fillStyle = 'rgba(2, 10, 8, 0.52)';
    ctx.beginPath();
    ctx.ellipse(0.6, 1.2, 7.6, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 桶身 (Ø14 -> r = 7)
    const bGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
    bGrad.addColorStop(0, '#e2e8f0');
    bGrad.addColorStop(0.65, '#94a3b8');
    bGrad.addColorStop(1, '#475569');
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 桶内浑浊清洗水
    ctx.fillStyle = '#0f3d3e';
    ctx.beginPath();
    ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(-0.5, -0.5, 3.6, -2.5, -1.0);
    ctx.stroke();
    // 不锈钢提手弧
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(0, 0, 7.3, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
    ctx.restore();
}

function getWestBucketObstacle(cx, cy, angle = 0) {
    const half = 7;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const worldPts = angle ? [
        { x: -half, y: -half },
        { x: half, y: -half },
        { x: half, y: half },
        { x: -half, y: half }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    })) : null;

    const obs = {
        type: 'solid',
        cx: cx, cy: cy,
        label: 'WEST MOP BUCKET',
        displayName: 'CLEANING BUCKET',
        hideLabel: true,
        draw: (ctx) => {
            const k = '__westBucketV5_' + cx + '_' + cy + '_' + angle;
            if (!window[k]) {
                const SS = 2, cw = 30, ch = 30; // 2026-11-21 优化：超采样 4→2;
                const off = document.createElement('canvas');
                off.width = cw * SS; off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save(); octx.scale(SS, SS); octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBucketStatic(octx, cx, cy, angle);
                octx.restore();
                window[k] = { canvas: off, w: cw, h: ch };
            }
            const c = window[k];
            ctx.save();
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            ctx.restore();
        }
    };
    if (worldPts) {
        obs.points = worldPts;
    } else {
        obs.x = cx - half; obs.y = cy - half; obs.w = 14; obs.h = 14;
    }
    return obs;
}

function drawWestStepStoolStatic(ctx, cx, cy, angle = 0) {
    // 20x14 两级不锈钢踏凳
    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);
    ctx.fillStyle = 'rgba(2, 10, 8, 0.52)';
    ctx.fillRect(-10.5, -6.5, 21, 14.5);
    // 4 支脚胶垫
    [[-9.5, -6.5], [7.5, -6.5], [-9.5, 4.5], [7.5, 4.5]].forEach(([lx, ly]) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(lx, ly, 2.2, 2.2);
    });
    // 下级踏板 (19x6.5 @ y ∈ [0.5, +7])
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-9.5, 0.4, 19, 6.4);
    ctx.strokeRect(-9.5, 0.4, 19, 6.4);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8.0, 1.5, 16, 4.0);
    // 上级踏板 (19x7 @ y ∈ [-7, 0])
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-9.5, -7.0, 19, 7.0);
    ctx.strokeRect(-9.5, -7.0, 19, 7.0);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8.0, -5.8, 16, 4.6);
    // 防滑凹槽纹理
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    [-4.4, -3.1, 2.8, 4.1].forEach(ry => {
        ctx.beginPath(); ctx.moveTo(-7.2, ry); ctx.lineTo(7.2, ry); ctx.stroke();
    });
    ctx.restore();
}

function getWestStepStoolObstacle(cx, cy, angle = 0) {
    const W = 20, H = 14;
    const halfW = W / 2, halfH = H / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const worldPts = angle ? [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    })) : null;

    const obs = {
        type: 'solid',
        cx: cx, cy: cy,
        label: 'WEST STEP STOOL',
        displayName: 'TWO-STEP STOOL',
        hideLabel: true,
        draw: (ctx) => {
            const k = '__westStepStoolV5_' + cx + '_' + cy + '_' + angle;
            if (!window[k]) {
                const SS = 2, cw = 36, ch = 36; // 2026-11-21 优化：超采样 4→2;
                const off = document.createElement('canvas');
                off.width = cw * SS; off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save(); octx.scale(SS, SS); octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestStepStoolStatic(octx, cx, cy, angle);
                octx.restore();
                window[k] = { canvas: off, w: cw, h: ch };
            }
            const c = window[k];
            ctx.save();
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            ctx.restore();
        }
    };
    if (worldPts) {
        obs.points = worldPts;
    } else {
        obs.x = cx - halfW; obs.y = cy - halfH; obs.w = W; obs.h = H;
    }
    return obs;
}

function drawWestCoiledHoseProp(ctx, cx, cy) {
    // 地面一卷盘管 (直径 24 @ 680,1330，无碰撞)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(2, 10, 8, 0.42)';
    ctx.beginPath();
    ctx.arc(0.8, 1.2, 12.2, 0, Math.PI * 2);
    ctx.fill();
    [11.0, 8.6, 6.2, 4.0].forEach((r, idx) => {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, r, idx * 0.4, idx * 0.4 + Math.PI * 1.85);
        ctx.stroke();

        ctx.strokeStyle = (idx % 2 === 0) ? '#047857' : '#10b981';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, r, idx * 0.4, idx * 0.4 + Math.PI * 1.85);
        ctx.stroke();
    });
    // 铜制快接头与喷嘴末端
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(8.5, 4.0, 4.0, 2.4);
    ctx.strokeRect(8.5, 4.0, 4.0, 2.4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(12.2, 4.3, 3.0, 1.8);
    ctx.restore();
}

function getWestCoiledHoseProp(cx, cy) {
    return {
        x: cx - 14, y: cy - 14, w: 28, h: 28,
        noCollision: true,
        hideLabel: true,
        draw: (ctx) => {
            const k = '__westCoiledHoseV5_' + cx + '_' + cy;
            if (!window[k]) {
                const SS = 2, cw = 44, ch = 44; // 2026-11-21 优化：超采样 4→2;
                const off = document.createElement('canvas');
                off.width = cw * SS; off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save(); octx.scale(SS, SS); octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestCoiledHoseProp(octx, cx, cy);
                octx.restore();
                window[k] = { canvas: off, w: cw, h: ch };
            }
            const c = window[k];
            ctx.save();
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            ctx.restore();
        }
    };
}

function drawWestToolCartStatic(ctx, cx, cy, angle = 0) {
    // 器械推车 50x36 @ (420, 1300)：4脚轮(Ø5) + 下层搁板(试剂瓶x2+叠布x1) + 上层不锈钢台面 + 西侧推把 + 侧栏杆 + 4 培养皿
    const W = 50, H = 36;
    const hw = W / 2, hh = H / 2; // 25, 18
    ctx.save();
    ctx.translate(cx, cy);
    if (angle) ctx.rotate(angle);

    // 1) 地面阴影 + 4 个脚轮 (直径 5 -> r=2.5，探出四角)
    ctx.fillStyle = 'rgba(2, 10, 8, 0.56)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-hw - 2, -hh + 1.5, W + 4, H + 5, 3) : ctx.rect(-hw - 2, -hh + 1.5, W + 4, H + 5);
    ctx.fill();
    [[-22.5, -17.5], [22.5, -17.5], [-22.5, 17.5], [22.5, 17.5]].forEach(([wx, wy]) => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(wx, wy, 1.1, 0, Math.PI * 2);
        ctx.fill();
    });

    // 2) 下层搁板（略微南错立体展现：试剂瓶 2 个 + 叠布 1 叠）
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-hw + 3, hh - 1.5, W - 6, 4.8);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-hw + 3, hh - 1.5, W - 6, 4.8);
    // 2 个试剂瓶
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-17, hh - 0.6, 3.6, 3.4);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-11.5, hh - 0.6, 3.6, 3.4);
    // 1 叠白蓝外科布
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(8, hh - 0.5, 11, 3.0);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(9, hh - 1.2, 9, 1.3);

    // 3) 西侧推把 (U 形不锈钢推手)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-hw, -12);
    ctx.lineTo(-hw - 5.2, -12);
    ctx.lineTo(-hw - 5.2, 12);
    ctx.lineTo(-hw, 12);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(-hw, -12);
    ctx.lineTo(-hw - 5.2, -12);
    ctx.lineTo(-hw - 5.2, 12);
    ctx.lineTo(-hw, 12);
    ctx.stroke();

    // 4) 上层不锈钢台面 (50x36) + 蓝色点缀边缘线
    const cartGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    cartGrad.addColorStop(0, '#cbd5e1');
    cartGrad.addColorStop(0.5, '#f1f5f9');
    cartGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = cartGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-hw, -hh, W, H, 2.5) : ctx.rect(-hw, -hh, W, H);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-hw + 1.6, -hh + 1.6, W - 3.2, H - 3.2);

    // 侧栏杆（南北两条金属栏杆 + 固定柱）
    [-hh + 1.2, hh - 1.2].forEach(ry => {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-hw + 4, ry);
        ctx.lineTo(hw - 4, ry);
        ctx.stroke();
        [-hw + 4, 0, hw - 4].forEach(px => {
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(px, ry, 1.0, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // 5) 4 个培养皿 (直径 12-16，2x2 摆放，淡黄/淡粉/淡绿/淡蓝琼脂 + 菌落 + 1 个半开皿盖 + A1/A2/B1/B2)
    const dishes = [
        { dx: -10.5, dy: -7.2, r: 6.5, agar: '#fef9c3', col: '#eab308', id: 'A1', halfOpen: false, dots: [[-2,-1.5],[1.8,-2.2],[0.5,1.8],[-2.5,2.2]] },
        { dx: 10.5, dy: -7.2, r: 7.0, agar: '#fce7f3', col: '#ec4899', id: 'A2', halfOpen: false, dots: [[-2.2,-1.2],[2.0,0.4],[-0.5,2.4],[2.4,-2.0],[0.2,-0.5]] },
        { dx: -10.5, dy: 7.2, r: 6.5, agar: '#dcfce7', col: '#10b981', id: 'B1', halfOpen: false, dots: [[-1.8,-2.0],[2.2,1.6],[-0.8,2.0],[1.5,-1.8]] },
        { dx: 10.5, dy: 7.2, r: 7.2, agar: '#e0f2fe', col: '#0284c7', id: 'B2', halfOpen: true, dots: [[-2.4,-0.8],[1.8,-1.8],[0.6,2.1],[-1.0,2.5],[2.6,0.9],[0.0,-0.2]] }
    ];
    dishes.forEach(d => {
        // 玻璃皿外圈与内琼脂面
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(d.dx, d.dy, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = d.agar;
        ctx.beginPath();
        ctx.arc(d.dx, d.dy, d.r - 1.0, 0, Math.PI * 2);
        ctx.fill();

        // 菌落小点簇
        d.dots.forEach(([ox, oy], k) => {
            ctx.fillStyle = d.col;
            ctx.beginPath();
            ctx.arc(d.dx + ox, d.dy + oy, 0.75 + (k % 2) * 0.35, 0, Math.PI * 2);
            ctx.fill();
        });

        // 皿底小标签 (A1/A2/B1/B2，>= 2.4px)
        ctx.font = 'bold 2.4px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(d.id, d.dx, d.dy + d.r - 2.2);

        // 玻璃圆弧反光高光
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.arc(d.dx, d.dy, d.r - 1.5, -2.5, -1.1);
        ctx.stroke();

        // 1 个皿盖半开（斜靠在皿边）
        if (d.halfOpen) {
            ctx.save();
            ctx.translate(d.dx + 4.8, d.dy - 2.4);
            ctx.rotate(0.45);
            ctx.fillStyle = 'rgba(224, 242, 254, 0.38)';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.ellipse(0, 0, d.r * 0.96, d.r * 0.52, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    });

    ctx.restore();
}

function getWestToolCartObstacle(cx, cy, angle = 0) {
    const W = 50, H = 36;
    const halfW = W / 2, halfH = H / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const worldPts = angle ? [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    })) : null;

    const obs = {
        type: 'solid',
        cx: cx, cy: cy,
        label: 'WEST TOOL CART',
        displayName: 'SPECIMEN TOOL CART',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 55 < camX || cx - 55 > camX + vw || cy + 55 < camY || cy - 55 > camY + vh) return;
            const k = '__westToolCartV5_' + cx + '_' + cy + '_' + angle;
            if (!window[k]) {
                const SS = 2, cw = 96, ch = 96; // 2026-11-21 优化：超采样 4→2;
                const off = document.createElement('canvas');
                off.width = cw * SS; off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save(); octx.scale(SS, SS); octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestToolCartStatic(octx, cx, cy, angle);
                octx.restore();
                window[k] = { canvas: off, w: cw, h: ch };
            }
            const c = window[k];
            ctx.save();
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            ctx.restore();
        }
    };
    if (worldPts) {
        obs.points = worldPts;
    } else {
        obs.x = cx - halfW; obs.y = cy - halfH; obs.w = W; obs.h = H;
    }
    return obs;
}

// =========================================================================
// Level 8 西侧三角房 · 0.7x 四联胶囊型培养舱系统 (182x114 @ 612,959)
// 单舱 42x114：6px 厚不锈钢外壳(r=21) -> 玻璃(r=15) -> 液体(r=14)，三层同轴胶囊型
// 屏内置于胶囊南端壳内 (20x8 @ ly=+42)，颈部倒 C 释放闸，短接墙管总高 <= 12px
// =========================================================================
function traceStadiumPath(ctx, cx, ycTop, ycBot, r) {
    ctx.beginPath();
    ctx.arc(cx, ycTop, r, Math.PI, 0, false);
    ctx.lineTo(cx + r, ycBot);
    ctx.arc(cx, ycBot, r, 0, Math.PI, false);
    ctx.closePath();
}

function drawQuadPodDemonFull(ctx, time, seed) {
    // 复用恶魔结构，按 ~68px 等比体量（对齐 Cerberus 68px，翼收拢漂浮于 34x80 胶囊液中）
    const floatY = Math.sin(time * 1.15 + seed) * 1.2;
    const swayA = Math.sin(time * 0.75 + seed) * 0.03;
    const wingPulse = Math.sin(time * 1.3 + seed) * 0.9;

    ctx.save();
    ctx.translate(0, 2.5 + floatY);
    ctx.rotate(swayA);
    ctx.scale(0.69, 0.71); // ~68px 高, ~30px 宽

    // 1) 生物周围渗色微光晕
    const auraAlpha = 0.20 + 0.08 * Math.sin(time * 2.0 + seed);
    const auraGrad = ctx.createRadialGradient(0, 4, 2, 0, 4, 24);
    auraGrad.addColorStop(0, `rgba(249, 115, 22, ${auraAlpha.toFixed(2)})`);
    auraGrad.addColorStop(0.6, `rgba(220, 38, 38, ${(auraAlpha * 0.45).toFixed(2)})`);
    auraGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 4, 24, 0, Math.PI * 2);
    ctx.fill();

    // 2) 收拢双翼
    [-1, 1].forEach(side => {
        const wGrad = ctx.createLinearGradient(side * 4, -38, side * 20, 34);
        wGrad.addColorStop(0, '#450a0a');
        wGrad.addColorStop(0.55, '#2b0404');
        wGrad.addColorStop(1, '#180202');
        ctx.fillStyle = wGrad;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(side * 5, -18);
        ctx.quadraticCurveTo(side * (21 + wingPulse), -40, side * (20 + wingPulse), -12);
        ctx.quadraticCurveTo(side * (19 + wingPulse * 0.6), 14, side * 14, 34);
        ctx.quadraticCurveTo(side * 9, 18, side * 5, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(side * 5, -16); ctx.lineTo(side * (19 + wingPulse), -34);
        ctx.moveTo(side * 5, -10); ctx.lineTo(side * (19 + wingPulse), -8);
        ctx.moveTo(side * 6, 0); ctx.lineTo(side * 15, 26);
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(side * (17 + wingPulse), -40, 1.3, 0, Math.PI * 2);
        ctx.fill();
    });

    // 3) 尾棘与四肢
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.quadraticCurveTo(-5, -32, 2, -41);
    ctx.stroke();
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(2, -41); ctx.lineTo(-1.5, -46); ctx.lineTo(5.2, -44);
    ctx.closePath();
    ctx.fill();

    [
        { x: -9.5, y: -21, r: 4.8, cx: -12, cy: -30 },
        { x: 9.5, y: -21, r: 4.8, cx: 12, cy: -30 },
        { x: -11.5, y: 14, r: 5.4, cx: -14, cy: 25 },
        { x: 11.5, y: 14, r: 5.4, cx: 14, cy: 25 }
    ].forEach(limb => {
        ctx.fillStyle = '#180202';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(limb.x, limb.y, limb.r * 0.9, limb.r * 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#290404';
        ctx.beginPath();
        ctx.arc(limb.cx, limb.cy, limb.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#ff3300';
        ctx.lineWidth = 1.2;
        const dirY = limb.cy > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(limb.cx - 1.6, limb.cy + dirY * 2);
        ctx.lineTo(limb.cx - 2.3, limb.cy + dirY * 7);
        ctx.moveTo(limb.cx + 1.6, limb.cy + dirY * 2);
        ctx.lineTo(limb.cx + 2.3, limb.cy + dirY * 7);
        ctx.stroke();
    });

    // 4) 躯干与发光核心
    const torsoGrad = ctx.createLinearGradient(-12, -22, 12, 18);
    torsoGrad.addColorStop(0, '#090101');
    torsoGrad.addColorStop(0.5, '#2b0606');
    torsoGrad.addColorStop(1, '#120202');
    ctx.fillStyle = torsoGrad;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -1, 13.0, 21.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 0.8;
    [-11, -4, 3, 10].forEach(ry => {
        ctx.beginPath();
        ctx.moveTo(-8, ry);
        ctx.quadraticCurveTo(0, ry + 2.2, 8, ry);
        ctx.stroke();
    });

    const coreGlow = 0.55 + 0.35 * Math.sin(time * 2.4 + seed);
    ctx.fillStyle = `rgba(249, 115, 22, ${coreGlow.toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(0, 3, 6.2, 9.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5) 头颅、双角、炽红双目、獠牙血口
    ctx.fillStyle = '#080101';
    ctx.strokeStyle = '#ff2200';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 23.5, 10.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    [-1, 1].forEach(side => {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(side * 5.8, 19.5);
        ctx.quadraticCurveTo(side * 20, 12, side * 17.5, -2);
        ctx.stroke();
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(side * 17.5, -2, 1.8, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-5.2, 24.5, 3.4, 2.3);
    ctx.fillRect(1.8, 24.5, 3.4, 2.3);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4.1, 25.0, 1.2, 1.2);
    ctx.fillRect(2.9, 25.0, 1.2, 1.2);

    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-4.5, 29.8); ctx.lineTo(0, 37.5); ctx.lineTo(4.5, 29.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-3.4, 29.8); ctx.lineTo(-2.1, 33.2); ctx.lineTo(-0.9, 29.8);
    ctx.moveTo(0.9, 29.8); ctx.lineTo(2.1, 33.2); ctx.lineTo(3.4, 29.8);
    ctx.fill();

    ctx.restore();
}

function drawQuadPodCerberusFull(ctx, time, seed) {
    // 复用 engine.js Cerberus 模型，严格 68px 长漂浮舒展姿态，结构齐全
    const floatY = Math.sin(time * 1.05 + seed) * 1.2;
    const swayA = Math.sin(time * 0.72 + seed) * 0.025;

    ctx.save();
    ctx.translate(0, 3 + floatY);
    ctx.rotate(Math.PI / 2 + swayA); // +x 指向南端观察面 (+y)
    ctx.scale(0.695, 0.64); // 长 98 * 0.695 ≈ 68.1px，宽 46 * 0.64 ≈ 29.4px (稳在 34px 液宽内)

    // 1) 生物周围熔岩渗光微晕
    const auraAlpha = 0.22 + 0.08 * Math.sin(time * 1.8 + seed);
    const auraGrad = ctx.createRadialGradient(8, 0, 2, 8, 0, 26);
    auraGrad.addColorStop(0, `rgba(249, 115, 22, ${auraAlpha.toFixed(2)})`);
    auraGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(8, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // 2) 四肢与利爪
    [-1, 1].forEach(side => {
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(-15, side * 13.5, 7.6, 4.6, side * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.arc(-19.5, side * 16.5, 4.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-21, side * 16.0); ctx.lineTo(-25, side * 17.2);
        ctx.moveTo(-20.5, side * 17.6); ctx.lineTo(-24, side * 18.8);
        ctx.stroke();

        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(11, side * 14.5, 8.2, 5.0, -side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.arc(17, side * 16.8, 4.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(19, side * 16.0); ctx.lineTo(24, side * 16.8);
        ctx.moveTo(18.5, side * 18.0); ctx.lineTo(23, side * 19.2);
        ctx.stroke();
    });

    // 3) 分节龙尾与蛇首
    const tailPts = [
        { x: -19, y: 0, r: 3.1 },
        { x: -25, y: 2.6, r: 2.6 },
        { x: -31, y: 4.0, r: 2.2 },
        { x: -37, y: 2.2, r: 1.8 },
        { x: -42.5, y: -1.4, r: 1.5 },
        { x: -46.5, y: -4.2, r: 1.2 }
    ];
    for (let i = 0; i < tailPts.length - 1; i++) {
        const p1 = tailPts[i], p2 = tailPts[i + 1];
        ctx.fillStyle = (i % 2 === 0) ? '#18181b' : '#27272a';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.ellipse((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5, 4.0, p1.r, Math.atan2(p2.y - p1.y, p2.x - p1.x), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - 0.8);
        ctx.lineTo(p1.x - 1.5, p1.y - p1.r - 1.6);
        ctx.lineTo(p1.x - 2.8, p1.y - 0.6);
        ctx.closePath();
        ctx.fill();
    }
    ctx.save();
    ctx.translate(-47.5, -5.0);
    ctx.rotate(Math.PI + 0.6);
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(0, -3.0); ctx.lineTo(7.2, 0); ctx.lineTo(0, 3.0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(2.8, -1.2, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4) 黑曜石躯干 + 熔岩肋脉 + 骨脊
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(2, 0, 22, 13.8, 0, 0, Math.PI * 2);
    ctx.fill();

    const tGrad = ctx.createLinearGradient(-16, 0, 18, 0);
    tGrad.addColorStop(0, '#09090b');
    tGrad.addColorStop(0.45, '#27272a');
    tGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.ellipse(3, 0, 19.5, 11.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    [-8, -2, 4, 10].forEach(vx => {
        ctx.moveTo(vx, -7.2); ctx.lineTo(vx + 2.6, 0); ctx.lineTo(vx, 7.2);
    });
    ctx.stroke();

    ctx.fillStyle = '#52525b';
    for (let sx = -13; sx <= 11; sx += 6) {
        ctx.beginPath();
        ctx.moveTo(sx, -2.2); ctx.lineTo(sx + 3.0, 0); ctx.lineTo(sx, 2.2); ctx.lineTo(sx - 1.3, 0);
        ctx.closePath();
        ctx.fill();
    }

    // 5) 颈肩蛇毛
    [
        { bx: 7, by: -9.5, ex: 13, ey: -16 },
        { bx: 11, by: -7.5, ex: 17.5, ey: -14 },
        { bx: 7, by: 9.5, ex: 13, ey: 16 },
        { bx: 11, by: 7.5, ex: 17.5, ey: 14 }
    ].forEach((sn, idx) => {
        ctx.strokeStyle = (idx % 2 === 0) ? '#18181b' : '#450a0a';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(sn.bx, sn.by);
        ctx.quadraticCurveTo((sn.bx + sn.ex) * 0.5, sn.by * 1.15, sn.ex, sn.ey);
        ctx.stroke();
        ctx.fillStyle = '#3b0f0f';
        ctx.beginPath();
        ctx.arc(sn.ex, sn.ey, 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(sn.ex + 0.6, sn.ey, 0.6, 0, Math.PI * 2);
        ctx.fill();
    });

    // 6) 三颗地狱犬首
    [
        { hx: 16, hy: -11.5, ang: -0.46, isAlpha: false },
        { hx: 16, hy: 11.5, ang: 0.46, isAlpha: false },
        { hx: 21.5, hy: 0, ang: 0, isAlpha: true }
    ].forEach(h => {
        ctx.save();
        ctx.translate(h.hx, h.hy);
        ctx.rotate(h.ang);
        ctx.scale(h.isAlpha ? 1.18 : 0.94, h.isAlpha ? 1.18 : 0.94);

        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.ellipse(-5, 0, 7.2, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 0.8;
        [-1, 1].forEach(s => {
            ctx.beginPath();
            ctx.moveTo(-2, s * 4.5);
            ctx.quadraticCurveTo(-7, s * 10, -12, s * 12);
            ctx.quadraticCurveTo(-6, s * 7, 0, s * 3.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(-4, -4.5); ctx.lineTo(8, -3.5); ctx.lineTo(14, 0); ctx.lineTo(8, 3.5); ctx.lineTo(-4, 4.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(8.5, 0, 5.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(9.5, 0, 3.8, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(8.2, -2.3); ctx.lineTo(10.0, -2.3); ctx.lineTo(9.1, -0.5); ctx.closePath();
        ctx.moveTo(8.2, 2.3); ctx.lineTo(10.0, 2.3); ctx.lineTo(9.1, 0.5); ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(3.8, -2.8, h.isAlpha ? 1.5 : 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3.5, -3.5, 0.5, 1.5);
        ctx.restore();
    });

    ctx.restore();
}

function drawQuadPodSmallValve(ctx, hx, hy) {
    // 管道手轮阀门（直径 8 -> r = 4，圆环 + 4 辐 + 阀杆，区别于大型拉杆释放闸）
    const r = 4.0;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(hx - r + 0.6, hy); ctx.lineTo(hx + r - 0.6, hy);
    ctx.moveTo(hx, hy - r + 0.6); ctx.lineTo(hx, hy + r - 0.6);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(hx, hy, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawQuadPodReleaseGate(ctx, bx, gy, flipped = false) {
    // 手动释放闸（非阀门！）：12x5 横闸槽 + 闸板 + PULL 小牌 + 倒扣弧形把手
    // flipped=false 时弧顶朝向北墙 -y；flipped=true 时上下颠倒，弧顶朝向 +y 舱体一侧（PULL 文字保持正立）
    ctx.save();
    if (flipped) {
        ctx.translate(bx, gy);
        ctx.scale(1, -1);
        ctx.translate(-bx, -gy);
    }

    // 1) 闸槽 12x5 横于胶囊颈部
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(bx - 6, gy - 2.5, 12, 5);
    ctx.strokeRect(bx - 6, gy - 2.5, 12, 5);

    // 2) 闸板（带橙红锁止条的机械挡板）
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bx - 5.0, gy - 1.7, 10, 3.4);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(bx - 4.4, gy - 0.85, 3.4, 1.7);

    // 3) PULL 小牌底框（文字在下方正立绘制）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 15.8, gy - 2.4, 8.8, 4.6);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(bx - 15.8, gy - 2.4, 8.8, 4.6);

    // 4) 弧形释放把手（粗 3px 金属杆弯成拱门形）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(bx - 5.2, gy - 3.2, 10.4, 3.0);
    ctx.strokeRect(bx - 5.2, gy - 3.2, 10.4, 3.0);

    const cGrad = ctx.createLinearGradient(bx - 5.0, gy - 12.0, bx + 5.0, gy - 2.0);
    cGrad.addColorStop(0, '#cbd5e1');
    cGrad.addColorStop(0.45, '#f8fafc');
    cGrad.addColorStop(0.85, '#94a3b8');
    cGrad.addColorStop(1, '#475569');
    ctx.fillStyle = cGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(bx - 5.0, gy - 2.0);
    ctx.lineTo(bx - 5.0, gy - 7.0);
    ctx.arc(bx, gy - 7.0, 5.0, Math.PI, 0, false);
    ctx.lineTo(bx + 5.0, gy - 2.0);
    ctx.lineTo(bx + 2.0, gy - 2.0);
    ctx.lineTo(bx + 2.0, gy - 7.0);
    ctx.arc(bx, gy - 7.0, 2.0, 0, Math.PI, true);
    ctx.lineTo(bx - 2.0, gy - 2.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(bx, gy - 7.0, 3.5, Math.PI + 0.72, -0.72, false);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(bx - 3.9, gy - 2.6);
    ctx.lineTo(bx - 3.9, gy - 7.0);
    ctx.arc(bx, gy - 7.0, 3.9, Math.PI, -Math.PI * 0.45, false);
    ctx.stroke();

    [-3.5, 3.5].forEach(ox => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.arc(bx + ox, gy - 2.0, 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    ctx.restore();

    // PULL 小牌文字始终保持正立可读
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fde68a';
    ctx.fillText('PULL', bx - 11.4, gy - 0.1);
}

const WEST_PENTA_POD_BAYS = [
    { idx: 1, bx: -92, creature: null, spec: 'SPEC-01', name: '样本-01 · 空舱', hr: 0, o2: 0, seed: 0.0, fillPct: 0.0, empty: true },
    { idx: 2, bx: -46, creature: 'demon', spec: 'SPEC-02', name: '样本-02 · 恶魔', hr: 62, o2: 98, seed: 0.0, fillPct: 0.84, empty: false },
    { idx: 3, bx: 0, creature: 'cerberus', spec: 'SPEC-03', name: '样本-03 · 地狱三头犬', hr: 74, o2: 96, seed: 1.6, fillPct: 0.90, empty: false },
    { idx: 4, bx: 46, creature: 'demon', spec: 'SPEC-04', name: '样本-04 · 恶魔', hr: 58, o2: 99, seed: 3.1, fillPct: 0.78, empty: false },
    { idx: 5, bx: 92, creature: 'cerberus', spec: 'SPEC-05', name: '样本-05 · 地狱三头犬', hr: 81, o2: 95, seed: 4.7, fillPct: 0.88, empty: false }
];

function drawWestPentaIncubationUnitStatic(ctx, cx, cy, unitAngle) {
    // 0.7x 五联胶囊连体单元 228x114 @ (1024.06, 743.44)，x ∈ [-114, +114], y ∈ [-57, +57]
    // 最上方 1 号舱 (bx=-92) 为空舱：无液体、无生物、释放闸颠倒、红警单舱屏；2–5 号舱正常；共用主控屏橙色状态
    const ycTop = -27.5;
    const ycBotOuter = 29.5;
    const ycBotGlass = 22.0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面淡淡的溅洒渍 + 阴影 + Ø10 地漏 + 短排水管 (按半长 114 平移)
    [
        { x: -117, y: 26, rx: 11, ry: 7.5 },
        { x: -34, y: 63, rx: 13, ry: 4.5 },
        { x: 71, y: 62, rx: 9, ry: 3.8 }
    ].forEach(sp => {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = 'rgba(2, 10, 8, 0.56)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-116, -58, 232, 118, 3) : ctx.rect(-116, -58, 232, 118);
    ctx.fill();

    // 地漏 Ø10 + 周围格栅 (按半长 114 平移 -> 局部 (-113.96, 25.26))
    const drainX = -113.96, drainY = 25.26;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.65;
    ctx.fillRect(drainX - 6.5, drainY - 6.5, 13, 13);
    ctx.strokeRect(drainX - 6.5, drainY - 6.5, 13, 13);
    for (let gx = -4; gx <= 4; gx += 2.6) {
        ctx.beginPath();
        ctx.moveTo(drainX + gx, drainY - 5.5); ctx.lineTo(drainX + gx, drainY + 5.5);
        ctx.stroke();
    }
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(drainX, drainY, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(drainX, drainY, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 排水管（基座西端向南/西接地漏）
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-113, 50); ctx.lineTo(-119.5, 50); ctx.lineTo(-119.5, drainY); ctx.lineTo(drainX, drainY);
    ctx.stroke();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(-113, 50); ctx.lineTo(-119.5, 50); ctx.lineTo(-119.5, drainY); ctx.lineTo(drainX, drainY);
    ctx.stroke();

    // 2. 顶部接墙短管区（移到东端 x = 101, 108.5，总高 12px 以内）
    [
        { x: 101, w: 5.0, c1: '#475569', c2: '#e2e8f0' },
        { x: 108.5, w: 3.6, c1: '#334155', c2: '#94a3b8' }
    ].forEach(p => {
        ctx.fillStyle = p.c1;
        ctx.fillRect(p.x - p.w / 2, -63.0, p.w, 7.0);
        ctx.fillStyle = p.c2;
        ctx.fillRect(p.x - p.w * 0.25, -63.0, p.w * 0.5, 7.0);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.65;
        ctx.strokeRect(p.x - p.w / 2, -63.0, p.w, 7.0);
    });
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.fillRect(97.5, -60.2, 14, 2.0);
    ctx.strokeRect(97.5, -60.2, 14, 2.0);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.7;
    ctx.fillRect(96.5, -64.0, 22.0, 2.8);
    ctx.strokeRect(96.5, -64.0, 22.0, 2.8);

    // 3. 调平脚 (4个) + 共用基座条 (228x16 @ x ∈ [-114, +114], y ∈ [+41, +57])
    [[-111, -56], [105, -56], [-111, 56], [105, 56]].forEach(([fx, fy]) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx, fy, 6, 2.5);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(fx + 1, fy + 0.5, 4, 1.5);
    });

    const baseGrad = ctx.createLinearGradient(0, 41, 0, 57);
    baseGrad.addColorStop(0, '#475569');
    baseGrad.addColorStop(0.55, '#94a3b8');
    baseGrad.addColorStop(1, '#334155');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(-114, 41, 228, 16);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(-114, 41, 228, 16);

    // 基座条南沿警示斜纹 (y ∈ [53.8, 56.6])
    ctx.save();
    ctx.beginPath();
    ctx.rect(-112, 53.8, 224, 2.8);
    ctx.clip();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-112, 53.8, 224, 2.8);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    for (let sx = -115; sx <= 115; sx += 5) {
        ctx.beginPath();
        ctx.moveTo(sx, 56.8); ctx.lineTo(sx + 3.2, 53.6);
        ctx.stroke();
    }
    ctx.restore();

    // 基座南沿线缆束（2 根 1px 线 + 卡扣 + 格兰头，东端北折至接线法兰）
    [57.8, 59.4].forEach((cyLine, idx) => {
        const ox = idx === 0 ? 115.2 : 116.8;
        ctx.strokeStyle = idx === 0 ? '#334155' : '#0284c7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-107, cyLine);
        ctx.lineTo(ox, cyLine);
        ctx.lineTo(ox, -62.5);
        ctx.stroke();
    });
    [
        { x: -79, y: 56.8, w: 4.5, h: 3.4 },
        { x: 23, y: 56.8, w: 4.5, h: 3.4 },
        { x: 69, y: 56.8, w: 4.5, h: 3.4 },
        { x: 114.2, y: 4, w: 3.4, h: 4.5 }
    ].forEach(cl => {
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.55;
        ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
        ctx.strokeRect(cl.x, cl.y, cl.w, cl.h);
    });
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(112.5, 55.2, 3.2, 3.6);

    // 4. 顶部总管 (y ∈ [-56, -52])
    const hdrGrad = ctx.createLinearGradient(0, -56, 0, -52);
    hdrGrad.addColorStop(0, '#64748b');
    hdrGrad.addColorStop(0.45, '#f1f5f9');
    hdrGrad.addColorStop(1, '#334155');
    ctx.fillStyle = hdrGrad;
    ctx.fillRect(-102, -56, 212, 4.0);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-102, -56, 212, 4.0);

    // 保温带
    [-58, 58].forEach(ix => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(ix - 5, -56.4, 10, 4.8);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        for (let sx = ix - 4; sx <= ix + 4; sx += 2) {
            ctx.beginPath(); ctx.moveTo(sx, -56.4); ctx.lineTo(sx - 1, -51.6); ctx.stroke();
        }
    });

    // 西端压力表 (Ø10 -> r=5 @ -109, -45) + 竖向液位条 (3x9.5 @ -113, -37.5)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-102, -54); ctx.lineTo(-109, -54); ctx.lineTo(-109, -45);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(-109, -45, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(-109, -45, 3.5, -0.4, 0.9);
    ctx.stroke();
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PRS', -109, -42.6);

    ctx.fillStyle = '#041f18';
    ctx.fillRect(-113, -37.5, 3, 9.5);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-113, -37.5, 3, 9.5);

    // 5. 四道舱间 3px 隔断 + 4 个小手轮阀门 (Ø8 @ x = -69, -23, +23, +69) + 流量计
    [-69, -23, 23, 69].forEach(dx => {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(dx - 1.5, -44, 3.0, 85);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(dx - 1.5, -44, 3.0, 85);

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(dx - 4.5, 41); ctx.lineTo(dx + 4.5, 41); ctx.lineTo(dx, 35); ctx.closePath();
        ctx.fill();

        [-30, -14, 2, 18, 34].forEach(ry => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(dx, ry, 0.75, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#082f49';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.fillRect(dx - 1.5, -40, 3.0, 9);
        ctx.strokeRect(dx - 1.5, -40, 3.0, 9);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(dx - 2.5, -56.5, 5, 5.5);
        drawQuadPodSmallValve(ctx, dx, -54);
    });

    // 6. 五舱胶囊主体（1 号最上方为空舱：无液体、无生物、释放闸颠倒、红警单舱屏；2–5 号有液体与生物）
    WEST_PENTA_POD_BAYS.forEach(bay => {
        const bx = bay.bx;

        // 3px 短支管 + 接口环 + 泄压阀 + 加液口
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx - 1.5, -52.5, 3, 5.0);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(bx - 1.5, -52.5, 3, 5.0);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 3.5, -49.6, 7, 2.0);
        ctx.strokeRect(bx - 3.5, -49.6, 7, 2.0);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(bx - 14.5, -50.2, 2.2, 3.8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 15.0, -51.2, 3.2, 1.4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx + 12.2, -49.5, 2.6, 2.8);
        ctx.fillStyle = bay.empty ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(bx + 13.5, -50.2, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // 6A) 第 1 层：6px 厚实心不锈钢外壳胶囊 (r=21)
        const shellGrad = ctx.createLinearGradient(bx - 21, 0, bx + 21, 0);
        shellGrad.addColorStop(0, '#334155');
        shellGrad.addColorStop(0.16, '#94a3b8');
        shellGrad.addColorStop(0.32, '#e2e8f0');
        shellGrad.addColorStop(0.68, '#94a3b8');
        shellGrad.addColorStop(0.86, '#475569');
        shellGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = shellGrad;
        traceStadiumPath(ctx, bx, ycTop, ycBotOuter, 21);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.15;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(248, 250, 252, 0.48)';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(bx, ycTop, 19.7, Math.PI * 0.96, Math.PI * 1.75, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 19.7, ycTop); ctx.lineTo(bx - 19.7, ycBotOuter);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(bx + 19.7, ycTop); ctx.lineTo(bx + 19.7, ycBotOuter);
        ctx.arc(bx, ycBotOuter, 19.7, 0, Math.PI * 0.85, false);
        ctx.stroke();

        [-14, 4, 20].forEach(ribY => {
            [-18.0, 18.0].forEach(rx => {
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(bx + rx, ribY, 0.85, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(bx + rx - 0.25, ribY - 0.25, 0.35, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        ctx.save();
        traceStadiumPath(ctx, bx, ycTop, ycBotOuter, 20.4);
        ctx.clip();
        const capGrad = ctx.createLinearGradient(0, -48.5, 0, -40);
        capGrad.addColorStop(0, '#f1f5f9');
        capGrad.addColorStop(0.55, '#94a3b8');
        capGrad.addColorStop(1, '#475569');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(bx, ycTop, 20.5, Math.PI, 0, false);
        ctx.quadraticCurveTo(bx, -41.0, bx - 20.5, -42.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.65;
        ctx.stroke();
        for (let b = 0; b < 6; b++) {
            const ba = Math.PI * (1.14 + b * 0.144);
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(bx + Math.cos(ba) * 18.2, ycTop + Math.sin(ba) * 18.2, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = '#1e293b';
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 16.8);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.65;
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 16.0);
        ctx.stroke();

        // 6B) 第 2 层：玻璃胶囊 (r=15)
        ctx.fillStyle = bay.empty ? '#04080a' : '#031712';
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 15);
        ctx.fill();
        ctx.strokeStyle = bay.empty ? '#64748b' : '#6ee7b7';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // 6C) 第 3 层：空舱无液体（暗色干燥内腔）；其余舱保持翡翠营养液底衬 (r=14)
        if (bay.empty) {
            const dryGrad = ctx.createLinearGradient(bx - 14, 0, bx + 14, 0);
            dryGrad.addColorStop(0, '#020608');
            dryGrad.addColorStop(0.5, '#0b1215');
            dryGrad.addColorStop(1, '#020608');
            ctx.fillStyle = dryGrad;
            traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 14);
            ctx.fill();

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
            ctx.lineWidth = 0.5;
            for (let ty = -24; ty <= 18; ty += 10.5) {
                ctx.beginPath();
                ctx.moveTo(bx - 13.0, ty); ctx.lineTo(bx - 10.2, ty);
                ctx.moveTo(bx + 10.2, ty); ctx.lineTo(bx + 13.0, ty);
                ctx.stroke();
            }
        } else {
            const liqGrad = ctx.createLinearGradient(0, -41.5, 0, 36);
            liqGrad.addColorStop(0, '#065f46');
            liqGrad.addColorStop(0.5, '#044736');
            liqGrad.addColorStop(1, '#02221a');
            ctx.fillStyle = liqGrad;
            traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 14);
            ctx.fill();

            ctx.strokeStyle = 'rgba(52, 211, 153, 0.18)';
            ctx.lineWidth = 0.5;
            for (let ty = -24; ty <= 18; ty += 10.5) {
                ctx.beginPath();
                ctx.moveTo(bx - 13.0, ty); ctx.lineTo(bx - 10.2, ty);
                ctx.moveTo(bx + 10.2, ty); ctx.lineTo(bx + 13.0, ty);
                ctx.stroke();
            }
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx + 17.5, 6, 4.2, 2.0);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 20.4, 4.6, 1.4, 1.4);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(bx - 9.5, -44.2); ctx.lineTo(bx - 9.5, -27);
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(bx - 9.5, -44.6, 1.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 6D) 内置底部小屏 20x8（空舱显示红警框 + SPEC-01 + EMPTY；其余显示蓝框 + STABLE）
        const sx = bx - 10.0, sy = 38.0;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.fillRect(sx - 0.8, sy - 0.6, 21.6, 9.2);
        ctx.strokeRect(sx - 0.8, sy - 0.6, 21.6, 9.2);

        ctx.fillStyle = bay.empty ? '#26080a' : '#06263d';
        ctx.fillRect(sx, sy, 20, 8);
        ctx.strokeStyle = bay.empty ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(sx, sy, 20, 8);

        ctx.font = 'bold 2.4px monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = bay.empty ? '#fecaca' : '#bae6fd';
        ctx.fillText(bay.spec, sx + 0.9, sy + 1.85);

        ctx.textAlign = 'center';
        ctx.fillStyle = bay.empty ? '#f87171' : '#34d399';
        ctx.fillText(bay.empty ? 'EMPTY' : 'STABLE', bx, sy + 6.55);

        // 6E) 胶囊颈部倒 C 手动释放闸（1 号空舱上下颠倒，弧顶朝向舱体侧）
        drawQuadPodReleaseGate(ctx, bx, -51.6, !!bay.empty);
    });

    // 7. UNIT-05 框架小标牌 + 中央共用主控屏 (40x12，橙色告警状态：代表一个舱清空、其他正常)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-11.5, 48.2, 23, 3.8);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('UNIT-05', 0, 50.1);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-21.5, 52.4, 43, 14.0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-21.5, 52.4, 43, 14.0);

    ctx.fillStyle = '#1f1203';
    ctx.fillRect(-20, 53.6, 40, 11.6);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(-20, 53.6, 40, 11.6);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-19.5, 56.6); ctx.lineTo(19.5, 56.6);
    ctx.moveTo(10.6, 54.0); ctx.lineTo(10.6, 64.8);
    ctx.stroke();

    const bhX = 15.2, bhY = 59.3;
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 0.65;
    [0, 1, 2].forEach(k => {
        const a = -Math.PI / 2 + k * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(bhX + Math.cos(a) * 1.35, bhY + Math.sin(a) * 1.35, 1.45, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.fillStyle = '#1f1203';
    ctx.beginPath();
    ctx.arc(bhX, bhY, 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#fb923c';
    ctx.fillText('BIO-5', 15.2, 63.7);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestPentaIncubationUnitDynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestPentaIncubationUnitDynamic', 380, 380, cx, cy, (octx) => drawWestPentaIncubationUnitDynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestPentaIncubationUnitDynamicImpl(ctx, cx, cy, unitAngle, time) {
    const ycTop = -27.5;
    const ycBotGlass = 22.0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 西端压力表指针 (@ -109, -45) + 竖向液位条 (@ -113, -37.5)
    const prsAngle = -0.5 + 0.16 * Math.sin(time * 1.8);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-109, -45);
    ctx.lineTo(-109 + Math.cos(prsAngle) * 3.4, -45 + Math.sin(prsAngle) * 3.4);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-109, -45, 0.75, 0, Math.PI * 2);
    ctx.fill();

    const prsLedAlpha = 0.5 + 0.45 * Math.sin(time * 2.2);
    ctx.fillStyle = `rgba(52, 211, 153, ${prsLedAlpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(-105.8, -48.3, 0.7, 0, Math.PI * 2);
    ctx.fill();

    const lvlRatio = 0.68 + 0.12 * Math.sin(time * 1.2);
    const lvlH = 8.0 * lvlRatio;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-112.4, -28.6 - lvlH, 1.8, lvlH);

    // 1B. 四道隔断上的流量计动态浮标 + 顶部联机指示灯
    [-69, -23, 23, 69].forEach((dx, fIdx) => {
        const bobY = -35.5 + Math.sin(time * 1.9 + fIdx * 1.1) * 2.1;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(dx, bobY, 0.9, 0, Math.PI * 2);
        ctx.fill();

        const partPulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 2.4 + fIdx * 1.8));
        ctx.fillStyle = `rgba(56, 189, 248, ${partPulse.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(dx, -42.4, 0.75, 0, Math.PI * 2);
        ctx.fill();
    });

    // 2. 五舱胶囊玻璃液体动态层（1 号空舱无液体、无生物；顶灯红警闪烁、单舱屏平直线）
    WEST_PENTA_POD_BAYS.forEach((bay, bIdx) => {
        const bx = bay.bx;

        if (!bay.empty) {
            ctx.save();
            traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 14);
            ctx.clip();

            ctx.save();
            ctx.translate(bx, 0);

            ctx.fillStyle = 'rgba(2, 24, 18, 0.72)';
            ctx.beginPath();
            ctx.arc(0, ycBotGlass, 14, 0.15, Math.PI - 0.15);
            ctx.closePath();
            ctx.fill();
            [-7, -2.5, 2, 6, 9].forEach((gx, k) => {
                ctx.fillStyle = (k % 2 === 0) ? '#064e3b' : '#115e59';
                ctx.beginPath();
                ctx.arc(gx, 31.2 + (k % 3) * 0.7, 0.8, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.save();
            ctx.translate(0, 31.5);
            ctx.rotate(time * 1.2 + bay.seed);
            ctx.fillStyle = '#e2e8f0';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(-2.2, -0.65, 4.4, 1.3, 0.65) : ctx.rect(-2.2, -0.65, 4.4, 1.3);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.translate(0, -1.5);
            if (bay.creature === 'demon') {
                drawQuadPodDemonFull(ctx, time, bay.seed);
            } else {
                drawQuadPodCerberusFull(ctx, time, bay.seed);
            }
            ctx.restore();

            const fluidAlpha = 0.17 + 0.03 * Math.sin(time * 1.4 + bay.seed);
            const fGrad = ctx.createLinearGradient(0, -34, 0, 36);
            fGrad.addColorStop(0, `rgba(52, 211, 153, ${(fluidAlpha * 0.8).toFixed(3)})`);
            fGrad.addColorStop(0.55, `rgba(16, 185, 129, ${(fluidAlpha * 1.1).toFixed(3)})`);
            fGrad.addColorStop(1, `rgba(4, 47, 46, ${(fluidAlpha * 1.65).toFixed(3)})`);
            ctx.fillStyle = fGrad;
            ctx.fillRect(-15, -34, 30, 72);

            const menY = -33.0 + Math.sin(time * 1.5 + bay.seed) * 0.6;
            ctx.fillStyle = 'rgba(209, 250, 229, 0.22)';
            ctx.fillRect(-15, -43, 30, menY + 43);
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.72)';
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(-13.5, menY - 0.9);
            ctx.quadraticCurveTo(0, menY + 1.6, 13.5, menY - 0.9);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(110, 231, 183, 0.24)';
            ctx.lineWidth = 0.65;
            [0, 1, 2].forEach(sIdx => {
                const flowY = ((time * 5.5 + sIdx * 22 + bay.seed * 7) % 60) - 28;
                ctx.beginPath();
                ctx.moveTo(-9 + sIdx * 4.5, flowY + 8);
                ctx.quadraticCurveTo(-5.5 + sIdx * 5.0, flowY, -8.5 + sIdx * 4.5, flowY - 8);
                ctx.stroke();
            });

            ctx.strokeStyle = `rgba(167, 243, 208, ${(0.22 + 0.12 * Math.sin(time * 1.7 + bay.seed)).toFixed(2)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.arc(Math.sin(time * 1.1 + bay.seed) * 2.0, 25, 8.2, 0.35, Math.PI - 0.35);
            ctx.stroke();

            [[-12.6, -12], [-12.8, 6], [12.6, -4], [12.7, 14], [-9, 27], [8.5, 28]].forEach(([wx, wy]) => {
                ctx.fillStyle = 'rgba(209, 250, 229, 0.45)';
                ctx.beginPath();
                ctx.arc(wx, wy, 0.6, 0, Math.PI * 2);
                ctx.fill();
            });

            for (let p = 0; p < 6; p++) {
                const px = Math.sin(time * 0.45 + p * 1.7 + bay.seed) * 10;
                const py = -25 + ((time * 3.2 + p * 11 + bay.seed * 5) % 56);
                ctx.fillStyle = 'rgba(167, 243, 208, 0.42)';
                ctx.fillRect(px, py, 1.0, 1.0);
            }

            [
                { ox: -9.0, r: 1.8, off: 0.05 },
                { ox: 9.5, r: 1.3, off: 0.22 },
                { ox: -4.0, r: 2.1, off: 0.41 },
                { ox: 6.5, r: 1.1, off: 0.58 },
                { ox: -10.5, r: 1.25, off: 0.74 },
                { ox: 3.5, r: 1.5, off: 0.89 }
            ].forEach((b, idx) => {
                const prog = ((time / 6.0) + b.off + bay.seed * 0.1) % 1;
                const by = 32 - prog * 63;
                const bxWob = b.ox + Math.sin(time * 1.8 + idx * 1.3) * 1.1;
                ctx.fillStyle = 'rgba(167, 243, 208, 0.48)';
                ctx.strokeStyle = 'rgba(236, 253, 245, 0.78)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(bxWob, by, b.r * 0.62, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
            for (let eb = 0; eb < 2; eb++) {
                const eProg = ((time / 4.8) + eb * 0.5 + bay.seed * 0.2) % 1;
                const ey = 21 - eProg * 52;
                const ex = Math.sin(time * 2.1 + eb * 2.0) * 1.4;
                ctx.fillStyle = 'rgba(254, 240, 138, 0.52)';
                ctx.beginPath();
                ctx.arc(ex, ey, 1.0 - eProg * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            ctx.restore();
        }

        // 2K) 玻璃高光带 + 玻璃胶囊描边
        ctx.strokeStyle = bay.empty ? 'rgba(224, 242, 254, 0.22)' : 'rgba(224, 242, 254, 0.38)';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(bx, ycTop, 12.4, Math.PI * 1.20, Math.PI, true);
        ctx.lineTo(bx - 12.4, ycBotGlass);
        ctx.arc(bx, ycBotGlass, 12.4, Math.PI, Math.PI * 0.78, true);
        ctx.stroke();

        ctx.strokeStyle = bay.empty ? 'rgba(148, 163, 184, 0.45)' : 'rgba(167, 243, 208, 0.62)';
        ctx.lineWidth = 0.75;
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 15);
        ctx.stroke();

        // 2L) 顶板状态主灯 + 副遥测小灯（空舱为主灯红闪告警 + 副灯离线暗红）
        const sx = bx - 10.0, sy = 38.0;
        if (bay.empty) {
            const alertBlink = 0.5 + 0.5 * Math.sin(time * 4.5);
            ctx.fillStyle = `rgba(239, 68, 68, ${(0.18 + 0.32 * alertBlink).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(bx, -45.5, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = alertBlink > 0.45 ? '#ef4444' : '#991b1b';
            ctx.beginPath();
            ctx.arc(bx, -45.5, 1.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(bx - 0.35, -45.85, 0.32, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#450a0a';
            ctx.beginPath();
            ctx.arc(bx + 5.2, -45.5, 0.72, 0, Math.PI * 2);
            ctx.fill();

            // 2M) 空舱 20x8 小屏：红色闪烁灯 + 平直生命线
            ctx.fillStyle = alertBlink > 0.45 ? '#ef4444' : '#7f1d1d';
            ctx.beginPath();
            ctx.arc(sx + 18.2, sy + 1.85, 0.75, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(248, 113, 113, 0.85)';
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(sx + 1.2, sy + 4.35);
            ctx.lineTo(sx + 18.8, sy + 4.35);
            ctx.stroke();

            const flatDotX = sx + 1.2 + ((time * 8.0) % 17.6);
            ctx.fillStyle = '#fecaca';
            ctx.beginPath();
            ctx.arc(flatDotX, sy + 4.35, 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const ledPulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 2.1 + bay.seed));
            ctx.fillStyle = `rgba(16, 185, 129, ${(0.26 * ledPulse).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(bx, -45.5, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = ledPulse > 0.75 ? '#34d399' : '#059669';
            ctx.beginPath();
            ctx.arc(bx, -45.5, 1.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.beginPath();
            ctx.arc(bx - 0.35, -45.85, 0.35, 0, Math.PI * 2);
            ctx.fill();

            const linkOn = Math.sin(time * 2.8 + bIdx * 1.55) > -0.1;
            ctx.fillStyle = linkOn ? '#38bdf8' : '#0c4a6e';
            ctx.beginPath();
            ctx.arc(bx + 5.2, -45.5, 0.72, 0, Math.PI * 2);
            ctx.fill();

            // 2M) 内置 20x8 蓝屏动态生命体征波形 + 脉动状态灯
            const scrPulse = 0.5 + 0.5 * Math.sin(time * 3.2 - bay.seed);
            ctx.fillStyle = scrPulse > 0.4 ? '#34d399' : '#065f46';
            ctx.beginPath();
            ctx.arc(sx + 18.2, sy + 1.85, 0.75, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            for (let wx = 1.2; wx <= 18.8; wx += 1.1) {
                const phase = (wx * 0.55 - time * 3.2 + bay.seed) % (Math.PI * 2);
                const spike = Math.exp(-Math.pow(Math.sin(phase), 2) * 12) * 1.25 * Math.cos(phase);
                const wy = sy + 4.35 - spike;
                if (wx === 1.2) ctx.moveTo(sx + wx, wy);
                else ctx.lineTo(sx + wx, wy);
            }
            ctx.stroke();
        }
    });

    // 3. 中央共用主控屏：橙色部分清空状态（代表 1 个舱清空，其余 4 个舱正常）
    const pressKpa = Math.round(104 + 2 * Math.sin(time * 0.9));
    const avgHr = Math.round(69 + 2.2 * Math.sin(time * 0.85));
    const avgO2 = Math.round(97 + 0.8 * Math.sin(time * 0.45));
    const tempC = (3.8 + 0.14 * Math.sin(time * 0.55)).toFixed(1);

    const mainBeacon = 0.5 + 0.5 * Math.sin(time * 2.3);
    ctx.fillStyle = `rgba(245, 158, 11, ${(0.25 + 0.35 * mainBeacon).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(-18.2, 55.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mainBeacon > 0.4 ? '#fbbf24' : '#d97706';
    ctx.beginPath();
    ctx.arc(-18.2, 55.2, 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 2.4px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText('ABYSS-05 4/5', -16.6, 55.25);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`${pressKpa}kPa`, 9.8, 55.25);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fdba74';
    ctx.fillText(`HR:${avgHr} O2:${avgO2}%`, -18.8, 58.15);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`${tempC}C`, 9.8, 58.15);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    for (let lx = -18.6; lx <= 9.2; lx += 1.0) {
        const ph = (lx * 0.45 - time * 3.0) % (Math.PI * 2);
        const amp = Math.exp(-Math.pow(Math.sin(ph), 2) * 10) * 1.15 * Math.cos(ph);
        const ly = 60.85 - amp;
        if (lx === -18.6) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    const scanProg = (time * 0.42) % 1;
    const scanX = -18.6 + scanProg * 27.8;
    ctx.fillStyle = 'rgba(253, 186, 116, 0.90)';
    ctx.beginPath();
    ctx.arc(scanX, 60.85, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fb923c';
    ctx.fillText('1-BAY CLR', -18.8, 63.65);

    WEST_PENTA_POD_BAYS.forEach((bay, bIdx) => {
        const lx = -2.0 + bIdx * 2.4;
        if (bay.empty) {
            ctx.fillStyle = Math.sin(time * 4.5) > 0 ? '#ef4444' : '#7f1d1d';
        } else {
            const p = 0.5 + 0.5 * Math.sin(time * 2.5 + bay.seed);
            ctx.fillStyle = p > 0.45 ? '#34d399' : '#047857';
        }
        ctx.beginPath();
        ctx.arc(lx, 63.55, 0.74, 0, Math.PI * 2);
        ctx.fill();
    });

    const bioAlpha = 0.24 + 0.24 * Math.sin(time * 2.2);
    ctx.strokeStyle = `rgba(245, 158, 11, ${bioAlpha.toFixed(2)})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(15.2, 59.3, 3.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = Math.sin(time * 2.6) > 0 ? '#fb923c' : '#7c2d12';
    ctx.beginPath();
    ctx.arc(18.5, 55.2, 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawWestPentaIncubationUnit(ctx, cx, cy, unitAngle, time = 0) {
    drawWestPentaIncubationUnitStatic(ctx, cx, cy, unitAngle);
    drawWestPentaIncubationUnitDynamic(ctx, cx, cy, unitAngle, time);
}

function getWestPentaIncubationUnitObstacle() {
    const cx = 1018.93, cy = 712.87;
    const unitAngle = 1.4048;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 114; // 228 / 2
    const halfH = 57;  // 114 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST PENTA INCUBATION UNIT',
        displayName: 'ABYSS SPECIMEN PENTA-INCUBATOR',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 220 < camX || cx - 220 > camX + vw || cy + 220 < camY || cy - 220 > camY + vh) return;

            const cacheKey = '__westPentaIncubationUnitV1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 360, ch = 360;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestPentaIncubationUnitStatic(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestPentaIncubationUnitDynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

const WEST_HEPTA_POD_BAYS = [
    { idx: 1, bx: -138, creature: 'demon', spec: 'SPEC-01', name: '样本-01 · 恶魔', hr: 62, o2: 98, seed: 0.0, fillPct: 0.84, empty: false },
    { idx: 2, bx: -92, creature: 'cerberus', spec: 'SPEC-02', name: '样本-02 · 地狱三头犬', hr: 74, o2: 96, seed: 1.6, fillPct: 0.90, empty: false },
    { idx: 3, bx: -46, creature: 'demon', spec: 'SPEC-03', name: '样本-03 · 恶魔', hr: 58, o2: 99, seed: 3.1, fillPct: 0.78, empty: false },
    { idx: 4, bx: 0, creature: 'cerberus', spec: 'SPEC-04', name: '样本-04 · 地狱三头犬', hr: 81, o2: 95, seed: 4.7, fillPct: 0.88, empty: false },
    { idx: 5, bx: 46, creature: 'demon', spec: 'SPEC-05', name: '样本-05 · 恶魔', hr: 66, o2: 97, seed: 6.2, fillPct: 0.82, empty: false },
    { idx: 6, bx: 92, creature: 'cerberus', spec: 'SPEC-06', name: '样本-06 · 地狱三头犬', hr: 77, o2: 96, seed: 7.8, fillPct: 0.86, empty: false },
    { idx: 7, bx: 138, creature: null, spec: 'SPEC-07', name: '样本-07 · 空舱', hr: 0, o2: 0, seed: 9.4, fillPct: 0.0, empty: true }
];

function drawWestHeptaIncubationUnitStatic(ctx, cx, cy, unitAngle) {
    // 0.7x 七联胶囊连体单元 318x114 @ (1108.81, 1227.69)，x ∈ [-159, +159], y ∈ [-57, +57]
    const ycTop = -27.5;
    const ycBotOuter = 29.5;
    const ycBotGlass = 22.0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面淡淡的溅洒渍 + 阴影 + Ø10 地漏 + 短排水管 (按半长 159 平移)
    [
        { x: -162, y: 26, rx: 11, ry: 7.5 },
        { x: -45, y: 63, rx: 13, ry: 4.5 },
        { x: 116, y: 62, rx: 9, ry: 3.8 }
    ].forEach(sp => {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = 'rgba(2, 10, 8, 0.56)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-161, -58, 322, 118, 3) : ctx.rect(-161, -58, 322, 118);
    ctx.fill();

    // 地漏 Ø10 + 周围格栅 (按半长 159 平移 -> 局部 (-158.96, 25.26))
    const drainX = -158.96, drainY = 25.26;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.65;
    ctx.fillRect(drainX - 6.5, drainY - 6.5, 13, 13);
    ctx.strokeRect(drainX - 6.5, drainY - 6.5, 13, 13);
    for (let gx = -4; gx <= 4; gx += 2.6) {
        ctx.beginPath();
        ctx.moveTo(drainX + gx, drainY - 5.5); ctx.lineTo(drainX + gx, drainY + 5.5);
        ctx.stroke();
    }
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(drainX, drainY, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(drainX, drainY, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 排水管（基座西端向南/西接地漏）
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-158, 50); ctx.lineTo(-164.5, 50); ctx.lineTo(-164.5, drainY); ctx.lineTo(drainX, drainY);
    ctx.stroke();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(-158, 50); ctx.lineTo(-164.5, 50); ctx.lineTo(-164.5, drainY); ctx.lineTo(drainX, drainY);
    ctx.stroke();

    // 2. 顶部接墙短管区（移到东端 x = 146, 153.5，总高 12px 以内）
    [
        { x: 146, w: 5.0, c1: '#475569', c2: '#e2e8f0' },
        { x: 153.5, w: 3.6, c1: '#334155', c2: '#94a3b8' }
    ].forEach(p => {
        ctx.fillStyle = p.c1;
        ctx.fillRect(p.x - p.w / 2, -63.0, p.w, 7.0);
        ctx.fillStyle = p.c2;
        ctx.fillRect(p.x - p.w * 0.25, -63.0, p.w * 0.5, 7.0);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.65;
        ctx.strokeRect(p.x - p.w / 2, -63.0, p.w, 7.0);
    });
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.fillRect(142.5, -60.2, 14, 2.0);
    ctx.strokeRect(142.5, -60.2, 14, 2.0);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.7;
    ctx.fillRect(141.5, -64.0, 22.0, 2.8);
    ctx.strokeRect(141.5, -64.0, 22.0, 2.8);

    // 3. 调平脚 (4个) + 共用基座条 (318x16 @ x ∈ [-159, +159], y ∈ [+41, +57])
    [[-156, -56], [150, -56], [-156, 56], [150, 56]].forEach(([fx, fy]) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx, fy, 6, 2.5);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(fx + 1, fy + 0.5, 4, 1.5);
    });

    const baseGrad = ctx.createLinearGradient(0, 41, 0, 57);
    baseGrad.addColorStop(0, '#475569');
    baseGrad.addColorStop(0.55, '#94a3b8');
    baseGrad.addColorStop(1, '#334155');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(-159, 41, 318, 16);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(-159, 41, 318, 16);

    // 基座条南沿警示斜纹 (y ∈ [53.8, 56.6])
    ctx.save();
    ctx.beginPath();
    ctx.rect(-157, 53.8, 314, 2.8);
    ctx.clip();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-157, 53.8, 314, 2.8);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    for (let sx = -160; sx <= 160; sx += 5) {
        ctx.beginPath();
        ctx.moveTo(sx, 56.8); ctx.lineTo(sx + 3.2, 53.6);
        ctx.stroke();
    }
    ctx.restore();

    // 基座南沿线缆束（2 根 1px 线 + 卡扣 + 格兰头，东端北折至接线法兰）
    [57.8, 59.4].forEach((cyLine, idx) => {
        const ox = idx === 0 ? 160.2 : 161.8;
        ctx.strokeStyle = idx === 0 ? '#334155' : '#0284c7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-152, cyLine);
        ctx.lineTo(ox, cyLine);
        ctx.lineTo(ox, -62.5);
        ctx.stroke();
    });
    [
        { x: -124, y: 56.8, w: 4.5, h: 3.4 },
        { x: -23, y: 56.8, w: 4.5, h: 3.4 },
        { x: 114, y: 56.8, w: 4.5, h: 3.4 },
        { x: 159.2, y: 4, w: 3.4, h: 4.5 }
    ].forEach(cl => {
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.55;
        ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
        ctx.strokeRect(cl.x, cl.y, cl.w, cl.h);
    });
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(157.5, 55.2, 3.2, 3.6);

    // 4. 顶部总管 (y ∈ [-56, -52])
    const hdrGrad = ctx.createLinearGradient(0, -56, 0, -52);
    hdrGrad.addColorStop(0, '#64748b');
    hdrGrad.addColorStop(0.45, '#f1f5f9');
    hdrGrad.addColorStop(1, '#334155');
    ctx.fillStyle = hdrGrad;
    ctx.fillRect(-147, -56, 302, 4.0);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-147, -56, 302, 4.0);

    // 保温带
    [-103, 103].forEach(ix => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(ix - 5, -56.4, 10, 4.8);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        for (let sx = ix - 4; sx <= ix + 4; sx += 2) {
            ctx.beginPath(); ctx.moveTo(sx, -56.4); ctx.lineTo(sx - 1, -51.6); ctx.stroke();
        }
    });

    // 西端压力表 (Ø10 -> r=5 @ -154, -45) + 竖向液位条 (3x9.5 @ -158, -37.5)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-147, -54); ctx.lineTo(-154, -54); ctx.lineTo(-154, -45);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(-154, -45, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.arc(-154, -45, 3.5, -0.4, 0.9);
    ctx.stroke();
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PRS', -154, -42.6);

    ctx.fillStyle = '#041f18';
    ctx.fillRect(-158, -37.5, 3, 9.5);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-158, -37.5, 3, 9.5);

    // 5. 六道舱间 3px 隔断 + 6 个小手轮阀门 (Ø8 @ x = -115, -69, -23, +23, +69, +115) + 流量计
    [-115, -69, -23, 23, 69, 115].forEach(dx => {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(dx - 1.5, -44, 3.0, 85);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(dx - 1.5, -44, 3.0, 85);

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(dx - 4.5, 41); ctx.lineTo(dx + 4.5, 41); ctx.lineTo(dx, 35); ctx.closePath();
        ctx.fill();

        [-30, -14, 2, 18, 34].forEach(ry => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(dx, ry, 0.75, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#082f49';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.fillRect(dx - 1.5, -40, 3.0, 9);
        ctx.strokeRect(dx - 1.5, -40, 3.0, 9);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(dx - 2.5, -56.5, 5, 5.5);
        drawQuadPodSmallValve(ctx, dx, -54);
    });

    // 6. 七舱胶囊主体（1–6 号有液体与生物；7 号最下面为空舱：无液体、无生物、释放闸颠倒、红警屏幕）
    WEST_HEPTA_POD_BAYS.forEach(bay => {
        const bx = bay.bx;

        // 3px 短支管 + 接口环 + 泄压阀 + 加液口
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx - 1.5, -52.5, 3, 5.0);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(bx - 1.5, -52.5, 3, 5.0);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 3.5, -49.6, 7, 2.0);
        ctx.strokeRect(bx - 3.5, -49.6, 7, 2.0);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(bx - 14.5, -50.2, 2.2, 3.8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 15.0, -51.2, 3.2, 1.4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx + 12.2, -49.5, 2.6, 2.8);
        ctx.fillStyle = bay.empty ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(bx + 13.5, -50.2, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // 6A) 第 1 层：6px 厚实心不锈钢外壳胶囊 (r=21)
        const shellGrad = ctx.createLinearGradient(bx - 21, 0, bx + 21, 0);
        shellGrad.addColorStop(0, '#334155');
        shellGrad.addColorStop(0.16, '#94a3b8');
        shellGrad.addColorStop(0.32, '#e2e8f0');
        shellGrad.addColorStop(0.68, '#94a3b8');
        shellGrad.addColorStop(0.86, '#475569');
        shellGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = shellGrad;
        traceStadiumPath(ctx, bx, ycTop, ycBotOuter, 21);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.15;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(248, 250, 252, 0.48)';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(bx, ycTop, 19.7, Math.PI * 0.96, Math.PI * 1.75, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 19.7, ycTop); ctx.lineTo(bx - 19.7, ycBotOuter);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(bx + 19.7, ycTop); ctx.lineTo(bx + 19.7, ycBotOuter);
        ctx.arc(bx, ycBotOuter, 19.7, 0, Math.PI * 0.85, false);
        ctx.stroke();

        [-14, 4, 20].forEach(ribY => {
            [-18.0, 18.0].forEach(rx => {
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(bx + rx, ribY, 0.85, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(bx + rx - 0.25, ribY - 0.25, 0.35, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        ctx.save();
        traceStadiumPath(ctx, bx, ycTop, ycBotOuter, 20.4);
        ctx.clip();
        const capGrad = ctx.createLinearGradient(0, -48.5, 0, -40);
        capGrad.addColorStop(0, '#f1f5f9');
        capGrad.addColorStop(0.55, '#94a3b8');
        capGrad.addColorStop(1, '#475569');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(bx, ycTop, 20.5, Math.PI, 0, false);
        ctx.quadraticCurveTo(bx, -41.0, bx - 20.5, -42.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.65;
        ctx.stroke();
        for (let b = 0; b < 6; b++) {
            const ba = Math.PI * (1.14 + b * 0.144);
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(bx + Math.cos(ba) * 18.2, ycTop + Math.sin(ba) * 18.2, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = '#1e293b';
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 16.8);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.65;
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 16.0);
        ctx.stroke();

        // 6B) 第 2 层：玻璃胶囊 (r=15)
        ctx.fillStyle = bay.empty ? '#04080a' : '#031712';
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 15);
        ctx.fill();
        ctx.strokeStyle = bay.empty ? '#64748b' : '#6ee7b7';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // 6C) 第 3 层：空舱无液体（暗色干燥内腔）；其余舱保持翡翠营养液底衬 (r=14)
        if (bay.empty) {
            const dryGrad = ctx.createLinearGradient(bx - 14, 0, bx + 14, 0);
            dryGrad.addColorStop(0, '#020608');
            dryGrad.addColorStop(0.5, '#0b1215');
            dryGrad.addColorStop(1, '#020608');
            ctx.fillStyle = dryGrad;
            traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 14);
            ctx.fill();

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
            ctx.lineWidth = 0.5;
            for (let ty = -24; ty <= 18; ty += 10.5) {
                ctx.beginPath();
                ctx.moveTo(bx - 13.0, ty); ctx.lineTo(bx - 10.2, ty);
                ctx.moveTo(bx + 10.2, ty); ctx.lineTo(bx + 13.0, ty);
                ctx.stroke();
            }
        } else {
            const liqGrad = ctx.createLinearGradient(0, -41.5, 0, 36);
            liqGrad.addColorStop(0, '#065f46');
            liqGrad.addColorStop(0.5, '#044736');
            liqGrad.addColorStop(1, '#02221a');
            ctx.fillStyle = liqGrad;
            traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 14);
            ctx.fill();

            ctx.strokeStyle = 'rgba(52, 211, 153, 0.18)';
            ctx.lineWidth = 0.5;
            for (let ty = -24; ty <= 18; ty += 10.5) {
                ctx.beginPath();
                ctx.moveTo(bx - 13.0, ty); ctx.lineTo(bx - 10.2, ty);
                ctx.moveTo(bx + 10.2, ty); ctx.lineTo(bx + 13.0, ty);
                ctx.stroke();
            }
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx + 17.5, 6, 4.2, 2.0);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 20.4, 4.6, 1.4, 1.4);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(bx - 9.5, -44.2); ctx.lineTo(bx - 9.5, -27);
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(bx - 9.5, -44.6, 1.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 6D) 内置底部小屏 20x8（空舱显示红/橙警框 + SPEC-07 + EMPTY；其余显示蓝框 + STABLE）
        const sx = bx - 10.0, sy = 38.0;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.fillRect(sx - 0.8, sy - 0.6, 21.6, 9.2);
        ctx.strokeRect(sx - 0.8, sy - 0.6, 21.6, 9.2);

        ctx.fillStyle = bay.empty ? '#26080a' : '#06263d';
        ctx.fillRect(sx, sy, 20, 8);
        ctx.strokeStyle = bay.empty ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(sx, sy, 20, 8);

        ctx.font = 'bold 2.4px monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = bay.empty ? '#fecaca' : '#bae6fd';
        ctx.fillText(bay.spec, sx + 0.9, sy + 1.85);

        ctx.textAlign = 'center';
        ctx.fillStyle = bay.empty ? '#f87171' : '#34d399';
        ctx.fillText(bay.empty ? 'EMPTY' : 'STABLE', bx, sy + 6.55);

        // 6E) 胶囊颈部倒 C 手动释放闸（7 号空舱上下颠倒，弧顶朝向舱体侧）
        drawQuadPodReleaseGate(ctx, bx, -51.6, !!bay.empty);
    });

    // 7. UNIT-07 框架小标牌 + 中央共用总控屏 (40x12)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-11.5, 48.2, 23, 3.8);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('UNIT-07', 0, 50.1);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-21.5, 52.4, 43, 14.0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-21.5, 52.4, 43, 14.0);

    ctx.fillStyle = '#1f1203';
    ctx.fillRect(-20, 53.6, 40, 11.6);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(-20, 53.6, 40, 11.6);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-19.5, 56.6); ctx.lineTo(19.5, 56.6);
    ctx.moveTo(10.6, 54.0); ctx.lineTo(10.6, 64.8);
    ctx.stroke();

    const bhX = 15.2, bhY = 59.3;
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 0.65;
    [0, 1, 2].forEach(k => {
        const a = -Math.PI / 2 + k * (Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(bhX + Math.cos(a) * 1.35, bhY + Math.sin(a) * 1.35, 1.45, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.fillStyle = '#1f1203';
    ctx.beginPath();
    ctx.arc(bhX, bhY, 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#fb923c';
    ctx.fillText('BIO-7', 15.2, 63.7);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestHeptaIncubationUnitDynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestHeptaIncubationUnitDynamic', 440, 440, cx, cy, (octx) => drawWestHeptaIncubationUnitDynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestHeptaIncubationUnitDynamicImpl(ctx, cx, cy, unitAngle, time) {
    const ycTop = -27.5;
    const ycBotGlass = 22.0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 西端压力表指针 (@ -154, -45) + 竖向液位条 (@ -158, -37.5)
    const prsAngle = -0.5 + 0.16 * Math.sin(time * 1.8);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-154, -45);
    ctx.lineTo(-154 + Math.cos(prsAngle) * 3.4, -45 + Math.sin(prsAngle) * 3.4);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-154, -45, 0.75, 0, Math.PI * 2);
    ctx.fill();

    const prsLedAlpha = 0.5 + 0.45 * Math.sin(time * 2.2);
    ctx.fillStyle = `rgba(52, 211, 153, ${prsLedAlpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(-150.8, -48.3, 0.7, 0, Math.PI * 2);
    ctx.fill();

    const lvlRatio = 0.68 + 0.12 * Math.sin(time * 1.2);
    const lvlH = 8.0 * lvlRatio;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-157.4, -28.6 - lvlH, 1.8, lvlH);

    // 1B. 六道隔断上的流量计动态浮标 + 顶部联机指示灯
    [-115, -69, -23, 23, 69, 115].forEach((dx, fIdx) => {
        const bobY = -35.5 + Math.sin(time * 1.9 + fIdx * 1.1) * 2.1;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(dx, bobY, 0.9, 0, Math.PI * 2);
        ctx.fill();

        const partPulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 2.4 + fIdx * 1.8));
        ctx.fillStyle = `rgba(56, 189, 248, ${partPulse.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(dx, -42.4, 0.75, 0, Math.PI * 2);
        ctx.fill();
    });

    // 2. 七舱胶囊玻璃液体动态层（7 号空舱无液体、无生物；顶灯红警闪烁、单舱屏平直线）
    WEST_HEPTA_POD_BAYS.forEach((bay, bIdx) => {
        const bx = bay.bx;

        if (!bay.empty) {
            ctx.save();
            traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 14);
            ctx.clip();

            ctx.save();
            ctx.translate(bx, 0);

            ctx.fillStyle = 'rgba(2, 24, 18, 0.72)';
            ctx.beginPath();
            ctx.arc(0, ycBotGlass, 14, 0.15, Math.PI - 0.15);
            ctx.closePath();
            ctx.fill();
            [-7, -2.5, 2, 6, 9].forEach((gx, k) => {
                ctx.fillStyle = (k % 2 === 0) ? '#064e3b' : '#115e59';
                ctx.beginPath();
                ctx.arc(gx, 31.2 + (k % 3) * 0.7, 0.8, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.save();
            ctx.translate(0, 31.5);
            ctx.rotate(time * 1.2 + bay.seed);
            ctx.fillStyle = '#e2e8f0';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(-2.2, -0.65, 4.4, 1.3, 0.65) : ctx.rect(-2.2, -0.65, 4.4, 1.3);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.translate(0, -1.5);
            if (bay.creature === 'demon') {
                drawQuadPodDemonFull(ctx, time, bay.seed);
            } else {
                drawQuadPodCerberusFull(ctx, time, bay.seed);
            }
            ctx.restore();

            const fluidAlpha = 0.17 + 0.03 * Math.sin(time * 1.4 + bay.seed);
            const fGrad = ctx.createLinearGradient(0, -34, 0, 36);
            fGrad.addColorStop(0, `rgba(52, 211, 153, ${(fluidAlpha * 0.8).toFixed(3)})`);
            fGrad.addColorStop(0.55, `rgba(16, 185, 129, ${(fluidAlpha * 1.1).toFixed(3)})`);
            fGrad.addColorStop(1, `rgba(4, 47, 46, ${(fluidAlpha * 1.65).toFixed(3)})`);
            ctx.fillStyle = fGrad;
            ctx.fillRect(-15, -34, 30, 72);

            const menY = -33.0 + Math.sin(time * 1.5 + bay.seed) * 0.6;
            ctx.fillStyle = 'rgba(209, 250, 229, 0.22)';
            ctx.fillRect(-15, -43, 30, menY + 43);
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.72)';
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(-13.5, menY - 0.9);
            ctx.quadraticCurveTo(0, menY + 1.6, 13.5, menY - 0.9);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(110, 231, 183, 0.24)';
            ctx.lineWidth = 0.65;
            [0, 1, 2].forEach(sIdx => {
                const flowY = ((time * 5.5 + sIdx * 22 + bay.seed * 7) % 60) - 28;
                ctx.beginPath();
                ctx.moveTo(-9 + sIdx * 4.5, flowY + 8);
                ctx.quadraticCurveTo(-5.5 + sIdx * 5.0, flowY, -8.5 + sIdx * 4.5, flowY - 8);
                ctx.stroke();
            });

            ctx.strokeStyle = `rgba(167, 243, 208, ${(0.22 + 0.12 * Math.sin(time * 1.7 + bay.seed)).toFixed(2)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.arc(Math.sin(time * 1.1 + bay.seed) * 2.0, 25, 8.2, 0.35, Math.PI - 0.35);
            ctx.stroke();

            [[-12.6, -12], [-12.8, 6], [12.6, -4], [12.7, 14], [-9, 27], [8.5, 28]].forEach(([wx, wy]) => {
                ctx.fillStyle = 'rgba(209, 250, 229, 0.45)';
                ctx.beginPath();
                ctx.arc(wx, wy, 0.6, 0, Math.PI * 2);
                ctx.fill();
            });

            for (let p = 0; p < 6; p++) {
                const px = Math.sin(time * 0.45 + p * 1.7 + bay.seed) * 10;
                const py = -25 + ((time * 3.2 + p * 11 + bay.seed * 5) % 56);
                ctx.fillStyle = 'rgba(167, 243, 208, 0.42)';
                ctx.fillRect(px, py, 1.0, 1.0);
            }

            [
                { ox: -9.0, r: 1.8, off: 0.05 },
                { ox: 9.5, r: 1.3, off: 0.22 },
                { ox: -4.0, r: 2.1, off: 0.41 },
                { ox: 6.5, r: 1.1, off: 0.58 },
                { ox: -10.5, r: 1.25, off: 0.74 },
                { ox: 3.5, r: 1.5, off: 0.89 }
            ].forEach((b, idx) => {
                const prog = ((time / 6.0) + b.off + bay.seed * 0.1) % 1;
                const by = 32 - prog * 63;
                const bxWob = b.ox + Math.sin(time * 1.8 + idx * 1.3) * 1.1;
                ctx.fillStyle = 'rgba(167, 243, 208, 0.48)';
                ctx.strokeStyle = 'rgba(236, 253, 245, 0.78)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(bxWob, by, b.r * 0.62, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
            for (let eb = 0; eb < 2; eb++) {
                const eProg = ((time / 4.8) + eb * 0.5 + bay.seed * 0.2) % 1;
                const ey = 21 - eProg * 52;
                const ex = Math.sin(time * 2.1 + eb * 2.0) * 1.4;
                ctx.fillStyle = 'rgba(254, 240, 138, 0.52)';
                ctx.beginPath();
                ctx.arc(ex, ey, 1.0 - eProg * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            ctx.restore();
        }

        // 2K) 玻璃高光带 + 玻璃胶囊描边
        ctx.strokeStyle = bay.empty ? 'rgba(224, 242, 254, 0.22)' : 'rgba(224, 242, 254, 0.38)';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(bx, ycTop, 12.4, Math.PI * 1.20, Math.PI, true);
        ctx.lineTo(bx - 12.4, ycBotGlass);
        ctx.arc(bx, ycBotGlass, 12.4, Math.PI, Math.PI * 0.78, true);
        ctx.stroke();

        ctx.strokeStyle = bay.empty ? 'rgba(148, 163, 184, 0.45)' : 'rgba(167, 243, 208, 0.62)';
        ctx.lineWidth = 0.75;
        traceStadiumPath(ctx, bx, ycTop, ycBotGlass, 15);
        ctx.stroke();

        // 2L) 顶板状态主灯 + 副遥测小灯（空舱为主灯红闪告警 + 副灯熄灭）
        const sx = bx - 10.0, sy = 38.0;
        if (bay.empty) {
            const alertBlink = 0.5 + 0.5 * Math.sin(time * 4.5);
            ctx.fillStyle = `rgba(239, 68, 68, ${(0.18 + 0.32 * alertBlink).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(bx, -45.5, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = alertBlink > 0.45 ? '#ef4444' : '#991b1b';
            ctx.beginPath();
            ctx.arc(bx, -45.5, 1.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(bx - 0.35, -45.85, 0.32, 0, Math.PI * 2);
            ctx.fill();

            // 副遥测灯离线暗红
            ctx.fillStyle = '#450a0a';
            ctx.beginPath();
            ctx.arc(bx + 5.2, -45.5, 0.72, 0, Math.PI * 2);
            ctx.fill();

            // 2M) 空舱 20x8 小屏：红色闪烁灯 + 平直生命线（无心跳峰）
            ctx.fillStyle = alertBlink > 0.45 ? '#ef4444' : '#7f1d1d';
            ctx.beginPath();
            ctx.arc(sx + 18.2, sy + 1.85, 0.75, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(248, 113, 113, 0.85)';
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(sx + 1.2, sy + 4.35);
            ctx.lineTo(sx + 18.8, sy + 4.35);
            ctx.stroke();

            const flatDotX = sx + 1.2 + ((time * 8.0) % 17.6);
            ctx.fillStyle = '#fecaca';
            ctx.beginPath();
            ctx.arc(flatDotX, sy + 4.35, 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const ledPulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 2.1 + bay.seed));
            ctx.fillStyle = `rgba(16, 185, 129, ${(0.26 * ledPulse).toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(bx, -45.5, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = ledPulse > 0.75 ? '#34d399' : '#059669';
            ctx.beginPath();
            ctx.arc(bx, -45.5, 1.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.beginPath();
            ctx.arc(bx - 0.35, -45.85, 0.35, 0, Math.PI * 2);
            ctx.fill();

            const linkOn = Math.sin(time * 2.8 + bIdx * 1.55) > -0.1;
            ctx.fillStyle = linkOn ? '#38bdf8' : '#0c4a6e';
            ctx.beginPath();
            ctx.arc(bx + 5.2, -45.5, 0.72, 0, Math.PI * 2);
            ctx.fill();

            // 2M) 内置 20x8 蓝屏动态生命体征波形 + 脉动状态灯
            const scrPulse = 0.5 + 0.5 * Math.sin(time * 3.2 - bay.seed);
            ctx.fillStyle = scrPulse > 0.4 ? '#34d399' : '#065f46';
            ctx.beginPath();
            ctx.arc(sx + 18.2, sy + 1.85, 0.75, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            for (let wx = 1.2; wx <= 18.8; wx += 1.1) {
                const phase = (wx * 0.55 - time * 3.2 + bay.seed) % (Math.PI * 2);
                const spike = Math.exp(-Math.pow(Math.sin(phase), 2) * 12) * 1.25 * Math.cos(phase);
                const wy = sy + 4.35 - spike;
                if (wx === 1.2) ctx.moveTo(sx + wx, wy);
                else ctx.lineTo(sx + wx, wy);
            }
            ctx.stroke();
        }
    });

    // 3. 中央主控屏：橙色部分清空状态（代表 1 个舱清空，其余 6 个舱正常）
    const pressKpa = Math.round(104 + 2 * Math.sin(time * 0.9));
    const avgHr = Math.round(70 + 2.2 * Math.sin(time * 0.85));
    const avgO2 = Math.round(97 + 0.8 * Math.sin(time * 0.45));
    const tempC = (3.8 + 0.14 * Math.sin(time * 0.55)).toFixed(1);

    const mainBeacon = 0.5 + 0.5 * Math.sin(time * 2.3);
    ctx.fillStyle = `rgba(245, 158, 11, ${(0.25 + 0.35 * mainBeacon).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(-18.2, 55.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mainBeacon > 0.4 ? '#fbbf24' : '#d97706';
    ctx.beginPath();
    ctx.arc(-18.2, 55.2, 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 2.4px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fed7aa';
    ctx.fillText('ABYSS-07 6/7', -16.6, 55.25);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`${pressKpa}kPa`, 9.8, 55.25);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fdba74';
    ctx.fillText(`HR:${avgHr} O2:${avgO2}%`, -18.8, 58.15);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`${tempC}C`, 9.8, 58.15);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    for (let lx = -18.6; lx <= 9.2; lx += 1.0) {
        const ph = (lx * 0.45 - time * 3.0) % (Math.PI * 2);
        const amp = Math.exp(-Math.pow(Math.sin(ph), 2) * 10) * 1.15 * Math.cos(ph);
        const ly = 60.85 - amp;
        if (lx === -18.6) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    const scanProg = (time * 0.42) % 1;
    const scanX = -18.6 + scanProg * 27.8;
    ctx.fillStyle = 'rgba(253, 186, 116, 0.90)';
    ctx.beginPath();
    ctx.arc(scanX, 60.85, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fb923c';
    ctx.fillText('1-BAY CLR', -18.8, 63.65);

    WEST_HEPTA_POD_BAYS.forEach((bay, bIdx) => {
        const lx = -2.2 + bIdx * 1.65;
        if (bay.empty) {
            ctx.fillStyle = Math.sin(time * 4.5) > 0 ? '#ef4444' : '#7f1d1d';
        } else {
            const p = 0.5 + 0.5 * Math.sin(time * 2.5 + bay.seed);
            ctx.fillStyle = p > 0.45 ? '#34d399' : '#047857';
        }
        ctx.beginPath();
        ctx.arc(lx, 63.55, 0.68, 0, Math.PI * 2);
        ctx.fill();
    });

    const bioAlpha = 0.24 + 0.24 * Math.sin(time * 2.2);
    ctx.strokeStyle = `rgba(245, 158, 11, ${bioAlpha.toFixed(2)})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(15.2, 59.3, 3.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = Math.sin(time * 2.6) > 0 ? '#fb923c' : '#7c2d12';
    ctx.beginPath();
    ctx.arc(18.5, 55.2, 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawWestHeptaIncubationUnit(ctx, cx, cy, unitAngle, time = 0) {
    drawWestHeptaIncubationUnitStatic(ctx, cx, cy, unitAngle);
    drawWestHeptaIncubationUnitDynamic(ctx, cx, cy, unitAngle, time);
}

function getWestHeptaIncubationUnitObstacle() {
    const cx = 1110.88, cy = 1239.52;
    const unitAngle = 1.3977;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 159; // 318 / 2
    const halfH = 57; // 114 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST HEPTA INCUBATION UNIT',
        displayName: 'ABYSS SPECIMEN HEPTA-INCUBATOR',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 260 < camX || cx - 260 > camX + vw || cy + 260 < camY || cy - 260 > camY + vh) return;

            const cacheKey = '__westHeptaIncubationUnitV1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 420, ch = 420;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestHeptaIncubationUnitStatic(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestHeptaIncubationUnitDynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

// =========================================================================
// Level 8 · 西侧三角房 · 长试验台 04：底墙西段仪器分析台 (330x50，静态+动态分离)
// 中心 (407.82, 1326.69)，长轴沿底墙内缘 (0.5824 rad)，占沿墙 120–450
// 台身南缘距底墙内壁 3px（墙面管线/插座/挂钩贴墙至 +28），6 台仪器/耗材各不相同
// =========================================================================
function drawWestBench04Static(ctx, cx, cy, unitAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面投影阴影（严格限定在房间与墙体间隙范围内）
    ctx.fillStyle = 'rgba(2, 6, 12, 0.54)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-167, -27.5, 334, 54.5, 2.5) : ctx.rect(-167, -27.5, 334, 54.5);
    ctx.fill();

    // 2. 墙面管线 ×2 + 墙面插座排 ×5 + 墙面挂钩 ×2 + 实验记录板 ×1（贴底墙 y ∈ [+24.6, +28.0]）
    // 2A) 水管（银白，y = +27.3）与气管（深黑，y = +25.9）及固定卡扣
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-162, 27.3); ctx.lineTo(162, 27.3);
    ctx.stroke();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-162, 27.0); ctx.lineTo(162, 27.0);
    ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(-162, 25.9); ctx.lineTo(162, 25.9);
    ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-162, 25.7); ctx.lineTo(162, 25.7);
    ctx.stroke();

    [-132, -66, 0, 66, 132].forEach((clx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#cbd5e1' : '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(clx - 1.2, 24.8, 2.4, 3.2);
        ctx.strokeRect(clx - 1.2, 24.8, 2.4, 3.2);
    });
    // 气管黄铜截止小阀（x = +12）
    ctx.fillStyle = '#d97706';
    ctx.fillRect(10.5, 25.1, 3.0, 1.6);

    // 2B) 墙面插座排 5 个（两孔、三孔、带开关、带指示灯、带 USB 各不相同）
    [
        { x: -146, kind: '2pin' },
        { x: -86,  kind: '3pin' },
        { x: -24,  kind: 'switch' },
        { x: 46,   kind: 'led' },
        { x: 122,  kind: 'usb' }
    ].forEach(out => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.55;
        ctx.fillRect(out.x - 4.2, 24.6, 8.4, 3.3);
        ctx.strokeRect(out.x - 4.2, 24.6, 8.4, 3.3);
        ctx.fillStyle = '#0f172a';
        if (out.kind === '2pin') {
            ctx.fillRect(out.x - 1.8, 25.6, 0.9, 1.4);
            ctx.fillRect(out.x + 0.9, 25.6, 0.9, 1.4);
        } else if (out.kind === '3pin') {
            ctx.fillRect(out.x - 0.45, 25.2, 0.9, 1.0);
            ctx.fillRect(out.x - 2.0, 26.3, 1.1, 0.9);
            ctx.fillRect(out.x + 0.9, 26.3, 1.1, 0.9);
        } else if (out.kind === 'switch') {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(out.x - 3.0, 25.4, 2.2, 1.6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x + 0.5, 25.6, 0.9, 1.3);
            ctx.fillRect(out.x + 2.1, 25.6, 0.9, 1.3);
        } else if (out.kind === 'led') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(out.x - 2.4, 26.2, 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x - 0.4, 25.6, 0.9, 1.3);
            ctx.fillRect(out.x + 1.4, 25.6, 0.9, 1.3);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(out.x - 2.6, 25.5, 2.0, 1.4);
            ctx.fillRect(out.x + 0.6, 25.5, 2.0, 1.4);
        }
    });

    // 2C) 墙面挂钩 2 个（左挂蓝手套、右挂擦拭抹布）
    // 左挂钩 (-157, 25.4) + 折叠丁腈手套
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-158.2, 24.7, 2.4, 2.2);
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-158.6, 25.6); ctx.lineTo(-155.2, 25.6);
    ctx.lineTo(-154.6, 27.9); ctx.lineTo(-156.2, 27.9);
    ctx.lineTo(-157.0, 26.8); ctx.lineTo(-157.8, 27.9);
    ctx.lineTo(-159.2, 27.9); ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 右挂钩 (+158, 25.4) + 折叠抹布
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(156.8, 24.7, 2.4, 2.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(155.4, 25.4, 5.2, 2.6, 0.7) : ctx.rect(155.4, 25.4, 5.2, 2.6);
    ctx.fill();
    ctx.stroke();

    // 3. 桌腿交叉撑、踢脚与调平脚 6 个（台前缘 y ∈ [-25.0, -23.0]）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    [-129, -64, 0, 64, 129].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx - 22, -24.7); ctx.lineTo(bx + 22, -23.3);
        ctx.moveTo(bx - 22, -23.3); ctx.lineTo(bx + 22, -24.7);
        ctx.stroke();
    });
    // 踢脚护板
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-162, -24.3, 324, 1.3);
    // 6 个不锈钢调平脚
    [-161, -97, -32, 32, 97, 161].forEach(fx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 2.6, -25.4, 5.2, 2.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 1.8, -25.0, 3.6, 1.2);
    });

    // 4. 台下 4 组各不相同的钢制柜体（y ∈ [-23.0, -14.2]）
    // 4A) 西组 [-161, -83]：2 门柜（双门缝 + 双拉手 + 中央锁孔）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-161, -23.0, 78, 8.8);
    ctx.strokeRect(-161, -23.0, 78, 8.8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-160, -22.2, 37.2, 7.2);
    ctx.fillRect(-121.2, -22.2, 37.2, 7.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-122.0, -22.5); ctx.lineTo(-122.0, -14.7);
    ctx.stroke();
    // 双竖拉手 + 锁孔
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-126.0, -21.2, 1.5, 4.8);
    ctx.fillRect(-119.5, -21.2, 1.5, 4.8);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-122.0, -18.6, 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-122.3, -19.2, 0.6, 1.2);

    // 4B) 次西组 [-79, -2]：4 档抽屉（拉手逐档变短：18 -> 13.5 -> 9 -> 5）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-79, -23.0, 77, 8.8);
    ctx.strokeRect(-79, -23.0, 77, 8.8);
    [
        { y: -22.6, hw: 18.0 },
        { y: -20.5, hw: 13.5 },
        { y: -18.4, hw: 9.0 },
        { y: -16.3, hw: 5.0 }
    ].forEach((dr, dIdx) => {
        ctx.fillStyle = dIdx % 2 === 0 ? '#64748b' : '#475569';
        ctx.fillRect(-77.5, dr.y, 74, 1.7);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(-77.5, dr.y, 74, 1.7);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-40.5 - dr.hw / 2, dr.y + 0.55, dr.hw, 0.7);
    });

    // 4C) 次东组 [+2, +79]：开放格（上层线缆盘 1 个 + 下层备用试剂箱 2 个）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.75;
    ctx.fillRect(2, -23.0, 77, 8.8);
    ctx.strokeRect(2, -23.0, 77, 8.8);
    // 中层钢隔板
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3, -18.8, 75, 0.95);
    // 上层：线缆盘 1 个（x ∈ [14, 34]）
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(14, -17.6, 2.2, 3.0);
    ctx.fillRect(31.8, -17.6, 2.2, 3.0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(16.2, -17.2, 15.6, 2.3);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.55;
    for (let sx = 18; sx <= 30; sx += 3) {
        ctx.beginPath(); ctx.moveTo(sx, -17.2); ctx.lineTo(sx, -14.9); ctx.stroke();
    }
    // 下层：备用试剂箱 2 个（左翡翠标箱 + 右琥珀标箱）
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(10, -22.3, 24, 3.1);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(10, -22.3, 24, 3.1);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(12, -21.4, 8, 1.2);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(42, -22.3, 26, 3.1);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(42, -22.3, 26, 3.1);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(45, -21.4, 9, 1.2);

    // 4D) 东组 [+83, +161]：深柜（单门 + 锁柄 + 斜向散热百叶孔）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(83, -23.0, 78, 8.8);
    ctx.strokeRect(83, -23.0, 78, 8.8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(84.2, -22.1, 75.6, 7.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(87.2, -21.1, 1.8, 4.9);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    for (let vx = 122; vx <= 154; vx += 3.6) {
        ctx.beginPath();
        ctx.moveTo(vx, -21.1); ctx.lineTo(vx + 2.0, -16.1);
        ctx.stroke();
    }

    // 5. 台面下走线槽 1 条（镀锌槽 + 4 根粗细不同的黑色线缆 + 扎带卡扣）
    ctx.fillStyle = '#334155';
    ctx.fillRect(-162, -14.2, 324, 2.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-162, -14.2, 324, 2.2);
    [
        { y: -13.85, w: 0.55 },
        { y: -13.40, w: 0.85 },
        { y: -12.90, w: 1.15 },
        { y: -12.38, w: 1.45 }
    ].forEach(cb => {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = cb.w;
        ctx.beginPath();
        ctx.moveTo(-158, cb.y); ctx.lineTo(158, cb.y);
        ctx.stroke();
    });
    [-135, -71, 0, 62, 100, 141].forEach(dropX => {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(dropX - 1.0, -14.2, 2.0, 2.2);
    });

    // 6. 环氧树脂台面（330x37 @ x ∈ [-165, +165], y ∈ [-12.0, +25.0]，含四周不锈钢凸边、网格蚀刻与钢印 BENCH-04）
    const topGrad = ctx.createLinearGradient(0, -12, 0, 25);
    topGrad.addColorStop(0, '#334155');
    topGrad.addColorStop(0.18, '#1e293b');
    topGrad.addColorStop(0.85, '#0f172a');
    topGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-165, -12.0, 330, 37.0);

    // 环氧台面精细蚀刻网格（每 15px）
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.5;
    for (let gx = -150; gx <= 150; gx += 15) {
        ctx.beginPath(); ctx.moveTo(gx, -10.5); ctx.lineTo(gx, 23.5); ctx.stroke();
    }
    for (let gy = -6; gy <= 20; gy += 8.5) {
        ctx.beginPath(); ctx.moveTo(-163.5, gy); ctx.lineTo(163.5, gy); ctx.stroke();
    }

    // 四周不锈钢凸边（1.5px 亮边 + 0.8px 外暗框）
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-164.25, -11.25, 328.5, 35.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-165, -12.0, 330, 37.0);

    // 台面钢印编号 BENCH-04（西北端前沿金属铭牌）
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-162, -11.7, 20, 4.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-162, -11.7, 20, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('BENCH-04', -152, -9.55);

    // =====================================================================
    // 7. 台面 6 台各不相同的分析仪器（从西到东，均留有散热空档、独立减震垫与散热孔）
    // =====================================================================

    // 7A) 仪器 1：实时荧光定量 PCR 仪（-151..-119，洁白壳体 + 96孔热盖板 + 前斜向温度屏底座）
    // 减震垫 + 接线
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-150, -6.5, 30, 24);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-135, -6.5); ctx.lineTo(-135, -12.0); ctx.stroke();
    // 白色主体箱
    const pcrGrad = ctx.createLinearGradient(-149, 0, -121, 0);
    pcrGrad.addColorStop(0, '#cbd5e1');
    pcrGrad.addColorStop(0.25, '#f8fafc');
    pcrGrad.addColorStop(0.8, '#e2e8f0');
    pcrGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = pcrGrad;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-149, -5.5, 28, 22);
    ctx.strokeRect(-149, -5.5, 28, 22);
    // 后沿散热格栅
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.6;
    for (let vx = -146; vx <= -124; vx += 2.2) {
        ctx.beginPath(); ctx.moveTo(vx, 14.0); ctx.lineTo(vx, 16.0); ctx.stroke();
    }
    // 96 孔热盖板 + 锁扣压杆
    ctx.fillStyle = '#334155';
    ctx.fillRect(-145.5, 1.5, 21, 11.5);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-145.5, 1.5, 21, 11.5);
    ctx.fillStyle = '#64748b';
    for (let r = 0; r < 5; r++) {
        for (let col = 0; col < 8; col++) {
            ctx.fillRect(-143.8 + col * 2.3, 3.0 + r * 1.9, 1.0, 1.0);
        }
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-141, 0.2, 12, 1.4);
    // 温度屏静态框（动态数字在 DrawDynamic 中绘）
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-144.5, -4.6, 15.5, 5.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-144.5, -4.6, 15.5, 5.2);

    // 7B) 耗材簇 A（-116..-91）：移液器架 1 个（3支长短不同）+ 枪头盒 2 个（一开一合）
    // 移液器架 (-110, +5)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-115.5, 0, 11, 14, 1.5) : ctx.rect(-115.5, 0, 11, 14);
    ctx.fill();
    ctx.stroke();
    // 3 支不同长度移液器
    [
        { x: -113.2, len: 12.0, cap: '#38bdf8' },
        { x: -110.0, len: 9.5,  cap: '#f59e0b' },
        { x: -106.8, len: 7.2,  cap: '#ef4444' }
    ].forEach(pip => {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(pip.x - 0.8, 13.0 - pip.len, 1.6, pip.len);
        ctx.fillStyle = pip.cap;
        ctx.fillRect(pip.x - 1.1, 12.2 - pip.len, 2.2, 1.8);
    });
    // 枪头盒 1（开启，-96, -3）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.fillRect(-102, -6.8, 10.5, 8.2);
    ctx.strokeRect(-102, -6.8, 10.5, 8.2);
    ctx.fillStyle = '#38bdf8';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            ctx.beginPath();
            ctx.arc(-100.2 + c * 2.2, -5.0 + r * 2.2, 0.55, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // 开启折盖阴影（向墙侧 +y 翻开，方便实验人员从房间内侧 -y 取用枪头）
    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.fillRect(-102, 1.6, 10.5, 2.2);
    // 枪头盒 2（闭合，-96, +11）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-102, 5.5, 10.5, 8.5);
    ctx.strokeRect(-102, 5.5, 10.5, 8.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-98.2, 4.8, 3.0, 1.1);

    // 7C) 仪器 2：液相色谱仪 HPLC（-89..-53，浅灰堆叠高箱 + 自动进样盘 + 溶剂瓶 2 个）
    // 电源线接槽
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-71, -8.5); ctx.lineTo(-71, -12.0); ctx.stroke();
    // 浅灰主塔体
    const hplcGrad = ctx.createLinearGradient(-88, 0, -54, 0);
    hplcGrad.addColorStop(0, '#94a3b8');
    hplcGrad.addColorStop(0.25, '#e2e8f0');
    hplcGrad.addColorStop(0.85, '#cbd5e1');
    hplcGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = hplcGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-88, -8.2, 34, 24.5);
    ctx.strokeRect(-88, -8.2, 34, 24.5);
    // 分层模块线 + 侧散热片
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-88, 2.0); ctx.lineTo(-54, 2.0);
    ctx.moveTo(-88, 9.5); ctx.lineTo(-54, 9.5);
    ctx.stroke();
    for (let fy = -5; fy <= 13; fy += 3) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(-55.6, fy, 1.6, 1.2);
    }
    // 进样盘（前抽屉托盘 + 样品瓶矩阵）
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-85.5, -7.2, 16, 7.8);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(-85.5, -7.2, 16, 7.8);
    for (let vy = -5.5; vy <= -1.2; vy += 2.1) {
        for (let vx = -83.5; vx <= -71.5; vx += 2.4) {
            ctx.fillStyle = (Math.round(vx + vy) % 2 === 0) ? '#38bdf8' : '#e2e8f0';
            ctx.beginPath(); ctx.arc(vx, vy, 0.7, 0, Math.PI * 2); ctx.fill();
        }
    }
    // 溶剂瓶 2 个（顶部/南侧架，蓝水相 + 琥珀有机相 + 毛细导管）
    [
        { x: -64.0, y: 12.5, col: '#38bdf8', cap: '#0284c7' },
        { x: -58.2, y: 12.5, col: '#f59e0b', cap: '#b45309' }
    ].forEach(bot => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(bot.x, bot.y, 2.7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bot.col;
        ctx.beginPath(); ctx.arc(bot.x, bot.y, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bot.cap;
        ctx.beginPath(); ctx.arc(bot.x, bot.y, 0.95, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(bot.x, bot.y); ctx.lineTo(bot.x - 3, 6.0); ctx.stroke();
    });
    // HPLC 前状态小条
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-67.5, -6.8, 11.5, 4.5);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('HPLC', -61.8, -4.5);

    // 实验记录板 1 块（置于低矮耗材簇 B 后方空位 x = -35, y = +20.0，避免被 HPLC 高箱体遮挡，面向 -y 方便取用）
    ctx.save();
    ctx.translate(-35, 20.0);
    ctx.rotate(-0.12);
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-5.2, -3.5, 10.4, 7.0);
    ctx.strokeRect(-5.2, -3.5, 10.4, 7.0);
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(-4.3, -2.5, 8.6, 5.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2.0, 2.3, 4.0, 1.4);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    [-1.1, 0.2, 1.5].forEach((ly, i) => {
        ctx.beginPath();
        ctx.moveTo(-3.3, ly);
        ctx.quadraticCurveTo(-0.5, ly - 0.5, 3.0 - i * 0.8, ly + 0.2);
        ctx.stroke();
    });
    ctx.restore();

    // 7D) 耗材簇 B（-50..-20）：24孔样品架 + 96孔板×2（一满一空）+ 镊子 + 刮刀
    // 镊子 (-45, -6.5) & 刮刀 (-37, -7.2)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-48.5, -8.5); ctx.lineTo(-41.5, -5.2);
    ctx.moveTo(-48.5, -7.4); ctx.lineTo(-41.5, -5.2);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-39.5, -8.5, 6.2, 1.1);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-35.0, -8.8, 3.2, 1.7);

    // 24 孔样品架 1 个 (-41, +9，液面高低不同 + 管帽红蓝各异 + 绿/琥珀/蓝/透明液体)
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(-48.5, 2.0, 15, 14);
    ctx.strokeRect(-48.5, 2.0, 15, 14);
    const tubeCols = ['#10b981', '#f59e0b', '#38bdf8', '#e2e8f0'];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            const tx = -46.8 + c * 2.3;
            const ty = 4.0 + r * 3.1;
            const col = tubeCols[(r * 3 + c) % 4];
            const cap = (r + c) % 2 === 0 ? '#ef4444' : '#2563eb';
            const fillR = 0.55 + ((r + c * 2) % 3) * 0.2;
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(tx, ty, 0.85 * fillR, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = cap;
            ctx.lineWidth = 0.45;
            ctx.beginPath(); ctx.arc(tx, ty, 0.9, 0, Math.PI * 2); ctx.stroke();
        }
    }

    // 96 孔板 2 个：上板满板 (-26, -3.5)、下板空板 (-26, +10.5)
    // 满板
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-31.5, -8.0, 10.5, 7.6);
    ctx.strokeRect(-31.5, -8.0, 10.5, 7.6);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            ctx.fillStyle = (r + c) % 3 === 0 ? '#10b981' : ((r + c) % 3 === 1 ? '#38bdf8' : '#cbd5e1');
            ctx.fillRect(-30.3 + c * 1.45, -6.8 + r * 1.4, 0.9, 0.9);
        }
    }
    // 空板
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.fillRect(-31.5, 6.2, 10.5, 7.6);
    ctx.strokeRect(-31.5, 6.2, 10.5, 7.6);
    ctx.fillStyle = '#cbd5e1';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            ctx.fillRect(-30.3 + c * 1.45, 7.4 + r * 1.4, 0.9, 0.9);
        }
    }

    // 7E) 仪器 3：落地式大容量离心机（x = 0, y = +5，高圆柱 + 顶盖 + 转速屏，深灰壳体，完全不同于 02 台台式离心机）
    // 重型圆形减震底环 + 接槽电缆
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -10.5); ctx.lineTo(0, -12.0); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(0, 5.2, 17.5, 0, Math.PI * 2); ctx.fill();
    // 深灰圆柱主体
    const centGrad = ctx.createRadialGradient(-4, 2, 3, 0, 5.2, 16.0);
    centGrad.addColorStop(0, '#64748b');
    centGrad.addColorStop(0.65, '#475569');
    centGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = centGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.arc(0, 5.2, 16.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 顶部不锈钢圆形厚盖 + 铰链 + 中心转子锁扣
    const lidGrad = ctx.createLinearGradient(-11, -5, 11, 15);
    lidGrad.addColorStop(0, '#e2e8f0');
    lidGrad.addColorStop(0.5, '#94a3b8');
    lidGrad.addColorStop(1, '#475569');
    ctx.fillStyle = lidGrad;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.beginPath(); ctx.arc(0, 5.5, 11.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 转子锁扣与透视窗
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(0, 5.5, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(0, 5.5, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-3.0, 16.0, 6.0, 2.2); // 后侧强力铰链
    // 两侧散热缝
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    [-14.2, 14.2].forEach(vx => {
        for (let vy = 2.5; vy <= 8.5; vy += 2.0) {
            ctx.beginPath(); ctx.moveTo(vx - 0.9, vy); ctx.lineTo(vx + 0.9, vy); ctx.stroke();
        }
    });
    // 前斜面板转速屏
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8.5, -10.4, 17.0, 5.2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-8.5, -10.4, 17.0, 5.2);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-7.5, -9.6, 12.2, 3.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('4200RPM', -1.4, -7.75);

    // 7F) 耗材簇 C（+21..+46）：离心管架（15mL×4 + 50mL×2）+ 记号笔 + 台面计时器
    // 记号笔 (+26, -6.5)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(21.5, -7.6, 8.2, 1.8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(29.2, -7.6, 2.2, 1.8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(23.0, -7.4, 2.5, 1.3);
    // 台面计时器 (+41, -5.5：按钮位于靠房间侧 -y，显示屏置于其后朝向操作者)
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(35.5, -9.2, 10.5, 6.8);
    ctx.strokeRect(35.5, -9.2, 10.5, 6.8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(37.2, -8.5, 2.6, 1.1);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(41.4, -8.5, 2.6, 1.1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(36.7, -6.7, 8.1, 3.3);

    // 离心管架 1 个（+33, +9：15mL 管 4 支 + 50mL 管 2 支，管身刻度不同）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(22.5, 2.0, 22, 14.5);
    ctx.strokeRect(22.5, 2.0, 22, 14.5);
    // 4 支 15mL 管（左排，细管蓝盖 + 细刻度线）
    [
        { x: 25.0, y: 5.5, col: '#10b981' },
        { x: 29.0, y: 5.5, col: '#f59e0b' },
        { x: 25.0, y: 12.2, col: '#38bdf8' },
        { x: 29.0, y: 12.2, col: '#e2e8f0' }
    ].forEach(t15 => {
        ctx.fillStyle = t15.col;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.5, 0, Math.PI * 2); ctx.stroke();
        // 细刻度标记
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.45;
        ctx.beginPath(); ctx.moveTo(t15.x - 0.8, t15.y); ctx.lineTo(t15.x + 0.8, t15.y); ctx.stroke();
    });
    // 2 支 50mL 大管（右排，粗管红盖 + 粗刻度线）
    [
        { x: 37.5, y: 5.5, col: '#10b981' },
        { x: 37.5, y: 12.5, col: '#f59e0b' }
    ].forEach(t50 => {
        ctx.fillStyle = t50.col;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.25, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.45, 0, Math.PI * 2); ctx.stroke();
        // 粗双刻度
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(t50.x - 1.3, t50.y - 0.5); ctx.lineTo(t50.x + 1.3, t50.y - 0.5);
        ctx.moveTo(t50.x - 1.3, t50.y + 0.6); ctx.lineTo(t50.x + 1.3, t50.y + 0.6);
        ctx.stroke();
    });

    // 7G) 仪器 4：超声破碎仪（+49..+75，米白主体 + 升降架 + 探头 + 功率屏）
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(62, -7.5); ctx.lineTo(62, -12.0); ctx.stroke();
    // 米白主体发生器
    ctx.fillStyle = '#e7e5e4';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.fillRect(50, -6.5, 16, 22);
    ctx.strokeRect(50, -6.5, 16, 22);
    // 侧面散热百叶
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 0.55;
    for (let sy = 5; sy <= 13; sy += 2.2) {
        ctx.beginPath(); ctx.moveTo(51.5, sy); ctx.lineTo(54.5, sy); ctx.stroke();
    }
    // 功率屏
    ctx.fillStyle = '#06263d';
    ctx.fillRect(51.5, -5.2, 13, 5.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(51.5, -5.2, 13, 5.2);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('240W', 58.0, -2.55);
    // 升降架底座 + 立柱 + 悬臂 + 钛合金超声探头 + 样品杯
    ctx.fillStyle = '#334155';
    ctx.fillRect(67.0, -5.0, 8.0, 20.5);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(67.0, -5.0, 8.0, 20.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(70.5, 9.5, 2.4, 5.5); // 升降立柱
    ctx.fillRect(68.0, 4.0, 4.5, 2.2); // 悬臂夹头
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(69.2, 0.2, 2.0, 4.2); // 超声变幅杆探头
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(70.2, -1.2, 2.2, 0, Math.PI * 2); ctx.fill(); // 样品冰浴杯

    // 7H) 仪器 5：恒温摇床（+84..+116，淡蓝壳体 + 转速屏；动态摇床盘与夹具在 Dynamic 中缓慢小幅晃动）
    // 减震垫 + 接线
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(83.5, -7.2, 33, 25);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.moveTo(100, -7.2); ctx.lineTo(100, -12.0); ctx.stroke();
    // 淡蓝壳体
    const shkGrad = ctx.createLinearGradient(84.5, 0, 115.5, 0);
    shkGrad.addColorStop(0, '#93c5fd');
    shkGrad.addColorStop(0.3, '#dbeafe');
    shkGrad.addColorStop(0.85, '#bfdbfe');
    shkGrad.addColorStop(1, '#60a5fa');
    ctx.fillStyle = shkGrad;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.fillRect(84.5, -6.5, 31, 23.5);
    ctx.strokeRect(84.5, -6.5, 31, 23.5);
    // 侧面散热孔
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 0.55;
    for (let sx = 86.5; sx <= 92.5; sx += 2.0) {
        ctx.beginPath(); ctx.moveTo(sx, 14.5); ctx.lineTo(sx, 16.2); ctx.stroke();
    }
    // 摇床转速屏
    ctx.fillStyle = '#06263d';
    ctx.fillRect(87.5, -5.5, 16.5, 4.6);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(87.5, -5.5, 16.5, 4.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('180RPM', 95.75, -3.15);

    // 7I) 仪器 6：真空干燥箱（+125..+157，深灰方箱 + 观察玻璃门 + 真空表 + 接墙真空管）
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.moveTo(141, -7.5); ctx.lineTo(141, -12.0); ctx.stroke();
    // 后沿接墙真空管
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(149, 17.0); ctx.lineTo(149, 25.9); ctx.stroke();
    // 深灰主体箱
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.95;
    ctx.fillRect(125, -7.5, 32, 24.5);
    ctx.strokeRect(125, -7.5, 32, 24.5);
    // 重型银灰门框与左侧铰链 + 右侧门锁柄
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(126.5, -6.2, 22, 16.5);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(126.5, -6.2, 22, 16.5);
    ctx.fillStyle = '#475569';
    ctx.fillRect(125.6, -3.5, 1.5, 3.0);
    ctx.fillRect(125.6, 4.5, 1.5, 3.0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(147.2, -1.0, 2.2, 5.5);
    // 观察玻璃门（透视内部多孔托盘与干燥皿）
    ctx.fillStyle = '#082f49';
    ctx.fillRect(129.0, -3.8, 16.5, 11.5);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(129.0, -3.8, 16.5, 11.5);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
    ctx.beginPath(); ctx.moveTo(130.5, 2.0); ctx.lineTo(144.0, 2.0); ctx.stroke();
    ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
    ctx.beginPath(); ctx.arc(137.2, 1.8, 2.8, 0, Math.PI * 2); ctx.fill();
    // 真空表（右侧银白圆盘 + 指针）与面向房间的调节旋钮
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(152.2, -2.5, 3.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(152.2, 2.2, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 右侧散热百叶孔
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    for (let vy = 5.0; vy <= 14.0; vy += 2.2) {
        ctx.beginPath(); ctx.moveTo(151.0, vy); ctx.lineTo(155.2, vy); ctx.stroke();
    }

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestBench04Dynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestBench04Dynamic', 440, 280, cx, cy, (octx) => drawWestBench04DynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestBench04DynamicImpl(ctx, cx, cy, unitAngle, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. PCR 仪：温度屏热循环数值 + 底部实时升温进度条
    const pcrPhase = 0.5 + 0.5 * Math.sin(time * 0.45);
    const pcrTemp = (60.2 + pcrPhase * 34.8).toFixed(1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-144.0, -4.2, 14.5, 4.4);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = pcrPhase > 0.7 ? '#f59e0b' : '#38bdf8';
    ctx.fillText(`${pcrTemp}C`, -136.75, -2.35);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-143.0, -0.7, 12.5, 0.7);
    ctx.fillStyle = pcrPhase > 0.7 ? '#f59e0b' : '#10b981';
    ctx.fillRect(-143.0, -0.7, 12.5 * pcrPhase, 0.7);

    // 2. HPLC 液相色谱仪：屏幕实时色谱出峰曲线 + 流动相毛细管液滴流动 + 溶剂瓶液面微晃
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-67.2, -6.5, 10.9, 4.0);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    for (let sx = 0; sx <= 10; sx += 1.0) {
        const u = ((sx * 0.1 + time * 0.45) % 1.0);
        const peak = Math.exp(-Math.pow((u - 0.5) * 7.0, 2)) * 2.2;
        const px = -66.7 + sx;
        const py = -3.1 - peak;
        if (sx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // 蓝水相 & 琥珀有机相毛细管流体脉冲
    [
        { bx: -64.0, col: '#7dd3fc' },
        { bx: -58.2, col: '#fcd34d' }
    ].forEach((cap, ci) => {
        const flowT = (time * 0.85 + ci * 0.5) % 1.0;
        const fx = cap.bx - 3.0 * flowT;
        const fy = 12.5 + (6.0 - 12.5) * flowT;
        ctx.fillStyle = cap.col;
        ctx.beginPath(); ctx.arc(fx, fy, 0.7, 0, Math.PI * 2); ctx.fill();
        // 瓶内液面微光
        const sw = Math.sin(time * 1.8 + ci) * 0.4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.arc(cap.bx, 12.5, 1.35, -0.4 + sw, 0.9 + sw);
        ctx.stroke();
    });

    // 3. 大容量离心机：中心转子高速旋转条 + 动态 RPM 微幅跳动
    const rotAngle = time * 8.5;
    ctx.save();
    ctx.translate(0, 5.5);
    ctx.rotate(rotAngle);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-2.2, 0); ctx.lineTo(2.2, 0);
    ctx.moveTo(0, -2.2); ctx.lineTo(0, 2.2);
    ctx.stroke();
    ctx.restore();
    const centRpm = 4195 + Math.round(Math.sin(time * 2.3) * 8);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-7.5, -9.6, 12.2, 3.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${centRpm}RPM`, -1.4, -7.75);

    // 4. 台面计时器实时倒计时（04:25 循环）
    const b4Sec = 265 - (Math.floor(time) % 265);
    const b4mm = String(Math.floor(b4Sec / 60)).padStart(2, '0');
    const b4ss = String(b4Sec % 60).padStart(2, '0');
    ctx.fillStyle = '#06263d';
    ctx.fillRect(36.7, -6.7, 8.1, 3.3);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${b4mm}:${b4ss}`, 40.75, -5.0);

    // 5. 超声破碎仪：功率屏幕脉冲 + 冰浴样品杯空化声波涟漪
    const usWatt = 236 + Math.round(Math.sin(time * 5.0) * 6);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(51.5, -5.2, 13, 5.2);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${usWatt}W`, 58.0, -2.55);
    const ringR = 0.8 + ((time * 1.9) % 1.0) * 1.45;
    const ringAlpha = 1.0 - ((time * 1.9) % 1.0);
    ctx.strokeStyle = `rgba(224, 242, 254, ${ringAlpha.toFixed(2)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(70.2, -1.2, ringR, 0, Math.PI * 2); ctx.stroke();

    // 6. 恒温摇床：方盘 + 4 组弹簧夹具 + 烧瓶内部漩涡液体晃动 + 屏幕动态扫描
    const ox = Math.cos(time * 3.0) * 0.65;
    const oy = Math.sin(time * 3.0) * 0.65;
    ctx.save();
    ctx.translate(100.0 + ox, 7.6 + oy);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-11.5, -7.2, 23.0, 14.4);
    ctx.strokeRect(-11.5, -7.2, 23.0, 14.4);
    [[-6.0, -3.2], [6.0, -3.2], [-6.0, 3.2], [6.0, 3.2]].forEach(([fx, fy], fi) => {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.arc(fx, fy, 2.7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = fx < 0 ? 'rgba(16, 185, 129, 0.72)' : 'rgba(56, 189, 248, 0.72)';
        ctx.beginPath(); ctx.arc(fx, fy, 1.85, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.75)';
        ctx.lineWidth = 0.45;
        const sa = time * 3.0 + fi * 1.5;
        ctx.beginPath(); ctx.arc(fx, fy, 1.15, sa, sa + 1.4); ctx.stroke();
    });
    ctx.restore();
    const shkRpm = 179 + Math.round(Math.sin(time * 1.5));
    ctx.fillStyle = '#06263d';
    ctx.fillRect(87.5, -5.5, 16.5, 4.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${shkRpm}RPM`, 95.75, -3.15);

    // 7. 真空干燥箱：真空表指针微颤 + 内腔加热琥珀微光 + 真空管抽气脉冲
    const vGlow = 0.14 + 0.1 * Math.sin(time * 1.2);
    ctx.fillStyle = `rgba(245, 158, 11, ${vGlow.toFixed(3)})`;
    ctx.fillRect(129.4, -3.4, 15.7, 10.7);
    const needleAng = -2.2 + Math.sin(time * 4.5) * 0.12;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(152.2, -2.5);
    ctx.lineTo(152.2 + Math.cos(needleAng) * 2.4, -2.5 + Math.sin(needleAng) * 2.4);
    ctx.stroke();
    const vacPulseY = 17.0 + ((time * 1.3) % 1.0) * 8.9;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(149.0, vacPulseY, 0.7, 0, Math.PI * 2); ctx.fill();

    // 8. 六台仪器及墙面插座状态指示灯缓慢呼吸
    [
        { x: -125.5, y: -2.0, on: '#10b981', dim: '#064e3b', spd: 1.4, ph: 0.0 },
        { x: -125.5, y: -4.0, on: '#f59e0b', dim: '#78350f', spd: 0.9, ph: 1.5 },
        { x: -57.0,  y: -5.2, on: '#10b981', dim: '#064e3b', spd: 1.1, ph: 1.2 },
        { x: -57.0,  y: -2.6, on: '#38bdf8', dim: '#0c4a6e', spd: 1.6, ph: 2.1 },
        { x: 6.2,    y: -7.8, on: '#10b981', dim: '#064e3b', spd: 1.5, ph: 0.6 },
        { x: 63.2,   y: -2.6, on: '#ef4444', dim: '#7f1d1d', spd: 2.2, ph: 1.8 },
        { x: 109.5,  y: -3.2, on: '#f59e0b', dim: '#78350f', spd: 1.2, ph: 2.8 },
        { x: 152.2,  y: -6.0, on: '#f59e0b', dim: '#78350f', spd: 0.9, ph: 0.4 },
        { x: 43.6,   y: 26.2, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 0.9 }
    ].forEach(led => {
        const pulse = 0.5 + 0.5 * Math.sin(time * led.spd + led.ph);
        ctx.fillStyle = pulse > 0.35 ? led.on : led.dim;
        ctx.beginPath();
        ctx.arc(led.x, led.y, 0.85, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function drawWestBench04(ctx, cx, cy, unitAngle, time = 0) {
    drawWestBench04Static(ctx, cx, cy, unitAngle);
    drawWestBench04Dynamic(ctx, cx, cy, unitAngle, time);
}

function getWestBench04Obstacle() {
    const cx = 378.59, cy = 1307.44;
    const unitAngle = 0.5824;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 165; // 330 / 2
    const halfH = 25;  // 50 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST ANALYTICAL BENCH 04',
        displayName: 'ANALYTICAL INSTRUMENT BENCH 04',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 220 < camX || cx - 220 > camX + vw || cy + 220 < camY || cy - 220 > camY + vh) return;

            const cacheKey = '__westBench04V1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 420, ch = 260;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBench04Static(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestBench04Dynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

// =========================================================================
// Level 8 · 西侧三角房 · 长试验台 05：底墙中段生物安全/标本储存台 (330x50，静态+动态分离)
// 中心 (687.6, 1510.94)，长轴沿底墙内缘 (0.5824 rad)，占沿墙 455–785
// 西端与 04 台留 5px 空档，东端与 06 台留 5px 空档，南缘距底墙内壁 3px（墙面管线贴墙至 +28）
// =========================================================================
function drawWestBench05Static(ctx, cx, cy, unitAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面投影阴影
    ctx.fillStyle = 'rgba(2, 6, 12, 0.54)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-167, -27.5, 334, 54.5, 2.5) : ctx.rect(-167, -27.5, 334, 54.5);
    ctx.fill();

    // 2. 墙面管线 ×2 + 墙面插座排 ×5 + 墙面挂钩 ×2（贴底墙 y ∈ [+24.6, +28.0]）
    // 2A) 水管（银白，y = +27.3）与气管（深黑，y = +25.9）及固定卡扣
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-162, 27.3); ctx.lineTo(162, 27.3); ctx.stroke();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-162, 27.0); ctx.lineTo(162, 27.0); ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-162, 25.9); ctx.lineTo(162, 25.9); ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-162, 25.7); ctx.lineTo(162, 25.7); ctx.stroke();

    [-130, -65, 0, 65, 130].forEach((clx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#cbd5e1' : '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(clx - 1.2, 24.8, 2.4, 3.2);
        ctx.strokeRect(clx - 1.2, 24.8, 2.4, 3.2);
    });
    // 液氮排气管墙端法兰接口
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.fillRect(-68.5, 24.8, 7.0, 3.2);
    ctx.strokeRect(-68.5, 24.8, 7.0, 3.2);

    // 2B) 墙面插座排 5 个（两孔、三孔、带开关、带指示灯、带 USB 各不相同）
    [
        { x: -144, kind: '2pin' },
        { x: -82,  kind: '3pin' },
        { x: -16,  kind: 'switch' },
        { x: 48,   kind: 'led' },
        { x: 124,  kind: 'usb' }
    ].forEach(out => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.55;
        ctx.fillRect(out.x - 4.2, 24.6, 8.4, 3.3);
        ctx.strokeRect(out.x - 4.2, 24.6, 8.4, 3.3);
        ctx.fillStyle = '#0f172a';
        if (out.kind === '2pin') {
            ctx.fillRect(out.x - 1.8, 25.6, 0.9, 1.4);
            ctx.fillRect(out.x + 0.9, 25.6, 0.9, 1.4);
        } else if (out.kind === '3pin') {
            ctx.fillRect(out.x - 0.45, 25.2, 0.9, 1.0);
            ctx.fillRect(out.x - 2.0, 26.3, 1.1, 0.9);
            ctx.fillRect(out.x + 0.9, 26.3, 1.1, 0.9);
        } else if (out.kind === 'switch') {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(out.x - 3.0, 25.4, 2.2, 1.6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x + 0.5, 25.6, 0.9, 1.3);
            ctx.fillRect(out.x + 2.1, 25.6, 0.9, 1.3);
        } else if (out.kind === 'led') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(out.x - 2.4, 26.2, 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x - 0.4, 25.6, 0.9, 1.3);
            ctx.fillRect(out.x + 1.4, 25.6, 0.9, 1.3);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(out.x - 2.6, 25.5, 2.0, 1.4);
            ctx.fillRect(out.x + 0.6, 25.5, 2.0, 1.4);
        }
    });

    // 2C) 墙面挂钩 2 个（左挂蓝手套、右挂透明防护面屏）
    // 左挂钩 (-157, 25.4) + 折叠丁腈手套
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-158.2, 24.7, 2.4, 2.2);
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-158.6, 25.6); ctx.lineTo(-155.2, 25.6);
    ctx.lineTo(-154.6, 27.9); ctx.lineTo(-156.2, 27.9);
    ctx.lineTo(-157.0, 26.8); ctx.lineTo(-157.8, 27.9);
    ctx.lineTo(-159.2, 27.9); ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 右挂钩 (+157, 25.2) + 防护面屏（深色头箍支架 + 弧形透明蓝聚碳酸酯面罩）
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(155.8, 24.7, 2.4, 2.0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(154.0, 25.1, 6.0, 1.0);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(157.0, 26.0, 3.1, 0.15, Math.PI - 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. 桌腿交叉撑、踢脚与调平脚 6 个（台前缘 y ∈ [-25.0, -23.0]）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    [-129, -64, 0, 64, 129].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx - 22, -24.7); ctx.lineTo(bx + 22, -23.3);
        ctx.moveTo(bx - 22, -23.3); ctx.lineTo(bx + 22, -24.7);
        ctx.stroke();
    });
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-162, -24.3, 324, 1.3);
    [-161, -97, -32, 32, 97, 161].forEach(fx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 2.6, -25.4, 5.2, 2.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 1.8, -25.0, 3.6, 1.2);
    });

    // 4. 台下 4 组各不相同的钢制柜体（y ∈ [-23.0, -12.6]）
    // 4A) 西组 [-161, -83]：带锁标本柜（2 门 + 挂锁 + 生物危害标识 #1：三角黑黄徽标）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-161, -23.0, 78, 10.4);
    ctx.strokeRect(-161, -23.0, 78, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-160, -22.1, 37.2, 8.6);
    ctx.fillRect(-121.2, -22.1, 37.2, 8.6);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-122.0, -22.4); ctx.lineTo(-122.0, -13.1); ctx.stroke();
    // 门把 + 金属挂锁（锁梁 + 黄色/钢制锁体）
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-126.2, -21.2, 1.5, 6.2);
    ctx.fillRect(-119.3, -21.2, 1.5, 6.2);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.arc(-122.0, -19.2, 1.4, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(-123.5, -18.8, 3.0, 2.8);
    ctx.strokeRect(-123.5, -18.8, 3.0, 2.8);
    // 生物危害标识 #1（标本柜门面三角警示贴：黄底黑框三角 + 三叶黑芯）
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-141.5, -21.2); ctx.lineTo(-136.0, -14.2); ctx.lineTo(-147.0, -14.2); ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-141.5, -16.6, 1.2, 0, Math.PI * 2); ctx.fill();

    // 4B) 次西组 [-79, -2]：3 档抽屉（拉手逐档变短：20 -> 13 -> 6）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-79, -23.0, 77, 10.4);
    ctx.strokeRect(-79, -23.0, 77, 10.4);
    [
        { y: -22.4, hw: 20.0 },
        { y: -19.1, hw: 13.0 },
        { y: -15.8, hw: 6.0 }
    ].forEach((dr, dIdx) => {
        ctx.fillStyle = dIdx % 2 === 0 ? '#64748b' : '#475569';
        ctx.fillRect(-77.5, dr.y, 74, 2.6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-77.5, dr.y, 74, 2.6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-40.5 - dr.hw / 2, dr.y + 0.9, dr.hw, 0.9);
    });

    // 4C) 次东组 [+2, +79]：开放格（上层冻存盒 2 个 + 下层黄生物危害废弃桶 1 个）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.75;
    ctx.fillRect(2, -23.0, 77, 10.4);
    ctx.strokeRect(2, -23.0, 77, 10.4);
    // 钢层板
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3, -18.2, 75, 1.0);
    // 上层：冻存盒 2 个（左蓝盖、右翡翠盖）
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(12, -16.8, 22, 3.4);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(12, -16.8, 22, 3.4);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(43, -16.8, 22, 3.4);
    ctx.strokeRect(43, -16.8, 22, 3.4);
    // 下层：生物危害废弃桶 1 个黄桶 + 生物危害标识 #2（菱形黑框警示标 + 警示条纹）
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(24, -22.4, 32, 3.8);
    ctx.strokeRect(24, -22.4, 32, 3.8);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, -22.4, 32, 0.95); // 黑色投料翻盖沿
    // 生物危害标识 #2（菱形框 + 内部黑黄分格，与标识 #1 三角不同）
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(40, -21.3); ctx.lineTo(42.5, -19.9); ctx.lineTo(40, -18.5); ctx.lineTo(37.5, -19.9); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(40, -19.9, 0.65, 0, Math.PI * 2); ctx.fill();

    // 4D) 东组 [+83, +161]：深柜（单门 + 把手 + 散热孔）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(83, -23.0, 78, 10.4);
    ctx.strokeRect(83, -23.0, 78, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(84.2, -22.0, 75.6, 8.4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(87.2, -21.0, 1.8, 6.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    for (let vx = 122; vx <= 154; vx += 3.6) {
        ctx.beginPath(); ctx.moveTo(vx, -20.8); ctx.lineTo(vx + 2.0, -14.8); ctx.stroke();
    }

    // 5. 不锈钢银白边框环氧台面（330x37.6 @ x ∈ [-165, +165], y ∈ [-12.6, +25.0]，网格蚀刻 + 钢印 BENCH-05）
    const topGrad = ctx.createLinearGradient(0, -12.6, 0, 25);
    topGrad.addColorStop(0, '#334155');
    topGrad.addColorStop(0.2, '#1e293b');
    topGrad.addColorStop(0.85, '#0f172a');
    topGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-165, -12.6, 330, 37.6);

    // 精细蚀刻网格
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.5;
    for (let gx = -150; gx <= 150; gx += 15) {
        ctx.beginPath(); ctx.moveTo(gx, -11.0); ctx.lineTo(gx, 23.5); ctx.stroke();
    }
    for (let gy = -6; gy <= 20; gy += 8.5) {
        ctx.beginPath(); ctx.moveTo(-163.5, gy); ctx.lineTo(163.5, gy); ctx.stroke();
    }

    // 四周不锈钢凸边
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-164.25, -11.85, 328.5, 36.1);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-165, -12.6, 330, 37.6);

    // 台面编号钢印 BENCH-05
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-162, -12.2, 20, 4.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-162, -12.2, 20, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('BENCH-05', -152, -10.05);

    // =====================================================================
    // 6. 超低温与液氮储存核心模块 + 样本处理耗材（全件仅出现一次，互不重复）
    // =====================================================================

    // 6A) 超低温冰箱 1 个（-151..-113，-80°C 立柜 + 深灰厚门 + 白字 -80°C + 门把 + 温度屏 + 报警灯）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-151, -7.8, 38, 26.5); // 隔振底座
    // 不锈钢外壳包边
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-150, -7.2, 36, 25.2);
    ctx.strokeRect(-150, -7.2, 36, 25.2);
    // 深灰厚门（主视觉面）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-147.5, -5.8, 31, 21.5);
    ctx.strokeRect(-147.5, -5.8, 31, 21.5);
    // 厚门右侧重型金属门把手 + 左侧双铰链
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-119.5, -2.5, 2.2, 11.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-119.5, -2.5, 2.2, 11.5);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-149.2, -3.5, 1.8, 3.2);
    ctx.fillRect(-149.2, 8.5, 1.8, 3.2);
    // 深灰门面醒目白字 -80°C
    ctx.font = 'bold 2.8px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('-80°C', -132.5, 6.5);
    // 后沿散热格栅
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.6;
    for (let vx = -146; vx <= -122; vx += 2.6) {
        ctx.beginPath(); ctx.moveTo(vx, 16.2); ctx.lineTo(vx, 17.8); ctx.stroke();
    }
    // 顶部温度屏底座（动态温度数值 + 报警灯在 Dynamic 绘制）
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-145.5, -4.8, 17.5, 5.4);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-145.5, -4.8, 17.5, 5.4);

    // 6B) 耗材簇 A（-112..-85）：冻存管盒 2 个（一开一合，绿/蓝管帽不同）+ 镊子 + 刮刀
    // 冻存管盒 1（开启，-104, -3：翡翠绿管帽）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.65;
    ctx.fillRect(-110, -7.2, 12.0, 9.2);
    ctx.strokeRect(-110, -7.2, 12.0, 9.2);
    ctx.fillStyle = '#10b981';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            ctx.beginPath(); ctx.arc(-107.8 + c * 2.5, -5.0 + r * 2.5, 0.7, 0, Math.PI * 2); ctx.fill();
        }
    }
    // 折盖向墙侧 (+y) 翻开，方便实验人员从房间内侧 (-y) 取用冻存管
    ctx.fillStyle = 'rgba(167, 243, 208, 0.28)';
    ctx.fillRect(-110, 2.2, 12.0, 2.3);
    // 冻存管盒 2（闭合，-104, +11：天蓝封盖与锁扣）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-110, 6.0, 12.0, 9.5);
    ctx.strokeRect(-110, 6.0, 12.0, 9.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-108.5, 7.5, 9.0, 6.5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-105.5, 5.1, 3.0, 1.2);
    // 镊子 (-91, -4) & 刮刀 (-91, +11)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-94.5, -7.5); ctx.lineTo(-87.0, -2.5);
    ctx.moveTo(-94.5, -6.3); ctx.lineTo(-87.0, -2.5);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-94.5, 9.5, 6.5, 1.2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-88.5, 9.2, 3.0, 1.8);

    // 6C) 液氮储存罐 1 个（-83..-47，银白圆柱罐 + 顶盖 + 蓝液位计 + 排气管入墙）
    // 排气管入墙（保温银白管接至墙面水管/排气管）
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-65, 18.0); ctx.lineTo(-65, 27.3); ctx.stroke();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-65.8, 18.0); ctx.lineTo(-65.8, 27.3); ctx.stroke();
    // 罐体底座阴影圈
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-65, 5.2, 16.8, 0, Math.PI * 2); ctx.fill();
    // 银白圆柱罐身
    const ln2Grad = ctx.createRadialGradient(-69, 2, 2, -65, 5.2, 15.6);
    ln2Grad.addColorStop(0, '#f8fafc');
    ln2Grad.addColorStop(0.55, '#cbd5e1');
    ln2Grad.addColorStop(1, '#64748b');
    ctx.fillStyle = ln2Grad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.arc(-65, 5.2, 15.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 罐盖 + 提环锁扣
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(-65, 5.2, 8.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.fillRect(-68.5, 4.2, 7.0, 2.0);
    // 蓝色液位计（罐前显著蓝色刻度液位条）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-72.0, -8.5, 14.0, 3.6);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-72.0, -8.5, 14.0, 3.6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-71.0, -7.7, 9.6, 2.0);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('LN2', -65, 10.6);

    // 实验记录板 1 块（置于低矮样本转运箱后方空位 x = -31, y = +20.2，不遮挡、面向房间内侧 -y）
    ctx.save();
    ctx.translate(-31, 20.2);
    ctx.rotate(0.10);
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-4.8, -3.2, 9.6, 6.4);
    ctx.strokeRect(-4.8, -3.2, 9.6, 6.4);
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(-4.0, -2.3, 8.0, 4.7);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-1.8, 2.1, 3.6, 1.3);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    [-0.9, 0.3, 1.5].forEach((ly, i) => {
        ctx.beginPath(); ctx.moveTo(-3.0, ly); ctx.lineTo(2.6 - i * 0.7, ly + 0.15); ctx.stroke();
    });
    ctx.restore();

    // 6D) 耗材簇 B（-45..-16）：标签打印机 1 个 + 记号笔 1 支 + 样本转运箱 1 个（硬壳低温箱款，区别于 03 台）
    // 标签打印机 (-33, -4.5)：方箱 + 出纸口 + 白色条码标签纸
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-41.5, -8.5, 14.5, 9.5);
    ctx.strokeRect(-41.5, -8.5, 14.5, 9.5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-39.5, -7.2, 10.5, 2.0); // 出纸槽
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-38.0, -10.5, 7.5, 3.2); // 吐出的标签纸
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-37.0, -9.8, 5.5, 0.7);
    ctx.fillRect(-37.0, -8.6, 3.8, 0.6);
    // 记号笔 (-21, -5.5)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-25.0, -7.2, 7.2, 1.6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-18.2, -7.2, 2.0, 1.6);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-23.5, -7.0, 2.2, 1.1);
    // 样本转运箱 1 个 (-31, +10：加强筋银白箱盖 + 折叠提手 + 蓝翠温度贴)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-42.5, 3.5, 23.0, 13.5);
    ctx.strokeRect(-42.5, 3.5, 23.0, 13.5);
    // 双侧扣与顶提手
    ctx.fillStyle = '#334155';
    ctx.fillRect(-43.2, 8.0, 1.5, 4.5);
    ctx.fillRect(-20.2, 8.0, 1.5, 4.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(-35.0, 8.2, 8.0, 3.8);
    // 温度贴 (-20°C 贴片)
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-40.5, 5.0, 7.0, 3.4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-39.6, 5.8, 2.4, 1.8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-36.6, 5.8, 2.2, 1.8);

    // 6E) 冻存架 1 组（-13..+19，并排 3 列抽屉 A1/B4/C9 面向房间侧 -y 拉出，带前侧拉手）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-13, -5.5, 31, 23.0);
    ctx.strokeRect(-13, -5.5, 31, 23.0);
    [
        { x: -11.5, w: 8.6, col: '#0284c7', txt: 'A1', txtCol: '#e0f2fe', pull: 2.8 },
        { x: -1.8,  w: 8.6, col: '#10b981', txt: 'B4', txtCol: '#ecfdf5', pull: 1.3 },
        { x: 7.9,   w: 8.6, col: '#f59e0b', txt: 'C9', txtCol: '#fef3c7', pull: 0.0 }
    ].forEach(tier => {
        const ty = -4.2 - tier.pull;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(tier.x, ty, tier.w, 20.5);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(tier.x, ty, tier.w, 20.5);
        ctx.fillStyle = tier.col;
        ctx.fillRect(tier.x + 0.8, ty + 2.2, tier.w - 1.6, 16.8);
        ctx.strokeRect(tier.x + 0.8, ty + 2.2, tier.w - 1.6, 16.8);
        ctx.font = 'bold 2.4px monospace';
        ctx.fillStyle = tier.txtCol;
        ctx.fillText(tier.txt, tier.x + tier.w / 2, ty + 10.6);
        // 前侧（-y 面向房间）抽屉拉手
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(tier.x + 1.8, ty - 0.9, tier.w - 3.6, 1.3);
    });

    // 6F) 耗材簇 C（+22..+48）：台面计时器 1 个（按钮在 -y 前缘、屏在后）+ 离心管架 1 个
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(28.5, -9.6, 12.5, 6.8);
    ctx.strokeRect(28.5, -9.6, 12.5, 6.8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(30.4, -8.9, 3.2, 1.1);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(35.8, -8.9, 3.2, 1.1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(29.8, -7.1, 9.9, 3.5);

    // 离心管架 (+35, +9：15mL×4 蓝盖细刻度 + 50mL×2 红盖粗刻度)
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(23.5, 2.0, 22.5, 15.0);
    ctx.strokeRect(23.5, 2.0, 22.5, 15.0);
    [
        { x: 26.2, y: 5.8, col: '#10b981' },
        { x: 30.4, y: 5.8, col: '#f59e0b' },
        { x: 26.2, y: 12.6, col: '#38bdf8' },
        { x: 30.4, y: 12.6, col: '#e2e8f0' }
    ].forEach(t15 => {
        ctx.fillStyle = t15.col;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.5, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.45;
        ctx.beginPath(); ctx.moveTo(t15.x - 0.8, t15.y); ctx.lineTo(t15.x + 0.8, t15.y); ctx.stroke();
    });
    [
        { x: 39.2, y: 5.8, col: '#10b981' },
        { x: 39.2, y: 12.8, col: '#38bdf8' }
    ].forEach(t50 => {
        ctx.fillStyle = t50.col;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.25, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.45, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(t50.x - 1.3, t50.y - 0.5); ctx.lineTo(t50.x + 1.3, t50.y - 0.5);
        ctx.moveTo(t50.x - 1.3, t50.y + 0.6); ctx.lineTo(t50.x + 1.3, t50.y + 0.6);
        ctx.stroke();
    });

    // 6G) 标本柜 1 个（+50..+94，带锁玻璃柜 + 门内 2 层样品架 + 层板）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(51, -7.8, 42, 25.5);
    ctx.strokeRect(51, -7.8, 42, 25.5);
    // 深蓝玻璃内腔
    ctx.fillStyle = '#082f49';
    ctx.fillRect(53.2, -5.5, 37.6, 21.0);
    // 门内 2 层钢层板 + 2 层样品架/冻存瓶
    [2.0, 10.5].forEach((sy, sIdx) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(54.0, sy, 36.0, 1.4);
        for (let rx = 56.5; rx <= 87.5; rx += 5.2) {
            ctx.fillStyle = (rx + sIdx) % 2 === 0 ? '#10b981' : '#38bdf8';
            ctx.fillRect(rx, sy - 4.2, 3.4, 3.8);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(rx + 0.6, sy - 5.0, 2.2, 0.8);
        }
    });
    // 双玻璃门竖框 + 锁芯 + 双把手
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.95;
    ctx.strokeRect(53.2, -5.5, 18.8, 21.0);
    ctx.strokeRect(72.0, -5.5, 18.8, 21.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(69.6, -2.2, 1.2, 5.2);
    ctx.fillRect(73.2, -2.2, 1.2, 5.2);
    // 中缝圆柱门锁
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.arc(72.0, 4.5, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 6H) 传递窗 1 个（+104..+154，方窗 + 双门 + 门把 + 内部紫外灯管静态支架，微光在 Dynamic 绘）
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.95;
    ctx.fillRect(104, -7.8, 48, 25.5);
    ctx.strokeRect(104, -7.8, 48, 25.5);
    // 内部腔体
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(107.5, -4.5, 41.0, 19.0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(107.5, -4.5, 41.0, 19.0);
    // 传递窗双门边框（前后/左右互锁对开门）+ 门把手
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(108.5, -3.5, 19.0, 17.0);
    ctx.strokeRect(128.5, -3.5, 19.0, 17.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(125.0, 1.5, 1.4, 6.0);
    ctx.fillRect(129.6, 1.5, 1.4, 6.0);
    // 紫外灯管灯座（x ∈ [112, 144], y = 5.0）
    ctx.fillStyle = '#475569';
    ctx.fillRect(111.5, 3.8, 2.2, 2.4);
    ctx.fillRect(142.3, 3.8, 2.2, 2.4);
    // 互锁标牌与前缘互锁控制面板（面向房间侧 -y）
    ctx.fillStyle = '#06263d';
    ctx.fillRect(108.5, -7.3, 12.5, 2.3);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('PASS-BOX', 131.5, -5.8);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestBench05Dynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestBench05Dynamic', 440, 280, cx, cy, (octx) => drawWestBench05DynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestBench05DynamicImpl(ctx, cx, cy, unitAngle, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 超低温冰箱：动态 -80°C 数值 + 压缩机运行进度条 + 前门缝冷气微雾
    const tempVal = (-80.0 + Math.sin(time * 0.42) * 0.4).toFixed(1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-145.0, -4.4, 16.5, 4.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${tempVal}C`, -136.75, -2.5);
    const compLoad = 0.55 + 0.35 * Math.sin(time * 0.9);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-144.0, -0.9, 14.5, 0.7);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-144.0, -0.9, 14.5 * compLoad, 0.7);
    const frostDrift = 0.22 + 0.14 * Math.sin(time * 1.4);
    ctx.fillStyle = `rgba(224, 242, 254, ${frostDrift.toFixed(3)})`;
    ctx.fillRect(-146.0, -7.2, 28.0, 1.3);

    // 2. 液氮储存罐：蓝色液位计微波动 + 罐口冷雾流动 + 排气管冷凝流体脉冲
    const ln2Level = 8.4 + Math.sin(time * 0.7) * 1.2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-71.2, -7.8, 12.4, 2.2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-71.0, -7.7, ln2Level, 2.0);
    // 罐盖冷雾圈脉冲
    const mistR = 4.2 + ((time * 0.75) % 1.0) * 5.8;
    const mistA = (1.0 - ((time * 0.75) % 1.0)) * 0.36;
    ctx.strokeStyle = `rgba(224, 242, 254, ${mistA.toFixed(3)})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(-65, 5.2, mistR, 0, Math.PI * 2); ctx.stroke();
    // 排气管向墙排冷气液滴脉冲
    const exhY = 18.2 + ((time * 1.15) % 1.0) * 8.8;
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath(); ctx.arc(-65.0, exhY, 0.85, 0, Math.PI * 2); ctx.fill();

    // 3. 冻存架：拉出的 A1 抽屉冷雾闪烁 + 状态灯
    const a1Frost = 0.16 + 0.12 * Math.sin(time * 1.8);
    ctx.fillStyle = `rgba(186, 230, 253, ${a1Frost.toFixed(3)})`;
    ctx.fillRect(-10.8, -5.2, 7.2, 16.0);

    // 4. 台面计时器：实时倒计时数字 (12:40 循环)
    const b5Sec = 760 - (Math.floor(time) % 760);
    const b5mm = String(Math.floor(b5Sec / 60)).padStart(2, '0');
    const b5ss = String(b5Sec % 60).padStart(2, '0');
    ctx.fillStyle = '#06263d';
    ctx.fillRect(29.8, -7.1, 9.9, 3.5);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${b5mm}:${b5ss}`, 34.75, -5.35);

    // 5. 标本柜：内部冷光微闪 + 2 层样品瓶液面流动反光
    const cabGlow = 0.08 + 0.06 * Math.sin(time * 1.1);
    ctx.fillStyle = `rgba(56, 189, 248, ${cabGlow.toFixed(3)})`;
    ctx.fillRect(54.0, -4.8, 36.0, 19.6);
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
    ctx.lineWidth = 0.45;
    [2.0, 10.5].forEach((sy, sIdx) => {
        for (let rx = 56.5; rx <= 87.5; rx += 5.2) {
            const w = Math.sin(time * 1.6 + rx * 0.4 + sIdx) * 0.35;
            ctx.beginPath();
            ctx.moveTo(rx + 0.4, sy - 2.2 + w);
            ctx.lineTo(rx + 3.0, sy - 2.2 - w);
            ctx.stroke();
        }
    });

    // 6. 传递窗：紫外灯管微光起伏 + UV 扫描光束 + 前面板互锁指示条
    const uvPulse = 0.45 + 0.35 * Math.sin(time * 1.15);
    ctx.fillStyle = `rgba(56, 189, 248, ${(uvPulse * 0.24).toFixed(3)})`;
    ctx.fillRect(109.5, -2.0, 37.0, 14.0);
    const scanX = 110.5 + ((Math.sin(time * 1.2) * 0.5 + 0.5) * 35.0);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(scanX, -2.5); ctx.lineTo(scanX, 12.5); ctx.stroke();
    ctx.strokeStyle = `rgba(186, 230, 253, ${(0.55 + 0.35 * uvPulse).toFixed(2)})`;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(113.7, 5.0); ctx.lineTo(142.3, 5.0);
    ctx.stroke();
    const uvPct = ((time * 0.12) % 1.0);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(109.2, -6.7, 11.1 * uvPct, 1.1);

    // 7. 各模块及墙面插座状态指示灯缓慢呼吸
    [
        { x: -124.2, y: -3.2, on: '#ef4444', dim: '#7f1d1d', spd: 1.8, ph: 0.0 },
        { x: -124.2, y: -1.0, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 1.0 },
        { x: -55.0,  y: -6.8, on: '#38bdf8', dim: '#0c4a6e', spd: 1.3, ph: 2.0 },
        { x: -29.0,  y: -7.2, on: '#10b981', dim: '#064e3b', spd: 2.4, ph: 0.4 }, // 标签打印机出纸灯
        { x: -35.0,  y: 6.7,  on: '#38bdf8', dim: '#0c4a6e', spd: 1.5, ph: 1.2 }, // 转运箱温度灯
        { x: 64.0,   y: -6.6, on: '#10b981', dim: '#064e3b', spd: 1.1, ph: 0.5 },
        { x: 146.5,  y: -5.8, on: '#c084fc', dim: '#4c1d95', spd: 1.4, ph: 1.7 },
        { x: 45.6,   y: 26.2, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 0.9 }
    ].forEach(led => {
        const p = 0.5 + 0.5 * Math.sin(time * led.spd + led.ph);
        ctx.fillStyle = p > 0.35 ? led.on : led.dim;
        ctx.beginPath();
        ctx.arc(led.x, led.y, 0.85, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function drawWestBench05(ctx, cx, cy, unitAngle, time = 0) {
    drawWestBench05Static(ctx, cx, cy, unitAngle);
    drawWestBench05Dynamic(ctx, cx, cy, unitAngle, time);
}

function getWestBench05Obstacle() {
    const cx = 658.37, cy = 1491.69;
    const unitAngle = 0.5824;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 165; // 330 / 2
    const halfH = 25;  // 50 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST BIOSAFETY BENCH 05',
        displayName: 'BIOSAFETY & SPECIMEN STORAGE BENCH 05',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 220 < camX || cx - 220 > camX + vw || cy + 220 < camY || cy - 220 > camY + vh) return;

            const cacheKey = '__westBench05V1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 420, ch = 260;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBench05Static(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestBench05Dynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

// =========================================================================
// Level 8 · 西侧三角房 · 长试验台 06：底墙东段湿化学台 (330x50，静态+动态分离)
// 中心 (938.14, 1675.95)，长轴沿底墙内缘 (0.5824 rad)，占沿墙 755–1085
// 西端与 05 台留 5px 空档，东端距通道 2 西墙 ~54px（与 04 台西端到北墙 ~53px 对称）
// 南缘距底墙内壁 3px（墙面管线与排风管道贴墙至 +28）
// =========================================================================
function drawWestBench06Static(ctx, cx, cy, unitAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面投影阴影
    ctx.fillStyle = 'rgba(2, 6, 12, 0.54)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-167, -27.5, 334, 54.5, 2.5) : ctx.rect(-167, -27.5, 334, 54.5);
    ctx.fill();

    // 2. 墙面管线 ×2 + 墙面插座排 ×5 + 墙面挂钩 ×2 + 气阀墙端分支（贴底墙 y ∈ [+24.6, +28.0]）
    // 2A) 水管（银白，y = +27.3）与气管（深黑，y = +25.9）及固定卡扣
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.45;
    ctx.beginPath(); ctx.moveTo(-162, 27.3); ctx.lineTo(162, 27.3); ctx.stroke();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-162, 27.0); ctx.lineTo(162, 27.0); ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-162, 25.9); ctx.lineTo(162, 25.9); ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-162, 25.7); ctx.lineTo(162, 25.7); ctx.stroke();

    [-132, -72, -32, 48, 126].forEach((clx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#cbd5e1' : '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(clx - 1.2, 24.8, 2.4, 3.2);
        ctx.strokeRect(clx - 1.2, 24.8, 2.4, 3.2);
    });

    // 2B) 墙面插座排 5 个（两孔、三孔、带开关、带指示灯、带 USB 各不相同）
    [
        { x: -148, kind: '2pin' },
        { x: -80,  kind: '3pin' },
        { x: -52,  kind: 'switch' },
        { x: 56,   kind: 'led' },
        { x: 134,  kind: 'usb' }
    ].forEach(out => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.55;
        ctx.fillRect(out.x - 4.2, 24.6, 8.4, 3.3);
        ctx.strokeRect(out.x - 4.2, 24.6, 8.4, 3.3);
        ctx.fillStyle = '#0f172a';
        if (out.kind === '2pin') {
            ctx.fillRect(out.x - 1.8, 25.6, 0.9, 1.4);
            ctx.fillRect(out.x + 0.9, 25.6, 0.9, 1.4);
        } else if (out.kind === '3pin') {
            ctx.fillRect(out.x - 0.45, 25.2, 0.9, 1.0);
            ctx.fillRect(out.x - 2.0, 26.3, 1.1, 0.9);
            ctx.fillRect(out.x + 0.9, 26.3, 1.1, 0.9);
        } else if (out.kind === 'switch') {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(out.x - 3.0, 25.4, 2.2, 1.6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x + 0.5, 25.6, 0.9, 1.3);
            ctx.fillRect(out.x + 2.1, 25.6, 0.9, 1.3);
        } else if (out.kind === 'led') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(out.x - 2.4, 26.2, 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x - 0.4, 25.6, 0.9, 1.3);
            ctx.fillRect(out.x + 1.4, 25.6, 0.9, 1.3);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(out.x - 2.6, 25.5, 2.0, 1.4);
            ctx.fillRect(out.x + 0.6, 25.5, 2.0, 1.4);
        }
    });

    // 2C) 墙面挂钩 2 个（左挂防酸手套、右挂实验擦拭抹布）
    // 左挂钩 (-159, 25.3) + 黄色耐酸橡胶手套
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-160.2, 24.7, 2.4, 2.2);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-160.6, 25.6); ctx.lineTo(-157.2, 25.6);
    ctx.lineTo(-156.6, 27.9); ctx.lineTo(-158.1, 27.9);
    ctx.lineTo(-159.0, 26.8); ctx.lineTo(-159.9, 27.9);
    ctx.lineTo(-161.2, 27.9); ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 右挂钩 (+159, 25.3) + 蓝白格实验抹布
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(157.8, 24.7, 2.4, 2.2);
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.fillRect(156.4, 25.4, 5.2, 2.5);
    ctx.strokeRect(156.4, 25.4, 5.2, 2.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(157.1, 25.5, 1.1, 2.3);
    ctx.fillRect(159.6, 25.5, 1.1, 2.3);

    // 3. 桌腿交叉撑、踢脚与调平脚 6 个（台前缘 y ∈ [-25.0, -23.0]）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    [-129, -64, 0, 64, 129].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx - 22, -24.7); ctx.lineTo(bx + 22, -23.3);
        ctx.moveTo(bx - 22, -23.3); ctx.lineTo(bx + 22, -24.7);
        ctx.stroke();
    });
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-162, -24.3, 324, 1.3);
    [-161, -97, -32, 32, 97, 161].forEach(fx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 2.6, -25.4, 5.2, 2.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 1.8, -25.0, 3.6, 1.2);
    });

    // 4. 台下 4 组各不相同的钢制柜体（y ∈ [-23.0, -12.6]）
    // 4A) 西组 [-161, -83]：带锁双开门柜（2 门 + 中央锁扣 + 竖拉手）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-161, -23.0, 78, 10.4);
    ctx.strokeRect(-161, -23.0, 78, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-160, -22.1, 37.2, 8.6);
    ctx.fillRect(-121.2, -22.1, 37.2, 8.6);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-122.0, -22.4); ctx.lineTo(-122.0, -13.1); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-126.2, -21.2, 1.5, 6.2);
    ctx.fillRect(-119.3, -21.2, 1.5, 6.2);
    // 柜门铜芯圆锁
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(-122.0, -17.8, 1.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-122.3, -18.5, 0.6, 1.4);

    // 4B) 次西组 [-79, -2]：3 档抽屉（拉手逐档变短：20 -> 13 -> 6）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-79, -23.0, 77, 10.4);
    ctx.strokeRect(-79, -23.0, 77, 10.4);
    [
        { y: -22.4, hw: 20.0 },
        { y: -19.1, hw: 13.0 },
        { y: -15.8, hw: 6.0 }
    ].forEach((dr, dIdx) => {
        ctx.fillStyle = dIdx % 2 === 0 ? '#64748b' : '#475569';
        ctx.fillRect(-77.5, dr.y, 74, 2.6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-77.5, dr.y, 74, 2.6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-40.5 - dr.hw / 2, dr.y + 0.9, dr.hw, 0.9);
    });

    // 4C) 次东组 [+2, +79]：开放格（上层试剂桶 2 个 + 下层蓝/白废液桶各 1 个）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.75;
    ctx.fillRect(2, -23.0, 77, 10.4);
    ctx.strokeRect(2, -23.0, 77, 10.4);
    // 钢层板
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3, -18.2, 75, 1.0);
    // 上层：试剂桶 2 个（左琥珀耐酸桶、右深灰溶剂桶，配螺口盖）
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(14, -16.9, 18, 3.5);
    ctx.strokeRect(14, -16.9, 18, 3.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(20, -16.9, 5, 1.1);
    ctx.fillStyle = '#475569';
    ctx.fillRect(46, -16.9, 18, 3.5);
    ctx.strokeRect(46, -16.9, 18, 3.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(52, -16.9, 5, 1.1);
    // 下层：蓝、白废液桶各 1 个
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(12, -22.5, 22, 3.9);
    ctx.strokeRect(12, -22.5, 22, 3.9);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(19, -22.5, 8, 1.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(45, -22.5, 22, 3.9);
    ctx.strokeRect(45, -22.5, 22, 3.9);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(52, -22.5, 8, 1.0);

    // 4D) 东组 [+83, +161]：深柜（单门 + 把手 + 散热百叶孔）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(83, -23.0, 78, 10.4);
    ctx.strokeRect(83, -23.0, 78, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(84.2, -22.0, 75.6, 8.4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(87.2, -21.0, 1.8, 6.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    for (let vx = 122; vx <= 154; vx += 3.6) {
        ctx.beginPath(); ctx.moveTo(vx, -20.8); ctx.lineTo(vx + 2.0, -14.8); ctx.stroke();
    }

    // 5. 304 不锈钢凸边环氧耐酸台面（330x37.6 @ x ∈ [-165, +165], y ∈ [-12.6, +25.0]，精细网格 + BENCH-06 钢印）
    const topGrad = ctx.createLinearGradient(0, -12.6, 0, 25);
    topGrad.addColorStop(0, '#334155');
    topGrad.addColorStop(0.2, '#1e293b');
    topGrad.addColorStop(0.85, '#0f172a');
    topGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-165, -12.6, 330, 37.6);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.5;
    for (let gx = -150; gx <= 150; gx += 15) {
        ctx.beginPath(); ctx.moveTo(gx, -11.0); ctx.lineTo(gx, 23.5); ctx.stroke();
    }
    for (let gy = -6; gy <= 20; gy += 8.5) {
        ctx.beginPath(); ctx.moveTo(-163.5, gy); ctx.lineTo(163.5, gy); ctx.stroke();
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-164.25, -11.85, 328.5, 36.1);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-165, -12.6, 330, 37.6);

    // 台面编号钢印 BENCH-06
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-162, -12.2, 20, 4.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-162, -12.2, 20, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('BENCH-06', -152, -10.05);

    // =====================================================================
    // 6. 湿化学核心模块与台面器皿（全件仅出现一次，结构不重复 01 台）
    // =====================================================================

    // 6A) 最西端功能区 [-162, -103]：旋转蒸发仪 + 单层试剂架(4瓶) + 移液器架(3支) + 培养皿/镊子/药匙
    // 旋转蒸发仪（x ∈ [-160, -135], y ∈ [-7.2, +14.2]）：恒温水浴锅 + 斜置主机/冷凝管 + 接收烧瓶
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-159.5, -7.2, 23.5, 21.2);
    ctx.strokeRect(-159.5, -7.2, 23.5, 21.2);
    // 恒温水浴锅（圆形不锈钢槽 + 淡蓝水浴）
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath(); ctx.arc(-151.5, -1.2, 6.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.arc(-151.5, -1.2, 4.6, 0, Math.PI * 2); ctx.fill();
    // 驱动机头 + 立柱 + 斜置玻璃冷凝管
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-156.5, 6.8, 6.0, 6.4);
    ctx.strokeRect(-156.5, 6.8, 6.0, 6.4);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-150.5, 8.6); ctx.lineTo(-140.0, 12.6); ctx.lineTo(-137.5, 8.2); ctx.lineTo(-148.0, 4.4); ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 内螺旋冷却盘管
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-148.5, 6.6); ctx.lineTo(-145.5, 8.4); ctx.lineTo(-143.5, 7.2); ctx.lineTo(-140.5, 9.6);
    ctx.stroke();
    // 接收圆底烧瓶 + 前沿数显控温/转速面板（面向房间侧 -y）
    ctx.fillStyle = 'rgba(186, 230, 253, 0.38)';
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.arc(-140.2, -1.5, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-158.0, -6.8, 12.0, 3.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-158.0, -6.8, 12.0, 3.2);

    // 单层试剂架（沿南墙缘 x ∈ [-133, -103], y ∈ [+14.5, +23.5]）：1 层木质搁板 + 1 根防倒栏 + 4 个试剂瓶
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-133, 14.5, 30, 9.0);
    ctx.strokeRect(-133, 14.5, 30, 9.0);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-131, 18.8); ctx.lineTo(-105, 18.8); ctx.stroke();
    // 4 个高度/液位/瓶盖色各异的试剂瓶（琥珀、蓝、无色、绿）
    [
        { x: -129.0, w: 5.2, h: 6.4, body: '#b45309', liq: '#f59e0b', cap: '#0f172a' },
        { x: -122.0, w: 4.8, h: 5.6, body: '#1d4ed8', liq: '#60a5fa', cap: '#e2e8f0' },
        { x: -115.2, w: 5.4, h: 6.8, body: '#cbd5e1', liq: '#bae6fd', cap: '#dc2626' },
        { x: -108.2, w: 4.6, h: 5.2, body: '#047857', liq: '#34d399', cap: '#fbbf24' }
    ].forEach(b => {
        ctx.fillStyle = b.body;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(b.x - b.w / 2, 16.0, b.w, b.h);
        ctx.strokeRect(b.x - b.w / 2, 16.0, b.w, b.h);
        ctx.fillStyle = b.liq;
        ctx.fillRect(b.x - b.w / 2 + 0.6, 16.0 + b.h * 0.42, b.w - 1.2, b.h * 0.5);
        ctx.fillStyle = b.cap;
        ctx.fillRect(b.x - 1.3, 14.9, 2.6, 1.3);
    });
    // 单根金属防倒挡杆（架在瓶身前侧护栏位置，朝房间侧防倾倒）
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.moveTo(-132.5, 18.2); ctx.lineTo(-103.5, 18.2); ctx.stroke();

    // 移液器架 + 3 支不同长度移液器（手柄帽面向房间侧 -y 方便握取）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-132.5, 2.5, 13.5, 8.2);
    ctx.strokeRect(-132.5, 2.5, 13.5, 8.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-131.5, 8.8, 11.5, 1.2);
    [
        { px: -129.2, len: 12.2, col: '#38bdf8' },
        { px: -125.7, len: 10.0, col: '#10b981' },
        { px: -122.2, len: 7.8,  col: '#f8fafc' }
    ].forEach(pip => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.45;
        ctx.fillRect(pip.px - 0.8, 8.8 - pip.len, 1.6, pip.len);
        ctx.strokeRect(pip.px - 0.8, 8.8 - pip.len, 1.6, pip.len);
        ctx.fillStyle = pip.col;
        ctx.fillRect(pip.px - 1.1, 8.0 - pip.len, 2.2, 1.5);
    });

    // 培养皿（淡黄琼脂）+ 镊子 + 药匙（x ∈ [-117, -102], y ∈ [-7.5, +11.5]）
    ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.arc(-109.5, 4.5, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(-109.5, 4.5, 4.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-111.5, 3.2); ctx.lineTo(-107.8, 5.8); ctx.stroke();
    // 镊子
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-115.5, -6.5); ctx.lineTo(-103.5, -5.0);
    ctx.moveTo(-115.5, -4.6); ctx.lineTo(-103.5, -5.0);
    ctx.stroke();
    // 双头药匙
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-115.0, -2.0); ctx.lineTo(-104.0, -2.0); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.ellipse(-115.2, -2.0, 1.3, 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-104.2, -2.6, 1.5, 1.2);

    // 6B) 水槽西（x = -90，方形水槽 + 弯颈龙头 + 挡水板 + 皂液瓶，与东圆形槽及 01 台完全不同）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-100, -7.5, 20, 26.5);
    ctx.strokeRect(-100, -7.5, 20, 26.5);
    // 方形盆体
    ctx.fillStyle = '#334155';
    ctx.fillRect(-97.5, -5.2, 15, 18.5);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-97.5, -5.2, 15, 18.5);
    // 盆内底水渍/反光点
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath(); ctx.arc(-93.2, 2.4, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-86.8, -1.8, 1.3, 0, Math.PI * 2); ctx.fill();
    // 排水口 + 橡胶塞
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-90.0, 4.0, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.beginPath(); ctx.arc(-86.5, 8.5, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(-86.5, 8.5); ctx.lineTo(-85.0, 13.5); ctx.stroke();
    // 后挡水板
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-99.5, 15.6, 19, 3.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-99.5, 15.6, 19, 3.2);
    // 弯颈水龙头
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-90.0, 16.5); ctx.lineTo(-90.0, 10.5); ctx.arc(-91.6, 10.5, 1.6, 0, Math.PI, true); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-90.0, 16.8, 1.3, 0, Math.PI * 2); ctx.fill();
    // 皂液瓶
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(-84.5, 13.2, 3.4, 4.0);
    ctx.strokeRect(-84.5, 13.2, 3.4, 4.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-83.4, 12.1, 1.2, 1.2);

    // 6C) 小型通风橱（x ∈ [-76, +50]，宽 126px，半开玻璃视窗 + 刻度 + 网孔台面 + 圆底烧瓶 + 试管架 + 排风管 + 风速屏 + 进风口）
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-76, -9.5, 126, 33.2);
    ctx.strokeRect(-76, -9.5, 126, 33.2);
    // 顶部排风管接墙（x ∈ [-20, -8], y ∈ [+21.5, +28.0]）
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-20, 21.5, 12, 6.5);
    ctx.strokeRect(-20, 21.5, 12, 6.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-22, 23.2, 16, 1.6);
    ctx.strokeRect(-22, 23.2, 16, 1.6);
    // 内腔网孔工作台面（x ∈ [-68, +34], y ∈ [-1.5, +19.5]）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-68, -1.5, 102, 21.0);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    for (let gx = -64; gx <= 30; gx += 4.5) {
        ctx.beginPath(); ctx.moveTo(gx, -1.0); ctx.lineTo(gx, 19.0); ctx.stroke();
    }
    for (let gy = 1.5; gy <= 17.5; gy += 4.0) {
        ctx.beginPath(); ctx.moveTo(-67.5, gy); ctx.lineTo(33.5, gy); ctx.stroke();
    }
    // 橱内：1 个圆底烧瓶（左中 x = -38, y = +9.2）+ 夹持铁架台
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-45, 13.5, 14, 3.0);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-38, 15.0); ctx.lineTo(-38, 9.2); ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(-38, 8.8, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 橱内：1 个试管架（右中 x ∈ [-10, +22], y ∈ [+5.0, +13.5]），内插 5 支彩色试剂试管
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-10, 5.2, 32, 8.2);
    ctx.strokeRect(-10, 5.2, 32, 8.2);
    ['#38bdf8', '#f59e0b', '#10b981', '#e2e8f0', '#f43f5e'].forEach((tCol, ti) => {
        const tx = -5.5 + ti * 5.7;
        ctx.fillStyle = tCol;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.45;
        ctx.beginPath(); ctx.arc(tx, 9.3, 1.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // 右侧进风百叶口（x ∈ [+36, +48.5], y ∈ [-4.5, +16.5]）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(36.5, -4.0, 11.5, 20.0);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    for (let ly = -2.0; ly <= 14.5; ly += 2.6) {
        ctx.beginPath(); ctx.moveTo(37.8, ly); ctx.lineTo(46.7, ly); ctx.stroke();
    }
    // 面板风速监控屏（x ∈ [-71, -44], y ∈ [-8.8, -3.6]）
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-71, -8.8, 27, 5.2);
    ctx.strokeRect(-71, -8.8, 27, 5.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('0.52m/s', -60, -6.15);
    // 半开透明玻璃视窗（向后方 +y 拉起半开，保留房间侧 -y 前半段操作开口，拉手横杆位于开口上缘 y = +4.2）
    ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-70, 4.2, 105, 12.5);
    ctx.strokeRect(-70, 4.2, 105, 12.5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-70, 4.2, 105, 1.3);
    // 视窗开启高度刻度（左轨 x = -69.2）
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.45;
    for (let ty = -2.5; ty <= 16.5; ty += 3.0) {
        ctx.beginPath(); ctx.moveTo(-71.2, ty); ctx.lineTo(-68.6, ty); ctx.stroke();
    }

    // 6D) 东中部玻璃器皿区 + 氧气阀 + 带玻璃门试剂柜（x ∈ [+53, +98]）
    // 蒸馏与玻璃器皿（x ∈ [+53, +68], y ∈ [-8.0, +18.0]）：直形冷凝管 + 分液漏斗 + 圆底烧瓶 + 量筒
    // 直形冷凝管（垂直透明夹套 + 内管 + 两侧水嘴）
    ctx.fillStyle = 'rgba(224, 242, 254, 0.28)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.55;
    ctx.fillRect(54.8, 5.5, 3.8, 12.0);
    ctx.strokeRect(54.8, 5.5, 3.8, 12.0);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(56.7, 4.0); ctx.lineTo(56.7, 18.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(53.2, 7.6); ctx.lineTo(54.8, 7.6); ctx.moveTo(58.6, 15.2); ctx.lineTo(60.2, 15.2); ctx.stroke();
    // 分液漏斗（梨形腔 + 聚四氟乙烯旋塞）
    ctx.fillStyle = 'rgba(254, 240, 138, 0.36)';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.arc(64.5, 9.2, 3.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(62.2, 5.0, 4.6, 1.3); // 旋塞
    ctx.strokeStyle = '#f8fafc';
    ctx.beginPath(); ctx.moveTo(64.5, 4.0); ctx.lineTo(64.5, 6.2); ctx.stroke();
    // 圆底烧瓶（底部含琥珀色液）
    ctx.fillStyle = 'rgba(245, 158, 11, 0.42)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(57.2, -2.8, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(56.1, -7.2, 2.2, 1.2);
    // 量筒（正置：六角底座位于 +y 底侧、管口朝 -y 方向，与烧瓶同向）
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(62.4, 0.8, 5.0, 1.4);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.fillRect(63.6, -7.2, 2.6, 8.0);
    ctx.strokeRect(63.6, -7.2, 2.6, 8.0);
    for (let cyTick = -5.5; cyTick <= -0.5; cyTick += 1.6) {
        ctx.beginPath(); ctx.moveTo(63.7, cyTick); ctx.lineTo(64.8, cyTick); ctx.stroke();
    }

    // 氧气阀（x = +61, y = +21.5）：铜质分气管接入墙面气管 + 绿色手轮
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.moveTo(61.0, 21.5); ctx.lineTo(61.0, 25.9); ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(59.0, 19.8, 4.0, 3.4);
    ctx.strokeRect(59.0, 19.8, 4.0, 3.4);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath(); ctx.arc(61.0, 21.5, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#dcfce7';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(59.2, 21.5); ctx.lineTo(62.8, 21.5); ctx.moveTo(61.0, 19.7); ctx.lineTo(61.0, 23.3); ctx.stroke();

    // 小型带玻璃门试剂柜（x ∈ [+70, +98], y ∈ [-7.5, +22.2]，内部 2 层小试剂瓶）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.fillRect(70, -7.5, 28, 29.7);
    ctx.strokeRect(70, -7.5, 28, 29.7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(71.8, -5.5, 24.4, 25.7);
    // 内部 2 层钢搁板（y = +3.5, +12.5）
    ctx.fillStyle = '#64748b';
    ctx.fillRect(72.0, 3.2, 24.0, 1.1);
    ctx.fillRect(72.0, 12.2, 24.0, 1.1);
    // 上、下层小试剂瓶
    [
        { x: 75.5, y: 13.8, c: '#d97706' },
        { x: 80.5, y: 13.8, c: '#38bdf8' },
        { x: 85.5, y: 13.8, c: '#e2e8f0' },
        { x: 91.0, y: 13.8, c: '#10b981' },
        { x: 76.0, y: 4.8,  c: '#ef4444' },
        { x: 81.5, y: 4.8,  c: '#facc15' },
        { x: 87.0, y: 4.8,  c: '#3b82f6' },
        { x: 92.2, y: 4.8,  c: '#cbd5e1' }
    ].forEach(sb => {
        ctx.fillStyle = sb.c;
        ctx.fillRect(sb.x - 1.6, sb.y, 3.2, 4.8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(sb.x - 0.9, sb.y - 0.9, 1.8, 0.9);
    });
    // 透明玻璃门与金属锁扣
    ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.65;
    ctx.fillRect(71.4, -6.2, 25.2, 27.0);
    ctx.strokeRect(71.4, -6.2, 25.2, 27.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(81.5, -7.2, 5.0, 1.2);

    // 6E) 水槽东（x = +110，圆形水槽 + 双控龙头 + 弹簧软管喷枪，与西方形槽及 01 台完全不同）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(100, -7.5, 20, 26.5);
    ctx.strokeRect(100, -7.5, 20, 26.5);
    // 圆形不锈钢深盆
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.arc(110.0, 3.2, 7.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 圆形盆内水渍
    ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
    ctx.beginPath(); ctx.arc(106.2, 5.2, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(113.5, 0.2, 1.2, 0, Math.PI * 2); ctx.fill();
    // 排水口 + 塞子
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(110.0, 3.2, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.beginPath(); ctx.arc(113.6, 7.6, 1.1, 0, Math.PI * 2); ctx.fill();
    // 双控冷热阀门 + 主嘴
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(105.0, 14.5, 10.0, 2.6);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(105.8, 15.8, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(114.2, 15.8, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(110.0, 15.6); ctx.lineTo(110.0, 9.5); ctx.stroke();
    // 弹簧软管喷枪（绕主嘴右旁弧形弹簧卷）
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(112.4, 15.0); ctx.lineTo(115.0, 12.8); ctx.lineTo(112.2, 11.2); ctx.lineTo(114.8, 9.2);
    ctx.stroke();

    // 6F) 最东端（x ∈ [+123, +162]）：氩气阀 + 台面计时器 + 记录板
    // 氩气阀（x = +146, y = +21.5）：灰管接入墙面气管 + 白色手轮（与氧气阀口径/颜色不同）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.85;
    ctx.beginPath(); ctx.moveTo(146.0, 21.5); ctx.lineTo(146.0, 25.9); ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(144.3, 20.0, 3.4, 3.0);
    ctx.strokeRect(144.3, 20.0, 3.4, 3.0);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(146.0, 21.5, 2.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(146.0, 21.5, 0.7, 0, Math.PI * 2); ctx.fill();

    // 台面计时器（x ∈ [+124, +140], y ∈ [+7.2, +16.6]）：倾斜壳体 + 深色屏幕框 + 按键
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(124.5, 7.2, 15.5, 9.4);
    ctx.strokeRect(124.5, 7.2, 15.5, 9.4);
    ctx.fillStyle = '#020617';
    ctx.fillRect(126.0, 10.6, 12.5, 4.6);
    // 底部 3 颗操作按键
    ctx.fillStyle = '#10b981';
    ctx.fillRect(126.8, 8.2, 2.8, 1.4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(130.8, 8.2, 2.8, 1.4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(134.8, 8.2, 2.8, 1.4);

    // 记录板（x ∈ [+125, +156], y ∈ [-7.8, +4.2]）：深棕夹板 + 白纸 + 银夹子 + 3 行手写线
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(125.5, -7.8, 29.0, 11.8);
    ctx.strokeRect(125.5, -7.8, 29.0, 11.8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(127.5, -6.5, 25.0, 9.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(135.5, 1.5, 9.0, 2.0);
    ctx.strokeRect(135.5, 1.5, 9.0, 2.0);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    [0.0, -2.2, -4.4].forEach((ly, li) => {
        ctx.beginPath(); ctx.moveTo(129.5, ly); ctx.lineTo(148.5 - li * 2.5, ly); ctx.stroke();
    });
    // 旁置实验记号笔
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.moveTo(156.5, -6.5); ctx.lineTo(158.0, 3.0); ctx.stroke();

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestBench06Dynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestBench06Dynamic', 440, 280, cx, cy, (octx) => drawWestBench06DynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestBench06DynamicImpl(ctx, cx, cy, unitAngle, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 旋转蒸发仪：水浴锅沸腾气泡与旋流 + 冷凝管馏分下流液滴 + 接收瓶液面晃动 + 前置数显
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-157.6, -6.4, 11.2, 2.4);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('58C', -152.0, -5.2);
    // 水浴锅内旋转液面弧 + 冒泡
    const bathAng = time * 2.4;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(-151.5, -1.2, 3.0, bathAng, bathAng + 1.9); ctx.stroke();
    for (let bi = 0; bi < 3; bi++) {
        const bp = ((time * 0.9 + bi * 0.33) % 1.0);
        ctx.fillStyle = `rgba(224, 242, 254, ${(1 - bp).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(-153.2 + bi * 1.7, 0.8 - bp * 3.8, 0.55, 0, Math.PI * 2);
        ctx.fill();
    }
    // 斜置冷凝管冷凝液流动液滴 -> 滴入接收烧瓶
    const condT = (time * 0.8) % 1.0;
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(-148.5 + condT * 8.3, 8.2 + (2.0 - 8.2) * condT, 0.75, 0, Math.PI * 2);
    ctx.fill();
    const wave = Math.sin(time * 1.6);
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-142.6, -1.4 + wave * 0.45);
    ctx.lineTo(-137.8, -1.4 - wave * 0.45);
    ctx.stroke();

    // 2. 水槽西（方形槽）& 水槽东（圆形槽）：龙头滴水液珠 + 排水口水面扩散涟漪
    const dropW = (time * 1.05) % 1.0;
    ctx.fillStyle = `rgba(125, 211, 252, ${(1 - dropW * 0.5).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(-93.2, 10.5 - dropW * 6.5, 0.65, 0, Math.PI * 2); ctx.fill();
    const ripW = 1.6 + ((time * 1.1) % 1.0) * 4.5;
    ctx.strokeStyle = `rgba(125, 211, 252, ${(0.55 * (1 - ((time * 1.1) % 1.0))).toFixed(2)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(-90.0, 4.0, ripW, 0, Math.PI * 2); ctx.stroke();

    const dropE = (time * 0.9 + 0.45) % 1.0;
    ctx.fillStyle = `rgba(125, 211, 252, ${(1 - dropE * 0.5).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(110.0, 9.5 - dropE * 6.3, 0.65, 0, Math.PI * 2); ctx.fill();
    const ripE = 1.6 + ((time * 0.95 + 0.4) % 1.0) * 4.5;
    ctx.strokeStyle = `rgba(125, 211, 252, ${(0.55 * (1 - ((time * 0.95 + 0.4) % 1.0))).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(110.0, 3.2, ripE, 0, Math.PI * 2); ctx.stroke();

    // 3. 小型通风橱：动态风速数字 + 排风气流流线 + 圆底烧瓶磁力搅拌与气泡 + 5 试管液面微晃
    const vel = (0.51 + Math.sin(time * 1.7) * 0.02).toFixed(2);
    ctx.fillStyle = '#020617';
    ctx.fillRect(-70.2, -8.3, 21.5, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${vel}m/s`, -59.5, -6.15);
    // 橱内向排风口上升气流线
    for (let si = 0; si < 3; si++) {
        const airP = ((time * 0.75 + si * 0.33) % 1.0);
        const ax = -42 + si * 24;
        const ay = 4.0 + airP * 14.5;
        ctx.strokeStyle = `rgba(148, 163, 184, ${(0.35 * Math.sin(airP * Math.PI)).toFixed(2)})`;
        ctx.lineWidth = 0.55;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(-14 + (ax + 14) * (1 - airP * 0.5), ay + 2.2); ctx.stroke();
    }
    // 通风橱圆底烧瓶磁力搅拌子旋转 + 液面晃动 + 气泡
    ctx.save();
    ctx.translate(-38, 8.8);
    ctx.rotate(time * 6.0);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-1.8, -0.45, 3.6, 0.9);
    ctx.restore();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-41.5, 8.6 + wave * 0.55);
    ctx.lineTo(-34.5, 8.6 - wave * 0.55);
    ctx.stroke();
    // 5 支试管液面闪烁
    for (let ti = 0; ti < 5; ti++) {
        const tw = Math.sin(time * 2.0 + ti) * 0.35;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.arc(-5.5 + ti * 5.7, 9.3, 1.1, tw, tw + 1.3);
        ctx.stroke();
    }

    // 4. 东中部玻璃器皿：直形冷凝管冷却水自下而上流动 + 分液漏斗分液晃动与滴落 + 圆底烧瓶/量筒微晃
    const coolT = (time * 1.1) % 1.0;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(56.7, 6.2 + coolT * 10.6, 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(56.7, 6.2 + ((coolT + 0.5) % 1.0) * 10.6, 0.65, 0, Math.PI * 2); ctx.fill();
    // 分液漏斗两相液面 + 旋塞处缓慢滴液
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(62.2, 9.2 + wave * 0.3);
    ctx.lineTo(66.8, 9.2 - wave * 0.3);
    ctx.stroke();
    const sepDrop = (time * 0.7) % 1.0;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(64.5, 4.6 - sepDrop * 4.5, 0.65, 0, Math.PI * 2); ctx.fill();
    // 圆底烧瓶 & 量筒液面微晃
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.beginPath();
    ctx.moveTo(54.8, -2.6 + wave * 0.35);
    ctx.lineTo(59.6, -2.6 - wave * 0.35);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.6)';
    ctx.beginPath();
    ctx.moveTo(63.8, -3.2 - wave * 0.3);
    ctx.lineTo(66.0, -3.2 + wave * 0.3);
    ctx.stroke();

    // 5. 单层试剂架 4 瓶液体微反光 + 带玻璃门试剂柜内部微光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.45;
    [-129.0, -122.0, -115.2, -108.2].forEach((bx, bi) => {
        const w = Math.sin(time * 1.4 + bi * 1.2) * 0.3;
        ctx.beginPath();
        ctx.moveTo(bx - 1.4, 19.2 + w);
        ctx.lineTo(bx + 1.4, 19.2 - w);
        ctx.stroke();
    });
    const rCabGlow = 0.06 + 0.05 * Math.sin(time * 1.0);
    ctx.fillStyle = `rgba(56, 189, 248, ${rCabGlow.toFixed(3)})`;
    ctx.fillRect(72.0, -5.0, 24.0, 24.6);

    // 6. 台面计时器实时倒计时数字（15:00 循环）
    const totalSec = 900 - (Math.floor(time) % 900);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    ctx.fillStyle = '#020617';
    ctx.fillRect(126.0, 10.6, 12.5, 4.6);
    ctx.font = 'bold 2.6px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(mm + ':' + ss, 132.25, 12.9);

    // 7. 各仪器与墙面插座指示灯及气阀气流微光
    [
        { x: -147.2, y: -5.2, on: '#f59e0b', dim: '#78350f', spd: 1.5, ph: 0.2 }, // 旋蒸加热灯
        { x: -156.2, y: 8.5,  on: '#38bdf8', dim: '#0c4a6e', spd: 1.8, ph: 1.1 }, // 旋蒸旋转灯
        { x: -46.8,  y: -6.2, on: '#10b981', dim: '#064e3b', spd: 1.4, ph: 0.0 }, // 通风橱风速灯
        { x: 74.0,   y: -6.8, on: '#10b981', dim: '#064e3b', spd: 0.9, ph: 0.8 }, // 试剂柜锁灯
        { x: 138.8,  y: 15.6, on: '#38bdf8', dim: '#0c4a6e', spd: 2.0, ph: 1.4 }, // 计时器灯
        { x: 53.6,   y: 26.2, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 0.5 }, // 墙面插座灯
        { x: 61.0,   y: 23.8, on: '#4ade80', dim: '#14532d', spd: 1.7, ph: 0.3 }, // 氧气阀气流微灯
        { x: 146.0,  y: 23.8, on: '#e2e8f0', dim: '#475569', spd: 1.3, ph: 2.0 }  // 氩气阀气流微灯
    ].forEach(led => {
        const pulse = 0.5 + 0.5 * Math.sin(time * led.spd + led.ph);
        ctx.fillStyle = pulse > 0.35 ? led.on : led.dim;
        ctx.beginPath(); ctx.arc(led.x, led.y, 0.85, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
}

function drawWestBench06(ctx, cx, cy, unitAngle, time = 0) {
    drawWestBench06Static(ctx, cx, cy, unitAngle);
    drawWestBench06Dynamic(ctx, cx, cy, unitAngle, time);
}

function getWestBench06Obstacle() {
    const cx = 938.14, cy = 1675.95;
    const unitAngle = 0.5824;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 165; // 330 / 2
    const halfH = 25;  // 50 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST WET CHEMISTRY BENCH 06',
        displayName: 'WET CHEMISTRY BENCH 06',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 220 < camX || cx - 220 > camX + vw || cy + 220 < camY || cy - 220 > camY + vh) return;

            const cacheKey = '__westBench06V1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 420, ch = 260;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBench06Static(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestBench06Dynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

// =========================================================================
// Level 8 · 西侧三角房 · 长试验台 01：北墙西段湿化学台 (283x50，静态+动态分离，照 06 号型)
// 中心 (362.19, 1079.26)，长轴沿北墙内缘 (-0.665 rad)，占沿墙 100–383
// 东端与 02 台留 5px 空档，北缘距北墙内壁 3px（墙面管线与排风管道贴墙至 -28），正面朝房间内侧 (+y)
// =========================================================================
function drawWestBench01Static(ctx, cx, cy, unitAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面投影阴影
    ctx.fillStyle = 'rgba(2, 6, 12, 0.54)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-143.5, -27.0, 287, 54.5, 2.5) : ctx.rect(-143.5, -27.0, 287, 54.5);
    ctx.fill();

    // 2. 墙面管线 ×2 + 墙面插座排 ×5 + 墙面挂钩 ×2（贴北墙 y ∈ [-28.0, -24.6]）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.45;
    ctx.beginPath(); ctx.moveTo(-139, -27.3); ctx.lineTo(139, -27.3); ctx.stroke();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-139, -27.0); ctx.lineTo(139, -27.0); ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-139, -25.9); ctx.lineTo(139, -25.9); ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-139, -25.7); ctx.lineTo(139, -25.7); ctx.stroke();

    [-112, -56, 0, 56, 112].forEach((clx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#cbd5e1' : '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(clx - 1.2, -28.0, 2.4, 3.2);
        ctx.strokeRect(clx - 1.2, -28.0, 2.4, 3.2);
    });

    // 墙面插座排 5 个
    [
        { x: -126, kind: '2pin' },
        { x: -72,  kind: '3pin' },
        { x: -24,  kind: 'switch' },
        { x: 46,   kind: 'led' },
        { x: 118,  kind: 'usb' }
    ].forEach(out => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.55;
        ctx.fillRect(out.x - 4.2, -27.9, 8.4, 3.3);
        ctx.strokeRect(out.x - 4.2, -27.9, 8.4, 3.3);
        ctx.fillStyle = '#0f172a';
        if (out.kind === '2pin') {
            ctx.fillRect(out.x - 1.8, -27.0, 0.9, 1.4);
            ctx.fillRect(out.x + 0.9, -27.0, 0.9, 1.4);
        } else if (out.kind === '3pin') {
            ctx.fillRect(out.x - 0.45, -26.2, 0.9, 1.0);
            ctx.fillRect(out.x - 2.0, -27.2, 1.1, 0.9);
            ctx.fillRect(out.x + 0.9, -27.2, 1.1, 0.9);
        } else if (out.kind === 'switch') {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(out.x - 3.0, -27.0, 2.2, 1.6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x + 0.5, -26.9, 0.9, 1.3);
            ctx.fillRect(out.x + 2.1, -26.9, 0.9, 1.3);
        } else if (out.kind === 'led') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(out.x - 2.4, -26.2, 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x - 0.4, -26.9, 0.9, 1.3);
            ctx.fillRect(out.x + 1.4, -26.9, 0.9, 1.3);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(out.x - 2.6, -26.9, 2.0, 1.4);
            ctx.fillRect(out.x + 0.6, -26.9, 2.0, 1.4);
        }
    });

    // 墙面挂钩 2 个（左挂防酸手套、右挂实验擦拭抹布）
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-137.2, -26.9, 2.4, 2.2);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-137.6, -25.6); ctx.lineTo(-134.2, -25.6);
    ctx.lineTo(-133.6, -27.9); ctx.lineTo(-135.1, -27.9);
    ctx.lineTo(-136.0, -26.8); ctx.lineTo(-136.9, -27.9);
    ctx.lineTo(-138.2, -27.9); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(134.8, -26.9, 2.4, 2.2);
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.fillRect(133.4, -27.9, 5.2, 2.5);
    ctx.strokeRect(133.4, -27.9, 5.2, 2.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(134.1, -27.8, 1.1, 2.3);
    ctx.fillRect(136.6, -27.8, 1.1, 2.3);

    // 3. 桌腿交叉撑、踢脚与调平脚 6 个（台前缘面向房间 y ∈ [+23.0, +25.0]）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    [-110, -55, 0, 55, 110].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx - 20, 23.3); ctx.lineTo(bx + 20, 24.7);
        ctx.moveTo(bx - 20, 24.7); ctx.lineTo(bx + 20, 23.3);
        ctx.stroke();
    });
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-139, 23.0, 278, 1.3);
    [-138, -83, -28, 28, 83, 138].forEach(fx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 2.6, 23.2, 5.2, 2.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 1.8, 23.8, 3.6, 1.2);
    });

    // 4. 台下 4 组各不相同的钢制柜体（y ∈ [+12.6, +23.0]，朝房间侧 +y）
    // 4A) 西组 [-138, -72]：带锁双开门柜
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-138, 12.6, 66, 10.4);
    ctx.strokeRect(-138, 12.6, 66, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-137, 13.5, 31.2, 8.6);
    ctx.fillRect(-104.2, 13.5, 31.2, 8.6);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-105.0, 13.1); ctx.lineTo(-105.0, 22.4); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-109.2, 15.0, 1.5, 6.2);
    ctx.fillRect(-102.3, 15.0, 1.5, 6.2);
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(-105.0, 17.8, 1.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-105.3, 17.1, 0.6, 1.4);

    // 4B) 次西组 [-68, -2]：3 档抽屉（拉手逐档变短）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-68, 12.6, 66, 10.4);
    ctx.strokeRect(-68, 12.6, 66, 10.4);
    [
        { y: 13.2, hw: 6.0 },
        { y: 16.5, hw: 13.0 },
        { y: 19.8, hw: 20.0 }
    ].forEach((dr, dIdx) => {
        ctx.fillStyle = dIdx % 2 === 0 ? '#475569' : '#64748b';
        ctx.fillRect(-66.5, dr.y, 63, 2.6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-66.5, dr.y, 63, 2.6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-35.0 - dr.hw / 2, dr.y + 0.9, dr.hw, 0.9);
    });

    // 4C) 次东组 [+2, +68]：开放格（试剂桶 2 + 废液桶 2）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.75;
    ctx.fillRect(2, 12.6, 66, 10.4);
    ctx.strokeRect(2, 12.6, 66, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3, 17.2, 64, 1.0);
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(10, 13.4, 16, 3.5);
    ctx.strokeRect(10, 13.4, 16, 3.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(15.5, 15.8, 5, 1.1);
    ctx.fillStyle = '#475569';
    ctx.fillRect(42, 13.4, 16, 3.5);
    ctx.strokeRect(42, 13.4, 16, 3.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(47.5, 15.8, 5, 1.1);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(9, 18.6, 20, 3.9);
    ctx.strokeRect(9, 18.6, 20, 3.9);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(15, 21.5, 8, 1.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, 18.6, 20, 3.9);
    ctx.strokeRect(40, 18.6, 20, 3.9);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(46, 21.5, 8, 1.0);

    // 4D) 东组 [+72, +138]：深柜（单门 + 把手 + 散热百叶孔）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(72, 12.6, 66, 10.4);
    ctx.strokeRect(72, 12.6, 66, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(73.2, 13.6, 63.6, 8.4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(76.2, 14.8, 1.8, 6.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    for (let vx = 104; vx <= 132; vx += 3.6) {
        ctx.beginPath(); ctx.moveTo(vx, 14.8); ctx.lineTo(vx + 2.0, 20.8); ctx.stroke();
    }

    // 5. 304 不锈钢凸边环氧耐酸台面（283x37.6 @ x ∈ [-141.5, +141.5], y ∈ [-25.0, +12.6]，网格 + BENCH-01 钢印）
    const topGrad = ctx.createLinearGradient(0, -25.0, 0, 12.6);
    topGrad.addColorStop(0, '#1e293b');
    topGrad.addColorStop(0.15, '#0f172a');
    topGrad.addColorStop(0.8, '#1e293b');
    topGrad.addColorStop(1, '#334155');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-141.5, -25.0, 283, 37.6);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.5;
    for (let gx = -128; gx <= 128; gx += 15) {
        ctx.beginPath(); ctx.moveTo(gx, -23.5); ctx.lineTo(gx, 11.0); ctx.stroke();
    }
    for (let gy = -20; gy <= 6; gy += 8.5) {
        ctx.beginPath(); ctx.moveTo(-140.0, gy); ctx.lineTo(140.0, gy); ctx.stroke();
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-140.75, -24.25, 281.5, 36.1);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-141.5, -25.0, 283, 37.6);

    // 台面编号钢印 BENCH-01（西南前沿面向房间）
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-138.5, 8.0, 20, 4.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-138.5, 8.0, 20, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('BENCH-01', -128.5, 10.15);

    // =====================================================================
    // 6. 湿化学核心模块与台面器皿（1:1 比例，操作面朝向房间侧 +y）
    // =====================================================================

    // 6A) 最西端功能区 [-139, -95]：旋转蒸发仪 + 单层试剂架(4瓶) + 移液器架(3支) + 培养皿/镊子/药匙
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-138.5, -14.0, 23.0, 21.0);
    ctx.strokeRect(-138.5, -14.0, 23.0, 21.0);
    // 恒温水浴锅
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath(); ctx.arc(-130.5, -1.5, 6.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.arc(-130.5, -1.5, 4.6, 0, Math.PI * 2); ctx.fill();
    // 驱动机头 + 冷凝管 + 接收瓶 + 前置数显（朝 +y）
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-135.5, -13.0, 6.0, 6.2);
    ctx.strokeRect(-135.5, -13.0, 6.0, 6.2);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-129.5, -8.5); ctx.lineTo(-119.5, -12.5); ctx.lineTo(-117.0, -8.1); ctx.lineTo(-127.0, -4.3); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-127.5, -6.5); ctx.lineTo(-124.5, -8.3); ctx.lineTo(-122.5, -7.1); ctx.lineTo(-119.5, -9.5);
    ctx.stroke();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.38)';
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.arc(-119.6, -1.2, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-137.0, 3.4, 12.0, 3.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-137.0, 3.4, 12.0, 3.2);

    // 单层试剂架（靠北墙 -y：x ∈ [-138.5, -110.5], y ∈ [-23.5, -15.0]，防倒挡杆朝房间 +y）
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-138.5, -23.5, 28.0, 8.5);
    ctx.strokeRect(-138.5, -23.5, 28.0, 8.5);
    [
        { x: -134.8, w: 5.0, h: 6.0, body: '#b45309', liq: '#f59e0b', cap: '#0f172a' },
        { x: -128.2, w: 4.6, h: 5.4, body: '#1d4ed8', liq: '#60a5fa', cap: '#e2e8f0' },
        { x: -121.6, w: 5.2, h: 6.4, body: '#cbd5e1', liq: '#bae6fd', cap: '#dc2626' },
        { x: -115.0, w: 4.6, h: 5.0, body: '#047857', liq: '#34d399', cap: '#fbbf24' }
    ].forEach(b => {
        ctx.fillStyle = b.body;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(b.x - b.w / 2, -22.2, b.w, b.h);
        ctx.strokeRect(b.x - b.w / 2, -22.2, b.w, b.h);
        ctx.fillStyle = b.liq;
        ctx.fillRect(b.x - b.w / 2 + 0.6, -22.2 + b.h * 0.1, b.w - 1.2, b.h * 0.48);
        ctx.fillStyle = b.cap;
        ctx.fillRect(b.x - 1.3, -16.5, 2.6, 1.3);
    });
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.moveTo(-138.0, -18.0); ctx.lineTo(-111.0, -18.0); ctx.stroke();

    // 移液器架 + 3 支移液器 + 培养皿/镊子/药匙（x ∈ [-114, -95]）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-113.5, -10.5, 13.0, 8.0);
    ctx.strokeRect(-113.5, -10.5, 13.0, 8.0);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-112.5, -9.8, 11.0, 1.2);
    [
        { px: -110.2, len: 11.5, col: '#38bdf8' },
        { px: -107.0, len: 9.5,  col: '#10b981' },
        { px: -103.8, len: 7.5,  col: '#f8fafc' }
    ].forEach(pip => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.45;
        ctx.fillRect(pip.px - 0.8, -8.8, 1.6, pip.len);
        ctx.strokeRect(pip.px - 0.8, -8.8, 1.6, pip.len);
        ctx.fillStyle = pip.col;
        ctx.fillRect(pip.px - 1.1, -8.8 + pip.len - 0.8, 2.2, 1.5);
    });
    ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.arc(-105.0, 5.2, 4.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(-105.0, 5.2, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-108.5, -22.0); ctx.lineTo(-97.5, -20.6);
    ctx.moveTo(-108.5, -20.2); ctx.lineTo(-97.5, -20.6);
    ctx.stroke();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-108.0, -17.4); ctx.lineTo(-97.5, -17.4); ctx.stroke();

    // 6B) 水槽西（x = -83.5，方形水槽 + 弯颈龙头 + 挡水板 + 皂液瓶）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-93, -19.0, 19, 26.5);
    ctx.strokeRect(-93, -19.0, 19, 26.5);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-90.8, -13.2, 14.6, 18.4);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-90.8, -13.2, 14.6, 18.4);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath(); ctx.arc(-86.5, -2.5, 2.0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-83.5, -4.0, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-92.5, -18.8, 18, 3.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-92.5, -18.8, 18, 3.2);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-83.5, -16.5); ctx.lineTo(-83.5, -10.5); ctx.arc(-85.1, -10.5, 1.6, 0, Math.PI, false); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-83.5, -16.8, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(-78.5, -17.2, 3.4, 4.0);
    ctx.strokeRect(-78.5, -17.2, 3.4, 4.0);

    // 6C) 小型通风橱（x ∈ [-71, +35]，宽 106px，排风管入北墙，前视窗朝 +y 开口）
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-71, -23.7, 106, 33.2);
    ctx.strokeRect(-71, -23.7, 106, 33.2);
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-20, -28.0, 12, 6.5);
    ctx.strokeRect(-20, -28.0, 12, 6.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-22, -24.8, 16, 1.6);
    ctx.strokeRect(-22, -24.8, 16, 1.6);
    // 内腔网孔工作台面
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-64, -19.5, 84, 21.0);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    for (let gx = -60; gx <= 16; gx += 4.5) {
        ctx.beginPath(); ctx.moveTo(gx, -19.0); ctx.lineTo(gx, 1.0); ctx.stroke();
    }
    for (let gy = -17.5; gy <= -1.5; gy += 4.0) {
        ctx.beginPath(); ctx.moveTo(-63.5, gy); ctx.lineTo(19.5, gy); ctx.stroke();
    }
    // 橱内：圆底烧瓶 + 铁架台 + 5 支试管架
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-45, -16.5, 14, 3.0);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-38, -15.0); ctx.lineTo(-38, -9.2); ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(-38, -8.8, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-15, -13.4, 31, 8.2);
    ctx.strokeRect(-15, -13.4, 31, 8.2);
    ['#38bdf8', '#f59e0b', '#10b981', '#e2e8f0', '#f43f5e'].forEach((tCol, ti) => {
        const tx = -10.5 + ti * 5.5;
        ctx.fillStyle = tCol;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.45;
        ctx.beginPath(); ctx.arc(tx, -9.3, 1.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // 右侧进风百叶口
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(22.0, -16.0, 11.0, 20.0);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    for (let ly = -14.5; ly <= 2.0; ly += 2.6) {
        ctx.beginPath(); ctx.moveTo(23.2, ly); ctx.lineTo(31.8, ly); ctx.stroke();
    }
    // 前沿风速监控屏（面向房间 +y）
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-66, 3.6, 27, 5.2);
    ctx.strokeRect(-66, 3.6, 27, 5.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('0.52m/s', -55, 6.25);
    // 半开玻璃视窗（向后方北墙 -y 拉起）
    ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-65, -16.7, 86, 12.5);
    ctx.strokeRect(-65, -16.7, 86, 12.5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-65, -5.5, 86, 1.3);

    // 6D) 东中部玻璃器皿 + 氧气阀 + 带玻璃门试剂柜（x ∈ [+37, +80]）
    ctx.fillStyle = 'rgba(224, 242, 254, 0.28)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.55;
    ctx.fillRect(38.8, -17.5, 3.8, 12.0);
    ctx.strokeRect(38.8, -17.5, 3.8, 12.0);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(40.7, -18.8); ctx.lineTo(40.7, -4.0); ctx.stroke();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.36)';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.arc(48.0, -9.2, 3.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(45.7, -6.2, 4.6, 1.3);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.42)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(41.0, 2.8, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(46.2, -2.2, 4.8, 1.4);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.fillRect(47.3, -0.8, 2.6, 8.0);
    ctx.strokeRect(47.3, -0.8, 2.6, 8.0);

    // 氧气阀（接北墙气管 -25.9）
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.moveTo(44.5, -21.5); ctx.lineTo(44.5, -25.9); ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(42.5, -23.2, 4.0, 3.4);
    ctx.strokeRect(42.5, -23.2, 4.0, 3.4);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath(); ctx.arc(44.5, -21.5, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 带玻璃门试剂柜（x ∈ [+53, +79]）
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.fillRect(53, -22.2, 26, 29.7);
    ctx.strokeRect(53, -22.2, 26, 29.7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(54.8, -20.2, 22.4, 25.7);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(55.0, -12.5, 22.0, 1.1);
    ctx.fillRect(55.0, -3.5, 22.0, 1.1);
    [
        { x: 58.0, y: -18.6, c: '#d97706' },
        { x: 63.0, y: -18.6, c: '#38bdf8' },
        { x: 68.0, y: -18.6, c: '#e2e8f0' },
        { x: 73.2, y: -18.6, c: '#10b981' },
        { x: 58.2, y: -9.6,  c: '#ef4444' },
        { x: 63.2, y: -9.6,  c: '#facc15' },
        { x: 68.2, y: -9.6,  c: '#3b82f6' },
        { x: 73.2, y: -9.6,  c: '#cbd5e1' }
    ].forEach(sb => {
        ctx.fillStyle = sb.c;
        ctx.fillRect(sb.x - 1.5, sb.y, 3.0, 4.8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(sb.x - 0.8, sb.y + 4.8, 1.6, 0.9);
    });
    ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.65;
    ctx.fillRect(54.4, -20.8, 23.2, 27.0);
    ctx.strokeRect(54.4, -20.8, 23.2, 27.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(63.5, 6.0, 5.0, 1.2);

    // 6E) 水槽东（x = +91.5，圆形水槽 + 双控龙头 + 弹簧软管喷枪）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(82, -19.0, 19, 26.5);
    ctx.strokeRect(82, -19.0, 19, 26.5);
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.arc(91.5, -3.2, 7.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(91.5, -3.2, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(86.5, -17.1, 10.0, 2.6);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(87.3, -15.8, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(95.7, -15.8, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(91.5, -15.6); ctx.lineTo(91.5, -9.5); ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(93.9, -15.0); ctx.lineTo(96.4, -12.8); ctx.lineTo(93.7, -11.2); ctx.lineTo(96.2, -9.2);
    ctx.stroke();

    // 6F) 最东端（x ∈ [+103, +139]）：氩气阀 + 台面计时器 + 记录板
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.85;
    ctx.beginPath(); ctx.moveTo(128.0, -21.5); ctx.lineTo(128.0, -25.9); ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(126.3, -23.0, 3.4, 3.0);
    ctx.strokeRect(126.3, -23.0, 3.4, 3.0);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(128.0, -21.5, 2.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(128.0, -21.5, 0.7, 0, Math.PI * 2); ctx.fill();

    // 台面计时器（按钮朝房间侧 +y）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(104.5, -16.6, 15.5, 9.4);
    ctx.strokeRect(104.5, -16.6, 15.5, 9.4);
    ctx.fillStyle = '#020617';
    ctx.fillRect(106.0, -15.2, 12.5, 4.6);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(106.8, -9.6, 2.8, 1.4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(110.8, -9.6, 2.8, 1.4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(114.8, -9.6, 2.8, 1.4);

    // 记录板 + 记号笔
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(104.5, -4.0, 27.0, 11.8);
    ctx.strokeRect(104.5, -4.0, 27.0, 11.8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(106.5, -2.7, 23.0, 9.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(114.0, -3.5, 8.0, 2.0);
    ctx.strokeRect(114.0, -3.5, 8.0, 2.0);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    [0.0, 2.2, 4.4].forEach((ly, li) => {
        ctx.beginPath(); ctx.moveTo(108.5, ly); ctx.lineTo(126.0 - li * 2.2, ly); ctx.stroke();
    });
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.moveTo(134.5, -3.0); ctx.lineTo(136.0, 6.5); ctx.stroke();

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestBench01Dynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestBench01Dynamic', 340, 280, cx, cy, (octx) => drawWestBench01DynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestBench01DynamicImpl(ctx, cx, cy, unitAngle, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 旋转蒸发仪：前置数显 + 沸腾气泡 + 冷凝液滴 + 接收瓶液面
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-136.6, 3.8, 11.2, 2.4);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('58C', -131.0, 5.0);
    const bathAng = time * 2.4;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(-130.5, -1.5, 3.0, bathAng, bathAng + 1.9); ctx.stroke();
    for (let bi = 0; bi < 3; bi++) {
        const bp = ((time * 0.9 + bi * 0.33) % 1.0);
        ctx.fillStyle = `rgba(224, 242, 254, ${(1 - bp).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(-132.2 + bi * 1.7, -3.5 + bp * 3.8, 0.55, 0, Math.PI * 2);
        ctx.fill();
    }
    const condT = (time * 0.8) % 1.0;
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(-127.5 + condT * 7.9, -8.2 + (-2.0 + 8.2) * condT, 0.75, 0, Math.PI * 2);
    ctx.fill();
    const wave = Math.sin(time * 1.6);
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-122.0, -1.2 + wave * 0.45);
    ctx.lineTo(-117.2, -1.2 - wave * 0.45);
    ctx.stroke();

    // 2. 双水槽：滴水液珠 + 排水口扩散涟漪
    const dropW = (time * 1.05) % 1.0;
    ctx.fillStyle = `rgba(125, 211, 252, ${(1 - dropW * 0.5).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(-86.7, -10.5 + dropW * 6.5, 0.65, 0, Math.PI * 2); ctx.fill();
    const ripW = 1.6 + ((time * 1.1) % 1.0) * 4.5;
    ctx.strokeStyle = `rgba(125, 211, 252, ${(0.55 * (1 - ((time * 1.1) % 1.0))).toFixed(2)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(-83.5, -4.0, ripW, 0, Math.PI * 2); ctx.stroke();

    const dropE = (time * 0.9 + 0.45) % 1.0;
    ctx.fillStyle = `rgba(125, 211, 252, ${(1 - dropE * 0.5).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(91.5, -9.5 + dropE * 6.3, 0.65, 0, Math.PI * 2); ctx.fill();
    const ripE = 1.6 + ((time * 0.95 + 0.4) % 1.0) * 4.5;
    ctx.strokeStyle = `rgba(125, 211, 252, ${(0.55 * (1 - ((time * 0.95 + 0.4) % 1.0))).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(91.5, -3.2, ripE, 0, Math.PI * 2); ctx.stroke();

    // 3. 通风橱：风速数字 + 排风气流 + 磁力搅拌 + 5 试管液面微晃
    const vel = (0.51 + Math.sin(time * 1.7) * 0.02).toFixed(2);
    ctx.fillStyle = '#020617';
    ctx.fillRect(-65.2, 4.1, 21.5, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${vel}m/s`, -54.5, 6.25);
    for (let si = 0; si < 3; si++) {
        const airP = ((time * 0.75 + si * 0.33) % 1.0);
        const ax = -42 + si * 21;
        const ay = -4.0 - airP * 14.5;
        ctx.strokeStyle = `rgba(148, 163, 184, ${(0.35 * Math.sin(airP * Math.PI)).toFixed(2)})`;
        ctx.lineWidth = 0.55;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(-14 + (ax + 14) * (1 - airP * 0.5), ay - 2.2); ctx.stroke();
    }
    ctx.save();
    ctx.translate(-38, -8.8);
    ctx.rotate(time * 6.0);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-1.8, -0.45, 3.6, 0.9);
    ctx.restore();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-41.5, -8.6 + wave * 0.55);
    ctx.lineTo(-34.5, -8.6 - wave * 0.55);
    ctx.stroke();
    for (let ti = 0; ti < 5; ti++) {
        const tw = Math.sin(time * 2.0 + ti) * 0.35;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.arc(-10.5 + ti * 5.5, -9.3, 1.1, tw, tw + 1.3);
        ctx.stroke();
    }

    // 4. 东中部玻璃器皿：冷却水 + 分液漏斗 + 烧瓶/量筒液面
    const coolT = (time * 1.1) % 1.0;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(40.7, -6.2 - coolT * 10.6, 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(40.7, -6.2 - ((coolT + 0.5) % 1.0) * 10.6, 0.65, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(45.7, -9.2 + wave * 0.3);
    ctx.lineTo(50.3, -9.2 - wave * 0.3);
    ctx.stroke();
    const sepDrop = (time * 0.7) % 1.0;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(48.0, -4.6 + sepDrop * 4.5, 0.65, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.beginPath();
    ctx.moveTo(38.6, 2.8 + wave * 0.35);
    ctx.lineTo(43.4, 2.8 - wave * 0.35);
    ctx.stroke();

    // 5. 试剂架微反光 + 玻璃柜微光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.45;
    [-134.8, -128.2, -121.6, -115.0].forEach((bx, bi) => {
        const w = Math.sin(time * 1.4 + bi * 1.2) * 0.3;
        ctx.beginPath();
        ctx.moveTo(bx - 1.4, -19.2 + w);
        ctx.lineTo(bx + 1.4, -19.2 - w);
        ctx.stroke();
    });
    const rCabGlow = 0.06 + 0.05 * Math.sin(time * 1.0);
    ctx.fillStyle = `rgba(56, 189, 248, ${rCabGlow.toFixed(3)})`;
    ctx.fillRect(55.0, -19.8, 22.0, 24.6);

    // 6. 台面计时器倒计时
    const totalSec = 900 - (Math.floor(time) % 900);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    ctx.fillStyle = '#020617';
    ctx.fillRect(106.0, -15.2, 12.5, 4.6);
    ctx.font = 'bold 2.6px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(mm + ':' + ss, 112.25, -12.9);

    // 7. 各仪器与墙面插座状态灯
    [
        { x: -126.2, y: 5.2,   on: '#f59e0b', dim: '#78350f', spd: 1.5, ph: 0.2 },
        { x: -135.2, y: -8.5,  on: '#38bdf8', dim: '#0c4a6e', spd: 1.8, ph: 1.1 },
        { x: -41.8,  y: 6.2,   on: '#10b981', dim: '#064e3b', spd: 1.4, ph: 0.0 },
        { x: 57.0,   y: 6.8,   on: '#10b981', dim: '#064e3b', spd: 0.9, ph: 0.8 },
        { x: 118.8,  y: -15.6, on: '#38bdf8', dim: '#0c4a6e', spd: 2.0, ph: 1.4 },
        { x: 43.6,   y: -26.2, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 0.5 },
        { x: 44.5,   y: -23.8, on: '#4ade80', dim: '#14532d', spd: 1.7, ph: 0.3 },
        { x: 128.0,  y: -23.8, on: '#e2e8f0', dim: '#475569', spd: 1.3, ph: 2.0 }
    ].forEach(led => {
        const pulse = 0.5 + 0.5 * Math.sin(time * led.spd + led.ph);
        ctx.fillStyle = pulse > 0.35 ? led.on : led.dim;
        ctx.beginPath(); ctx.arc(led.x, led.y, 0.85, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
}

function getWestBench01Obstacle() {
    const cx = 362.19, cy = 1079.26;
    const unitAngle = -0.665;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 141.5; // 283 / 2
    const halfH = 25;    // 50 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST WET CHEMISTRY BENCH 01',
        displayName: 'WET CHEMISTRY BENCH 01',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 190 < camX || cx - 190 > camX + vw || cy + 160 < camY || cy - 160 > camY + vh) return;

            const cacheKey = '__westBench01V1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 320, ch = 260;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBench01Static(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestBench01Dynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

// =========================================================================
// Level 8 · 西侧三角房 · 长试验台 02：北墙中段仪器分析台 (283x50，静态+动态分离，照 04 号型)
// 中心 (588.78, 901.50)，长轴沿北墙内缘 (-0.665 rad)，占沿墙 388–671
// 西端与 01 台留 5px 空档，东端与 03 台留 5px 空档，北缘距北墙内壁 3px（墙面管线贴墙至 -28）
// =========================================================================
function drawWestBench02Static(ctx, cx, cy, unitAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面投影阴影
    ctx.fillStyle = 'rgba(2, 6, 12, 0.54)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-143.5, -27.0, 287, 54.5, 2.5) : ctx.rect(-143.5, -27.0, 287, 54.5);
    ctx.fill();

    // 2. 墙面管线 ×2 + 墙面插座排 ×5 + 墙面挂钩 ×2（贴北墙 y ∈ [-28.0, -24.6]）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-139, -27.3); ctx.lineTo(139, -27.3); ctx.stroke();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-139, -27.0); ctx.lineTo(139, -27.0); ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-139, -25.9); ctx.lineTo(139, -25.9); ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-139, -25.7); ctx.lineTo(139, -25.7); ctx.stroke();

    [-112, -56, 0, 56, 112].forEach((clx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#cbd5e1' : '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(clx - 1.2, -28.0, 2.4, 3.2);
        ctx.strokeRect(clx - 1.2, -28.0, 2.4, 3.2);
    });
    ctx.fillStyle = '#d97706';
    ctx.fillRect(10.5, -26.7, 3.0, 1.6);

    [
        { x: -124, kind: '2pin' },
        { x: -74,  kind: '3pin' },
        { x: -20,  kind: 'switch' },
        { x: 42,   kind: 'led' },
        { x: 108,  kind: 'usb' }
    ].forEach(out => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.55;
        ctx.fillRect(out.x - 4.2, -27.9, 8.4, 3.3);
        ctx.strokeRect(out.x - 4.2, -27.9, 8.4, 3.3);
        ctx.fillStyle = '#0f172a';
        if (out.kind === '2pin') {
            ctx.fillRect(out.x - 1.8, -27.0, 0.9, 1.4);
            ctx.fillRect(out.x + 0.9, -27.0, 0.9, 1.4);
        } else if (out.kind === '3pin') {
            ctx.fillRect(out.x - 0.45, -26.2, 0.9, 1.0);
            ctx.fillRect(out.x - 2.0, -27.2, 1.1, 0.9);
            ctx.fillRect(out.x + 0.9, -27.2, 1.1, 0.9);
        } else if (out.kind === 'switch') {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(out.x - 3.0, -27.0, 2.2, 1.6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x + 0.5, -26.9, 0.9, 1.3);
            ctx.fillRect(out.x + 2.1, -26.9, 0.9, 1.3);
        } else if (out.kind === 'led') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(out.x - 2.4, -26.2, 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x - 0.4, -26.9, 0.9, 1.3);
            ctx.fillRect(out.x + 1.4, -26.9, 0.9, 1.3);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(out.x - 2.6, -26.9, 2.0, 1.4);
            ctx.fillRect(out.x + 0.6, -26.9, 2.0, 1.4);
        }
    });

    // 左挂蓝手套、右挂抹布
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-137.2, -26.9, 2.4, 2.2);
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-137.6, -25.6); ctx.lineTo(-134.2, -25.6);
    ctx.lineTo(-133.6, -27.9); ctx.lineTo(-135.2, -27.9);
    ctx.lineTo(-136.0, -26.8); ctx.lineTo(-136.8, -27.9);
    ctx.lineTo(-138.2, -27.9); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(134.8, -26.9, 2.4, 2.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(133.4, -28.0, 5.2, 2.6, 0.7) : ctx.rect(133.4, -28.0, 5.2, 2.6);
    ctx.fill(); ctx.stroke();

    // 3. 桌腿交叉撑、踢脚与调平脚 6 个（面向房间 y ∈ [+23.0, +25.0]）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    [-110, -55, 0, 55, 110].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx - 20, 23.3); ctx.lineTo(bx + 20, 24.7);
        ctx.moveTo(bx - 20, 24.7); ctx.lineTo(bx + 20, 23.3);
        ctx.stroke();
    });
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-139, 23.0, 278, 1.3);
    [-138, -83, -28, 28, 83, 138].forEach(fx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 2.6, 23.2, 5.2, 2.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 1.8, 23.8, 3.6, 1.2);
    });

    // 4. 台下 4 组各不相同的钢制柜体（y ∈ [+14.2, +23.0]）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-138, 14.2, 66, 8.8);
    ctx.strokeRect(-138, 14.2, 66, 8.8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-137, 15.0, 31.2, 7.2);
    ctx.fillRect(-104.2, 15.0, 31.2, 7.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-105.0, 14.7); ctx.lineTo(-105.0, 22.5); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-109.0, 16.4, 1.5, 4.8);
    ctx.fillRect(-102.5, 16.4, 1.5, 4.8);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-105.0, 18.6, 1.05, 0, Math.PI * 2); ctx.fill();

    // 4 档抽屉
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-68, 14.2, 66, 8.8);
    ctx.strokeRect(-68, 14.2, 66, 8.8);
    [
        { y: 14.6, hw: 5.0 },
        { y: 16.7, hw: 9.0 },
        { y: 18.8, hw: 13.5 },
        { y: 20.9, hw: 18.0 }
    ].forEach((dr, dIdx) => {
        ctx.fillStyle = dIdx % 2 === 0 ? '#475569' : '#64748b';
        ctx.fillRect(-66.5, dr.y, 63, 1.7);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(-66.5, dr.y, 63, 1.7);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-35.0 - dr.hw / 2, dr.y + 0.55, dr.hw, 0.7);
    });

    // 开放格（线缆盘 + 备用试剂箱 2）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.75;
    ctx.fillRect(2, 14.2, 66, 8.8);
    ctx.strokeRect(2, 14.2, 66, 8.8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3, 17.8, 64, 0.95);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(10, 14.6, 2.2, 3.0);
    ctx.fillRect(27.8, 14.6, 2.2, 3.0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(12.2, 14.9, 15.6, 2.3);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.55;
    for (let sx = 14; sx <= 26; sx += 3) {
        ctx.beginPath(); ctx.moveTo(sx, 14.9); ctx.lineTo(sx, 17.2); ctx.stroke();
    }
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(8, 19.2, 22, 3.1);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(8, 19.2, 22, 3.1);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(10, 20.2, 8, 1.2);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(36, 19.2, 24, 3.1);
    ctx.strokeRect(36, 19.2, 24, 3.1);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(39, 20.2, 9, 1.2);

    // 东深柜
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(72, 14.2, 66, 8.8);
    ctx.strokeRect(72, 14.2, 66, 8.8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(73.2, 15.1, 63.6, 7.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(76.2, 16.2, 1.8, 4.9);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    for (let vx = 104; vx <= 132; vx += 3.6) {
        ctx.beginPath(); ctx.moveTo(vx, 16.1); ctx.lineTo(vx + 2.0, 21.1); ctx.stroke();
    }

    // 5. 走线槽（面向房间侧）
    ctx.fillStyle = '#334155';
    ctx.fillRect(-139, 12.0, 278, 2.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-139, 12.0, 278, 2.2);
    [
        { y: 13.85, w: 0.55 },
        { y: 13.40, w: 0.85 },
        { y: 12.90, w: 1.15 },
        { y: 12.38, w: 1.45 }
    ].forEach(cb => {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = cb.w;
        ctx.beginPath(); ctx.moveTo(-136, cb.y); ctx.lineTo(136, cb.y); ctx.stroke();
    });

    // 6. 环氧树脂台面（283x37 @ x ∈ [-141.5, +141.5], y ∈ [-25.0, +12.0]）
    const topGrad = ctx.createLinearGradient(0, -25.0, 0, 12.0);
    topGrad.addColorStop(0, '#1e293b');
    topGrad.addColorStop(0.15, '#0f172a');
    topGrad.addColorStop(0.82, '#1e293b');
    topGrad.addColorStop(1, '#334155');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-141.5, -25.0, 283, 37.0);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.5;
    for (let gx = -128; gx <= 128; gx += 15) {
        ctx.beginPath(); ctx.moveTo(gx, -23.5); ctx.lineTo(gx, 10.5); ctx.stroke();
    }
    for (let gy = -20; gy <= 6; gy += 8.5) {
        ctx.beginPath(); ctx.moveTo(-140.0, gy); ctx.lineTo(140.0, gy); ctx.stroke();
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-140.75, -24.25, 281.5, 35.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-141.5, -25.0, 283, 37.0);

    // 钢印 BENCH-02（西南前沿面向房间）
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-138.5, 7.5, 20, 4.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-138.5, 7.5, 20, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('BENCH-02', -128.5, 9.65);

    // =====================================================================
    // 7. 台面 6 台仪器 + 3 组耗材（1:1 比例，操作面朝向房间 +y）
    // =====================================================================

    // 7A) 仪器 1：实时荧光定量 PCR 仪（-139..-110）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-138.5, -17.5, 29, 24);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-124, 6.5); ctx.lineTo(-124, 12.0); ctx.stroke();
    const pcrGrad = ctx.createLinearGradient(-137.5, 0, -110.5, 0);
    pcrGrad.addColorStop(0, '#cbd5e1');
    pcrGrad.addColorStop(0.25, '#f8fafc');
    pcrGrad.addColorStop(0.8, '#e2e8f0');
    pcrGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = pcrGrad;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-137.5, -16.5, 27, 22);
    ctx.strokeRect(-137.5, -16.5, 27, 22);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.6;
    for (let vx = -134.5; vx <= -113.5; vx += 2.2) {
        ctx.beginPath(); ctx.moveTo(vx, -16.0); ctx.lineTo(vx, -14.0); ctx.stroke();
    }
    ctx.fillStyle = '#334155';
    ctx.fillRect(-134.5, -13.0, 21, 11.5);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(-134.5, -13.0, 21, 11.5);
    ctx.fillStyle = '#64748b';
    for (let r = 0; r < 5; r++) {
        for (let col = 0; col < 8; col++) {
            ctx.fillRect(-132.8 + col * 2.3, -11.5 + r * 1.9, 1.0, 1.0);
        }
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-130, -1.6, 12, 1.4);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-133.5, -0.6, 15.5, 5.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-133.5, -0.6, 15.5, 5.2);

    // 7B) 耗材簇 A（-108..-85）：移液器架 + 枪头盒 2 个（一开一合，盖朝北墙 -y 翻开）
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-108.0, -14.0, 10.5, 14.0, 1.5) : ctx.rect(-108.0, -14.0, 10.5, 14.0);
    ctx.fill(); ctx.stroke();
    [
        { x: -105.7, len: 12.0, cap: '#38bdf8' },
        { x: -102.7, len: 9.5,  cap: '#f59e0b' },
        { x: -99.7,  len: 7.2,  cap: '#ef4444' }
    ].forEach(pip => {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(pip.x - 0.8, -13.0, 1.6, pip.len);
        ctx.fillStyle = pip.cap;
        ctx.fillRect(pip.x - 1.1, -13.0 + pip.len - 0.8, 2.2, 1.8);
    });
    // 枪头盒 1（开启，前侧靠近房间）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.fillRect(-96.0, -1.4, 10.5, 8.2);
    ctx.strokeRect(-96.0, -1.4, 10.5, 8.2);
    ctx.fillStyle = '#38bdf8';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            ctx.beginPath(); ctx.arc(-94.2 + c * 2.2, 0.4 + r * 2.2, 0.55, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.fillRect(-96.0, -3.8, 10.5, 2.2);
    // 枪头盒 2（闭合）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-96.0, -14.0, 10.5, 8.5);
    ctx.strokeRect(-96.0, -14.0, 10.5, 8.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-92.2, -5.9, 3.0, 1.1);

    // 7C) 仪器 2：液相色谱仪 HPLC（-83..-51）
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-67, 8.5); ctx.lineTo(-67, 12.0); ctx.stroke();
    const hplcGrad = ctx.createLinearGradient(-82.5, 0, -51.5, 0);
    hplcGrad.addColorStop(0, '#94a3b8');
    hplcGrad.addColorStop(0.25, '#e2e8f0');
    hplcGrad.addColorStop(0.85, '#cbd5e1');
    hplcGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = hplcGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-82.5, -16.3, 31, 24.5);
    ctx.strokeRect(-82.5, -16.3, 31, 24.5);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-82.5, -2.0); ctx.lineTo(-51.5, -2.0);
    ctx.moveTo(-82.5, -9.5); ctx.lineTo(-51.5, -9.5);
    ctx.stroke();
    // 进样盘（前侧朝房间 +y）
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-80.5, -0.6, 15.5, 7.8);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(-80.5, -0.6, 15.5, 7.8);
    for (let vy = 1.2; vy <= 5.5; vy += 2.1) {
        for (let vx = -78.5; vx <= -66.5; vx += 2.4) {
            ctx.fillStyle = (Math.round(vx + vy) % 2 === 0) ? '#38bdf8' : '#e2e8f0';
            ctx.beginPath(); ctx.arc(vx, vy, 0.7, 0, Math.PI * 2); ctx.fill();
        }
    }
    [
        { x: -60.5, y: -12.5, col: '#38bdf8', cap: '#0284c7' },
        { x: -55.0, y: -12.5, col: '#f59e0b', cap: '#b45309' }
    ].forEach(bot => {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(bot.x, bot.y, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bot.col;
        ctx.beginPath(); ctx.arc(bot.x, bot.y, 2.0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bot.cap;
        ctx.beginPath(); ctx.arc(bot.x, bot.y, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(bot.x, bot.y); ctx.lineTo(bot.x - 2.6, -6.0); ctx.stroke();
    });
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-63.8, 2.3, 11.2, 4.5);

    // 实验记录板 1 块（置于低矮耗材簇 B 后方靠墙空位 x = -36, y = -20.0）
    ctx.save();
    ctx.translate(-36, -20.0);
    ctx.rotate(-0.10);
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-5.2, -3.5, 10.4, 7.0);
    ctx.strokeRect(-5.2, -3.5, 10.4, 7.0);
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(-4.3, -2.5, 8.6, 5.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2.0, -3.7, 4.0, 1.4);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    [-1.1, 0.2, 1.5].forEach((ly, i) => {
        ctx.beginPath(); ctx.moveTo(-3.3, ly); ctx.quadraticCurveTo(-0.5, ly - 0.5, 3.0 - i * 0.8, ly + 0.2); ctx.stroke();
    });
    ctx.restore();

    // 7D) 耗材簇 B（-49..-23）：24孔样品架 + 96孔板×2 + 镊子 + 刮刀
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-47.5, 5.2); ctx.lineTo(-40.5, 8.5);
    ctx.moveTo(-47.5, 6.3); ctx.lineTo(-40.5, 8.5);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-38.5, 7.4, 6.2, 1.1);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-34.0, 7.1, 3.2, 1.7);

    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(-49.0, -16.0, 14.5, 14.0);
    ctx.strokeRect(-49.0, -16.0, 14.5, 14.0);
    const tubeCols = ['#10b981', '#f59e0b', '#38bdf8', '#e2e8f0'];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            const tx = -47.3 + c * 2.2;
            const ty = -14.0 + r * 3.1;
            const col = tubeCols[(r * 3 + c) % 4];
            const cap = (r + c) % 2 === 0 ? '#ef4444' : '#2563eb';
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(tx, ty, 0.72, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = cap;
            ctx.lineWidth = 0.45;
            ctx.beginPath(); ctx.arc(tx, ty, 0.9, 0, Math.PI * 2); ctx.stroke();
        }
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-33.5, 0.4, 10.0, 7.6);
    ctx.strokeRect(-33.5, 0.4, 10.0, 7.6);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            ctx.fillStyle = (r + c) % 3 === 0 ? '#10b981' : ((r + c) % 3 === 1 ? '#38bdf8' : '#cbd5e1');
            ctx.fillRect(-32.4 + c * 1.4, 1.6 + r * 1.4, 0.9, 0.9);
        }
    }
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.fillRect(-33.5, -13.8, 10.0, 7.6);
    ctx.strokeRect(-33.5, -13.8, 10.0, 7.6);
    ctx.fillStyle = '#cbd5e1';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
            ctx.fillRect(-32.4 + c * 1.4, -12.6 + r * 1.4, 0.9, 0.9);
        }
    }

    // 7E) 仪器 3：落地式大容量离心机（x = -5.5, y = -5.2，前转速屏朝 +y）
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-5.5, 10.5); ctx.lineTo(-5.5, 12.0); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-5.5, -5.2, 16.5, 0, Math.PI * 2); ctx.fill();
    const centGrad = ctx.createRadialGradient(-9.5, -8.5, 3, -5.5, -5.2, 15.2);
    centGrad.addColorStop(0, '#64748b');
    centGrad.addColorStop(0.65, '#475569');
    centGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = centGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.arc(-5.5, -5.2, 15.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const lidGrad = ctx.createLinearGradient(-16.5, -15, 5.5, 5);
    lidGrad.addColorStop(0, '#e2e8f0');
    lidGrad.addColorStop(0.5, '#94a3b8');
    lidGrad.addColorStop(1, '#475569');
    ctx.fillStyle = lidGrad;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.beginPath(); ctx.arc(-5.5, -5.5, 11.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-5.5, -5.5, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(-5.5, -5.5, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-8.5, -18.2, 6.0, 2.2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14.0, 5.2, 17.0, 5.2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-14.0, 5.2, 17.0, 5.2);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-13.0, 6.0, 12.2, 3.6);

    // 7F) 耗材簇 C（+13..+37）：记号笔 + 台面计时器 + 离心管架
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(13.0, 5.8, 8.2, 1.8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(20.7, 5.8, 2.2, 1.8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(14.5, 6.0, 2.5, 1.3);
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(24.5, 2.4, 10.5, 6.8);
    ctx.strokeRect(24.5, 2.4, 10.5, 6.8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(26.2, 7.4, 2.6, 1.1);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(30.4, 7.4, 2.6, 1.1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(25.7, 3.4, 8.1, 3.3);

    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(13.5, -16.5, 22, 14.5);
    ctx.strokeRect(13.5, -16.5, 22, 14.5);
    [
        { x: 16.0, y: -5.5, col: '#10b981' },
        { x: 20.0, y: -5.5, col: '#f59e0b' },
        { x: 16.0, y: -12.2, col: '#38bdf8' },
        { x: 20.0, y: -12.2, col: '#e2e8f0' }
    ].forEach(t15 => {
        ctx.fillStyle = t15.col;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.5, 0, Math.PI * 2); ctx.stroke();
    });
    [
        { x: 28.5, y: -5.5, col: '#10b981' },
        { x: 28.5, y: -12.5, col: '#f59e0b' }
    ].forEach(t50 => {
        ctx.fillStyle = t50.col;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.25, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.45, 0, Math.PI * 2); ctx.stroke();
    });

    // 7G) 仪器 4：超声破碎仪（+39..+64）
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(51, 7.5); ctx.lineTo(51, 12.0); ctx.stroke();
    ctx.fillStyle = '#e7e5e4';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.fillRect(39, -15.5, 16, 22);
    ctx.strokeRect(39, -15.5, 16, 22);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(40.5, 0.0, 13, 5.2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(40.5, 0.0, 13, 5.2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(56.0, -15.5, 8.0, 20.5);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(56.0, -15.5, 8.0, 20.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(59.5, -15.0, 2.4, 5.5);
    ctx.fillRect(57.0, -6.2, 4.5, 2.2);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(58.2, -4.4, 2.0, 4.2);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(59.2, 1.2, 2.2, 0, Math.PI * 2); ctx.fill();

    // 7H) 仪器 5：恒温摇床（+67..+98）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(66.5, -17.8, 32, 25);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.05;
    ctx.beginPath(); ctx.moveTo(82.5, 7.2); ctx.lineTo(82.5, 12.0); ctx.stroke();
    const shkGrad = ctx.createLinearGradient(67.5, 0, 97.5, 0);
    shkGrad.addColorStop(0, '#93c5fd');
    shkGrad.addColorStop(0.3, '#dbeafe');
    shkGrad.addColorStop(0.85, '#bfdbfe');
    shkGrad.addColorStop(1, '#60a5fa');
    ctx.fillStyle = shkGrad;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.fillRect(67.5, -17.0, 30, 23.5);
    ctx.strokeRect(67.5, -17.0, 30, 23.5);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(70.5, 0.9, 16.5, 4.6);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(70.5, 0.9, 16.5, 4.6);

    // 7I) 仪器 6：真空干燥箱（+102..+134，真空管接入北墙 -25.9）
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.moveTo(118, 7.5); ctx.lineTo(118, 12.0); ctx.stroke();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(126, -17.0); ctx.lineTo(126, -25.9); ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.95;
    ctx.fillRect(102, -17.0, 32, 24.5);
    ctx.strokeRect(102, -17.0, 32, 24.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(103.5, -10.3, 22, 16.5);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(103.5, -10.3, 22, 16.5);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(106.0, -7.7, 16.5, 11.5);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(106.0, -7.7, 16.5, 11.5);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(129.2, 2.5, 3.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(129.2, -2.2, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestBench02Dynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestBench02Dynamic', 340, 280, cx, cy, (octx) => drawWestBench02DynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestBench02DynamicImpl(ctx, cx, cy, unitAngle, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. PCR 仪
    const pcrPhase = 0.5 + 0.5 * Math.sin(time * 0.45);
    const pcrTemp = (60.2 + pcrPhase * 34.8).toFixed(1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-133.0, -0.2, 14.5, 4.4);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = pcrPhase > 0.7 ? '#f59e0b' : '#38bdf8';
    ctx.fillText(`${pcrTemp}C`, -125.75, 1.85);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-132.0, 3.4, 12.5, 0.7);
    ctx.fillStyle = pcrPhase > 0.7 ? '#f59e0b' : '#10b981';
    ctx.fillRect(-132.0, 3.4, 12.5 * pcrPhase, 0.7);

    // 2. HPLC 实时出峰 + 毛细管液滴
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-63.5, 2.6, 10.6, 3.9);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    for (let sx = 0; sx <= 9; sx += 1.0) {
        const u = ((sx * 0.1 + time * 0.45) % 1.0);
        const peak = Math.exp(-Math.pow((u - 0.5) * 7.0, 2)) * 2.2;
        const px = -63.0 + sx;
        const py = 5.8 - peak;
        if (sx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    [
        { bx: -60.5, col: '#7dd3fc' },
        { bx: -55.0, col: '#fcd34d' }
    ].forEach((cap, ci) => {
        const flowT = (time * 0.85 + ci * 0.5) % 1.0;
        const fx = cap.bx - 2.6 * flowT;
        const fy = -12.5 + (-6.0 + 12.5) * flowT;
        ctx.fillStyle = cap.col;
        ctx.beginPath(); ctx.arc(fx, fy, 0.7, 0, Math.PI * 2); ctx.fill();
    });

    // 3. 离心机转子 + RPM
    const rotAngle = time * 8.5;
    ctx.save();
    ctx.translate(-5.5, -5.5);
    ctx.rotate(rotAngle);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-2.2, 0); ctx.lineTo(2.2, 0);
    ctx.moveTo(0, -2.2); ctx.lineTo(0, 2.2);
    ctx.stroke();
    ctx.restore();
    const centRpm = 4195 + Math.round(Math.sin(time * 2.3) * 8);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-13.0, 6.0, 12.2, 3.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${centRpm}RPM`, -6.9, 7.85);

    // 4. 台面计时器
    const b2Sec = 265 - (Math.floor(time) % 265);
    const b2mm = String(Math.floor(b2Sec / 60)).padStart(2, '0');
    const b2ss = String(b2Sec % 60).padStart(2, '0');
    ctx.fillStyle = '#06263d';
    ctx.fillRect(25.7, 3.4, 8.1, 3.3);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${b2mm}:${b2ss}`, 29.75, 5.05);

    // 5. 超声破碎仪
    const usWatt = 236 + Math.round(Math.sin(time * 5.0) * 6);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(40.5, 0.0, 13, 5.2);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${usWatt}W`, 47.0, 2.65);
    const ringR = 0.8 + ((time * 1.9) % 1.0) * 1.45;
    const ringAlpha = 1.0 - ((time * 1.9) % 1.0);
    ctx.strokeStyle = `rgba(224, 242, 254, ${ringAlpha.toFixed(2)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(59.2, 1.2, ringR, 0, Math.PI * 2); ctx.stroke();

    // 6. 恒温摇床
    const ox = Math.cos(time * 3.0) * 0.65;
    const oy = Math.sin(time * 3.0) * 0.65;
    ctx.save();
    ctx.translate(82.5 + ox, -7.8 + oy);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-11.0, -7.0, 22.0, 14.0);
    ctx.strokeRect(-11.0, -7.0, 22.0, 14.0);
    [[-5.8, -3.1], [5.8, -3.1], [-5.8, 3.1], [5.8, 3.1]].forEach(([fx, fy], fi) => {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.arc(fx, fy, 2.6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = fx < 0 ? 'rgba(16, 185, 129, 0.72)' : 'rgba(56, 189, 248, 0.72)';
        ctx.beginPath(); ctx.arc(fx, fy, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.75)';
        ctx.lineWidth = 0.45;
        const sa = time * 3.0 + fi * 1.5;
        ctx.beginPath(); ctx.arc(fx, fy, 1.1, sa, sa + 1.4); ctx.stroke();
    });
    ctx.restore();
    const shkRpm = 179 + Math.round(Math.sin(time * 1.5));
    ctx.fillStyle = '#06263d';
    ctx.fillRect(70.5, 0.9, 16.5, 4.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${shkRpm}RPM`, 78.75, 3.25);

    // 7. 真空干燥箱
    const vGlow = 0.14 + 0.1 * Math.sin(time * 1.2);
    ctx.fillStyle = `rgba(245, 158, 11, ${vGlow.toFixed(3)})`;
    ctx.fillRect(106.4, -7.3, 15.7, 10.7);
    const needleAng = -2.2 + Math.sin(time * 4.5) * 0.12;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(129.2, 2.5);
    ctx.lineTo(129.2 + Math.cos(needleAng) * 2.4, 2.5 + Math.sin(needleAng) * 2.4);
    ctx.stroke();
    const vacPulseY = -17.0 - ((time * 1.3) % 1.0) * 8.9;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(126.0, vacPulseY, 0.7, 0, Math.PI * 2); ctx.fill();

    // 8. 呼吸指示灯
    [
        { x: -115.0, y: 2.0,   on: '#10b981', dim: '#064e3b', spd: 1.4, ph: 0.0 },
        { x: -115.0, y: 4.0,   on: '#f59e0b', dim: '#78350f', spd: 0.9, ph: 1.5 },
        { x: -53.8,  y: 5.2,   on: '#10b981', dim: '#064e3b', spd: 1.1, ph: 1.2 },
        { x: 0.8,    y: 7.8,   on: '#10b981', dim: '#064e3b', spd: 1.5, ph: 0.6 },
        { x: 52.2,   y: 2.6,   on: '#ef4444', dim: '#7f1d1d', spd: 2.2, ph: 1.8 },
        { x: 92.0,   y: 3.2,   on: '#f59e0b', dim: '#78350f', spd: 1.2, ph: 2.8 },
        { x: 129.2,  y: 6.0,   on: '#f59e0b', dim: '#78350f', spd: 0.9, ph: 0.4 },
        { x: 39.6,   y: -26.2, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 0.9 }
    ].forEach(led => {
        const pulse = 0.5 + 0.5 * Math.sin(time * led.spd + led.ph);
        ctx.fillStyle = pulse > 0.35 ? led.on : led.dim;
        ctx.beginPath(); ctx.arc(led.x, led.y, 0.85, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
}

function getWestBench02Obstacle() {
    const cx = 588.78, cy = 901.50;
    const unitAngle = -0.665;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 141.5; // 283 / 2
    const halfH = 25;    // 50 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST ANALYTICAL BENCH 02',
        displayName: 'ANALYTICAL INSTRUMENT BENCH 02',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 190 < camX || cx - 190 > camX + vw || cy + 160 < camY || cy - 160 > camY + vh) return;

            const cacheKey = '__westBench02V1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 320, ch = 260;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBench02Static(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestBench02Dynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

// =========================================================================
// Level 8 · 西侧三角房 · 长试验台 03：北墙东段生物安全/标本储存台 (283x50，静态+动态分离，照 05 号型)
// 中心 (815.37, 723.73)，长轴沿北墙内缘 (-0.665 rad)，占沿墙 676–959
// 西端与 02 台留 5px 空档，东端距五联舱留足净空，北缘距北墙内壁 3px（墙面管线贴墙至 -28）
// =========================================================================
function drawWestBench03Static(ctx, cx, cy, unitAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 地面投影阴影
    ctx.fillStyle = 'rgba(2, 6, 12, 0.54)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-143.5, -27.0, 287, 54.5, 2.5) : ctx.rect(-143.5, -27.0, 287, 54.5);
    ctx.fill();

    // 2. 墙面管线 ×2 + 墙面插座排 ×5 + 墙面挂钩 ×2（贴北墙 y ∈ [-28.0, -24.6]）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-139, -27.3); ctx.lineTo(139, -27.3); ctx.stroke();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-139, -27.0); ctx.lineTo(139, -27.0); ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-139, -25.9); ctx.lineTo(139, -25.9); ctx.stroke();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.45;
    ctx.beginPath(); ctx.moveTo(-139, -25.7); ctx.lineTo(139, -25.7); ctx.stroke();

    [-112, -56, 0, 56, 112].forEach((clx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#cbd5e1' : '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.fillRect(clx - 1.2, -28.0, 2.4, 3.2);
        ctx.strokeRect(clx - 1.2, -28.0, 2.4, 3.2);
    });
    // 液氮排气管墙端法兰接口
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.fillRect(-69.0, -28.0, 7.0, 3.2);
    ctx.strokeRect(-69.0, -28.0, 7.0, 3.2);

    [
        { x: -124, kind: '2pin' },
        { x: -78,  kind: '3pin' },
        { x: -14,  kind: 'switch' },
        { x: 46,   kind: 'led' },
        { x: 112,  kind: 'usb' }
    ].forEach(out => {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.55;
        ctx.fillRect(out.x - 4.2, -27.9, 8.4, 3.3);
        ctx.strokeRect(out.x - 4.2, -27.9, 8.4, 3.3);
        ctx.fillStyle = '#0f172a';
        if (out.kind === '2pin') {
            ctx.fillRect(out.x - 1.8, -27.0, 0.9, 1.4);
            ctx.fillRect(out.x + 0.9, -27.0, 0.9, 1.4);
        } else if (out.kind === '3pin') {
            ctx.fillRect(out.x - 0.45, -26.2, 0.9, 1.0);
            ctx.fillRect(out.x - 2.0, -27.2, 1.1, 0.9);
            ctx.fillRect(out.x + 0.9, -27.2, 1.1, 0.9);
        } else if (out.kind === 'switch') {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(out.x - 3.0, -27.0, 2.2, 1.6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x + 0.5, -26.9, 0.9, 1.3);
            ctx.fillRect(out.x + 2.1, -26.9, 0.9, 1.3);
        } else if (out.kind === 'led') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(out.x - 2.4, -26.2, 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(out.x - 0.4, -26.9, 0.9, 1.3);
            ctx.fillRect(out.x + 1.4, -26.9, 0.9, 1.3);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(out.x - 2.6, -26.9, 2.0, 1.4);
            ctx.fillRect(out.x + 0.6, -26.9, 2.0, 1.4);
        }
    });

    // 左挂蓝手套、右挂透明防护面屏
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-137.2, -26.9, 2.4, 2.2);
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-137.6, -25.6); ctx.lineTo(-134.2, -25.6);
    ctx.lineTo(-133.6, -27.9); ctx.lineTo(-135.2, -27.9);
    ctx.lineTo(-136.0, -26.8); ctx.lineTo(-136.8, -27.9);
    ctx.lineTo(-138.2, -27.9); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(134.8, -26.7, 2.4, 2.0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(133.0, -26.1, 6.0, 1.0);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(136.0, -26.0, 3.1, Math.PI + 0.15, -0.15);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 3. 桌腿交叉撑、踢脚与调平脚 6 个（面向房间 y ∈ [+23.0, +25.0]）
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.85;
    [-110, -55, 0, 55, 110].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx - 20, 23.3); ctx.lineTo(bx + 20, 24.7);
        ctx.moveTo(bx - 20, 24.7); ctx.lineTo(bx + 20, 23.3);
        ctx.stroke();
    });
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-139, 23.0, 278, 1.3);
    [-138, -83, -28, 28, 83, 138].forEach(fx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 2.6, 23.2, 5.2, 2.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 1.8, 23.8, 3.6, 1.2);
    });

    // 4. 台下 4 组各不相同的钢制柜体（y ∈ [+12.6, +23.0]）
    // 4A) 带锁标本柜 + 挂锁 + 生物危害标识 #1
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-138, 12.6, 66, 10.4);
    ctx.strokeRect(-138, 12.6, 66, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-137, 13.5, 31.2, 8.6);
    ctx.fillRect(-104.2, 13.5, 31.2, 8.6);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-105.0, 13.1); ctx.lineTo(-105.0, 22.4); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-109.2, 15.0, 1.5, 6.2);
    ctx.fillRect(-102.3, 15.0, 1.5, 6.2);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.arc(-105.0, 16.5, 1.4, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    ctx.fillRect(-106.5, 16.8, 3.0, 2.8);
    ctx.strokeRect(-106.5, 16.8, 3.0, 2.8);
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-121.5, 14.2); ctx.lineTo(-116.0, 21.2); ctx.lineTo(-127.0, 21.2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-121.5, 18.8, 1.2, 0, Math.PI * 2); ctx.fill();

    // 4B) 3 档抽屉
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-68, 12.6, 66, 10.4);
    ctx.strokeRect(-68, 12.6, 66, 10.4);
    [
        { y: 13.2, hw: 6.0 },
        { y: 16.5, hw: 13.0 },
        { y: 19.8, hw: 20.0 }
    ].forEach((dr, dIdx) => {
        ctx.fillStyle = dIdx % 2 === 0 ? '#475569' : '#64748b';
        ctx.fillRect(-66.5, dr.y, 63, 2.6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-66.5, dr.y, 63, 2.6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-35.0 - dr.hw / 2, dr.y + 0.9, dr.hw, 0.9);
    });

    // 4C) 开放格（冻存盒 2 + 生物危害废弃桶 1）
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.75;
    ctx.fillRect(2, 12.6, 66, 10.4);
    ctx.strokeRect(2, 12.6, 66, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(3, 17.2, 64, 1.0);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(10, 13.4, 20, 3.4);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(10, 13.4, 20, 3.4);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(38, 13.4, 20, 3.4);
    ctx.strokeRect(38, 13.4, 20, 3.4);
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    ctx.fillRect(19, 18.6, 32, 3.8);
    ctx.strokeRect(19, 18.6, 32, 3.8);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(19, 21.45, 32, 0.95);
    ctx.beginPath();
    ctx.moveTo(35, 18.9); ctx.lineTo(37.5, 20.3); ctx.lineTo(35, 21.7); ctx.lineTo(32.5, 20.3); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(35, 20.3, 0.65, 0, Math.PI * 2); ctx.fill();

    // 4D) 深柜
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(72, 12.6, 66, 10.4);
    ctx.strokeRect(72, 12.6, 66, 10.4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(73.2, 13.6, 63.6, 8.4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(76.2, 14.8, 1.8, 6.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.7;
    for (let vx = 104; vx <= 132; vx += 3.6) {
        ctx.beginPath(); ctx.moveTo(vx, 14.8); ctx.lineTo(vx + 2.0, 20.8); ctx.stroke();
    }

    // 5. 不锈钢银白边框环氧台面（283x37.6 @ x ∈ [-141.5, +141.5], y ∈ [-25.0, +12.6]）
    const topGrad = ctx.createLinearGradient(0, -25.0, 0, 12.6);
    topGrad.addColorStop(0, '#1e293b');
    topGrad.addColorStop(0.15, '#0f172a');
    topGrad.addColorStop(0.8, '#1e293b');
    topGrad.addColorStop(1, '#334155');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-141.5, -25.0, 283, 37.6);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 0.5;
    for (let gx = -128; gx <= 128; gx += 15) {
        ctx.beginPath(); ctx.moveTo(gx, -23.5); ctx.lineTo(gx, 11.0); ctx.stroke();
    }
    for (let gy = -20; gy <= 6; gy += 8.5) {
        ctx.beginPath(); ctx.moveTo(-140.0, gy); ctx.lineTo(140.0, gy); ctx.stroke();
    }

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-140.75, -24.25, 281.5, 36.1);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-141.5, -25.0, 283, 37.6);

    // 台面钢印 BENCH-03
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-138.5, 8.0, 20, 4.2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-138.5, 8.0, 20, 4.2);
    ctx.font = 'bold 2.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('BENCH-03', -128.5, 10.15);

    // =====================================================================
    // 6. 超低温与液氮储存核心模块 + 样本处理耗材（1:1 比例，操作面朝向房间 +y）
    // =====================================================================

    // 6A) 超低温冰箱（-139..-105，-80°C 立柜）
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-139.0, -18.7, 34, 26.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(-138.0, -18.0, 32, 25.2);
    ctx.strokeRect(-138.0, -18.0, 32, 25.2);
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-135.5, -15.7, 27, 21.5);
    ctx.strokeRect(-135.5, -15.7, 27, 21.5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-111.5, -9.0, 2.2, 11.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-111.5, -9.0, 2.2, 11.5);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-137.2, -11.7, 1.8, 3.2);
    ctx.fillRect(-137.2, 0.3, 1.8, 3.2);
    ctx.font = 'bold 2.8px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('-80°C', -122.0, -5.5);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-133.5, -0.6, 17.5, 5.4);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-133.5, -0.6, 17.5, 5.4);

    // 6B) 耗材簇 A（-103..-83）：冻存管盒 2 + 镊子 + 刮刀
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.65;
    ctx.fillRect(-102.5, -2.0, 12.0, 9.2);
    ctx.strokeRect(-102.5, -2.0, 12.0, 9.2);
    ctx.fillStyle = '#10b981';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            ctx.beginPath(); ctx.arc(-100.3 + c * 2.5, 0.2 + r * 2.5, 0.7, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.fillStyle = 'rgba(167, 243, 208, 0.28)';
    ctx.fillRect(-102.5, -4.5, 12.0, 2.3);
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(-102.5, -15.5, 12.0, 9.5);
    ctx.strokeRect(-102.5, -15.5, 12.0, 9.5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-101.0, -14.0, 9.0, 6.5);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-98.0, -6.3, 3.0, 1.2);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-89.5, 2.5); ctx.lineTo(-82.5, 6.5);
    ctx.moveTo(-89.5, 3.7); ctx.lineTo(-82.5, 6.5);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-89.5, -11.3, 6.5, 1.2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-85.5, -11.6, 3.0, 1.8);

    // 6C) 液氮储存罐（cx = -65.5, y = -5.2，排气管接入北墙 -27.3）
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-65.5, -18.0); ctx.lineTo(-65.5, -27.3); ctx.stroke();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(-66.3, -18.0); ctx.lineTo(-66.3, -27.3); ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-65.5, -5.2, 16.2, 0, Math.PI * 2); ctx.fill();
    const ln2Grad = ctx.createRadialGradient(-69.5, -8.5, 2, -65.5, -5.2, 15.0);
    ln2Grad.addColorStop(0, '#f8fafc');
    ln2Grad.addColorStop(0.55, '#cbd5e1');
    ln2Grad.addColorStop(1, '#64748b');
    ctx.fillStyle = ln2Grad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.arc(-65.5, -5.2, 15.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(-65.5, -5.2, 8.0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.fillRect(-69.0, -6.2, 7.0, 2.0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-72.5, 4.9, 14.0, 3.6);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-72.5, 4.9, 14.0, 3.6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-71.5, 5.7, 9.6, 2.0);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('LN2', -65.5, -10.5);

    // 记录板（置于样本箱后方靠墙空位 x = -35, y = -20.2）
    ctx.save();
    ctx.translate(-35, -20.2);
    ctx.rotate(0.08);
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(-4.8, -3.2, 9.6, 6.4);
    ctx.strokeRect(-4.8, -3.2, 9.6, 6.4);
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(-4.0, -2.3, 8.0, 4.7);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-1.8, -3.4, 3.6, 1.3);
    ctx.restore();

    // 6D) 耗材簇 B（-48..-24）：标签打印机 + 记号笔 + 便携标本箱
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.75;
    ctx.fillRect(-47.0, -1.0, 14.0, 9.2);
    ctx.strokeRect(-47.0, -1.0, 14.0, 9.2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-45.0, 5.2, 10.0, 2.0);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-43.5, 7.2, 7.0, 3.0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-31.5, 5.6, 7.2, 1.6);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-30.0, 5.8, 2.2, 1.1);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-47.5, -16.8, 22.5, 13.5);
    ctx.strokeRect(-47.5, -16.8, 22.5, 13.5);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-45.5, -8.4, 7.0, 3.4);

    // 6E) 冻存架 1 组（-22..+8，A1/B4/C9 面向房间 +y 拉出）
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.85;
    ctx.fillRect(-22, -17.5, 30, 23.0);
    ctx.strokeRect(-22, -17.5, 30, 23.0);
    [
        { x: -20.5, w: 8.4, col: '#0284c7', txt: 'A1', txtCol: '#e0f2fe', pull: 2.8 },
        { x: -11.2, w: 8.4, col: '#10b981', txt: 'B4', txtCol: '#ecfdf5', pull: 1.3 },
        { x: -1.9,  w: 8.4, col: '#f59e0b', txt: 'C9', txtCol: '#fef3c7', pull: 0.0 }
    ].forEach(tier => {
        const ty = -16.2 + tier.pull;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(tier.x, ty, tier.w, 20.5);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(tier.x, ty, tier.w, 20.5);
        ctx.fillStyle = tier.col;
        ctx.fillRect(tier.x + 0.8, ty + 1.5, tier.w - 1.6, 16.8);
        ctx.strokeRect(tier.x + 0.8, ty + 1.5, tier.w - 1.6, 16.8);
        ctx.font = 'bold 2.4px monospace';
        ctx.fillStyle = tier.txtCol;
        ctx.fillText(tier.txt, tier.x + tier.w / 2, ty + 9.9);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(tier.x + 1.8, ty + 20.1, tier.w - 3.6, 1.3);
    });

    // 6F) 耗材簇 C（+11..+35）：计时器 + 离心管架
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.7;
    ctx.fillRect(16.5, 2.8, 12.5, 6.8);
    ctx.strokeRect(16.5, 2.8, 12.5, 6.8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(18.4, 7.8, 3.2, 1.1);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(23.8, 7.8, 3.2, 1.1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(17.8, 3.6, 9.9, 3.5);

    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.65;
    ctx.fillRect(11.5, -17.0, 22.5, 15.0);
    ctx.strokeRect(11.5, -17.0, 22.5, 15.0);
    [
        { x: 14.2, y: -5.8, col: '#10b981' },
        { x: 18.4, y: -5.8, col: '#f59e0b' },
        { x: 14.2, y: -12.6, col: '#38bdf8' },
        { x: 18.4, y: -12.6, col: '#e2e8f0' }
    ].forEach(t15 => {
        ctx.fillStyle = t15.col;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.arc(t15.x, t15.y, 1.5, 0, Math.PI * 2); ctx.stroke();
    });
    [
        { x: 27.2, y: -5.8, col: '#10b981' },
        { x: 27.2, y: -12.8, col: '#38bdf8' }
    ].forEach(t50 => {
        ctx.fillStyle = t50.col;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.25, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(t50.x, t50.y, 2.45, 0, Math.PI * 2); ctx.stroke();
    });

    // 6G) 标本柜（+37..+77）
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.fillRect(37, -17.7, 40, 25.5);
    ctx.strokeRect(37, -17.7, 40, 25.5);
    ctx.fillStyle = '#082f49';
    ctx.fillRect(39.2, -15.5, 35.6, 21.0);
    [-11.5, -3.0].forEach((sy, sIdx) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(40.0, sy, 34.0, 1.4);
        for (let rx = 42.5; rx <= 71.5; rx += 5.2) {
            ctx.fillStyle = (rx + sIdx) % 2 === 0 ? '#10b981' : '#38bdf8';
            ctx.fillRect(rx, sy + 2.0, 3.4, 3.8);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(rx + 0.6, sy + 5.8, 2.2, 0.8);
        }
    });
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.95;
    ctx.strokeRect(39.2, -15.5, 17.8, 21.0);
    ctx.strokeRect(57.0, -15.5, 17.8, 21.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(54.6, -3.0, 1.2, 5.2);
    ctx.fillRect(58.2, -3.0, 1.2, 5.2);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.arc(57.0, -4.5, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 6H) 传递窗（+81..+127）
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.95;
    ctx.fillRect(81, -17.7, 46, 25.5);
    ctx.strokeRect(81, -17.7, 46, 25.5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(84.5, -14.5, 39.0, 19.0);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(84.5, -14.5, 39.0, 19.0);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(85.5, -13.5, 18.0, 17.0);
    ctx.strokeRect(104.5, -13.5, 18.0, 17.0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(101.2, -7.5, 1.4, 6.0);
    ctx.fillRect(105.4, -7.5, 1.4, 6.0);
    ctx.fillStyle = '#475569';
    ctx.fillRect(88.5, -6.2, 2.2, 2.4);
    ctx.fillRect(117.3, -6.2, 2.2, 2.4);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(85.5, 5.0, 12.5, 2.3);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('PASS-BOX', 108.0, 6.0);

    ctx.restore();
}

// 2026-11-21 动态层节流缓存：每 0.1s 重绘一次进离屏缓存，其余帧直接贴图（见 __dynDrawCached）。
function drawWestBench03Dynamic(ctx, cx, cy, unitAngle, time) {
    __dynDrawCached(ctx, 'drawWestBench03Dynamic', 340, 280, cx, cy, (octx) => drawWestBench03DynamicImpl(octx, cx, cy, unitAngle, time));
}
function drawWestBench03DynamicImpl(ctx, cx, cy, unitAngle, time) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(unitAngle);

    // 1. 超低温冰箱
    const tempVal = (-80.0 + Math.sin(time * 0.42) * 0.4).toFixed(1);
    ctx.fillStyle = '#06263d';
    ctx.fillRect(-133.0, -0.2, 16.5, 4.6);
    ctx.font = 'bold 2.4px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${tempVal}C`, -124.75, 1.85);
    const compLoad = 0.55 + 0.35 * Math.sin(time * 0.9);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-132.0, 3.6, 14.5, 0.7);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-132.0, 3.6, 14.5 * compLoad, 0.7);
    const frostDrift = 0.22 + 0.14 * Math.sin(time * 1.4);
    ctx.fillStyle = `rgba(224, 242, 254, ${frostDrift.toFixed(3)})`;
    ctx.fillRect(-134.0, 5.9, 24.0, 1.3);

    // 2. 液氮储存罐
    const ln2Level = 8.4 + Math.sin(time * 0.7) * 1.2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-71.7, 5.6, 12.4, 2.2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-71.5, 5.7, ln2Level, 2.0);
    const mistR = 4.2 + ((time * 0.75) % 1.0) * 5.8;
    const mistA = (1.0 - ((time * 0.75) % 1.0)) * 0.36;
    ctx.strokeStyle = `rgba(224, 242, 254, ${mistA.toFixed(3)})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(-65.5, -5.2, mistR, 0, Math.PI * 2); ctx.stroke();
    const exhY = -18.2 - ((time * 1.15) % 1.0) * 8.8;
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath(); ctx.arc(-65.5, exhY, 0.85, 0, Math.PI * 2); ctx.fill();

    // 3. 冻存架 A1 冷雾
    const a1Frost = 0.16 + 0.12 * Math.sin(time * 1.8);
    ctx.fillStyle = `rgba(186, 230, 253, ${a1Frost.toFixed(3)})`;
    ctx.fillRect(-19.8, -10.8, 7.0, 16.0);

    // 4. 台面计时器
    const b3Sec = 760 - (Math.floor(time) % 760);
    const b3mm = String(Math.floor(b3Sec / 60)).padStart(2, '0');
    const b3ss = String(b3Sec % 60).padStart(2, '0');
    ctx.fillStyle = '#06263d';
    ctx.fillRect(17.8, 3.6, 9.9, 3.5);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${b3mm}:${b3ss}`, 22.75, 5.35);

    // 5. 标本柜内部冷光 + 液面微闪
    const cabGlow = 0.08 + 0.06 * Math.sin(time * 1.1);
    ctx.fillStyle = `rgba(56, 189, 248, ${cabGlow.toFixed(3)})`;
    ctx.fillRect(40.0, -14.8, 34.0, 19.6);
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.5)';
    ctx.lineWidth = 0.45;
    [-11.5, -3.0].forEach((sy, sIdx) => {
        for (let rx = 42.5; rx <= 71.5; rx += 5.2) {
            const w = Math.sin(time * 1.6 + rx * 0.4 + sIdx) * 0.35;
            ctx.beginPath(); ctx.moveTo(rx + 0.4, sy + 3.8 + w); ctx.lineTo(rx + 3.0, sy + 3.8 - w); ctx.stroke();
        }
    });

    // 6. 传递窗：UV 灯管 + 扫描光束 + 互锁进度条
    const uvPulse = 0.45 + 0.35 * Math.sin(time * 1.15);
    ctx.fillStyle = `rgba(56, 189, 248, ${(uvPulse * 0.24).toFixed(3)})`;
    ctx.fillRect(86.5, -12.0, 35.0, 14.0);
    const scanX = 87.5 + ((Math.sin(time * 1.2) * 0.5 + 0.5) * 33.0);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(scanX, -12.5); ctx.lineTo(scanX, 2.5); ctx.stroke();
    ctx.strokeStyle = `rgba(186, 230, 253, ${(0.55 + 0.35 * uvPulse).toFixed(2)})`;
    ctx.lineWidth = 1.35;
    ctx.beginPath(); ctx.moveTo(90.7, -5.0); ctx.lineTo(117.3, -5.0); ctx.stroke();
    const uvPct = ((time * 0.12) % 1.0);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(86.2, 5.6, 11.1 * uvPct, 1.1);

    // 7. 指示灯
    [
        { x: -115.2, y: 3.2,   on: '#ef4444', dim: '#7f1d1d', spd: 1.8, ph: 0.0 },
        { x: -115.2, y: 1.0,   on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 1.0 },
        { x: -55.5,  y: 6.8,   on: '#38bdf8', dim: '#0c4a6e', spd: 1.3, ph: 2.0 },
        { x: -34.5,  y: 7.2,   on: '#10b981', dim: '#064e3b', spd: 2.4, ph: 0.4 },
        { x: -40.5,  y: -6.7,  on: '#38bdf8', dim: '#0c4a6e', spd: 1.5, ph: 1.2 },
        { x: 49.0,   y: 6.6,   on: '#10b981', dim: '#064e3b', spd: 1.1, ph: 0.5 },
        { x: 122.0,  y: 5.8,   on: '#c084fc', dim: '#4c1d95', spd: 1.4, ph: 1.7 },
        { x: 43.6,   y: -26.2, on: '#10b981', dim: '#064e3b', spd: 1.0, ph: 0.9 }
    ].forEach(led => {
        const p = 0.5 + 0.5 * Math.sin(time * led.spd + led.ph);
        ctx.fillStyle = p > 0.35 ? led.on : led.dim;
        ctx.beginPath(); ctx.arc(led.x, led.y, 0.85, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
}

function getWestBench03Obstacle() {
    const cx = 815.37, cy = 723.73;
    const unitAngle = -0.665;
    const cosA = Math.cos(unitAngle);
    const sinA = Math.sin(unitAngle);
    const halfW = 141.5; // 283 / 2
    const halfH = 25;    // 50 / 2

    const worldPts = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ].map(p => ({
        x: +(cx + p.x * cosA - p.y * sinA).toFixed(2),
        y: +(cy + p.x * sinA + p.y * cosA).toFixed(2)
    }));

    return {
        type: 'solid',
        cx: cx,
        cy: cy,
        points: worldPts,
        label: 'WEST BIOSAFETY BENCH 03',
        displayName: 'BIOSAFETY & SPECIMEN STORAGE BENCH 03',
        hideLabel: true,
        draw: (ctx) => {
            const camX = Math.max(0, window.cameraX || 0);
            const camY = Math.max(0, window.cameraY || 0);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (cx + 190 < camX || cx - 190 > camX + vw || cy + 160 < camY || cy - 160 > camY + vh) return;

            const cacheKey = '__westBench03V1_' + cx + '_' + cy;
            if (!window[cacheKey]) {
                const SS = 2; // 2026-11-21 优化：静态缓存超采样 4→2（源像素减 4 倍，drawImage 大降；2x 仍超采样，细字无损）;
                const cw = 320, ch = 260;
                const off = document.createElement('canvas');
                off.width = cw * SS;
                off.height = ch * SS;
                const octx = off.getContext('2d');
                octx.save();
                octx.scale(SS, SS);
                octx.translate(cw / 2 - cx, ch / 2 - cy);
                drawWestBench03Static(octx, cx, cy, unitAngle);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            const time = Date.now() * 0.001;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 2026-11-21 优化：high→medium（软件渲染下 high 的双三次滤波极贵；2x 超采样下 medium 视觉几乎无差）;
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2, c.w, c.h);
            drawWestBench03Dynamic(ctx, cx, cy, unitAngle, time);
            ctx.restore();
        }
    };
}

const LEVEL_7_TEST = {
    id: "level7_test",
    name: "第 8 关 · 测试关卡",
    nameEn: "Level 08 · Test Sandbox",
    themeColor: "#022c22",
    gridColor: "rgba(16, 185, 129, 0.22)",
    accentColor: "#10b981",
    playerStart: { x: 1600, y: 900 },

    getMapLayout: (width, height) => {
        const cx = 1600;
        const cy = 1200; // 整张地图正中央 (3200 x 2400 之中心点)

        // =====================================================================
        // 1. 实体阻挡障碍物 (Obstacles)
        // =====================================================================
        const obstacles = [
            // A. 中间房间最上方 3 大显示屏的封闭外墙
            {
                type: 'solid',
                points: [
                    { x: 1055, y: 483 },
                    { x: 2145, y: 483 },
                    { x: 2145, y: 497 },
                    { x: 1055, y: 497 }
                ],
                label: 'TOP SCREEN UPPER HEAVY ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1048, y: 490 },
                    { x: 1062, y: 490 },
                    { x: 1117, y: 820 },
                    { x: 1103, y: 820 }
                ],
                label: 'TOP LEFT SCREEN HEAVY ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 2138, y: 490 },
                    { x: 2152, y: 490 },
                    { x: 2097, y: 820 },
                    { x: 2083, y: 820 }
                ],
                label: 'TOP RIGHT SCREEN HEAVY ARMORED WALL',
                hideLabel: true
            },

            // B. 西侧重型装甲墙体 (4扇重型自动防爆门留出 120px 门洞)
            {
                type: 'poly_wall',
                points: [
                    { x: 1103, y: 820 },
                    { x: 1117, y: 820 },
                    { x: 1124, y: 860 },
                    { x: 1110, y: 860 }
                ],
                label: 'WEST HEAVY ARMORED WALL 1',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1132, y: 980 },
                    { x: 1146, y: 980 },
                    { x: 1285, y: 1775 },
                    { x: 1271, y: 1775 }
                ],
                label: 'WEST HEAVY ARMORED WALL 2',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1292, y: 1895 },
                    { x: 1306, y: 1895 },
                    { x: 1318, y: 1960 },
                    { x: 1304, y: 1960 }
                ],
                label: 'WEST HEAVY ARMORED WALL 3',
                hideLabel: true
            },

            // C. 东侧重型装甲墙体 (4扇重型自动防爆门留出 120px 门洞)
            {
                type: 'poly_wall',
                points: [
                    { x: 2083, y: 820 },
                    { x: 2097, y: 820 },
                    { x: 2090, y: 860 },
                    { x: 2076, y: 860 }
                ],
                label: 'EAST HEAVY ARMORED WALL 1',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 2054, y: 980 },
                    { x: 2068, y: 980 },
                    { x: 1929, y: 1775 },
                    { x: 1915, y: 1775 }
                ],
                label: 'EAST HEAVY ARMORED WALL 2',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1894, y: 1895 },
                    { x: 1908, y: 1895 },
                    { x: 1896, y: 1960 },
                    { x: 1882, y: 1960 }
                ],
                label: 'EAST HEAVY ARMORED WALL 3',
                hideLabel: true
            },

            // D. 南侧底部重型装甲封底墙
            {
                type: 'solid',
                points: [
                    { x: 1304, y: 1953 },
                    { x: 1896, y: 1953 },
                    { x: 1896, y: 1967 },
                    { x: 1304, y: 1967 }
                ],
                label: 'SOUTH HEAVY ARMORED WALL',
                hideLabel: true
            },

            // E. 巨型眼睛外围轮廓斜外墙
            {
                type: 'poly_wall',
                points: [
                    { x: 145.1, y: 1193.7 },
                    { x: 1050.1, y: 483.7 },
                    { x: 1059.9, y: 496.3 },
                    { x: 154.9, y: 1206.3 }
                ],
                label: 'WEST EYE OUTER WALL TOP',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 154.4, y: 1193.3 },
                    { x: 1308.4, y: 1953.3 },
                    { x: 1299.6, y: 1966.7 },
                    { x: 145.6, y: 1206.7 }
                ],
                label: 'WEST EYE OUTER WALL BOTTOM',
                hideLabel: true
            },
            {
                type: 'solid',
                points: [
                    { x: 138, y: 1190 },
                    { x: 155, y: 1190 },
                    { x: 155, y: 1210 },
                    { x: 138, y: 1210 }
                ],
                label: 'WEST EYE TIP CAP',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 2149.9, y: 483.7 },
                    { x: 3054.9, y: 1193.7 },
                    { x: 3045.1, y: 1206.3 },
                    { x: 2140.1, y: 496.3 }
                ],
                label: 'EAST EYE OUTER WALL TOP',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1891.6, y: 1953.3 },
                    { x: 3045.6, y: 1193.3 },
                    { x: 3054.4, y: 1206.7 },
                    { x: 1900.4, y: 1966.7 }
                ],
                label: 'EAST EYE OUTER WALL BOTTOM',
                hideLabel: true
            },
            {
                type: 'solid',
                points: [
                    { x: 3045, y: 1190 },
                    { x: 3062, y: 1190 },
                    { x: 3062, y: 1210 },
                    { x: 3045, y: 1210 }
                ],
                label: 'EAST EYE TIP CAP',
                hideLabel: true
            },

            // F. 正中央大圆会议桌系统 (移植自 Level 8，2026-11-05，替换原中央圆台)
            {
                type: 'solid',
                circle: { cx: cx, cy: cy, radius: 155 },
                label: 'CENTRAL CONFERENCE TABLE',
                displayName: 'CONFERENCE TABLE',
                // 2026-11-09 重组 V2：手雷可越过圆桌（只对手雷，子弹仍挡；与 L7 一致）
                grenadePass: true,
                hideLabel: true,
                draw: (ctx) => {
                    // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
                    const cacheKey = '__confCache_' + cx + '_' + cy;
                    if (!window[cacheKey]) {
                        const sz = 500;
                        const off = document.createElement('canvas');
                        off.width = sz; off.height = sz;
                        const octx = off.getContext('2d');
                        octx.save();
                        octx.translate(sz / 2, sz / 2);
                        octx.translate(-cx, -cy);
                        drawConferenceTableSystem(octx, cx, cy, 155, 1);
                        octx.restore();
                        window[cacheKey] = { canvas: off, size: sz };
                    }
                    const cc = window[cacheKey];
                    ctx.drawImage(cc.canvas, cx - cc.size / 2, cy - cc.size / 2);
                    // 动态元素每帧叠加
                    drawConferenceTableSystemDynamic(ctx, cx, cy, 155);
                }
            },

            // H. 缓冲区通道倾斜重装甲北墙与南墙（平行左上外墙 2.4633 弧度，内端 (1121, 920) 锚定不动；内端沿门洞墙线斜切密封，不戳出、不留缝）
            {
                type: 'poly_wall',
                isBufferCorridorWall: true,
                points: [
                    { x: 1111.61, y: 868.81 },
                    { x: 1108.74, y: 853.14 },
                    { x: 778.28, y: 1119.44 },
                    { x: 787.06, y: 1130.34 }
                ],
                label: 'BUFFER CORRIDOR NORTH ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                isBufferCorridorWall: true,
                points: [
                    { x: 1130.39, y: 971.19 },
                    { x: 1133.26, y: 986.86 },
                    { x: 853.26, y: 1212.49 },
                    { x: 844.48, y: 1201.59 }
                ],
                label: 'BUFFER CORRIDOR SOUTH ARMORED WALL',
                hideLabel: true
            },
            // H2. 缓冲区两扇气密门南北门洞墙垛刚体碰撞 (留出 63px 净门洞，draw 为空避免遮盖门兜与识别终端)
            ...[
                { name: 'DOOR 1', cx: 968.39, cy: 1042.98 },
                { name: 'DOOR 2', cx: 828.85, cy: 1155.42 }
            ].flatMap(d => {
                const ang = 2.4633 - Math.PI;
                const ca = Math.cos(ang), sa = Math.sin(ang);
                const makeJamb = (y1, y2, tag) => ({
                    type: 'poly_wall',
                    points: [
                        { x: -6, y: y1 },
                        { x: 6, y: y1 },
                        { x: 6, y: y2 },
                        { x: -6, y: y2 }
                    ].map(pt => ({
                        x: +(d.cx + pt.x * ca - pt.y * sa).toFixed(1),
                        y: +(d.cy + pt.x * sa + pt.y * ca).toFixed(1)
                    })),
                    label: `BUFFER ${d.name} ${tag} BULKHEAD JAMB`,
                    hideLabel: true,
                    draw: () => {}
                });
                return [
                    makeJamb(-46, -31.5, 'NORTH'),
                    makeJamb(31.5, 46, 'SOUTH')
                ];
            }),

            // G. 中间房间左圆柱终端 (已替换为指挥讲台，2026-11-05)
            // (已删除 LEFT TERMINAL PILLAR，替换为讲台)


            // I. 中间房间南侧长方形系统 (3 排 × 2 列 = 6 个长方形)
            // (圆形控制台已移至 props 数组)
            // (已删除 R1-L，替换为圆形控制台)
            // (已删除 R1-R，替换为圆形控制台)
            // (已删除 R2-L，替换为圆形控制台)
            // (已删除 R2-R，替换为圆形控制台)
            // (已删除 R3-L/R3-R，替换为三联方形隔间控制台，2026-11-05)

            // J. 西侧三角房 · 0.7x 法医解剖室设施：沿北墙平行 (-0.665 rad) 移至 (601.3, 1035.6) 一带，远离五联/七联舱与出口
            getWestAutopsyTableObstacle(601.3, 1035.6, -0.665),
            getWestAutopsyTrayObstacle(535.8, 1041.2, 'hearts', 'AUTOPSY TRAY NW (HEARTS)', -0.665),
            getWestAutopsyTrayObstacle(622.3, 973.3, 'tools', 'AUTOPSY TRAY NE (TOOLS)', -0.665),
            getWestAutopsyTrayObstacle(580.8, 1098.6, 'organs', 'AUTOPSY TRAY SW (ORGANS)', -0.665),
            getWestAutopsyTrayObstacle(667.4, 1030.7, 'intestines', 'AUTOPSY TRAY SE (INTESTINES)', -0.665),
            getWestToolCartObstacle(499.0, 1115.8, -0.665),
            getWestBucketObstacle(578.4, 1136.1, -0.665),
            getWestStepStoolObstacle(709.1, 1027.2, -0.665),

            // K. 西侧三角房 · 0.7x 五联胶囊型培养舱 (228x114 旋转矩形 solid @ 1018.93,712.87) + 七联胶囊型培养舱 (318x114 旋转矩形 solid @ 1110.88,1239.52)
            getWestPentaIncubationUnitObstacle(),
            getWestHeptaIncubationUnitObstacle(),

            // L. 西侧三角房 · 北墙三台长试验台 01–03（各 283x50 旋转矩形 solid，角度 -0.665 rad，贴墙距内壁 3px）
            getWestBench01Obstacle(),
            getWestBench02Obstacle(),
            getWestBench03Obstacle(),

            // M. 西侧三角房 · 底墙西段长试验台 04（仪器分析台 330x50 旋转矩形 solid @ 378.59,1307.44，占沿墙 85–415）
            getWestBench04Obstacle(),

            // N. 西侧三角房 · 底墙中段长试验台 05（生物安全/标本储存台 330x50 旋转矩形 solid @ 658.37,1491.69，占沿墙 420–750）
            getWestBench05Obstacle(),

            // O. 西侧三角房 · 底墙东段长试验台 06（湿化学台 330x50 旋转矩形 solid @ 938.14,1675.95，占沿墙 755–1085）
            getWestBench06Obstacle()
        ];

        // =====================================================================
        // 2. Blueprint 视觉图层 (巨型眼睛地坪 + 3 大屏幕 + 圆弧/门洞刻度)
        // =====================================================================
        const props = [
            {
                x: 100,
                y: 400,
                w: 3000,
                h: 1650,
                noCollision: true,
                hideLabel: true,
                draw: (ctx) => {
                    // ===== 离屏预渲染优化 (2026-11-04)：蓝图静态内容只画一次 =====
                    const P = { x: 100, y: 400, w: 3000, h: 1650 };
                    if (!window.__l7TestBlueprintCache) {
                        const off = document.createElement('canvas');
                        off.width = P.w; off.height = P.h;
                        const octx = off.getContext('2d');
                        octx.save();
                        octx.translate(-P.x, -P.y);
                        ((ctx) => {
                    ctx.save();

                    // --- 1. 巨型眼睛三大房间地坪底色 ---
                    ctx.beginPath();
                    ctx.moveTo(150, 1200);      // 西端眼睛顶点
                    ctx.lineTo(1055, 470);     // 中室西北角
                    ctx.lineTo(2145, 470);     // 中室东北角
                    ctx.lineTo(3050, 1200);    // 东端眼睛顶点
                    ctx.lineTo(1896, 1960);    // 中室东南角
                    ctx.lineTo(1304, 1960);    // 中室西南角
                    ctx.closePath();
                    ctx.fillStyle = '#05100c';
                    ctx.fill();

                    // V16：L8 中间房间简单方格（像 L1/L2：单色底 + 50px 方格线，方格边缘带渐变、不扁平）
                    // 地砖去翡翠色：中间亮的部分之前偏翡翠（rgba(52,211,153)），改回原来的深色，只做中间浅、边缘深的中性明暗渐变
                    if (typeof window.__l78GridPattern === 'undefined' || !window.__l78GridPattern) {
                        const tc = document.createElement('canvas');
                        tc.width = 50; tc.height = 50;
                        const tctx = tc.getContext('2d');
                        // V18：地砖直接用深色之间的径向渐变（中心 #0a1f18 略浅、边缘 #020a07 更深）；
                        // 不再用白色提亮——白色叠在深绿底上会显翡翠绿；中心是“浅色效果的深色”，仍是深色
                        const g = tctx.createRadialGradient(25, 25, 5, 25, 25, 35);
                        g.addColorStop(0, '#051410');
                        g.addColorStop(1, '#020a07');
                        tctx.fillStyle = g;
                        tctx.fillRect(0, 0, 50, 50);
                        // 方格边线：翡翠绿（用户确认没问题，不改；V17 改中性是过度解读，已改回）
                        tctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
                        tctx.lineWidth = 1;
                        tctx.strokeRect(0.5, 0.5, 49, 49);
                        window.__l78GridPattern = ctx.createPattern(tc, 'repeat');
                    }
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1055, 470);     // 中室西北角
                    ctx.lineTo(2145, 470);     // 中室东北角
                    ctx.lineTo(1896, 1960);    // 中室东南角
                    ctx.lineTo(1304, 1960);    // 中室西南角
                    ctx.closePath();
                    ctx.fillStyle = window.__l78GridPattern;
                    ctx.fill();
                    ctx.restore();

                    // V19（2026-11-21）：左房间银色地砖，与中室同款 50px 方格 + 径向渐变
                    // 银白系：中心 #edf0f3 略浅、边缘 #c6ccd2 银色；格线银灰细线，砖面本身不比银色更深
                    if (typeof window.__l78GridPatternSilver === 'undefined' || !window.__l78GridPatternSilver) {
                        const tc = document.createElement('canvas');
                        tc.width = 50; tc.height = 50;
                        const tctx = tc.getContext('2d');
                        const g = tctx.createRadialGradient(25, 25, 5, 25, 25, 35);
                        g.addColorStop(0, '#edf0f3');
                        g.addColorStop(1, '#c6ccd2');
                        tctx.fillStyle = g;
                        tctx.fillRect(0, 0, 50, 50);
                        tctx.strokeStyle = 'rgba(110, 118, 128, 0.45)';
                        tctx.lineWidth = 1;
                        tctx.strokeRect(0.5, 0.5, 49, 49);
                        window.__l78GridPatternSilver = ctx.createPattern(tc, 'repeat');
                    }
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(150, 1200);     // 西侧三角房 · 西尖
                    ctx.lineTo(1055, 490);     // 西侧三角房 · 北墙东端
                    ctx.lineTo(1308, 1953);    // 西侧三角房 · 东墙南端
                    ctx.closePath();
                    ctx.fillStyle = window.__l78GridPatternSilver;
                    ctx.fill();
                    ctx.restore();

                    // --- 2. 中间大圆形内部悬挂发光灯环 ---
                    ctx.beginPath();
                    ctx.arc(cx, cy, 143, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(52, 211, 153, 0.95)';
                    ctx.lineWidth = 8;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(cx, cy, 143, 0, Math.PI * 2);
                    ctx.strokeStyle = '#e6fffa';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // --- 3. 最上方 3 大高科技控制显示屏 ---
                    ctx.save();

                    // 3A. LEFT SCREEN
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1055, 490);
                    ctx.lineTo(1403, 490);
                    ctx.lineTo(1445, 740);
                    ctx.lineTo(1110, 820);
                    ctx.closePath();

                    const radLeft = ctx.createRadialGradient(1250, 650, 20, 1250, 650, 320);
                    radLeft.addColorStop(0, '#0b355c');
                    radLeft.addColorStop(0.45, '#061c3a');
                    radLeft.addColorStop(1, '#05100c');
                    ctx.fillStyle = radLeft;
                    ctx.fill();

                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    ctx.clip();

                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.04)';
                    ctx.lineWidth = 1;
                    for (let gy = 480; gy < 830; gy += 3) {
                        ctx.beginPath(); ctx.moveTo(1000, gy); ctx.lineTo(1500, gy); ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.moveTo(1055, 490); ctx.lineTo(1250, 490); ctx.lineTo(1120, 750); ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.18)';
                    ctx.fillRect(1070, 495, 325, 22);
                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1070, 495, 325, 22);

                    ctx.font = 'bold 11px monospace';
                    ctx.fillStyle = '#00E5FF';
                    ctx.textAlign = 'center';
                    ctx.fillText('INFERNAL DEEP MONITOR', 1232, 510);

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1075, 523, 318, 112);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1075, 523, 318, 112);

                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#38bdf8';
                    ctx.textAlign = 'left';
                    ctx.fillText('ABYSSAL DEEP SECTOR OUTLINE:', 1082, 535);

                    // Sector 1: Demon Wings
                    ctx.strokeStyle = '#FF3344'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(1080, 542, 90, 88);
                    ctx.fillStyle = 'rgba(255, 51, 68, 0.10)'; ctx.fillRect(1080, 542, 90, 88);

                    ctx.save();
                    ctx.translate(1125, 580);
                    ctx.strokeStyle = '#ff3344';
                    ctx.fillStyle = 'rgba(255, 51, 68, 0.25)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.bezierCurveTo(-12, -15, -30, -12, -33, 2);
                    ctx.bezierCurveTo(-24, 8, -18, 18, -10, 10);
                    ctx.bezierCurveTo(-6, 15, -3, 12, 0, 5);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.bezierCurveTo(12, -15, 30, -12, 33, 2);
                    ctx.bezierCurveTo(24, 8, 18, 18, 10, 10);
                    ctx.bezierCurveTo(6, 15, 3, 12, 0, 5);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-33, 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(33, 2); ctx.stroke();
                    ctx.restore();

                    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#FF3344';
                    ctx.fillText('SEC 1: SATAN DOMAIN', 1125, 622);

                    // Sector 2: Irregular Lava Lake Polygon
                    ctx.strokeStyle = '#FFCC00'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(1178, 542, 90, 88);
                    ctx.fillStyle = 'rgba(255, 204, 0, 0.10)'; ctx.fillRect(1178, 542, 90, 88);

                    ctx.save();
                    ctx.translate(1223, 578);
                    ctx.strokeStyle = '#ffaa00';
                    ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(-28, -10);
                    ctx.lineTo(-10, -20);
                    ctx.lineTo(16, -16);
                    ctx.lineTo(28, -4);
                    ctx.lineTo(24, 16);
                    ctx.lineTo(2, 22);
                    ctx.lineTo(-22, 14);
                    ctx.lineTo(-28, 4);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    ctx.strokeStyle = '#ffe600'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(2, 22); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-28, 4); ctx.lineTo(16, -16); ctx.stroke();
                    ctx.restore();

                    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFCC00';
                    ctx.fillText('SEC 2: MOLTEN BASIN', 1223, 622);

                    // Sector 3: Sacrificial Altar Hexagon
                    ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(1276, 542, 112, 88);
                    ctx.fillStyle = 'rgba(0, 255, 102, 0.10)'; ctx.fillRect(1276, 542, 112, 88);

                    ctx.save();
                    ctx.translate(1332, 578);
                    ctx.strokeStyle = '#00ff66';
                    ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    for (let a = 0; a < 6; a++) {
                        const ang = (Math.PI / 3) * a;
                        const hx = 20 * Math.cos(ang);
                        const hy = 20 * Math.sin(ang);
                        if (a === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();

                    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#00FF66';
                    ctx.fillText('SEC 3: SACRIFICE ALTAR', 1332, 622);

                    // Cerberus Diagram
                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1098, 642, 330, 138);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1098, 642, 330, 138);

                    ctx.font = 'bold 9px monospace';
                    ctx.fillStyle = '#ef4444'; ctx.textAlign = 'left';
                    ctx.fillText('SUBJECT: CERBERUS / HELLHOUND DIAGRAM', 1106, 655);

                    ctx.save();
                    ctx.translate(1150, 712);

                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.moveTo(-16, 8); ctx.lineTo(-22, 24); ctx.lineTo(-18, 25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-12, 24); ctx.lineTo(-8, 25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(8, 24); ctx.lineTo(12, 25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(18, 8); ctx.lineTo(18, 24); ctx.lineTo(22, 25); ctx.stroke();

                    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
                    ctx.beginPath(); ctx.ellipse(0, 2, 22, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(-22, 2);
                    ctx.quadraticCurveTo(-32, -8, -28, -18);
                    ctx.stroke();
                    ctx.fillStyle = '#ff2200';
                    ctx.beginPath(); ctx.arc(-28, -18, 3, 0, Math.PI * 2); ctx.fill();

                    const drawHead = (hx, hy, angle) => {
                        ctx.save();
                        ctx.translate(hx, hy);
                        ctx.rotate(angle);
                        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 0); ctx.stroke();
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
                        ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(3, -4); ctx.lineTo(10, -2); ctx.lineTo(3, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-4, -11); ctx.lineTo(1, -6); ctx.fill(); ctx.stroke();
                        ctx.fillStyle = '#ff0000';
                        ctx.beginPath(); ctx.arc(2, -3, 1.2, 0, Math.PI * 2); ctx.fill();
                        ctx.restore();
                    };

                    drawHead(-12, -8, -0.35);
                    drawHead(0, -12, 0);
                    drawHead(12, -8, 0.35);

                    ctx.restore();

                    ctx.font = 'bold 8.5px monospace'; ctx.textAlign = 'left';
                    ctx.fillStyle = '#f87171';
                    ctx.fillText('ENTITY ID: CERBERUS-X', 1208, 672);
                    ctx.fillText('THREAT LEVEL: OMEGA-MAX', 1208, 687);
                    ctx.fillStyle = '#FFCC00';
                    ctx.fillText('STATUS: UNKNOWN', 1208, 702);
                    ctx.fillText('ANATOMY DATA: UNKNOWN', 1208, 717);
                    ctx.fillText('WEAKNESS: UNKNOWN', 1208, 732);

                    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                    ctx.fillRect(1106, 746, 314, 20);
                    ctx.strokeStyle = '#ef4444';
                    ctx.strokeRect(1106, 746, 314, 20);
                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#ff6666';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚠️ DETAILED SPECIFICATIONS: UNKNOWN', 1263, 760);

                    ctx.restore(); // end Screen 1

                    // 3B. CENTER SCREEN: GLOBAL STRATEGIC COMMAND & WORLD THEATER MAP
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1403, 490);
                    ctx.lineTo(1797, 490);
                    ctx.lineTo(1755, 740);
                    ctx.lineTo(1445, 740);
                    ctx.closePath();

                    const gradCenter = ctx.createRadialGradient(1600, 630, 20, 1600, 630, 300);
                    gradCenter.addColorStop(0, '#0c3a6b');
                    gradCenter.addColorStop(0.45, '#071f40');
                    gradCenter.addColorStop(1, '#05100c');
                    ctx.fillStyle = gradCenter;
                    ctx.fill();

                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    ctx.clip();

                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
                    ctx.lineWidth = 1;
                    for (let gy = 480; gy < 750; gy += 3) {
                        ctx.beginPath(); ctx.moveTo(1400, gy); ctx.lineTo(1800, gy); ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.moveTo(1403, 490); ctx.lineTo(1620, 490); ctx.lineTo(1480, 740); ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();

                    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
                    ctx.fillRect(1410, 495, 380, 24);
                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1410, 495, 380, 24);

                    ctx.font = 'bold 11px monospace';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.fillText('GLOBAL STRATEGIC COMMAND - WORLD THEATER MAP', 1600, 511);

                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
                    ctx.lineWidth = 0.8;
                    for (let latY = 530; latY <= 720; latY += 22) {
                        ctx.beginPath(); ctx.moveTo(1400, latY); ctx.lineTo(1800, latY); ctx.stroke();
                        ctx.font = 'bold 7px monospace'; ctx.fillStyle = 'rgba(0, 229, 255, 0.75)';
                        ctx.textAlign = 'left';
                        ctx.fillText(`${90 - Math.round((latY - 530) * 0.9)}°N`, 1432, latY - 2);
                    }
                    for (let lonX = 1430; lonX <= 1770; lonX += 30) {
                        ctx.beginPath();
                        ctx.moveTo(lonX, 525);
                        ctx.bezierCurveTo(lonX + (1600 - lonX) * 0.12, 600, lonX + (1600 - lonX) * 0.12, 680, lonX, 735);
                        ctx.stroke();
                    }

                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
                    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
                    ctx.lineWidth = 1.2;

                    // North America
                    ctx.beginPath();
                    ctx.moveTo(1465, 580);
                    ctx.lineTo(1490, 573);
                    ctx.lineTo(1530, 577);
                    ctx.lineTo(1525, 610);
                    ctx.lineTo(1512, 617);
                    ctx.lineTo(1508, 613);
                    ctx.lineTo(1495, 635);
                    ctx.lineTo(1480, 615);
                    ctx.lineTo(1468, 595);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // South America
                    ctx.beginPath();
                    ctx.moveTo(1495, 635);
                    ctx.lineTo(1528, 643);
                    ctx.lineTo(1522, 700);
                    ctx.lineTo(1502, 685);
                    ctx.lineTo(1490, 653);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Eurasia
                    ctx.beginPath();
                    ctx.moveTo(1560, 583);
                    ctx.lineTo(1578, 567);
                    ctx.lineTo(1595, 567);
                    ctx.lineTo(1645, 565);
                    ctx.lineTo(1740, 573);
                    ctx.lineTo(1745, 610);
                    ctx.lineTo(1700, 630);
                    ctx.lineTo(1670, 650);
                    ctx.lineTo(1655, 623);
                    ctx.lineTo(1615, 625);
                    ctx.lineTo(1610, 607);
                    ctx.lineTo(1560, 587);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Africa
                    ctx.beginPath();
                    ctx.moveTo(1570, 610);
                    ctx.lineTo(1615, 613);
                    ctx.lineTo(1622, 645);
                    ctx.lineTo(1595, 687);
                    ctx.lineTo(1568, 650);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Australia
                    ctx.beginPath();
                    ctx.moveTo(1705, 665);
                    ctx.lineTo(1748, 660);
                    ctx.lineTo(1742, 700);
                    ctx.lineTo(1702, 691);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Japan Islands Dot
                    ctx.beginPath(); ctx.arc(1748, 595, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                    const campaignLocations = [
                        { name: 'LOC-01 AIRPORT', lat: '37.6° N', lon: '122.3° W', x: 1485, y: 600, boxX: 1438, boxY: 617 },
                        { name: 'LOC-02 SUBWAY',  lat: '40.7° N', lon: '73.9° W',  x: 1520, y: 593, boxX: 1452, boxY: 563 },
                        { name: 'LOC-03 BANK',    lat: '51.5° N', lon: '0.1° W',   x: 1570, y: 575, boxX: 1545, boxY: 545 },
                        { name: 'LOC-04 YACHT',   lat: '25.7° N', lon: '80.1° W',  x: 1510, y: 630, boxX: 1448, boxY: 655 },
                        { name: 'LOC-05 HOTEL',   lat: '47.3° N', lon: '8.5° E',   x: 1592, y: 585, boxX: 1602, boxY: 600 },
                        { name: 'LOC-06 EXPRESS', lat: '55.7° N', lon: '37.6° E',  x: 1640, y: 571, boxX: 1660, boxY: 550 },
                    ];

                    campaignLocations.forEach(loc => {
                        ctx.fillStyle = '#00FF66';
                        ctx.beginPath(); ctx.arc(loc.x, loc.y, 3, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.arc(loc.x, loc.y, 6, 0, Math.PI * 2); ctx.stroke();

                        ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
                        ctx.lineWidth = 0.8;
                        ctx.beginPath(); ctx.moveTo(loc.x, loc.y); ctx.lineTo(loc.boxX + 35, loc.boxY + 9); ctx.stroke();

                        ctx.fillStyle = 'rgba(6, 28, 22, 0.88)';
                        ctx.strokeStyle = '#00E5FF';
                        ctx.lineWidth = 0.8;
                        const w = 92;
                        const h = 18;
                        ctx.fillRect(loc.boxX, loc.boxY, w, h);
                        ctx.strokeRect(loc.boxX, loc.boxY, w, h);

                        ctx.font = 'bold 6.5px monospace';
                        ctx.fillStyle = '#00E5FF'; ctx.textAlign = 'left';
                        ctx.fillText(loc.name, loc.boxX + 3, loc.boxY + 7);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(`[${loc.lat}, ${loc.lon}]`, loc.boxX + 3, loc.boxY + 15);
                    });

                    ctx.restore(); // end Screen 2

                    // 3C. RIGHT SCREEN
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1797, 490);
                    ctx.lineTo(2145, 490);
                    ctx.lineTo(2090, 820);
                    ctx.lineTo(1755, 740);
                    ctx.closePath();

                    const gradRight = ctx.createRadialGradient(1950, 650, 20, 1950, 650, 320);
                    gradRight.addColorStop(0, '#0b355c');
                    gradRight.addColorStop(0.45, '#061c3a');
                    gradRight.addColorStop(1, '#05100c');
                    ctx.fillStyle = gradRight;
                    ctx.fill();

                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 2.0;
                    ctx.stroke();

                    ctx.clip();

                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.04)';
                    ctx.lineWidth = 1;
                    for (let gy = 480; gy < 830; gy += 3) {
                        ctx.beginPath(); ctx.moveTo(1750, gy); ctx.lineTo(2200, gy); ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.moveTo(1797, 490); ctx.lineTo(1980, 490); ctx.lineTo(1850, 750); ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.15)';
                    ctx.fillRect(1790, 495, 312, 22);
                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1790, 495, 312, 22);

                    ctx.font = 'bold 11px monospace';
                    ctx.fillStyle = '#00E5FF';
                    ctx.textAlign = 'center';
                    ctx.fillText('PERSONNEL & TRAIN TELEMETRY', 1946, 510);

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1790, 523, 320, 112);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1790, 523, 320, 112);

                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'left';
                    ctx.fillText('PERSONNEL VITAL SIGNS MONITORING:', 1796, 535);

                    const personnelList = [
                        { name: 'SPECTRE (AGENT)', status: 'ACTIVE', bpm: 72, o2: '98%', hp: '100%' },
                        { name: 'NEXUS (OPERATOR)', status: 'ONLINE', bpm: 68, o2: '99%', hp: '100%' },
                        { name: 'OVERLORD (COMMANDER)', status: 'STANDBY', bpm: 75, o2: '97%', hp: '100%' },
                    ];

                    personnelList.forEach((p, i) => {
                        const py = 544 + i * 27;
                        ctx.fillStyle = '#0a1a30'; ctx.fillRect(1814, py, 20, 20);
                        ctx.strokeStyle = '#00E5FF'; ctx.strokeRect(1814, py, 20, 20);
                        ctx.fillStyle = '#00E5FF';
                        ctx.beginPath(); ctx.arc(1824, py + 7, 3.5, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(1824, py + 18, 6, Math.PI, 0); ctx.fill();

                        ctx.font = 'bold 7.5px monospace';
                        ctx.fillStyle = '#ffffff'; ctx.fillText(p.name, 1838, py + 7);
                        ctx.fillStyle = '#00FF66'; ctx.fillText(`[${p.status}]`, 1838, py + 16);

                        ctx.fillStyle = '#38bdf8';
                        ctx.fillText(`HR: ${p.bpm} BPM | O2: ${p.o2} | VITAL: ${p.hp}`, 1930, py + 11);

                        ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 1;
                        ctx.beginPath();
                        const ecgX = 2065;
                        ctx.moveTo(ecgX, py + 9);
                        ctx.lineTo(ecgX + 8, py + 9);
                        ctx.lineTo(ecgX + 11, py + 2);
                        ctx.lineTo(ecgX + 15, py + 16);
                        ctx.lineTo(ecgX + 18, py + 9);
                        ctx.lineTo(ecgX + 30, py + 9);
                        ctx.stroke();
                    });

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1795, 642, 335, 138);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1795, 642, 335, 138);

                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'left';
                    ctx.fillText('ARMORED EXPRESS & BRIDGE LAYOUT:', 1802, 655);

                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 1.2;
                    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';

                    const trainStartX = 1802;
                    const trainY = 663;
                    for (let c = 0; c < 6; c++) {
                        const cx = trainStartX + c * 22;
                        ctx.fillRect(cx, trainY, 19, 9);
                        ctx.strokeRect(cx, trainY, 19, 9);
                    }
                    ctx.beginPath();
                    ctx.moveTo(trainStartX + 132, trainY);
                    ctx.lineTo(trainStartX + 144, trainY + 4.5);
                    ctx.lineTo(trainStartX + 132, trainY + 9);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    ctx.fillStyle = '#081220';
                    ctx.fillRect(1802, 678, 145, 45);
                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1802, 678, 145, 45);

                    ctx.fillStyle = '#00CCFF';
                    ctx.fillRect(1808, 682, 24, 7);
                    ctx.fillRect(1836, 682, 24, 7);
                    ctx.fillRect(1874, 682, 32, 7);

                    ctx.fillRect(1808, 712, 24, 7);
                    ctx.fillRect(1874, 712, 32, 7);

                    ctx.font = 'bold 6.5px monospace'; ctx.fillStyle = '#00FF66';
                    ctx.fillText('COMMAND BRIDGE (CAR 4)', 1806, 702);

                    ctx.font = 'bold 8px monospace';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('ARMORED EXPRESS SPECS:', 1955, 682);

                    ctx.font = '7.5px monospace'; ctx.fillStyle = '#38bdf8';
                    ctx.fillText('SPEED: 240 KM/H', 1955, 695);
                    ctx.fillText('STATUS: CRUISING', 1955, 707);
                    ctx.fillText('CARRIAGES: 06 UNITS', 1955, 719);
                    ctx.fillText('DEFENSE: MAX LOCKDOWN', 1955, 731);

                    ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
                    ctx.fillRect(1802, 752, 318, 18);
                    ctx.strokeStyle = '#00FF66';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1802, 752, 318, 18);
                    ctx.font = 'bold 8.5px monospace'; ctx.fillStyle = '#00FF66';
                    ctx.textAlign = 'center';
                    ctx.fillText('SYSTEM STATUS: ALL SECURE', 1961, 765);

                    ctx.restore(); // end Screen 3

                    ctx.restore(); // end 3 screens block

                    // --- 4. 左右三角房间大圆弧结构 ---
                    ctx.save();
                    ctx.strokeStyle = '#10b981';

                    // 4B. 东侧三角房间大圆弧
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.moveTo(2058, 985);
                    ctx.bezierCurveTo(2190, 1070, 2190, 1330, 1985, 1415);
                    ctx.stroke();

                    ctx.restore();

                    ctx.restore();
                
                        })(octx);
                        octx.restore();
                        window.__l7TestBlueprintCache = off;
                    }
                    ctx.drawImage(window.__l7TestBlueprintCache, P.x, P.y);
                },
            },

            // =========================================================
            // 2. 4 扇重型自动防爆装甲门 (完全实装自动感应平移门系统，窄型紧凑装甲外壳，翡翠暗绿配色)
            // =========================================================
            // 1. 西侧上门: 连接 (1110,860)-(1124,860) 与 (1132,980)-(1146,980)
            {
                type: 'heavy_auto_door',
                cx: 1128,
                cy: 920,
                topX: 1117,
                topY: 860,
                botX: 1139,
                botY: 980,
                x: 1121,
                y: 859,
                w: 14,
                h: 122,
                angle: -0.1813,
                label: 'WEST UPPER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 1110, y: 860 },
                    { x: 1124, y: 860 },
                    { x: 1146, y: 980 },
                    { x: 1132, y: 980 }
                ]
            },
            // 2. 西侧下门: 连接 (1271,1775)-(1285,1775) 与 (1292,1895)-(1306,1895)
            {
                type: 'heavy_auto_door',
                cx: 1288.5,
                cy: 1835,
                topX: 1278,
                topY: 1775,
                botX: 1299,
                botY: 1895,
                x: 1281.5,
                y: 1774,
                w: 14,
                h: 122,
                angle: -0.173,
                label: 'WEST LOWER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 1271, y: 1775 },
                    { x: 1285, y: 1775 },
                    { x: 1306, y: 1895 },
                    { x: 1292, y: 1895 }
                ]
            },
            // 3. 东侧上门: 连接 (2076,860)-(2090,860) 与 (2054,980)-(2068,980)
            {
                type: 'heavy_auto_door',
                cx: 2072,
                cy: 920,
                topX: 2083,
                topY: 860,
                botX: 2061,
                botY: 980,
                x: 2065,
                y: 859,
                w: 14,
                h: 122,
                angle: 0.1813,
                label: 'EAST UPPER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 2090, y: 860 },
                    { x: 2076, y: 860 },
                    { x: 2054, y: 980 },
                    { x: 2068, y: 980 }
                ]
            },
            // 4. 东侧下门: 连接 (1915,1775)-(1929,1775) 与 (1894,1895)-(1908,1895)
            {
                type: 'heavy_auto_door',
                cx: 1911.5,
                cy: 1835,
                topX: 1922,
                topY: 1775,
                botX: 1901,
                botY: 1895,
                x: 1904.5,
                y: 1774,
                w: 14,
                h: 122,
                angle: 0.173,
                label: 'EAST LOWER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 1929, y: 1775 },
                    { x: 1915, y: 1775 },
                    { x: 1894, y: 1895 },
                    { x: 1908, y: 1895 }
                ]
            },

            // =========================================================
            // 3. 移植自 Level 8 的全新扇形战术主控台 (置于原右圆柱 1850, 920 位置，斜 45 度朝向下方大圆台)
            //    指挥讲台 (置于原左圆柱 1350, 920 位置，镜像 45 度朝向下方大圆台，2026-11-05)
            // =========================================================
            getSectorWorkstation(1850, 920, -Math.PI * 0.75, 1.0, 'EAST SECTOR COMMAND CONSOLE'),
            getPodium(1350, 920, Math.PI * 0.75, 1.0, 'WEST COMMAND PODIUM'),
            // =========================================================
            // 4. 圆形全包围控制台 ×4 (替代 R1/R2 长方形，2026-11-04)
            // 左侧2个横排，右侧2个横排，中间过道 50px（2026-11-05 收窄，碰撞半径65）
            // 已加碰撞体积（noCollision: false）
            // =========================================================
            getCircularPodWorkstation(1370, 1548, 0, 1.0, 'L7 LEFT POD A'),
            getCircularPodWorkstation(1510, 1548, 0, 1.0, 'L7 LEFT POD B'),
            getCircularPodWorkstation(1690, 1548, 0, 1.0, 'L7 RIGHT POD A'),
            getCircularPodWorkstation(1830, 1548, 0, 1.0, 'L7 RIGHT POD B'),
            // =========================================================
            // 5. 三联方形隔间控制台 ×2 (替代 R3 长方形，2026-11-05)
            // 左右各1个横排，中间过道 60px；上移与圆形舱保持距离
            // 已加碰撞体积（noCollision: false）
            // =========================================================
            getTripleCubicleWorkstation(1430, 1675, 0, 1.0, 'L7 LEFT TRIPLE CUBICLE'),
            getTripleCubicleWorkstation(1770, 1675, 0, 1.0, 'L7 RIGHT TRIPLE CUBICLE'),
            // =========================================================
            // 6. 服务器集群 ×3 (贴各自对应墙体布置，scale 0.85)
            // =========================================================
            getServerCluster(1600, 1910.5, 0, 0.85, 'L7 SERVER CLUSTER'),
            // 两侧斜墙各一个，沿墙平行并贴墙布置
            getServerCluster(1232.57, 1203.4, 4.5393, 0.85, 'L7 LEFT SERVER'),
            getServerCluster(1967.43, 1203.4, 1.7439, 0.85, 'L7 RIGHT SERVER'),
            // 7. 斜向缓冲通道系统对象（长 560×0.7=392px，宽 122×0.75=91.5px，转角 2.4633 平行左上外墙）
            {
                id: 'buffer_corridor_1',
                type: 'buffer_corridor_system',
                cx: 968.39,
                cy: 1042.98,
                length: 392,
                width: 91.5,
                angle: 2.4633,
                floorClipLocal: [
                    { x: -220.81, y: 45.75 },
                    { x: 196, y: 45.75 },
                    { x: 196, y: -45.75 },
                    { x: -171.19, y: -45.75 }
                ],
                door1Id: 'airtight_door_1',
                door2Id: 'airtight_door_2',
                sprayTriggerDist: 52,
                sprayDuration: 180,
                direction: null,
                stage: 'idle',
                airProgress: 0,
                liquidProgress: 0,
                airStatus: 'waiting',
                liquidStatus: 'waiting',
                airSpraying: false,
                liquidSpraying: false,
                sprayState: 'idle', // 'idle' | 'air_spray' | 'liquid_spray' | 'done'
                sprayTimer: 0,
                lastApproachSide: null,
                airNozzleProps: [],
                liquidNozzleProps: [],
                noCollision: true,
                hideLabel: true,
                draw: function(ctx) {
                    drawBufferCorridorSystem(ctx, this);
                }
            },
            // 8. 缓冲通道 · 更衣区内部道具 (沿新角度 2.4633 重推，南侧洗手池/防护服架顺内斜切面微前移避开防爆门，保持净空 48.7~50.1px)
            getBufferDressingLockers(1060.11, 924.76, 2.4633 - Math.PI),
            getBufferDressingMonitor(993.82, 976.38, 2.4633 - Math.PI),
            getBufferDressingSink(1100.04, 981.65, 2.4633 - Math.PI),
            getBufferDressingSuitRack(1041.21, 1028.17, 2.4633 - Math.PI)
        ];

        // 9. 缓冲通道 · 消毒区内部静态道具 (沿新角度 2.4633 重推、横向贴 ±45.75 内壁，中间净空 53.6px)
        // 喷头指示灯与喷流直接读取各自所属通道实例的状态字段
        const bufferCorridorObj = props.find(p => p.id === 'buffer_corridor_1' || p.type === 'buffer_corridor_system');
        const getCorridorRef = () => bufferCorridorObj;
        const deconAirN = getBufferDeconAirNozzles(905.53, 1047.53, 2.4633 - Math.PI, true, getCorridorRef);
        const deconAirS = getBufferDeconAirNozzles(950.58, 1103.44, 2.4633 - Math.PI, false, getCorridorRef);
        const deconLiqN = getBufferDeconLiquidNozzles(848.3, 1093.65, 2.4633 - Math.PI, true, getCorridorRef);
        const deconLiqS = getBufferDeconLiquidNozzles(893.35, 1149.56, 2.4633 - Math.PI, false, getCorridorRef);
        if (bufferCorridorObj) {
            bufferCorridorObj.airNozzleProps = [deconAirN, deconAirS];
            bufferCorridorObj.liquidNozzleProps = [deconLiqN, deconLiqS];
        }
        props.push(
            getBufferDeconGrating(870.82, 1121.6, 2.4633 - Math.PI, getCorridorRef),
            deconAirN,
            deconAirS,
            deconLiqN,
            deconLiqS,
            // 10. 缓冲通道两扇实验室风格气密门 (门1在交界 s=196；门2在出口内侧 s=375.2，完全落在 392px 通道外墙内)
            getAirtightBlastDoor('airtight_door_1', 968.39, 1042.98, 2.4633 - Math.PI, false),
            getAirtightBlastDoor('airtight_door_2', 828.85, 1155.42, 2.4633 - Math.PI, true)
        );

        // =====================================================================
        // 11. 第二条缓冲通道 (buffer_corridor_system_2)：
        //     从西墙下门 (1288.5, 1835) 沿西墙向北延伸，与通道1全长/宽/间距保持严格一致，
        //     南端贴底部外墙内缘斜切留安全余量，北端严格落在西侧大圆弧南端 (1215, 1415) 下方
        // =====================================================================
        const c1Ref = bufferCorridorObj;
        const c1Len = (c1Ref && c1Ref.length) ? c1Ref.length : 392;
        const c1Wid = (c1Ref && c1Ref.width) ? c1Ref.width : 91.5;
        const c1HalfW = c1Wid * 0.5;
        const c1Cos = Math.cos(c1Ref ? c1Ref.angle : 2.4633);
        const c1Sin = Math.sin(c1Ref ? c1Ref.angle : 2.4633);
        const projC1S = (px, py) => ((px - c1Ref.cx) * c1Cos + (py - c1Ref.cy) * c1Sin) + c1Len * 0.5;

        const c1Door1Obj = props.find(p => p.id === (c1Ref ? c1Ref.door1Id : 'airtight_door_1'));
        const c1Door2Obj = props.find(p => p.id === (c1Ref ? c1Ref.door2Id : 'airtight_door_2'));
        const c1Door1Off = c1Door1Obj ? projC1S(c1Door1Obj.cx, c1Door1Obj.cy) : c1Len * 0.5;
        const c1Door2Off = c1Door2Obj ? projC1S(c1Door2Obj.cx, c1Door2Obj.cy) : (c1Len - 16.8);
        const c1AirOff = (c1Ref && c1Ref.airNozzleProps && c1Ref.airNozzleProps.length === 2)
            ? projC1S((c1Ref.airNozzleProps[0].cx + c1Ref.airNozzleProps[1].cx) * 0.5, (c1Ref.airNozzleProps[0].cy + c1Ref.airNozzleProps[1].cy) * 0.5)
            : (c1Door1Off + 51.8);
        const c1LiqOff = (c1Ref && c1Ref.liquidNozzleProps && c1Ref.liquidNozzleProps.length === 2)
            ? projC1S((c1Ref.liquidNozzleProps[0].cx + c1Ref.liquidNozzleProps[1].cx) * 0.5, (c1Ref.liquidNozzleProps[0].cy + c1Ref.liquidNozzleProps[1].cy) * 0.5)
            : (c1Door1Off + 125.3);

        // 沿西墙贴墙斜度向量 (WALL 2 -> DOOR 2 -> WALL 3 西侧面 (1132,980)-(1304,1960)，约偏竖直 9.95°)
        const c2WallT = 14;
        const w2x0 = 1132, w2y0 = 980, w2x1 = 1304, w2y1 = 1960;
        const w2Len = Math.hypot(w2x1 - w2x0, w2y1 - w2y0);
        const c2UxN = (w2x0 - w2x1) / w2Len; // 向北单位向量
        const c2UyN = (w2y0 - w2y1) / w2Len;
        const c2Angle = Math.atan2(c2UyN, c2UxN);
        const c2NxE = -c2UyN; // 向东 (+w, 朝向 Room 01 墙) 单位法向
        const c2NyE = c2UxN;

        // 西墙下门 WEST LOWER HEAVY AUTO DOOR 西侧开口中心 (1281.5, 1835)
        const c2DwCx = 1281.5 - (c2WallT + c1HalfW) * c2NxE;
        const c2DwCy = 1835 - (c2WallT + c1HalfW) * c2NyE;

        // 西眼左下外墙内缘 (154.4, 1193.3)-(1308.4, 1953.3)：贴底部墙并留 5px 净间隙，绝不压线戳出
        const eyeBot0 = { x: 1308.4, y: 1953.3 };
        const eyeBot1 = { x: 154.4, y: 1193.3 };
        const eyeBotLen = Math.hypot(eyeBot1.x - eyeBot0.x, eyeBot1.y - eyeBot0.y);
        const eyeEuX = (eyeBot1.x - eyeBot0.x) / eyeBotLen;
        const eyeEuY = (eyeBot1.y - eyeBot0.y) / eyeBotLen;
        const eyeInNx = -eyeEuY, eyeInNy = eyeEuX; // 指向观测区内部法向
        const c2SlopeIn = c2UxN * eyeInNx + c2UyN * eyeInNy;
        const c2SRelAtBottomMargin = (w, margin) => {
            const px = c2DwCx + w * c2NxE;
            const py = c2DwCy + w * c2NyE;
            const d0 = (px - eyeBot0.x) * eyeInNx + (py - eyeBot0.y) * eyeInNy;
            return (margin - d0) / c2SlopeIn;
        };

        const c2OuterGap = 5.0; // 通道南端外墙外皮距底部边界内缘保留 5px 安全余量
        const c2FloorMargin = c2OuterGap + c2WallT;
        const c2SouthExt = -c2SRelAtBottomMargin(c1HalfW, c2FloorMargin); // 东侧内缘最南锚点距门洞中心约 76.15px
        const c2TotalLen = +(c2SouthExt + c1Len).toFixed(2);
        const c2HalfL = c2TotalLen * 0.5;
        const c2SRelFloorW = c2SRelAtBottomMargin(-c1HalfW, c2FloorMargin);
        const c2SRelWallSE = c2SRelAtBottomMargin(c1HalfW + c2WallT, c2OuterGap);
        const c2SRelWallSW = c2SRelAtBottomMargin(-c1HalfW - c2WallT, c2OuterGap);
        const c2SFloorW = +(c2SouthExt + c2SRelFloorW).toFixed(2);
        const c2SWallSE = +(c2SouthExt + c2SRelWallSE).toFixed(2);
        const c2SWallSW = +(c2SouthExt + c2SRelWallSW).toFixed(2);

        const c2WorldPt = (s, w) => ({
            x: +(c2DwCx + (s - c2SouthExt) * c2UxN + w * c2NxE).toFixed(2),
            y: +(c2DwCy + (s - c2SouthExt) * c2UyN + w * c2NyE).toFixed(2)
        });
        const c2Center = c2WorldPt(c2HalfL, 0);
        const c2LocalX = (s) => +(s - c2HalfL).toFixed(2);

        const c2SDoorway = c2SouthExt;
        const c2DoorwaySpanHalf = 60.9; // 对应 y: 1775 ~ 1895 (120px 净门洞)
        const c2SDoor3 = +(c2SDoorway + c1Door1Off).toFixed(2);
        const c2SAir = +(c2SDoorway + c1AirOff).toFixed(2);
        const c2SLiq = +(c2SDoorway + c1LiqOff).toFixed(2);
        const c2SDoor4 = +(c2SDoorway + c1Door2Off).toFixed(2);

        // 通道2银白重装甲外墙 (西侧连续墙、东侧门洞北段/南段留口、南端平行斜切封口墙，严格不碰共用墙)
        obstacles.push(
            {
                type: 'poly_wall',
                isBufferCorridorWall: true,
                points: [
                    c2WorldPt(c2SWallSW, -c1HalfW - c2WallT),
                    c2WorldPt(c2SFloorW, -c1HalfW),
                    c2WorldPt(c2TotalLen, -c1HalfW),
                    c2WorldPt(c2TotalLen, -c1HalfW - c2WallT)
                ],
                label: 'BUFFER CORRIDOR 2 WEST ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                isBufferCorridorWall: true,
                points: [
                    c2WorldPt(c2SDoorway + c2DoorwaySpanHalf, c1HalfW),
                    c2WorldPt(c2SDoorway + c2DoorwaySpanHalf, c1HalfW + c2WallT),
                    c2WorldPt(c2TotalLen, c1HalfW + c2WallT),
                    c2WorldPt(c2TotalLen, c1HalfW)
                ],
                label: 'BUFFER CORRIDOR 2 EAST NORTH ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                isBufferCorridorWall: true,
                points: [
                    c2WorldPt(0, c1HalfW),
                    c2WorldPt(c2SWallSE, c1HalfW + c2WallT),
                    c2WorldPt(c2SDoorway - c2DoorwaySpanHalf, c1HalfW + c2WallT),
                    c2WorldPt(c2SDoorway - c2DoorwaySpanHalf, c1HalfW)
                ],
                label: 'BUFFER CORRIDOR 2 EAST SOUTH ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                isBufferCorridorWall: true,
                points: [
                    c2WorldPt(c2SWallSW, -c1HalfW - c2WallT),
                    c2WorldPt(c2SWallSE, c1HalfW + c2WallT),
                    c2WorldPt(0, c1HalfW),
                    c2WorldPt(c2SFloorW, -c1HalfW)
                ],
                label: 'BUFFER CORRIDOR 2 SOUTH BEVEL ARMORED WALL',
                hideLabel: true
            }
        );

        // 通道2两扇气密门南北门垛刚体碰撞 (留 63px 净门洞，draw 为空避免遮盖门兜与识别终端)
        [
            { name: 'DOOR 3', pt: c2WorldPt(c2SDoor3, 0) },
            { name: 'DOOR 4', pt: c2WorldPt(c2SDoor4, 0) }
        ].forEach(d => {
            const ca = Math.cos(c2Angle), sa = Math.sin(c2Angle);
            const makeJamb2 = (y1, y2, tag) => ({
                type: 'poly_wall',
                points: [
                    { x: -6, y: y1 },
                    { x: 6, y: y1 },
                    { x: 6, y: y2 },
                    { x: -6, y: y2 }
                ].map(pt => ({
                    x: +(d.pt.x + pt.x * ca - pt.y * sa).toFixed(1),
                    y: +(d.pt.y + pt.x * sa + pt.y * ca).toFixed(1)
                })),
                label: `BUFFER ${d.name} ${tag} BULKHEAD JAMB`,
                hideLabel: true,
                draw: () => {}
            });
            obstacles.push(makeJamb2(-46, -31.5, 'WEST'), makeJamb2(31.5, 46, 'EAST'));
        });

        // 第二条缓冲通道系统对象 (s 从南端 0 起算；状态完全挂于自身实例，与通道1互不串线)
        const c2FloorClipLocal = [
            { x: c2LocalX(0), y: c1HalfW },
            { x: c2LocalX(c2TotalLen), y: c1HalfW },
            { x: c2LocalX(c2TotalLen), y: -c1HalfW },
            { x: c2LocalX(c2SFloorW), y: -c1HalfW }
        ];
        const c2DoorwayThresholdLocal = {
            x: c2LocalX(c2SDoorway - c2DoorwaySpanHalf),
            y: c1HalfW,
            w: +(c2DoorwaySpanHalf * 2).toFixed(2),
            h: c2WallT
        };
        const c2FloorWorld = [
            c2WorldPt(0, c1HalfW),
            c2WorldPt(c2TotalLen, c1HalfW),
            c2WorldPt(c2TotalLen, -c1HalfW),
            c2WorldPt(c2SFloorW, -c1HalfW)
        ];
        const c2DeconWorld = [
            c2WorldPt(c2SDoor3, c1HalfW),
            c2WorldPt(c2TotalLen, c1HalfW),
            c2WorldPt(c2TotalLen, -c1HalfW),
            c2WorldPt(c2SDoor3, -c1HalfW)
        ];
        const c2DividerWorld = [
            c2WorldPt(c2SDoor3, -c1HalfW),
            c2WorldPt(c2SDoor3, c1HalfW)
        ];
        const c2ThresholdWorld = [
            c2WorldPt(c2SDoorway - c2DoorwaySpanHalf, c1HalfW),
            c2WorldPt(c2SDoorway + c2DoorwaySpanHalf, c1HalfW),
            c2WorldPt(c2SDoorway + c2DoorwaySpanHalf, c1HalfW + c2WallT),
            c2WorldPt(c2SDoorway - c2DoorwaySpanHalf, c1HalfW + c2WallT)
        ];

        const bufferCorridor2Obj = {
            id: 'buffer_corridor_system_2',
            type: 'buffer_corridor_system',
            cx: c2Center.x,
            cy: c2Center.y,
            length: c2TotalLen,
            width: c1Wid,
            angle: +c2Angle.toFixed(6),
            deconSplitS: c2SDoor3,
            floorClipLocal: c2FloorClipLocal,
            doorwayThresholdLocal: c2DoorwayThresholdLocal,
            floorWorldPoly: c2FloorWorld,
            deconWorldPoly: c2DeconWorld,
            dividerWorldPts: c2DividerWorld,
            thresholdWorldPoly: c2ThresholdWorld,
            door1Id: 'airtight_door_3',
            door2Id: 'airtight_door_4',
            sprayTriggerDist: c1Ref ? c1Ref.sprayTriggerDist : 52,
            sprayDuration: c1Ref ? c1Ref.sprayDuration : 180,
            direction: null,
            stage: 'idle',
            airProgress: 0,
            liquidProgress: 0,
            airStatus: 'waiting',
            liquidStatus: 'waiting',
            airSpraying: false,
            liquidSpraying: false,
            sprayState: 'idle',
            sprayTimer: 0,
            lastApproachSide: null,
            airNozzleProps: [],
            liquidNozzleProps: [],
            noCollision: true,
            hideLabel: true,
            draw: function(ctx) {
                drawBufferCorridorSystem(ctx, this);
            }
        };

        const getCorridor2Ref = () => bufferCorridor2Obj;
        const c2AirNPos = c2WorldPt(c2SAir, -35.9); // 西侧气流喷嘴组 (朝东喷向通道中线)
        const c2AirSPos = c2WorldPt(c2SAir, 35.9);  // 东侧气流喷嘴组 (朝西喷向通道中线)
        const c2LiqNPos = c2WorldPt(c2SLiq, -35.9); // 西侧消毒液喷头组
        const c2LiqSPos = c2WorldPt(c2SLiq, 35.9);  // 东侧消毒液喷头组
        const c2GratePos = c2WorldPt(c2SLiq, 0);

        const c2DeconAirN = getBufferDeconAirNozzles(c2AirNPos.x, c2AirNPos.y, c2Angle, true, getCorridor2Ref);
        const c2DeconAirS = getBufferDeconAirNozzles(c2AirSPos.x, c2AirSPos.y, c2Angle, false, getCorridor2Ref);
        const c2DeconLiqN = getBufferDeconLiquidNozzles(c2LiqNPos.x, c2LiqNPos.y, c2Angle, true, getCorridor2Ref);
        const c2DeconLiqS = getBufferDeconLiquidNozzles(c2LiqSPos.x, c2LiqSPos.y, c2Angle, false, getCorridor2Ref);
        bufferCorridor2Obj.airNozzleProps = [c2DeconAirN, c2DeconAirS];
        bufferCorridor2Obj.liquidNozzleProps = [c2DeconLiqN, c2DeconLiqS];

        // 通道2更衣区道具 (贴两侧内壁布置并朝向通道中线，留足 48.7~50.1px 中央通路与门洞通行净空)
        const c2LockersS = +(c2SFloorW + 2.5 + 39.2).toFixed(2);
        const c2SuitRackS = +(c2LockersS + 39.2 + 1.5 + 43.4).toFixed(2);
        const c2DoorwayTopS = c2SDoorway + c2DoorwaySpanHalf;
        const c2SinkS = +(c2DoorwayTopS + 0.8 + 28.7).toFixed(2);
        const c2MonitorS = +(c2SDoor3 - 12.7 - 0.5 - 31.0).toFixed(2);

        const c2LockersPos = c2WorldPt(c2LockersS, -34.5);
        const c2SuitRackPos = c2WorldPt(c2SuitRackS, -34.16);
        const c2SinkPos = c2WorldPt(c2SinkS, 34.85);
        const c2MonitorPos = c2WorldPt(c2MonitorS, 35.9);
        const c2Door3Pos = c2WorldPt(c2SDoor3, 0);
        const c2Door4Pos = c2WorldPt(c2SDoor4, 0);

        props.push(
            bufferCorridor2Obj,
            getBufferDressingLockers(c2LockersPos.x, c2LockersPos.y, c2Angle),
            getBufferDressingSuitRack(c2SuitRackPos.x, c2SuitRackPos.y, c2Angle + Math.PI),
            getBufferDressingSink(c2SinkPos.x, c2SinkPos.y, c2Angle),
            getBufferDressingMonitor(c2MonitorPos.x, c2MonitorPos.y, c2Angle + Math.PI),
            getBufferDeconGrating(c2GratePos.x, c2GratePos.y, c2Angle, getCorridor2Ref),
            c2DeconAirN,
            c2DeconAirS,
            c2DeconLiqN,
            c2DeconLiqS,
            getAirtightBlastDoor('airtight_door_3', c2Door3Pos.x, c2Door3Pos.y, c2Angle, false),
            getAirtightBlastDoor('airtight_door_4', c2Door4Pos.x, c2Door4Pos.y, c2Angle, true),
            // 12. 西侧三角房无碰撞地面盘管 (直径 24，随解剖组移至 703.3, 987.4)
            getWestCoiledHoseProp(703.3, 987.4)
        );

        // =====================================================================
        // 3. 区域与房间定义 (Zones)
        // =====================================================================
        const zones = [
            {
                id: 'apex_chamber_1',
                name: '中央指挥大厅 (Room 01)',
                x: 1055,
                y: 830,
                w: 1090,
                h: 1130
            },
            {
                id: 'apex_chamber_west',
                name: '西侧观测区 (West Sector)',
                x: 150,
                y: 490,
                w: 905,
                h: 1470
            },
            {
                id: 'apex_chamber_east',
                name: '东侧科研区 (East Sector)',
                x: 2145,
                y: 490,
                w: 905,
                h: 1470
            }
        ];

        // =====================================================================
        // 4. 寻路与视野导航路点
        // =====================================================================
        const waypoints = [
            { x: 1600, y: 1835 },
            { x: 1600, y: 1645 },
            { x: 1600, y: 1545 },
            { x: 1600, y: 1435 },
            { x: 1300, y: 1200 },
            { x: 1900, y: 1200 },
            { x: 1600, y: 980 },
            { x: 1600, y: 800 },
            { x: 1350, y: 840 },
            { x: 1850, y: 840 },
            { x: 1125, y: 920 },
            { x: 2075, y: 920 },
            { x: 1295, y: 1835 },
            { x: 1905, y: 1835 },
            { x: 950, y: 920 },
            { x: 950, y: 1835 },
            { x: 1145, y: 1420 },
            { x: 805, y: 1200 },
            { x: 665, y: 1200 },
            { x: 530, y: 1200 },
            { x: 300, y: 1200 },
            { x: 2250, y: 920 },
            { x: 2250, y: 1835 },
            { x: 2395, y: 1200 },
            { x: 2535, y: 1200 },
            { x: 2670, y: 1200 },
            { x: 2900, y: 1200 }
        ];

        return {
            obstacles,
            props,
            zones,
            waypoints,
            cameras: [],
            lasers: [],
            securityGates: []
        };
    }
};

window.LEVEL_7_TEST = LEVEL_7_TEST;
