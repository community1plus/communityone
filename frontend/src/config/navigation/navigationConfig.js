export const NAVIGATION = [
  /* =====================================================
     HEADER NAV (TOP BAR)
  ===================================================== */
  {
    group: "main",
    items: [
      {
        id: "home",
        label: "Home",
        type: "route",
        path: "/home",
      },

      {
        id: "feed",
        label: "Feed",
        type: "group",
        children: [
          {
            id: "feed-all",
            label: "All",
            type: "route",
            path: "/communityplus",
          },
          {
            id: "feed-incidents",
            label: "Incidents",
            type: "route",
            path: "/incident",
          },
          {
            id: "feed-alerts",
            label: "Alerts",
            type: "route",
            path: "/beacon",
          },
        ],
      },

      {
        id: "posts",
        label: "Posts",
        type: "route",
        path: "/post",
      },

      {
        id: "yellowpages",
        label: "Yellow Pages",
        type: "route",
        path: "/yellowpages",
      },

      {
        id: "dashboard",
        label: "Dashboard",
        type: "group",
        children: [
          {
            id: "channels",
            label: "Channels",
            type: "route",
            path: "/channels",
          },
        ],
      },
    ],
  },

  /* =====================================================
     SIDEBAR
  ===================================================== */
  {
    group: "sidebar",
    sections: [
      /* =========================
         MODES (MAP BEHAVIOUR)
      ========================= */
      {
        id: "modes",
        title: "MODES",
        variant: "modes",
        items: [
          {
            id: "mode-now",
            label: "NOW",
            icon: "⚡",
            type: "mode",
            value: "NOW",
          },
          {
            id: "mode-blob",
            label: "BLOB",
            icon: "🧠",
            type: "mode",
            value: "BLOB",
          },
        ],
      },

      /* =========================
         ACTIONS
      ========================= */
      {
        id: "actions",
        title: "ACTIONS",
        items: [
          {
            id: "event",
            label: "Event",
            icon: "📅",
            type: "route",
            path: "/event",
          },
          {
            id: "incident",
            label: "Incident",
            icon: "🚨",
            type: "route",
            path: "/incident",
          },
          {
            id: "beacon",
            label: "Beacon",
            icon: "📡",
            type: "route",
            path: "/beacon",
          },
        ],
      },

      /* =========================
         PLATFORM
      ========================= */
      {
        id: "platform",
        title: "PLATFORM",
        items: [
          {
            id: "yellowpages",
            label: "Yellow Pages",
            icon: "📒",
            type: "route",
            path: "/yellowpages",
          },
          {
            id: "channels",
            label: "Channels",
            icon: "📺",
            type: "route",
            path: "/channels",
          },
        ],
      },

      /* =========================
         ACCOUNT
      ========================= */
      {
        id: "account",
        title: "ACCOUNT",
        items: [
          {
            id: "logout",
            label: "Logout",
            icon: "🚪",
            type: "action",
            action: "logout",
          },
        ],
      },
    ],
  },
];