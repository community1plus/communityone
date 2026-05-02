import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TwoColumnLayout from "../components/TwoColumnLayout";
import FormBuilder from "../components/UI/Form/FormBuilder";

const steps = [
  {
    id: "now-post",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "", label: "Select category" },
          { value: "post", label: "Post" },
          { value: "event", label: "Event" },
          { value: "alert", label: "Alert" },
          { value: "incident", label: "Incident" },
        ],
      },
      {
        name: "summary",
        label: "What is happening now?",
        type: "text",
      },
    ],
  },
];

export default function CommunityPlusNowPostView() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    title: "",
    category: "",
    summary: "",
  });

  const form = {
    getValue: (name) => values[name] || "",

    handleChange: (name) => (e) => {
      setValues((prev) => ({
        ...prev,
        [name]: e.target.value,
      }));
    },

    handleBlur: () => () => {},

    getError: () => "",
    isValidating: () => false,
    isFieldValid: (name) => Boolean(values[name]),
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const post = {
      id: crypto.randomUUID(),
      type: values.category || "post",
      title: values.title.trim(),
      summary: values.summary.trim(),
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("community_posts") || "[]");

    localStorage.setItem(
      "community_posts",
      JSON.stringify([post, ...existing])
    );

    navigate("/communityplus");
  };

  return (
    <TwoColumnLayout
      left={
        <div className="two-col-card left">
          <h1>NOW</h1>
          <p>Add a current post to the local feed.</p>

          <form onSubmit={handleSubmit}>
            <FormBuilder steps={steps} currentStep={0} form={form} />

            <button
              type="submit"
              disabled={!values.title.trim() || !values.summary.trim()}
            >
              Post Now
            </button>
          </form>
        </div>
      }
      right={
        <div className="two-col-card right">
          <h2>Preview</h2>

          <h3>{values.title || "Post title"}</h3>
          <p>{values.summary || "Your post summary will appear here."}</p>
          <small>{values.category || "No category selected"}</small>
        </div>
      }
    />
  );
}