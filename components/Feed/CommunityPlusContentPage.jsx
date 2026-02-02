// CommunityPlusContentPage.jsx
import React from "react";
import "../src/CommunityPlusContentPage.css";

export default function CommunityPlusContentPage() {
  return (
    <div className="posts-page">
      <div className="posts-grid">
        {/* Row 1 */}
        <div className="post-card">Post 1</div>
        <div className="post-card">Post 2</div>
        <div className="post-card">Post 3</div>
        <div className="post-card">Post 4</div>
        <div className="post-card ad-card">Ad</div>

        {/* Row 2 */}
        <div className="post-card">Post 6</div>
        <div className="post-card">Post 7</div>
        <div className="post-card">Post 8</div>
        <div className="post-card">Post 9</div>
        <div className="post-card ad-card">Ad</div>

        {/* Row 3 */}
        <div className="post-card">Post 11</div>
        <div className="post-card">Post 12</div>
        <div className="post-card">Post 13</div>
        <div className="post-card">Post 14</div>
        <div className="post-card ad-card">Ad</div>
      </div>
    </div>
  );
}
