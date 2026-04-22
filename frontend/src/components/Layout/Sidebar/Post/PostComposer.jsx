import React, { useState, useRef, useEffect } from "react";
import "./PostComposer.css";

const CATEGORIES = [
  "News","Opinion","Events","Business","Food & Drink",
  "Entertainment","Sport","Lifestyle","Health","Tech & Science"
];

const SCOPES = ["Local", "Nearby", "Global"];

export default function PostComposer() {

  const [mode, setMode] = useState("now");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] = useState("News");
  const [scope, setScope] = useState("Local");

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  const [isAd, setIsAd] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotPricing, setSlotPricing] = useState({});

  const fileInputRef = useRef();
  const dragItem = useRef();
  const dragOverItem = useRef();

  /* =========================
     MODE DEFAULTS
  ========================= */

  useEffect(() => {
    if (mode === "now") {
      setScope("Local");
      setCategory("News");
      setIsAd(false);
    }
  }, [mode]);

  /* =========================
     TAGS
  ========================= */

  const addTag = (tag) => {
    const clean = tag.toLowerCase().trim();
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
  };

  const handleTagKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  /* =========================
     FILES
  ========================= */

  const handleFiles = (incoming) => {
    const videos = incoming.filter(f => f.type.startsWith("video"));
    const others = incoming.filter(f => !f.type.startsWith("video"));

    if (videos.length > 4) return alert("Max 4 videos");
    if (others.length > 2) return alert("Max 2 files/images");

    const enriched = incoming.map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      thumbnail: null
    }));

    setFiles(prev => [...prev, ...enriched]);
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async () => {
    const payload = {
      mode,
      title,
      content,
      category,
      scope,
      tags,
      media: files,
      ad: (mode === "blob" && isAd) ? {
        slots: selectedSlots
      } : null
    };

    await fetch("/api/posts", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    alert(mode === "now" ? "Posted to Now" : "Published");
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className={`composer panel ${mode === "now" ? "theme-now panel-compact" : "theme-blob"}`}>

      {/* MODE SWITCH */}
      <div className="mode-switch">
        <button className={`btn ${mode==="now"?"btn-primary":""}`} onClick={()=>setMode("now")}>
          ⚡ Now
        </button>

        <button className={`btn ${mode==="blob"?"btn-primary":""}`} onClick={()=>setMode("blob")}>
          🧠 Blob
        </button>
      </div>

      {/* HEADER */}
      <div className="panel-header">
        <input
          className="body"
          placeholder={mode==="now" ? "What's happening right now?" : "Headline..."}
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />
      </div>

      {/* BODY */}
      <div className="panel-body">

        <textarea
          className={`body ${mode==="now"?"now-text":"blob-text"}`}
          placeholder={mode==="now" ? "Quick update..." : "Write something detailed..."}
          value={content}
          onChange={(e)=>setContent(e.target.value)}
        />

        {/* BLOB OPTIONS */}
        {mode === "blob" && (
          <>
            <div className="meta">Category</div>
            <select className="body" value={category} onChange={(e)=>setCategory(e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>

            <div className="meta">Scope</div>
            <select className="body" value={scope} onChange={(e)=>setScope(e.target.value)}>
              {SCOPES.map(s=><option key={s}>{s}</option>)}
            </select>

            {/* TAGS */}
            <input
              className="body"
              placeholder="Add tags"
              value={tagInput}
              onChange={(e)=>setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
            />

            <div className="tag-list">
              {tags.map(tag=>(
                <span key={tag} className="label">
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {/* FILES */}
        <button className="btn btn-secondary" onClick={()=>fileInputRef.current.click()}>
          Upload
        </button>

        <input
          type="file"
          hidden
          multiple
          ref={fileInputRef}
          onChange={(e)=>handleFiles(Array.from(e.target.files))}
        />

        <div className="files">
          {files.map(f=>(
            <div key={f.id} className="panel panel-hover panel-compact">
              {f.file.type.startsWith("image")
                ? <img src={f.url}/>
                : <span className="meta">Video</span>
              }
            </div>
          ))}
        </div>

        {/* AD MODE */}
        {mode === "blob" && (
          <>
            <label className="label">
              <input type="checkbox" checked={isAd} onChange={()=>setIsAd(!isAd)} />
              Promote
            </label>

            {isAd && (
              <div className="slots">
                {[...Array(24)].map((_,h)=>(
                  <button
                    key={h}
                    className={`btn ${selectedSlots.includes(h) ? "btn-primary" : "btn-secondary"}`}
                    onClick={()=>{
                      setSelectedSlots(prev =>
                        prev.includes(h)
                          ? prev.filter(x=>x!==h)
                          : [...prev, h]
                      );
                    }}
                  >
                    {h}:00
                  </button>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {/* FOOTER */}
      <div className="panel-footer">
        <button className="btn btn-primary btn-block" onClick={handleSubmit}>
          {mode==="now" ? "Post Now" : "Publish"}
        </button>
      </div>

      {/* PREVIEW */}
      {preview && (
        <div className="modal" onClick={()=>setPreview(null)}>
          <div onClick={e=>e.stopPropagation()}>
            <img src={preview.url}/>
          </div>
        </div>
      )}

    </div>
  );
}