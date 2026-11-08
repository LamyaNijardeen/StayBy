import { useEffect, useState } from "react";
import { getImageUrl } from "./propertyService";
import { API_BASE_URL } from "../config";

/*
 * The logged-in user's profile picture, shared by the navbars and the
 * profile pages. The address is kept in the "user" entry of
 * localStorage; "stayby:user-updated" tells every component to refresh
 * when it changes.
 */

const EVENT_NAME = "stayby:user-updated";

function readStoredUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Saves a new picture address (or "" for none) and tells the page. */
export function setStoredProfileImage(imageUrl: string): void {
  try {
    const user = readStoredUser();

    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, profileImageUrl: imageUrl })
      );
    }
  } catch {
    /* storage unavailable */
  }

  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Full web address of the logged-in user's picture, or "" for none. */
export function useProfileImage(): string {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    const stored = readStoredUser()?.profileImageUrl;

    return typeof stored === "string" ? stored : "";
  });

  useEffect(() => {
    const refresh = () => {
      const stored = readStoredUser()?.profileImageUrl;

      setImageUrl(typeof stored === "string" ? stored : "");
    };

    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);

    // Right after login the picture is not stored yet: ask the server once.
    const user = readStoredUser();
    const token = localStorage.getItem("token");

    if (user && token && user.profileImageUrl === undefined) {
      fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          setStoredProfileImage(
            data && typeof data.profileImageUrl === "string"
              ? data.profileImageUrl
              : ""
          );
        })
        .catch(() => {
          /* the initial letter is shown instead */
        });
    }

    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return imageUrl ? getImageUrl(imageUrl) : "";
}
