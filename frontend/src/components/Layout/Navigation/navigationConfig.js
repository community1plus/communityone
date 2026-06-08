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
          id: "moderation",
          label: "Moderation",
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