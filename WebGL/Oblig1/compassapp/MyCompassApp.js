import {BaseApp} from '../../base/BaseApp.js';
import {Compass} from '../compass/compass.js';

export class MyCompassApp extends BaseApp {
    constructor() {
        super(false);

        this.compass = new Compass(this);
    }

    handleKeys(elapsed) {
        super.handleKeys(elapsed);
        this.compass.handleKeys(elapsed);
    }

    draw(elapsed, modelMatrix = new Matrix4()) {
        super.draw(elapsed);

        this.compass.draw(this.baseShaderInfo, elapsed, modelMatrix);
    }
}
