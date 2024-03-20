import BaseMovable from "./BaseMovable";
import Puzzly from "./Puzzly";
import { InstanceTypes } from "./types";
export default class PlayBoundaryMovable extends BaseMovable {
    instanceType: InstanceTypes;
    constructor(puzzly: Puzzly);
    onMouseDown(event: MouseEvent): void;
    shouldConstrainViewport(event: MouseEvent): void;
}
