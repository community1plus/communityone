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
        path: "/communityplus",
      },
      {
        id: "iview",
        label: "iVIEW",
        type: "route",
        path: "/communityplus/iview",
      },
      {
        id: "news",
        label: "News",
        type: "route",
        path: "/communityplus/news",
      },
      {
        id: "events",
        label: "Events",
        type: "route",
        path: "/communityplus/events",
      },
      {
        id: "yellowpages",
        label: "Yellow Pages",
        type: "route",
        path: "/communityplus/yellowpages",
      },
      {
        id: "about",
        label: "About Us",
        type: "route",
        path: "/communityplus/about",
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
        id: "create",
        title: "CREATE",
        variant: "modes",
        items: [
          {
            id: "compose-now",
            label: "NOW",
            icon: "⚡",
            type: "compose",
            path: "/communityplus/compose/now",
            mode: "now",
          },
          {
            id: "compose-blob",
            label: "BLOB",
            icon: "🧠",
            type: "compose",
            path: "/communityplus/compose/blob",
            mode: "blob",
          },
          {
            id: "compose-news",
            label: "News Article",
            icon: "📰",
            type: "compose",
            path: "/communityplus/compose/news",
            mode: "news",
          },
          {
            id: "create-event",
            label: "Event Listing",
            icon: "📅",
            type: "route",
            path: "/communityplus/events/create",
          },
          {
            id: "compose-beacon",
            label: "Beacon",
            icon: "📡",
            type: "compose",
            path: "/communityplus/compose/beacon",
            mode: "beacon",
          },
        ],
      },

      {
        id: "platform",
        title: "PLATFORM",
        items: [
          {
            id: "news-page",
            label: "News",
            icon: "🗞️",
            type: "route",
            path: "/communityplus/news",
          },
          {
            id: "events-page",
            label: "Events",
            icon: "📆",
            type: "route",
            path: "/communityplus/events/create",
          },
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
          {
            id: "about-platform",
            label: "About Community One",
            icon: "ℹ️",
            type: "route",
            path: "/communityplus/about",
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