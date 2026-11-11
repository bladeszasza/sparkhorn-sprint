/* =============================================================
   SPARKHORN SPRINT – Complete main.js (all phases integrated)
   No imports/exports – uses window.THREE
   ============================================================= */
(function () {
  'use strict';
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) { document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false }); });
  document.addEventListener('touchmove', function (e) { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, { passive: false });
  var THREE = window.THREE;

  // ===================== TEXTURE DATA (Phase 5/21) =====================
  // Phase 21 requires reading textures_data.js at startup.
  var TEXTURES = window.TEXTURES || {};

  // TextureLoader pipeline (NO local paths; textures_data.js provides the URLs/data)
  var textureLoader = new THREE.TextureLoader();

  // Phase 21: Canvas2D textures applied to MeshToonMaterial (flatShading: true)
  // Map a few keys if available; otherwise fall back to procedural generators.
  function loadTex(key, fallbackTex) {
    if (TEXTURES && TEXTURES[key]) return textureLoader.load(TEXTURES[key]);
    return fallbackTex;
  }

  // ===================== PHASE 4 – Canvas Texture Generators =====================

  function makeAcademyPathTexture(size) {
    size = size || 64;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    // Lilac base
    ctx.fillStyle = '#c0a8e0';
    ctx.fillRect(0, 0, size, size);
    // White/teal star pattern
    for (var i = 0; i < size; i += 16) {
      for (var j = 0; j < size; j += 16) {
        if ((i + j) % 32 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i + 2, j + 2, 6, 6);
        } else {
          ctx.fillStyle = '#80d0c0';
          ctx.fillRect(i + 4, j + 4, 4, 4);
        }
      }
    }
    ctx.strokeStyle = '#d8c0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, size - 4, size - 4);
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function makeCloudCourtyardGroundTexture(size) {
    size = size || 64;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, '#e8e0ff');
    grd.addColorStop(1, '#c8b8e8');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    // Cloud puffs
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (var i = 0; i < 20; i++) {
      var rx = Math.random() * size;
      var ry = Math.random() * size;
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function makeSparkBodyDetailTexture(size) {
    size = size || 64;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    // White/lilac subtle emblem
    ctx.fillStyle = '#f0e0ff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(208,132,255,0.3)';
    for (var i = 0; i < 8; i++) {
      var sx = Math.random() * size;
      var sy = Math.random() * size;
      ctx.fillRect(sx, sy, 4, 4);
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size/2, size/2, 8, 0, Math.PI*2);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  // Procedural color texture helper
  function makeColorTexture(hex, sz) {
    sz = sz || 64;
    var c = document.createElement('canvas');
    c.width = c.height = sz;
    var ctx = c.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, sz, sz);
    return new THREE.CanvasTexture(c);
  }

  var UNICORN_ROSTER = [
    {
      name: 'Starbloom',
      body: 0xf0e0ff,
      legs: 0xd0c0e8,
      horn: 0xffd700,
      tail: 0xd084ff,
      mane: [0xd084ff, 0xff80c0, 0x80d0ff, 0xd084ff, 0xff80c0],
      eyes: 0x382c6e,
      ears: 0xffc0e0,
      particleMode: 'sparkle',
      particleSize: 0.14,
      particleColors: [0xff80c0, 0x80d0ff, 0xfff2a8, 0xc68cff]
    },
    {
      name: 'Sproutling',
      body: 0xf5e8d0,
      legs: 0xe1d0ae,
      horn: 0xc56eff,
      tail: 0x6d31b3,
      mane: [0x712bbb, 0x31d1b2, 0x7f2ae2, 0x2ca982, 0x7b41c0],
      eyes: 0x6c4399,
      ears: 0xffd6e8,
      particleMode: 'leaf',
      particleSize: 0.13,
      particleColors: [0x63d37f, 0xb6f58c, 0xf2ffe0]
    },
    {
      name: 'Frostfeather',
      body: 0xf3f6ff,
      legs: 0xdbe6ff,
      horn: 0x86dcff,
      tail: 0xc9b5ff,
      mane: [0xffffff, 0xcdbdff, 0x9be6ff, 0xd8c9ff, 0x8ed8ff],
      eyes: 0x4cbfff,
      ears: 0xf8d4f0,
      particleMode: 'snow',
      particleSize: 0.11,
      particleColors: [0xffffff, 0x9be6ff, 0xcdbdff]
    },
    {
      name: 'Tidewhisper',
      body: 0x61b9ff,
      legs: 0x4a9fe0,
      horn: 0xff89ca,
      tail: 0x7a68ff,
      mane: [0x5168e0, 0xa365ff, 0xf76cc8, 0x5e7cff, 0xbf6aff],
      eyes: 0x1e2157,
      ears: 0xf7b2df,
      particleMode: 'wave',
      particleSize: 0.12,
      particleColors: [0x7adfff, 0x64baff, 0xff89ca]
    },
    {
      name: 'Emberhoof',
      body: 0xf2c18b,
      legs: 0xe09a54,
      horn: 0xffda63,
      tail: 0xcf4c34,
      mane: [0xba3d20, 0xf08c2b, 0xc92d34, 0xffbf49, 0xc04a20],
      eyes: 0x64250f,
      ears: 0xffc09e,
      particleMode: 'fire',
      particleSize: 0.16,
      particleColors: [0xfff18a, 0xffb347, 0xff6b3d, 0xcf4c34]
    },
    {
      name: 'Thundermane',
      body: 0x6c58a8,
      legs: 0x594980,
      horn: 0xd0dbff,
      tail: 0x6476ff,
      mane: [0x5d5fd1, 0x7584ff, 0x79c6ff, 0x5e61d4, 0x88d5ff],
      eyes: 0x241b47,
      ears: 0xbdb4e6,
      particleMode: 'storm',
      particleSize: 0.12,
      particleColors: [0xd0dbff, 0x79c6ff, 0x6476ff]
    }
  ];

  function clampUnicornIndex(index) {
    if (index < 0) return 0;
    if (index >= UNICORN_ROSTER.length) return UNICORN_ROSTER.length - 1;
    return index;
  }

  function getUnicornPalette(index) {
    return UNICORN_ROSTER[clampUnicornIndex(index)];
  }

  // ===================== PHASE 3 – Geometry Builders (9 functions) =====================

  // 1. buildHero – Spark the Unicorn (17 parts, white/pink/gold)
  function buildHero(palette) {
    palette = palette || UNICORN_ROSTER[0];
    var group = new THREE.Group();
    var legs = [];
    var maneTufts = [];
    // Body
    var bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.9);
    var bodyMat = new THREE.MeshToonMaterial({ color: palette.body, flatShading: true });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.userData.basePositionY = body.position.y;
    body.userData.baseScaleX = 1;
    body.userData.baseScaleY = 1;
    body.userData.baseScaleZ = 1;
    group.add(body); // 1
    // Head
    var headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    var headMat = new THREE.MeshToonMaterial({ color: palette.body, flatShading: true });
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.15, -0.55);
    head.userData.basePositionY = head.position.y;
    head.userData.baseRotationX = head.rotation.x;
    head.userData.baseRotationY = head.rotation.y;
    group.add(head); // 2
    // Horn (gold)
    var hornGeo = new THREE.ConeGeometry(0.06, 0.35, 6);
    var hornMat = new THREE.MeshToonMaterial({ color: palette.horn, flatShading: true });
    var horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(0, 0.5, -0.55);
    horn.rotation.x = -0.15;
    horn.userData.basePositionY = horn.position.y;
    horn.userData.baseRotationX = horn.rotation.x;
    group.add(horn); // 3
    // 4 Legs
    var legGeo = new THREE.BoxGeometry(0.12, 0.35, 0.12);
    var legMat = new THREE.MeshToonMaterial({ color: palette.legs, flatShading: true });
    var offsets = [[-0.15,-0.42,-0.28],[0.15,-0.42,-0.28],[-0.15,-0.42,0.28],[0.15,-0.42,0.28]];
    for (var i = 0; i < 4; i++) {
      var leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(offsets[i][0], offsets[i][1], offsets[i][2]);
      leg.userData.baseRotationX = leg.rotation.x;
      leg.userData.basePositionY = leg.position.y;
      legs.push(leg);
      group.add(leg); // 4,5,6,7
    }
    // Tail (pink)
    var tailGeo = new THREE.BoxGeometry(0.08, 0.08, 0.4);
    var tailMat = new THREE.MeshToonMaterial({ color: palette.tail, flatShading: true });
    var tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0.15, 0.6);
    tail.rotation.x = 0.4;
    tail.userData.basePositionY = tail.position.y;
    tail.userData.baseRotationX = tail.rotation.x;
    tail.userData.baseRotationY = tail.rotation.y;
    group.add(tail); // 8
    // Mane (5 tufts - pink/gold tones)
    var maneGeo = new THREE.BoxGeometry(0.06, 0.18, 0.06);
    var maneColors = palette.mane || UNICORN_ROSTER[0].mane;
    for (var j = 0; j < 5; j++) {
      var maneMat = new THREE.MeshToonMaterial({ color: maneColors[j], flatShading: true });
      var tuft = new THREE.Mesh(maneGeo, maneMat);
      tuft.position.set(0, 0.35, -0.35 + j * 0.15);
      tuft.userData.basePositionY = tuft.position.y;
      tuft.userData.baseRotationX = tuft.rotation.x;
      tuft.userData.baseRotationY = tuft.rotation.y;
      maneTufts.push(tuft);
      group.add(tuft); // 9,10,11,12,13
    }
    // Eyes (2)
    var eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
    var eyeMat = new THREE.MeshBasicMaterial({ color: palette.eyes });
    var leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 0.22, -0.725);
    group.add(leftEye); // 14
    var rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 0.22, -0.725);
    group.add(rightEye); // 15
    // Ear left
    var earGeo = new THREE.BoxGeometry(0.06, 0.12, 0.04);
    var earMat = new THREE.MeshLambertMaterial({ color: palette.ears, flatShading: true });
    var earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.12, 0.38, -0.55);
    group.add(earL); // 16
    // Ear right
    var earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.12, 0.38, -0.55);
    group.add(earR); // 17
    group.userData.anim = {
      body: body,
      head: head,
      horn: horn,
      legs: legs,
      tail: tail,
      maneTufts: maneTufts
    };
    group.userData.landingSquash = 0;
    group.userData.unicornName = palette.name;
    return group;
  }

  function animateUnicorn(group, timeSeconds, mode, speedValue) {
    if (!group || !group.userData || !group.userData.anim) return;

    var anim = group.userData.anim;
    var body = anim.body;
    var head = anim.head;
    var horn = anim.horn;
    var tail = anim.tail;
    var legs = anim.legs;
    var maneTufts = anim.maneTufts;
    var cycleSpeed = 2.4;
    var legAmplitude = 0.09;
    var tailLift = 0.02;
    var tailSwing = 0.18;
    var maneBob = 0.018;
    var maneLean = 0.02;
    var headNod = 0.05;
    var bodyBob = 0.012;
    var breathAmplitude = 0.016;
    var speedNorm = 0;
    var bodyCompression = group.userData.landingSquash || 0;

    if (mode === 'gallop') {
      cycleSpeed = 7.8;
      legAmplitude = 0.52;
      tailLift = 0.18;
      tailSwing = 0.28;
      maneBob = 0.028;
      maneLean = 0.2;
      headNod = 0.08;
      bodyBob = 0.028;
      breathAmplitude = 0.02;
    } else if (mode === 'gallop-speed') {
      speedNorm = (speedValue - SCROLL.initial) / (SCROLL.max - SCROLL.initial);
      if (speedNorm < 0) speedNorm = 0;
      if (speedNorm > 1) speedNorm = 1;
      cycleSpeed = 7.2 + speedNorm * 3.4;
      legAmplitude = 0.42 + speedNorm * 0.18;
      tailLift = 0.14 + speedNorm * 0.18;
      tailSwing = 0.24 + speedNorm * 0.08;
      maneBob = 0.02 + speedNorm * 0.02;
      maneLean = 0.16 + speedNorm * 0.18;
      headNod = 0.06 + speedNorm * 0.03;
      bodyBob = 0.018 + speedNorm * 0.014;
      breathAmplitude = 0.016;
    }

    var cycle = timeSeconds * cycleSpeed;
    var diagonalA = Math.sin(cycle);
    var diagonalB = Math.sin(cycle + Math.PI);
    var breath = Math.sin(timeSeconds * 2.0) * breathAmplitude;

    legs[0].rotation.x = legs[0].userData.baseRotationX + diagonalA * legAmplitude;
    legs[3].rotation.x = legs[3].userData.baseRotationX + diagonalA * legAmplitude;
    legs[1].rotation.x = legs[1].userData.baseRotationX + diagonalB * legAmplitude;
    legs[2].rotation.x = legs[2].userData.baseRotationX + diagonalB * legAmplitude;

    tail.rotation.x = tail.userData.baseRotationX + tailLift + Math.sin(cycle * 0.55) * 0.05;
    tail.rotation.y = tail.userData.baseRotationY + Math.sin(cycle * 0.7 + 0.6) * tailSwing;

    head.rotation.x = head.userData.baseRotationX + Math.sin(cycle * 0.45 + 0.5) * headNod;
    head.rotation.y = head.userData.baseRotationY + Math.sin(cycle * 0.3 + 0.25) * 0.04;
    head.position.y = head.userData.basePositionY + Math.sin(cycle * 0.45 + 0.5) * 0.02;

    horn.rotation.x = horn.userData.baseRotationX + Math.sin(cycle * 0.45 + 0.5) * (headNod * 0.4);
    horn.position.y = horn.userData.basePositionY + Math.sin(cycle * 0.45 + 0.5) * 0.02;

    body.position.y = body.userData.basePositionY + Math.sin(cycle * 2.0) * bodyBob;
    body.scale.x = body.userData.baseScaleX + bodyCompression * 0.06 - breath * 0.18;
    body.scale.y = body.userData.baseScaleY + breath - bodyCompression * 0.16;
    body.scale.z = body.userData.baseScaleZ + bodyCompression * 0.04 - breath * 0.12;

    for (var i = 0; i < maneTufts.length; i++) {
      var tuft = maneTufts[i];
      var tuftPhase = cycle + i * 0.34;
      tuft.position.y = tuft.userData.basePositionY + Math.sin(tuftPhase) * maneBob;
      tuft.rotation.x = tuft.userData.baseRotationX + maneLean + Math.cos(tuftPhase) * (maneBob * 4);
      tuft.rotation.y = tuft.userData.baseRotationY + Math.sin(tuftPhase * 0.5) * 0.05;
    }
  }

  // 2. buildObstacleGround – Spellbook (5 parts)
  function buildObstacleGround() {
    var group = new THREE.Group();
    var coverGeo = new THREE.BoxGeometry(0.6, 0.8, 0.12);
    var coverMat = new THREE.MeshToonMaterial({ color: 0x6040a0, flatShading: true });
    var cover = new THREE.Mesh(coverGeo, coverMat);
    group.add(cover); // 1
    var spineGeo = new THREE.BoxGeometry(0.08, 0.8, 0.14);
    var spineMat = new THREE.MeshToonMaterial({ color: 0x402080, flatShading: true });
    var spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(-0.34, 0, 0);
    group.add(spine); // 2
    var pageGeo = new THREE.BoxGeometry(0.55, 0.75, 0.06);
    var pageMat = new THREE.MeshToonMaterial({ color: 0xf0e8d0, flatShading: true });
    var pages = new THREE.Mesh(pageGeo, pageMat);
    pages.position.set(0, 0, 0.09);
    group.add(pages); // 3
    var gemGeo = new THREE.OctahedronGeometry(0.08, 0);
    var gemMat = new THREE.MeshToonMaterial({ color: 0xff40ff, emissive: 0x8020a0, emissiveIntensity: 0.5, flatShading: true });
    var gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0.1, -0.07);
    group.add(gem); // 4
    var strapGeo = new THREE.BoxGeometry(0.6, 0.04, 0.14);
    var strapMat = new THREE.MeshToonMaterial({ color: 0xffd700, flatShading: true });
    var strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.set(0, -0.2, 0);
    group.add(strap); // 5
    group.scale.set(1.0, 1.0, 1.0);
    return group;
  }

  // 3. buildObstacleAerial – Chandelier (6 parts)
  function buildObstacleAerial() {
    var group = new THREE.Group();
    var ringGeo = new THREE.TorusGeometry(0.3, 0.04, 8, 12);
    var ringMat = new THREE.MeshToonMaterial({ color: 0xffd700, flatShading: true });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring); // 1
    var chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6);
    var chainMat = new THREE.MeshToonMaterial({ color: 0xc0a040, flatShading: true });
    var chain = new THREE.Mesh(chainGeo, chainMat);
    chain.position.set(0, 0.4, 0);
    group.add(chain); // 2
    var crystalGeo = new THREE.OctahedronGeometry(0.1, 0);
    var crystalMat = new THREE.MeshToonMaterial({ color: 0xc080ff, emissive: 0x6020c0, emissiveIntensity: 0.4, flatShading: true });
    for (var i = 0; i < 3; i++) {
      var crystal = new THREE.Mesh(crystalGeo, crystalMat);
      var angle = (i / 3) * Math.PI * 2;
      crystal.position.set(Math.cos(angle) * 0.25, -0.15, Math.sin(angle) * 0.25);
      group.add(crystal); // 3,4,5
    }
    var topGeo = new THREE.SphereGeometry(0.06, 6, 6);
    var topMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    var top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, 0.65, 0);
    group.add(top); // 6
    return group;
  }

  // 4. buildCollectible – Golden Star (5 parts)
  function buildCollectible() {
    var group = new THREE.Group();
    var coreGeo = new THREE.OctahedronGeometry(0.2, 0);
    var coreMat = new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xffa000, emissiveIntensity: 0.5 });
    var core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core); // 1
    var sparkGeo = new THREE.BoxGeometry(0.04, 0.35, 0.04);
    var sparkMat = new THREE.MeshLambertMaterial({ color: 0xffee88, emissive: 0xffcc00, emissiveIntensity: 0.3 });
    for (var i = 0; i < 4; i++) {
      var spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.rotation.z = (i / 4) * Math.PI;
      group.add(spark); // 2,3,4,5
    }
    return group;
  }

  // 5. buildPlatformTile – Lilac stone (2 parts)
  function buildPlatformTile() {
    var group = new THREE.Group();
    var tileGeo = new THREE.BoxGeometry(4, 0.12, 2.0);

    // Phase 2/21 requirement: Canvas2D textures applied to MeshToonMaterial, flatShading true.
    var tileTex = loadTex('sparkhorn_sprint_tile', makeAcademyPathTexture(64));
    tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
    tileTex.repeat.set(2, 1);

    var tileMat = new THREE.MeshToonMaterial({
      color: 0xd8c8f0,
      map: tileTex,
      flatShading: true,
      gradientMap: null
    });

    var tile = new THREE.Mesh(tileGeo, tileMat);
    group.add(tile); // 1

    var edgeGeo = new THREE.BoxGeometry(4.1, 0.04, 2.1);
    var edgeMat = new THREE.MeshToonMaterial({ color: 0xb0a0d0, flatShading: true });
    var edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = -0.08;
    group.add(edge); // 2
    return group;
  }

  // 6. buildBackgroundProp – Tower (6 parts)
  function buildBackgroundProp() {
    var group = new THREE.Group();
    var baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 3, 8);
    var baseMat = new THREE.MeshLambertMaterial({ color: 0xd0b8e8 });
    var base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.5;
    group.add(base); // 1
    var roofGeo = new THREE.ConeGeometry(0.8, 1.2, 8);
    var roofMat = new THREE.MeshLambertMaterial({ color: 0x8060c0 });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.6;
    group.add(roof); // 2
    var windowGeo = new THREE.BoxGeometry(0.2, 0.3, 0.05);
    var windowMat = new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xffa000, emissiveIntensity: 0.3 });
    for (var i = 0; i < 3; i++) {
      var win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(0.62, 1.0 + i * 0.8, 0);
      group.add(win); // 3,4,5
    }
    var flagGeo = new THREE.BoxGeometry(0.3, 0.2, 0.02);
    var flagMat = new THREE.MeshLambertMaterial({ color: 0xff80c0 });
    var flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0, 4.3, 0);
    group.add(flag); // 6
    return group;
  }

  // 7. buildDecoA – Crystal Post (3 parts at X 3.40)
  function buildDecoA() {
    var group = new THREE.Group();
    var postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6);
    var postMat = new THREE.MeshLambertMaterial({ color: 0xc0b0e0 });
    var post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 0.6;
    group.add(post); // 1
    var crystalGeo = new THREE.OctahedronGeometry(0.15, 0);
    var crystalMat = new THREE.MeshLambertMaterial({ color: 0xc080ff, emissive: 0x8040d0, emissiveIntensity: 0.4 });
    var crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 1.3;
    group.add(crystal); // 2
    var baseGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8);
    var baseMat = new THREE.MeshLambertMaterial({ color: 0xa090c0 });
    var baseM = new THREE.Mesh(baseGeo, baseMat);
    baseM.position.y = 0.03;
    group.add(baseM); // 3
    group.position.x = 3.40;
    return group;
  }

  // 8. buildDecoB – Lesson Orb (3 parts at Z -6.00, bobbing animated)
  function buildDecoB() {
    var group = new THREE.Group();
    var orbGeo = new THREE.SphereGeometry(0.25, 12, 12);
    var orbMat = new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xffa000, emissiveIntensity: 0.3 });
    var orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 1.5;
    group.add(orb); // 1
    var ringGeo = new THREE.TorusGeometry(0.35, 0.02, 8, 16);
    var ringMat = new THREE.MeshLambertMaterial({ color: 0xffc040 });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 1.5;
    ring.rotation.x = Math.PI / 2;
    group.add(ring); // 2
    var glowGeo = new THREE.SphereGeometry(0.32, 8, 8);
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.15 });
    var glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 1.5;
    group.add(glow); // 3
    group.position.z = -6.00;
    group.userData.isDecoB = true;
    return group;
  }

  // 9. buildDecoC – Rainbow Arch (5 parts at Z -30.00, large distant)
  function buildDecoC() {
    var group = new THREE.Group();
    var archColors = [0xff4040, 0xffa000, 0xffff40, 0x40c040, 0x4080ff];
    for (var i = 0; i < 5; i++) {
      var r = 4.0 - i * 0.3;
      var archGeo = new THREE.TorusGeometry(r, 0.15, 8, 24, Math.PI);
      var archMat = new THREE.MeshLambertMaterial({ color: archColors[i] });
      var arch = new THREE.Mesh(archGeo, archMat);
      arch.rotation.z = 0;
      arch.position.y = 0;
      group.add(arch); // 1,2,3,4,5
    }
    group.position.z = -30.00;
    group.position.y = 1.25;
    group.userData.isDecoC = true;
    return group;
  }

  // ===================== PHASE 6 – Game Constants =====================
  var PHYSICS = {
    gravity: -22,
    jumpForce: 11,
    maxFallSpeed: -22,
    playerGroundY: 0.60,
    laneWidth: 1.5,
    laneSnapSpeed: 8,
    heroCenterY: 0.06,
    groundObstacleY: 0.42,
    aerialObstacleY: 1.96,
    collectibleY: 1.18,
    // Collision constraints (no changes to hero.position.z)
    heroHalf: { x: 0.35, y: 0.56, z: 0.35 },
    obstacleHalf: { x: 0.55, y: 0.55, z: 0.55 },
    collectibleHalf: { x: 0.60, y: 0.60, z: 0.60 }
  };

  // Gentle difficulty for young children: slow top speed, generous spacing.
  var SCROLL = { initial: 5, max: 9, rampRate: 0.06 };
  var SPAWN = { aheadDistance: 40, despawnBehind: 5, initialInterval: 2.0, minInterval: 1.3, intervalDecay: 0.02 };
  var ROUND_SECONDS = 90;      // a round ends kindly after this long
  var STUMBLE_SECONDS = 1.4;   // short invulnerability after a bump
  var TILE = { count: 25, depth: 2.0 };
  var VIEW = { gameplayCameraY: 3.05, gameplayCameraZ: 6.15, gameplayLookY: 1.06, gameplayLookZ: -4.2, showcaseHeroY: 0.68 };

  // Patterns A/B/C/D with unlock times
  // Lane indices: 0=left, 1=center, 2=right
  function getRandomLane() { return Math.floor(Math.random() * 3); }
  function getDiffLane(a) { var b = getRandomLane(); while (b === a) b = getRandomLane(); return b; }

  // ===================== Collision AABB =====================
  // Pre-computed center + halfSize (used in loop)
  var HERO_HALF = PHYSICS.heroHalf;
  var OBS_HALF = PHYSICS.obstacleHalf;
  var COL_HALF = PHYSICS.collectibleHalf;

  // ===================== Audio (Web Audio – no file loading) =====================
  var _audioCtx = null;
  function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }

  function playSFX(type) {
    try {
      var ctx = getAudioCtx();
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      if (type === 'jump') {
        osc.type = 'triangle';
        osc.frequency.value = 440;
        g.gain.setValueAtTime(0.10, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'collectible') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.10);
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.10);
        osc.start();
        osc.stop(ctx.currentTime + 0.10);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.36);
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'gameOver') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}
  }

  var MUSIC_BPM = 112;
  var MUSIC_LOOKAHEAD = 0.22;
  var musicMasterGain = null;
  var musicSchedulerId = 0;
  var musicNextNoteTime = 0;
  var musicStep = 0;
  var MUSIC_SEQUENCE = [
    { lead: 74, accent: 81, pad: 62, bass: 50 },
    { lead: 76, accent: null, pad: 66, bass: null },
    { lead: 79, accent: 83, pad: 69, bass: null },
    { lead: 76, accent: null, pad: 66, bass: null },
    { lead: 74, accent: 81, pad: 60, bass: 48 },
    { lead: 72, accent: null, pad: 64, bass: null },
    { lead: 74, accent: 79, pad: 67, bass: null },
    { lead: 79, accent: null, pad: 64, bass: null },
    { lead: 81, accent: 86, pad: 65, bass: 53 },
    { lead: 79, accent: null, pad: 69, bass: null },
    { lead: 76, accent: 83, pad: 72, bass: null },
    { lead: 74, accent: null, pad: 69, bass: null },
    { lead: 76, accent: 84, pad: 62, bass: 50 },
    { lead: 79, accent: null, pad: 66, bass: null },
    { lead: 81, accent: 86, pad: 69, bass: null },
    { lead: 84, accent: 88, pad: 71, bass: null }
  ];

  function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function scheduleMusicNote(time, note, duration, type, volume, detune, cutoff) {
    if (note === null || note === undefined || !musicMasterGain) return;

    var ctx = getAudioCtx();
    var osc = ctx.createOscillator();
    var filter = ctx.createBiquadFilter();
    var gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(midiToFrequency(note), time);
    osc.detune.setValueAtTime(detune || 0, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff || 1800, time);
    filter.Q.value = 0.4;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicMasterGain);

    osc.start(time);
    osc.stop(time + duration + 0.04);
  }

  function scheduleMusicStep(time, stepIndex) {
    var step = MUSIC_SEQUENCE[stepIndex];
    var stepDuration = 60 / MUSIC_BPM / 2;

    scheduleMusicNote(time, step.lead, stepDuration * 0.92, 'triangle', 0.38, 4, 2400);
    scheduleMusicNote(time + stepDuration * 0.24, step.accent, stepDuration * 0.68, 'sine', 0.16, -3, 1800);

    if (stepIndex % 2 === 0) {
      scheduleMusicNote(time, step.pad, stepDuration * 1.8, 'triangle', 0.12, 0, 900);
      scheduleMusicNote(time, step.pad + 7, stepDuration * 1.8, 'triangle', 0.08, 2, 1100);
    }

    if (step.bass !== null && step.bass !== undefined) {
      scheduleMusicNote(time, step.bass, stepDuration * 3.6, 'sawtooth', 0.12, -5, 480);
      scheduleMusicNote(time + stepDuration * 0.1, step.bass + 12, stepDuration * 1.6, 'triangle', 0.06, 0, 820);
    }
  }

  function scheduleMusicAhead() {
    if (!musicMasterGain) return;

    var ctx = getAudioCtx();
    var stepDuration = 60 / MUSIC_BPM / 2;

    while (musicNextNoteTime < ctx.currentTime + MUSIC_LOOKAHEAD) {
      scheduleMusicStep(musicNextNoteTime, musicStep);
      musicNextNoteTime += stepDuration;
      musicStep = (musicStep + 1) % MUSIC_SEQUENCE.length;
    }
  }

  function ensureBackgroundMusicStarted() {
    var ctx = getAudioCtx();

    if (!musicMasterGain) {
      musicMasterGain = ctx.createGain();
      musicMasterGain.gain.value = 0.0001;
      musicMasterGain.connect(ctx.destination);
    }

    if (musicSchedulerId) return;

    musicNextNoteTime = ctx.currentTime + 0.08;
    musicStep = 0;
    musicSchedulerId = window.setInterval(scheduleMusicAhead, 90);
  }

  function setMusicMix(targetVolume) {
    if (!musicMasterGain) return;

    var ctx = getAudioCtx();
    musicMasterGain.gain.cancelScheduledValues(ctx.currentTime);
    musicMasterGain.gain.setValueAtTime(Math.max(0.0001, musicMasterGain.gain.value), ctx.currentTime);
    musicMasterGain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.6);
  }

  function updateMusicForState() {
    if (!musicMasterGain) return;

    if (gameState === STATE.PLAYING) {
      setMusicMix(0.085);
    } else if (gameState === STATE.GAME_OVER) {
      setMusicMix(0.045);
    } else {
      setMusicMix(0.055);
    }
  }

  // ===================== SCORING =====================
  var HISCORE_KEY = 'sparkhorn_sprint_best_stars';
  var SELECTED_UNICORN_KEY = 'sparkhorn_sprint_selected_unicorn';

  function loadStoredUnicornIndex() {
    try {
      return clampUnicornIndex(parseInt(localStorage.getItem(SELECTED_UNICORN_KEY) || '0', 10) || 0);
    } catch (err) {
      return 0;
    }
  }

  function storeSelectedUnicornIndex(index) {
    try {
      localStorage.setItem(SELECTED_UNICORN_KEY, '' + clampUnicornIndex(index));
    } catch (err) {}
  }

  var selectedUnicornIndex = loadStoredUnicornIndex();
  var score = 0;
  var highScore = 0;
  try { highScore = parseInt(localStorage.getItem(HISCORE_KEY) || '0', 10) || 0; } catch (err) { highScore = 0; }

  // ===================== STATE MACHINE =====================
  var STATE = { SHOWCASE: 'showcase', PLAYING: 'playing', GAME_OVER: 'game_over' };
  var gameState = STATE.SHOWCASE;

  // ===================== HUD Elements =====================
  var hudTitle = document.getElementById('title');
  var scoreDisplay = document.getElementById('score-display');
  var livesDisplay = document.getElementById('lives-display');
  var gameoverHint = document.getElementById('gameover-hint');
  var hiScoreDisplay = document.getElementById('hiscore-display');
  var startOverlay = document.getElementById('start-overlay');
  var startBtn = document.getElementById('start-btn');
  var selectedUnicornLabel = document.getElementById('selected-unicorn-label');
  var gameoverOverlay = document.getElementById('gameover-overlay');
  var gameoverText = document.getElementById('gameover-text');
  var finalScoreEl = document.getElementById('final-score');
  var fadeEl = document.getElementById('fade');

  hiScoreDisplay.textContent = 'Legjobb: ' + highScore;

  // ===================== RENDERER, SCENE, CAMERA =====================
  var GAMEPLAY_BG_COLOR = 0xbfefff;
  var SHOWCASE_BG_COLOR = 0xa8dcff;

  var renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(GAMEPLAY_BG_COLOR);
  renderer.toneMapping = THREE.NoToneMapping;
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(GAMEPLAY_BG_COLOR);
  scene.fog = new THREE.FogExp2(GAMEPLAY_BG_COLOR, 0.028);

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

  // ===================== LIGHTS (Phase 7) =====================
  var dirLight = new THREE.DirectionalLight(0xfff4d6, 1.15);
  dirLight.position.set(5, 9, 4);
  scene.add(dirLight);

  var ambLight = new THREE.AmbientLight(0xcdb7ff, 0.72);
  scene.add(ambLight);

  var magicFill = new THREE.PointLight(0xffd85a, 0.55, 10, 2);
  magicFill.position.set(0, 2.4, -6);
  scene.add(magicFill);

  // Showcase lights (will be toggled)
  var showcaseKeyLight = new THREE.DirectionalLight(0xffc3ef, 0.78);
  showcaseKeyLight.position.set(2.5, 4.2, 6.6);
  var showcaseRimLight = new THREE.PointLight(0x6ed8ff, 0.68, 18, 2);
  showcaseRimLight.position.set(-4.2, 2.6, 4.6);
  var showcaseFillLight = new THREE.PointLight(0xffb86e, 0.36, 16, 2);
  showcaseFillLight.position.set(4.4, 1.8, 3.9);

  function setBackgroundColor(hex, fogDensity) {
    renderer.setClearColor(hex);
    scene.background.setHex(hex);
    scene.fog.color.setHex(hex);
    scene.fog.density = fogDensity;
  }

  function setGameplayLighting() {
    if (!scene.getObjectById(dirLight.id)) scene.add(dirLight);
    if (!scene.getObjectById(magicFill.id)) scene.add(magicFill);
    if (!scene.getObjectById(ambLight.id)) scene.add(ambLight);
    scene.remove(showcaseKeyLight);
    scene.remove(showcaseRimLight);
    scene.remove(showcaseFillLight);

    ambLight.color.setHex(0xcdb7ff);
    ambLight.intensity = 0.72;
    dirLight.color.setHex(0xfff4d6);
    dirLight.intensity = 1.15;
    magicFill.color.setHex(0xffd85a);
    magicFill.intensity = 0.55;
    setBackgroundColor(GAMEPLAY_BG_COLOR, 0.028);
  }

  function setShowcaseLighting() {
    scene.remove(dirLight);
    scene.remove(magicFill);
    if (!scene.getObjectById(ambLight.id)) scene.add(ambLight);
    if (!scene.getObjectById(showcaseKeyLight.id)) scene.add(showcaseKeyLight);
    if (!scene.getObjectById(showcaseRimLight.id)) scene.add(showcaseRimLight);
    if (!scene.getObjectById(showcaseFillLight.id)) scene.add(showcaseFillLight);

    ambLight.color.setHex(0x8e7fd7);
    ambLight.intensity = 0.34;
    setBackgroundColor(SHOWCASE_BG_COLOR, 0.014);
  }

  // ===================== GROUND PLANE (Phase 7) =====================
  var groundGeo = new THREE.PlaneGeometry(24, 120);
  var groundTex = makeCloudCourtyardGroundTexture(64);
  groundTex.repeat.set(6, 30);
  var groundMat = new THREE.MeshToonMaterial({ color: 0xcdb7ff, map: groundTex, flatShading: true });
  var ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.11, -46);
  scene.add(ground);

  // ===================== BUILD HERO (Spark) =====================
  var hero = buildHero(getUnicornPalette(selectedUnicornIndex));
  scene.add(hero);

  // ===================== PEDESTAL (for showcase) =====================
  var pedestalGeo = new THREE.BoxGeometry(1.8, 0.18, 1.8);
  var pedestalMat = new THREE.MeshLambertMaterial({ color: 0xcdb7ff });
  var pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.set(0, -0.09, -1.55);
  scene.add(pedestal);

  var showcaseStageGroup = new THREE.Group();
  var showcaseDeck = new THREE.Mesh(
    new THREE.BoxGeometry(12.8, 0.28, 7.4),
    new THREE.MeshToonMaterial({ color: 0xe3d8ff, emissive: 0x593093, emissiveIntensity: 0.04, flatShading: true })
  );
  showcaseDeck.position.set(0, -0.28, 0.45);
  showcaseStageGroup.add(showcaseDeck);

  var showcaseRunway = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.1, 2.9),
    new THREE.MeshToonMaterial({ color: 0xae80f3, emissive: 0x5b2db7, emissiveIntensity: 0.08, flatShading: true })
  );
  showcaseRunway.position.set(0, -0.09, 1.4);
  showcaseStageGroup.add(showcaseRunway);

  var showcaseRearPad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.55, 0.24, 24),
    new THREE.MeshToonMaterial({ color: 0xd8cbff, emissive: 0x6f46c5, emissiveIntensity: 0.05, flatShading: true })
  );
  showcaseRearPad.position.set(0, -0.11, -1.55);
  showcaseStageGroup.add(showcaseRearPad);

  var showcaseArch = new THREE.Mesh(
    new THREE.TorusGeometry(5.4, 0.13, 10, 48, Math.PI),
    new THREE.MeshToonMaterial({ color: 0xead8ff, emissive: 0x8b62ff, emissiveIntensity: 0.14, flatShading: true })
  );
  showcaseArch.position.set(0, 2.15, -0.05);
  showcaseArch.rotation.z = Math.PI;
  showcaseStageGroup.add(showcaseArch);

  scene.add(showcaseStageGroup);

  // ===================== SHOWCASE PREVIEW ROSTER =====================
  var previewSlots = [];
  var showcasePreviewGroup = new THREE.Group();
  var previewPedestalGeo = new THREE.CylinderGeometry(0.72, 0.86, 0.24, 18);
  var previewPedestalCapGeo = new THREE.CylinderGeometry(0.6, 0.66, 0.08, 18);
  var previewRingGeo = new THREE.TorusGeometry(0.42, 0.03, 8, 20);
  var previewRaycaster = new THREE.Raycaster();
  var previewPointer = new THREE.Vector2();
  var hoveredPreviewIndex = -1;
  scene.add(showcasePreviewGroup);

  function updateSelectedUnicornLabel() {
    if (!selectedUnicornLabel) return;
    var labelIndex = hoveredPreviewIndex >= 0 ? hoveredPreviewIndex : selectedUnicornIndex;
    var prefix = hoveredPreviewIndex >= 0 ? 'Koppints, hogy ezzel fuss: ' : 'Kiválasztott unikornis: ';
    selectedUnicornLabel.textContent = prefix + getUnicornPalette(labelIndex).name;
  }

  function findPreviewIndexFromObject(object) {
    while (object) {
      if (object.userData && object.userData.previewIndex !== undefined) return object.userData.previewIndex;
      object = object.parent;
    }
    return -1;
  }

  function getPreviewHitIndex(clientX, clientY) {
    if (gameState !== STATE.SHOWCASE || !showcasePreviewGroup.visible) return -1;
    var rect = renderer.domElement.getBoundingClientRect();
    previewPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    previewPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    previewRaycaster.setFromCamera(previewPointer, camera);
    var hits = previewRaycaster.intersectObjects(previewSlots, true);
    if (!hits.length) return -1;
    return findPreviewIndexFromObject(hits[0].object);
  }

  function setHoveredPreview(index) {
    if (hoveredPreviewIndex === index) return;
    hoveredPreviewIndex = index;
    renderer.domElement.style.cursor = index >= 0 && gameState === STATE.SHOWCASE ? 'pointer' : 'default';
    updateSelectedUnicornLabel();
  }

  function buildPreviewSlot(index) {
    var palette = getUnicornPalette(index);
    var centerIndex = (UNICORN_ROSTER.length - 1) * 0.5;
    var offset = index - centerIndex;
    var slot = new THREE.Group();
    slot.userData.previewIndex = index;
    slot.userData.phaseOffset = index * 0.33;

    var pedestalBase = new THREE.Mesh(
      previewPedestalGeo,
      new THREE.MeshToonMaterial({ color: palette.legs, emissive: 0x2a133f, emissiveIntensity: 0.12, flatShading: true })
    );
    pedestalBase.position.set(0, 0.12, 0);
    slot.add(pedestalBase);

    var pedestalCap = new THREE.Mesh(
      previewPedestalCapGeo,
      new THREE.MeshToonMaterial({ color: palette.body, flatShading: true })
    );
    pedestalCap.position.set(0, 0.27, 0);
    slot.add(pedestalCap);

    var ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd85a,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    });
    var ring = new THREE.Mesh(previewRingGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.33, 0);
    slot.add(ring);

    var previewUnicorn = buildHero(palette);
    previewUnicorn.scale.set(0.82, 0.82, 0.82);
    previewUnicorn.position.set(0, 0.62, 0.02);
    previewUnicorn.rotation.y = Math.PI * 0.94 - offset * 0.12;
    previewUnicorn.userData.previewBaseY = previewUnicorn.position.y;
    slot.add(previewUnicorn);

    slot.position.set(offset * 1.78, -0.12 + Math.abs(offset) * 0.04, 1.35 + Math.abs(offset) * 0.24);
    slot.rotation.y = offset * -0.08;
    slot.userData.ring = ring;
    slot.userData.previewUnicorn = previewUnicorn;

    slot.traverse(function (child) {
      child.userData.previewIndex = index;
    });

    return slot;
  }

  function rebuildHeroFromSelection() {
    var heroX = hero.position.x;
    var heroY = hero.position.y;
    var heroZ = hero.position.z;
    var rotX = hero.rotation.x;
    var rotY = hero.rotation.y;
    var rotZ = hero.rotation.z;
    var scaleX = hero.scale.x;
    var scaleY = hero.scale.y;
    var scaleZ = hero.scale.z;
    var wasVisible = hero.visible;

    scene.remove(hero);
    hero = buildHero(getUnicornPalette(selectedUnicornIndex));
    scene.add(hero);
    hero.position.set(heroX, heroY, heroZ);
    hero.rotation.set(rotX, rotY, rotZ);
    hero.scale.set(scaleX, scaleY, scaleZ);
    hero.visible = wasVisible;
    hero.userData.showcaseBaseY = heroY;
    resetHeroMagicParticles();
  }

  function setSelectedUnicorn(index) {
    var nextIndex = clampUnicornIndex(index);
    if (selectedUnicornIndex !== nextIndex) {
      selectedUnicornIndex = nextIndex;
      storeSelectedUnicornIndex(selectedUnicornIndex);
      rebuildHeroFromSelection();
    }
    updateSelectedUnicornLabel();
  }

  function updatePreviewPresentation(dt, timeSeconds) {
    if (!showcasePreviewGroup.visible) return;

    for (var i = 0; i < previewSlots.length; i++) {
      var slot = previewSlots[i];
      var previewUnicorn = slot.userData.previewUnicorn;
      var ring = slot.userData.ring;
      var phaseTime = timeSeconds + slot.userData.phaseOffset;
      var isSelected = i === selectedUnicornIndex;
      var isHovered = i === hoveredPreviewIndex;
      var targetScale = isSelected ? 1.08 : 1.0;
      var targetOpacity = isSelected ? 0.95 : 0.16;
      var targetColor = 0xe7c26b;

      if (isHovered) {
        targetScale += 0.08;
        if (!isSelected) targetOpacity = 0.4;
        targetColor = 0xffeb9a;
      }
      if (isSelected) targetColor = 0xffd85a;

      previewUnicorn.position.y = previewUnicorn.userData.previewBaseY + Math.abs(Math.sin(phaseTime * 7.6)) * 0.045;
      animateUnicorn(previewUnicorn, phaseTime, 'gallop', SCROLL.initial);

      slot.scale.x += (targetScale - slot.scale.x) * Math.min(1, dt * 10);
      slot.scale.y = slot.scale.x;
      slot.scale.z = slot.scale.x;

      ring.material.opacity += (targetOpacity - ring.material.opacity) * Math.min(1, dt * 12);
      ring.material.color.setHex(targetColor);
    }
  }

  for (var previewIndex = 0; previewIndex < UNICORN_ROSTER.length; previewIndex++) {
    var previewSlot = buildPreviewSlot(previewIndex);
    previewSlots.push(previewSlot);
    showcasePreviewGroup.add(previewSlot);
  }

  renderer.domElement.addEventListener('pointermove', function (event) {
    setHoveredPreview(getPreviewHitIndex(event.clientX, event.clientY));
  });

  renderer.domElement.addEventListener('pointerleave', function () {
    setHoveredPreview(-1);
  });

  renderer.domElement.addEventListener('pointerdown', function (event) {
    var hitIndex = getPreviewHitIndex(event.clientX, event.clientY);
    if (hitIndex >= 0) {
      event.preventDefault();
      ensureBackgroundMusicStarted();
      setSelectedUnicorn(hitIndex);
      updateMusicForState();
    }
  });

  updateSelectedUnicornLabel();

  // ===================== SPARKLE DUST (120 particles) =====================
  var DUST_COUNT = 120;
  var dustPositions = new Float32Array(DUST_COUNT * 3);
  for (var di = 0; di < DUST_COUNT; di++) {
    dustPositions[di * 3] = (Math.random() - 0.5) * 12;
    dustPositions[di * 3 + 1] = 0.8 + Math.random() * 3.2;
    dustPositions[di * 3 + 2] = -60 + Math.random() * 70;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  var dustMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.42, depthWrite: false });
  var dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  var HERO_MAGIC_COUNT = 54;
  var heroMagicPositions = new Float32Array(HERO_MAGIC_COUNT * 3);
  var heroMagicColors = new Float32Array(HERO_MAGIC_COUNT * 3);
  var heroMagicLife = new Float32Array(HERO_MAGIC_COUNT);
  var heroMagicVelX = new Float32Array(HERO_MAGIC_COUNT);
  var heroMagicVelY = new Float32Array(HERO_MAGIC_COUNT);
  var heroMagicVelZ = new Float32Array(HERO_MAGIC_COUNT);
  var heroMagicGeo = new THREE.BufferGeometry();
  heroMagicGeo.setAttribute('position', new THREE.BufferAttribute(heroMagicPositions, 3));
  heroMagicGeo.setAttribute('color', new THREE.BufferAttribute(heroMagicColors, 3));
  var heroMagicMat = new THREE.PointsMaterial({
    size: 0.12,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });
  var heroMagicPoints = new THREE.Points(heroMagicGeo, heroMagicMat);
  scene.add(heroMagicPoints);

  function setRgbAt(buffer, index, hex) {
    buffer[index] = ((hex >> 16) & 255) / 255;
    buffer[index + 1] = ((hex >> 8) & 255) / 255;
    buffer[index + 2] = (hex & 255) / 255;
  }

  function getActiveUnicorn() {
    return getUnicornPalette(selectedUnicornIndex);
  }

  function respawnHeroMagicParticle(i, palette) {
    var mode = palette.particleMode || 'sparkle';
    var idx = i * 3;
    var legs = hero.userData && hero.userData.anim ? hero.userData.anim.legs : null;
    var rearLeg = legs ? legs[(Math.random() < 0.5) ? 2 : 3] : null;
    var heroYaw = hero.rotation.y;
    var backX = Math.sin(heroYaw);
    var backZ = Math.cos(heroYaw);
    var sideX = Math.cos(heroYaw);
    var sideZ = -Math.sin(heroYaw);
    var localLegX = rearLeg ? rearLeg.position.x * hero.scale.x : (Math.random() < 0.5 ? -0.15 : 0.15) * hero.scale.x;
    var localLegY = rearLeg ? rearLeg.position.y * hero.scale.y : -0.42 * hero.scale.y;
    var localLegZ = rearLeg ? rearLeg.position.z * hero.scale.z : 0.28 * hero.scale.z;
    var hoofX = hero.position.x + localLegX * Math.cos(heroYaw) + localLegZ * Math.sin(heroYaw);
    var hoofY = hero.position.y + localLegY - 0.17 * hero.scale.y;
    var hoofZ = hero.position.z - localLegX * Math.sin(heroYaw) + localLegZ * Math.cos(heroYaw);
    var groundOffset = 0.08 + Math.random() * 0.42;
    var sideOffset = (Math.random() - 0.5) * 0.26;
    var driftSpeed = 0.34 + Math.random() * 0.18;
    var sideSpeed = (Math.random() - 0.5) * 0.14;
    var velX = backX * driftSpeed + sideX * sideSpeed;
    var velY = (Math.random() - 0.5) * 0.012;
    var velZ = backZ * driftSpeed + sideZ * sideSpeed;

    heroMagicPositions[idx] = hoofX + backX * groundOffset + sideX * sideOffset;
    heroMagicPositions[idx + 1] = hoofY + Math.random() * 0.12;
    heroMagicPositions[idx + 2] = hoofZ + backZ * groundOffset + sideZ * sideOffset;

    if (mode === 'leaf') {
      groundOffset = 0.1 + Math.random() * 0.5;
      sideOffset = (Math.random() - 0.5) * 0.34;
      heroMagicPositions[idx] = hoofX + backX * groundOffset + sideX * sideOffset;
      heroMagicPositions[idx + 1] = hoofY + Math.random() * 0.08;
      heroMagicPositions[idx + 2] = hoofZ + backZ * groundOffset + sideZ * sideOffset;
      velX = backX * (0.3 + Math.random() * 0.14) + sideX * ((Math.random() - 0.5) * 0.18);
      velY = -0.008 + Math.random() * 0.02;
      velZ = backZ * (0.3 + Math.random() * 0.14) + sideZ * ((Math.random() - 0.5) * 0.18);
    } else if (mode === 'snow') {
      groundOffset = 0.08 + Math.random() * 0.42;
      sideOffset = (Math.random() - 0.5) * 0.28;
      heroMagicPositions[idx] = hoofX + backX * groundOffset + sideX * sideOffset;
      heroMagicPositions[idx + 1] = hoofY + 0.03 + Math.random() * 0.12;
      heroMagicPositions[idx + 2] = hoofZ + backZ * groundOffset + sideZ * sideOffset;
      velX = backX * (0.24 + Math.random() * 0.1) + sideX * ((Math.random() - 0.5) * 0.12);
      velY = -0.018 - Math.random() * 0.018;
      velZ = backZ * (0.24 + Math.random() * 0.1) + sideZ * ((Math.random() - 0.5) * 0.12);
    } else if (mode === 'wave') {
      groundOffset = 0.12 + Math.random() * 0.6;
      sideOffset = (Math.random() - 0.5) * 0.32;
      heroMagicPositions[idx] = hoofX + backX * groundOffset + sideX * sideOffset;
      heroMagicPositions[idx + 1] = hoofY + 0.02 + Math.random() * 0.08;
      heroMagicPositions[idx + 2] = hoofZ + backZ * groundOffset + sideZ * sideOffset;
      velX = backX * (0.36 + Math.random() * 0.2) + sideX * ((Math.random() - 0.5) * 0.08);
      velY = (Math.random() - 0.5) * 0.012;
      velZ = backZ * (0.36 + Math.random() * 0.2) + sideZ * ((Math.random() - 0.5) * 0.08);
    } else if (mode === 'fire') {
      groundOffset = 0.06 + Math.random() * 0.34;
      sideOffset = (Math.random() - 0.5) * 0.22;
      heroMagicPositions[idx] = hoofX + backX * groundOffset + sideX * sideOffset;
      heroMagicPositions[idx + 1] = hoofY + Math.random() * 0.06;
      heroMagicPositions[idx + 2] = hoofZ + backZ * groundOffset + sideZ * sideOffset;
      velX = backX * (0.2 + Math.random() * 0.1) + sideX * ((Math.random() - 0.5) * 0.06);
      velY = 0.03 + Math.random() * 0.05;
      velZ = backZ * (0.2 + Math.random() * 0.1) + sideZ * ((Math.random() - 0.5) * 0.06);
    } else if (mode === 'storm') {
      groundOffset = 0.08 + Math.random() * 0.44;
      sideOffset = (Math.random() - 0.5) * 0.24;
      heroMagicPositions[idx] = hoofX + backX * groundOffset + sideX * sideOffset;
      heroMagicPositions[idx + 1] = hoofY + 0.05 + Math.random() * 0.12;
      heroMagicPositions[idx + 2] = hoofZ + backZ * groundOffset + sideZ * sideOffset;
      velX = backX * (0.42 + Math.random() * 0.16) + sideX * ((Math.random() - 0.5) * 0.16);
      velY = (Math.random() - 0.5) * 0.016;
      velZ = backZ * (0.42 + Math.random() * 0.16) + sideZ * ((Math.random() - 0.5) * 0.16);
    }

    heroMagicVelX[i] = velX;
    heroMagicVelY[i] = velY;
    heroMagicVelZ[i] = velZ;
    heroMagicLife[i] = 0.22 + Math.random() * 0.38;
    setRgbAt(heroMagicColors, idx, palette.particleColors[Math.floor(Math.random() * palette.particleColors.length)]);
  }

  function resetHeroMagicParticles() {
    var palette = getActiveUnicorn();
    heroMagicMat.size = palette.particleSize || 0.12;
    for (var i = 0; i < HERO_MAGIC_COUNT; i++) {
      respawnHeroMagicParticle(i, palette);
      heroMagicLife[i] *= Math.random();
    }
    heroMagicGeo.attributes.position.needsUpdate = true;
    heroMagicGeo.attributes.color.needsUpdate = true;
  }

  function updateHeroMagic(dt, now) {
    var visible = gameState === STATE.PLAYING || gameState === STATE.SHOWCASE;
    heroMagicPoints.visible = visible;
    if (!visible) return;

    var palette = getActiveUnicorn();
    var mode = palette.particleMode || 'sparkle';
    var elapsed = now * 0.001;
    var posArr = heroMagicGeo.attributes.position.array;

    for (var i = 0; i < HERO_MAGIC_COUNT; i++) {
      var idx = i * 3;
      heroMagicLife[i] -= dt;
      posArr[idx] += heroMagicVelX[i] * dt;
      posArr[idx + 1] += heroMagicVelY[i] * dt;
      posArr[idx + 2] += heroMagicVelZ[i] * dt;

      if (mode === 'sparkle') {
        posArr[idx] += Math.sin(elapsed * 7 + i * 0.6) * 0.0048;
        posArr[idx + 1] += Math.abs(Math.cos(elapsed * 8 + i * 0.4)) * 0.0012;
        posArr[idx + 2] += Math.sin(elapsed * 6 + i * 0.3) * 0.0022;
      } else if (mode === 'leaf') {
        posArr[idx] += Math.sin(elapsed * 4 + i * 0.7) * 0.005;
        posArr[idx + 1] -= 0.01 * dt;
        posArr[idx + 2] += Math.cos(elapsed * 3 + i) * 0.003;
      } else if (mode === 'snow') {
        posArr[idx] += Math.sin(elapsed * 2.5 + i * 0.5) * 0.0025;
        posArr[idx + 1] -= 0.016 * dt;
      } else if (mode === 'wave') {
        posArr[idx] += Math.sin(elapsed * 5 + i * 0.5) * 0.004;
        posArr[idx + 1] += Math.sin(elapsed * 6 + i * 0.35) * 0.0011;
        posArr[idx + 2] += Math.cos(elapsed * 4 + i * 0.35) * 0.002;
      } else if (mode === 'fire') {
        posArr[idx] += Math.sin(elapsed * 10 + i) * 0.002;
        posArr[idx + 1] += 0.018 * dt;
        posArr[idx + 2] += Math.cos(elapsed * 9 + i * 0.5) * 0.0016;
      } else if (mode === 'storm') {
        posArr[idx] += (Math.random() - 0.5) * 0.012;
        posArr[idx + 1] += (Math.random() - 0.5) * 0.006;
        posArr[idx + 2] += (Math.random() - 0.5) * 0.009;
      }

      var dx = posArr[idx] - hero.position.x;
      var dy = posArr[idx + 1] - hero.position.y;
      var dz = posArr[idx + 2] - hero.position.z;
      if (
        heroMagicLife[i] <= 0 ||
        dx * dx + dy * dy + dz * dz > 3.4 ||
        posArr[idx + 1] < hero.position.y - 0.3 ||
        posArr[idx + 1] > hero.position.y + 0.36
      ) {
        respawnHeroMagicParticle(i, palette);
      }
    }

    heroMagicGeo.attributes.position.needsUpdate = true;
  }

  resetHeroMagicParticles();

  // ===================== DECORATIVES =====================
  var decoAGroup = buildDecoA();
  scene.add(decoAGroup);
  var decoBGroup = buildDecoB();
  scene.add(decoBGroup);
  var decoCGroup = buildDecoC();
  scene.add(decoCGroup);

  // ===================== PLATFORM TILES =====================
  var tiles = [];
  var tileOriginalZ = [];

  function createTile(zPos) {
    var tileGroup = buildPlatformTile();
    tileGroup.position.set(0, -0.04, zPos);
    scene.add(tileGroup);
    return tileGroup;
  }

  function initTiles() {
    for (var t = 0; t < tiles.length; t++) {
      scene.remove(tiles[t]);
    }
    tiles = [];
    tileOriginalZ = [];
    for (var i = 0; i < TILE.count; i++) {
      var z = -i * TILE.depth;
      var tile = createTile(z);
      tiles.push(tile);
      tileOriginalZ.push(z);
    }
  }

  // ===================== OBSTACLE & COLLECTIBLE POOLS =====================
  var obstacles = [];
  var collectibles = [];

  function laneX(lane) { return (lane - 1) * PHYSICS.laneWidth; }

  function spawnObstacle(lane, z, isAerial) {
    var mesh;
    if (isAerial) {
      mesh = buildObstacleAerial();
      mesh.position.set(laneX(lane), PHYSICS.aerialObstacleY, z);
      mesh.userData.isAerial = true;
    } else {
      mesh = buildObstacleGround();
      mesh.position.set(laneX(lane), PHYSICS.groundObstacleY, z);
      mesh.userData.isAerial = false;
    }
    scene.add(mesh);
    obstacles.push(mesh);
  }

  function spawnCollectibleAt(lane, z) {
    var mesh = buildCollectible();
    mesh.position.set(laneX(lane), PHYSICS.collectibleY, z);
    scene.add(mesh);
    collectibles.push(mesh);
  }

  // ===================== PRE-ALLOCATED VECTORS =====================
  // (No new Vector3/Color/Matrix inside animation loop)
  var _dustArr; // will reference dustGeo attribute

  // ===================== GAME STATE VARIABLES =====================
  var playerLane = 1; // 0=left, 1=center, 2=right
  var playerVelY = 0;
  var playerY = PHYSICS.playerGroundY;
  var isGrounded = true;
  var scrollSpeed = SCROLL.initial;
  var elapsedTime = 0;
  var spawnTimer = 0;
  var currentSpawnInterval = SPAWN.initialInterval;
  var gameOverTimer = 0;
  var gameOverPhase = 0; // 0=not, 1=waiting, 2=fading
  var fadeTimer = 0;
  var isStarting = false;     // blocks double start during the fade
  var stumbleTimer = 0;       // >0 while briefly invulnerable after a bump
  var lives = 3;              // három élet: minden ütközés egyet visz el, de nincs szigor, csak villogás
  function updateLives() { var s = ''; for (var i = 0; i < 3; i++) s += i < lives ? '\u2764\uFE0F' : '\uD83E\uDD0D'; if (livesDisplay) livesDisplay.textContent = s; }

  // ===================== INPUT (discrete lane toggle) =====================
  window.addEventListener('keydown', function (e) {
    if (gameState === STATE.SHOWCASE && e.code === 'Space') {
      e.preventDefault();
      startGame();
    } else if (gameState === STATE.PLAYING) {
      if (e.code === 'Space') {
        e.preventDefault();
        tryJump();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        if (playerLane > 0) playerLane--;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        if (playerLane < 2) playerLane++;
      }
    }
  });

  if (startBtn) {
    startBtn.textContent = 'JÁTÉK';
    startBtn.addEventListener('click', function () {
      if (gameState === STATE.SHOWCASE) startGame();
    });
  }

  // ===================== TOUCH / PEN CONTROLS =====================
  // Tap left/right third = change lane, tap middle = jump,
  // swipe left/right = change lane, swipe up = jump. Works for finger and Apple Pencil.
  var touchStart = null;
  renderer.domElement.addEventListener('pointerdown', function (event) {
    if (gameState !== STATE.PLAYING) return;
    event.preventDefault();
    getAudioCtx();
    touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY, handled: false };
  });
  renderer.domElement.addEventListener('pointermove', function (event) {
    if (!touchStart || touchStart.id !== event.pointerId || touchStart.handled) return;
    if (gameState !== STATE.PLAYING) return;
    var dx = event.clientX - touchStart.x;
    var dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      touchStart.handled = true;
      if (dx < 0 && playerLane > 0) playerLane--;
      else if (dx > 0 && playerLane < 2) playerLane++;
    } else if (dy < -40 && Math.abs(dy) > Math.abs(dx)) {
      touchStart.handled = true;
      tryJump();
    }
  });
  function endTouch(event) {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    var start = touchStart;
    touchStart = null;
    if (start.handled || gameState !== STATE.PLAYING || event.type === 'pointercancel') return;
    var third = window.innerWidth / 3;
    if (start.x < third) { if (playerLane > 0) playerLane--; }
    else if (start.x > third * 2) { if (playerLane < 2) playerLane++; }
    else tryJump();
  }
  renderer.domElement.addEventListener('pointerup', endTouch);
  renderer.domElement.addEventListener('pointercancel', endTouch);

  // ===================== GAME FLOW =====================
  function tryJump() {
    if (isGrounded) {
      playerVelY = PHYSICS.jumpForce;
      isGrounded = false;
      playSFX('jump');
    }
  }

  function startGame() {
    if (isStarting) return;
    isStarting = true;
    getAudioCtx();
    ensureBackgroundMusicStarted();
    setHoveredPreview(-1);
    // Fade out overlay
    fadeEl.style.display = 'block';
    fadeEl.style.opacity = '1';
    setTimeout(function() {
      gameState = STATE.PLAYING;
      score = 0;
      elapsedTime = 0;
      scrollSpeed = SCROLL.initial;
      playerLane = 1;
      playerY = PHYSICS.playerGroundY;
      playerVelY = 0;
      isGrounded = true;
      spawnTimer = 0;
      currentSpawnInterval = SPAWN.initialInterval;
      gameOverTimer = 0;
      gameOverPhase = 0;
      clearEntities();
      startOverlay.style.display = 'none';
      gameoverOverlay.style.display = 'none';
      scoreDisplay.textContent = 'Csillagok: 0';
      stumbleTimer = 0;
      lives = 3; updateLives();
      hero.visible = true;
      isStarting = false;
      // Position hero for running - Z is ALWAYS 0
      hero.position.set(laneX(1), PHYSICS.playerGroundY, 0);
      hero.scale.set(1, 1, 1);
      hero.userData.showcaseBaseY = PHYSICS.playerGroundY;
      hero.userData.landingSquash = 0;
      hero.rotation.y = 0;
      resetHeroMagicParticles();
      pedestal.visible = false;
      showcaseStageGroup.visible = false;
      showcasePreviewGroup.visible = false;
      setGameplayLighting();
      updateMusicForState();
      // Init tiles
      initTiles();
      for (var t = 0; t < tiles.length; t++) tiles[t].visible = true;
      // Camera behind hero
      camera.position.set(0, VIEW.gameplayCameraY, VIEW.gameplayCameraZ);
      camera.lookAt(0, VIEW.gameplayLookY, VIEW.gameplayLookZ);
      ground.visible = true;
      decoAGroup.visible = true;
      decoBGroup.visible = true;
      decoCGroup.visible = true;
      // Fade in
      fadeEl.style.opacity = '0';
      setTimeout(function() { fadeEl.style.display = 'none'; }, 450);
    }, 450);
  }

  function clearEntities() {
    for (var i = 0; i < obstacles.length; i++) {
      scene.remove(obstacles[i]);
    }
    obstacles = [];
    for (var j = 0; j < collectibles.length; j++) {
      scene.remove(collectibles[j]);
    }
    collectibles = [];
  }

  function enterShowcase() {
    gameState = STATE.SHOWCASE;
    clearEntities();
    setHoveredPreview(-1);
    showcaseElapsed = 0;
    showcaseStageGroup.visible = true;
    pedestal.visible = true;
    pedestal.position.set(0, -0.09, -1.55);
    hero.position.set(0, VIEW.showcaseHeroY, -1.55);
    hero.scale.set(1.16, 1.16, 1.16);
    hero.userData.showcaseBaseY = VIEW.showcaseHeroY;
    hero.rotation.y = Math.PI * 0.9;
    hero.userData.landingSquash = 0;
    resetHeroMagicParticles();
    showcasePreviewGroup.visible = true;
    // Showcase camera
    camera.position.set(0, 2.95, 7.35);
    camera.lookAt(0, 0.88, 0.35);
    setShowcaseLighting();
    updateMusicForState();
    startOverlay.style.display = 'flex';
    if (startBtn) startBtn.textContent = 'JÁTÉK';
    isStarting = false;
    hero.visible = true;
    gameoverOverlay.style.display = 'none';
    // Hide gameplay stuff
    for (var i = 0; i < tiles.length; i++) tiles[i].visible = false;
    ground.visible = false;
    decoAGroup.visible = false;
    decoBGroup.visible = false;
    decoCGroup.visible = false;
    updateSelectedUnicornLabel();
    fadeEl.style.opacity = '0';
    setTimeout(function() { fadeEl.style.display = 'none'; }, 450);
  }

  function triggerGameOver(reason) {
    gameState = STATE.GAME_OVER;
    setHoveredPreview(-1);
    if (reason === 'lives') {
      playSFX('collectible');
      gameoverText.textContent = 'Majdnem sikerült!';
      gameoverHint.textContent = 'Próbáld újra, menni fog!';
    } else {
      playSFX('win');
      gameoverText.textContent = 'Ügyes voltál!';
      gameoverHint.textContent = 'Mindjárt választhatsz új unikornist…';
    }
    updateMusicForState();
    hero.visible = true;
    if (score > highScore) {
      highScore = Math.floor(score);
      try { localStorage.setItem(HISCORE_KEY, '' + highScore); } catch (err) {}
    }
    hiScoreDisplay.textContent = 'Legjobb: ' + highScore;
    finalScoreEl.textContent = '⭐ ' + Math.floor(score) + ' csillag';
    gameoverOverlay.style.display = 'flex';
    gameOverPhase = 1;
    gameOverTimer = 0;
  }

  // ===================== AABB COLLISION =====================
  function aabbOverlap(ax, ay, az, ahx, ahy, ahz, bx, by, bz, bhx, bhy, bhz) {
    return (
      Math.abs(ax - bx) < (ahx + bhx) &&
      Math.abs(ay - by) < (ahy + bhy) &&
      Math.abs(az - bz) < (ahz + bhz)
    );
  }

  // ===================== PATTERN SPAWNING (Phase 6) =====================
  // A: 1 ground obstacle at lane 1, 2 collectibles at lanes 0–2 | unlock 0s
  // B: 1 ground obstacle random lane, 1 collectible | unlock 10s
  // C: 1 aerial obstacle random lane, 1 collectible | unlock 25s
  // D: 1 ground + 1 aerial (different lanes), 1 collectible | unlock 50s
  function spawnPattern(z) {
    var patterns = ['A'];
    if (elapsedTime >= 10) patterns.push('B');
    if (elapsedTime >= 25) patterns.push('C');
    if (elapsedTime >= 50) patterns.push('D');
    var pat = patterns[Math.floor(Math.random() * patterns.length)];

    if (pat === 'A') {
      spawnObstacle(1, z, false);
      spawnCollectibleAt(0, z);
      spawnCollectibleAt(2, z);
    } else if (pat === 'B') {
      var lane = getRandomLane();
      spawnObstacle(lane, z, false);
      var cl = getDiffLane(lane);
      spawnCollectibleAt(cl, z);
    } else if (pat === 'C') {
      var alane = getRandomLane();
      spawnObstacle(alane, z, true);
      var cl2 = getDiffLane(alane);
      spawnCollectibleAt(cl2, z);
    } else if (pat === 'D') {
      var gl = getRandomLane();
      spawnObstacle(gl, z, false);
      var al = getDiffLane(gl);
      spawnObstacle(al, z, true);
      var col = 3 - gl - al; // the one remaining free lane
      spawnCollectibleAt(col, z);
    }
  }

  // ===================== MAIN LOOP =====================
  var lastTime = 0;
  var showcaseElapsed = 0;

  function animate(now) {
    if (document.hidden) {
      requestAnimationFrame(animate);
      return;
    }
    var dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.1) dt = 0.1;
    if (isNaN(dt) || dt <= 0) dt = 0.016;

    if (gameState === STATE.SHOWCASE) {
      updateShowcase(dt, now);
    } else if (gameState === STATE.PLAYING) {
      updatePlaying(dt, now);
    } else if (gameState === STATE.GAME_OVER) {
      updateGameOver(dt);
    }

    updateDust(dt, now);
    updateHeroMagic(dt, now);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function updateShowcase(dt, now) {
    showcaseElapsed += dt;
    var timeSeconds = now * 0.001;
    hero.position.y = (hero.userData.showcaseBaseY || 0) + Math.sin(timeSeconds * 2.0) * 0.08;
    hero.rotation.y = Math.PI * 0.92 + Math.sin(timeSeconds * 0.55) * 0.18;
    animateUnicorn(hero, timeSeconds, 'idle', 0);
    updatePreviewPresentation(dt, timeSeconds);
    camera.position.set(0, 2.95, 7.35);
    camera.lookAt(0, 0.88, 0.35);
  }

  function updatePlaying(dt, now) {
    if (gameState !== STATE.PLAYING) return;
    var timeSeconds = now * 0.001;
    var wasGrounded = isGrounded;
    elapsedTime += dt;
    // Scroll speed ramp
    scrollSpeed = Math.min(SCROLL.max, SCROLL.initial + SCROLL.rampRate * elapsedTime);
    var scrollDelta = scrollSpeed * dt;
    // Score: 1 point per unit scrolled

    // Lane snap - hero X follows lane, hero Z = 0 ALWAYS
    var targetX = laneX(playerLane);
    var dx = targetX - hero.position.x;
    hero.position.x += dx * PHYSICS.laneSnapSpeed * dt;
    hero.position.z = 0; // HERO Z IS ALWAYS 0

    // Jump / gravity
    if (!isGrounded) {
      playerVelY += PHYSICS.gravity * dt;
      if (playerVelY < PHYSICS.maxFallSpeed) playerVelY = PHYSICS.maxFallSpeed;
      playerY += playerVelY * dt;
      if (playerY <= PHYSICS.playerGroundY) {
        playerY = PHYSICS.playerGroundY;
        playerVelY = 0;
        isGrounded = true;
      }
    }
    hero.position.y = playerY;
    if (!wasGrounded && isGrounded) {
      hero.userData.landingSquash = 1;
    }
    hero.userData.landingSquash = Math.max(0, hero.userData.landingSquash - dt * 4.5);
    animateUnicorn(hero, timeSeconds, 'gallop-speed', scrollSpeed);

    // Camera follows hero X slightly while framing the full unicorn higher above the track.
    camera.position.set(hero.position.x * 0.26, VIEW.gameplayCameraY, VIEW.gameplayCameraZ);
    camera.lookAt(hero.position.x * 0.4, VIEW.gameplayLookY, VIEW.gameplayLookZ);

    // Ground plane is static (Phase 17)

    // Move obstacles toward player (+Z direction)
    for (var i = obstacles.length - 1; i >= 0; i--) {
      var ob = obstacles[i];
      ob.position.z += scrollDelta;
      // Despawn behind
      if (ob.position.z > SPAWN.despawnBehind + 0) {
        scene.remove(ob);
        obstacles.splice(i, 1);
        continue;
      }
      // Collision with hero
      var hx = hero.position.x;
      var hy = playerY + PHYSICS.heroCenterY;
      var hz = 0;
      var obsCenterY = ob.userData.isAerial ? PHYSICS.aerialObstacleY : PHYSICS.groundObstacleY;
      if (
        aabbOverlap(
          hx,
          hy,
          hz,
          HERO_HALF.x,
          HERO_HALF.y,
          HERO_HALF.z,
          ob.position.x,
          obsCenterY,
          ob.position.z,
          OBS_HALF.x,
          OBS_HALF.y,
          OBS_HALF.z
        )
      ) {
        if (stumbleTimer <= 0) {
          // Gentle bump: no game over. Brief blink + hop, keep running.
          stumbleTimer = STUMBLE_SECONDS;
          lives--; updateLives();
          if (lives <= 0) { triggerGameOver('lives'); return; }
          playSFX('jump');
          if (isGrounded) { playerVelY = 6; isGrounded = false; }
        }
        scene.remove(ob);
        obstacles.splice(i, 1);
        continue;
      }
    }

    // Move collectibles toward player
    for (var j = collectibles.length - 1; j >= 0; j--) {
      var col = collectibles[j];
      col.position.z += scrollDelta;
      col.rotation.y += 2.0 * dt;
      if (col.position.z > SPAWN.despawnBehind) {
        scene.remove(col);
        collectibles.splice(j, 1);
        continue;
      }
      var cx = hero.position.x;
      var cy = playerY + PHYSICS.heroCenterY;
      var cz = 0;
      if (aabbOverlap(cx, cy, cz, HERO_HALF.x, HERO_HALF.y, HERO_HALF.z,
        col.position.x, col.position.y, col.position.z, COL_HALF.x, COL_HALF.y, COL_HALF.z)) {
        score += 1;
        playSFX('collectible');
        scene.remove(col);
        collectibles.splice(j, 1);
      }
    }
    var frontZ = camera.position.z + 2;
    // Deterministic O(1) recycle: keep one ring buffer using each tile's index
    // Tiles advance by scrollDelta; when a tile crosses frontZ it is recycled to back.
    for (var t = 0; t < tiles.length; t++) {
      tiles[t].position.z += scrollDelta;
      if (tiles[t].position.z > frontZ) {
        tiles[t].position.z = (frontZ - TILE.depth * TILE.count);
      }
    }

    // Decoratives scroll
    decoAGroup.position.z += scrollDelta;
    if (decoAGroup.position.z > 10) decoAGroup.position.z -= 50;
    decoBGroup.position.z += scrollDelta;
    if (decoBGroup.position.z > 10) decoBGroup.position.z -= 50;
    decoBGroup.rotation.y += 0.3 * dt; // deco-b rotates slowly
    // deco-c scrolls very slowly
    decoCGroup.position.z += scrollDelta * 0.1;
    if (decoCGroup.position.z > 10) decoCGroup.position.z -= 60;

    // Spawn interval decay
    currentSpawnInterval = Math.max(SPAWN.minInterval, SPAWN.initialInterval - SPAWN.intervalDecay * elapsedTime);

    // Spawn logic
    spawnTimer += dt;
    if (spawnTimer >= currentSpawnInterval) {
      spawnTimer = 0;
      spawnPattern(-SPAWN.aheadDistance);
    }

    // Phase 6/8/9: enforce correct spawn/despawn and never move hero.z.
    // (hero.z already stays at 0 in this implementation)

    // Stumble blink (no penalty, just a friendly flash)
    if (stumbleTimer > 0) {
      stumbleTimer -= dt;
      hero.visible = stumbleTimer <= 0 ? true : (Math.floor(stumbleTimer * 10) % 2 === 0);
    } else {
      hero.visible = true;
    }

    scoreDisplay.textContent = 'Csillagok: ' + Math.floor(score);

    // Round ends kindly after ROUND_SECONDS
    if (elapsedTime >= ROUND_SECONDS) {
      triggerGameOver();
    }
  }

  function updateGameOver(dt) {
    if (gameOverPhase === 1) {
      gameOverTimer += dt;
      if (gameOverTimer >= 1.5) {
        gameOverPhase = 2;
        fadeEl.style.display = 'block';
        fadeEl.style.opacity = '1';
        fadeTimer = 0;
      }
    } else if (gameOverPhase === 2) {
      fadeTimer += dt;
      if (fadeTimer >= 0.45) {
        enterShowcase();
        gameOverPhase = 0;
      }
    }
  }

  function updateDust(dt, now) {
    var posAttr = dustGeo.attributes.position;
    var arr = posAttr.array;
    var elapsed = now * 0.001;

    for (var i = 0; i < DUST_COUNT; i++) {
      var idx = i * 3;
      // Upward drift
      arr[idx + 1] += 0.18 * dt;
      // Gentle sway
      arr[idx] += Math.sin(elapsed * 1.4 + i) * 0.0025;
      // Scroll at 35% game speed
      if (gameState === STATE.PLAYING) {
        arr[idx + 2] += scrollSpeed * dt * 0.35;
      }
      // Respawn to exact ranges (Phase 18)
      if (arr[idx + 1] > 4.2) arr[idx + 1] = 0.8 + Math.random() * (4.2 - 0.8);
      if (arr[idx + 2] > 10) arr[idx + 2] = -60 + Math.random() * (10 - -60);
      // Phase 18: Y drift 0.18 already, X sway 0.0025 already, Z scroll handled above.
    }
    posAttr.needsUpdate = true;
    // Slow rotation
    dustPoints.rotation.y = elapsed * 0.03;
  }

  // ===================== RESIZE =====================
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ===================== START =====================
  enterShowcase();
  setShowcaseLighting();
  lastTime = performance.now();
  requestAnimationFrame(animate);

})();
