import { useEffect, useId, useState } from "react";
import { getLandmarkSuggestions } from "../services/landmarkService";

interface LandmarkSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Text box for "Going somewhere specific?" (e.g. Asiri Hospital).
 * Offers suggestions taken from real places near listed stays.
 */
function LandmarkSearchInput({
  value,
  onChange,
  onEnter,
  placeholder = "e.g. Asiri Hospital, University of Peradeniya, Mirissa Beach",
  className = "",
}: LandmarkSearchInputProps) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        const names = await getLandmarkSuggestions(value);

        if (!cancelled) {
          setSuggestions(names);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  return (
    <>
      <input
        type="text"
        value={value}
        list={listId}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onEnter) {
            onEnter();
          }
        }}
        placeholder={placeholder}
        className={className}
      />

      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  );
}

export default LandmarkSearchInput;