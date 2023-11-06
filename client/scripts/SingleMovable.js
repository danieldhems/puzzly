import BaseMovable from "./BaseMovable.js";
import { checkConnections } from "./checkConnections.js";
import { EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import { addToGroup, group } from "./Group.js";
import Utils from "./utils.js";

export class SingleMovable extends BaseMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.onPickup.bind(this));
  }

  onPickup(event) {
    const { element, position } = event.detail;

    if (this.isSinglePiece(element)) {
      this.element = element;
      this.active = true;

      super.onPickup(position);
    }
  }

  addToStage() {
    this.piecesContainer.prepend(this.element);
  }

  addToPocket(pocket) {
    const innerElement = pocket.querySelector(".pocket-inner");
    innerElement.prepend(this.element);
  }

  isOutOfBounds(event) {
    return !this.isInsidePlayArea() && !this.isOverPockets(event);
  }

  onMouseUp(event) {
    if (this.isOutOfBounds(event)) {
      this.resetPosition();
    } else if (this.isOverPockets(event)) {
      const pocket = this.getPocketByCollision(Utils.getEventBox(event));
      this.addToPocket(pocket);
    } else {
      const connection = checkConnections.call(this);
      console.log("connection", connection);

      if (connection) {
        const { targetEl } = connection;
        Events.notify(EVENT_TYPES.CONNECTION_MADE, connection);

        let connectionType =
          typeof connection == "string" ? connection : connection.type;
        const isSolvedConnection =
          Utils.isCornerConnection(connectionType) ||
          connectionType === "float";

        if (isSolvedConnection) {
          addToGroup(this.element, 1111);
        } else {
          const { groupId, groupContainer } = group.call(this, targetEl);
          console.log("group made?", groupId, groupContainer);

          this.addToStage(groupContainer);
          Utils.updateConnections(groupId);

          // Emit an event for this
          // this.save([sourceEl, targetElement]);
        }

        Utils.updateConnections(this.element);
      }
    }

    this.clean();
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
