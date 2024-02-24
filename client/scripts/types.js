"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideNames = exports.ConnectorNames = exports.InstanceTypes = void 0;
var InstanceTypes;
(function (InstanceTypes) {
    InstanceTypes["SingleMovable"] = "SingleMovable";
    InstanceTypes["GroupMovable"] = "GroupMovable";
    InstanceTypes["PocketMovable"] = "PocketMovable";
    InstanceTypes["PlayBoundaryMovable"] = "PlayBoundaryMovable";
})(InstanceTypes || (exports.InstanceTypes = InstanceTypes = {}));
var ConnectorNames;
(function (ConnectorNames) {
    ConnectorNames["Plug"] = "plug";
    ConnectorNames["Socket"] = "socket";
})(ConnectorNames || (exports.ConnectorNames = ConnectorNames = {}));
// Todo: These won't work for non-four-sided pieces - should be an array of ConnectorTypes instead
var SideNames;
(function (SideNames) {
    SideNames["Top"] = "top";
    SideNames["Right"] = "right";
    SideNames["Bottom"] = "bottom";
    SideNames["Left"] = "left";
    SideNames["TopRight"] = "top-right";
    SideNames["BottomRight"] = "bottom-right";
    SideNames["BottomLeft"] = "bottom-left";
    SideNames["TopLeft"] = "top-left";
})(SideNames || (exports.SideNames = SideNames = {}));
