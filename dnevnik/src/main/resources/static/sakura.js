document.addEventListener("DOMContentLoaded", () => {
    const oldCanvas = document.getElementById("sakura-canvas");
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement("canvas");
    canvas.id = "sakura-canvas";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let width, height;
    let treeCanvas;
    let blossomPoints = [];
    let petals = [];

    let seed = 42;
    function rand() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        treeCanvas = document.createElement("canvas");
        treeCanvas.width = width;
        treeCanvas.height = height;
        const tCtx = treeCanvas.getContext("2d");

        blossomPoints = [];
        seed = 108; // база для красивой формы веток

        drawSakuraTree(tCtx);

        // количество падающих лепестков для густоты
        petals = [];
        const petalCount = 60;
        for (let i = 0; i < petalCount; i++) {
            petals.push(createPetal(true));
        }
    }

    // Функция рисования изогнутого сегмента ветки
    function drawSegment(ctx, x1, y1, x2, y2, cx, cy, w1, w2) {
        const steps = 24;
        for (let i = 0; i < steps; i++) {
            const t1 = i / steps;
            const t2 = (i + 1) / steps;

            const p1x = (1 - t1) * (1 - t1) * x1 + 2 * (1 - t1) * t1 * cx + t1 * t1 * x2;
            const p1y = (1 - t1) * (1 - t1) * y1 + 2 * (1 - t1) * t1 * cy + t1 * t1 * y2;

            const p2x = (1 - t2) * (1 - t2) * x1 + 2 * (1 - t2) * t2 * cx + t2 * t2 * x2;
            const p2y = (1 - t2) * (1 - t2) * y1 + 2 * (1 - t2) * t2 * cy + t2 * t2 * y2;

            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.lineWidth = w1 + (w2 - w1) * t1;
            ctx.strokeStyle = "#382242"; // Насыщенный темно-сливовый оттенок коры
            ctx.lineCap = "round";
            ctx.stroke();
        }
    }

    // Рекурсивные ветки с большим количеством ответвлений
    function growSubBranches(ctx, x, y, len, angle, w, depth) {
        if (depth <= 0) return;

        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        const cx = (x + ex) / 2 + (rand() - 0.5) * len * 0.4;
        const cy = (y + ey) / 2 + (rand() - 0.5) * len * 0.4;

        drawSegment(ctx, x, y, ex, ey, cx, cy, w, Math.max(0.9, w * 0.65));

        if (depth <= 3) {
            // Больше цветов на концах веток
            drawBlossomCluster(ctx, ex, ey, depth === 1 ? 18 : 10);
            blossomPoints.push({ x: ex, y: ey });
        }

        const subCount = depth === 4 ? 4 : 3;
        for (let i = 0; i < subCount; i++) {
            const spread = (rand() - 0.5) * 1.25;
            const newLen = len * (0.68 + rand() * 0.22);
            growSubBranches(ctx, ex, ey, newLen, angle + spread, w * 0.65, depth - 1);
        }
    }

    //  гроздья цветов
    function drawBlossomCluster(ctx, x, y, count) {
        for (let i = 0; i < count; i++) {
            const bx = x + (rand() - 0.5) * 55;
            const by = y + (rand() - 0.5) * 45;
            const size = 3 + rand() * 5.5;

            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(rand() * Math.PI * 2);

            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.65, 0, 0, Math.PI * 2);

            const colors = [
                "rgba(255, 183, 197, 0.65)", // Нежно-розовый
                "rgba(244, 143, 177, 0.55)", // Насыщенный сакуровый
                "rgba(216, 180, 254, 0.55)", // Лавандовый в тон темы
                "rgba(255, 228, 236, 0.75)"  // Светлый блик
            ];
            ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
            ctx.fill();
            ctx.restore();
        }
    }

    function drawSakuraTree(ctx) {
        // Опорные точки: старт из правого нижнего угла -> вверх по правому краю -> влево вдоль хедера
        const p0 = { x: width + 20, y: height + 25 };
        const p1 = { x: width * 0.92, y: height * 0.62 };
        const p2 = { x: width * 0.88, y: height * 0.32 };
        const p3 = { x: width * 0.78, y: height * 0.12 };
        const p4 = { x: width * 0.50, y: height * 0.07 };
        const p5 = { x: width * 0.20, y: height * 0.06 };

        // ствол из правого нижнего угла вверх
        drawSegment(ctx, p0.x, p0.y, p1.x, p1.y, width * 0.97, height * 0.78, 45, 30);
        drawSegment(ctx, p1.x, p1.y, p2.x, p2.y, width * 0.95, height * 0.46, 30, 20);
        drawSegment(ctx, p2.x, p2.y, p3.x, p3.y, width * 0.88, height * 0.20, 20, 13);

        //  массивная ветвь налево вдоль всей верхней панели (хедера)
        drawSegment(ctx, p3.x, p3.y, p4.x, p4.y, width * 0.66, height * 0.08, 13, 7);
        drawSegment(ctx, p4.x, p4.y, p5.x, p5.y, width * 0.35, height * 0.05, 7, 3);

        //  Дополнительные ветки,
        growSubBranches(ctx, p1.x, p1.y, width * 0.12, Math.PI * 1.10, 14, 4);
        growSubBranches(ctx, p2.x, p2.y, width * 0.14, Math.PI * 1.02, 12, 4);
        growSubBranches(ctx, p3.x, p3.y, width * 0.10, Math.PI * 0.94, 10, 4);

        // Ветки, свисающие вдоль верхней панели управления
        growSubBranches(ctx, p4.x, p4.y, width * 0.08, Math.PI * 0.86, 7, 4);
        growSubBranches(ctx, p5.x, p5.y, width * 0.06, Math.PI * 0.90, 5, 3);

        // Густая крона в правом верхнем углу (возле кнопки Выйти)
        growSubBranches(ctx, p3.x, p3.y, width * 0.09, Math.PI * 0.65, 9, 4);
    }

    function createPetal(initial = false) {
        let startX, startY;
        if (blossomPoints.length > 0 && Math.random() < 0.88) {
            const pt = blossomPoints[Math.floor(Math.random() * blossomPoints.length)];
            startX = pt.x + (Math.random() - 0.5) * 50;
            startY = pt.y + (Math.random() - 0.5) * 45;
        } else {
            startX = width * 0.2 + Math.random() * width * 0.8;
            startY = -20;
        }

        if (initial) {
            startY = Math.random() * height;
            startX = width * 0.1 + Math.random() * width * 0.9;
        }

       return {
                  x: startX,
                  y: startY,
                  size: 4 + Math.random() * 4.5,
                  speedY: 0.12 + Math.random() * 0.25,     // скорость падения
                  speedX: -0.15 - Math.random() * 0.25,   // дрейф
                  angle: Math.random() * Math.PI * 2,
                  spinSpeed: (Math.random() - 0.5) * 0.01, //  вращение
                  swayAmp: 0.15 + Math.random() * 0.35,   // амплитуда
                  swayFreq: 0.006 + Math.random() * 0.01, //качание
                  time: Math.random() * 100,
                  opacity: 0.4 + Math.random() * 0.45,
                  color: Math.random() > 0.3 ? "#ffb7c5" : "#e2b8ff"
              };
          }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Отрисовка фонового дерева
        ctx.drawImage(treeCanvas, 0, 0);

        // Отрисовка и движение лепестков
        for (let i = 0; i < petals.length; i++) {
            const p = petals[i];
            p.time += 1;
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.time * p.swayFreq) * p.swayAmp;
            p.angle += p.spinSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.globalAlpha = p.opacity;

            // Форма лепестка
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.8, p.size * 0.9, p.size * 0.6, 0, p.size);
            ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.6, -p.size * 0.9, -p.size * 0.8, 0, -p.size);
            ctx.fillStyle = p.color;
            ctx.fill();

            ctx.restore();

            if (p.y > height + 20 || p.x < -30) {
                petals[i] = createPetal(false);
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", init);
    init();
    animate();
});