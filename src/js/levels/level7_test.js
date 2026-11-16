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
// Level 8 缓冲区 · 更衣区专用精密道具绘制系统 (2026-11-15)
// 严格遵循 drawTripleCubicleWorkstation 锚点分层画法：
// - 阴影 -> 底座/主体 -> 倒角高光 -> 反光与磨损，逐层分离
// - 描边主用 0.4–1.0；>1.5 仅作深色结构打底且必叠 0.7–0.8 倒角高光；严禁 >=2.0 轮廓线
// - 调色盘严格深灰绿/深灰/木色系低饱和，点缀仅翡翠绿 #10b981 与单一警示色 #f59e0b
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
            const cacheKey = cachePrefix + '_ss4_' + cx.toFixed(1) + '_' + cy.toFixed(1) + '_' + angle.toFixed(4);
            if (!window[cacheKey]) {
                const SS = 4; // 4 倍超采样离屏缓存，确保视角缩放与高分屏下线条/字体极致锐利
                const sz = Math.ceil(Math.hypot(w + 26, h + 26) + 16);
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
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2, c.size, c.size);
            ctx.restore();
            if (drawDynamic) {
                drawDynamic(ctx, cx, cy, angle);
            }
        }
    };
}

// -------------------------------------------------------------------------
// 1. 缓冲区更衣区：4 门重型密闭更衣储物柜 (112x30，靠北墙、柜门+踏台清晰朝南面向通道中央)
// -------------------------------------------------------------------------
function drawBufferDressingLockersStatic(ctx, cx, cy, angle) {
    const W = 112;
    const H = 30;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [层1] 地面强环境遮蔽投影 + 前部(南侧朝通道)木塑换鞋踏台
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.fillRect(-halfW - 2.0, -halfH + 1.5, W + 4.5, H + 3.5);

    // 底部防滑换鞋木塑踏台 (位于 +y 南侧朝向通道中央，提亮胡桃木纹理便于辨识)
    const stepGrad = ctx.createLinearGradient(0, halfH - 3.6, 0, halfH + 2.0);
    stepGrad.addColorStop(0, '#6e5034');
    stepGrad.addColorStop(0.5, '#594028');
    stepGrad.addColorStop(1, '#3d2b1b');
    ctx.fillStyle = stepGrad;
    ctx.fillRect(-halfW + 1, halfH - 3.6, W - 2, 5.4);
    ctx.strokeStyle = '#9c754d';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-halfW + 1, halfH - 3.6, W - 2, 5.4);
    ctx.strokeStyle = 'rgba(226, 198, 164, 0.50)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-halfW + 2, halfH + 1.1);
    ctx.lineTo(halfW - 2, halfH + 1.1);
    ctx.stroke();

    // [层2] 柜体钢制主体外壳 (显著提升明度阶差，清晰脱离深色地坪)
    const bodyGrad = ctx.createLinearGradient(0, -halfH, 0, halfH - 2);
    bodyGrad.addColorStop(0, '#233832');
    bodyGrad.addColorStop(0.45, '#35544b');
    bodyGrad.addColorStop(1, '#1d2f2a');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-halfW, -halfH, W, H - 2.2);

    // 深色结构打底边 + 0.9 翡翠倒角高光叠层
    ctx.strokeStyle = '#030907';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW, -halfH, W, H - 2.2);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(-halfW, -halfH, W, H - 2.2);

    // 北侧靠墙顶部收窄檐板 (6.2px，让出足够正立面给朝向通道的4扇柜门)
    const topGrad = ctx.createLinearGradient(0, -halfH + 1.0, 0, -halfH + 7.2);
    topGrad.addColorStop(0, '#2a423b');
    topGrad.addColorStop(1, '#3b5b52');
    ctx.fillStyle = topGrad;
    ctx.fillRect(-halfW + 1.2, -halfH + 1.0, W - 2.4, 6.2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-halfW + 1.2, -halfH + 1.0, W - 2.4, 6.2);

    // 柜顶四角加强角码与六角螺栓
    [[-halfW + 3.0, -halfH + 2.6], [halfW - 3.0, -halfH + 2.6], [-halfW + 3.0, -halfH + 5.6], [halfW - 3.0, -halfH + 5.6]].forEach(([bx, by]) => {
        ctx.fillStyle = '#47665c';
        ctx.fillRect(bx - 1.5, by - 1.0, 3.0, 2.0);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(bx, by, 0.55, 0, Math.PI * 2); ctx.fill();
    });

    // 柜顶双排防尘排风过滤格栅
    [-28, 28].forEach(vx => {
        ctx.fillStyle = '#0a1411';
        ctx.fillRect(vx - 12, -halfH + 2.0, 24, 4.2);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(vx - 12, -halfH + 2.0, 24, 4.2);
        for (let sx = vx - 9.5; sx <= vx + 9.5; sx += 2.7) {
            ctx.beginPath();
            ctx.moveTo(sx, -halfH + 2.4);
            ctx.lineTo(sx, -halfH + 5.8);
            ctx.strokeStyle = '#4f6d63';
            ctx.lineWidth = 0.75;
            ctx.stroke();
        }
    });

    // [独立隔间] 4 扇高大清晰柜门 (朝南 +y 面向通道中央)：百叶通风槽、密码锁、编号牌、拉手、合页销
    const bayW = 26.2;
    const startX = -halfW + 2.4;
    const doorY = -halfH + 8.0;
    const doorH = 18.8;

    for (let i = 0; i < 4; i++) {
        const dx = startX + i * 27.0;

        if (i > 0) {
            ctx.fillStyle = '#09120f';
            ctx.fillRect(dx - 0.9, -halfH + 1.0, 1.0, H - 3.2);
        }

        // 柜门主面 (提亮低饱和灰绿金属，清晰呈现门扇)
        const dGrad = ctx.createLinearGradient(dx, doorY, dx, doorY + doorH);
        dGrad.addColorStop(0, '#3e5e54');
        dGrad.addColorStop(0.55, '#314c44');
        dGrad.addColorStop(1, '#233731');
        ctx.fillStyle = dGrad;
        ctx.fillRect(dx, doorY, bayW, doorH);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(dx, doorY, bayW, doorH);

        // 左上亮倒角高光
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.55)';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(dx + 0.5, doorY + doorH - 0.7);
        ctx.lineTo(dx + 0.5, doorY + 0.5);
        ctx.lineTo(dx + bayW - 0.7, doorY + 0.5);
        ctx.stroke();

        // 1) 百叶通风槽 (5道深槽 + 清晰银灰百叶唇边)
        for (let l = 0; l < 5; l++) {
            const ly = doorY + 2.5 + l * 2.8;
            ctx.fillStyle = '#050c0a';
            ctx.fillRect(dx + 2.2, ly, 8.8, 1.4);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(dx + 2.2, ly + 1.5);
            ctx.lineTo(dx + 11.0, ly + 1.5);
            ctx.stroke();
        }

        // 2) 蚀刻金属编号牌 (L-01 .. L-04)
        ctx.fillStyle = '#071c16';
        ctx.fillRect(dx + 12.0, doorY + 2.0, 9.6, 5.2);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(dx + 12.0, doorY + 2.0, 9.6, 5.2);
        ctx.font = 'bold 3.4px monospace';
        ctx.fillStyle = '#d1fae5';
        ctx.textAlign = 'center';
        ctx.fillText(`L-0${i + 1}`, dx + 16.8, doorY + 5.8);

        // 3) 电子密码锁面板 + 按键微点阵
        ctx.fillStyle = '#0e1b1d';
        ctx.fillRect(dx + 12.0, doorY + 8.6, 9.6, 6.2);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(dx + 12.0, doorY + 8.6, 9.6, 6.2);
        for (let kr = 0; kr < 2; kr++) {
            for (let kc = 0; kc < 3; kc++) {
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(dx + 12.9 + kc * 1.85, doorY + 9.8 + kr * 2.1, 1.25, 1.25);
            }
        }
        // 静态锁灯座
        ctx.fillStyle = (i === 2) ? '#f59e0b' : '#10b981';
        ctx.fillRect(dx + 19.2, doorY + 10.6, 1.7, 2.2);

        // 4) 嵌入式竖向拉手槽 + 亮银拉手杆
        ctx.fillStyle = '#060c0a';
        ctx.fillRect(dx + 22.4, doorY + 3.6, 2.7, 11.2);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(dx + 22.4, doorY + 3.6, 2.7, 11.2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(dx + 23.3, doorY + 4.8, 0.9, 8.8);

        // 5) 左侧双合页销钉
        [doorY + 3.2, doorY + doorH - 4.6].forEach(hy => {
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(dx - 0.3, hy, 1.3, 2.2);
        });

        // 6) 门扇底部朝向通道的前沿金属护口条
        ctx.fillStyle = '#10b981';
        ctx.fillRect(dx + 1.0, doorY + doorH - 1.1, bayW - 2.0, 0.8);
    }

    // [层3 & 层4] 顶部斜向金属拉丝反光 + 边缘磨损划痕
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(-halfW + 12, -halfH + 1.0);
    ctx.lineTo(-halfW + 36, -halfH + 1.0);
    ctx.lineTo(-halfW + 18, halfH - 2.4);
    ctx.lineTo(-halfW - 6, halfH - 2.4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.30)';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-22, -halfH + 7.4); ctx.lineTo(-14, -halfH + 7.7);
    ctx.moveTo(31, doorY + 17.5); ctx.lineTo(40, doorY + 17.7);
    ctx.stroke();

    ctx.restore();
}

function drawBufferDressingLockersDynamic(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const startX = -56 + 2.4;
    const doorY = -15 + 8.0;
    for (let i = 0; i < 4; i++) {
        const dx = startX + i * 27.0;
        const pulse = Math.sin(time * 2.2 + i * 1.7) > 0;
        ctx.fillStyle = (i === 2) ? (pulse ? '#f59e0b' : '#78350f') : (pulse ? '#34d399' : '#064e3b');
        ctx.fillRect(dx + 19.2, doorY + 10.6, 1.7, 2.2);
    }
    ctx.restore();
}

function getBufferDressingLockers(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 112, 30, false,
        'buffer_dressing_lockers',
        'BUFFER DRESSING LOCKERS',
        'SEALED DRESSING LOCKERS',
        drawBufferDressingLockersStatic,
        drawBufferDressingLockersDynamic,
        '__bufLockersCache'
    );
}

