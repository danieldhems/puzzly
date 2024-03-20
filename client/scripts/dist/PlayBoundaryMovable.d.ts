import BaseMovable from "./BaseMovable.js";
import Puzzly from "./Puzzly.js";
import { InstanceTypes } from "./types.js";
export default class PlayBoundaryMovable extends BaseMovable {
    instanceType: InstanceTypes;
    constructor(puzzly: Puzzly);
    onMouseDown(event: MouseEvent): void;
    shouldConstrainViewport(event: MouseEvent): void;
}
