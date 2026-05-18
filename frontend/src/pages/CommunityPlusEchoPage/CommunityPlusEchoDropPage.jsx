import {
  useParams,
} from "react-router-dom";

export default function CommunityPlusEchoDropPage() {
  const { dropId } =
    useParams();

  return (
    <div className="dashboard-view">
      <h1>
        Echo Drop: {dropId}
      </h1>

      <p>
        Drop detail page
        coming soon.
      </p>
    </div>
  );
}