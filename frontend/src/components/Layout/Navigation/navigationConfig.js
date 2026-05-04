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
        path: "/",
      },

      {
        id: "iview",
        label: "iVIEW",
        type: "route",
        path: "/communityplus",
      },

      {
        id: "yellowpages",
        label: "Yellow Pages",
        type: "route",
        path: "/communityplus/yellowpages",
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
         MAIN
      ========================= */
      {
        id: "main",
        title: "MAIN",
        items: [
          {
            id: "iview",
            label: "iVIEW",
            icon: "👁️",
            type: "route",
            path: "/communityplus",
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
            path: "/communityplus/event",
          },
          {
            id: "incident",
            label: "Incident",
            icon: "🚨",
            type: "route",
            path: "/communityplus/incident",
          },
          {
            id: "beacon",
            label: "Beacon",
            icon: "📡",
            type: "route",
            path: "/communityplus/beacon",
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
            path: "/communityplus/yellowpages",
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
            id: "profile",
            label: "Profile",
            icon: "👤",
            type: "route",
            path: "/communityplus/profile",
          },
          {
            id: "account",
            label: "Account",
            icon: "⚙️",
            type: "route",
            path: "/communityplus/account",
          },
          {
            id: "inbox",
            label: "Inbox",
            icon: "✉️",
            type: "route",
            path: "/communityplus/inbox",
          },
          {
            id: "help",
            label: "Help",
            icon: "❓",
            type: "route",
            path: "/communityplus/help",
          },
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