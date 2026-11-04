(() => {
  'use strict';

  const app = (window.EscolBarber = window.EscolBarber || {});
  let isInitialized = false;

  const TOTAL_FRAMES = 108;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (min, max, value) => {
    const x = clamp((value - min) / (max - min), 0, 1);
    return x * x * (3 - 2 * x);
  };

  /* ── Textura Procedural de Couro em Matelassê Diamante ───────────────── */
  const createQuiltedLeatherTexture = (THREE) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    const step = 64;
    for (let y = -step; y <= 512 + step; y += step) {
      for (let x = -step; x <= 512 + step; x += step) {
        const cx = x + ((y / step) % 2 === 0 ? 0 : step / 2);
        const cy = y;
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, step * 0.55);
        grad.addColorStop(0, '#d8d8d8');
        grad.addColorStop(0.55, '#969696');
        grad.addColorStop(0.88, '#424242');
        grad.addColorStop(1, '#262626');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - step * 0.5);
        ctx.lineTo(cx + step * 0.5, cy);
        ctx.lineTo(cx, cy + step * 0.5);
        ctx.lineTo(cx - step * 0.5, cy);
        ctx.closePath();
        ctx.fill();

        // Botão profundo do capitonê
        ctx.fillStyle = '#181818';
        ctx.beginPath();
        ctx.arc(cx, cy - step * 0.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.2, 2.2);
    return texture;
  };

  /* ── Mapa de Ambiente de Estúdio (Reflexos Metálicos e Couro) ────────── */
  const createStudioEnvironment = (THREE, renderer) => {
    if (!THREE.PMREMGenerator) return null;
    try {
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x090909);

      const lightGeo = new THREE.PlaneGeometry(10, 4);
      const topLight = new THREE.Mesh(
        lightGeo,
        new THREE.MeshBasicMaterial({ color: 0xfff5e6, side: THREE.DoubleSide })
      );
      topLight.position.set(0, 7, 2);
      topLight.rotation.x = Math.PI / 2;
      envScene.add(topLight);

      const bronzeStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 6),
        new THREE.MeshBasicMaterial({ color: 0xd8a874, side: THREE.DoubleSide })
      );
      bronzeStrip.position.set(6, 2, 3);
      bronzeStrip.lookAt(0, 0, 0);
      envScene.add(bronzeStrip);

      const coolRimStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 6),
        new THREE.MeshBasicMaterial({ color: 0xdce6f2, side: THREE.DoubleSide })
      );
      coolRimStrip.position.set(-6, 3, -4);
      coolRimStrip.lookAt(0, 0, 0);
      envScene.add(coolRimStrip);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envMap = pmrem.fromScene(envScene, 0.04).texture;
      pmrem.dispose();
      return envMap;
    } catch {
      return null;
    }
  };

  /* ── Construção do Modelo 3D Articulado da Cadeira de Barbeiro ───────── */
  const buildBarberChair3D = (THREE) => {
    const root = new THREE.Group();
    const quiltedTex = createQuiltedLeatherTexture(THREE);

    const leatherQuilted = new THREE.MeshStandardMaterial({
      color: 0x151413,
      roughness: 0.36,
      metalness: 0.08,
      bumpMap: quiltedTex,
      bumpScale: 0.026,
    });

    const leatherSmooth = new THREE.MeshStandardMaterial({
      color: 0x181715,
      roughness: 0.32,
      metalness: 0.1,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf4f5f7,
      metalness: 0.96,
      roughness: 0.09,
    });

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xc89d6c,
      metalness: 0.88,
      roughness: 0.22,
    });

    const darkCastMat = new THREE.MeshStandardMaterial({
      color: 0x201f1d,
      metalness: 0.72,
      roughness: 0.36,
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d0c,
      roughness: 0.84,
      metalness: 0.06,
    });

    // 1. Base Circular Hidráulica de Piso (Fixa na rotação, gira junto no showcase 360)
    const chairTurnGroup = new THREE.Group();
    root.add(chairTurnGroup);

    const basePoints = [
      new THREE.Vector2(0.0, -1.36),
      new THREE.Vector2(1.06, -1.36),
      new THREE.Vector2(1.04, -1.31),
      new THREE.Vector2(0.92, -1.27),
      new THREE.Vector2(0.76, -1.22),
      new THREE.Vector2(0.42, -1.14),
      new THREE.Vector2(0.24, -1.04),
      new THREE.Vector2(0.2, -0.82),
      new THREE.Vector2(0.0, -0.82),
    ];
    const baseDisc = new THREE.Mesh(new THREE.LatheGeometry(basePoints, 64), chromeMat);
    chairTurnGroup.add(baseDisc);

    // Anel de borracha na base e colar em bronze
    const baseRubberRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.03, 0.032, 16, 64),
      rubberMat
    );
    baseRubberRing.rotation.x = Math.PI / 2;
    baseRubberRing.position.y = -1.34;
    chairTurnGroup.add(baseRubberRing);

    const baseBronzeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.024, 16, 48),
      bronzeMat
    );
    baseBronzeRing.rotation.x = Math.PI / 2;
    baseBronzeRing.position.y = -1.14;
    chairTurnGroup.add(baseBronzeRing);

    // Torre cilíndrica inferior
    const lowerColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.23, 0.46, 36),
      darkCastMat
    );
    lowerColumn.position.y = -0.92;
    chairTurnGroup.add(lowerColumn);

    const columnBronzeCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.205, 0.205, 0.05, 36),
      bronzeMat
    );
    columnBronzeCap.position.y = -0.7;
    chairTurnGroup.add(columnBronzeCap);

    // Pedal de bombeamento hidráulico traseiro/lateral
    const pedalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.86, -0.14),
      new THREE.Vector3(-0.22, -0.96, -0.45),
      new THREE.Vector3(-0.3, -1.06, -0.68),
    ]);
    const pedalArm = new THREE.Mesh(
      new THREE.TubeGeometry(pedalCurve, 20, 0.026, 12, false),
      chromeMat
    );
    chairTurnGroup.add(pedalArm);

    const pedalPad = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 24), rubberMat);
    pedalPad.position.set(-0.3, -1.06, -0.7);
    pedalPad.rotation.x = 0.25;
    chairTurnGroup.add(pedalPad);

    // 2. Grupo de Elevação Hidráulica (sobe e desce durante o scroll)
    const liftGroup = new THREE.Group();
    chairTurnGroup.add(liftGroup);

    const pistonRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.115, 0.65, 32),
      chromeMat
    );
    pistonRod.position.y = -0.45;
    liftGroup.add(pistonRod);

    // Bloco mecânico sob o assento
    const underSeatChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.18, 0.82),
      darkCastMat
    );
    underSeatChassis.position.set(0, -0.14, -0.02);
    liftGroup.add(underSeatChassis);

    // Medalhões laterais em bronze no chassi
    [-1, 1].forEach((side) => {
      const medallion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.04, 28),
        bronzeMat
      );
      medallion.rotation.z = Math.PI / 2;
      medallion.position.set(side * 0.45, -0.13, 0.02);
      liftGroup.add(medallion);
    });

    // Alavanca lateral cromada de reclínio
    const leverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.46, -0.12, 0.05),
      new THREE.Vector3(0.68, -0.04, 0.12),
      new THREE.Vector3(0.74, 0.16, 0.22),
    ]);
    const sideLever = new THREE.Mesh(
      new THREE.TubeGeometry(leverCurve, 16, 0.02, 12, false),
      chromeMat
    );
    liftGroup.add(sideLever);

    const leverKnob = new THREE.Mesh(new THREE.SphereGeometry(0.048, 20, 20), bronzeMat);
    leverKnob.position.set(0.74, 0.16, 0.22);
    liftGroup.add(leverKnob);

    // 3. Assento Estofado em Couro Matelassê + Bolsters Laterais
    const seatGroup = new THREE.Group();
    liftGroup.add(seatGroup);

    const seatCore = new THREE.Mesh(
      new THREE.BoxGeometry(1.06, 0.22, 1.04),
      leatherQuilted
    );
    seatCore.position.set(0, 0.04, 0.04);
    seatGroup.add(seatCore);

    // Rolo frontal ergonômico do assento (waterfall front)
    const seatFrontRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.08, 28),
      leatherSmooth
    );
    seatFrontRoll.rotation.z = Math.PI / 2;
    seatFrontRoll.position.set(0, 0.04, 0.56);
    seatGroup.add(seatFrontRoll);

    // Abas laterais estofadas do assento (bolsters) e molduras cromadas
    [-1, 1].forEach((side) => {
      const seatBolster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.125, 0.115, 1.06, 24),
        leatherSmooth
      );
      seatBolster.rotation.x = Math.PI / 2;
      seatBolster.position.set(side * 0.52, 0.06, 0.04);
      seatGroup.add(seatBolster);

      // Placa lateral metálica cromada/bronze do assento
      const sideSkirt = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.16, 0.98),
        chromeMat
      );
      sideSkirt.position.set(side * 0.59, -0.02, 0.02);
      seatGroup.add(sideSkirt);

      const sideBronzeTrim = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.035, 0.88),
        bronzeMat
      );
      sideBronzeTrim.position.set(side * 0.595, -0.02, 0.02);
      seatGroup.add(sideBronzeTrim);
    });

    // 4. Braços Esculturais em Cromo e Couro (Esquerdo e Direito)
    [-1, 1].forEach((side) => {
      const x = side * 0.65;

      // Coluna frontal curva em cromo
      const frontPostCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, -0.04, 0.42),
        new THREE.Vector3(x * 1.04, 0.22, 0.48),
        new THREE.Vector3(x, 0.48, 0.4),
      ]);
      const frontPost = new THREE.Mesh(
        new THREE.TubeGeometry(frontPostCurve, 20, 0.042, 16, false),
        chromeMat
      );
      liftGroup.add(frontPost);

      // Coluna traseira curva em cromo
      const rearPostCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, -0.02, -0.36),
        new THREE.Vector3(x * 1.03, 0.24, -0.4),
        new THREE.Vector3(x, 0.48, -0.34),
      ]);
      const rearPost = new THREE.Mesh(
        new THREE.TubeGeometry(rearPostCurve, 20, 0.042, 16, false),
        chromeMat
      );
      liftGroup.add(rearPost);

      // Base metálica do apoio de braço
      const armBasePlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.04, 0.96),
        chromeMat
      );
      armBasePlate.position.set(x, 0.48, 0.04);
      liftGroup.add(armBasePlate);

      // Almofada superior de couro do braço
      const armPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.09, 0.92),
        leatherSmooth
      );
      armPad.position.set(x, 0.54, 0.02);
      liftGroup.add(armPad);

      // Ponteira frontal clássica em cromo/bronze no braço
      const armFrontCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 20, 20),
        chromeMat
      );
      armFrontCap.scale.set(1, 0.65, 1.3);
      armFrontCap.position.set(x, 0.52, 0.5);
      liftGroup.add(armFrontCap);
    });

    // 5. Encosto Reclinável Articulado (Backrest Pivot)
    const backrestPivot = new THREE.Group();
    backrestPivot.position.set(0, 0.1, -0.44);
    liftGroup.add(backrestPivot);

    // Hastes duplas cromadas traseiras de sustentação do encosto
    [-0.26, 0.26].forEach((xOffset) => {
      const spineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xOffset, -0.14, 0.02),
        new THREE.Vector3(xOffset, 0.18, -0.12),
        new THREE.Vector3(xOffset, 0.85, -0.14),
      ]);
      const spineBar = new THREE.Mesh(
        new THREE.TubeGeometry(spineCurve, 20, 0.036, 14, false),
        chromeMat
      );
      backrestPivot.add(spineBar);
    });

    // Almofada principal do encosto em matelassê diamante
    const backCushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 1.08, 0.2),
      leatherQuilted
    );
    backCushion.position.set(0, 0.64, 0.02);
    backCushion.rotation.x = -0.08;
    backrestPivot.add(backCushion);

    // Apoio lombar inferior mais volumoso
    const lumbarRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.96, 24),
      leatherSmooth
    );
    lumbarRoll.rotation.z = Math.PI / 2;
    lumbarRoll.position.set(0, 0.2, 0.09);
    backrestPivot.add(lumbarRoll);

    // Abas laterais anatômicas do encosto + friso cromado externo
    [-1, 1].forEach((side) => {
      const wing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.12, 1.06, 24),
        leatherSmooth
      );
      wing.position.set(side * 0.49, 0.64, 0.04);
      wing.rotation.x = -0.08;
      backrestPivot.add(wing);

      const chromeRim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 1.08, 16),
        chromeMat
      );
      chromeRim.position.set(side * 0.56, 0.64, -0.03);
      chromeRim.rotation.x = -0.08;
      backrestPivot.add(chromeRim);
    });

    // Topo arredondado do encosto
    const backTopRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 1.0, 24),
      leatherSmooth
    );
    backTopRoll.rotation.z = Math.PI / 2;
    backTopRoll.position.set(0, 1.18, -0.02);
    backrestPivot.add(backTopRoll);

    // Escudo traseiro rígido em grafite + placa em bronze ESCOL (visível no giro de 180°)
    const rearShell = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.98, 0.06),
      darkCastMat
    );
    rearShell.position.set(0, 0.64, -0.09);
    rearShell.rotation.x = -0.08;
    backrestPivot.add(rearShell);

    const rearBronzePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.14, 0.02),
      bronzeMat
    );
    rearBronzePlate.position.set(0, 0.82, -0.13);
    rearBronzePlate.rotation.x = -0.08;
    backrestPivot.add(rearBronzePlate);

    // 6. Apoio de Cabeça Ajustável (Headrest Group)
    const headrestGroup = new THREE.Group();
    headrestGroup.position.set(0, 1.24, -0.04);
    backrestPivot.add(headrestGroup);

    [-0.16, 0.16].forEach((xRod) => {
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.34, 16),
        chromeMat
      );
      rod.position.set(xRod, 0.08, -0.02);
      headrestGroup.add(rod);
    });

    const headrestBracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.07, 0.08),
      bronzeMat
    );
    headrestBracket.position.set(0, -0.03, -0.02);
    headrestGroup.add(headrestBracket);

    const headrestPillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.26, 0.16),
      leatherSmooth
    );
    headrestPillow.position.set(0, 0.24, 0.03);
    headrestGroup.add(headrestPillow);

    [-1, 1].forEach((side) => {
      const pillowCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.26, 20),
        leatherSmooth
      );
      pillowCap.position.set(side * 0.29, 0.24, 0.03);
      headrestGroup.add(pillowCap);
    });

    // 7. Apoio para os Pés Articulado em Cromo e Bronze (Footrest Pivot)
    const footrestPivot = new THREE.Group();
    footrestPivot.position.set(0, -0.06, 0.54);
    liftGroup.add(footrestPivot);

    [-0.4, 0.4].forEach((xBar) => {
      const legBarCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xBar, 0, 0),
        new THREE.Vector3(xBar, -0.45, 0.28),
        new THREE.Vector3(xBar, -0.92, 0.58),
      ]);
      const legBar = new THREE.Mesh(
        new THREE.TubeGeometry(legBarCurve, 20, 0.032, 14, false),
        chromeMat
      );
      footrestPivot.add(legBar);
    });

    // Apoio estofado de panturrilha (Calf rest)
    const calfPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.26, 0.11),
      leatherQuilted
    );
    calfPad.position.set(0, -0.44, 0.3);
    calfPad.rotation.x = -0.52;
    footrestPivot.add(calfPad);

    // Plataforma cromada inferior para os pés
    const footPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.05, 0.42),
      chromeMat
    );
    footPlate.position.set(0, -0.92, 0.68);
    footPlate.rotation.x = 0.08;
    footrestPivot.add(footPlate);

    const footBronzeInlay = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.056, 0.26),
      bronzeMat
    );
    footBronzeInlay.position.set(0, -0.92, 0.68);
    footBronzeInlay.rotation.x = 0.08;
    footrestPivot.add(footBronzeInlay);

    // Arco tubular cromado clássico na ponta do descanso de pés
    const toeLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.024, 14, 36, Math.PI),
      chromeMat
    );
    toeLoop.rotation.x = Math.PI / 2 + 0.08;
    toeLoop.position.set(0, -0.92, 0.88);
    footrestPivot.add(toeLoop);

    return {
      root,
      chairTurnGroup,
      liftGroup,
      backrestPivot,
      headrestGroup,
      footrestPivot,
    };
  };

  /* ── Renderizador 3D em Canvas 2D (Fallback caso WebGL esteja desativado) ─ */
  const createSoftware3DChairRenderer = (canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Utilitário de projeção 3D -> 2D com rotação Y (yaw) e X (pitch da câmera)
    const renderState = (state) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || 960;
      const height = canvas.clientHeight || 640;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * (state.screenX !== undefined ? state.screenX : 0.855);
      const cy = height * (state.screenY !== undefined ? state.screenY : 0.54) - state.lift * 42;
      const scale = Math.min(width, height) * (state.scaleFactor || 0.22);
      const yaw = state.rotationY;
      const pitch = state.cameraPitch || 0.18;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const project = (x, y, z) => {
        const rx = x * cosY + z * sinY;
        const rz = -x * sinY + z * cosY;
        const ry = y * cosP - rz * sinP;
        const fz = y * sinP + rz * cosP;
        const fov = 4.6;
        const persp = fov / (fov - fz * 0.45);
        return {
          x: cx + rx * scale * persp,
          y: cy - ry * scale * persp,
          z: fz,
          s: persp,
        };
      };

      // Halo dramático no piso sob a base
      const floorGrad = ctx.createRadialGradient(
        cx,
        cy + 1.25 * scale,
        8,
        cx,
        cy + 1.25 * scale,
        scale * 1.35
      );
      floorGrad.addColorStop(0, 'rgba(223, 189, 147, 0.28)');
      floorGrad.addColorStop(0.45, 'rgba(196, 154, 108, 0.1)');
      floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1.25 * scale, scale * 1.28, scale * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base circular cromada/bronze em elipses 3D
      const drawDisc3D = (yLevel, radius, fillTop, strokeCol, thickness = 8) => {
        const c = project(0, yLevel, 0);
        const rx = radius * scale * c.s;
        const ry = rx * Math.max(0.2, Math.sin(pitch + 0.16));
        ctx.fillStyle = fillTop;
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = thickness * c.s;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      };

      drawDisc3D(-1.32 + state.lift * 0.1, 1.02, '#1a1917', '#d8dadc', 4);
      drawDisc3D(-1.24 + state.lift * 0.1, 0.72, '#2d2822', '#c49a6c', 3);
      drawDisc3D(-1.14 + state.lift * 0.1, 0.38, '#e8eaed', '#8f6c49', 2);

      // Coluna hidráulica central
      const pBot = project(0, -1.14 + state.lift * 0.1, 0);
      const pTop = project(0, -0.05, 0);
      const rodGrad = ctx.createLinearGradient(pBot.x - 18, pBot.y, pBot.x + 18, pBot.y);
      rodGrad.addColorStop(0, '#55534e');
      rodGrad.addColorStop(0.45, '#f5f6f8');
      rodGrad.addColorStop(0.75, '#c49a6c');
      rodGrad.addColorStop(1, '#252422');
      ctx.strokeStyle = rodGrad;
      ctx.lineWidth = 28 * pBot.s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pBot.x, pBot.y);
      ctx.lineTo(pTop.x, pTop.y);
      ctx.stroke();

      // Construção de blocos 3D com faces ordenadas por profundidade (Z-sort)
      const faces = [];
      const addBox3D = (verts, colors, tag = '') => {
        const idxFaces = [
          { idx: [0, 1, 2, 3], col: colors.front, isQuilted: tag === 'quilted-front' },
          { idx: [5, 4, 7, 6], col: colors.back, isBadge: tag === 'rear-badge' },
          { idx: [4, 0, 3, 7], col: colors.side },
          { idx: [1, 5, 6, 2], col: colors.side },
          { idx: [3, 2, 6, 7], col: colors.top, isQuilted: tag === 'quilted-top' },
          { idx: [4, 5, 1, 0], col: colors.bottom },
        ];
        const proj = verts.map((v) => project(v[0], v[1], v[2]));
        idxFaces.forEach((f) => {
          const pts = f.idx.map((i) => proj[i]);
          // Back-face culling 2D
          const cross =
            (pts[1].x - pts[0].x) * (pts[2].y - pts[0].y) -
            (pts[1].y - pts[0].y) * (pts[2].x - pts[0].x);
          if (cross < 0) {
            const zAvg = pts.reduce((acc, p) => acc + p.z, 0) / 4;
            faces.push({
              pts,
              z: zAvg,
              col: f.col,
              stroke: colors.stroke || 'rgba(223, 189, 147, 0.25)',
              isQuilted: f.isQuilted,
              isBadge: f.isBadge,
            });
          }
        });
      };

      const makeBoxVerts = (cx0, cy0, cz0, hx, hy, hz, rotX = 0, pivotY = 0, pivotZ = 0) => {
        const raw = [
          [-hx, -hy, hz],
          [hx, -hy, hz],
          [hx, hy, hz],
          [-hx, hy, hz],
          [-hx, -hy, -hz],
          [hx, -hy, -hz],
          [hx, hy, -hz],
          [-hx, hy, -hz],
        ];
        const cX = Math.cos(rotX);
        const sX = Math.sin(rotX);
        return raw.map(([vx, vy, vz]) => {
          const x = cx0 + vx;
          const dy = cy0 + vy - pivotY;
          const dz = cz0 + vz - pivotZ;
          const ry = pivotY + dy * cX - dz * sX;
          const rz = pivotZ + dy * sX + dz * cX;
          return [x, ry, rz];
        });
      };

      const leatherColors = {
        front: '#1b1a18',
        back: '#161513',
        side: '#24221f',
        top: '#282521',
        bottom: '#10100f',
        stroke: 'rgba(223, 189, 147, 0.24)',
      };
      const chromeColors = {
        front: '#e4e6e9',
        back: '#b8bcc2',
        side: '#cfd3d8',
        top: '#f7f8fa',
        bottom: '#7a7d82',
        stroke: 'rgba(255, 255, 255, 0.45)',
      };
      const bronzeColors = {
        front: '#c49a6c',
        back: '#9d764e',
        side: '#b3885c',
        top: '#dfbd93',
        bottom: '#6e5235',
        stroke: 'rgba(247, 245, 239, 0.35)',
      };

      // Chassi sob o assento
      addBox3D(makeBoxVerts(0, -0.15, 0, 0.44, 0.09, 0.42), bronzeColors);

      // Assento principal em couro matelassê
      addBox3D(makeBoxVerts(0, 0.05, 0.04, 0.56, 0.13, 0.54), leatherColors, 'quilted-top');

      // Braços laterais (esquerdo e direito)
      [-0.64, 0.64].forEach((ax) => {
        addBox3D(makeBoxVerts(ax, 0.24, 0.4, 0.045, 0.25, 0.045), chromeColors);
        addBox3D(makeBoxVerts(ax, 0.24, -0.34, 0.045, 0.25, 0.045), chromeColors);
        addBox3D(makeBoxVerts(ax, 0.48, 0.04, 0.085, 0.03, 0.48), chromeColors);
        addBox3D(makeBoxVerts(ax, 0.54, 0.02, 0.09, 0.055, 0.45), leatherColors);
      });

      // Encosto reclinável
      const rec = -state.recline;
      addBox3D(
        makeBoxVerts(0, 0.72, -0.44, 0.52, 0.56, 0.12, rec, 0.1, -0.44),
        leatherColors,
        'quilted-front'
      );
      addBox3D(
        makeBoxVerts(0, 0.72, -0.57, 0.46, 0.5, 0.03, rec, 0.1, -0.44),
        bronzeColors,
        'rear-badge'
      );

      // Apoio de cabeça ajustável
      const hLift = state.headrest;
      addBox3D(
        makeBoxVerts(-0.16, 1.34 + hLift * 0.5, -0.46, 0.025, 0.14, 0.025, rec, 0.1, -0.44),
        chromeColors
      );
      addBox3D(
        makeBoxVerts(0.16, 1.34 + hLift * 0.5, -0.46, 0.025, 0.14, 0.025, rec, 0.1, -0.44),
        chromeColors
      );
      addBox3D(
        makeBoxVerts(0, 1.5 + hLift, -0.42, 0.32, 0.14, 0.09, rec, 0.1, -0.44),
        leatherColors
      );

      // Descanso de pés articulado
      const fAng = -0.55 + state.footrest;
      [-0.4, 0.4].forEach((fx) => {
        addBox3D(
          makeBoxVerts(fx, -0.52, 0.54, 0.035, 0.48, 0.035, fAng, -0.06, 0.54),
          chromeColors
        );
      });
      addBox3D(
        makeBoxVerts(0, -0.48, 0.58, 0.38, 0.15, 0.06, fAng, -0.06, 0.54),
        leatherColors,
        'quilted-front'
      );
      addBox3D(
        makeBoxVerts(0, -0.96, 0.74, 0.44, 0.035, 0.22, fAng, -0.06, 0.54),
        chromeColors
      );
      addBox3D(
        makeBoxVerts(0, -0.95, 0.74, 0.34, 0.04, 0.14, fAng, -0.06, 0.54),
        bronzeColors
      );

      // Ordena todas as faces da mais distante para a mais próxima
      faces.sort((a, b) => a.z - b.z);

      faces.forEach((f) => {
        ctx.fillStyle = f.col;
        ctx.strokeStyle = f.stroke;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(f.pts[0].x, f.pts[0].y);
        ctx.lineTo(f.pts[1].x, f.pts[1].y);
        ctx.lineTo(f.pts[2].x, f.pts[2].y);
        ctx.lineTo(f.pts[3].x, f.pts[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Desenha costura matelassê diamante nas faces estofadas
        if (f.isQuilted) {
          ctx.strokeStyle = 'rgba(223, 189, 147, 0.16)';
          ctx.lineWidth = 1;
          for (let k = 1; k <= 3; k++) {
            const t = k / 4;
            const ax = lerp(f.pts[0].x, f.pts[1].x, t);
            const ay = lerp(f.pts[0].y, f.pts[1].y, t);
            const bx = lerp(f.pts[3].x, f.pts[2].x, t);
            const by = lerp(f.pts[3].y, f.pts[2].y, t);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      });

      ctx.restore();
    };

    return { renderState };
  };

  /* ── Inicializador Principal da Experiência 3D Contínua (Hero -> Portfólio) ─ */
  function initChairScrub() {
    if (isInitialized) return;

    const stage = document.querySelector('[data-chair-scrub]');
    const canvas = document.getElementById('chair-scrub-canvas');
    const heroSection = document.querySelector('.hero');
    const portfolioSection = document.getElementById('portfolio');
    const dockEl = document.getElementById('portfolio-chair-dock') || portfolioSection;
    if (!stage || !canvas || !heroSection || !portfolioSection) return;

    isInitialized = true;

    // Move a camada fixa para <main> para não ficar presa no overflow/stacking do .hero
    const mainEl = document.getElementById('conteudo') || document.body;
    if (stage.parentElement !== mainEl) {
      mainEl.insertBefore(stage, mainEl.firstChild);
    }

    const THREE = window.THREE;
    let webglReady = false;
    let renderer = null;
    let scene = null;
    let camera = null;
    let chairRig = null;
    let keyLight = null;
    let rimLight = null;
    let softwareRenderer = null;

    if (THREE) {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.24;

        scene = new THREE.Scene();
        const envMap = createStudioEnvironment(THREE, renderer);
        if (envMap) {
          scene.environment = envMap;
        }

        camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
        camera.position.set(0, 0.25, 6.2);

        // Iluminação Dramática de Barbearia Premium
        const ambientLight = new THREE.AmbientLight(0xf7f5ef, 0.65);
        scene.add(ambientLight);

        keyLight = new THREE.SpotLight(0xffe6c8, 4.4);
        keyLight.position.set(3.4, 4.8, 4.0);
        keyLight.angle = Math.PI / 3.0;
        keyLight.penumbra = 0.85;
        scene.add(keyLight);

        const bronzeFillLight = new THREE.PointLight(0xc49a6c, 3.0, 14);
        bronzeFillLight.position.set(-3.2, 1.2, 2.8);
        scene.add(bronzeFillLight);

        rimLight = new THREE.SpotLight(0xdfbd93, 3.8);
        rimLight.position.set(0, 3.8, -4.4);
        rimLight.angle = Math.PI / 2.8;
        rimLight.penumbra = 0.9;
        scene.add(rimLight);

        const floorBounce = new THREE.PointLight(0x9d764e, 1.8, 8);
        floorBounce.position.set(0, -2.1, 1.2);
        scene.add(floorBounce);

        chairRig = buildBarberChair3D(THREE);
        chairRig.root.scale.setScalar(0.62);
        chairRig.root.position.set(2.02, -0.18, 0);
        scene.add(chairRig.root);
        webglReady = true;
      } catch {
        webglReady = false;
      }
    }

    if (!webglReady) {
      softwareRenderer = createSoftware3DChairRenderer(canvas);
    }

    // Métricas cacheadas do dock e do palco mobile para evitar getBoundingClientRect() a cada frame (60fps)
    const heroActionsEl =
      heroSection.querySelector('.hero-actions') || heroSection.querySelector('.hero-copy');
    const mobileBookingEl = document.querySelector('.mobile-booking');

    const dockMetrics = {
      docCenterY: 3200,
      screenX: 0.26,
      viewportAnchorY: window.innerHeight * 0.52,
      endScroll: 2600,
      mobileHeroY: -0.78,
      mobileHeroScale: 0.34,
      mobilePortfolioScale: 0.4,
      mobileHeroScreenY: 0.72,
    };

    const measureDockMetrics = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const isMobile = w <= 768;
      const dockRect = dockEl.getBoundingClientRect();

      dockMetrics.docCenterY = dockRect.top + scrollY + dockRect.height * 0.5;
      const rawScreenX = (dockRect.left + dockRect.width * 0.5) / w;
      dockMetrics.screenX = isMobile ? 0.5 : clamp(rawScreenX, 0.16, 0.84);
      dockMetrics.viewportAnchorY = h * 0.52;
      dockMetrics.endScroll = Math.max(1, dockMetrics.docCenterY - dockMetrics.viewportAnchorY);

      if (isMobile) {
        const heroRect = heroSection.getBoundingClientRect();
        const actionsBottomInHero = heroActionsEl
          ? heroActionsEl.getBoundingClientRect().bottom - heroRect.top
          : h * 0.5;
        const hasBottomBar = mobileBookingEl && w <= 640;
        const bottomBarTopPx = hasBottomBar ? h - 74 : h - 18;

        const slotTopPx = clamp(actionsBottomInHero + 18, h * 0.38, h * 0.72);
        const slotBottomPx = Math.max(slotTopPx + 110, bottomBarTopPx - 12);
        const slotHeightPx = slotBottomPx - slotTopPx;
        const slotCenterRatio = ((slotTopPx + slotBottomPx) * 0.5) / h;

        const visibleWorldH = 2 * 6.9 * Math.tan((17 * Math.PI) / 180);
        const scaleByH = ((slotHeightPx / h) * visibleWorldH * 0.84) / 2.94;
        const scaleByW = ((w / h) * visibleWorldH * 0.62) / 1.95;

        dockMetrics.mobileHeroScale = clamp(Math.min(scaleByH, scaleByW), 0.21, 0.39);
        dockMetrics.mobileHeroY =
          0.04 - (slotCenterRatio - 0.5) * visibleWorldH - 0.04 * dockMetrics.mobileHeroScale;
        dockMetrics.mobileHeroScreenY = clamp(slotCenterRatio, 0.6, 0.82);

        const dockScaleByH = ((dockRect.height / h) * visibleWorldH * 0.82) / 2.94;
        dockMetrics.mobilePortfolioScale = clamp(
          Math.min(dockScaleByH, scaleByW * 1.08),
          0.26,
          0.42
        );
      }
    };

    const resizeRenderer = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (webglReady && renderer && camera) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      }
      measureDockMetrics();
    };

    resizeRenderer();

    // Estado interpolado com amortecimento exponencial independente de taxa de quadros
    let targetProgress = 0;
    let currentProgress = 0;
    let autoSpinAngle = 0;
    let lastFrameTime = performance.now();

    // Atualiza apenas a translação GPU da camada quando ancorada no Portfólio (zero reflow)
    const syncStageTransform = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const dockCurrentCenterY = dockMetrics.docCenterY - scrollY;
      const followDockOffsetY = Math.min(0, dockCurrentCenterY - dockMetrics.viewportAnchorY);
      if (followDockOffsetY >= -0.2) {
        stage.style.transform = 'translate3d(0, 0px, 0)';
      } else {
        stage.style.transform = `translate3d(0, ${followDockOffsetY.toFixed(1)}px, 0)`;
      }
    };

    const applyFrameState = (progress, extraSpinRad = 0, nowMs = 0) => {
      const p = clamp(progress, 0, 1);
      const vw = window.innerWidth;
      const isTablet = vw <= 1024 && vw > 768;
      const isMobile = vw <= 768;

      // Fases suaves ao longo da jornada:
      // 0.00 -> 0.16: Hero (lado direito)
      // 0.16 -> 0.68: Essence e Services (direita sem cobrir textos)
      // 0.68 -> 0.98: Transição fluida para o dock esquerdo do Portfólio
      // 0.98 -> 1.00: Estacionada no Portfólio girando continuamente em 360°
      const toEssence = smoothstep(0.02, 0.16, p);
      const toServices = smoothstep(0.34, 0.52, p);
      const toPortfolio = smoothstep(0.68, 0.98, p);
      const scrollRotP = smoothstep(0.0, 0.94, p);

      const portfolioScreenX = dockMetrics.screenX;
      const heroScreenX = isMobile ? 0.5 : isTablet ? 0.83 : 0.855;
      const essenceScreenX = isMobile ? 0.5 : isTablet ? 0.83 : 0.85;
      const servicesScreenX = isMobile ? 0.5 : isTablet ? 0.83 : 0.845;

      let screenX = lerp(heroScreenX, essenceScreenX, toEssence);
      screenX = lerp(screenX, servicesScreenX, toServices);
      screenX = lerp(screenX, portfolioScreenX, toPortfolio);

      // Flutuação orgânica sutil (dá vida ao modelo 3D mesmo parado)
      const idleFloatY = Math.sin(nowMs * 0.0018) * 0.018;
      const idleYaw = Math.cos(nowMs * 0.0013) * 0.035 * (1 - toPortfolio);
      const idleRollZ = Math.sin(nowMs * 0.0015) * 0.012;

      const heroY = isMobile ? dockMetrics.mobileHeroY : -0.06;
      const midY = isMobile ? lerp(dockMetrics.mobileHeroY * 0.45, -0.08, 0.5) : -0.04;
      const portfolioY = isMobile ? -0.04 : -0.06;
      let posY = lerp(heroY, midY, toEssence);
      posY = lerp(posY, portfolioY, toPortfolio) + idleFloatY;

      const baseScale = isMobile ? dockMetrics.mobileHeroScale : isTablet ? 0.5 : 0.62;
      const midScale = isMobile
        ? lerp(dockMetrics.mobileHeroScale, dockMetrics.mobilePortfolioScale, 0.5)
        : isTablet
          ? 0.54
          : 0.65;
      const portfolioScale = isMobile ? dockMetrics.mobilePortfolioScale : isTablet ? 0.54 : 0.63;
      let modelScale = lerp(baseScale, midScale, toEssence);
      modelScale = lerp(modelScale, portfolioScale, toPortfolio);

      // No mobile, suaviza a opacidade durante os textos de largura total (Essência/Serviços)
      // e retorna a 100% de opacidade no Portfólio
      let currentAlpha = 1.0;
      if (isMobile) {
        const midFade = smoothstep(0.12, 0.24, p) * (1 - smoothstep(0.68, 0.86, p));
        currentAlpha = lerp(1.0, 0.55, midFade);
        currentAlpha = lerp(currentAlpha, 1.0, toPortfolio);
      }

      stage.style.opacity = currentAlpha.toFixed(3);
      stage.style.filter = 'none';
      stage.classList.remove('is-finished');
      syncStageTransform(p);

      // Rotação 360° fluida com curva harmônica + giro contínuo no Portfólio
      const startAngleDeg = -28;
      const rotationDeg = scrollRotP * 360;
      const totalAngleRad =
        ((startAngleDeg + rotationDeg) * Math.PI) / 180 + extraSpinRad + idleYaw;

      // Movimentos articulados suaves (encosto, descanso de pés e pistão hidráulico)
      const reclineBell = smoothstep(0.14, 0.44, p) * (1 - smoothstep(0.54, 0.8, p));
      const liftBell = smoothstep(0.24, 0.56, p) * (1 - smoothstep(0.64, 0.84, p));

      const reclineRad = reclineBell * 0.42;
      const footrestRad = reclineBell * 0.52;
      const liftOffset = liftBell * 0.16;
      const headrestOffset = reclineBell * 0.11;

      if (webglReady && chairRig && renderer && scene && camera) {
        const camArc = Math.sin(scrollRotP * Math.PI);
        camera.position.set(0, 0.22 + camArc * 0.24, (isMobile ? 6.9 : 6.1) - camArc * 0.2);
        camera.lookAt(0, 0.04, 0);

        const vFovRad = (camera.fov * Math.PI) / 180;
        const halfHeight = camera.position.z * Math.tan(vFovRad * 0.5);
        const halfWidth = halfHeight * camera.aspect;
        const worldX = (screenX - 0.5) * 2 * halfWidth;

        chairRig.root.position.set(worldX, posY, 0);
        chairRig.root.rotation.z = idleRollZ;
        chairRig.root.scale.setScalar(modelScale);

        chairRig.chairTurnGroup.rotation.y = totalAngleRad;
        chairRig.liftGroup.position.y = liftOffset;
        chairRig.backrestPivot.rotation.x = -reclineRad;
        chairRig.headrestGroup.position.y = 1.24 + headrestOffset;
        chairRig.footrestPivot.rotation.x = footrestRad;

        if (keyLight) {
          keyLight.intensity = 4.2 + camArc * 1.0;
        }
        if (rimLight) {
          rimLight.intensity = 3.5 + toPortfolio * 0.8;
        }

        renderer.render(scene, camera);
      } else if (softwareRenderer) {
        const swScreenY = isMobile
          ? lerp(dockMetrics.mobileHeroScreenY, 0.52, toPortfolio)
          : 0.54;
        softwareRenderer.renderState({
          screenX,
          screenY: swScreenY,
          scaleFactor: modelScale * 0.36,
          rotationY: totalAngleRad,
          recline: reclineRad,
          footrest: footrestRad,
          lift: liftOffset,
          headrest: headrestOffset,
          cameraPitch: 0.16 + Math.sin(scrollRotP * Math.PI) * 0.1,
        });
      }
    };

    const computeScrollProgress = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      return clamp(scrollY / dockMetrics.endScroll, 0, 1);
    };

    const setScrubTarget = (nextProgress) => {
      targetProgress = clamp(nextProgress, 0, 1);
    };

    // Loop único sincronizado por requestAnimationFrame com amortecimento exponencial
    const tickLoop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;

      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0001) {
        const alpha = 1 - Math.exp(-dt * 10.5);
        currentProgress += diff * alpha;
      } else {
        currentProgress = targetProgress;
      }

      // Giro contínuo em 360° quando estacionada no Portfólio
      const spinWeight = smoothstep(0.72, 0.96, currentProgress);
      if (spinWeight > 0.001) {
        autoSpinAngle = (autoSpinAngle + dt * 0.68 * spinWeight) % (Math.PI * 2);
      }

      applyFrameState(currentProgress, autoSpinAngle, now);
      window.requestAnimationFrame(tickLoop);
    };

    // GSAP + ScrollTrigger sincronizado para revelação do cubo 3D no Portfólio
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      const cubeStage = portfolioSection.querySelector('.portfolio-cube-stage');
      if (cubeStage) {
        window.gsap.fromTo(
          cubeStage,
          { opacity: 0, y: 36, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: portfolioSection,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }

    window.addEventListener(
      'scroll',
      () => {
        setScrubTarget(computeScrollProgress());
        syncStageTransform(currentProgress);
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      () => {
        resizeRenderer();
        targetProgress = computeScrollProgress();
        syncStageTransform(currentProgress);
        window.ScrollTrigger?.refresh();
      },
      { passive: true }
    );

    window.addEventListener('load', () => {
      measureDockMetrics();
      targetProgress = computeScrollProgress();
      syncStageTransform();
    });

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        measureDockMetrics();
        targetProgress = computeScrollProgress();
        syncStageTransform();
      });
      ro.observe(mainEl);
    }

    measureDockMetrics();
    const initialP = computeScrollProgress();
    currentProgress = initialP;
    targetProgress = initialP;
    applyFrameState(initialP, 0, performance.now());
    window.requestAnimationFrame(tickLoop);
  }

  app.initChairScrub = initChairScrub;
})();
