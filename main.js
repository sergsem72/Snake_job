(function (win, doc) {
  let scene, camera, renderer;
  const gridSize = 750;
  const unitSize = 50;
  const appleSize = 25;
  const speed = 15;
  let snake = [];
  let renderCounter = 0;
  let raf;
  let tag = null;
  const apple = new Audio(
    "https://cdn.jsdelivr.net/gh/sergsem72/Snake_job@4f2cf44193e5eb59b1b41901d998fe04c66be352/apple.mp3"
  );
  const gameover = new Audio(
    "https://cdn.jsdelivr.net/gh/sergsem72/Snake_job@4f2cf44193e5eb59b1b41901d998fe04c66be352/semen.mp3"
  );

  const gameScoreBoard = doc.getElementById("gamescore");
  const pauseScreen = doc.getElementById("pause");

  function showPauseScreen() {
    pauseScreen.className = "paused";
  }
  function hidePauseScreen() {
    pauseScreen.className = "paused hidden";
  }

  const keys = {
    38: "backward", //назад
    40: "forward", //вперед
    39: "right", //вправо
    37: "left", //влево
    32: "pause", //пауза
  };
  const keyActions = {
    backward: {
      enabled: true,
      action: function () {
        snake.back();
        keyActions.forward.enabled = false;
        keyActions.right.enabled = true;
        keyActions.left.enabled = true;
        keyActions.pause.enabled = true;
        hidePauseScreen();
      },
    },
    forward: {
      enabled: true,
      action: function () {
        snake.forward();
        keyActions.backward.enabled = false;
        keyActions.right.enabled = true;
        keyActions.left.enabled = true;
        keyActions.pause.enabled = true;
        hidePauseScreen();
      },
    },
    left: {
      enabled: true,
      action: function () {
        snake.left();
        keyActions.forward.enabled = true;
        keyActions.right.enabled = false;
        keyActions.backward.enabled = true;
        keyActions.pause.enabled = true;
        hidePauseScreen();
      },
    },
    right: {
      enabled: true,
      action: function () {
        snake.right();
        keyActions.forward.enabled = true;
        keyActions.left.enabled = false;
        keyActions.backward.enabled = true;
        keyActions.pause.enabled = true;
        hidePauseScreen();
      },
    },
    pause: {
      enabled: false,
      action: function () {
        snake.clear();
        keyActions.pause.enabled = false;
        showPauseScreen();
      },
    },
  };

  function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      65,
      win.innerWidth / win.innerHeight,
      1,
      10000
    );
    camera.position.set(500, 800, 1300);
    camera.lookAt(new THREE.Vector3());

    const gridGeometry = new THREE.Geometry();
    for (let i = -gridSize; i <= gridSize; i += unitSize) {
      gridGeometry.vertices.push(new THREE.Vector3(-gridSize, 0, i));
      gridGeometry.vertices.push(new THREE.Vector3(gridSize, 0, i));
      gridGeometry.vertices.push(new THREE.Vector3(i, 0, -gridSize));
      gridGeometry.vertices.push(new THREE.Vector3(i, 0, gridSize));
    }
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 0.2,
      transparent: true,
    });
    const line = new THREE.Line(gridGeometry, gridMaterial, THREE.LinePieces);
    scene.add(line);
    snake = new Snake(scene, unitSize, 0xff0000, gridSize);
    snake.render();

    snake.onTagCollision = function () {
      scene.remove(tag);
      tag = addTagToScene(randomAxis(), unitSize / 2, randomAxis());
      apple.play();
      setScore();
    };

    snake.onSelfCollision = function () {
      snake.reset();
      gameover.play();
      clearScore();
    };

    tag = addTagToScene(randomAxis(), unitSize / 2, randomAxis());

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(win.innerWidth - 10, win.innerHeight - 10);
    renderer.setClearColor(0xf0f0f0);

    doc.body.appendChild(renderer.domElement);
    projector = new THREE.Projector();
    ray = new THREE.Ray(camera.position, null);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1500, 800, 1300).normalize();
    scene.add(directionalLight);
  }

  function randomAxis() {
    const point = randomPoint();
    return point > gridSize ? gridSize - point - 25 : point - 25;
  }

  function triggerRenders() {
    if (renderCounter === speed) {
      snake.render();
      render();
      renderCounter = 0;
    }
    renderCounter++;
    raf = win.requestAnimationFrame(triggerRenders);
  }

  function addTagToScene(x, y, z) {
    const geometry = new THREE.SphereGeometry(appleSize, appleSize, appleSize);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    scene.add(sphere);
    snake.setCurrentTagPosition({ x, y, z });
    return sphere;
  }

  function setScore() {
    gameScoreBoard.innerHTML = Number(gameScoreBoard.innerText) + 1;
  }

  function clearScore() {
    gameScoreBoard.innerHTML = 0;
  }

  function randomPoint() {
    const pos = Math.floor(Math.random() * gridSize * 2);
    return pos - (pos % unitSize);
  }

  function onKeyPressUp(e) {
    var keyAction = keyActions[keys[e.keyCode]];
    if (keyAction && keyAction.enabled) {
      keyAction.action();
      if (raf) {
        win.cancelAnimationFrame(raf);
      }
      raf = win.requestAnimationFrame(triggerRenders);
    }
  }

  function render() {
    renderer.render(scene, camera);
  }

  init();
  render();
  document.addEventListener("keyup", onKeyPressUp, false);
})(window, document);
