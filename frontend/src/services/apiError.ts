/*
 * Turns anything the server (or the network) sends back into a short,
 * friendly sentence that is safe to show to a person.
 *
 *   if (!response.ok) throw await apiError(response, "Failed to load users.");
 *
 * Never shows raw JSON, stack traces or "timestamp/status/path" text.
 */

function messageForStatus(status: number, fallback: string): string {
  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status === 404) {
    return "We couldn't find what you were looking for.";
  }

  if (status === 409) {
    return "That can't be done right now because something has changed. Please refresh and try again.";
  }

  if (status === 413) {
    return "That file is too large. Please choose a smaller one.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "Something went wrong on our side. Please try again in a moment.";
  }

  return fallback;
}

/** Looks like something a developer, not a visitor, should read. */
function looksTechnical(text: string): boolean {
  return (
    text.length > 250 ||
    /<\s*(html|!doctype|body)/i.test(text) ||
    /exception|org\.springframework|java\.|\bat com\.|stack ?trace|sql|hibernate|constraint/i.test(
      text
    )
  );
}

export function friendlyMessage(
  rawText: string,
  status: number,
  fallback: string
): string {
  const text = (rawText || "").trim();

  // Login problems and server failures are explained by the status.
  if (status === 401 || status >= 500) {
    return messageForStatus(status, fallback);
  }

  if (!text) {
    return messageForStatus(status, fallback);
  }

  // JSON body, e.g. {"message":"..."} or Spring's default error object
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const data = JSON.parse(text);

      if (
        data &&
        typeof data.message === "string" &&
        data.message.trim() &&
        !looksTechnical(data.message)
      ) {
        return data.message.trim();
      }

      if (
        data &&
        typeof data.error === "string" &&
        !("timestamp" in data) &&
        data.error.trim() &&
        !looksTechnical(data.error)
      ) {
        return data.error.trim();
      }
    } catch {
      /* not JSON after all */
    }

    return messageForStatus(status, fallback);
  }

  if (looksTechnical(text)) {
    return messageForStatus(status, fallback);
  }

  // Plain sentence from the backend, e.g. "Room not found"
  return text;
}

/** Builds the Error to throw for a failed response. */
export async function apiError(
  response: Response,
  fallback: string
): Promise<Error> {
  let text = "";

  try {
    text = await response.text();
  } catch {
    /* ignore */
  }

  return new Error(friendlyMessage(text, response.status, fallback));
}

/** For a caught value of unknown type. */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/*
 * "Failed to fetch" is what the browser says when the server cannot be
 * reached. Say something a person can understand instead.
 */
export function installFriendlyNetworkErrors(): void {
  const original = window.fetch.bind(window);

  window.fetch = async (...args: Parameters<typeof fetch>) => {
    try {
      return await original(...args);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          "We can't reach StayBy right now. Please check your internet connection and try again."
        );
      }

      throw err;
    }
  };
}
