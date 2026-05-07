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
            path: "/communityplus/compose/now",
            mode: "now",
          },
          {
            id: "compose-news",
            label: "News",
            icon: "📰",
            type: "compose",
            path: "/communityplus/compose/news",
            mode: "news",
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
            id: "compose-event",
            label: "Events",
            icon: "📅",
            type: "compose",
            path: "/communityplus/compose/event",
            mode: "event",
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