// -------------------------------------------------------------------------
// 2. 缓冲区更衣区：综合环境监控屏幕（92x26，靠北墙朝南面向通道，高清晰多面板等宽数据）
// -------------------------------------------------------------------------
function drawBufferDressingMonitorStatic(ctx, cx, cy, angle) {
    const W = 92;
    const H = 26;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [层1] 强地面与墙体投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.fillRect(-halfW + 1.5, -halfH + 2.5, W + 1.5, H);

    // [层2] 北侧墙面安装背板 + 锚栓 + 双悬臂支架
    ctx.fillStyle = '#293a3f';
    ctx.fillRect(-30, -halfH, 60, 4.0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-30, -halfH, 60, 4.0);
    [-26, -16, 16, 26].forEach(bx => {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.arc(bx, -halfH + 2.0, 0.9, 0, Math.PI * 2); ctx.fill();
    });

    [-18, 18].forEach(ax => {
        ctx.fillStyle = '#33484e';
        ctx.fillRect(ax - 3.0, -halfH + 3.2, 6.0, 3.6);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(ax - 3.0, -halfH + 3.2, 6.0, 3.6);
    });

    // 装甲信号导管
    ctx.strokeStyle = '#050b0c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -halfH + 2.2);
    ctx.lineTo(0, -halfH + 5.8);
    ctx.stroke();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(-0.3, -halfH + 2.2);
    ctx.lineTo(-0.3, -halfH + 5.8);
    ctx.stroke();

    // 监控屏主外壳 (90 x 21.5，提亮枪灰金属壳体)
    const boxX = -45;
    const boxY = -halfH + 4.2;
    const boxW = 90;
    const boxH = 21.5;
    const frameGrad = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
    frameGrad.addColorStop(0, '#3d5259');
    frameGrad.addColorStop(0.5, '#2b3b40');
    frameGrad.addColorStop(1, '#1d292d');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // 深色打底 + 0.95 翡翠倒角边框
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.95;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // 四角防撞护角件
    [[boxX, boxY], [boxX + boxW - 4.5, boxY], [boxX, boxY + boxH - 3.2], [boxX + boxW - 4.5, boxY + boxH - 3.2]].forEach(([cxp, cyp]) => {
        ctx.fillStyle = '#475f66';
        ctx.fillRect(cxp, cyp, 4.5, 3.2);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cxp, cyp, 4.5, 3.2);
    });

    // 底部(朝通道侧)控制条：实体按键排 + 散热栅
    for (let b = 0; b < 4; b++) {
        ctx.fillStyle = (b === 3) ? '#f59e0b' : '#10b981';
        ctx.fillRect(boxX + 62 + b * 4.0, boxY + boxH - 2.4, 2.8, 1.4);
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(boxX + 62 + b * 4.0, boxY + boxH - 2.4, 2.8, 1.4);
    }
    for (let vx = boxX + 8; vx <= boxX + 34; vx += 2.6) {
        ctx.fillStyle = '#0a1416';
        ctx.fillRect(vx, boxY + boxH - 2.2, 1.5, 1.2);
    }

    // 主显示玻璃凹槽 (84 x 16.9，高对比墨绿发光面板，文字亮晰易读)
    const scrX = boxX + 3.0;
    const scrY = boxY + 1.5;
    const scrW = boxW - 6.0;
    const scrH = boxH - 4.6;

    const scrGrad = ctx.createLinearGradient(scrX, scrY, scrX + scrW, scrY + scrH);
    scrGrad.addColorStop(0, '#05241b');
    scrGrad.addColorStop(0.55, '#0a3a2c');
    scrGrad.addColorStop(1, '#041c15');
    ctx.fillStyle = scrGrad;
    ctx.fillRect(scrX, scrY, scrW, scrH);

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(scrX, scrY, scrW, scrH);

    // 裁剪屏幕区域绘制清晰多面板小字号等宽数据
    ctx.save();
    ctx.beginPath();
    ctx.rect(scrX, scrY, scrW, scrH);
    ctx.clip();

    // 细密扫描线
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
    ctx.lineWidth = 0.4;
    for (let sy = scrY + 1.5; sy < scrY + scrH; sy += 2.0) {
        ctx.beginPath();
        ctx.moveTo(scrX, sy);
        ctx.lineTo(scrX + scrW, sy);
        ctx.stroke();
    }

    // 面板分隔框线
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.60)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(scrX, scrY + 4.0);
    ctx.lineTo(scrX + scrW, scrY + 4.0);
    ctx.moveTo(scrX + 29.0, scrY + 4.0);
    ctx.lineTo(scrX + 29.0, scrY + scrH);
    ctx.moveTo(scrX + 57.5, scrY + 4.0);
    ctx.lineTo(scrX + 57.5, scrY + scrH);
    ctx.stroke();

    // 顶栏标题
    ctx.font = 'bold 2.8px monospace';
    ctx.fillStyle = '#d1fae5';
    ctx.textAlign = 'left';
    ctx.fillText('BUF-ENV // PRESS & TEMP', scrX + 1.8, scrY + 3.0);
    ctx.fillStyle = '#6ee7b7';
    ctx.textAlign = 'right';
    ctx.fillText('NOMINAL', scrX + scrW - 4.8, scrY + 3.0);

    // 左面板：整个缓冲区气压数据 (PRESSURE)
    ctx.textAlign = 'left';
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('PRESS [Pa]', scrX + 1.5, scrY + 6.9);
    ctx.font = '2.45px monospace';
    ctx.fillStyle = '#ecfdf5';
    ctx.fillText('DRS:+18.4', scrX + 1.5, scrY + 10.2);
    ctx.fillText('DCN:+04.1', scrX + 1.5, scrY + 13.4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('dP:+14.3', scrX + 1.5, scrY + 15.8);
    for (let b = 0; b < 4; b++) {
        ctx.fillStyle = (b === 3) ? '#f59e0b' : '#34d399';
        ctx.fillRect(scrX + 19.0 + b * 2.3, scrY + 15.2 - (3.2 + b * 1.4), 1.6, 3.2 + b * 1.4);
    }

    // 中面板：缓冲区温度/湿度数据 (TEMP & RH)
    const midX = scrX + 30.4;
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('TEMP [C]', midX, scrY + 6.9);
    ctx.font = '2.45px monospace';
    ctx.fillStyle = '#ecfdf5';
    ctx.fillText('Z1:21.4C', midX, scrY + 10.2);
    ctx.fillText('Z2:23.8C', midX, scrY + 13.4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('RH:44%', midX, scrY + 15.8);

    // 右面板：供氧与气密状态 (O2 / SEAL)
    const rgtX = scrX + 59.0;
    ctx.font = 'bold 2.5px monospace';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('O2 / SEAL', rgtX, scrY + 6.9);
    ctx.font = '2.45px monospace';
    ctx.fillStyle = '#ecfdf5';
    ctx.fillText('O2:21.0%', rgtX, scrY + 10.2);
    ctx.fillText('MAN:4.2b', rgtX, scrY + 13.4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('G1:STBY', rgtX, scrY + 15.8);

    // [层3 & 层4] 玻璃斜向微反光带
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(scrX + 5, scrY);
    ctx.lineTo(scrX + 16, scrY);
    ctx.lineTo(scrX + 6, scrY + scrH);
    ctx.lineTo(scrX - 5, scrY + scrH);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 外壳顶部倒角高光
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(boxX + 4.5, boxY + 0.5);
    ctx.lineTo(boxX + boxW - 4.5, boxY + 0.5);
    ctx.stroke();

    ctx.restore();
}

function drawBufferDressingMonitorDynamic(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const scrX = -45 + 3.0;
    const scrY = -13 + 4.2 + 1.5;
    const scrW = 90 - 6.0;

    // 顶栏实时脉冲灯
    const blink = Math.sin(time * 3.5) > 0;
    ctx.fillStyle = blink ? '#34d399' : '#064e3b';
    ctx.fillRect(scrX + scrW - 3.4, scrY + 1.2, 1.8, 1.8);

    // 中面板微型温度趋势动态波形
    const waveX = scrX + 45.2;
    const waveY = scrY + 11.4;
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let wx = 0; wx <= 10.5; wx += 1.5) {
        const wy = Math.sin(time * 3.2 + wx * 0.7) * 1.6;
        if (wx === 0) ctx.moveTo(waveX + wx, waveY + wy);
        else ctx.lineTo(waveX + wx, waveY + wy);
    }
    ctx.stroke();

    ctx.restore();
}

function getBufferDressingMonitor(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 92, 26, true,
        'buffer_dressing_monitor',
        'BUFFER ENV TELEMETRY MONITOR',
        'BUFFER PRESSURE & TEMP MONITOR',
        drawBufferDressingMonitorStatic,
        drawBufferDressingMonitorDynamic,
        '__bufMonitorCache'
    );
}

