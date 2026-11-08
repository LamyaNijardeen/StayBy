import { useEffect, useRef } from "react";
import { showAlert } from "../services/dialog";

/*
 * Shows an error as a pop-up in the middle of the screen instead of a
 * banner at the top of the page.
 *
 *   <ErrorPopup message={error} onClose={() => setError("")} />
 *
 * onClose runs when the person dismisses the pop-up (clear the message
 * there so the same error can be shown again later).
 */
function ErrorPopup({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  const shownFor = useRef("");
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!message || shownFor.current === message) {
      return;
    }

    shownFor.current = message;

    showAlert(message, {
      tone: "error",
      title: "Something went wrong",
    }).then(() => {
      shownFor.current = "";
      onCloseRef.current?.();
    });
  }, [message]);

  return null;
}

export default ErrorPopup;
