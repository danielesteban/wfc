import { mat4, vec2 } from 'gl-matrix';

class Input {
  constructor({ camera, target }) {
    this.buttons = {
      primary: false,
      secondary: false,
      zoomin: false,
      zoomout: false,
    };
    this.camera = camera;
    this.cursor = vec2.fromValues(0, 0);
    this.pointer = vec2.fromValues(0, 0);
    this.panning = {
      enabled: false,
      initial: vec2.create(),
      matrix: mat4.create(),
      origin: vec2.create(),
    };
    window.addEventListener('blur', this.onBlur.bind(this), false);
    target.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    window.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    Input.setCursor('grab');
  }

  onBlur() {
    const { buttons } = this;
    buttons.primary = buttons.secondary = buttons.zoomin = buttons.zoomout = false;
    Input.setCursor('grab');
  }

  onMouseDown({ button }) {
    const { buttons } = this;
    switch (button) {
      case 0:
        buttons.primary = true;
        break;
      case 2:
        buttons.secondary = true;
        break;
    }
  }

  onMouseMove({ clientX, clientY }) {
    const { pointer } = this;
    vec2.set(
      pointer,
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );
  }

  onMouseUp({ button }) {
    const { buttons } = this;
    switch (button) {
      case 0:
        buttons.primary = false;
        break;
      case 2:
        buttons.secondary = false;
        break;
    }
  }

  onMouseWheel({ deltaY }) {
    const { buttons } = this;
    buttons.zoomin = deltaY < 0;
    buttons.zoomout = deltaY > 0;
  }

  static setCursor(cursor) {
    document.body.style.cursor = cursor;
  }

  update() {
    const { buttons, camera, cursor, panning, pointer } = this;
   
    if (panning.enabled) {
      if (!buttons.primary) {
        panning.enabled = false;
        Input.setCursor('grab');
        return;
      }
      vec2.copy(cursor, pointer);
      vec2.transformMat4(cursor, cursor, panning.matrix);
      vec2.sub(camera.position, panning.initial, cursor);
      vec2.add(camera.position, camera.position, panning.origin);
      camera.update();
      return true;
    }

    if (buttons.primary) {
      panning.enabled = true;
      Input.setCursor('grabbing');
      vec2.copy(panning.origin, camera.position);
      mat4.copy(panning.matrix, camera.matrixInverse);
      vec2.copy(panning.initial, pointer);
      vec2.transformMat4(panning.initial, panning.initial, panning.matrix);
    }

    if (buttons.zoomin || buttons.zoomout) {
      const step = buttons.zoomin ? -1 : 1;
      buttons.zoomin = buttons.zoomout = false;

      vec2.copy(cursor, pointer);
      vec2.transformMat4(cursor, cursor, camera.matrixInverse);
      vec2.sub(cursor, cursor, camera.position);
      
      vec2.add(camera.position, camera.position, cursor);
      camera.zoom += step * 4;
      camera.zoom = Math.min(Math.max(camera.zoom, 30), 160);
      camera.update();

      vec2.copy(cursor, pointer);
      vec2.transformMat4(cursor, cursor, camera.matrixInverse);
      vec2.sub(cursor, cursor, camera.position);

      vec2.sub(camera.position, camera.position, cursor);
      camera.update();
      return true;
    }
  }
}

export default Input;