// -------------------------------------------------------------------------
// 3. 缓冲区更衣区：工业防污染双联洗手池台 (82x29，靠南墙、池面与操作沿清晰朝北面向通道中央)
// -------------------------------------------------------------------------
function drawBufferDressingSinkStatic(ctx, cx, cy, angle) {
    const W = 82;
    const H = 29;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [层1] 强地面投影与北侧(朝向通道中央)防滑沥水橡胶垫
    ctx.fillStyle = 'rgba(0, 0, 0, 0.68)';
    ctx.fillRect(-halfW - 2.0, -halfH - 2.0, W + 4.0, H + 3.0);

    ctx.fillStyle = '#1b2b27';
    ctx.fillRect(-halfW + 3, -halfH - 3.4, W - 6, 4.2);
    ctx.strokeStyle = '#475f57';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-halfW + 3, -halfH - 3.4, W - 6, 4.2);
    for (let mx = -halfW + 6; mx <= halfW - 6; mx += 4.0) {
        ctx.beginPath();
        ctx.moveTo(mx, -halfH - 2.8);
        ctx.lineTo(mx, -halfH + 0.2);
        ctx.strokeStyle = '#334740';
        ctx.lineWidth = 0.65;
        ctx.stroke();
    }

    // [层2] 左侧进排水铜/暗钢截止阀接头 (靠近南侧墙管路)
    ctx.fillStyle = '#5c432b';
    ctx.fillRect(-halfW - 2.6, 4.5, 3.0, 5.2);
    ctx.strokeStyle = '#9c754d';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-halfW - 2.6, 4.5, 3.0, 5.2);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW - 2.1, 6.4, 1.8, 1.2);

    // 主台面主体 (大幅提亮拉丝不锈钢阶调，呈现明晰的金属质感)
    const deckGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    deckGrad.addColorStop(0, '#445c65');
    deckGrad.addColorStop(0.5, '#55727c');
    deckGrad.addColorStop(1, '#31444b');
    ctx.fillStyle = deckGrad;
    ctx.fillRect(-halfW, -halfH, W, H);

    // 深色打底 + 0.9 翡翠倒角高光
    ctx.strokeStyle = '#04090a';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(-halfW, -halfH, W, H);

    // 南侧(+y 靠南墙)加厚防溅后挡板 + 固定螺栓
    ctx.fillStyle = '#253439';
    ctx.fillRect(-halfW + 0.8, halfH - 5.6, W - 1.6, 5.0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-halfW + 0.8, halfH - 5.6, W - 1.6, 5.0);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-halfW + 1.5, halfH - 5.2);
    ctx.lineTo(halfW - 1.5, halfH - 5.2);
    ctx.stroke();

    // 北侧(-y 朝向通道中央)前沿木塑防撞护边条 + 亮银前沿导水沿
    ctx.fillStyle = '#694b31';
    ctx.fillRect(-halfW + 1, -halfH, W - 2, 2.4);
    ctx.strokeStyle = '#9c754d';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 1, -halfH, W - 2, 2.4);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-halfW + 2, -halfH + 2.4, W - 4, 0.7);

    // 双深槽洗池盆腔 + 滤网排水口 + 鹅颈感应水龙头(底座在南侧后挡板，弯管朝北-y探入池心)
    [-16.0, 16.0].forEach((bx, bIdx) => {
        const bw = 25.0;
        const bh = 17.5;
        const by = -halfH + 4.2;

        // 盆沿亮钢倒角外圈
        ctx.fillStyle = '#33464d';
        ctx.fillRect(bx - bw / 2 - 1.2, by - 1.0, bw + 2.4, bh + 2.0);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(bx - bw / 2 - 1.2, by - 1.0, bw + 2.4, bh + 2.0);

        // 盆腔深底渐变
        const bowlGrad = ctx.createRadialGradient(bx, by + bh / 2, 2.0, bx, by + bh / 2, 18);
        bowlGrad.addColorStop(0, '#091c18');
        bowlGrad.addColorStop(0.7, '#142a2e');
        bowlGrad.addColorStop(1, '#20383e');
        ctx.fillStyle = bowlGrad;
        ctx.fillRect(bx - bw / 2, by, bw, bh);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(bx - bw / 2, by, bw, bh);

        // 盆底不锈钢多孔滤网排水口
        const drainX = bx;
        const drainY = by + bh * 0.52;
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(drainX, drainY, 3.1, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.55;
        ctx.stroke();
        ctx.fillStyle = '#030807';
        for (let da = 0; da < 6; da++) {
            const ang = (da / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(drainX + Math.cos(ang) * 1.55, drainY + Math.sin(ang) * 1.55, 0.45, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.beginPath(); ctx.arc(drainX, drainY, 0.55, 0, Math.PI * 2); ctx.fill();

        // 鹅颈感应水龙头 (底座固定在南侧后挡板 +y，弯管朝北 -y 悬探至盆腔中上方)
        const fBaseY = halfH - 3.1;
        const spoutY = by + bh * 0.36;
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(bx, fBaseY, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.55;
        ctx.stroke();

        // 水龙头投影
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx + 0.9, fBaseY + 0.5);
        ctx.lineTo(bx + 0.9, spoutY + 0.6);
        ctx.stroke();

        // 水龙头亮钢弯管
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, fBaseY);
        ctx.lineTo(bx, spoutY);
        ctx.stroke();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(bx - 0.35, fBaseY);
        ctx.lineTo(bx - 0.35, spoutY + 0.2);
        ctx.stroke();

        // 朝北喷嘴头
        ctx.fillStyle = '#475569';
        ctx.fillRect(bx - 1.5, spoutY - 1.2, 3.0, 2.0);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(bx - 1.5, spoutY - 1.2, 3.0, 2.0);

        // 温控旋钮 (安装于南侧后挡板)
        ctx.fillStyle = '#25353a';
        ctx.beginPath(); ctx.arc(bx + 6.5, fBaseY + 0.2, 1.7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.fillStyle = (bIdx === 0) ? '#10b981' : '#f59e0b';
        ctx.fillRect(bx + 6.1, fBaseY - 1.2, 0.8, 1.0);

        // 红外感应窗 (朝北面向使用人)
        ctx.fillStyle = '#070e0d';
        ctx.fillRect(bx - 7.8, fBaseY - 1.0, 3.4, 2.0);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(bx - 6.7, fBaseY - 0.5, 1.2, 0.9);
    });

    // 左侧(靠南侧后挡板肩部)自动消毒皂液器 (带琥珀色液位视窗)
    ctx.fillStyle = '#2b3d42';
    ctx.fillRect(-halfW + 1.8, -halfH + 6.5, 5.6, 13.5);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-halfW + 1.8, -halfH + 6.5, 5.6, 13.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW + 3.6, -halfH + 9.2, 1.8, 5.8);

    // 右侧(靠南侧后挡板肩部)无菌擦手纸巾分配盒
    ctx.fillStyle = '#2d4046';
    ctx.fillRect(halfW - 7.4, -halfH + 6.5, 5.6, 13.8);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(halfW - 7.4, -halfH + 6.5, 5.6, 13.8);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(halfW - 6.1, -halfH + 7.8, 3.0, 1.1);

    // [层3 & 层4] 台面金属高光与水渍磨损痕迹
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.36)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-halfW + 5, -halfH + 3.0);
    ctx.lineTo(halfW - 5, -halfH + 3.0);
    ctx.stroke();

    ctx.fillStyle = 'rgba(52, 211, 153, 0.16)';
    ctx.beginPath(); ctx.ellipse(-12, -2.0, 3.2, 1.5, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(19, 0.8, 2.6, 1.2, -0.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

function drawBufferDressingSinkDynamic(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const fBaseY = 14.5 - 3.1;
    [-16.0, 16.0].forEach((bx, idx) => {
        const active = Math.sin(time * 2.6 + idx * 1.4) > -0.3;
        ctx.fillStyle = active ? '#34d399' : '#064e3b';
        ctx.fillRect(bx - 6.7, fBaseY - 0.5, 1.2, 0.9);
    });
    ctx.restore();
}

function getBufferDressingSink(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 82, 29, false,
        'buffer_dressing_sink',
        'BUFFER DECON WASH BASIN',
        'DUAL DECON WASH SINK',
        drawBufferDressingSinkStatic,
        drawBufferDressingSinkDynamic,
        '__bufSinkCache'
    );
}

// -------------------------------------------------------------------------
// 4. 缓冲区更衣区：壁挂一体式正压防护服 ×4 + 墙面垂下供氧软管
//    (124x31，背靠南墙 +y，面罩/胸阀/双臂清晰朝北 -y 面向通道中央)
// -------------------------------------------------------------------------
function drawBufferDressingSuitRackStatic(ctx, cx, cy, angle) {
    const W = 124;
    const H = 31;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [层1] 地面强阴影与底部不锈钢防潮接水托盘 (提亮明度使其脱离地坪)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.fillRect(-halfW - 2.0, -halfH - 1.5, W + 4.0, H + 2.5);

    const trayGrad = ctx.createLinearGradient(0, -halfH, 0, halfH - 1);
    trayGrad.addColorStop(0, '#21352f');
    trayGrad.addColorStop(0.5, '#2b453d');
    trayGrad.addColorStop(1, '#192924');
    ctx.fillStyle = trayGrad;
    ctx.fillRect(-halfW, -halfH, W, H - 1.4);
    ctx.strokeStyle = '#030806';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW, -halfH, W, H - 1.4);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(-halfW, -halfH, W, H - 1.4);

    // 托盘前缘(-y 朝向通道中央)木塑踏条 & 导流格栅
    ctx.fillStyle = '#63472e';
    ctx.fillRect(-halfW + 2, -halfH + 0.8, W - 4, 3.2);
    ctx.strokeStyle = '#9c754d';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 2, -halfH + 0.8, W - 4, 3.2);
    for (let gx = -halfW + 6; gx <= halfW - 6; gx += 7) {
        ctx.strokeStyle = '#436258';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(gx, -halfH + 4.4);
        ctx.lineTo(gx, halfH - 6.5);
        ctx.stroke();
    }

    // [层2] 墙面主供氧不锈钢总管 (+y 靠南墙) + 支撑悬臂与挂载横杆
    const pipeY = halfH - 2.8;
    const railY = halfH - 6.6;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(-halfW + 1, pipeY - 0.8, W - 2, 3.4);
    const pipeGrad = ctx.createLinearGradient(0, pipeY - 1.6, 0, pipeY + 1.6);
    pipeGrad.addColorStop(0, '#647d86');
    pipeGrad.addColorStop(0.5, '#3b4e54');
    pipeGrad.addColorStop(1, '#1e292d');
    ctx.fillStyle = pipeGrad;
    ctx.fillRect(-halfW + 1, pipeY - 1.6, W - 2, 3.2);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.65;
    ctx.strokeRect(-halfW + 1, pipeY - 1.6, W - 2, 3.2);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.50)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-halfW + 2, pipeY - 0.8);
    ctx.lineTo(halfW - 2, pipeY - 0.8);
    ctx.stroke();

    // 供氧总管末端压力表 & 琥珀色总截止阀手柄
    ctx.fillStyle = '#0e1719';
    ctx.beginPath(); ctx.arc(halfW - 4.8, pipeY, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.65;
    ctx.stroke();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(halfW - 4.8, pipeY);
    ctx.lineTo(halfW - 3.3, pipeY - 1.4);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-halfW + 2.8, pipeY - 2.3, 4.0, 1.5);

    // 不锈钢挂衣横杆 + 5 组墙面悬臂支架
    ctx.fillStyle = '#4e636b';
    ctx.fillRect(-halfW + 3, railY - 0.9, W - 6, 1.8);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-halfW + 3, railY - 0.9, W - 6, 1.8);

    [-57, -29.5, 0, 29.5, 57].forEach(bx => {
        ctx.fillStyle = '#2d3d42';
        ctx.fillRect(bx - 1.6, railY - 1.4, 3.2, 6.0);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(bx - 1.6, railY - 1.4, 3.2, 6.0);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(bx, pipeY, 0.65, 0, Math.PI * 2); ctx.fill();
    });

    // [4 套俯视 2.5D 一体式正压防护服：背部靠南墙 +y，全景面罩/胸阀/双臂清晰朝北 -y 面向通道]
    const suitPositions = [-43.5, -14.5, 14.5, 43.5];
    suitPositions.forEach((sx, idx) => {
        // 4A. 防护服地面投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.beginPath();
        ctx.ellipse(sx + 1.0, -0.5, 12.2, 9.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4B. 背部正压空气背包轮廓 (紧贴南墙挂杆侧 +y = +3.8 .. +9.0)
        ctx.fillStyle = '#293b34';
        ctx.fillRect(sx - 6.8, 3.8, 13.6, 5.0);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.65;
        ctx.strokeRect(sx - 6.8, 3.8, 13.6, 5.0);

        // 4C. 连体防护服双臂袖筒与腕部密封卡环 (从双肩向北侧 -y 自然前垂)
        [-1, 1].forEach(side => {
            ctx.fillStyle = '#476156';
            ctx.beginPath();
            ctx.moveTo(sx + side * 8.4, 3.6);
            ctx.lineTo(sx + side * 12.6, -1.0);
            ctx.lineTo(sx + side * 11.2, -6.4);
            ctx.lineTo(sx + side * 7.2, -5.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#6b8e7f';
            ctx.lineWidth = 0.7;
            ctx.stroke();

            // 手腕气密锁紧卡环 (亮铜木色锁圈)
            ctx.fillStyle = '#7c5c3e';
            ctx.fillRect(sx + side * 9.0 - 1.8, -6.6, 3.6, 1.8);
            ctx.strokeStyle = '#b08d67';
            ctx.lineWidth = 0.55;
            ctx.strokeRect(sx + side * 9.0 - 1.8, -6.6, 3.6, 1.8);
        });

        // 4D. 肩胸一体化正压防护服躯干 (提亮低饱和军工灰绿面料，清晰脱离托盘)
        const suitGrad = ctx.createLinearGradient(sx - 9, -8, sx + 9, 5);
        suitGrad.addColorStop(0, '#628374');
        suitGrad.addColorStop(0.5, '#4b6659');
        suitGrad.addColorStop(1, '#33483e');
        ctx.fillStyle = suitGrad;
        ctx.beginPath();
        ctx.moveTo(sx - 9.8, 4.4);
        ctx.quadraticCurveTo(sx - 10.6, -2.5, sx - 7.8, -8.2);
        ctx.lineTo(sx + 7.8, -8.2);
        ctx.quadraticCurveTo(sx + 10.6, -2.5, sx + 9.8, 4.4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // 中央前襟防水拉链封条 + 翡翠密封缝线 (延伸至前胸朝北侧)
        ctx.fillStyle = '#14221d';
        ctx.fillRect(sx - 1.3, -8.0, 2.6, 8.2);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(sx, -7.8);
        ctx.lineTo(sx, 0.0);
        ctx.stroke();

        // 4E. 一体式正压充气头罩 + 朝北(-y 面向通道)全景护目面罩
        ctx.fillStyle = '#587869';
        ctx.beginPath();
        ctx.ellipse(sx, 0.8, 6.0, 4.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // 深色全景面罩玻璃 (朝北 -y 突出，清晰表明防护服正面朝向通道中央)
        ctx.fillStyle = '#07221b';
        ctx.beginPath();
        ctx.ellipse(sx, -2.1, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.75;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(sx - 0.5, -2.2, 3.0, Math.PI * 1.1, Math.PI * 1.68);
        ctx.stroke();

        // 4F. 前胸正压进气阀座 + 微型气压表 (位于朝北前胸)
        const portX = sx + 3.8;
        const portY = -4.6;
        ctx.fillStyle = '#33464c';
        ctx.beginPath(); ctx.arc(portX, portY, 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.stroke();
        ctx.fillStyle = (idx === 3) ? '#f59e0b' : '#10b981';
        ctx.beginPath(); ctx.arc(portX, portY, 0.75, 0, Math.PI * 2); ctx.fill();

        // 4G. 前沿编号铭牌 (SUIT-01 .. SUIT-04，整齐镶嵌于朝通道前沿木踏条之上)
        ctx.fillStyle = '#071c16';
        ctx.fillRect(sx - 9.2, -halfH + 0.6, 18.4, 3.6);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(sx - 9.2, -halfH + 0.6, 18.4, 3.6);
        ctx.font = 'bold 2.6px monospace';
        ctx.fillStyle = '#d1fae5';
        ctx.textAlign = 'center';
        ctx.fillText(`SUIT-0${idx + 1}`, sx, -halfH + 3.3);

        // 4H. 从南侧主供氧管垂下接入前胸气阀的供氧软管 (阴影 + 编织管 + 清晰翡翠波纹 + 琥珀快接头)
        const tapX = sx + 8.6;
        const tapY = pipeY - 1.0;

        ctx.fillStyle = '#475c63';
        ctx.fillRect(tapX - 1.7, tapY - 1.3, 3.4, 2.6);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(tapX - 1.7, tapY - 1.3, 3.4, 2.6);

        const cp1x = tapX + 5.2;
        const cp1y = tapY - 7.8;
        const cp2x = portX + 6.8;
        const cp2y = portY - 4.5;

        // Pass A: 软管投影
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tapX + 0.8, tapY + 0.8);
        ctx.bezierCurveTo(cp1x + 0.8, cp1y + 0.8, cp2x + 0.8, cp2y + 0.8, portX + 0.8, portY + 0.8);
        ctx.stroke();

        // Pass B: 深色橡胶编织软管主体
        ctx.strokeStyle = '#24363d';
        ctx.lineWidth = 1.55;
        ctx.beginPath();
        ctx.moveTo(tapX, tapY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, portX, portY);
        ctx.stroke();

        // Pass C: 软管波纹脊线高光
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.82)';
        ctx.lineWidth = 0.68;
        ctx.setLineDash([1.3, 1.1]);
        ctx.beginPath();
        ctx.moveTo(tapX, tapY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, portX, portY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 防护服进气端快接卡箍 (琥珀铜点缀)
        ctx.fillStyle = '#d97706';
        ctx.beginPath(); ctx.arc(portX + 1.0, portY - 0.6, 1.05, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 0.4;
        ctx.stroke();
    });

    // [层3 & 层4] 面料褶皱磨损纹
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.28)';
    ctx.lineWidth = 0.55;
    suitPositions.forEach(sx => {
        ctx.beginPath();
        ctx.moveTo(sx - 5.4, -5.0); ctx.lineTo(sx - 2.6, -3.2);
        ctx.moveTo(sx + 2.8, -6.8); ctx.lineTo(sx + 5.8, -5.0);
        ctx.stroke();
    });

    ctx.restore();
}

function drawBufferDressingSuitRackDynamic(ctx, cx, cy, angle) {
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const suitPositions = [-43.5, -14.5, 14.5, 43.5];
    suitPositions.forEach((sx, idx) => {
        const pulse = Math.sin(time * 2.0 + idx * 1.3) > 0;
        ctx.fillStyle = (idx === 3) ? (pulse ? '#f59e0b' : '#78350f') : (pulse ? '#34d399' : '#064e3b');
        ctx.beginPath();
        ctx.arc(sx + 3.8, -4.6, 0.85, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function getBufferDressingSuitRack(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 124, 31, false,
        'buffer_dressing_suit_rack',
        'POSITIVE PRESSURE SUIT RACK',
        'POSITIVE-PRESSURE SUIT & O2 RACK',
        drawBufferDressingSuitRackStatic,
        drawBufferDressingSuitRackDynamic,
        '__bufSuitRackCache'
    );
}

// =========================================================================
// Level 8 缓冲区 · 消毒区专用精密道具绘制系统 (2026-11-15)
// 严格遵循 drawTripleCubicleWorkstation 锚点分层画法：
// - 两大组隔离分区：东侧高压气流喷嘴组 (x: +20..+112) | 10px 隔离带 | 西侧消毒液喷头组+地面格栅废液槽 (x: +122..+220)
// - 描边主用 0.4–1.0；>1.5 仅作深色结构打底且必叠 ~0.8 倒角高光；严禁 >=2.0 轮廓线
// - 仅绘静态道具，喷头红绿指示灯直接读取通道对象 airSpraying / liquidSpraying / sprayState
// =========================================================================

// 状态驱动的红绿双色指示灯绘制辅助函数（无闪烁/无动画，纯由通道状态字段决定颜色）
function drawNozzleDualIndicatorLamps(ctx, bx, yRed, yGreen, isSpraying, isDone) {
    // 红色喷洒中灯珠
    ctx.fillStyle = isSpraying ? '#ef4444' : (isDone ? '#3b0d0d' : '#521818');
    ctx.beginPath();
    ctx.arc(bx, yRed, 1.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isSpraying ? '#fca5a5' : '#1f2937';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    if (isSpraying) {
        ctx.fillStyle = '#fecaca';
        ctx.beginPath();
        ctx.arc(bx - 0.25, yRed - 0.25, 0.38, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绿色喷完就绪灯珠
    ctx.fillStyle = isDone ? '#10b981' : (isSpraying ? '#052e22' : '#0b4a35');
    ctx.beginPath();
    ctx.arc(bx, yGreen, 1.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isDone ? '#6ee7b7' : '#1f2937';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    if (isDone) {
        ctx.fillStyle = '#a7f3d0';
        ctx.beginPath();
        ctx.arc(bx - 0.25, yGreen - 0.25, 0.38, 0, Math.PI * 2);
        ctx.fill();
    }
}

// -------------------------------------------------------------------------
// 5. 缓冲区消毒区：地面格栅与废液收集槽 (96x66，位于消毒液喷头正下方，提亮钢格栅明度阶差)
// -------------------------------------------------------------------------
function drawBufferDeconGratingStatic(ctx, cx, cy, angle) {
    const W = 96;
    const H = 66;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [零件1] 外围地面投影与混凝土沉坑切口阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-halfW - 1.5, -halfH - 1.5, W + 3.0, H + 3.0);

    // [零件2] 斜坡集液槽底盘与残余低饱和消毒废液面
    const sumpGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
    sumpGrad.addColorStop(0, '#0a2921');
    sumpGrad.addColorStop(0.65, '#061a14');
    sumpGrad.addColorStop(1, '#030e0b');
    ctx.fillStyle = sumpGrad;
    ctx.fillRect(-halfW + 2.5, -halfH + 2.5, W - 5.0, H - 5.0);

    // 槽底微弱残余废液反光区
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.fillRect(-halfW + 10, -10, W - 20, 20);

    // [零件3] 中央纵向主废液收集槽道 (Waste Collection Trough)
    const troughGrad = ctx.createLinearGradient(0, -8, 0, 8);
    troughGrad.addColorStop(0, '#081d17');
    troughGrad.addColorStop(0.5, '#12382e');
    troughGrad.addColorStop(1, '#081d17');
    ctx.fillStyle = troughGrad;
    ctx.fillRect(-halfW + 4.5, -8.0, W - 9.0, 16.0);
    ctx.strokeStyle = '#4f6d63';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-halfW + 4.5, -8.0, W - 9.0, 16.0);

    // 废液槽道液面微反光纹
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.36)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-halfW + 12, -2.5);
    ctx.lineTo(halfW - 12, -2.5);
    ctx.moveTo(-halfW + 16, 3.0);
    ctx.lineTo(halfW - 14, 3.0);
    ctx.stroke();

    // [零件4] 双联不锈钢多孔滤渣网篮排污口 (Drain Sump Strainers)
    [-22, 22].forEach(dx => {
        ctx.fillStyle = '#3b4e54';
        ctx.beginPath();
        ctx.arc(dx, 0, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.65;
        ctx.stroke();

        ctx.fillStyle = '#526b73';
        ctx.beginPath();
        ctx.arc(dx, 0, 3.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#020706';
        ctx.beginPath();
        ctx.arc(dx, 0, 0.7, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(dx + Math.cos(a) * 1.9, Math.sin(a) * 1.9, 0.52, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // [零件5] 西侧废液回收接驳短管与单向止回阀
    ctx.fillStyle = '#40565e';
    ctx.fillRect(-halfW + 3.0, -3.2, 8.5, 6.4);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 3.0, -3.2, 8.5, 6.4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-halfW + 7.2, -3.6, 2.4, 7.2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-halfW + 7.2, -3.6, 2.4, 7.2);

    // [零件6] 5 根横向重型工字承重支撑梁
    [-34, -17, 0, 17, 34].forEach(bx => {
        ctx.fillStyle = '#25363c';
        ctx.fillRect(bx - 1.3, -halfH + 3.2, 2.6, H - 6.4);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(bx - 0.9, -halfH + 3.5);
        ctx.lineTo(bx - 0.9, halfH - 3.5);
        ctx.stroke();
    });

    // [零件7] 高密度焊接防滑工业钢格栅条 (提亮拉丝钢条 + 亮钢上棱，对比度清晰分明)
    for (let gy = -halfH + 5.2; gy <= halfH - 5.2; gy += 4.3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
        ctx.fillRect(-halfW + 3.4, gy + 0.9, W - 6.8, 1.3);
        ctx.fillStyle = '#425961';
        ctx.fillRect(-halfW + 3.4, gy - 0.6, W - 6.8, 1.4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(-halfW + 3.6, gy - 0.5);
        ctx.lineTo(halfW - 3.6, gy - 0.5);
        ctx.stroke();
    }
    for (let gx = -halfW + 9; gx <= halfW - 9; gx += 11) {
        ctx.fillStyle = '#364b52';
        ctx.fillRect(gx - 0.6, -halfH + 3.8, 1.2, H - 7.6);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(gx - 0.4, -halfH + 4.0);
        ctx.lineTo(gx - 0.4, halfH - 4.0);
        ctx.stroke();
    }

    // [零件8] 不锈钢嵌入式防漏围堰外框 (1.6 深色结构打底 + 0.85 翡翠倒角高光)
    ctx.strokeStyle = '#384f56';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW + 1.5, -halfH + 1.5, W - 3.0, H - 3.0);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.55;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-halfW, -halfH, W, H);

    // [零件9] 四角加固角码 + 8 颗六角地脚螺栓 + 微型琥珀角标
    [
        [-halfW + 0.6, -halfH + 0.6, 1, 1],
        [halfW - 6.6, -halfH + 0.6, -1, 1],
        [-halfW + 0.6, halfH - 5.6, 1, -1],
        [halfW - 6.6, halfH - 5.6, -1, -1]
    ].forEach(([cxp, cyp]) => {
        ctx.fillStyle = '#425961';
        ctx.fillRect(cxp, cyp, 6.0, 5.0);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cxp, cyp, 6.0, 5.0);
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(cxp + 2.0, cyp + 2.5, 0.65, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cxp + 4.2, cyp + 2.5, 0.65, 0, Math.PI * 2); ctx.fill();
    });
    [[-halfW + 8.5, -halfH + 0.7], [halfW - 14.5, -halfH + 0.7], [-halfW + 8.5, halfH - 2.3], [halfW - 14.5, halfH - 2.3]].forEach(([tx, ty]) => {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(tx, ty, 6.0, 1.6);
    });

    // [零件10] 废液槽铭牌 + 液位视窗条 + 表面磨损刮痕
    ctx.fillStyle = '#071c16';
    ctx.fillRect(-15, -halfH + 0.6, 30, 4.0);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-15, -halfH + 0.6, 30, 4.0);
    ctx.font = 'bold 2.4px monospace';
    ctx.fillStyle = '#d1fae5';
    ctx.textAlign = 'center';
    ctx.fillText('WASTE-SUMP // W01', 0, -halfH + 3.4);

    // 东侧液位视窗条
    ctx.fillStyle = '#091210';
    ctx.fillRect(halfW - 4.0, -9, 2.2, 18);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(halfW - 3.5, -4, 1.2, 11);

    // 格栅金属表面轻微磨损痕
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.28)';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-26, -12); ctx.lineTo(-18, -11.5);
    ctx.moveTo(14, 14.2); ctx.lineTo(24, 14.6);
    ctx.stroke();

    ctx.restore();
}

function getBufferDeconGrating(cx, cy, angle) {
    return buildCorridorPropBox(
        cx, cy, angle, 96, 66, true,
        'buffer_decon_grating',
        'DECON FLOOR GRATING & WASTE SUMP',
        'DECON DRAINAGE GRATING & SUMP',
        drawBufferDeconGratingStatic,
        null,
        '__bufDeconGratingCache'
    );
}

// -------------------------------------------------------------------------
// 6. 缓冲区消毒区：高压气流喷嘴组 (92x26，每侧 6 枚喷嘴；提亮不锈钢与铜螺母对比)
// -------------------------------------------------------------------------
const BUFFER_DECON_AIR_NOZZLE_XS = [-32.5, -19.5, -6.5, 6.5, 19.5, 32.5];

function drawBufferDeconAirNozzlesStatic(ctx, cx, cy, angle, isNorth) {
    const W = 92;
    const H = 26;
    const halfW = W / 2;
    const halfH = H / 2;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [层1] 强墙体与地面投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.68)';
    ctx.fillRect(-halfW - 1.5, -halfH + (isNorth ? 0.5 : -2.0), W + 3.0, H + 1.5);

    // [层2] 墙面安装钢制底座导轨 (1.6 深色结构打底 + 0.85 翡翠倒角高光)
    const baseH = 10.6;
    const baseRectY = isNorth ? wallY : (wallY - baseH);
    ctx.fillStyle = '#243832';
    ctx.fillRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);

    // 靠墙主供气高压不锈钢总管
    const pipeY = wallY + dir * 4.4;
    const pipeGrad = ctx.createLinearGradient(0, pipeY - 2.2, 0, pipeY + 2.2);
    pipeGrad.addColorStop(0, '#5a7680');
    pipeGrad.addColorStop(0.5, '#3b5158');
    pipeGrad.addColorStop(1, '#202e33');
    ctx.fillStyle = pipeGrad;
    ctx.fillRect(-halfW + 3.5, pipeY - 2.0, W - 7.0, 4.0);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-halfW + 3.5, pipeY - 2.0, W - 7.0, 4.0);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.50)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-halfW + 4.5, pipeY - 0.9 * dir);
    ctx.lineTo(halfW - 4.5, pipeY - 0.9 * dir);
    ctx.stroke();

    // 总管两端封头法兰 + 紧固螺栓
    [-halfW + 3.0, halfW - 3.0].forEach(fx => {
        ctx.fillStyle = '#455e66';
        ctx.fillRect(fx - 1.5, pipeY - 3.0, 3.0, 6.0);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(fx - 1.5, pipeY - 3.0, 3.0, 6.0);
        ctx.fillStyle = '#070e0c';
        ctx.beginPath(); ctx.arc(fx, pipeY - 1.7, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx, pipeY + 1.7, 0.5, 0, Math.PI * 2); ctx.fill();
    });

    // 左端高压气表盘
    const gx = -40.8;
    ctx.fillStyle = '#091512';
    ctx.beginPath(); ctx.arc(gx, pipeY, 2.7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(gx, pipeY);
    ctx.lineTo(gx + 1.4, pipeY - 1.2 * dir);
    ctx.stroke();

    // 右端手动紧急气压截断阀手柄
    const vx = 40.8;
    ctx.fillStyle = '#3d5056';
    ctx.fillRect(vx - 1.8, pipeY - 1.8, 3.6, 3.6);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(vx - 2.6, pipeY - 0.7, 5.2, 1.4);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(vx - 2.6, pipeY - 0.7, 5.2, 1.4);

    // 组标识铭牌 (AIR-JET // GRP-A) + 主控灯座
    ctx.fillStyle = '#071c16';
    ctx.fillRect(-15.5, wallY + dir * 1.4 - (isNorth ? 0 : 3.2), 31, 3.2);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-15.5, wallY + dir * 1.4 - (isNorth ? 0 : 3.2), 31, 3.2);
    ctx.font = 'bold 2.15px monospace';
    ctx.fillStyle = '#d1fae5';
    ctx.textAlign = 'center';
    ctx.fillText('AIR-JET // GRP-A', 0, wallY + dir * 3.8 + (isNorth ? 0 : 0.8));

    // 主控灯座框 (动态层填色)
    ctx.fillStyle = '#091210';
    ctx.fillRect(-27.2, wallY + dir * 5.2 - (isNorth ? 0 : 3.4), 3.4, 3.4);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-27.2, wallY + dir * 5.2 - (isNorth ? 0 : 3.4), 3.4, 3.4);

    // [6 枚独立高压气流喷嘴：每枚拆为 8 个独立小零件]
    BUFFER_DECON_AIR_NOZZLE_XS.forEach(nx => {
        // 1) 喷嘴座安装法兰板 + 2 颗螺栓
        const flgY = wallY + dir * 6.4;
        ctx.fillStyle = '#2d4147';
        ctx.fillRect(nx - 4.4, flgY - 1.5, 8.8, 3.0);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(nx - 4.4, flgY - 1.5, 8.8, 3.0);
        [-3.2, 3.2].forEach(bx => {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath(); ctx.arc(nx + bx, flgY, 0.5, 0, Math.PI * 2); ctx.fill();
        });

        // 2) 高压进气弯头与缓冲短节
        const elbY = wallY + dir * 8.4;
        ctx.fillStyle = '#405860';
        ctx.fillRect(nx - 2.3, Math.min(pipeY, elbY), 4.6, Math.abs(elbY - pipeY) + 1.2);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(nx - 2.3, Math.min(pipeY, elbY), 4.6, Math.abs(elbY - pipeY) + 1.2);

        // 3) 圆柱形主阀管体 (阴影 + 渐变 + 高光脊)
        const tubeStart = wallY + dir * 8.4;
        const tubeEnd = wallY + dir * 13.4;
        const tTop = Math.min(tubeStart, tubeEnd);
        const tH = Math.abs(tubeEnd - tubeStart);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.fillRect(nx - 1.7, tTop + 0.8, 4.4, tH);
        const tubeGrad = ctx.createLinearGradient(nx - 2.2, 0, nx + 2.2, 0);
        tubeGrad.addColorStop(0, '#2c3f45');
        tubeGrad.addColorStop(0.45, '#59747e');
        tubeGrad.addColorStop(1, '#233238');
        ctx.fillStyle = tubeGrad;
        ctx.fillRect(nx - 2.2, tTop, 4.4, tH);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(nx - 2.2, tTop, 4.4, tH);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.60)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(nx - 1.0, tTop + 0.5);
        ctx.lineTo(nx - 1.0, tTop + tH - 0.5);
        ctx.stroke();

        // 4) 六角锁紧螺母 (暖铜质感明暗)
        const nutY = wallY + dir * 14.5;
        ctx.fillStyle = '#755638';
        ctx.fillRect(nx - 3.2, nutY - 1.3, 6.4, 2.6);
        ctx.fillStyle = '#9c754d';
        ctx.fillRect(nx - 1.4, nutY - 1.3, 2.8, 2.6);
        ctx.strokeStyle = '#c49b6c';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(nx - 3.2, nutY - 1.3, 6.4, 2.6);

        // 5) 双道减压节流散热环箍
        [16.6, 18.0].forEach(dOff => {
            const ry = wallY + dir * dOff;
            ctx.fillStyle = '#334850';
            ctx.fillRect(nx - 2.7, ry - 0.55, 5.4, 1.1);
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 0.45;
            ctx.strokeRect(nx - 2.7, ry - 0.55, 5.4, 1.1);
        });

        // 6) 锥形高压气流喷嘴锥体 (1.6 深色结构打底 + 0.75 翡翠高光)
        const coneY0 = wallY + dir * 18.7;
        const coneY1 = wallY + dir * 23.8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.beginPath();
        ctx.moveTo(nx - 2.1, coneY0 + 0.6);
        ctx.lineTo(nx + 2.9, coneY0 + 0.6);
        ctx.lineTo(nx + 1.8, coneY1 + 0.6);
        ctx.lineTo(nx - 0.8, coneY1 + 0.6);
        ctx.closePath();
        ctx.fill();

        const coneGrad = ctx.createLinearGradient(nx - 2.5, 0, nx + 2.5, 0);
        coneGrad.addColorStop(0, '#324850');
        coneGrad.addColorStop(0.45, '#64818c');
        coneGrad.addColorStop(1, '#25363c');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(nx - 2.5, coneY0);
        ctx.lineTo(nx + 2.5, coneY0);
        ctx.lineTo(nx + 1.3, coneY1);
        ctx.lineTo(nx - 1.3, coneY1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#030807';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // 7) 喷孔内腔与亮钢微唇边高光
        ctx.fillStyle = '#030706';
        ctx.fillRect(nx - 0.9, coneY1 - (isNorth ? 0.6 : 0.4), 1.8, 1.0);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(nx - 1.2, coneY1);
        ctx.lineTo(nx + 1.2, coneY1);
        ctx.stroke();

        // 8) 独立红绿指示灯座外壳 (双孔灯杯，颜色在 Dynamic 读取通道状态)
        const ledX = nx + 3.6;
        const ledMidY = wallY + dir * 11.1;
        ctx.fillStyle = '#08100e';
        ctx.fillRect(ledX - 1.5, ledMidY - 2.4, 3.0, 4.8);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(ledX - 1.5, ledMidY - 2.4, 3.0, 4.8);
    });

    ctx.restore();
}

function drawBufferDeconAirNozzlesDynamic(ctx, cx, cy, angle, isNorth, getCorridor) {
    const corridor = typeof getCorridor === 'function' ? getCorridor() : getCorridor;
    const isSpraying = !!(corridor && (corridor.airSpraying || corridor.sprayState === 'air_spray'));
    const isDone = !!(corridor && (corridor.sprayState === 'liquid_spray' || corridor.sprayState === 'done'));

    const halfH = 13;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 总管主控指示灯
    const masterY = wallY + dir * 6.9;
    ctx.fillStyle = isSpraying ? '#ef4444' : (isDone ? '#10b981' : '#f59e0b');
    ctx.fillRect(-26.5, masterY - 1.0, 2.0, 2.0);

    // 6 枚喷头红绿双色指示灯
    BUFFER_DECON_AIR_NOZZLE_XS.forEach(nx => {
        const ledX = nx + 3.6;
        const yRed = wallY + dir * 9.9;
        const yGreen = wallY + dir * 12.3;
        drawNozzleDualIndicatorLamps(ctx, ledX, yRed, yGreen, isSpraying, isDone);
    });

    ctx.restore();
}

function getBufferDeconAirNozzles(cx, cy, angle, isNorth, getCorridor) {
    const sideTag = isNorth ? 'N' : 'S';
    return buildCorridorPropBox(
        cx, cy, angle, 92, 26, false,
        `buffer_decon_air_${sideTag.toLowerCase()}`,
        `HIGH-PRESSURE AIR NOZZLES (${sideTag})`,
        `AIR-JET DECON NOZZLE BANK (${sideTag})`,
        (ctx, x, y, a) => drawBufferDeconAirNozzlesStatic(ctx, x, y, a, isNorth),
        (ctx, x, y, a) => drawBufferDeconAirNozzlesDynamic(ctx, x, y, a, isNorth, getCorridor),
        `__bufDeconAir${sideTag}Cache`
    );
}

// -------------------------------------------------------------------------
// 7. 缓冲区消毒区：消毒液雾化喷头组 (98x26，每侧 5 枚喷头；提亮防腐蚀钢与铜螺母质感)
// -------------------------------------------------------------------------
const BUFFER_DECON_LIQ_NOZZLE_XS = [-31.0, -15.5, 0, 15.5, 31.0];

function drawBufferDeconLiquidNozzlesStatic(ctx, cx, cy, angle, isNorth) {
    const W = 98;
    const H = 26;
    const halfW = W / 2;
    const halfH = H / 2;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // [层1] 强地面与墙体投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.68)';
    ctx.fillRect(-halfW - 1.5, -halfH + (isNorth ? 0.5 : -2.0), W + 3.0, H + 1.5);

    // [层2] 防腐不锈钢安装底板 (1.6 深色打底 + 0.85 翡翠倒角高光)
    const baseH = 11.2;
    const baseRectY = isNorth ? wallY : (wallY - baseH);
    ctx.fillStyle = '#25393c';
    ctx.fillRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-halfW, baseRectY, W, baseH);

    // 主消毒液不锈钢供液总管
    const mainPipeY = wallY + dir * 3.8;
    const mGrad = ctx.createLinearGradient(0, mainPipeY - 1.8, 0, mainPipeY + 1.8);
    mGrad.addColorStop(0, '#5f7b85');
    mGrad.addColorStop(0.5, '#3e545c');
    mGrad.addColorStop(1, '#223035');
    ctx.fillStyle = mGrad;
    ctx.fillRect(-halfW + 3.5, mainPipeY - 1.7, W - 7.0, 3.4);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-halfW + 3.5, mainPipeY - 1.7, W - 7.0, 3.4);

    // 副管：铜木色药液比例计量回流管 (清晰区分于纯气动组)
    const secPipeY = wallY + dir * 6.8;
    const sGrad = ctx.createLinearGradient(0, secPipeY - 1.1, 0, secPipeY + 1.1);
    sGrad.addColorStop(0, '#a37b54');
    sGrad.addColorStop(0.5, '#6e5034');
    sGrad.addColorStop(1, '#3f2d1c');
    ctx.fillStyle = sGrad;
    ctx.fillRect(-halfW + 5.5, secPipeY - 1.1, W - 11.0, 2.2);
    ctx.strokeStyle = '#c49b6c';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-halfW + 5.5, secPipeY - 1.1, W - 11.0, 2.2);

    // 左侧琥珀色消毒液药剂观察视窗
    const sgX = -43.0;
    ctx.fillStyle = '#0b1614';
    ctx.fillRect(sgX - 2.6, wallY + dir * 5.2 - 3.6, 5.2, 7.2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(sgX - 2.6, wallY + dir * 5.2 - 3.6, 5.2, 7.2);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(sgX - 1.4, wallY + dir * 5.2 - 2.2, 2.8, 4.4);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 0.4;
    ctx.strokeRect(sgX - 1.4, wallY + dir * 5.2 - 2.2, 2.8, 4.4);

    // 右侧电磁总阀接线盒
    const jbX = 43.0;
    ctx.fillStyle = '#2d4047';
    ctx.fillRect(jbX - 3.0, wallY + dir * 5.2 - 3.2, 6.0, 6.4);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(jbX - 3.0, wallY + dir * 5.2 - 3.2, 6.0, 6.4);

    // 分组铭牌 (LIQ-MIST // GRP-B) + 主控灯座
    ctx.fillStyle = '#071c16';
    ctx.fillRect(-23.5, wallY + dir * 1.4 - (isNorth ? 0 : 3.0), 30, 3.0);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-23.5, wallY + dir * 1.4 - (isNorth ? 0 : 3.0), 30, 3.0);
    ctx.font = 'bold 2.1px monospace';
    ctx.fillStyle = '#d1fae5';
    ctx.textAlign = 'center';
    ctx.fillText('LIQ-MIST // GRP-B', -8.5, wallY + dir * 3.6 + (isNorth ? 0 : 0.7));

    ctx.fillStyle = '#091210';
    ctx.fillRect(21.7, wallY + dir * 5.2 - (isNorth ? 0 : 3.2), 3.2, 3.2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(21.7, wallY + dir * 5.2 - (isNorth ? 0 : 3.2), 3.2, 3.2);

    // [5 枚独立消毒液雾化喷头：每枚拆为 9 个独立小零件]
    BUFFER_DECON_LIQ_NOZZLE_XS.forEach(nx => {
        // 1) 方形防腐法兰安装背板 + 4 颗铆钉
        const flgY = wallY + dir * 7.0;
        ctx.fillStyle = '#2e4349';
        ctx.fillRect(nx - 5.2, flgY - 1.7, 10.4, 3.4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(nx - 5.2, flgY - 1.7, 10.4, 3.4);
        [[-4.0, -0.9], [4.0, -0.9], [-4.0, 0.9], [4.0, 0.9]].forEach(([rx, ry]) => {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath(); ctx.arc(nx + rx, flgY + ry, 0.42, 0, Math.PI * 2); ctx.fill();
        });

        // 2) 药液供液垂直管体
        const riserTop = Math.min(mainPipeY, wallY + dir * 9.6);
        const riserH = Math.abs(wallY + dir * 9.6 - mainPipeY) + 1.0;
        ctx.fillStyle = '#405860';
        ctx.fillRect(nx - 2.1, riserTop, 4.2, riserH);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(nx - 2.1, riserTop, 4.2, riserH);

        // 3) 电磁开关控制阀体方块
        const solY = wallY + dir * 11.2;
        ctx.fillStyle = '#26383e';
        ctx.fillRect(nx - 3.3, solY - 2.0, 6.6, 4.0);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.55;
        ctx.strokeRect(nx - 3.3, solY - 2.0, 6.6, 4.0);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(nx - 2.0, solY - 0.5, 4.0, 1.0);

        // 4) 左侧 Y 型药液过滤网螺帽
        ctx.fillStyle = '#6e5034';
        ctx.fillRect(nx - 5.2, solY - 1.2, 2.0, 2.4);
        ctx.strokeStyle = '#b08d67';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(nx - 5.2, solY - 1.2, 2.0, 2.4);

        // 5) 重型铜质六角锁紧大螺母
        const nutY = wallY + dir * 14.3;
        ctx.fillStyle = '#78593b';
        ctx.fillRect(nx - 3.7, nutY - 1.4, 7.4, 2.8);
        ctx.fillStyle = '#a88057';
        ctx.fillRect(nx - 1.5, nutY - 1.4, 3.0, 2.8);
        ctx.strokeStyle = '#cfa778';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(nx - 3.7, nutY - 1.4, 7.4, 2.8);

        // 6) 阶梯式雾化喷头套筒
        const barY = wallY + dir * 16.8;
        ctx.fillStyle = '#3d545d';
        ctx.fillRect(nx - 2.8, barY - 1.2, 5.6, 2.4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(nx - 2.8, barY - 1.2, 5.6, 2.4);

        // 7) 宽幅喇叭形雾化喷嘴锥体 + 内部旋流芯孔 (1.6 深色结构打底 + 0.8 翡翠高光)
        const coneY0 = wallY + dir * 18.0;
        const coneY1 = wallY + dir * 23.4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.beginPath();
        ctx.moveTo(nx - 2.4, coneY0 + 0.6);
        ctx.lineTo(nx + 3.2, coneY0 + 0.6);
        ctx.lineTo(nx + 5.1, coneY1 + 0.6);
        ctx.lineTo(nx - 4.1, coneY1 + 0.6);
        ctx.closePath();
        ctx.fill();

        const bellGrad = ctx.createLinearGradient(nx - 4.5, 0, nx + 4.5, 0);
        bellGrad.addColorStop(0, '#334a52');
        bellGrad.addColorStop(0.5, '#66848f');
        bellGrad.addColorStop(1, '#26383e');
        ctx.fillStyle = bellGrad;
        ctx.beginPath();
        ctx.moveTo(nx - 2.8, coneY0);
        ctx.lineTo(nx + 2.8, coneY0);
        ctx.lineTo(nx + 4.6, coneY1);
        ctx.lineTo(nx - 4.6, coneY1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#030807';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 内部深色旋流雾化腔 + 亮钢唇边
        ctx.fillStyle = '#040b09';
        ctx.fillRect(nx - 3.1, coneY1 - (isNorth ? 1.1 : 0.3), 6.2, 1.4);
        ctx.fillStyle = '#34d399';
        ctx.beginPath(); ctx.arc(nx, coneY1 - dir * 0.5, 0.65, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(nx - 4.4, coneY1);
        ctx.lineTo(nx + 4.4, coneY1);
        ctx.stroke();

        // 8) 顶部防滴漏半包护罩边缘
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(nx - 3.4, wallY + dir * 19.6);
        ctx.lineTo(nx + 3.4, wallY + dir * 19.6);
        ctx.stroke();

        // 9) 独立红绿指示灯座外壳 (双孔灯杯，颜色在 Dynamic 读取通道状态)
        const ledX = nx + 4.9;
        const ledMidY = wallY + dir * 11.4;
        ctx.fillStyle = '#08100e';
        ctx.fillRect(ledX - 1.5, ledMidY - 2.4, 3.0, 4.8);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(ledX - 1.5, ledMidY - 2.4, 3.0, 4.8);
    });

    ctx.restore();
}

function drawBufferDeconLiquidNozzlesDynamic(ctx, cx, cy, angle, isNorth, getCorridor) {
    const corridor = typeof getCorridor === 'function' ? getCorridor() : getCorridor;
    const isSpraying = !!(corridor && (corridor.liquidSpraying || corridor.sprayState === 'liquid_spray'));
    const isDone = !!(corridor && corridor.sprayState === 'done');

    const halfH = 13;
    const dir = isNorth ? 1 : -1;
    const wallY = isNorth ? -halfH : halfH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 总管主控指示灯
    const masterY = wallY + dir * 6.8;
    ctx.fillStyle = isSpraying ? '#ef4444' : (isDone ? '#10b981' : '#f59e0b');
    ctx.fillRect(22.3, masterY - 1.0, 2.0, 2.0);

    // 5 枚雾化喷头红绿双色指示灯
    BUFFER_DECON_LIQ_NOZZLE_XS.forEach(nx => {
        const ledX = nx + 4.9;
        const yRed = wallY + dir * 10.2;
        const yGreen = wallY + dir * 12.6;
        drawNozzleDualIndicatorLamps(ctx, ledX, yRed, yGreen, isSpraying, isDone);
    });

    ctx.restore();
}

function getBufferDeconLiquidNozzles(cx, cy, angle, isNorth, getCorridor) {
    const sideTag = isNorth ? 'N' : 'S';
    return buildCorridorPropBox(
        cx, cy, angle, 98, 26, false,
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
// - 全新机械转轮锁+双生物识别(掌纹/虹膜)设计，绝不沿用旧 heavy_auto_door 样式
// - 描边主用 0.4–1.0；>1.5 仅作深色结构打底且必叠 ~0.8 倒角高光；严禁 >=2.0 轮廓线
// - 4倍超采样(SS=4)离屏分件精灵 + 实时读取 openProgress / wheelAngle / isLocked
// =========================================================================
function createCorridorDoorSprite(logicalW, logicalH, drawFn) {
    const SS = 4;
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
    // sideSign: +1 = East face (+px), -1 = West face (-px)
    // 位于北侧墙垛肩部 px: [8.2..19.8], py: [-59.5..-35.5]
    const cx = sideSign * 14.0;
    const cy = -47.5;
    const bw = 11.6;
    const bh = 24.0;
    const x0 = cx - bw / 2;
    const y0 = cy - bh / 2;

    // [零件1] 地面与墙肩投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(x0 + sideSign * 1.2 - 0.8, y0 + 1.4, bw + 1.6, bh + 1.6);

    // [零件2] 装甲线缆导管 + 固定底法兰板 (4颗铆钉嵌入门垛)
    const conduitEndX = sideSign * 6.8;
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5.0);
    ctx.lineTo(conduitEndX, cy - 5.0);
    ctx.moveTo(cx, cy + 5.0);
    ctx.lineTo(conduitEndX, cy + 5.0);
    ctx.stroke();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5.0);
    ctx.lineTo(conduitEndX, cy - 5.0);
    ctx.moveTo(cx, cy + 5.0);
    ctx.lineTo(conduitEndX, cy + 5.0);
    ctx.stroke();

    // [零件3] 主体倾斜刷纹钢制识别终端外壳 (1.6 深色结构打底 + 0.85 翡翠倒角高光)
    const bodyGrad = ctx.createLinearGradient(x0, y0, x0 + bw, y0 + bh);
    bodyGrad.addColorStop(0, '#364d54');
    bodyGrad.addColorStop(0.5, '#273a40');
    bodyGrad.addColorStop(1, '#19262a');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x0, y0, bw, bh);

    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x0, y0, bw, bh);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(x0, y0, bw, bh);

    // 上左高光与底角加固铆钉
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.40)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x0 + 0.8, y0 + bh - 0.8);
    ctx.lineTo(x0 + 0.8, y0 + 0.8);
    ctx.lineTo(x0 + bw - 0.8, y0 + 0.8);
    ctx.stroke();

    [[x0 + 1.5, y0 + 1.5], [x0 + bw - 1.5, y0 + 1.5], [x0 + 1.5, y0 + bh - 1.5], [x0 + bw - 1.5, y0 + bh - 1.5]].forEach(([rx, ry]) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(rx, ry, 0.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // [零件4] 顶部微识别状态标题槽 (BIO-ID)
    ctx.fillStyle = '#061511';
    ctx.fillRect(x0 + 1.4, y0 + 1.3, bw - 2.8, 2.3);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(x0 + 1.4, y0 + 1.3, bw - 2.8, 2.3);

    // [零件5] 上半区：虹膜识别光学云台模组 (Optical Iris Scanner)
    const irisY = y0 + 8.0;
    // 防护遮光罩底座
    ctx.fillStyle = '#162428';
    ctx.fillRect(x0 + 1.4, y0 + 4.1, bw - 2.8, 7.8);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x0 + 1.4, y0 + 4.1, bw - 2.8, 7.8);

    // 阶梯式钛灰镜头环
    ctx.fillStyle = '#475f66';
    ctx.beginPath();
    ctx.arc(cx, irisY, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.stroke();

    // 光学蓝宝翡翠物镜深腔
    const lensGrad = ctx.createRadialGradient(cx - 0.5, irisY - 0.5, 0.3, cx, irisY, 2.8);
    lensGrad.addColorStop(0, '#34d399');
    lensGrad.addColorStop(0.38, '#0b4a38');
    lensGrad.addColorStop(1, '#03120e');
    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.arc(cx, irisY, 2.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 同心虹膜瞄准十字刻度环 + 四周 4 枚红外补光微二极管
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.72)';
    ctx.lineWidth = 0.42;
    ctx.beginPath();
    ctx.arc(cx, irisY, 1.45, 0, Math.PI * 2);
    ctx.moveTo(cx - 2.2, irisY);
    ctx.lineTo(cx - 0.8, irisY);
    ctx.moveTo(cx + 0.8, irisY);
    ctx.lineTo(cx + 2.2, irisY);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(cx - 0.75, irisY - 0.75, 0.42, 0, Math.PI * 2);
    ctx.fill();

    [[-2.9, -2.6], [2.9, -2.6], [-2.9, 2.6], [2.9, 2.6]].forEach(([dx, dy]) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx + dx, irisY + dy, 0.42, 0, Math.PI * 2);
        ctx.fill();
    });

    // 侧边微调焦旋钮
    ctx.fillStyle = '#7c5b36';
    ctx.fillRect(cx + sideSign * 4.5 - 0.6, irisY - 1.2, 1.2, 2.4);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.4;
    ctx.strokeRect(cx + sideSign * 4.5 - 0.6, irisY - 1.2, 1.2, 2.4);

    // [零件6] 下半区：掌纹静脉生物识别压板 (Palm-Vein Biometric Platen)
    const palmX = x0 + 1.6;
    const palmY = y0 + 13.0;
    const palmW = bw - 3.2;
    const palmH = 8.4;

    // 不锈钢压框
    ctx.fillStyle = '#33464d';
    ctx.fillRect(palmX - 0.4, palmY - 0.4, palmW + 0.8, palmH + 0.8);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(palmX - 0.4, palmY - 0.4, palmW + 0.8, palmH + 0.8);

    // 深色感应玻璃窗口
    const pGrad = ctx.createLinearGradient(palmX, palmY, palmX, palmY + palmH);
    pGrad.addColorStop(0, '#041c16');
    pGrad.addColorStop(0.5, '#082e24');
    pGrad.addColorStop(1, '#031510');
    ctx.fillStyle = pGrad;
    ctx.fillRect(palmX, palmY, palmW, palmH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(palmX, palmY, palmW, palmH);

    // 掌纹与五指轮廓微发光刻线
    const pcx = cx;
    const pcy = palmY + 5.2;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.80)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    // 掌心椭圆轮廓
    ctx.ellipse(pcx, pcy + 0.4, 2.1, 1.8, 0, 0, Math.PI * 2);
    // 四指 + 拇指掌纹线
    ctx.moveTo(pcx - 1.7, pcy - 1.0); ctx.lineTo(pcx - 2.0, palmY + 1.8);
    ctx.moveTo(pcx - 0.6, pcy - 1.3); ctx.lineTo(pcx - 0.6, palmY + 1.2);
    ctx.moveTo(pcx + 0.6, pcy - 1.3); ctx.lineTo(pcx + 0.6, palmY + 1.3);
    ctx.moveTo(pcx + 1.7, pcy - 0.9); ctx.lineTo(pcx + 2.0, palmY + 2.1);
    ctx.moveTo(pcx - 2.0, pcy + 0.6); ctx.lineTo(pcx - 3.1, pcy - 0.3);
    ctx.stroke();

    // 水平激光扫描基准线 + 四角 L 型对准框
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(palmX + 0.7, palmY + 4.0);
    ctx.lineTo(palmX + palmW - 0.7, palmY + 4.0);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(palmX + 0.6, palmY + 1.6); ctx.lineTo(palmX + 0.6, palmY + 0.6); ctx.lineTo(palmX + 1.8, palmY + 0.6);
    ctx.moveTo(palmX + palmW - 1.8, palmY + 0.6); ctx.lineTo(palmX + palmW - 0.6, palmY + 0.6); ctx.lineTo(palmX + palmW - 0.6, palmY + 1.6);
    ctx.stroke();
}

