import {
  Bell,
  Building2,
  CheckCheck,
  LogOut,
  Menu,
  UserCircle,
  X,
  CalendarDays,
  Star,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponse,
} from "../services/notificationService";

function OwnerNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] = useState<
    NotificationResponse[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      const [notificationData, unread] =
        await Promise.all([
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

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // CLOSE MENU
  // =========================================================

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenu();

    setIsNotificationOpen(false);

    navigate("/login");
  };

  // =========================================================
  // MARK NOTIFICATION AS READ
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
              ? { ...item, read: true }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(current - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }

    setIsNotificationOpen(false);

    if (
      notification.type === "NEW_BOOKING" ||
      notification.type === "BOOKING_CANCELLED"
    ) {
      navigate("/owner/bookings");
      return;
    }

    if (notification.type === "NEW_REVIEW") {
      navigate("/owner/properties", {
        state: {
          refreshReviews: Date.now(),
        },
      });
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
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (
    type: string
  ) => {
    if (type === "NEW_BOOKING") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
          <CalendarDays
            size={17}
            className="text-[var(--color-coral)]"
          />
        </div>
      );
    }

    if (type === "BOOKING_CANCELLED") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
          <AlertCircle
            size={17}
            className="text-red-500"
          />
        </div>
      );
    }

    if (type === "NEW_REVIEW") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
          <Star
            size={17}
            className="fill-amber-400 text-amber-500"
          />
        </div>
      );
    }

    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Bell
          size={17}
          className="text-gray-500"
        />
      </div>
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatNotificationTime = (
    dateString: string
  ) => {
    const date = new Date(dateString);

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <header className="relative z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        {/* ===================================================
            TOP ROW
        =================================================== */}

        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <Link
            to="/owner/properties"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2"
          >
            <Building2
              size={22}
              className="text-[var(--color-coral)]"
            />

            <span className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">
              StayBy
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">

            <Link
              to="/owner/properties"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              My Properties
            </Link>

            <Link
              to="/owner/bookings"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              Bookings
            </Link>

            <Link
              to="/owner/payments"
              className={`text-sm font-medium transition ${
                location.pathname === "/owner/payments"
                  ? "text-[var(--color-navy)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
              }`}
            >
              Payments
            </Link>

            <Link
              to="/owner/refunds"
              className={`text-sm font-medium transition ${
                location.pathname === "/owner/refunds"
                  ? "text-[var(--color-navy)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
              }`}
            >
              Refunds
            </Link>

          </div>

          {/* =================================================
              DESKTOP USER SECTION
          ================================================= */}

          <div className="hidden items-center gap-3 sm:flex">

            {/* Notification Bell */}
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setIsNotificationOpen(
                    !isNotificationOpen
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                aria-label="Notifications"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* Desktop notification dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-[360px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-xl">

                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">

                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-navy)]">
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1 text-xs font-semibold text-[var(--color-coral)] hover:underline"
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    )}

                  </div>

                  <div className="max-h-[420px] overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-background)]">
                          <Bell
                            size={22}
                            className="text-[var(--color-text-secondary)]"
                          />
                        </div>

                        <p className="text-sm font-semibold text-[var(--color-navy)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          You're all caught up.
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition hover:bg-[var(--color-background)] ${
                              !notification.read
                                ? "bg-[var(--color-coral-light)]/30"
                                : "bg-white"
                            }`}
                          >

                            {getNotificationIcon(
                              notification.type
                            )}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p className="text-sm font-semibold text-[var(--color-navy)]">
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-coral)]" />
                                )}

                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {notification.message}
                              </p>

                              <p className="mt-1.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
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

            {/* User */}
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--color-navy)]">
                {user.name || "Owner"}
              </p>

              <p className="text-xs text-[var(--color-text-secondary)]">
                Property Owner
              </p>
            </div>

            {/* Profile */}
            <Link
              to="/owner/profile"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
            >
              <UserCircle size={17} />
              Profile
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

          {/* =================================================
              MOBILE ACTIONS
          ================================================= */}

          <div className="flex items-center gap-2 sm:hidden">

            {/* Mobile notification bell */}
            <button
              type="button"
              onClick={() =>
                setIsNotificationOpen(
                  !isNotificationOpen
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-navy)]"
              aria-label="Notifications"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(!isMenuOpen)
              }
              className="rounded-lg p-2 text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
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

        </div>

        {/* ===================================================
            MOBILE NOTIFICATIONS
        =================================================== */}

        {isNotificationOpen && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm sm:hidden">

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">

              <div>
                <h3 className="text-sm font-bold text-[var(--color-navy)]">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {unreadCount} unread
                  </p>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--color-coral)]"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}

            </div>

            <div className="max-h-[360px] overflow-y-auto">

              {notifications.length === 0 ? (
                <div className="px-5 py-8 text-center">

                  <Bell
                    size={22}
                    className="mx-auto mb-2 text-[var(--color-text-secondary)]"
                  />

                  <p className="text-sm font-semibold text-[var(--color-navy)]">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    You're all caught up.
                  </p>

                </div>
              ) : (
                notifications.map(
                  (notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className={`flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left ${
                        !notification.read
                          ? "bg-[var(--color-coral-light)]/30"
                          : "bg-white"
                      }`}
                    >

                      {getNotificationIcon(
                        notification.type
                      )}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <p className="text-sm font-semibold text-[var(--color-navy)]">
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-coral)]" />
                          )}

                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[10px] text-[var(--color-text-secondary)]">
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

        {/* ===================================================
            MOBILE MENU
        =================================================== */}

        {isMenuOpen && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 md:hidden">

            <div className="flex flex-col gap-1">

              <Link
                to="/owner/properties"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                My Properties
              </Link>

              <Link
                to="/owner/bookings"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                Bookings
              </Link>

              <Link
                to="/owner/payments"
                onClick={closeMenu}
                className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                  location.pathname === "/owner/payments"
                    ? "bg-[var(--color-background)] text-[var(--color-navy)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
                }`}
              >
                Payments
              </Link>

              <Link
                to="/owner/refunds"
                onClick={closeMenu}
                className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                  location.pathname === "/owner/refunds"
                    ? "bg-[var(--color-background)] text-[var(--color-navy)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
                }`}
              >
                Refunds
              </Link>

              <div className="my-2 border-t border-[var(--color-border)]" />

              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-[var(--color-navy)]">
                  {user.name || "Owner"}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Property Owner
                </p>
              </div>

              <Link
                to="/owner/profile"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
              >
                <UserCircle size={17} />
                Profile
              </Link>

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

export default OwnerNavbar;