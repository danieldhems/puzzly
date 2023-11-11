import BaseMovable from "./BaseMovable.js";
import { checkConnections } from "./checkConnections.js";
import GroupOperations from "./GroupOperations.js";
import Utils from "./utils.js";

export class GroupMovable extends BaseMovable {
  constructor(...args) {
    super(...args);
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const mousePosition = {
        top: event.clientY,
        left: event.clientX,
      };

      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (this.isPuzzlePiece(element) && this.isGroupedPiece(element)) {
        this.element = element.parentNode;
        this.active = true;

        super.onPickup.call(this, mousePosition);
      }
    }
  }

  getConnection() {
    const collisionCandidates = GroupOperations.getCollisionCandidatesInGroup(
      GroupOperations.getGroup(this.element)
    );

    let connection;
    let i = 0;

    while (i < collisionCandidates.length && !connection) {
      connection = checkConnections.call(this, collisionCandidates[i]);
      if (connection) return connection;
      i++;
    }
  }

  onMouseUp() {
    if (this.isOutOfBounds()) {
      this.resetPosition();
    } else {
      this.connection = this.getConnection();
      super.onMouseUp();
    }

    this.clean();
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
