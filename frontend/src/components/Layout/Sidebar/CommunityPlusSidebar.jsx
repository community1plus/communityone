/* =====================================================
SIDEBAR BASE
===================================================== */

.sidebar {
  width: 260px;
  flex-shrink: 0;

  padding: 16px 14px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  background: #faf7f4;
  border-right: 1px solid #e6dfd8;
}

/* =====================================================
SECTION (WITH DIVIDERS)
===================================================== */

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 6px;

  padding-bottom: 14px;
  margin-bottom: 14px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* =====================================================
SECTION TITLE
===================================================== */

.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #8c837a;

  margin-bottom: 8px;
}

/* =====================================================
LINKS (PRIMARY NAV ITEMS)
===================================================== */

.sidebar-link {
  display: flex;              /* 🔥 ensures vertical stacking */
  width: 100%;                /* 🔥 prevents inline wrapping */

  align-items: center;
  gap: 10px;

  padding: 8px 10px;
  border-radius: 10px;

  font-size: 14px;
  color: #2c2c2c;

  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.05s ease;
}

/* =====================================================
ICON ALIGNMENT
===================================================== */

.sidebar-link .icon {
  width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
  flex-shrink: 0;
}

/* =====================================================
HOVER STATE
===================================================== */

.sidebar-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* subtle press effect */
.sidebar-link:active {
  transform: scale(0.98);
}

/* =====================================================
ACTIVE STATE (CURRENT PAGE)
===================================================== */

.sidebar-link.active {
  background: rgba(0, 0, 0, 0.08);
  font-weight: 600;
}

/* =====================================================
PLATFORM ITEMS (slightly stronger presence)
===================================================== */

.sidebar-section:nth-child(3) .sidebar-link {
  font-weight: 500;
}

/* =====================================================
LOGOUT (DESTRUCTIVE ACTION)
===================================================== */

.sidebar-link.logout {
  color: #d92d20;
}

.sidebar-link.logout:hover {
  background: rgba(217, 45, 32, 0.08);
}

/* =====================================================
OPTIONAL: SUBTLE GROUP HOVER (nice polish)
===================================================== */

.sidebar-section:hover .sidebar-title {
  color: #6f665f;
}

/* =====================================================
RESPONSIVE (optional future-proofing)
===================================================== */

@media (max-width: 900px) {
  .sidebar {
    width: 220px;
  }
}