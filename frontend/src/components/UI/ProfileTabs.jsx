export default function ProfileTabs({
  tabs,
  activeTab,
  onChange,
}) {
  return (
    <div className="profile-type-tabs">

      {tabs.map((tab) => (

        <button
          key={tab.id}
          type="button"
          className={`profile-type-tab ${
            activeTab === tab.id
              ? "active"
              : ""
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>

      ))}

    </div>
  );
}