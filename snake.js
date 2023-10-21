function Snake(scene, size, color, gridSize) {
  this.gridSize = gridSize;
  this.snake = [];
  this.scene = scene;
  this.size = size;
  this.color = color;
  this.distance = 50;
  this.direction = null;
  this.axis = null;
  this.onSelfCollision = function () {};
  this.onTagCollision = function () {};
  this.position = null;
  this.tagPosition = null;
  this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
  this.material = new THREE.MeshLambertMaterial({ color: this.color });
  this.init();
}

Snake.prototype = {
  init: function () {
    this.addCube();
    this.addCube();
    this.setDefaultPositions();
  },
  setDefaultPositions: function () {
    const self = this;
    this.snake.forEach(function (cube, index) {
      cube.position.z = -1 * ((self.size / 2) * (index + 1));
      cube.position.y = self.size / 2;
      cube.position.x = -475;
    });
  },
  reset: function () {
    this.init();
    const self = this;
    self.snake.forEach(function (cube) {
      self.scene.remove(cube);
      self.removeCube(cube);
    });
    self.snake = [];
    self.init();
  },

  selfCollision: function () {
    this.onSelfCollision();
    this.clear();
  },
  tagCollision: function () {
    this.onTagCollision();
    this.addCube();
  },

  setCurrentTagPosition: function (position) {
    this.tagPosition = position;
  },

  isHit: function (p1, p2) {
    if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
      return true;
    }
  },
  createCube: function (position) {
    return new THREE.Mesh(this.geometry, this.material);
  },
  addCube: function () {
    this.snake.push(this.createCube());
  },
  render: function () {
    const self = this;
    let next = null;
    self.snake.forEach(function (cube) {
      let temp = null;
      if (self.axis !== null && self.direction !== null) {
        if (!next) {
          next = { x: cube.position.x, y: cube.position.y, z: cube.position.z };
          cube.position[self.axis] += self.direction * self.distance;
          self.position = {
            x: cube.position.x,
            y: cube.position.y,
            z: cube.position.z,
          };
          if (
            self.position.x > self.gridSize ||
            self.position.x < -self.gridSize ||
            self.position.z > self.gridSize ||
            self.position.z < -self.gridSize
          ) {
            self.selfCollision();
            return;
          }
          if (self.tagPosition) {
            if (self.isHit(self.position, self.tagPosition)) {
              self.tagCollision();
            }
          }
        } else {
          temp = { x: cube.position.x, y: cube.position.y, z: cube.position.z };
          cube.position.set(next.x, next.y, next.z);
          if (self.isHit(self.position, cube.position)) {
            self.selfCollision();
          }
          next = { x: temp.x, y: temp.y, z: temp.z };
        }
      }
      self.renderCube(cube);
    });
  },
  back: function () {
    this.axis = "z";
    this.direction = -1;
  },
  forward: function () {
    this.axis = "z";
    this.direction = 1;
  },
  right: function () {
    this.axis = "x";
    this.direction = 1;
  },
  left: function () {
    this.axis = "x";
    this.direction = -1;
  },

  clear: function () {
    this.axis = null;
    this.direction = null;
  },

  renderCube: function (cube) {
    this.scene.add(cube);
  },
  removeCube: function (cube) {
    cube.position.x = 1000;
    cube.position.z = 1000;
  },
};
