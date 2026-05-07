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
      {
        id: "about",
        label: "About Us",
        type: "route",
        path: "/about",
      },
    ],
  },

  /* =====================================================
     SIDEBAR
  ===================================================== */
  {
    group: "sidebar",
    sections: [
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