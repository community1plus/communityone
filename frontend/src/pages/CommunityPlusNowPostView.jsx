import TwoColumnLayout from "../components/TwoColumnLayout";
import FormBuilder from "../components/UI/Form/FormBuilder";

export default function CommunityPlusNowPostView() {
  return (
    <TwoColumnLayout
      left={
        <div className="two-col-card left">
          <h1>NOW</h1>
          <p>Add a current post to the local feed.</p>

          <form>
            <FormBuilder />
          </form>
        </div>
      }
      right={
        <div className="two-col-card right">
          <h2>Preview</h2>
          <p>Your post preview will appear here.</p>
        </div>
      }
    />
  );
}