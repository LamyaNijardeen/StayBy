import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { showAlert, showConfirm } from "../services/dialog";
import { setStoredProfileImage, useProfileImage } from "../services/profileImage";
import {
  removeProfilePhoto,
  uploadProfilePhoto,
} from "../services/userService";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const OUTPUT_SIZE = 512;

/**
 * Crops the picture to a centred square and shrinks it to 512 x 512
 * before uploading, so even a large phone photo uploads quickly.
 */
function prepareImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement("canvas");

      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Your browser could not prepare the picture."));
        return;
      }

      context.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Could not prepare the picture.")),
        "image/jpeg",
        0.85
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That file could not be read as a picture."));
    };

    image.src = objectUrl;
  });
}

interface ProfilePhotoEditorProps {
  name?: string;
}

function ProfilePhotoEditor({ name }: ProfilePhotoEditorProps) {
  const imageUrl = useProfileImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      void showAlert("Please choose a JPG, PNG or WebP picture.", {
        tone: "error",
      });
      return;
    }

    try {
      setBusy(true);

      const prepared = await prepareImage(file);
      const updated = await uploadProfilePhoto(prepared);

      setStoredProfileImage(updated.profileImageUrl ?? "");
    } catch (err) {
      void showAlert(
        err instanceof Error ? err.message : "Failed to upload picture.",
        { tone: "error", title: "Couldn't upload picture" }
      );
    } finally {
      setBusy(false);

      // Lets the same file be chosen again later.
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    const confirmed = await showConfirm(
      "Remove your profile picture?",
      { confirmLabel: "Remove" }
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      await removeProfilePhoto();

      setStoredProfileImage("");
    } catch (err) {
      void showAlert(
        err instanceof Error ? err.message : "Failed to remove picture.",
        { tone: "error" }
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-col items-center gap-3">
      <div className="relative">
        <Avatar name={name} imageUrl={imageUrl} size={88} />

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <Loader2
              size={22}
              className="animate-spin text-[var(--color-coral)]"
            />
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)] disabled:opacity-50"
        >
          <Camera size={14} />
          {imageUrl ? "Change" : "Add photo"}
        </button>

        {imageUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            aria-label="Remove profile picture"
            title="Remove profile picture"
            className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfilePhotoEditor;