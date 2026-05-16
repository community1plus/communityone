export const NAVIGATION = [
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
            id: "compose-blob",
            label: "BLOB",
            icon: "🧠",
            type: "compose",
            mode: "blob",
            path: "/communityplus/compose/blob",
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
            id: "event-listing",
            label: "Events",
            icon: "📅",
            type: "route",
            path: "/communityplus/events/create",
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
            id: "news-page",
            label: "News",
            icon: "🗞️",
            type: "route",
            path: "/communityplus/news",
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