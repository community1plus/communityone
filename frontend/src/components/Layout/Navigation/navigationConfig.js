export const NAVIGATION = [
  /* =====================================================
     HEADER — TOP LEVEL ROUTING
  ===================================================== */
  {
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
      id: "yellowpages",
      label: "Yellow Pages",
      type: "route",
      path: "/communityplus/yellowpages",
      product: "core",
    },
    {
      id: "about",
      label: "About Us",
      type: "route",
      path: "/communityplus/about",
      product: "core",
    },
    {
      id: "community-one",
      label: "Community One",
      type: "route",
      path: "/communityone",
      product: "edge",
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
        id: "core-content",
        title: "COMMUNITY+ CORE",
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
            id: "news-page",
            label: "News",
            icon: "📰",
            type: "route",
            path: "/communityplus/news",
          },
          {
            id: "events-page",
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
            path: "/communityplus/compose/beacon",
            mode: "beacon",
          },
        ],
      },

      {
        id: "core-platform",
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
        title: "COMMUNITY ONE EDGE",
        items: [
          {
            id: "ses-jobs",
            label: "SES Jobs",
            description: "Simple Employment Services",
            icon: "💼",
            type: "route",
            path: "/communityone/ses/jobs",
          },
          {
            id: "shs-housing",
            label: "SHS Housing",
            description: "Simple Housing Services",
            icon: "🏠",
            type: "route",
            path: "/communityone/shs/housing",
          },
          {
            id: "xchange-transactions",
            label: "XChange",
            description: "Broadcast Transactions",
            icon: "🔁",
            type: "route",
            path: "/communityone/xchange/transactions",
          },
          {
            id: "business-requests",
            label: "Business Requests",
            description: "Requests from verified businesses",
            icon: "🏢",
            type: "route",
            path: "/communityone/business-requests",
          },
          {
            id: "community-requests",
            label: "Community Requests",
            description: "Requests from local communities",
            icon: "📣",
            type: "route",
            path: "/communityone/community-requests",
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
          {
            id: "roadmap",
            label: "Roadmap",
            icon: "🧭",
            type: "route",
            path: "/communityone/roadmap",
          },
          {
            id: "feedback",
            label: "Feedback",
            icon: "📝",
            type: "route",
            path: "/communityone/feedback",
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