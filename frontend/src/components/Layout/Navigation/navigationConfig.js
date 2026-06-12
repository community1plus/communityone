export const NAVIGATION = [
  {
    group: "main",
    items: [
      {
        id: "home",
        label: "Home",
        type: "route",
        path: "/communityplus",
        product: "core",
      },
      {
        id: "community-one",
        label: "Community One",
        type: "route",
        path: "/communityone",
        product: "edge",
      },
      {
        id: "iview",
        label: "iVIEW",
        type: "route",
        path: "/communityplus/iview",
        product: "core",
      },
      {
        id: "yellowpages",
        label: "Yellow Pages",
        type: "route",
        path: "/communityplus/yellowpages",
        product: "core",
      },
      {
        id: "news",
        label: "News",
        type: "route",
        path: "/communityplus/news",
        product: "core",
      },
      {
        id: "events",
        label: "Events",
        type: "route",
        path: "/communityplus/events",
        product: "core",
      },
      {
        id: "about",
        label: "About Us",
        type: "route",
        path: "/communityplus/about",
        product: "core",
      },
    ],
  },
  {
  group: "communityplus-sidebar",
  product: "core",
  title: "COMMUNITY+",

  sections: [
    {
      id: "core-content",
      title: "COMMUNITY+ CORE",
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
          id: "BLOB",
          label: "blob",
          icon: "📅",
          mode: "BLOB",
          image: "community festival crowd outdoor event",
        },
        {
          id: "incident",
          label: "Incidents",
          icon: "🚨",
          mode: "NOW",
          image: "emergency lights police response city night",
        },
        {
          id: "news",
          label: "News",
          icon: "📰",
          type: "route",
          path: "/communityplus/news",
        },
        {
          id: "events",
          label: "Events",
          icon: "📅",
          type: "route",
          path: "/communityplus/events",
        },

        {
          id: "compose-beacon",
          label: "Beacons",
          icon: "📡",
          type: "compose",
          mode: "beacon",
          path: "/communityplus/compose/beacon",
        },
      ],
    },

    {
      id: "platform",
      title: "COMMUNITY ONE - EDGE",

      items: [
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
          id: "moderation",
          label: "Moderation",
          icon: "🛡️",
          type: "route",
          path: "/communityplus/moderation",
        },
        {
          id: "Request Feature",
          label: "request feature",
          icon: "🛡️",
          type: "route",
          path: "/communityplus/request-feature",
        },
        {
          id: "Report Bug",
          label: "bugreport",
          icon: "🛡️",
          type: "route",
          path: "/communityplus/moderation",
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
  {
    group: "communityone-sidebar",
    product: "edge",
    title: "COMMUNITY ONE",
    sections: [
      {
        id: "edge-home",
        title: "COMMUNITY ONE",
        items: [
          {
            id: "communityone-dashboard",
            label: "Dashboard",
            icon: "🌐",
            type: "route",
            path: "/communityone",
          },
        ],
      },

      {
        id: "edge-services",
        title: "EDGE SERVICES",
        items: [
          {
            id: "ses",
            label: "SES",
            icon: "💼",
            type: "route",
            path: "/communityone/ses",
          },
          {
            id: "shs",
            label: "SHS",
            icon: "🏠",
            type: "route",
            path: "/communityone/shs",
          },
          {
            id: "xchange",
            label: "XChange",
            icon: "🔁",
            type: "route",
            path: "/communityone/xchange",
          },
        ],
      },

      {
        id: "edge-activity",
        title: "MY ACTIVITY",
        items: [
          {
            id: "requests",
            label: "Requests",
            icon: "📣",
            type: "route",
            path: "/communityone/requests",
          },
          {
            id: "responses",
            label: "Responses",
            icon: "📨",
            type: "route",
            path: "/communityone/responses",
          },
          {
            id: "transactions",
            label: "Transactions",
            icon: "🤝",
            type: "route",
            path: "/communityone/transactions",
          },
        ],
      },

      {
        id: "product",
        title: "PRODUCT",
        items: [
          {
            id: "feature-requests",
            label: "Feature Requests",
            icon: "💡",
            type: "route",
            path: "/communityone/feature-requests",
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