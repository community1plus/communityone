export default function ProfileNavigation({
  editMode,
  saving,
  onClose,
  onEdit,
  onSave,
}) {
  return (

    <div className="form-navigation">

      <button
        type="button"
        className="secondary-button"
        onClick={onClose}
      >
        {editMode ? "Cancel" : "Close"}
      </button>

      <div className="form-actions">

        {!editMode && (

          <button
            type="button"
            className="primary-button"
            onClick={onEdit}
          >
            Edit
          </button>

        )}

        {editMode && (

          <button
            type="button"
            className="primary-button"
            disabled={saving}
            onClick={onSave}
          >
            {saving
              ? "Saving..."
              : "Save"}
          </button>

        )}

      </div>

    </div>

  );
}