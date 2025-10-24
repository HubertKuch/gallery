export function safe(callable) {
    try {
        return callable();
    } catch (error) {
        return null;
    }
}