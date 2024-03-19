import { ConnectorControlPoints } from "./types";
export default class JigsawPath {
    pieceSize: number;
    connectorSize: number;
    humpSize: number;
    halfConnectorSize: number;
    constructor(pieceSize: number, connectorSize: number);
    getPlug(): {
        cp1: {
            x: number;
            y: number;
        };
        cp2: {
            x: number;
            y: number;
        };
        dest: {
            x: number;
            y: number;
        };
    };
    getSocket(): {
        cp1: {
            x: number;
            y: number;
        };
        cp2: {
            x: number;
            y: number;
        };
        dest: {
            x: number;
            y: number;
        };
    };
    rotate(point: {
        x: number;
        y: number;
    }, deg: number): {
        x: number;
        y: number;
    };
    getRotatedConnector(connector: ConnectorControlPoints, deg: number): {
        cp1: {
            x: number;
            y: number;
        };
        cp2: {
            x: number;
            y: number;
        };
        dest: {
            x: number;
            y: number;
        };
    };
    drawConnectorGuides(ctx: CanvasRenderingContext2D, connector: ConnectorControlPoints): void;
}
