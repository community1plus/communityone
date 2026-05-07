export const NAVIGATION = [
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

      {
        id: "about",
        label: "About Us",
        type: "route",
        path: "/communityplus/about",
      },
    ],
  },

  {
    group: "sidebar",

    sections: [
      {
        id: "iview",

        title: "iVIEW",

        variant: "modes",

        items: [
          {
            id: "compose-now",
            label: "NOW",
            icon: "⚡",
            type: "compose",
            mode: "now",
            path: "/communityplus/compose/now",
          },

          {
            id: "compose-news",
            label: "News",
            icon: "📰",
            type: "compose",
            mode: "news",
            path: "/communityplus/compose/news",
          },

          {
            id: "compose-blob",
            label: "BLOB",
            icon: "🧠",
            type: "compose",
            mode: "blob",
            path: "/communityplus/compose/blob",
          },

          {
            id: "compose-event",
            label: "Events",
            icon: "📅",
            type: "compose",
            mode: "event",
            path: "/communityplus/compose/event",
          },

          {
            id: "compose-beacon",
            label: "Beacon",
            icon: "📡",
            type: "compose",
            mode: "beacon",
            path: "/communityplus/compose/beacon",
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