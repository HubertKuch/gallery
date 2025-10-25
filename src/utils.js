export function safe(callable) {
  try {
    return callable();
  } catch (error) {
    return null;
  }
}

export function safeUse(callable, callback) {
  try {
    const out = callable();

    if (out) callback(out);

    return null;
  } catch (error) {
    return null;
  }
}
