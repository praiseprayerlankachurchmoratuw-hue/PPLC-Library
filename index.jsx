import { useState, useRef, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const SLIDE_LABELS = [
  "Verse 1","Verse 2","Verse 3","Verse 4",
  "Chorus","Pre-Chorus","Bridge","Intro","Outro","Tag","Other",
];

const EMPTY_SLIDE = { label: "Verse 1", text: "", tamil: "", sinhala: "" };

function useAutoHeight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  });
}

function AutoTextarea({ value, onChange, placeholder, lang, style = {} }) {
  const ref = useRef(null);
  useAutoHeight(ref);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={2}
      style={{
        width: "100%",
        resize: "none",
        overflow: "hidden",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        color: "#fff",
        fontSize: lang === "tamil" ? 16 : lang === "sinhala" ? 16 : 15,
        fontFamily: lang === "tamil"
          ? "'Noto Sans Tamil', serif"
          : lang === "sinhala"
          ? "'Noto Sans Sinhala', serif"
          : "'DM Sans', sans-serif",
        lineHeight: 1.7,
        padding: "10px 14px",
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.2s",
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = "rgba(255,180,60,0.6)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
    />
  );
}

function SlideCard({ slide, index, total, onChange, onDelete, onMove }) {
  const [open, setOpen] = useState(true);
  const [showLang, setShowLang] = useState(!!(slide.tamil || slide.sinhala));

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 14,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px",
        borderBottom: open ? "1px solid rgba(255,255,255,0.07)" : "none",
        cursor: "pointer",
        userSelect: "none",
      }} onClick={() => setOpen(o => !o)}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: "rgba(255,180,60,0.15)",
          color: "#ffb43c", fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>{index + 1}</div>

        <select
          value={slide.label}
          onChange={e => { e.stopPropagation(); onChange("label", e.target.value); }}
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {SLIDE_LABELS.map(l => <option key={l} value={l} style={{ background: "#1a1a2e" }}>{l}</option>)}
        </select>

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
          {index > 0 && (
            <button onClick={() => onMove(index, index - 1)} style={iconBtn}>↑</button>
          )}
          {index < total - 1 && (
            <button onClick={() => onMove(index, index + 1)} style={iconBtn}>↓</button>
          )}
          {total > 1 && (
            <button onClick={() => onDelete(index)} style={{ ...iconBtn, color: "#ff6b6b" }}>✕</button>
          )}
        </div>

        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 4 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={fieldLabel}>Lyrics (English / Transliteration)</label>
            <AutoTextarea
              value={slide.text}
              onChange={e => onChange("text", e.target.value)}
              placeholder={"Line 1\nLine 2\nLine 3..."}
            />
          </div>

          {!showLang ? (
            <button
              onClick={() => setShowLang(true)}
              style={{
                background: "none", border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: 8, color: "rgba(255,255,255,0.35)",
                fontSize: 12, padding: "7px 12px", cursor: "pointer",
                width: "100%", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(255,180,60,0.4)"; e.target.style.color = "#ffb43c"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.color = "rgba(255,255,255,0.35)"; }}
            >+ Add Tamil / Sinhala</button>
          ) : (
            <>
              <div>
                <label style={fieldLabel}>Tamil</label>
                <AutoTextarea
                  value={slide.tamil}
                  onChange={e => onChange("tamil", e.target.value)}
                  placeholder={"வரி 1\nவரி 2..."}
                  lang="tamil"
                />
              </div>
              <div>
                <label style={fieldLabel}>Sinhala</label>
                <AutoTextarea
                  value={slide.sinhala}
                  onChange={e => onChange("sinhala", e.target.value)}
                  placeholder={"පේළිය 1\nපේළිය 2..."}
                  lang="sinhala"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const iconBtn = {
  background: "rgba(255,255,255,0.06)", border: "none",
  borderRadius: 6, color: "rgba(255,255,255,0.45)",
  width: 26, height: 26, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 12, fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.15s",
};

const fieldLabel = {
  display: "block",
  fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  marginBottom: 6,
};

export default function SongSubmit() {
  const [title, setTitle]   = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags]     = useState("");
  const [slides, setSlides] = useState([{ ...EMPTY_SLIDE }]);
  const [status, setStatus] = useState(null); // null | "saving" | "success" | "error"
  const [submitted, setSubmitted] = useState(false);

  const updateSlide = (i, key, val) => {
    setSlides(s => s.map((sl, idx) => idx === i ? { ...sl, [key]: val } : sl));
  };

  const addSlide = () => {
    setSlides(s => [...s, { ...EMPTY_SLIDE, label: SLIDE_LABELS[Math.min(s.length, SLIDE_LABELS.length - 1)] }]);
  };

  const deleteSlide = (i) => setSlides(s => s.filter((_, idx) => idx !== i));

  const moveSlide = (from, to) => {
    setSlides(s => {
      const next = [...s];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (slides.every(s => !s.text.trim())) return;
    setStatus("saving");
    try {
      await addDoc(collection(db, "songs"), {
        title: title.trim(),
        artist: artist.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        slides: slides.filter(s => s.text.trim() || s.tamil.trim() || s.sinhala.trim()),
        createdAt: Date.now(),
        submittedBy: "public",
      });
      setStatus("success");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const reset = () => {
    setTitle(""); setArtist(""); setTags("");
    setSlides([{ ...EMPTY_SLIDE }]);
    setStatus(null); setSubmitted(false);
  };

  if (submitted && status === "success") {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(100,220,150,0.15)",
              border: "2px solid rgba(100,220,150,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 20px",
            }}>✓</div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>
              Song submitted!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
              <strong style={{ color: "#ffb43c" }}>"{title}"</strong> has been added to the library.
            </p>
            <button onClick={reset} style={primaryBtn}>Add another song</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Noto+Sans+Tamil&family=Noto+Sans+Sinhala&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        option { background: #1a1a2e; color: #fff; }
        select option { background: #1a1a2e; }
      `}</style>

      <div style={card}>
        {/* Header */}
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #ffb43c, #ff6b35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>♪</div>
            <div>
              <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'DM Serif Display', serif" }}>
                Add a Song
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                Praise Prayer Lanka Church
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Song title */}
          <div>
            <label style={fieldLabel}>Song Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Amazing Grace"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,180,60,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Artist */}
          <div>
            <label style={fieldLabel}>Artist / Composer</label>
            <input
              type="text"
              value={artist}
              onChange={e => setArtist(e.target.value)}
              placeholder="e.g. John Newton"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,180,60,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={fieldLabel}>Tags <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="worship, Tamil, Christmas..."
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,180,60,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "2px 0" }} />

          {/* Slides */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <label style={{ ...fieldLabel, margin: 0 }}>Slides ({slides.length})</label>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>tap to collapse</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {slides.map((slide, i) => (
                <SlideCard
                  key={i}
                  slide={slide}
                  index={i}
                  total={slides.length}
                  onChange={(key, val) => updateSlide(i, key, val)}
                  onDelete={deleteSlide}
                  onMove={moveSlide}
                />
              ))}
            </div>

            <button
              onClick={addSlide}
              style={{
                marginTop: 12, width: "100%",
                padding: "11px", borderRadius: 10,
                background: "rgba(255,180,60,0.08)",
                border: "1px dashed rgba(255,180,60,0.3)",
                color: "#ffb43c", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,180,60,0.14)"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,180,60,0.08)"; }}
            >+ Add Slide</button>
          </div>

          {/* Error */}
          {status === "error" && (
            <div style={{
              background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)",
              borderRadius: 10, padding: "12px 14px",
              color: "#ff9090", fontSize: 13, lineHeight: 1.5,
            }}>
              Something went wrong. Please check your connection and try again.
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || status === "saving"}
            style={{
              ...primaryBtn,
              opacity: !title.trim() || status === "saving" ? 0.5 : 1,
              cursor: !title.trim() || status === "saving" ? "not-allowed" : "pointer",
            }}
          >
            {status === "saving" ? "Saving..." : "Submit Song"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>
            Songs go directly into the church library
          </p>
        </div>
      </div>
    </div>
  );
}

const pageWrap = {
  minHeight: "100vh",
  background: "linear-gradient(160deg, #0c0e1a 0%, #111525 60%, #0e1020 100%)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "24px 16px 60px",
  fontFamily: "'DM Sans', sans-serif",
};

const card = {
  width: "100%",
  maxWidth: 480,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 20,
  overflow: "hidden",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const primaryBtn = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #ffb43c, #ff7c35)",
  border: "none",
  borderRadius: 12,
  color: "#1a0e00",
  fontSize: 15,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
  transition: "opacity 0.2s, transform 0.15s",
  letterSpacing: "0.02em",
};
