export default function IdentityActions({
    editing,
    savingProfile,
    form,
    setEditing,
    handleSaveProfile
}) {
    return (
        <div className="identity-actions">
            {editing ? (
                <>
                    <button
                        className="btn btn-primary"
                        disabled={savingProfile}
                        onClick={handleSaveProfile}
                    >
                        {savingProfile ? "Saving..." : "Save"}
                    </button>

                    <button
                        className="btn btn-secondary"
                        disabled={savingProfile}
                        onClick={() => setEditing(false)}
                    >
                        Cancel
                    </button>
                </>
            ) : (
                <button
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                >
                    Edit Profile
                </button>
            )}
        </div>
    );
}