import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Building2,
  MapPin,
  ImagePlus,
  X,
  Check,
  Wifi,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createProperty,
  uploadPropertyImage,
  type CreatePropertyRequest,
} from "../services/ownerPropertyService";

import OwnerNavbar from "../components/OwnerNavbar";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ErrorPopup from "../components/ErrorPopup";

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

const AMENITY_OPTIONS = [
  "Free Wi-Fi",
  "Air conditioning",
  "Private bathroom",
  "Free parking",
  "Kitchen",
  "Workspace",
  "Washing machine",
  "Refrigerator",
  "TV",
  "Hot water",
  "Balcony",
  "Breakfast included",
];

const DEFAULT_LOCATION: [number, number] = [
  7.8731,
  80.7718,
];

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

function LocationMarker({
  position,
  onPositionChange,
}: {
  position: [number, number] | null;
  onPositionChange: (
    position: [number, number]
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onPositionChange([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target as L.Marker;
          const coordinates = marker.getLatLng();

          onPositionChange([
            coordinates.lat,
            coordinates.lng,
          ]);
        },
      }}
    />
  );
}

function OwnerAddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreatePropertyRequest>({
    name: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    latitude: null,
    longitude: null,
    suitablePurposes: [],
    amenities: [],
  });

  // Actual image files selected by the owner
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Preview URLs for displaying selected images
  const [images, setImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Location state
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [mapPosition, setMapPosition] =
    useState<[number, number] | null>(null);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    if (name === "address" || name === "city") {
      setMapPosition(null);

      setForm((current) => ({
        ...current,
        [name]: value,
        latitude: null,
        longitude: null,
      }));

      setLocationError("");
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePurposeChange = (purpose: string) => {
    setForm((current) => {
      const alreadySelected =
        current.suitablePurposes.includes(purpose);

      return {
        ...current,
        suitablePurposes: alreadySelected
          ? current.suitablePurposes.filter(
              (item) => item !== purpose
            )
          : [...current.suitablePurposes, purpose],
      };
    });

    setError("");
  };

  // Toggle an amenity on or off
  const handleAmenityChange = (amenity: string) => {
    setForm((current) => {
      const alreadySelected =
        current.amenities.includes(amenity);

      return {
        ...current,
        amenities: alreadySelected
          ? current.amenities.filter(
              (item) => item !== amenity
            )
          : [...current.amenities, amenity],
      };
    });
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const remainingSlots = 6 - imageFiles.length;

    if (remainingSlots <= 0) {
      setError("You can upload a maximum of 6 images.");
      event.target.value = "";
      return;
    }

    const selectedFiles = Array.from(files).slice(
      0,
      remainingSlots
    );

    const selectedPreviewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles((current) => [
      ...current,
      ...selectedFiles,
    ]);

    setImages((current) => [
      ...current,
      ...selectedPreviewUrls,
    ]);

    setError("");
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);

    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );

    setImageFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  /*
   * Find the property location using the address and city.
   */
  const handleFindLocation = async () => {
    if (!form.address.trim() && !form.city.trim()) {
      setLocationError(
        "Please enter an address or city first."
      );
      return;
    }

    try {
      setLocationLoading(true);
      setLocationError("");

      const query = [
        form.address.trim(),
        form.city.trim(),
        "Sri Lanka",
      ]
        .filter(Boolean)
        .join(", ");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lk&q=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error("Unable to find this location.");
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        setLocationError(
          "Location not found. Try entering a more complete address."
        );
        return;
      }

      const latitude = Number(results[0].lat);
      const longitude = Number(results[0].lon);

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        throw new Error(
          "The location returned was invalid."
        );
      }

      setMapPosition([latitude, longitude]);

      setForm((current) => ({
        ...current,
        latitude,
        longitude,
      }));
    } catch (err) {
      setLocationError(
        err instanceof Error
          ? err.message
          : "Failed to find location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  /*
   * Update coordinates when the owner clicks the map
   * or drags the marker.
   */
  const handleMapPositionChange = (
    position: [number, number]
  ) => {
    setMapPosition(position);

    setForm((current) => ({
      ...current,
      latitude: position[0],
      longitude: position[1],
    }));

    setLocationError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a property name.");
      return;
    }

    if (!form.propertyType) {
      setError("Please select a property type.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the property address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter the city.");
      return;
    }

    if (form.suitablePurposes.length === 0) {
      setError(
        "Please select at least one reason your property is suitable for."
      );
      return;
    }

    if (
      form.latitude === null ||
      form.longitude === null
    ) {
      setError(
        "Please find and confirm your property's location on the map."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * STEP 1
       * Create the property, including its selected amenities.
       */
      const createdProperty = await createProperty({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        suitablePurposes: [...form.suitablePurposes],
        amenities: [...form.amenities],
      });

      /*
       * STEP 2
       * Upload each selected image to the newly created property.
       */
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          await uploadPropertyImage(
            createdProperty.id,
            file
          );
        }
      }

      /*
       * STEP 3
       * Continue directly to room setup.
       */
      navigate(
        `/owner/properties/${createdProperty.id}/rooms?setup=true`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OwnerNavbar />

      <main className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        {/* Heading */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
              <Building2
                size={21}
                className="text-[var(--color-coral)]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
                Owner
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-navy)]">
                Add property
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Add the basic information about your property. You can
            manage its rooms after creating it.
          </p>
        </div>

        {/* Error */}
        <ErrorPopup message={error} onClose={() => setError("")} />

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          {/* Property information */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--color-navy)]">
              Property information
            </h2>

            <div className="mt-6 space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Property name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. StayBy City Guesthouse"
                  required
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="propertyType"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Property type
                </label>

                <select
                  id="propertyType"
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                >
                  <option value="">Select property type</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="GUESTHOUSE">Guesthouse</option>
                  <option value="VILLA">Villa</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="HOMESTAY">Homestay</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your property..."
                  className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>
            </div>
          </section>

          {/* Suitable for */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Suitable for
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                Select the types of stays your property is suitable
                for. You can choose more than one.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {PURPOSE_OPTIONS.map((purpose) => {
                const selected =
                  form.suitablePurposes.includes(purpose);

                return (
                  <label
                    key={purpose}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      selected
                        ? "border-[var(--color-coral)] bg-[var(--color-coral-light)]"
                        : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-coral)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handlePurposeChange(purpose)
                      }
                      className="sr-only"
                    />

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        selected
                          ? "border-[var(--color-coral)] bg-[var(--color-coral)] text-white"
                          : "border-[var(--color-border)] bg-[var(--color-surface)]"
                      }`}
                    >
                      {selected && <Check size={14} />}
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        selected
                          ? "text-[var(--color-navy)]"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {purpose}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
              Choose all purposes that accurately describe the
              type of stay your property can accommodate.
            </p>
          </section>

          {/* Amenities */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <Wifi
                  size={19}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                  What this property offers
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Select the amenities actually available at your
                  property. You can choose more than one.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const selected =
                  form.amenities.includes(amenity);

                return (
                  <label
                    key={amenity}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      selected
                        ? "border-[var(--color-coral)] bg-[var(--color-coral-light)]"
                        : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-coral)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handleAmenityChange(amenity)
                      }
                      className="sr-only"
                    />

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        selected
                          ? "border-[var(--color-coral)] bg-[var(--color-coral)] text-white"
                          : "border-[var(--color-border)] bg-[var(--color-surface)]"
                      }`}
                    >
                      {selected && <Check size={14} />}
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        selected
                          ? "text-[var(--color-navy)]"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {amenity}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              <Sparkles
                size={15}
                className="mt-0.5 shrink-0 text-[var(--color-coral)]"
              />
              <p>
                Only select amenities that guests can actually use
                during their stay.
              </p>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <ImagePlus
                  size={19}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                  Property images
                </h2>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Add up to 6 images of your property.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="property-images"
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8 text-center transition hover:border-[var(--color-coral)] hover:bg-[var(--color-coral-light)]"
              >
                <ImagePlus
                  size={28}
                  className="text-[var(--color-coral)]"
                />

                <p className="mt-3 text-sm font-semibold text-[var(--color-navy)]">
                  Choose property images
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  PNG, JPG or JPEG · Maximum 6 images
                </p>

                <input
                  id="property-images"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--color-border)]"
                    >
                      <img
                        src={image}
                        alt={`Property preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={16} />
                      </button>

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-[var(--color-navy)] px-2.5 py-1 text-[10px] font-semibold text-white">
                          Main image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                You can select up to 6 images. They will be uploaded
                when you create the property.
              </p>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <MapPin
                  size={19}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                  Property location
                </h2>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Enter the address and we'll help you locate your property.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Property address
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. Kandy Lake Road"
                  required
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Kandy"
                  required
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Find location */}
              <div>
                <button
                  type="button"
                  onClick={handleFindLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MapPin size={17} />
                  {locationLoading
                    ? "Finding location..."
                    : "Find location"}
                </button>

                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  We'll find the location from the address you entered.
                </p>
              </div>

              {/* Location error */}
              {locationError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm text-red-600">
                    {locationError}
                  </p>
                </div>
              )}

              {/* Map */}
              <div>
                <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                  Confirm your location
                </p>

                <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
                  Click on the map or drag the marker to adjust the exact location.
                </p>

                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                  <MapContainer
                    center={mapPosition || DEFAULT_LOCATION}
                    zoom={mapPosition ? 15 : 7}
                    scrollWheelZoom={true}
                    className="h-80 w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {mapPosition && (
                      <>
                        <MapCenterUpdater position={mapPosition} />

                        <LocationMarker
                          position={mapPosition}
                          onPositionChange={handleMapPositionChange}
                        />
                      </>
                    )}
                  </MapContainer>
                </div>
              </div>

              {/* Location status */}
              {form.latitude !== null &&
                form.longitude !== null && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <Check
                      size={18}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        Location selected
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        Your property's map location has been selected.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/owner/properties")}
              disabled={loading}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? imageFiles.length > 0
                  ? "Creating & uploading..."
                  : "Creating..."
                : "Create property"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default OwnerAddProperty;
