export const NAVIGATION = [
  /* =====================================================
     HEADER NAV
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
        children: [
          { id: "feed-all", label: "All", path: "/communityplus" },
          { id: "feed-incidents", label: "Incidents", path: "/incident" },
          { id: "feed-alerts", label: "Alerts", path: "/alerts" },
          { id: "feed-beacons", label: "Beacons", path: "/beacon" },
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
        children: [
          { id: "categories", label: "Categories", path: "/dashboard" },
        ],
      },
    ],
  },

  /* =====================================================
     SIDEBAR NAV
  ===================================================== */
  {
    group: "sidebar",

    sections: [
      /* 🔥 SCOPE (NEW) */
      {
        id: "scope",
        title: "SCOPE",
        variant: "scope",
        items: [
          {
            id: "scope-local",
            label: "Local",
            icon: "📍",
            type: "scope",
            value: "LOCAL",
          },
          {
            id: "scope-global",
            label: "Global",
            icon: "🌍",
            type: "scope",
            value: "GLOBAL",
          },
        ],
      },

      /* 🔥 MODES */
      {
        id: "modes",
        title: "MODES",
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

      /* ACTIONS */
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

      /* PLATFORM */
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

          /* 🔥 NEW */
          {
            id: "helpdesk",
            label: "Helpdesk",
            icon: "🛠️",
            type: "route",
            path: "/helpdesk",
          },
        ],
      },

      /* ACCOUNT */
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