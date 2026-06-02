export const NAVIGATION = [
  /* =====================================================
     HEADER — TOP LEVEL ROUTING
  ===================================================== */
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
        id: "community-one",
        label: "Community One",
        type: "route",
        path: "/communityone",
        product: "edge",
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

  /* =====================================================
     COMMUNITY+ CORE SIDEBAR
  ===================================================== */
  {
    group: "communityplus-sidebar",
    product: "core",
    title: "COMMUNITY+",
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
            path: "/communityplus/events",
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

  /* =====================================================
     COMMUNITY ONE EDGE SIDEBAR
  ===================================================== */
  {
    group: "communityone-sidebar",
    product: "edge",
    title: "COMMUNITY ONE",
    sections: [
      {
        id: "edge-home",
        title: "EDGE",
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
            description: "Simple Employment Services",
            icon: "💼",
            type: "route",
            path: "/communityone/ses",
          },
          {
            id: "shs",
            label: "SHS",
            description: "Simple Housing Services",
            icon: "🏠",
            type: "route",
            path: "/communityone/shs",
          },
          {
            id: "xchange",
            label: "XChange",
            description: "Broadcast Transactions",
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
            id: "my-requests",
            label: "My Requests",
            icon: "📣",
            type: "route",
            path: "/communityone/requests",
          },
          {
            id: "my-responses",
            label: "My Responses",
            icon: "📨",
            type: "route",
            path: "/communityone/responses",
          },
          {
            id: "my-transactions",
            label: "My Transactions",
            icon: "🤝",
            type: "route",
            path: "/communityone/transactions",
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