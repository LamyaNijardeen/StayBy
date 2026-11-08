import { showAlert } from "../services/dialog";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Loader2,
  Building2,
} from "lucide-react";
import TravelerNavbar from "../components/TravelerNavbar";
import {
  getFavorites,
  getPropertyImages,
  getImageUrl,
  removeFavorite,
  type FavoriteResponse,
} from "../services/propertyService";

interface FavoriteWithImage extends FavoriteResponse {
  imageUrl: string;
}

const Favorites = () => {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<FavoriteWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  /* =========================================================
     GET CURRENT USER
  ========================================================= */

  const getCurrentUserId = (): number | null => {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      return user?.id ? Number(user.id) : null;
    } catch {
      return null;
    }
  };

  /* =========================================================
     LOAD FAVORITES
  ========================================================= */

  useEffect(() => {
    const loadFavorites = async () => {
      const userId = getCurrentUserId();

      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const favoriteData = await getFavorites(userId);

        /*
         * Load the first property image for every favorite.
         */
        const favoritesWithImages = await Promise.all(
          favoriteData.map(async (favorite) => {
            try {
              const images = await getPropertyImages(
                favorite.property.id
              );

              return {
                ...favorite,
                imageUrl:
                  images.length > 0
                    ? getImageUrl(images[0].imageUrl)
                    : "",
              };
            } catch {
              return {
                ...favorite,
                imageUrl: "",
              };
            }
          })
        );

        setFavorites(favoritesWithImages);
      } catch (err) {
        console.error("Failed to load favorites:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load favorites"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [navigate]);

  /* =========================================================
     REMOVE FAVORITE
  ========================================================= */

  const handleRemoveFavorite = async (
    propertyId: number,
    favoriteId: number
  ) => {
    const userId = getCurrentUserId();

    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      setRemovingId(favoriteId);

      await removeFavorite(propertyId, userId);

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (favorite) => favorite.id !== favoriteId
        )
      );
    } catch (err) {
      console.error("Failed to remove favorite:", err);

      showAlert(
        err instanceof Error
          ? err.message
          : "Failed to remove favorite"
      );
    } finally {
      setRemovingId(null);
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

if (loading) {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <TravelerNavbar />

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={34}
            className="animate-spin text-[#E76F51]"
          />

          <p className="text-sm text-[#667085]">
            Loading your favorites...
          </p>
        </div>
      </div>
    </div>
  );
}

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#172B4D]">
      {/* =====================================================
          HEADER
      ===================================================== */}

<TravelerNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[#E76F51]">
            Saved stays
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#172B4D]">
                Your favorite properties
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                Keep track of places you would like to stay and
                come back to them whenever you are ready.
              </p>
            </div>

            {favorites.length > 0 && (
              <div className="w-fit rounded-full bg-[#FCE9E4] px-4 py-2 text-sm font-medium text-[#C9573D]">
                {favorites.length}{" "}
                {favorites.length === 1
                  ? "saved property"
                  : "saved properties"}
              </div>
            )}
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!error && favorites.length === 0 && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[#E8E5DF] bg-white px-6 text-center shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FCE9E4]">
              <Heart
                size={30}
                className="text-[#E76F51]"
              />
            </div>

            <h2 className="text-xl font-semibold text-[#172B4D]">
              No favorites yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
              When you find a property you like, tap the heart
              icon to save it here.
            </p>

            <Link
              to="/search"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#E76F51] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D85F43]"
            >
              Explore properties
            </Link>
          </div>
        )}

        {/* ===================================================
            FAVORITE CARDS
        =================================================== */}

        {favorites.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
              const property = favorite.property;

              return (
                <article
                  key={favorite.id}
                  className="group overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image */}

                  <div className="relative h-56 overflow-hidden bg-[#F1EFEB]">
                    {favorite.imageUrl ? (
                      <img
                        src={favorite.imageUrl}
                        alt={property.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2
                          size={48}
                          className="text-[#B8B4AD]"
                        />
                      </div>
                    )}

                    {/* Property type */}

                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold capitalize text-[#172B4D] shadow-sm">
                      {property.propertyType}
                    </div>

                    {/* Remove button */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFavorite(
                          property.id,
                          favorite.id
                        )
                      }
                      disabled={removingId === favorite.id}
                      aria-label={`Remove ${property.name} from favorites`}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#E76F51] shadow-sm transition hover:bg-[#FCE9E4] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingId === favorite.id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Heart
                          size={19}
                          fill="#E76F51"
                        />
                      )}
                    </button>
                  </div>

                  {/* Content */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-[#172B4D]">
                          {property.name}
                        </h2>

                        <div className="mt-2 flex items-center gap-1.5 text-sm text-[#667085]">
                          <MapPin
                            size={15}
                            className="shrink-0 text-[#E76F51]"
                          />

                          <span className="truncate">
                            {property.city}
                          </span>
                        </div>
                      </div>

                      {property.verified && (
                        <span className="shrink-0 rounded-full bg-[#EEF7F2] px-2.5 py-1 text-[11px] font-semibold text-[#287A4D]">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#667085]">
                      {property.description ||
                        "A comfortable place to stay."}
                    </p>

                    {/* Address */}

                    <div className="mt-4 border-t border-[#EEEAE4] pt-4">
                      <p className="line-clamp-1 text-xs text-[#8A8F98]">
                        {property.address}
                      </p>
                    </div>

                    {/* View property */}

                    <Link
                      to={`/property/${property.id}`}
                      className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#E76F51] px-4 py-3 text-sm font-semibold text-[#E76F51] transition hover:bg-[#E76F51] hover:text-white"
                    >
                      View property
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;

