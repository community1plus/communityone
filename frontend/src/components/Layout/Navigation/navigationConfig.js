export const NAVIGATION = [
  /* =====================================================
     HEADER
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
    ],
  },

  /* =====================================================
     SIDEBAR
  ===================================================== */
  {
    group: "sidebar",
    sections: [
      /* =========================
         iVIEW (MODES ONLY)
      ========================= */
      {
        id: "iview",
        title: "iVIEW",
        variant: "modes",
        items: [
          {
            id: "iview-now",
            label: "NOW",
            icon: "⚡",
            type: "mode",
            path: "/communityplus",
            mode: "NOW",
          },
          {
            id: "iview-blob",
            label: "BLOB",
            icon: "🧠",
            type: "mode",
            path: "/communityplus",
            mode: "BLOB",
          },
          {
            id: "iview-incidents",
            label: "Incidents",
            icon: "🚨",
            type: "mode",
            path: "/communityplus",
            mode: "INCIDENTS",
          },
          {
            id: "iview-events",
            label: "Events",
            icon: "📅",
            type: "mode",
            path: "/communityplus",
            mode: "EVENTS",
          },
          {
            id: "iview-beacon",
            label: "Beacon",
            icon: "📡",
            type: "mode",
            path: "/communityplus",
            mode: "BEACON",
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
          {
            id: "channels",
            label: "Channels",
            icon: "📺",
            type: "route",
            path: "/communityplus/channels",
          },
          {
            id: "helpdesk",
            label: "Helpdesk",
            icon: "🛠️",
            type: "route",
            path: "/communityplus/help",
          },
        ],
      },

      /* =========================
         ACCOUNT (MINIMAL)
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