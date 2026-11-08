import Avatar from "./Avatar";
import { useProfileImage } from "../services/profileImage";
import Logo from "./Logo";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Heart,
  LogOut,
  Menu,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponse,
} from "../services/notificationService";

function TravelerNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    NotificationResponse[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const profileImage = useProfileImage();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      const [notificationData, unread] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(notificationData);
      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // CLOSE NOTIFICATION DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // FORMAT NOTIFICATION TIME
  // =========================================================

  const formatNotificationTime = (
    createdAt: string
  ) => {
    const created = new Date(createdAt);
    const now = new Date();

    const difference =
      now.getTime() - created.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"
        } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"
        } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} ${days === 1 ? "day" : "days"
        } ago`;
    }

    return created.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (
    type: string
  ) => {
    if (type === "BOOKING_CONFIRMED") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2
            size={18}
            className="text-green-600"
          />
        </div>
      );
    }

    if (type === "BOOKING_REJECTED") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
          <XCircle
            size={18}
            className="text-red-500"
          />
        </div>
      );
    }
    if (
      type === "COMPLAINT_STATUS" ||
      type === "COMPLAINT_RESPONSE"
    ) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
          <FileWarning
            size={18}
            className="text-[var(--color-coral)]"
          />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
        <Bell
          size={18}
          className="text-[var(--color-coral)]"
        />
      </div>
    );
  };

  // =========================================================
  // CLICK NOTIFICATION
  // =========================================================

const handleNotificationClick = async (
  notification: NotificationResponse
) => {
  try {
    if (!notification.read) {
      await markNotificationAsRead(
        notification.id
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    }
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error
    );
  }

  setShowNotifications(false);
  closeMenu();

  // Booking / payment / refund notices: open that booking.
  if (
    notification.type === "BOOKING_CONFIRMED" ||
    notification.type === "BOOKING_REJECTED" ||
    notification.type === "BOOKING_CANCELLED" ||
    notification.type === "PAYMENT_REQUIRED" ||
    notification.type === "PAYMENT_REJECTED" ||
    notification.type === "REFUND_REQUESTED"
  ) {
    navigate(
      notification.relatedId
        ? `/my-bookings/${notification.relatedId}`
        : "/my-bookings"
    );
    return;
  }

  if (
    notification.type ===
      "COMPLAINT_STATUS" ||
    notification.type ===
      "COMPLAINT_RESPONSE"
  ) {
    navigate("/complaints");
    return;
  }
};

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenu();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto max-w-7xl px-6 py-4 lg:px-8">

        {/* =====================================================
            TOP ROW
        ===================================================== */}

        <div className="flex items-center justify-between gap-3">

          {/* LOGO */}

          <Logo to="/" onClick={closeMenu} />

          {/* ===================================================
              DESKTOP NAVIGATION
          =================================================== */}

          <div className="hidden items-center gap-5 whitespace-nowrap lg:flex xl:gap-8">

            <Link
              to="/search"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              <Search size={16} className="hidden xl:block" />
              Search
            </Link>

            <Link
              to="/my-bookings"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              <CalendarDays size={16} className="hidden xl:block" />
              My Bookings
            </Link>

            <Link
              to="/favorites"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              <Heart size={16} className="hidden xl:block" />
              Favorites
            </Link>

            <Link
              to="/complaints"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              <FileWarning size={16} className="hidden xl:block" />
              Complaints
            </Link>
          </div>

          {/* ===================================================
              DESKTOP RIGHT
          =================================================== */}

          <div className="hidden items-center gap-2 lg:flex xl:gap-4">

            {/* NOTIFICATIONS */}

            <div
              ref={notificationRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
                className="relative rounded-xl p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
                aria-label="Notifications"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-xl">

                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="text-xs font-semibold text-[var(--color-coral)] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">

                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-background)]">
                          <Bell
                            size={21}
                            className="text-gray-400"
                          />
                        </div>

                        <p className="text-sm font-medium text-[var(--color-navy)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          We'll let you know when
                          something happens.
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition hover:bg-[var(--color-background)] ${notification.read
                              ? "bg-white"
                              : "bg-[var(--color-coral-light)]"
                              }`}
                          >

                            {getNotificationIcon(
                              notification.type
                            )}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-[var(--color-navy)]">
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.read && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-coral)]" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-1.5 text-[10px] text-gray-400">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </p>

                            </div>

                          </button>
                        )
                      )
                    )}

                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-[var(--color-background)]"
            >
              <Avatar name={user.name} imageUrl={profileImage} size={32} />

              <div className="hidden text-left xl:block">
                <p className="max-w-[9rem] truncate text-sm font-semibold text-[var(--color-navy)]">
                  {user.name || "Traveler"}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Traveler
                </p>
              </div>
            </Link>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>

          {/* ===================================================
              MOBILE MENU BUTTON
          =================================================== */}

          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(
                (current) => !current
              )
            }
            className="rounded-lg p-2 text-[var(--color-navy)] transition hover:bg-[var(--color-background)] lg:hidden"
            aria-label={
              isMenuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {isMenuOpen && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 lg:hidden">
            <div className="flex flex-col gap-1">

              {/* SEARCH */}

              <Link
                to="/search"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <Search size={17} />
                Search
              </Link>

              <Link
                to="/complaints"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <FileWarning size={17} />
                Complaints
              </Link>

              {/* MY BOOKINGS */}

              <Link
                to="/my-bookings"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <CalendarDays size={17} />
                My Bookings
              </Link>

              {/* FAVORITES */}

              <Link
                to="/favorites"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <Heart size={17} />
                Favorites
              </Link>

              {/* =================================================
                  MOBILE NOTIFICATIONS
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <span className="flex items-center gap-2">
                  <Bell size={17} />
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* MOBILE NOTIFICATION PANEL */}

              {showNotifications && (
                <div className="mb-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">

                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="text-xs font-semibold text-[var(--color-coral)] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">

                        <Bell
                          size={20}
                          className="mx-auto mb-2 text-gray-400"
                        />

                        <p className="text-sm font-medium text-[var(--color-navy)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          We'll let you know when
                          something happens.
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`flex w-full gap-3 border-b border-[var(--color-border)] px-3 py-3 text-left transition hover:bg-[var(--color-background)] ${notification.read
                              ? "bg-white"
                              : "bg-[var(--color-coral-light)]"
                              }`}
                          >

                            {getNotificationIcon(
                              notification.type
                            )}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-[var(--color-navy)]">
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.read && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-coral)]" />
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-1.5 text-[10px] text-gray-400">
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </p>

                            </div>

                          </button>
                        )
                      )
                    )}

                  </div>
                </div>
              )}

              {/* PROFILE */}

              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <User size={17} />
                Profile
              </Link>

              <div className="my-2 border-t border-[var(--color-border)]" />

              {/* USER */}

              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-[var(--color-navy)]">
                  {user.name || "Traveler"}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Traveler
                </p>
              </div>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default TravelerNavbar;