import React, { useState, useRef, useEffect } from "react";
import "./PostComposer.css";

const CATEGORIES = [
  "News","Opinion","Events","Business","Food & Drink",
  "Entertainment","Sport","Lifestyle","Health","Tech & Science"
];

const SCOPES = ["Local", "Nearby", "Global"];

export default function PostComposer() {

  /* =========================
     MODE (NEW)
  ========================= */

  const [mode, setMode] = useState("now"); // now | blob

  /* =========================
     CORE STATE
  ========================= */

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
     MODE DEFAULTS (CRITICAL)
  ========================= */

  useEffect(() => {
    if (mode === "now") {
      setScope("Local");
      setCategory("News");
      setIsAd(false); // no ads in NOW
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
     FILE HANDLING
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
      progress: 0,
      thumbnail: null
    }));

    setFiles(prev => [...prev, ...enriched]);
    enriched.forEach(generateThumbnail);
  };

  const generateThumbnail = (fileObj) => {
    if (!fileObj.file.type.startsWith("video")) return;

    const video = document.createElement("video");
    video.src = fileObj.url;
    video.currentTime = 1;

    video.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0);

      const thumb = canvas.toDataURL("image/png");

      setFiles(prev =>
        prev.map(f =>
          f.id === fileObj.id ? { ...f, thumbnail: thumb } : f
        )
      );
    });
  };

  /* =========================
     DRAG REORDER
  ========================= */

  const handleSort = () => {
    const _files = [...files];
    const dragged = _files.splice(dragItem.current, 1)[0];
    _files.splice(dragOverItem.current, 0, dragged);
    setFiles(_files);
  };

  /* =========================
     S3 UPLOAD
  ========================= */

  const uploadToS3 = async (fileObj) => {
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        fileName: fileObj.file.name,
        fileType: fileObj.file.type
      })
    });

    const { uploadUrl, fileUrl } = await res.json();

    await fetch(uploadUrl, {
      method: "PUT",
      body: fileObj.file
    });

    return fileUrl;
  };

  /* =========================
     SLOT PRICING
  ========================= */

  useEffect(() => {
    if (!isAd) return;

    fetch("/api/slots/pricing")
      .then(res => res.json())
      .then(setSlotPricing);
  }, [isAd]);

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async () => {
    let uploaded = [];

    for (let f of files) {
      const url = await uploadToS3(f);
      uploaded.push({
        url,
        type: f.file.type,
        name: f.file.name
      });
    }

    const payload = {
      mode, // 🔥 NEW (IMPORTANT)
      title,
      content,
      category,
      scope,
      tags,
      media: uploaded,
      ad: (mode === "blob" && isAd) ? {
        slots: selectedSlots,
        total: selectedSlots.reduce(
          (sum, h) => sum + (slotPricing[h]?.price || 0),
          0
        )
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
    <div className="composer">

      {/* MODE SWITCH */}
      <div className="mode-switch">
        <button
          className={mode === "now" ? "active" : ""}
          onClick={() => setMode("now")}
        >
          ⚡ Now
        </button>

        <button
          className={mode === "blob" ? "active" : ""}
          onClick={() => setMode("blob")}
        >
          🧠 Blob
        </button>
      </div>

      {/* TOP */}
      <div className="top">
        <input
          placeholder={
            mode === "now"
              ? "What's happening right now?"
              : "Headline..."
          }
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />

        {mode === "blob" && (
          <>
            <select className="borderless" value={category} onChange={e=>setCategory(e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>

            <select className="borderless" value={scope} onChange={e=>setScope(e.target.value)}>
              {SCOPES.map(s=><option key={s}>{s}</option>)}
            </select>
          </>
        )}
      </div>

      <textarea
        placeholder={
          mode === "now"
            ? "Quick update..."
            : "Write something detailed..."
        }
        value={content}
        onChange={e=>setContent(e.target.value)}
      />

      {/* TAGS (BLOB ONLY) */}
      {mode === "blob" && (
        <>
          <input
            placeholder="Add tags"
            value={tagInput}
            onChange={e=>setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
          />

          <div className="tag-list">
            {tags.map(tag=>(
              <span key={tag} onClick={()=>setTags(tags.filter(t=>t!==tag))}>
                {tag} ✕
              </span>
            ))}
          </div>
        </>
      )}

      {/* FILE UPLOAD */}
      <input
        type="file"
        hidden
        multiple
        ref={fileInputRef}
        onChange={(e)=>handleFiles(Array.from(e.target.files))}
      />

      <button onClick={()=>fileInputRef.current.click()}>
        Upload
      </button>

      {/* FILE LIST */}
      <div className="files">
        {files.map((f, index)=>(
          <div
            key={f.id}
            draggable
            onDragStart={()=>dragItem.current=index}
            onDragEnter={()=>dragOverItem.current=index}
            onDragEnd={handleSort}
          >
            {f.thumbnail
              ? <img src={f.thumbnail}/>
              : f.file.type.startsWith("image")
                ? <img src={f.url}/>
                : <span>📄</span>
            }

            <button onClick={()=>setPreview(f)}>👁</button>
          </div>
        ))}
      </div>

      {/* AD MODE (BLOB ONLY) */}
      {mode === "blob" && (
        <>
          <label className="ad-toggle">
            <input
              type="checkbox"
              checked={isAd}
              onChange={()=>setIsAd(!isAd)}
            />
            Promote this post
          </label>

          {isAd && (
            <>
              <div className="slots">
                {[...Array(24)].map((_, hour)=>(
                  <button
                    key={hour}
                    className={selectedSlots.includes(hour) ? "active" : ""}
                    onClick={()=>{
                      setSelectedSlots(prev =>
                        prev.includes(hour)
                          ? prev.filter(h=>h!==hour)
                          : [...prev, hour]
                      );
                    }}
                  >
                    {hour}:00 ${slotPricing[hour]?.price || "--"}
                  </button>
                ))}
              </div>

              <div className="slot-total">
                Total: $
                {selectedSlots.reduce(
                  (sum,h)=>sum+(slotPricing[h]?.price||0),0
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* SUBMIT */}
      <button className="submit-btn" onClick={handleSubmit}>
        {mode === "now" ? "Post Now" : "Publish"}
      </button>

      {/* PREVIEW */}
      {preview && (
        <div className="modal" onClick={()=>setPreview(null)}>
          <div onClick={e=>e.stopPropagation()}>
            {preview.file.type.startsWith("video") && (
              <video src={preview.url} controls />
            )}
            {preview.file.type.startsWith("image") && (
              <img src={preview.url}/>
            )}
          </div>
        </div>
      )}

    </div>
  );
}