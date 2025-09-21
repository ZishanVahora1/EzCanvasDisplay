/**
 * Helper to find the current Canvas user id by scanning inline ENV blobs
 * on the page. We expose a stable function on window so other scripts
 * (content.js) can call it without duplicating logic.
 */
function getCurrentUserId() {
  const scripts = document.querySelectorAll('script');
  let userId = null;

  for (const script of scripts) {
    const content = script.textContent || '';
    // Matches ENV={"current_user_id":"12345"} or similar forms
    const match = content.match(/ENV\s*=\s*.*"current_user_id"\s*:\s*"?(\d+)"?/);
    if (match && match[1]) {
      userId = match[1];
      break;
    }
  }
  return userId;
}

window.getCurrentUserId = getCurrentUserId;