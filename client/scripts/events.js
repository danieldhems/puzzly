class Events {
  static notify(eventType, data) {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }

  static receiveNotification(event) {
    return event.detail;
  }
}

export default Events;
