export default function populateFSError(errorMessage) {
  if (errorMessage instanceof Error) {
    return errorMessage.message;
  }

  if (errorMessage.startsWith('forbidden path:')) {
    return 'Cannot read a album path. Try to add permissions.';
  }

  return `Internal error: ${errorMessage}`;
}
