import {
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  FileWarning,
  LayoutDashboard,
  LogOut,
  Menu,
  Star,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponse,
} from "../services/notificationService";

function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationResponse[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

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
      const [
        notificationData,
        unreadData,
      ] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(notificationData);
      setUnreadCount(unreadData);
    } catch (error) {
      console.error(
        "Failed to load admin notifications:",
        error
      );
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // CLOSE NOTIFICATION DROPDOWN
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
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
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (
    type: string
  ) => {
    if (
      type === "COMPLAINT_NEW" ||
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
            className="text-red-600"
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
  // NOTIFICATION CLICK
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

    if (
      notification.type === "COMPLAINT_NEW" ||
      notification.type === "COMPLAINT_STATUS" ||
      notification.type === "COMPLAINT_RESPONSE"
    ) {
      navigate("/admin/complaints");
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

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Properties",
      path: "/admin/properties",
      icon: Building2,
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },
    {
      label: "Complaints",
      path: "/admin/complaints",
      icon: FileWarning,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto max-w-7xl px-6 py-4 lg:px-8">

        {/* =====================================================
            TOP ROW
        ===================================================== */}

        <div className="flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/admin/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">
              Stay
              <span className="text-[var(--color-coral)]">
                By
              </span>
            </span>
          </Link>

          {/* ===================================================
              DESKTOP NAVIGATION
          =================================================== */}

          <div className="hidden items-center gap-8 md:flex">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 text-sm font-medium transition ${
                      isActive
                        ? "text-[var(--color-navy)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}

          </div>

          {/* ===================================================
              DESKTOP RIGHT
          =================================================== */}

          <div className="hidden items-center gap-3 md:flex">

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
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
                aria-label="Notifications"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-xl">

                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-navy)]">
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
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="text-xs font-semibold text-[var(--color-coral)] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* NOTIFICATION LIST */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-3 text-gray-300"
                        />

                        <p className="text-sm font-medium text-[var(--color-navy)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          You are all caught up.
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
                            className={`flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-4 text-left transition hover:bg-[var(--color-coral-light)]/60 ${
                              notification.read
                                ? "bg-white"
                                : "bg-[var(--color-coral-light)]/30"
                            }`}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p
                                  className={`text-sm ${
                                    notification.read
                                      ? "font-medium text-gray-700"
                                      : "font-semibold text-[var(--color-navy)]"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-coral)]" />
                                )}

                              </div>

                              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[11px] text-gray-400">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
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
              to="/admin/dashboard"
              className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-[var(--color-background)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                <User
                  size={16}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--color-navy)]">
                  {user.name ||
                    "Administrator"}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Administrator
                </p>
              </div>
            </Link>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

          {/* ===================================================
              MOBILE MENU BUTTON
          =================================================== */}

          <div className="flex items-center gap-2 md:hidden">

            {/* MOBILE NOTIFICATIONS */}

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
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
                aria-label="Notifications"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-coral)] px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-xl">

                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-navy)]">
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
                        onClick={
                          handleMarkAllAsRead
                        }
                        className="text-xs font-semibold text-[var(--color-coral)] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-3 text-gray-300"
                        />

                        <p className="text-sm font-medium text-[var(--color-navy)]">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          You are all caught up.
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
                            className={`flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-4 text-left transition hover:bg-[var(--color-coral-light)]/60 ${
                              notification.read
                                ? "bg-white"
                                : "bg-[var(--color-coral-light)]/30"
                            }`}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p
                                  className={`text-sm ${
                                    notification.read
                                      ? "font-medium text-gray-700"
                                      : "font-semibold text-[var(--color-navy)]"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-coral)]" />
                                )}

                              </div>

                              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {notification.message}
                              </p>

                              <p className="mt-2 text-[11px] text-gray-400">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
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

            {/* MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (current) => !current
                )
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

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {isMenuOpen && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 md:hidden">

            <div className="flex flex-col gap-1">

              {/* NAVIGATION */}

              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-[var(--color-background)] text-[var(--color-navy)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-navy)]"
                      }`
                    }
                  >
                    <Icon size={17} />
                    {item.label}
                  </NavLink>
                );
              })}

              {/* PROFILE */}

              <Link
                to="/admin/dashboard"
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
                  {user.name ||
                    "Administrator"}
                </p>

                <p className="text-xs text-[var(--color-text-secondary)]">
                  Administrator
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

export default AdminNavbar;