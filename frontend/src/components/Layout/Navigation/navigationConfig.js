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
        id: "yellowpages",
        label: "Yellow Pages",
        type: "route",
        path: "/communityplus/yellowpages",
      },
    ],
  },

  {
    group: "sidebar",
    sections: [
      {
        id: "modes",
        title: "MODES",
        items: [
          {
            id: "now",
            label: "NOW",
            icon: "⚡",
            type: "route",
            path: "/communityplus/now",
          },
          {
            id: "blob",
            label: "BLOB",
            icon: "🧠",
            type: "route",
            path: "/communityplus/blob",
          },
        ],
      },

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
            path: "/communityplus/helpdesk",
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