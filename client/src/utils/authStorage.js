const AUTH_CHANGED_EVENT = "authChanged";

export function getAuthChangedEventName() {
    return AUTH_CHANGED_EVENT;
}

export function notifyAuthChanged() {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
