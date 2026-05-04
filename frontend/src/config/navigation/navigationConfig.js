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
        id: "dashboard",
        label: "Dashboard",
        type: "route",
        path: "/communityplus",
      },
      {
        id: "now",
        label: "NOW",
        type: "route",
        path: "/communityplus/now",
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
        id: "main",
        title: "MAIN",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: "🏠",
            type: "route",
            path: "/communityplus",
          },
          {
            id: "now",
            label: "NOW",
            icon: "⚡",
            type: "route",
            path: "/communityplus/now",
          },
          {
            id: "yellowpages",
            label: "Yellow Pages",
            icon: "📒",
            type: "route",
            path: "/communityplus/yellowpages",
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