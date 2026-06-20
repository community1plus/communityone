export default function ProfileTabs({
  tabs,
  activeTab,
  onChange,
}) {

  return (
    <div className="profile-tabs">

      {tabs.map(tab => (

        <button
          key={tab.id}
          className={
            activeTab === tab.id
              ? "active"
              : ""
          }
          onClick={() =>
            onChange(tab.id)
          }
        >
          {tab.label}
        </button>

      ))}

    </div>
  );
}