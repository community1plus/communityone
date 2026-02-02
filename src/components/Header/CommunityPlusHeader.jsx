<header className="header">
  
  <div className="header-left">
    <div className="avatar">
      {user?.username?.[0]?.toUpperCase() ?? "C"}
    </div>
  </div>

  <div className="header-center">
    <div className="search-wrapper">
      <input 
        type="text"
        className="search-input"
        placeholder="Search community updates..."
      />
      <span className="search-enter">⤶</span>
    </div>
  </div>

  <div className="header-right">
    {location}
  </div>

  <nav className="links">
    <button onClick={() => setActiveView("dashboard")}>Home</button>
    <button onClick={() => setActiveView("posts")}>Posts</button>
    <button onClick={() => setActiveView("events")}>Events</button>
    <button onClick={() => setActiveView("incidents")}>Incidents</button>
    <button onClick={() => setActiveView("search")}>Search</button>
    <button onClick={() => setActiveView("community")}>Community+</button>
    <button onClick={() => setActiveView("about")}>About</button>
  </nav>

</header>
