import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import TravelerNavbar from "../components/TravelerNavbar";
import {
  ChevronDown,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Loader2,
  Navigation,
} from "lucide-react";

import { Link, useSearchParams, useNavigate } from "react-router-dom";

import {
  searchAvailableProperties,
  getPropertyImages,
  getImageUrl,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/propertyService";

import type {
  PropertySearchResponse,
} from "../services/propertyService";

const PURPOSE_OPTIONS = [
  "Medical Visit",
  "Education",
  "Work / Business",
  "Tour / Vacation",
  "Picnic / Day Trip",
  "Family Gathering",
  "Wedding / Event",
  "Visiting Family / Friends",
  "Religious / Cultural Visit",
  "Sports / Competition",
  "Festival / Celebration",
  "Other",
];

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
const isLoggedIn = !!localStorage.getItem("token");
  const [properties, setProperties] = useState<PropertySearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [propertyImages, setPropertyImages] = useState<
    Record<number, string>
  >({});

  /* =========================================================
     SEARCH FORM
  ========================================================= */

  const city = searchParams.get("city") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "1");
  const purpose = searchParams.get("purpose") || "";

  const [searchCity, setSearchCity] = useState(city);
  const [searchCheckIn, setSearchCheckIn] = useState(checkIn);
  const [searchCheckOut, setSearchCheckOut] = useState(checkOut);
  const [searchGuests, setSearchGuests] = useState(guests);
  const [searchPurpose, setSearchPurpose] = useState(purpose);

  /* =========================================================
     FILTERS / SORTING
  ========================================================= */

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [selectedPropertyType, setSelectedPropertyType] =
    useState("ALL");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

  const [selectedDistance, setSelectedDistance] = useState("ANY");
  const [appliedDistance, setAppliedDistance] = useState("ANY");

  const [sortOption, setSortOption] = useState("recommended");
  /* =========================================================
   LOCATION / DISTANCE
========================================================= */

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  /* =========================================================
     KEEP SEARCH FORM IN SYNC WITH URL
  ========================================================= */

  useEffect(() => {
    setSearchCity(city);
    setSearchCheckIn(checkIn);
    setSearchCheckOut(checkOut);
    setSearchGuests(guests);
    setSearchPurpose(purpose);
  }, [
    city,
    checkIn,
    checkOut,
    guests,
    purpose,
  ]);

  /* =========================================================
     FAVORITES
  ========================================================= */

  const [favoritePropertyIds, setFavoritePropertyIds] = useState<
    number[]
  >([]);

  const [favoriteLoadingId, setFavoriteLoadingId] = useState<number | null>(
    null
  );

  /* =========================================================
     GET CURRENT USER ID
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
     SEARCH
  ========================================================= */

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchCity.trim()) {
      params.set("city", searchCity.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    if (searchCheckIn) {
      params.set("checkIn", searchCheckIn);
    }

    if (searchCheckOut) {
      params.set("checkOut", searchCheckOut);
    }

    params.set(
      "guests",
      String(Math.max(1, searchGuests))
    );

    if (searchPurpose) {
      params.set("purpose", searchPurpose);
    }

    navigate(`/search?${params.toString()}`);
  };

  /* =========================================================
     LOAD PROPERTIES
  ========================================================= */

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        if (!checkIn || !checkOut) {
          setProperties([]);
          return;
        }

        const results = await searchAvailableProperties({
          city: city || undefined,
          propertyType: propertyType || undefined,
          checkIn,
          checkOut,
          guests,
          purpose: purpose || undefined,
        });

        setProperties(results);

        /* =====================================================
           LOAD PROPERTY IMAGES
        ===================================================== */

        const imageEntries = await Promise.all(
          results.map(async (property) => {
            try {
              const images = await getPropertyImages(property.id);

              if (images.length > 0) {
                return [
                  property.id,
                  getImageUrl(images[0].imageUrl),
                ] as const;
              }
            } catch (imageError) {
              console.error(
                `Failed to load images for property ${property.id}`,
                imageError
              );
            }

            return null;
          })
        );

        const imageMap: Record<number, string> = {};

        imageEntries.forEach((entry) => {
          if (entry) {
            imageMap[entry[0]] = entry[1];
          }
        });

        setPropertyImages(imageMap);

        /* =====================================================
           LOAD FAVORITES
        ===================================================== */

        const userId = getCurrentUserId();

        if (userId) {
          try {
            const favorites = await getFavorites(userId);

            const favoriteIds = favorites.map(
              (favorite) => favorite.property.id
            );

            setFavoritePropertyIds(favoriteIds);
          } catch (favoriteError) {
            console.error(
              "Failed to load favorites:",
              favoriteError
            );
          }
        } else {
          setFavoritePropertyIds([]);
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load properties"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [
    city,
    propertyType,
    checkIn,
    checkOut,
    guests,
    purpose,
  ]);

  /* =========================================================
     GET CHEAPEST ROOM PRICE
  ========================================================= */

  const getCheapestPrice = (
    property: PropertySearchResponse
  ): number | null => {
    if (property.availableRooms.length === 0) {
      return null;
    }

    return property.availableRooms.reduce(
      (cheapest, room) =>
        room.pricePerNight < cheapest
          ? room.pricePerNight
          : cheapest,
      property.availableRooms[0].pricePerNight
    );
  };

  /* =========================================================
     FILTER + SORT RESULTS
  ========================================================= */
  /* =========================================================
     CALCULATE DISTANCE BETWEEN TWO COORDINATES
  ========================================================= */

  const calculateDistanceKm = (
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number
  ): number => {
    const earthRadiusKm = 6371;

    const latitudeDifference =
      ((latitude2 - latitude1) * Math.PI) / 180;

    const longitudeDifference =
      ((longitude2 - longitude1) * Math.PI) / 180;

    const a =
      Math.sin(latitudeDifference / 2) *
      Math.sin(latitudeDifference / 2) +
      Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

    const c =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  };

  /* =========================================================
     GET USER LOCATION
  ========================================================= */

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location services are not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      (error) => {
        console.error("Failed to get user location:", error);

        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access to use this feature."
          );
        } else {
          setLocationError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };
  const displayedProperties = useMemo(() => {
    let results = [...properties];

    /* =====================================================
       PROPERTY TYPE FILTER
    ===================================================== */

    if (selectedPropertyType !== "ALL") {
      results = results.filter(
        (property) =>
          property.propertyType?.toLowerCase() ===
          selectedPropertyType.toLowerCase()
      );
    }

    /* =====================================================
       MINIMUM PRICE FILTER
    ===================================================== */

    if (appliedMinPrice) {
      const minimum = Number(appliedMinPrice);

      if (!Number.isNaN(minimum)) {
        results = results.filter((property) => {
          const price = getCheapestPrice(property);

          return price !== null && price >= minimum;
        });
      }
    }

    /* =====================================================
       MAXIMUM PRICE FILTER
    ===================================================== */

    if (appliedMaxPrice) {
      const maximum = Number(appliedMaxPrice);

      if (!Number.isNaN(maximum)) {
        results = results.filter((property) => {
          const price = getCheapestPrice(property);

          return price !== null && price <= maximum;
        });
      }
    }
    /* =====================================================
   DISTANCE FILTER
===================================================== */

    if (
      appliedDistance !== "ANY" &&
      userLocation
    ) {
      const maximumDistance = Number(appliedDistance);

      if (!Number.isNaN(maximumDistance)) {
        results = results.filter((property) => {
          if (
            property.latitude === null ||
            property.longitude === null
          ) {
            return false;
          }

          const distance = calculateDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            property.latitude,
            property.longitude
          );

          return distance <= maximumDistance;
        });
      }
    }

    /* =====================================================
       SORTING
    ===================================================== */

    if (sortOption === "price-low") {
      results.sort((a, b) => {
        const priceA = getCheapestPrice(a) ?? Infinity;
        const priceB = getCheapestPrice(b) ?? Infinity;

        return priceA - priceB;
      });
    }

    if (sortOption === "price-high") {
      results.sort((a, b) => {
        const priceA = getCheapestPrice(a) ?? -Infinity;
        const priceB = getCheapestPrice(b) ?? -Infinity;

        return priceB - priceA;
      });
    }
    if (sortOption === "distance" && userLocation) {
      results.sort((a, b) => {
        if (
          a.latitude === null ||
          a.longitude === null
        ) {
          return 1;
        }

        if (
          b.latitude === null ||
          b.longitude === null
        ) {
          return -1;
        }

        const distanceA = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );

        const distanceB = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );

        return distanceA - distanceB;
      });
    }
    /* =====================================================
   RECOMMENDED
===================================================== */

    if (sortOption === "recommended") {
      results.sort((a, b) => {
        // If a purpose is selected, prioritize properties
        // that are suitable for that purpose.
        if (purpose) {
          const aMatchesPurpose =
            a.suitablePurposes?.some(
              (propertyPurpose) =>
                propertyPurpose.toLowerCase() ===
                purpose.toLowerCase()
            ) ?? false;

          const bMatchesPurpose =
            b.suitablePurposes?.some(
              (propertyPurpose) =>
                propertyPurpose.toLowerCase() ===
                purpose.toLowerCase()
            ) ?? false;

          if (aMatchesPurpose && !bMatchesPurpose) {
            return -1;
          }

          if (!aMatchesPurpose && bMatchesPurpose) {
            return 1;
          }
        }

        // If the user enabled Near Me, use distance
        // as the secondary recommendation factor.
        if (userLocation) {
          if (
            a.latitude === null ||
            a.longitude === null
          ) {
            return 1;
          }

          if (
            b.latitude === null ||
            b.longitude === null
          ) {
            return -1;
          }

          const distanceA = calculateDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            a.latitude,
            a.longitude
          );

          const distanceB = calculateDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            b.latitude,
            b.longitude
          );

          return distanceA - distanceB;
        }

        return 0;
      });
    }

    if (sortOption === "name") {
      results.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return results;
  }, [
    properties,
    selectedPropertyType,
    appliedMinPrice,
    appliedMaxPrice,
    appliedDistance,
    sortOption,
    userLocation,
    purpose,
  ]);

  /* =========================================================
     APPLY FILTERS
  ========================================================= */

  const handleApplyFilters = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedDistance(selectedDistance);
    setShowFilters(false);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const handleClearFilters = () => {
    setSelectedPropertyType("ALL");
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setSelectedDistance("ANY");
    setAppliedDistance("ANY");
  };

  /* =========================================================
     SORT LABEL
  ========================================================= */

  const getSortLabel = () => {
    switch (sortOption) {
      case "price-low":
        return "Price: Low to High";

      case "price-high":
        return "Price: High to Low";

      case "name":
        return "Name: A–Z";

      case "distance":
        return "Distance: Nearest First";

      default:
        return "Recommended";
    }
  };

  /* =========================================================
     TOGGLE FAVORITE
  ========================================================= */

  const handleFavorite = async (
    event: React.MouseEvent<HTMLButtonElement>,
    propertyId: number
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const userId = getCurrentUserId();

    if (!userId) {
      navigate("/login");
      return;
    }

    if (favoriteLoadingId === propertyId) {
      return;
    }

    const isCurrentlyFavorite =
      favoritePropertyIds.includes(propertyId);

    try {
      setFavoriteLoadingId(propertyId);

      if (isCurrentlyFavorite) {
        await removeFavorite(propertyId, userId);

        setFavoritePropertyIds((currentIds) =>
          currentIds.filter((id) => id !== propertyId)
        );
      } else {
        await addFavorite(propertyId, userId);

        setFavoritePropertyIds((currentIds) => [
          ...currentIds,
          propertyId,
        ]);
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update favorite"
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      {isLoggedIn ? <TravelerNavbar /> : <Navbar />}

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ===================================================
            SEARCH BAR
        =================================================== */}

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm">

          <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">

            {/* WHERE */}

            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-background)] px-4 py-3">

              <MapPin
                size={19}
                className="shrink-0 text-[var(--color-coral)]"
              />

              <div className="min-w-0 flex-1">

                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Where
                </p>

                <input
                  type="text"
                  value={searchCity}
                  onChange={(event) =>
                    setSearchCity(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Where do you want to stay?"
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none placeholder:text-gray-400"
                />

              </div>
            </div>

            {/* CHECK-IN */}

            <div className="rounded-xl bg-[var(--color-background)] px-4 py-3">

              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Check-in
              </p>

              <input
                type="date"
                value={searchCheckIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) =>
                  setSearchCheckIn(event.target.value)
                }
                className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
              />

            </div>

            {/* CHECK-OUT */}

            <div className="rounded-xl bg-[var(--color-background)] px-4 py-3">

              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Check-out
              </p>

              <input
                type="date"
                value={searchCheckOut}
                min={
                  searchCheckIn ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={(event) =>
                  setSearchCheckOut(event.target.value)
                }
                className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
              />

            </div>

            {/* SEARCH */}

            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
            >
              <Search size={18} />
              Search
            </button>

          </div>

          {/* MOBILE GUESTS */}

          <div className="mt-2 flex items-center gap-3 rounded-xl bg-[var(--color-background)] px-4 py-3 md:hidden">

            <div className="flex-1">

              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Guests
              </p>

              <select
                value={searchGuests}
                onChange={(event) =>
                  setSearchGuests(Number(event.target.value))
                }
                className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
              >
                {Array.from(
                  { length: 10 },
                  (_, index) => index + 1
                ).map((guestCount) => (
                  <option
                    key={guestCount}
                    value={guestCount}
                  >
                    {guestCount}{" "}
                    {guestCount === 1
                      ? "guest"
                      : "guests"}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* DESKTOP GUESTS */}

          <div className="mt-2 hidden items-center justify-end gap-3 px-1 md:flex">

            <label
              htmlFor="desktop-guests"
              className="text-xs font-semibold text-[var(--color-text-secondary)]"
            >
              Guests
            </label>

            <select
              id="desktop-guests"
              value={searchGuests}
              onChange={(event) =>
                setSearchGuests(Number(event.target.value))
              }
              className="rounded-lg bg-[var(--color-background)] px-3 py-2 text-sm font-medium text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-coral-light)]"
            >
              {Array.from(
                { length: 10 },
                (_, index) => index + 1
              ).map((guestCount) => (
                <option
                  key={guestCount}
                  value={guestCount}
                >
                  {guestCount}{" "}
                  {guestCount === 1
                    ? "guest"
                    : "guests"}
                </option>
              ))}
            </select>

          </div>

          {/* ===================================================
              PURPOSE
          =================================================== */}

          <div className="mt-2 rounded-xl bg-[var(--color-background)] px-4 py-3">

            <label
              htmlFor="search-purpose"
              className="text-xs font-semibold text-[var(--color-text-secondary)]"
            >
              What’s the reason for your stay?
            </label>

            <select
              id="search-purpose"
              value={searchPurpose}
              onChange={(event) =>
                setSearchPurpose(event.target.value)
              }
              className="mt-1 w-full bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
            >
              <option value="">
                Any reason
              </option>

              {PURPOSE_OPTIONS.map((purposeOption) => (
                <option
                  key={purposeOption}
                  value={purposeOption}
                >
                  {purposeOption}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* ===================================================
            HEADING + FILTERS
        =================================================== */}

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {city
                ? `${city} · Sri Lanka`
                : "Sri Lanka"}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-navy)] sm:text-3xl">
              {loading
                ? "Finding stays..."
                : `${displayedProperties.length} ${displayedProperties.length === 1
                  ? "stay"
                  : "stays"
                } found`}
            </h1>

            {purpose && (
              <p className="mt-2 text-sm text-[var(--color-coral)]">
                Showing stays suitable for{" "}
                <span className="font-semibold">
                  {purpose}
                </span>
              </p>
            )}

          </div>

          <div className="relative flex gap-3">
            {/* =================================================
    NEAR ME
================================================= */}

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${userLocation
                ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] text-[var(--color-coral)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-coral)]"
                }`}
            >
              {locationLoading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Navigation size={17} />
              )}

              {locationLoading ? "Locating..." : "Near me"}
            </button>

            {/* =================================================
                FILTER BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                setShowFilters((current) => !current);
                setShowSort(false);
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${showFilters ||
                selectedPropertyType !== "ALL" ||
                appliedMinPrice ||
                appliedMaxPrice ||
                appliedDistance !== "ANY"
                ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] text-[var(--color-coral)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-coral)]"
                }`}
            >
              <SlidersHorizontal size={17} />
              Filters

              {(selectedPropertyType !== "ALL" ||
                appliedMinPrice ||
                appliedMaxPrice ||
                appliedDistance !== "ANY") && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                    {
                      [
                        selectedPropertyType !== "ALL",
                        Boolean(appliedMinPrice),
                        Boolean(appliedMaxPrice),
                        appliedDistance !== "ANY",
                      ].filter(Boolean).length
                    }
                  </span>
                )}
            </button>

            {/* =================================================
                FILTER DROPDOWN
            ================================================= */}

            {showFilters && (
              <div className="absolute right-0 top-14 z-40 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">

                <div className="flex items-center justify-between">

                  <h2 className="font-semibold text-[var(--color-navy)]">
                    Filters
                  </h2>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-[var(--color-coral)] hover:underline"
                  >
                    Clear all
                  </button>

                </div>

                {/* PROPERTY TYPE */}

                <div className="mt-5">

                  <label className="text-sm font-semibold text-[var(--color-navy)]">
                    Property type
                  </label>

                  <select
                    value={selectedPropertyType}
                    onChange={(event) =>
                      setSelectedPropertyType(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-coral)]"
                  >
                    <option value="ALL">
                      All property types
                    </option>
                    <option value="HOTEL">
                      Hotel
                    </option>
                    <option value="GUEST HOUSE">
                      Guest House
                    </option>
                    <option value="APARTMENT">
                      Apartment
                    </option>
                    <option value="VILLA">
                      Villa
                    </option>
                    <option value="OTHER">
                      Other
                    </option>
                  </select>

                </div>

                {/* PRICE */}

                <div className="mt-5">

                  <label className="text-sm font-semibold text-[var(--color-navy)]">
                    Price per night
                  </label>

                  <div className="mt-2 grid grid-cols-2 gap-2">

                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(event) =>
                        setMinPrice(event.target.value)
                      }
                      placeholder="Min"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-coral)]"
                    />

                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) =>
                        setMaxPrice(event.target.value)
                      }
                      placeholder="Max"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-coral)]"
                    />

                  </div>

                </div>
                {/* DISTANCE */}

                <div className="mt-5">
                  <label className="text-sm font-semibold text-[var(--color-navy)]">
                    Distance from me
                  </label>

                  {!userLocation ? (
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                      Click "Near me" first to use distance filtering.
                    </p>
                  ) : (
                    <select
                      value={selectedDistance}
                      onChange={(event) =>
                        setSelectedDistance(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-coral)]"
                    >
                      <option value="ANY">
                        Any distance
                      </option>

                      <option value="5">
                        Within 5 km
                      </option>

                      <option value="10">
                        Within 10 km
                      </option>

                      <option value="25">
                        Within 25 km
                      </option>

                      <option value="50">
                        Within 50 km
                      </option>
                    </select>
                  )}
                </div>

                {/* APPLY */}

                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="mt-6 w-full rounded-xl bg-[var(--color-coral)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
                >
                  Apply Filters
                </button>

              </div>
            )}

            {/* =================================================
                SORT BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                setShowSort((current) => !current);
                setShowFilters(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-coral)]"
            >
              {getSortLabel()}
              <ChevronDown
                size={16}
                className={`transition ${showSort ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* =================================================
                SORT DROPDOWN
            ================================================= */}

            {showSort && (
              <div className="absolute right-0 top-14 z-40 w-56 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">

                {[
                  {
                    value: "recommended",
                    label: "Recommended",
                  },
                  {
                    value: "price-low",
                    label: "Price: Low to High",
                  },
                  {
                    value: "price-high",
                    label: "Price: High to Low",
                  },
                  {
                    value: "name",
                    label: "Name: A–Z",
                  },
                  {
                    value: "distance",
                    label: "Distance: Nearest First",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortOption(option.value);
                      setShowSort(false);
                    }}
                    className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--color-background)] ${sortOption === option.value
                      ? "bg-[var(--color-coral-light)] font-semibold text-[var(--color-coral)]"
                      : "text-[var(--color-text)]"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}

              </div>
            )}

          </div>

        </div>
        {locationError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {locationError}
          </div>
        )}
        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="mt-12 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Finding available stays...
            </p>
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="font-medium text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          displayedProperties.length === 0 && (
            <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">

              <MapPin
                size={32}
                className="mx-auto text-[var(--color-text-secondary)]"
              />

              <h2 className="mt-4 text-lg font-semibold text-[var(--color-navy)]">
                No available stays found
              </h2>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Try different filters, dates, location,
                purpose, or number of guests.
              </p>

            </div>
          )}

        {/* ===================================================
            RESULTS
        =================================================== */}

        {!loading &&
          !error &&
          displayedProperties.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {displayedProperties.map((property) => {

                const cheapestRoom =
                  property.availableRooms.length > 0
                    ? property.availableRooms.reduce(
                      (cheapest, room) =>
                        room.pricePerNight <
                          cheapest.pricePerNight
                          ? room
                          : cheapest
                    )
                    : null;

                const isFavorite =
                  favoritePropertyIds.includes(
                    property.id
                  );

                const isFavoriteLoading =
                  favoriteLoadingId === property.id;

                return (
                  <Link
                    key={property.id}
                    to={`/property/${property.id}?checkIn=${encodeURIComponent(
                      checkIn
                    )}&checkOut=${encodeURIComponent(
                      checkOut
                    )}&guests=${guests}${purpose
                      ? `&purpose=${encodeURIComponent(
                        purpose
                      )}`
                      : ""
                      }`}
                    className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-background)]">

                      {propertyImages[property.id] ? (
                        <img
                          src={
                            propertyImages[property.id]
                          }
                          alt={property.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">

                          <MapPin
                            size={42}
                            className="text-[var(--color-coral)]"
                          />

                        </div>
                      )}

                      {/* FAVORITE */}

                      <button
                        type="button"
                        aria-label={
                          isFavorite
                            ? `Remove ${property.name} from favorites`
                            : `Save ${property.name}`
                        }
                        onClick={(event) =>
                          handleFavorite(
                            event,
                            property.id
                          )
                        }
                        disabled={isFavoriteLoading}
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isFavoriteLoading ? (
                          <Loader2
                            size={18}
                            className="animate-spin text-[var(--color-coral)]"
                          />
                        ) : (
                          <Heart
                            size={18}
                            className={
                              isFavorite
                                ? "text-[var(--color-coral)]"
                                : "text-[var(--color-navy)]"
                            }
                            fill={
                              isFavorite
                                ? "var(--color-coral)"
                                : "none"
                            }
                          />
                        )}
                      </button>

                    </div>

                    {/* DETAILS */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                            {property.propertyType}
                          </p>

                          <h2 className="mt-1 font-semibold text-[var(--color-navy)]">
                            {property.name}
                          </h2>

                          <p className="mt-1 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                            <MapPin size={14} />
                            {property.city}
                          </p>

                          {userLocation &&
                            property.latitude !== null &&
                            property.longitude !== null && (
                              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--color-coral)]">
                                <Navigation size={13} />
                                {calculateDistanceKm(
                                  userLocation.latitude,
                                  userLocation.longitude,
                                  property.latitude,
                                  property.longitude
                                ).toFixed(1)}{" "}
                                km away
                              </p>
                            )}

                        </div>

                        {property.verified && (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Verified
                          </span>
                        )}

                      </div>

                      {/* SUITABLE PURPOSES */}

                      {property.suitablePurposes &&
                        property.suitablePurposes.length > 0 && (
                          <div className="mt-4">

                            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                              Suitable for
                            </p>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {property.suitablePurposes
                                .slice(0, 3)
                                .map((propertyPurpose) => (
                                  <span
                                    key={propertyPurpose}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${purpose &&
                                      propertyPurpose.toLowerCase() ===
                                      purpose.toLowerCase()
                                      ? "bg-[var(--color-coral-light)] text-[var(--color-coral)]"
                                      : "bg-[var(--color-background)] text-[var(--color-text-secondary)]"
                                      }`}
                                  >
                                    {propertyPurpose}
                                  </span>
                                ))}

                              {property.suitablePurposes.length > 3 && (
                                <span className="rounded-full bg-[var(--color-background)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                                  +{property.suitablePurposes.length - 3} more
                                </span>
                              )}
                            </div>

                          </div>
                        )}

                      <div className="mt-5 flex items-end justify-between border-t border-[var(--color-border)] pt-4">

                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {property.availableRooms.length}{" "}
                          {property.availableRooms.length === 1
                            ? "room"
                            : "rooms"}{" "}
                          available
                        </p>

                        {cheapestRoom && (
                          <p className="text-[var(--color-navy)]">

                            <span className="text-lg font-bold">
                              Rs.{" "}
                              {cheapestRoom.pricePerNight.toLocaleString()}
                            </span>{" "}

                            <span className="text-sm text-[var(--color-text-secondary)]">
                              / night
                            </span>

                          </p>
                        )}

                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

      </main>
    </div>
  );
}

export default SearchResults;