function drawPneumaticManifoldBoxStatic(ctx, sideSign) {
    // 南侧门垛气密气压联锁与泄压阀盒 px: [±8.2..±19.8], py: [+37.5..+59.5]
    const cx = sideSign * 14.0;
    const cy = 48.5;
    const bw = 11.6;
    const bh = 22.0;
    const x0 = cx - bw / 2;
    const y0 = cy - bh / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
    ctx.fillRect(x0 + sideSign * 1.1 - 0.7, y0 + 1.3, bw + 1.4, bh + 1.4);

    // 金属高压气动接头管
    const pEdge = sideSign * 6.8;
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3.0); ctx.lineTo(pEdge, cy - 3.0);
    ctx.moveTo(cx, cy + 4.5); ctx.lineTo(pEdge, cy + 4.5);
    ctx.stroke();
    ctx.strokeStyle = '#9c754d';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 3.0); ctx.lineTo(pEdge, cy - 3.0);
    ctx.moveTo(cx, cy + 4.5); ctx.lineTo(pEdge, cy + 4.5);
    ctx.stroke();

    // 钢箱主体
    const boxGrad = ctx.createLinearGradient(x0, y0, x0 + bw, y0 + bh);
    boxGrad.addColorStop(0, '#32464c');
    boxGrad.addColorStop(1, '#1a272b');
    ctx.fillStyle = boxGrad;
    ctx.fillRect(x0, y0, bw, bh);
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x0, y0, bw, bh);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x0, y0, bw, bh);

    // 波登管圆形气密压力表
    const gx = cx;
    const gy = y0 + 6.4;
    ctx.fillStyle = '#071512';
    ctx.beginPath();
    ctx.arc(gx, gy, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 压力刻度弧 + 指针
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(gx, gy, 2.3, Math.PI * 0.75, Math.PI * 1.85);
    ctx.stroke();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(gx, gy, 2.3, Math.PI * 1.85, Math.PI * 2.25);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 1.6, gy - 1.3);
    ctx.stroke();

    // 下部手动应急泄压拨杆阀
    const vx = cx;
    const vy = y0 + 15.6;
    ctx.fillStyle = '#1e2c30';
    ctx.fillRect(x0 + 1.8, vy - 3.6, bw - 3.6, 7.2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x0 + 1.8, vy - 3.6, bw - 3.6, 7.2);
    ctx.fillStyle = '#7c5b36';
    ctx.fillRect(vx - 3.2, vy - 1.0, 6.4, 2.0);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(vx - 3.2, vy - 1.0, 6.4, 2.0);
}

