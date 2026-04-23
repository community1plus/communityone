export const NAVIGATION = [
  {
    group: "main", // header
    items: [
      { label: "Home", path: "/" },

      {
        label: "Feed",
        children: [
          { label: "All", path: "/feed" },
          { label: "Incidents", path: "/incident" },
          { label: "Alerts", path: "/alerts" },
          { label: "Beacons", path: "/beacon" },
        ],
      },

      { label: "Posts", path: "/post" },
      { label: "Yellow Pages", path: "/yellowpages" },

      {
        label: "Dashboard",
        children: [
          { label: "Categories", path: "/dashboard" },
        ],
      },
    ],
  },

  {
    group: "sidebar",

    sections: [
      {
        title: "MODES",
        items: [
          { label: "NOW", icon: "⚡", path: "/now" },
          { label: "BLOB", icon: "🧠", path: "/blob" },
        ],
      },

      {
        title: "ACTIONS",
        items: [
          { label: "Event", icon: "📅", path: "/event" },
          { label: "Incident", icon: "🚨", path: "/incident" },
          { label: "Beacon", icon: "📡", path: "/beacon" },
        ],
      },

      {
        title: "PLATFORM",
        items: [
          { label: "Community+", icon: "🌐", path: "/communityplus" },
          { label: "Yellow Pages", icon: "📒", path: "/yellowpages" },
          { label: "Channels", icon: "📺", path: "/channels" },
        ],
      },

      {
        title: "ACCOUNT",
        items: [
          { label: "Profile", icon: "👤", path: "/profile" },
          { label: "Logout", icon: "🚪", action: "logout" },
        ],
      },
    ],
  },
];