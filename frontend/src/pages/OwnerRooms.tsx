import { showConfirm } from "../services/dialog";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import OwnerNavbar from "../components/OwnerNavbar";

import {
  createRoom,
  deleteRoom,
  deleteRoomImage,
  getPropertyRooms,
  getRoomImages,
  updateRoom,
  uploadRoomImage,
  type CreateRoomRequest,
  type RoomImageResponse,
  type RoomResponse,
} from "../services/ownerRoomService";
import ErrorPopup from "../components/ErrorPopup";

import { API_BASE_URL } from "../config";

const EMPTY_FORM: CreateRoomRequest = {
  name: "",
  description: "",
  pricePerNight: 0,
  capacity: 1,
  available: true,
};

function OwnerRooms() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();

  const numericPropertyId = Number(propertyId);

  const setupMode =
    searchParams.get("setup") === "true";

  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  const [roomImages, setRoomImages] = useState<
    Record<number, RoomImageResponse[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] =
    useState(setupMode);

  const [editingRoomId, setEditingRoomId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CreateRoomRequest>({
      ...EMPTY_FORM,
    });

  const [saving, setSaving] = useState(false);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getPropertyRooms(
          numericPropertyId
        );

      setRooms(data);

      const imageResults: Record<
        number,
        RoomImageResponse[]
      > = {};

      await Promise.all(
        data.map(async (room) => {
          try {
            const images =
              await getRoomImages(room.id);

            imageResults[room.id] = images;
          } catch {
            imageResults[room.id] = [];
          }
        })
      );

      setRoomImages(imageResults);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load rooms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      !propertyId ||
      Number.isNaN(numericPropertyId)
    ) {
      setError("Invalid property ID.");
      setLoading(false);
      return;
    }

    loadRooms();
  }, [propertyId]);

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });

    setEditingRoomId(null);
    setShowForm(false);
  };

  const openAddRoomForm = () => {
    setError("");

    setEditingRoomId(null);

    setForm({
      ...EMPTY_FORM,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFormChange = (
    field: keyof CreateRoomRequest,
    value: string | number | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) {
      setError("Please enter a room name.");
      return;
    }

    if (form.pricePerNight <= 0) {
      setError(
        "Price per night must be greater than 0."
      );
      return;
    }

    if (form.capacity <= 0) {
      setError(
        "Capacity must be greater than 0."
      );
      return;
    }

    try {
      setSaving(true);

      const roomData = {
        ...form,
        name: form.name.trim(),
        description:
          form.description.trim(),
      };

      if (editingRoomId === null) {
        const newRoom =
          await createRoom(
            numericPropertyId,
            roomData
          );

        setRooms((current) => [
          ...current,
          newRoom,
        ]);

        setRoomImages((current) => ({
          ...current,
          [newRoom.id]: [],
        }));

        /*
         * During initial setup, keep the form open
         * so the owner can immediately add another room.
         */
        if (setupMode) {
          setForm({
            ...EMPTY_FORM,
          });

          setEditingRoomId(null);
          setShowForm(true);
        } else {
          resetForm();
        }
      } else {
        const updatedRoom =
          await updateRoom(
            numericPropertyId,
            editingRoomId,
            roomData
          );

        setRooms((current) =>
          current.map((room) =>
            room.id === editingRoomId
              ? updatedRoom
              : room
          )
        );

        resetForm();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save room."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (
    room: RoomResponse
  ) => {
    setError("");

    setEditingRoomId(room.id);

    setForm({
      name: room.name,
      description:
        room.description || "",
      pricePerNight:
        room.pricePerNight,
      capacity: room.capacity,
      available: room.available,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeleteRoom = async (
    roomId: number
  ) => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteRoom(
        numericPropertyId,
        roomId
      );

      setRooms((current) =>
        current.filter(
          (room) => room.id !== roomId
        )
      );

      setRoomImages((current) => {
        const updated = {
          ...current,
        };

        delete updated[roomId];

        return updated;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete room."
      );
    }
  };

  const handleImageChange = async (
    roomId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setError("");

    try {
      const currentImages =
        roomImages[roomId] || [];

      const remainingSlots =
        6 - currentImages.length;

      if (remainingSlots <= 0) {
        setError(
          "A room can have a maximum of 6 images."
        );

        event.target.value = "";
        return;
      }

      const selectedFiles =
        Array.from(files).slice(
          0,
          remainingSlots
        );

      for (const file of selectedFiles) {
        const uploadedImage =
          await uploadRoomImage(
            roomId,
            file
          );

        setRoomImages((current) => ({
          ...current,
          [roomId]: [
            ...(current[roomId] || []),
            uploadedImage,
          ],
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload room image."
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleDeleteImage = async (
    roomId: number,
    imageId: number
  ) => {
    const confirmed = await showConfirm(
      "Are you sure you want to remove this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteRoomImage(
        roomId,
        imageId
      );

      setRoomImages((current) => ({
        ...current,
        [roomId]: (
          current[roomId] || []
        ).filter(
          (image) => image.id !== imageId
        ),
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete room image."
      );
    }
  };

  if (
    !propertyId ||
    Number.isNaN(numericPropertyId)
  ) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <OwnerNavbar />

        <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            Invalid property ID.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OwnerNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/owner/properties")
              }
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-coral)]"
            >
              <ArrowLeft size={17} />
              Back to properties
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <BedDouble
                  size={22}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
                  Owner
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-navy)]">
                  {setupMode
                    ? "Set up your rooms"
                    : "Manage rooms"}
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {setupMode
                ? "Add the rooms available at your property. You can add multiple rooms now and manage them later from your properties."
                : "Add and manage the rooms available at this property."}
            </p>
          </div>

          {/* =====================================================
              HEADER ACTIONS
          ===================================================== */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {setupMode && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/owner/properties"
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
              >
                Finish setup
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  openAddRoomForm();
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
            >
              {showForm ? (
                <>
                  <X size={17} />
                  Close form
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Add room
                </>
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}
        <ErrorPopup message={error} onClose={() => setError("")} />

        {/* =====================================================
            ADD / EDIT ROOM FORM
        ===================================================== */}
        {showForm && (
          <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                  {editingRoomId === null
                    ? "Add room"
                    : "Edit room"}
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Enter the room details below.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* Room name */}
              <div>
                <label
                  htmlFor="room-name"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Room name
                </label>

                <input
                  id="room-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleFormChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Deluxe Double Room"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="room-price"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Price per night
                </label>

                <input
                  id="room-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.pricePerNight}
                  onChange={(event) =>
                    handleFormChange(
                      "pricePerNight",
                      Number(
                        event.target.value
                      )
                    )
                  }
                  placeholder="e.g. 8500"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Capacity */}
              <div>
                <label
                  htmlFor="room-capacity"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Guest capacity
                </label>

                <input
                  id="room-capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(event) =>
                    handleFormChange(
                      "capacity",
                      Number(
                        event.target.value
                      )
                    )
                  }
                  placeholder="e.g. 2"
                  className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Availability */}
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-[var(--color-text)]">
                      Room available
                    </span>

                    <span className="mt-1 block text-xs text-[var(--color-text-secondary)]">
                      Allow guests to book this room
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(event) =>
                      handleFormChange(
                        "available",
                        event.target.checked
                      )
                    }
                    className="h-5 w-5 accent-[var(--color-coral)]"
                  />
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="room-description"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Description
                </label>

                <textarea
                  id="room-description"
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    handleFormChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the room..."
                  className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-xl bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingRoomId === null
                    ? "Create room"
                    : "Save changes"}
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            ROOMS
        ===================================================== */}
        {loading ? (
          <div className="mt-10 flex min-h-64 items-center justify-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Loading rooms...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="mt-8 flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                <BedDouble
                  size={26}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[var(--color-navy)]">
                No rooms yet
              </h2>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Add your first room to this property.
              </p>

              <button
                type="button"
                onClick={openAddRoomForm}
                className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
              >
                <Plus size={17} />
                Add room
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {rooms.map((room) => {
              const images =
                roomImages[room.id] || [];

              const firstImage =
                images[0];

              return (
                <div
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
                >

                  {/* Room image */}
                  {firstImage ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={`${API_BASE_URL}${firstImage.imageUrl}`}
                        alt={room.name}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute right-3 top-3 rounded-full bg-[var(--color-navy)] px-3 py-1 text-xs font-semibold text-white">
                        {images.length}{" "}
                        {images.length === 1
                          ? "image"
                          : "images"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-[var(--color-background)]">
                      <div className="text-center">
                        <ImagePlus
                          size={30}
                          className="mx-auto text-[var(--color-text-secondary)]"
                        />

                        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                          No room images
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Room information */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                          {room.name}
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          Room #{room.id}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          room.available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {room.available
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {room.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[var(--color-background)] p-4">
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Price per night
                        </p>

                        <p className="mt-1 text-lg font-bold text-[var(--color-navy)]">
                          Rs.{" "}
                          {room.pricePerNight.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[var(--color-background)] p-4">
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Capacity
                        </p>

                        <p className="mt-1 text-lg font-bold text-[var(--color-navy)]">
                          {room.capacity}{" "}
                          {room.capacity === 1
                            ? "guest"
                            : "guests"}
                        </p>
                      </div>
                    </div>

                    {/* Image thumbnails */}
                    {images.length > 0 && (
                      <div className="mt-5 grid grid-cols-4 gap-2">
                        {images.map(
                          (image) => (
                            <div
                              key={image.id}
                              className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]"
                            >
                              <img
                                src={`${API_BASE_URL}${image.imageUrl}`}
                                alt={`${room.name} image`}
                                className="h-full w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteImage(
                                    room.id,
                                    image.id
                                  )
                                }
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                                aria-label="Delete room image"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Upload image */}
                    {images.length < 6 && (
                      <label
                        htmlFor={`room-images-${room.id}`}
                        className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-3 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-coral)] hover:bg-[var(--color-coral-light)] hover:text-[var(--color-coral)]"
                      >
                        <ImagePlus size={16} />
                        Add room images

                        <input
                          id={`room-images-${room.id}`}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          multiple
                          onChange={(event) =>
                            handleImageChange(
                              room.id,
                              event
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(room)
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                      >
                        <Pencil size={16} />
                        Edit room
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteRoom(
                            room.id
                          )
                        }
                        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete room
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =====================================================
            SETUP MODE FOOTER
            IMPORTANT: This is OUTSIDE rooms.map()
        ===================================================== */}
        {setupMode && !loading && (
          <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
              <BedDouble
                size={22}
                className="text-[var(--color-coral)]"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-navy)]">
              {rooms.length === 0
                ? "Add at least one room"
                : "Rooms are ready"}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {rooms.length === 0
                ? "Add the first room to make your property ready for bookings."
                : "You can add more rooms or finish the property setup. You can always manage your rooms later."}
            </p>

            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openAddRoomForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
              >
                <Plus size={17} />
                {rooms.length === 0
                  ? "Add room"
                  : "Add another room"}
              </button>

              {rooms.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/properties"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
                >
                  Finish setup
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OwnerRooms;