function drawDoorLeafHalf(ctx, isNorth) {
    // 单扇防爆门体: 宽 20 (px: -10..+10), 高 44 (py: -22..+22), 内端在 seamSign * 22
    const W = 20;
    const H = 44;
    const halfW = W / 2;
    const halfH = H / 2;
    const seamSign = isNorth ? 1 : -1; // North 门扇的合拢缝在 +22，South 门扇的合拢缝在 -22
    const outerSign = -seamSign;

    // [零件1] 门体侧面阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(-halfW - 1.4, -halfH, W + 2.8, H);

    // [零件2] 重型复合装甲门板主材 (深灰绿分层装甲渐变)
    const leafGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    leafGrad.addColorStop(0, '#1e302b');
    leafGrad.addColorStop(0.35, '#2d4740');
    leafGrad.addColorStop(0.65, '#35544b');
    leafGrad.addColorStop(1, '#1a2a25');
    ctx.fillStyle = leafGrad;
    ctx.fillRect(-halfW, -halfH, W, H);

    // 深色打底描边 + 0.85 翡翠倒角框
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-halfW, -halfH, W, H);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(-halfW, -halfH, W, H);

    // [零件3] 门扇内嵌加厚斜肋装甲加强板 + 沉头铆钉
    const ribY0 = isNorth ? -halfH + 4.0 : -halfH + 7.0;
    const ribH = 33.0;
    ctx.fillStyle = '#213630';
    ctx.fillRect(-halfW + 2.0, ribY0, W - 4.0, ribH);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-halfW + 2.0, ribY0, W - 4.0, ribH);

    // 对角防爆斜肋纹
    ctx.strokeStyle = '#475f57';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-halfW + 2.6, ribY0 + 1.5);
    ctx.lineTo(halfW - 2.6, ribY0 + ribH - 1.5);
    ctx.moveTo(halfW - 2.6, ribY0 + 1.5);
    ctx.lineTo(-halfW + 2.6, ribY0 + ribH - 1.5);
    ctx.stroke();

    // 8颗沉头锚钉
    [ribY0 + 2.2, ribY0 + ribH * 0.35, ribY0 + ribH * 0.65, ribY0 + ribH - 2.2].forEach(ry => {
        [-halfW + 3.2, halfW - 3.2].forEach(rx => {
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.arc(rx, ry, 0.55, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // [零件4] 垂直硬化钢死栓联动锁定杆 (贯穿门芯连接转轮与门框锁孔)
    const rodGrad = ctx.createLinearGradient(-2.0, 0, 2.0, 0);
    rodGrad.addColorStop(0, '#475569');
    rodGrad.addColorStop(0.5, '#cbd5e1');
    rodGrad.addColorStop(1, '#334155');
    ctx.fillStyle = rodGrad;
    ctx.fillRect(-1.8, -halfH + 1.0, 3.6, H - 2.0);
    ctx.strokeStyle = '#04090a';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-1.8, -halfH + 1.0, 3.6, H - 2.0);

    // 铜制死栓导向套筒
    const sleeveY = outerSign * 14.0;
    ctx.fillStyle = '#7c5b36';
    ctx.fillRect(-3.0, sleeveY - 2.0, 6.0, 4.0);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-3.0, sleeveY - 2.0, 6.0, 4.0);

    // [零件5] 小型栓接装甲防爆窥视狭缝 (带螺栓外框，区别于旧门青色大缝)
    const slitY = isNorth ? -6.5 : 2.5;
    ctx.fillStyle = '#182428';
    ctx.fillRect(-5.6, slitY, 11.2, 4.0);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.strokeRect(-5.6, slitY, 11.2, 4.0);
    ctx.fillStyle = '#072b21';
    ctx.fillRect(-4.2, slitY + 1.0, 8.4, 2.0);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.45;
    ctx.strokeRect(-4.2, slitY + 1.0, 8.4, 2.0);

    // [零件6] 合拢缝气密 EPDM 压缩胶条 + 互锁梯形钢铜啮合齿
    const seamY = seamSign * (halfH - 2.8);
    ctx.fillStyle = '#0a1210';
    ctx.fillRect(-halfW + 0.5, isNorth ? halfH - 3.6 : -halfH, W - 1.0, 3.6);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(-halfW + 1.0, isNorth ? halfH - 2.8 : -halfH + 2.8);
    ctx.lineTo(halfW - 1.0, isNorth ? halfH - 2.8 : -halfH + 2.8);
    ctx.stroke();

    // 互锁啮合齿 (North 凸起与 South 凸起交错)
    const toothXs = isNorth ? [-7.2, 3.2] : [-2.0, 7.2];
    toothXs.forEach(tx => {
        ctx.fillStyle = '#8b683e';
        ctx.fillRect(tx - 1.8, seamY - (isNorth ? 0.2 : -1.0), 3.6, 2.0);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(tx - 1.8, seamY - (isNorth ? 0.2 : -1.0), 3.6, 2.0);
    });

    // [零件7] 门沿东/西高压气密翻边条与反光高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(-halfW + 1.2, -halfH + 1.5, 3.5, H - 3.0);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-halfW + 1.5, -halfH + 2.0);
    ctx.lineTo(-halfW + 1.5, halfH - 2.0);
    ctx.stroke();
}

function drawMechanicalWheelLockSprite(ctx) {
    // 巨大机械转轮锁 (半径 R=14.5，直径 29px，显著跨出 20px 门体)
    // 分件至少 10 个独立零件，4层绘制
    // [零件1] 转轮底层环形阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.beginPath();
    ctx.arc(0.8, 1.0, 15.2, 0, Math.PI * 2);
    ctx.fill();

    // [零件2] 外围暖铜行星棘轮齿环 (12 枚机械齿，视觉辨识度极强)
    const gearR = 14.2;
    ctx.fillStyle = '#6f5232';
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
        const a0 = (i / 12) * Math.PI * 2 - 0.10;
        const a1 = (i / 12) * Math.PI * 2 + 0.10;
        const gx0 = Math.cos(a0) * gearR;
        const gy0 = Math.sin(a0) * gearR;
        const gx1 = Math.cos(a1) * gearR;
        const gy1 = Math.sin(a1) * gearR;
        ctx.moveTo(0, 0);
        ctx.lineTo(gx0, gy0);
        ctx.lineTo(gx1, gy1);
    }
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.fillStyle = '#8b683e';
        ctx.fillRect(11.8, -1.3, 2.8, 2.6);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.45;
        ctx.strokeRect(11.8, -1.3, 2.8, 2.6);
        ctx.restore();
    }

    // [零件3] 6 根径向锻造锥形辐条 (Shadow -> Steel -> Highlight)
    for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);

        ctx.strokeStyle = '#030807';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(3.5, 0);
        ctx.lineTo(12.6, 0);
        ctx.stroke();

        const spGrad = ctx.createLinearGradient(0, -1.2, 0, 1.2);
        spGrad.addColorStop(0, '#94a3b8');
        spGrad.addColorStop(0.5, '#526b73');
        spGrad.addColorStop(1, '#26353a');
        ctx.fillStyle = spGrad;
        ctx.beginPath();
        ctx.moveTo(3.2, -1.3);
        ctx.lineTo(12.4, -0.95);
        ctx.lineTo(12.4, 0.95);
        ctx.lineTo(3.2, 1.3);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(3.6, -0.8);
        ctx.lineTo(12.0, -0.6);
        ctx.stroke();
        ctx.restore();
    }

    // [零件4] 外圈铸钢主抓握手轮环 (R = 12.6, 环宽 2.6)
    ctx.strokeStyle = '#030807';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 13.7, 0, Math.PI * 2);
    ctx.stroke();

    // 双层环带填色：外圈暗钢 + 内圈亮倒角
    ctx.beginPath();
    ctx.arc(0, 0, 13.4, 0, Math.PI * 2);
    ctx.arc(0, 0, 10.7, 0, Math.PI * 2, true);
    const rimGrad = ctx.createLinearGradient(-13, -13, 13, 13);
    rimGrad.addColorStop(0, '#647d85');
    rimGrad.addColorStop(0.45, '#3b5057');
    rimGrad.addColorStop(1, '#1e2a2e');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(0, 0, 13.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, 12.6, -Math.PI * 0.85, Math.PI * 0.15);
    ctx.stroke();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, 10.7, 0, Math.PI * 2);
    ctx.stroke();

    // [零件5] 内圈加强扭力环 (R = 6.6)
    ctx.beginPath();
    ctx.arc(0, 0, 7.1, 0, Math.PI * 2);
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2, true);
    ctx.fillStyle = '#2d4147';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 7.1, 0, Math.PI * 2);
    ctx.stroke();

    // [零件6] 6 个外周滚花把手凸台 + 6 颗内环铜质六角锁栓
    for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const bx = Math.cos(ang) * 13.6;
        const by = Math.sin(ang) * 13.6;
        ctx.fillStyle = (i === 0) ? '#f59e0b' : '#4f6870';
        ctx.beginPath();
        ctx.arc(bx, by, 1.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = (i === 0) ? '#fde68a' : '#e2e8f0';
        ctx.lineWidth = 0.45;
        ctx.stroke();

        // 内环铜栓
        const ix = Math.cos(ang) * 6.3;
        const iy = Math.sin(ang) * 6.3;
        ctx.fillStyle = '#9c754d';
        ctx.beginPath();
        ctx.arc(ix, iy, 0.75, 0, Math.PI * 2);
        ctx.fill();
    }

    // [零件7] 0号辐条琥珀转动方向标尺块 (确保 wheelAngle 转动清晰可见)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(7.4, -0.75, 3.0, 1.5);

    // [零件8] 中央阶梯棘轮轴套 + 铜制锁紧母 + 六角中心轴销
    ctx.fillStyle = '#1b282c';
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.fillStyle = '#8b683e';
    ctx.beginPath();
    ctx.arc(0, 0, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 中心六角轴头
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const hx = Math.cos(a) * 1.25;
        const hy = Math.sin(a) * 1.25;
        if (k === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
}

function ensureAirtightBlastDoorSprites() {
    if (window.__airtightDoorSpritesV1) return window.__airtightDoorSpritesV1;

    // 1. 地面不锈钢气密门槛导轨槽 (底层，门扇滑动其上)
    const sillSprite = createCorridorDoorSprite(36, 128, (ctx) => {
        // 地面投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(-14.5, -45, 29, 90);

        // 东西倾斜防滑不锈钢门槛坡板 (26 x 88)
        const sillGrad = ctx.createLinearGradient(-13, 0, 13, 0);
        sillGrad.addColorStop(0, '#203136');
        sillGrad.addColorStop(0.25, '#3b535b');
        sillGrad.addColorStop(0.5, '#19262a');
        sillGrad.addColorStop(0.75, '#3b535b');
        sillGrad.addColorStop(1, '#203136');
        ctx.fillStyle = sillGrad;
        ctx.fillRect(-13, -44, 26, 88);

        ctx.strokeStyle = '#030807';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-13, -44, 26, 88);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-13, -44, 26, 88);

        // 中央气密锁沟槽 + 翡翠微导引线
        ctx.fillStyle = '#07120f';
        ctx.fillRect(-4.0, -43, 8.0, 86);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(-4.0, -43, 8.0, 86);

        // 门槛横向防滑压纹
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.28)';
        ctx.lineWidth = 0.55;
        for (let ty = -40; ty <= 40; ty += 5.0) {
            ctx.beginPath();
            ctx.moveTo(-11.5, ty);
            ctx.lineTo(-5.2, ty);
            ctx.moveTo(5.2, ty);
            ctx.lineTo(11.5, ty);
            ctx.stroke();
        }
    });

    // 2. 上层门框墙垛收纳舱 + 东西两侧生物识别与气密阀组 (绘制在门扇之上形成真实门兜遮挡)
    const housingSprite = createCorridorDoorSprite(48, 132, (ctx) => {
        // 绘制南北两侧重型门垛收纳壳体 (py: -62..-43 与 +43..+62)
        [-1, 1].forEach(ySign => {
            const jy = (ySign < 0) ? -62 : 43;
            const jh = 19;

            // 外围投影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.fillRect(-9.5, jy - (ySign < 0 ? 0.5 : 1.0), 19.0, jh + 1.5);

            // 门垛主体装甲壳 (16 x 19)
            const jGrad = ctx.createLinearGradient(-8, jy, 8, jy + jh);
            jGrad.addColorStop(0, '#243832');
            jGrad.addColorStop(0.5, '#345249');
            jGrad.addColorStop(1, '#1a2b26');
            ctx.fillStyle = jGrad;
            ctx.fillRect(-8.5, jy, 17.0, jh);

            ctx.strokeStyle = '#030807';
            ctx.lineWidth = 1.6;
            ctx.strokeRect(-8.5, jy, 17.0, jh);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 0.85;
            ctx.strokeRect(-8.5, jy, 17.0, jh);

            // 门扇收纳槽防撞压口唇边 (内侧朝门洞)
            const lipY = (ySign < 0) ? (jy + jh - 3.2) : jy;
            ctx.fillStyle = '#475f66';
            ctx.fillRect(-8.0, lipY, 16.0, 3.2);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 0.55;
            ctx.strokeRect(-8.0, lipY, 16.0, 3.2);

            // 门垛角部琥珀警示角标 + 4颗重载固定地脚栓
            const markY = (ySign < 0) ? (jy + jh - 5.2) : (jy + 3.6);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-7.6, markY, 2.2, 1.6);
            ctx.fillRect(5.4, markY, 2.2, 1.6);

            [jy + 4.5, jy + jh - 5.5].forEach(by => {
                [-5.5, 5.5].forEach(bx => {
                    ctx.fillStyle = '#0a1411';
                    ctx.beginPath(); ctx.arc(bx, by, 1.3, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#cbd5e1';
                    ctx.beginPath(); ctx.arc(bx - 0.2, by - 0.2, 0.7, 0, Math.PI * 2); ctx.fill();
                });
            });

            // 顶部中央气密死栓锁舌指示铭牌窗
            ctx.fillStyle = '#071b15';
            ctx.fillRect(-3.6, jy + 7.2, 7.2, 4.6);
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-3.6, jy + 7.2, 7.2, 4.6);
        });

        // 北侧门垛两侧 (+px 东侧 & -px 西侧)：掌纹+虹膜生物识别装置
        drawBiometricTerminalStatic(ctx, 1);
        drawBiometricTerminalStatic(ctx, -1);

        // 南侧门垛两侧 (+px 东侧 & -px 西侧)：气密联锁气压表与泄压阀箱
        drawPneumaticManifoldBoxStatic(ctx, 1);
        drawPneumaticManifoldBoxStatic(ctx, -1);
    });

    // 3. 北门扇 & 南门扇 (4倍超采样独立精灵)
    const leafNorthSprite = createCorridorDoorSprite(28, 52, (ctx) => drawDoorLeafHalf(ctx, true));
    const leafSouthSprite = createCorridorDoorSprite(28, 52, (ctx) => drawDoorLeafHalf(ctx, false));

    // 4. 巨大机械转轮锁 (4倍超采样独立旋转精灵)
    const wheelSprite = createCorridorDoorSprite(38, 38, drawMechanicalWheelLockSprite);

    window.__airtightDoorSpritesV1 = {
        sillSprite,
        housingSprite,
        leafNorthSprite,
        leafSouthSprite,
        wheelSprite
    };
    return window.__airtightDoorSpritesV1;
}

