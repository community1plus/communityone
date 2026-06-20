export default function ProfileNavigation({
  editMode,
  saving,
  onClose,
  onEdit,
  onSave,
}) {

  return (

    <div className="profile-navigation">

      <button
        type="button"
        onClick={onClose}
      >
        {editMode ? "Cancel" : "Close"}
      </button>

      {!editMode && (
        <button
          type="button"
          onClick={onEdit}
        >
          Edit
        </button>
      )}

      {editMode && (
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
        >
          Save
        </button>
      )}

    </div>

  );
}