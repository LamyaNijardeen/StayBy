import { useState } from "react";

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  /** Width and height in pixels. */
  size?: number;
  className?: string;
}

/**
 * A round profile picture, or the person's first letter when they
 * have not uploaded one (or the picture cannot be loaded).
 */
function Avatar({
  name,
  imageUrl,
  size = 32,
  className = "",
}: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState("");

  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-coral-light)] font-bold text-[var(--color-coral)] ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.4)),
      }}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={name ? `${name}'s profile picture` : "Profile picture"}
          className="h-full w-full object-cover"
          onError={() => setFailedUrl(imageUrl ?? "")}
        />
      ) : (
        (name?.trim().charAt(0) || "?").toUpperCase()
      )}
    </span>
  );
}

export default Avatar;