function drawAirtightBlastDoor(ctx, door) {
    if (!door) return;
    const sprites = ensureAirtightBlastDoorSprites();
    const openProg = Math.max(0, Math.min(1, door.openProgress !== undefined ? door.openProgress : 0));
    const wheelAng = door.wheelAngle || 0;
    const isLocked = !!door.isLocked;

    ctx.save();
    ctx.translate(door.cx, door.cy);
    ctx.rotate(door.angle);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. 底层不锈钢气密门槛与轨道槽
    const sill = sprites.sillSprite;
    ctx.drawImage(sill.canvas, -sill.w / 2, -sill.h / 2, sill.w, sill.h);

    // 2. 滑动复合装甲门扇 + 机械旋转转轮锁 (裁剪在通道墙体范围 py: -60..+60 内)
    const slideOffset = 41.0 * openProg;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-19, -60, 38, 120);
    ctx.clip();

    const ln = sprites.leafNorthSprite;
    ctx.drawImage(ln.canvas, -ln.w / 2, -22 - slideOffset - ln.h / 2, ln.w, ln.h);

    const ls = sprites.leafSouthSprite;
    ctx.drawImage(ls.canvas, -ls.w / 2, 22 + slideOffset - ls.h / 2, ls.w, ls.h);

    // 机械转轮锁：闭合时居中(0,0)，开启时随北门扇平滑缩入北侧门兜且按 wheelAngle 旋转
    const wh = sprites.wheelSprite;
    const wheelY = -43.5 * openProg;
    ctx.save();
    ctx.translate(0, wheelY);
    ctx.rotate(wheelAng);
    ctx.drawImage(wh.canvas, -wh.w / 2, -wh.h / 2, wh.w, wh.h);
    ctx.restore();

    ctx.restore();

    // 3. 顶层南北重型门兜、生物识别终端与气密阀盒
    const hsg = sprites.housingSprite;
    ctx.drawImage(hsg.canvas, -hsg.w / 2, -hsg.h / 2, hsg.w, hsg.h);

    // 4. 状态指示灯 (严格读取 isLocked 与 openProgress，静止无动画，不写开门逻辑)
    const ledColor = isLocked ? '#ef4444' : (openProg > 0.05 ? '#10b981' : '#f59e0b');
    const ledRim = isLocked ? '#fca5a5' : (openProg > 0.05 ? '#a7f3d0' : '#fde68a');

    // 南北门垛中心锁状态小灯
    [-52.5, 52.5].forEach(ly => {
        ctx.fillStyle = ledColor;
        ctx.fillRect(-2.2, ly - 1.1, 4.4, 2.2);
        ctx.strokeStyle = ledRim;
        ctx.lineWidth = 0.45;
        ctx.strokeRect(-2.2, ly - 1.1, 4.4, 2.2);
    });

    // 东西两侧生物识别终端顶部状态条 (y0 + 1.3 -> -58.2)
    [-1, 1].forEach(sideSign => {
        const bx = sideSign * 14.0;
        ctx.fillStyle = ledColor;
        ctx.fillRect(bx - 3.6, -57.9, 7.2, 1.7);
        ctx.fillStyle = ledRim;
        ctx.fillRect(bx - 2.6, -57.5, 2.2, 0.7);
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

    // 门体碰撞与视线遮挡多边形 (覆盖中央 92px 门洞，闭合时阻挡通行与视野，开启后 engine.js 置 noCollision=true)
    const points = [
        rotPt(-10, -46),
        rotPt(10, -46),
        rotPt(10, 46),
        rotPt(-10, 46)
    ];

    // 视锥剔除包围盒 (包含 42x126 完整门框+生物识别终端)
    const boundPts = [
        rotPt(-21, -63),
        rotPt(21, -63),
        rotPt(21, 63),
        rotPt(-21, 63)
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
        label: id === 'airtight_door_1' ? 'AIRTIGHT BLAST DOOR 1' : 'AIRTIGHT BLAST DOOR 2',
        displayName: id === 'airtight_door_1' ? 'AIRLOCK BLAST GATE 01' : 'AIRLOCK BLAST GATE 02',
        hideLabel: true,
        draw: function(ctx) {
            drawAirtightBlastDoor(ctx, this);
        }
    };
}

// =========================================================================
// 斜向缓冲通道外壳（仅外墙/地坪；内部设施已删待重铺，移植自清理副本 2026-11-13）
// =========================================================================
function drawBufferCorridorSystem(ctx, corridor) {
    const L = corridor.length || 720; // 通道总长 720px
    const W = corridor.width || 122;  // 通道净宽 122px
    const halfL = L / 2; // 360px
    const halfW = W / 2; // 61px

    ctx.save();
    ctx.translate(corridor.cx, corridor.cy);
    ctx.rotate(corridor.angle);

    // =========================================================
    // 1. 缓冲区写实重型金属地坪与高能警戒线
    // 更衣区: x: -360 ~ 0
    // 消毒区: x: 0 ~ +360
    // =========================================================
    // 更衣区地坪 (Class-100 Cleanroom 防静电环氧科技地坪)
    const gradDress = ctx.createLinearGradient(-halfL, 0, 0, 0);
    gradDress.addColorStop(0, '#03140e');
    gradDress.addColorStop(0.5, '#072b21');
    gradDress.addColorStop(1, '#03140e');
    ctx.fillStyle = gradDress;
    ctx.fillRect(-halfL, -halfW, halfL, W);

    // 消毒区地坪 (316L 高耐磨不锈钢工业地坪)
    const gradDecon = ctx.createLinearGradient(0, 0, halfL, 0);
    gradDecon.addColorStop(0, '#02120e');
    gradDecon.addColorStop(0.5, '#06281e');
    gradDecon.addColorStop(1, '#02120e');
    ctx.fillStyle = gradDecon;
    ctx.fillRect(0, -halfW, halfL, W);

    // 导静电防滑网格与不锈钢焊缝
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.lineWidth = 1;
    for (let lx = -halfL; lx <= halfL; lx += 32) {
        ctx.beginPath(); ctx.moveTo(lx, -halfW); ctx.lineTo(lx, halfW); ctx.stroke();
    }
    for (let ly = -halfW; ly <= halfW; ly += 20.3) {
        ctx.beginPath(); ctx.moveTo(-halfL, ly); ctx.lineTo(halfL, ly); ctx.stroke();
    }

    // 两侧黑黄高光防滑斜纹警戒带 (High-Visibility Safety Hazard Bands)
    const drawHazardStripe = (startY) => {
        ctx.save();
        ctx.fillStyle = '#02120e';
        ctx.fillRect(-halfL, startY, L, 6);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.82)';
        for (let hx = -halfL; hx < halfL; hx += 16) {
            ctx.beginPath();
            ctx.moveTo(hx, startY + 6);
            ctx.lineTo(hx + 8, startY);
            ctx.lineTo(hx + 12, startY);
            ctx.lineTo(hx + 4, startY + 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };
    drawHazardStripe(-halfW);
    drawHazardStripe(halfW - 6);


    ctx.restore();
}
const LEVEL_7_TEST = {
    id: "level7_test",
    name: "第 8 关 · 测试关卡",
    nameEn: "Level 08 · Test Sandbox",
    themeColor: "#022c22",
    gridColor: "rgba(16, 185, 129, 0.22)",
    accentColor: "#10b981",
    playerStart: { x: 1600, y: 1835 },

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

            // H. 缓冲区通道倾斜重装甲北墙与南墙（2026-11-15 延长至 560px，确保外侧气密门2完全收入通道内）
            {
                type: 'poly_wall',
                points: [
                    { x: 1110, y: 860 },
                    { x: 1107, y: 846 },
                    { x: 556, y: 947 },
                    { x: 559, y: 961 }
                ],
                label: 'BUFFER CORRIDOR NORTH ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1132, y: 980 },
                    { x: 1135, y: 994 },
                    { x: 584, y: 1095 },
                    { x: 581, y: 1081 }
                ],
                label: 'BUFFER CORRIDOR SOUTH ARMORED WALL',
                hideLabel: true
            },
            // H2. 缓冲区两扇气密防爆门南北门洞墙垛刚体碰撞 (留出 86px 净门洞，draw 为空避免遮盖高精度门兜与生物识别终端)
            ...[
                { name: 'DOOR 1', cx: 845.59, cy: 970.49 },
                { name: 'DOOR 2', cx: 593.79, cy: 1016.66 }
            ].flatMap(d => {
                const ang = 2.96027 - Math.PI;
                const ca = Math.cos(ang), sa = Math.sin(ang);
                const makeJamb = (y1, y2, tag) => ({
                    type: 'poly_wall',
                    points: [
                        { x: -8, y: y1 },
                        { x: 8, y: y1 },
                        { x: 8, y: y2 },
                        { x: -8, y: y2 }
                    ].map(pt => ({
                        x: +(d.cx + pt.x * ca - pt.y * sa).toFixed(1),
                        y: +(d.cy + pt.x * sa + pt.y * ca).toFixed(1)
                    })),
                    label: `BUFFER ${d.name} ${tag} BULKHEAD JAMB`,
                    hideLabel: true,
                    draw: () => {}
                });
                return [
                    makeJamb(-61, -43, 'NORTH'),
                    makeJamb(43, 61, 'SOUTH')
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

                    // 4A. 西侧三角房间大圆弧
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.moveTo(1142, 985);
                    ctx.bezierCurveTo(1010, 1070, 1010, 1330, 1215, 1415);
                    ctx.stroke();

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
            // 6. 服务器集群 ×1 (移植自 Level 8，2026-11-05)
            // 房间最底下贴墙，scale 0.85
            // =========================================================
            getServerCluster(1600, 1900, 0, 0.85, 'L7 SERVER CLUSTER'),
            // 两侧斜墙各一个，贴墙旋转（2026-11-05）
            getServerCluster(1252, 1200, 4.5350, 0.85, 'L7 LEFT SERVER'),
            getServerCluster(1948, 1200, 1.7480, 0.85, 'L7 RIGHT SERVER'),
            // 7. 斜向缓冲通道系统对象（2026-11-15 延长至 560px，cx/cy 相应西移至 (845.59, 970.49)）
            {
                type: 'buffer_corridor_system',
                cx: 845.59,
                cy: 970.49,
                length: 560,
                width: 122,
                angle: 2.96027,
                airSpraying: false,
                liquidSpraying: false,
                sprayState: 'idle', // 'idle' | 'air_spray' | 'liquid_spray' | 'done'
                sprayTimer: 0,
                noCollision: true,
                hideLabel: true,
                draw: function(ctx) {
                    drawBufferCorridorSystem(ctx, this);
                }
            },
            // 8. 缓冲通道 · 更衣区内部精密道具 (以挪动为主重新规划空间，原尺寸不变；距内门 16px、距门1识别终端 22px)
            getBufferDressingLockers(1042.43, 890.69, 2.96027 - Math.PI),
            getBufferDressingMonitor(924.03, 910.36, 2.96027 - Math.PI),
            getBufferDressingSink(1072.78, 973.07, 2.96027 - Math.PI),
            getBufferDressingSuitRack(955.55, 993.54, 2.96027 - Math.PI)
        ];

        // 9. 缓冲通道 · 消毒区内部静态精密道具 (以挪动为主重新规划空间，原尺寸不变；两组喷头隔离 10px，距门1/门2终端各留 8px)
        // 喷头红绿指示灯直接读取 bufferCorridorObj 的 airSpraying / liquidSpraying / sprayState 字段
        const bufferCorridorObj = props.find(p => p.type === 'buffer_corridor_system');
        const getCorridorRef = () => bufferCorridorObj;
        props.push(
            getBufferDeconGrating(669.52, 1002.77, 2.96027 - Math.PI),
            getBufferDeconAirNozzles(764.69, 939.57, 2.96027 - Math.PI, true, getCorridorRef),
            getBufferDeconAirNozzles(780.92, 1028.10, 2.96027 - Math.PI, false, getCorridorRef),
            getBufferDeconLiquidNozzles(661.41, 958.51, 2.96027 - Math.PI, true, getCorridorRef),
            getBufferDeconLiquidNozzles(677.64, 1047.03, 2.96027 - Math.PI, false, getCorridorRef),
            // 10. 缓冲通道两扇全新机械转轮气密防爆门 (门1在交界 s=280；门2收进 s=536，整体完全落在 560px 通道外墙内)
            getAirtightBlastDoor('airtight_door_1', 845.59, 970.49, 2.96027 - Math.PI, false),
            getAirtightBlastDoor('airtight_door_2', 593.79, 1016.66, 2.96027 - Math.PI, true)
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
