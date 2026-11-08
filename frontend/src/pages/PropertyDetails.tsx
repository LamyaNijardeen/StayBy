import { showAlert } from "../services/dialog";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  Heart,
  Copy,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addFavorite,
  checkFavorite,
  getAvailableRoomsByDates,
  getAvailableRoomsByProperty,
  getImageUrl,
  getPropertyById,
  getPropertyImages,
  getRoomImages,
  removeFavorite,
  type PropertyImageResponse,
  type PropertySearchResponse,
  type RoomImageResponse,
  type RoomResponse,
} from "../services/propertyService";

import {
  getPropertyReviews,
  type ReviewResponse,
} from "../services/reviewService";
import RoleNavbar from "../components/RoleNavbar";
import { getCurrentUser } from "../services/auth";
import NearbyPlaces from "../components/NearbyPlaces";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface RoomWithImages extends RoomResponse {
  images: RoomImageResponse[];
}

const fallbackPropertyImage =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80";

const fallbackRoomImage =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80";

function MapCenterUpdater({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);

  return null;
}

/*
 * =========================================================
 * GALLERY TILE
 *
 * The image is absolutely positioned so its natural
 * (possibly huge) size can never affect the layout.
 * The tile itself is what gets sized by the grid.
 * =========================================================
 */
function GalleryTile({
  src,
  alt,
  onClick,
  roundedClass = "",
  children,
}: {
  src: string;
  alt: string;
  onClick: () => void;
  roundedClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-full min-h-0 w-full min-w-0 overflow-hidden ${roundedClass}`}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      {children}
    </button>
  );
}

function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] =
    useState<PropertySearchResponse | null>(null);

  const [rooms, setRooms] = useState<RoomWithImages[]>([]);

  const [propertyImages, setPropertyImages] = useState<
    PropertyImageResponse[]
  >([]);

  const [selectedRoomId, setSelectedRoomId] =
    useState<number | null>(null);

  const [selectedPropertyImage, setSelectedPropertyImage] =
    useState<string | null>(null);

  const [selectedRoomForGallery, setSelectedRoomForGallery] =
    useState<RoomWithImages | null>(null);

  const [selectedRoomImageIndex, setSelectedRoomImageIndex] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [availabilityError, setAvailabilityError] =
    useState("");

  const [reviews, setReviews] =
    useState<ReviewResponse[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [reviewsError, setReviewsError] =
    useState("");

  const searchParams = new URLSearchParams(location.search);

  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || ""
  );

  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || ""
  );

  const [guests, setGuests] = useState(
    Number(searchParams.get("guests") || "1")
  );

  /*
   * =========================================================
   * GET LOGGED-IN USER
   * =========================================================
   */
  const getCurrentUserId = (): number | null => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      const userId = Number(user.id);

      if (Number.isNaN(userId)) {
        return null;
      }

      return userId;
    } catch {
      return null;
    }
  };

  /*
   * =========================================================
   * LOAD PROPERTY + ROOMS + PROPERTY IMAGES
   * =========================================================
   */
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError("Property not found");
        setLoading(false);
        return;
      }

      const propertyId = Number(id);

      if (Number.isNaN(propertyId)) {
        setError("Invalid property ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [propertyData, roomsData] = await Promise.all([
          getPropertyById(propertyId),
          getAvailableRoomsByProperty(propertyId),
        ]);

        // Property images are optional.
        let propertyImagesData: PropertyImageResponse[] = [];

        try {
          propertyImagesData = await getPropertyImages(propertyId);
        } catch (imageError) {
          console.warn(
            "Property images could not be loaded:",
            imageError
          );
        }

        const roomsWithImages: RoomWithImages[] =
          await Promise.all(
            roomsData.map(async (room) => {
              try {
                const images = await getRoomImages(room.id);
                return { ...room, images };
              } catch {
                return { ...room, images: [] };
              }
            })
          );

        setProperty(propertyData);
        setRooms(roomsWithImages);
        setPropertyImages(propertyImagesData);

        if (roomsWithImages.length > 0) {
          setSelectedRoomId(roomsWithImages[0].id);
        } else {
          setSelectedRoomId(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load property"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  /*
   * =========================================================
   * LOAD FAVORITE STATUS
   * =========================================================
   */
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!id) {
        return;
      }

      const propertyId = Number(id);

      if (Number.isNaN(propertyId)) {
        return;
      }

      const userId = getCurrentUserId();

      if (userId === null) {
        setIsFavorite(false);
        return;
      }

      try {
        const status = await checkFavorite(propertyId, userId);
        setIsFavorite(status);
      } catch (err) {
        console.error("Failed to load favorite status:", err);
      }
    };

    loadFavoriteStatus();
  }, [id]);

  /*
   * =========================================================
   * LOAD PROPERTY REVIEWS
   * =========================================================
   */
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) {
        return;
      }

      const propertyId = Number(id);

      if (Number.isNaN(propertyId)) {
        return;
      }

      try {
        setReviewsLoading(true);
        setReviewsError("");

        const data = await getPropertyReviews(propertyId);

        setReviews(data);
      } catch (err) {
        setReviewsError(
          err instanceof Error
            ? err.message
            : "Failed to load reviews."
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  /*
   * =========================================================
   * TOGGLE FAVORITE
   * =========================================================
   */
  const handleFavorite = async () => {
    if (!id) {
      return;
    }

    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return;
    }

    const userId = getCurrentUserId();

    if (userId === null) {
      showAlert("Please log in to save properties to your favorites.", {
        actionLabel: "Log in",
        onAction: () => navigate("/login"),
      });
      return;
    }

    if (getCurrentUser()?.role !== "TRAVELER") {
      showAlert("Only traveler accounts can save favorites.");
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(propertyId, userId);
        setIsFavorite(false);
      } else {
        await addFavorite(propertyId, userId);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);

      showAlert(
        err instanceof Error
          ? err.message
          : "Failed to update favorite."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  /*
   * =========================================================
   * SHARE
   * =========================================================
   */
  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property?.name || "StayBy property",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showAlert("Link copied to clipboard.");
      }
    } catch {
      // User cancelled sharing – nothing to do.
    }
  };

  /*
   * =========================================================
   * CHECK DATE AVAILABILITY
   * =========================================================
   */
  useEffect(() => {
    const checkAvailability = async () => {
      if (!id) {
        return;
      }

      if (!checkIn || !checkOut) {
        return;
      }

      if (checkOut <= checkIn) {
        return;
      }

      const propertyId = Number(id);

      if (Number.isNaN(propertyId)) {
        return;
      }

      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");

        const availableRooms = await getAvailableRoomsByDates(
          propertyId,
          checkIn,
          checkOut,
          guests
        );

        // Keep already-loaded room images.
        setRooms((currentRooms) => {
          return availableRooms.map((room) => {
            const existingRoom = currentRooms.find(
              (existing) => existing.id === room.id
            );

            return {
              ...room,
              images: existingRoom?.images || [],
            };
          });
        });

        // Keep selected room if still available.
        setSelectedRoomId((currentSelectedId) => {
          const stillAvailable = availableRooms.some(
            (room) => room.id === currentSelectedId
          );

          if (stillAvailable) {
            return currentSelectedId;
          }

          return availableRooms.length > 0
            ? availableRooms[0].id
            : null;
        });
      } catch (err) {
        setAvailabilityError(
          err instanceof Error
            ? err.message
            : "Failed to check room availability"
        );

        setRooms([]);
        setSelectedRoomId(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    checkAvailability();
  }, [id, checkIn, checkOut, guests]);

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Loading property...
        </p>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */
  if (error || !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">
            Property not found
          </h1>

          <p className="mt-2 text-sm text-red-500">
            {error || "Unable to load this property."}
          </p>

          <Link
            to="/search"
            className="mt-6 inline-flex rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to results
          </Link>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * PROPERTY GALLERY
   * =========================================================
   */
  const galleryImages = propertyImages
    .map((image) => getImageUrl(image.imageUrl))
    .filter((image): image is string => Boolean(image));

  const displayGallery =
    galleryImages.length > 0
      ? galleryImages
      : [fallbackPropertyImage];

  /*
   * =========================================================
   * SELECTED ROOM
   * =========================================================
   */
  const selectedRoom =
    rooms.find((room) => room.id === selectedRoomId) || null;

  const today = new Date().toISOString().split("T")[0];

  /*
   * =========================================================
   * NIGHTS
   * =========================================================
   */
  const calculateNights = () => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference = end.getTime() - start.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  const totalPrice =
    selectedRoom && nights > 0
      ? selectedRoom.pricePerNight * nights
      : 0;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  /*
   * =========================================================
   * CHECK-IN CHANGE
   * =========================================================
   */
  const handleCheckInChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedDate = event.target.value;

    setCheckIn(selectedDate);

    if (checkOut && checkOut <= selectedDate) {
      setCheckOut("");
    }
  };

  /*
   * =========================================================
   * RESERVE
   * =========================================================
   */
  const handleReserve = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showAlert("Please log in with a traveler account to reserve a stay.", {
        actionLabel: "Log in",
        onAction: () => navigate("/login"),
      });
      return;
    }

    if (currentUser.role !== "TRAVELER") {
      showAlert("Only traveler accounts can make bookings.");
      return;
    }

    if (!selectedRoom) {
      showAlert("Please select an available room.");
      return;
    }

    if (!checkIn || !checkOut) {
      showAlert("Please select your check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      showAlert("Check-out date must be after check-in date.");
      return;
    }

    if (nights <= 0) {
      showAlert("Please select valid dates.");
      return;
    }

    if (guests < 1) {
      showAlert("Please select at least one guest.");
      return;
    }

    if (guests > selectedRoom.capacity) {
      showAlert(
        `This room can accommodate a maximum of ${selectedRoom.capacity} guests.`
      );
      return;
    }

    navigate("/booking", {
      state: {
        propertyId: property.id,
        propertyName: property.name,
        propertyType: property.propertyType,
        city: property.city,
        address: property.address,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        pricePerNight: selectedRoom.pricePerNight,
        capacity: selectedRoom.capacity,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice,

        roomImage:
          selectedRoom.images.length > 0
            ? getImageUrl(selectedRoom.images[0].imageUrl)
            : "",
      },
    });
  };

  /*
   * =========================================================
   * ROOM GALLERY
   * =========================================================
   */
  const openRoomGallery = (
    event: MouseEvent,
    room: RoomWithImages
  ) => {
    event.stopPropagation();

    if (room.images.length === 0) {
      return;
    }

    setSelectedRoomForGallery(room);
    setSelectedRoomImageIndex(0);
  };

  const openPropertyImage = (image: string) => {
    setSelectedPropertyImage(image);
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <RoleNavbar />

      <div className="mx-auto max-w-7xl px-6 pt-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/search"
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]"
          >
            <ArrowLeft size={17} />
            Back to results
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-coral-light)]"
            >
              <Share2 size={16} />
              Share
            </button>

            <button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-coral-light)] disabled:opacity-50"
            >
              <Heart
                size={16}
                className={
                  isFavorite
                    ? "text-[var(--color-coral)]"
                    : ""
                }
                fill={isFavorite ? "currentColor" : "none"}
              />
              {isFavorite ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* ===================================================
            PROPERTY HEADING
        ==================================================== */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <span>{property.city}</span>
            <span>•</span>
            <span>Sri Lanka</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            {property.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star
                size={16}
                fill="currentColor"
                className="text-[var(--color-coral)]"
              />

              {averageRating ? (
                <>
                  <span className="font-semibold text-[var(--color-text)]">
                    {averageRating}
                  </span>

                  <span className="text-[var(--color-text-secondary)]">
                    · {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </>
              ) : (
                <span className="text-[var(--color-text-secondary)]">
                  No reviews yet
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <MapPin size={16} />
              {property.city}, Sri Lanka
            </div>
          </div>
        </div>

        {/* ===================================================
            PROPERTY GALLERY
            Every tile has a fixed-size slot and images are
            absolutely positioned, so large uploaded photos
            can never stretch or overlap the page.
        ==================================================== */}
        {displayGallery.length === 1 ? (
          <div className="h-[360px] w-full overflow-hidden rounded-2xl md:h-[480px]">
            <GalleryTile
              src={displayGallery[0]}
              alt={property.name}
              onClick={() => openPropertyImage(displayGallery[0])}
            />
          </div>
        ) : displayGallery.length === 2 ? (
          <div className="grid h-[360px] grid-cols-2 grid-rows-[minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl md:h-[480px]">
            {displayGallery.map((image, index) => (
              <GalleryTile
                key={`${image}-${index}`}
                src={image}
                alt={`${property.name} view ${index + 1}`}
                onClick={() => openPropertyImage(image)}
              />
            ))}
          </div>
        ) : displayGallery.length === 3 ? (
          <div className="grid h-[360px] grid-cols-2 grid-rows-[minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl md:h-[480px]">
            <GalleryTile
              src={displayGallery[0]}
              alt={property.name}
              onClick={() => openPropertyImage(displayGallery[0])}
            />

            <div className="grid min-h-0 grid-rows-[repeat(2,minmax(0,1fr))] gap-3">
              {displayGallery.slice(1, 3).map((image, index) => (
                <GalleryTile
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${property.name} view ${index + 2}`}
                  onClick={() => openPropertyImage(image)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid h-[360px] grid-cols-2 grid-rows-[minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl md:h-[480px]">
            <GalleryTile
              src={displayGallery[0]}
              alt={property.name}
              onClick={() => openPropertyImage(displayGallery[0])}
            />

            <div className="grid min-h-0 grid-cols-2 grid-rows-[repeat(2,minmax(0,1fr))] gap-3">
              {displayGallery.slice(1, 5).map((image, index) => {
                const isLastVisibleImage = index === 3;

                return (
                  <GalleryTile
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${property.name} view ${index + 2}`}
                    onClick={() => openPropertyImage(image)}
                  >
                    {isLastVisibleImage &&
                      displayGallery.length > 5 && (
                        <div className="absolute inset-0 flex items-end justify-end bg-black/20 p-4">
                          <span className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] shadow-lg">
                            View all photos
                          </span>
                        </div>
                      )}
                  </GalleryTile>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* =================================================
              LEFT
          ================================================== */}
          <div className="min-w-0">
            {/* INTRO */}
            <section className="border-b border-[var(--color-border)] pb-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral)]">
                  <BedDouble size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                    {property.propertyType} in {property.city}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {selectedRoom
                      ? `${selectedRoom.capacity} guests · ${selectedRoom.name}`
                      : "No rooms currently available"}
                  </p>
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
                {property.description}
              </p>

              {/* SUITABLE FOR */}
              {property.suitablePurposes &&
                property.suitablePurposes.length > 0 && (
                  <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral)]">
                        <Check size={19} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--color-navy)]">
                          Suitable for
                        </h3>

                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          This property is marked as suitable for these types of stays.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {property.suitablePurposes.map((purpose) => (
                            <span
                              key={purpose}
                              className="rounded-full border border-[var(--color-coral)] bg-[var(--color-coral-light)] px-3 py-1.5 text-xs font-medium text-[var(--color-navy)]"
                            >
                              {purpose}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </section>

            {/* CONTACT OWNER */}
            {property.verified && property.owner && (
              <section className="border-b border-[var(--color-border)] py-8">
                <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                  Contact the Owner
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Have questions about this property? Contact the owner before booking.
                </p>

                <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <p className="font-semibold text-[var(--color-navy)]">
                    {property.owner.name}
                  </p>

                  <p className="mt-1 break-all text-sm text-[var(--color-text-secondary)]">
                    {property.owner.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {property.owner.phone?.trim() && (
                      <a
                        href={`tel:${property.owner.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-navy)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        <Phone size={16} />
                        Call Owner
                      </a>
                    )}

                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        property.owner.email
                      )}&su=${encodeURIComponent(
                        `Question about ${property.name}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-coral-light)]"
                    >
                      <Mail size={16} />
                      Email Owner
                    </a>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            property.owner.email
                          );
                          showAlert(
                            `${property.owner.email} was copied. Paste it into your email app to write to the owner.`
                          );
                        } catch {
                          showAlert(
                            `Owner email: ${property.owner.email}`
                          );
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-coral-light)]"
                    >
                      <Copy size={16} />
                      Copy email
                    </button>
                  </div>

                  {!property.owner.phone?.trim() && (
                    <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                      A phone number is not available. You can email the owner instead.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* AVAILABLE ROOMS */}
            <section className="border-b border-[var(--color-border)] py-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                  {checkIn && checkOut
                    ? "Available rooms for your dates"
                    : "Available rooms"}
                </h2>

                {availabilityLoading && (
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Checking availability...
                  </span>
                )}
              </div>

              {availabilityError ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">
                    {availabilityError}
                  </p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
                  <BedDouble
                    size={30}
                    className="mx-auto text-[var(--color-text-secondary)]"
                  />

                  <p className="mt-3 text-sm font-medium text-[var(--color-navy)]">
                    {checkIn && checkOut
                      ? "No rooms are available for these dates."
                      : "No rooms are currently available."}
                  </p>

                  {checkIn && checkOut && (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      Try selecting different dates or fewer guests.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {rooms.map((room) => {
                    const isSelected = room.id === selectedRoomId;

                    const roomImage =
                      room.images.length > 0
                        ? getImageUrl(room.images[0].imageUrl)
                        : fallbackRoomImage;

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            setSelectedRoomId(room.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`w-full cursor-pointer overflow-hidden rounded-2xl border text-left transition ${
                          isSelected
                            ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-coral)]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* ROOM IMAGE
                              Image is absolute so a large photo
                              can't change the card's height. */}
                          <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-auto sm:min-h-[13rem] sm:w-56">
                            <img
                              src={roomImage}
                              alt={room.name}
                              className="absolute inset-0 h-full w-full object-cover"
                            />

                            {room.images.length > 0 && (
                              <button
                                type="button"
                                onClick={(event) =>
                                  openRoomGallery(event, room)
                                }
                                className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[var(--color-navy)] shadow"
                              >
                                View photos
                              </button>
                            )}
                          </div>

                          {/* ROOM DETAILS */}
                          <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="font-semibold text-[var(--color-navy)]">
                                  {room.name}
                                </h3>

                                {isSelected && (
                                  <span className="rounded-full bg-[var(--color-coral)] px-2.5 py-1 text-xs font-semibold text-white">
                                    Selected
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                {room.description}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                                  <Users size={16} />
                                  Capacity: {room.capacity} guests
                                </span>

                                <span className="font-medium text-green-600">
                                  Available
                                </span>
                              </div>
                            </div>

                            <div className="mt-5 flex items-end justify-between gap-4">
                              <div className="text-xs text-[var(--color-text-secondary)]">
                                {room.images.length > 0
                                  ? `${room.images.length} ${
                                      room.images.length === 1
                                        ? "photo"
                                        : "photos"
                                    }`
                                  : "No room photos"}
                              </div>

                              <div className="shrink-0 text-right">
                                <span className="text-xl font-bold text-[var(--color-navy)]">
                                  LKR {room.pricePerNight.toLocaleString()}
                                </span>

                                <span className="text-sm text-[var(--color-text-secondary)]">
                                  {" "}
                                  / night
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* AMENITIES */}
            <section className="border-b border-[var(--color-border)] py-8">
              <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                What this place offers
              </h2>

              {Array.isArray(property.amenities) &&
              property.amenities.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex min-w-0 items-start gap-3 text-sm text-[var(--color-text)]"
                    >
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--color-coral)]"
                      />

                      <span className="min-w-0 break-words">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  No amenities have been added for this property yet.
                </p>
              )}
            </section>

            {/* REVIEWS */}
            <section className="border-b border-[var(--color-border)] py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                    Reviews & Ratings
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    See what previous guests thought about their stay.
                  </p>
                </div>

                {averageRating && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star
                        size={20}
                        fill="currentColor"
                        className="text-[var(--color-coral)]"
                      />

                      <span className="text-xl font-bold text-[var(--color-navy)]">
                        {averageRating}
                      </span>
                    </div>

                    <span className="text-sm text-[var(--color-text-secondary)]">
                      · {reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                )}
              </div>

              {reviewsLoading && (
                <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Loading reviews...
                  </p>
                </div>
              )}

              {!reviewsLoading && reviewsError && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">
                    {reviewsError}
                  </p>
                </div>
              )}

              {!reviewsLoading &&
                !reviewsError &&
                reviews.length === 0 && (
                  <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                      <Star
                        size={23}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <h3 className="mt-4 font-semibold text-[var(--color-navy)]">
                      No reviews yet
                    </h3>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Be the first guest to review this property.
                    </p>
                  </div>
                )}

              {!reviewsLoading &&
                !reviewsError &&
                reviews.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-[var(--color-navy)]">
                              {review.userName}
                            </p>

                            <div className="mt-2 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  fill={
                                    star <= review.rating
                                      ? "currentColor"
                                      : "none"
                                  }
                                  className={
                                    star <= review.rating
                                      ? "text-[var(--color-coral)]"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {review.comment && (
                          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </section>

            {/* LOCATION */}
            <section className="pt-8">
              <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                Where you'll stay
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Location details for this property.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {property.latitude !== null &&
                property.longitude !== null ? (
                  <div className="relative z-0 h-64 w-full">
                    <MapContainer
                      center={[property.latitude, property.longitude]}
                      zoom={15}
                      scrollWheelZoom={true}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <MapCenterUpdater
                        position={[property.latitude, property.longitude]}
                      />

                      <Marker
                        position={[property.latitude, property.longitude]}
                      />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="relative flex h-64 items-center justify-center bg-[var(--color-coral-light)]">
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                        <MapPin
                          size={28}
                          className="text-[var(--color-coral)]"
                        />
                      </div>

                      <p className="mt-4 font-semibold text-[var(--color-navy)]">
                        {property.city}, Sri Lanka
                      </p>

                      <p className="mt-1 max-w-md px-6 text-sm text-[var(--color-text-secondary)]">
                        Map location is not available for this property yet.
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-[var(--color-border)] p-5">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-[var(--color-coral)]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[var(--color-navy)]">
                        {property.address}
                      </p>

                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {property.city}, Sri Lanka
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEARBY PLACES */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[var(--color-navy)]">
                  Important places nearby
                </h3>

                <p className="mt-1 mb-4 text-sm text-[var(--color-text-secondary)]">
                  Hospitals, universities, beaches and more close to this stay.
                </p>

                <NearbyPlaces
                  propertyId={property.id}
                  highlight={searchParams.get("landmark") || ""}
                />
              </div>
            </section>
          </div>

          {/* =================================================
              BOOKING CARD
          ================================================== */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5">
              {/* PRICE */}
              <div className="flex items-end justify-between">
                <div>
                  {selectedRoom ? (
                    <>
                      <span className="text-2xl font-bold text-[var(--color-navy)]">
                        LKR {selectedRoom.pricePerNight.toLocaleString()}
                      </span>

                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {" "}
                        / night
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      No rooms available
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Star
                    size={15}
                    fill="currentColor"
                    className="text-[var(--color-coral)]"
                  />

                  <span className="font-semibold">
                    {averageRating ?? "—"}
                  </span>
                </div>
              </div>

              {/* DATES + GUESTS */}
              <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-border)]">
                <div className="grid grid-cols-2">
                  {/* CHECK-IN */}
                  <label className="cursor-pointer border-r border-[var(--color-border)] p-4 text-left transition hover:bg-[var(--color-background)]">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />

                      <span className="text-xs font-semibold">
                        CHECK-IN
                      </span>
                    </div>

                    <input
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={handleCheckInChange}
                      className="mt-2 w-full cursor-pointer bg-transparent text-sm text-[var(--color-text)] outline-none"
                    />
                  </label>

                  {/* CHECK-OUT */}
                  <label className="cursor-pointer p-4 text-left transition hover:bg-[var(--color-background)]">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />

                      <span className="text-xs font-semibold">
                        CHECK-OUT
                      </span>
                    </div>

                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || today}
                      onChange={(event) =>
                        setCheckOut(event.target.value)
                      }
                      disabled={!checkIn}
                      className="mt-2 w-full cursor-pointer bg-transparent text-sm text-[var(--color-text)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </label>
                </div>

                {/* GUESTS */}
                <div className="border-t border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-2">
                    <Users size={17} />

                    <span className="text-xs font-semibold">
                      GUESTS
                    </span>
                  </div>

                  <select
                    value={guests}
                    onChange={(event) =>
                      setGuests(Number(event.target.value))
                    }
                    disabled={!selectedRoom}
                    className="mt-2 w-full cursor-pointer bg-transparent text-sm text-[var(--color-text)] outline-none"
                  >
                    {selectedRoom &&
                      Array.from(
                        { length: selectedRoom.capacity },
                        (_, index) => index + 1
                      ).map((number) => (
                        <option key={number} value={number}>
                          {number} {number === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* RESERVE */}
              <button
                type="button"
                disabled={!selectedRoom}
                onClick={handleReserve}
                className={`mt-5 flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition ${
                  selectedRoom
                    ? "bg-[var(--color-coral)] hover:bg-[var(--color-navy)]"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                {selectedRoom ? "Reserve" : "Unavailable"}
              </button>

              <p className="mt-3 text-center text-xs text-[var(--color-text-secondary)]">
                You won't be charged yet
              </p>

              {/* PRICE BREAKDOWN */}
              {selectedRoom && (
                <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-text-secondary)]">
                      LKR {selectedRoom.pricePerNight.toLocaleString()} ×{" "}
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>

                    <span className="shrink-0 font-medium">
                      LKR {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-text-secondary)]">
                      Service fee
                    </span>

                    <span className="text-right text-[var(--color-text-secondary)]">
                      Calculated at booking
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* =====================================================
          PROPERTY IMAGE MODAL
      ====================================================== */}
      {selectedPropertyImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setSelectedPropertyImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedPropertyImage}
              alt={property.name}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />

            <button
              type="button"
              onClick={() => setSelectedPropertyImage(null)}
              className="absolute right-3 top-3 rounded-full bg-white px-3 py-2 text-sm font-bold text-[var(--color-navy)] shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ROOM IMAGE MODAL
      ====================================================== */}
      {selectedRoomForGallery &&
        selectedRoomForGallery.images.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
            onClick={() => setSelectedRoomForGallery(null)}
          >
            <div
              className="relative w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl bg-black">
                <img
                  src={getImageUrl(
                    selectedRoomForGallery.images[selectedRoomImageIndex]
                      .imageUrl
                  )}
                  alt={selectedRoomForGallery.name}
                  className="mx-auto max-h-[70vh] w-full object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedRoomForGallery(null)}
                className="absolute right-3 top-3 rounded-full bg-white px-3 py-2 text-sm font-bold text-[var(--color-navy)] shadow-lg"
              >
                ✕
              </button>

              {selectedRoomForGallery.images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {selectedRoomForGallery.images.map((image, index) => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => setSelectedRoomImageIndex(index)}
                      className={`h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                        index === selectedRoomImageIndex
                          ? "border-[var(--color-coral)]"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={getImageUrl(image.imageUrl)}
                        alt={`${selectedRoomForGallery.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default PropertyDetails;