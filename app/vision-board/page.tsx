"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect } from "react-konva";
import type Konva from "konva";
import BottomNav from "@/components/BottomNav";

type ImageItem = {
  id: string; type: "image";
  x: number; y: number; width: number; height: number;
  imgEl: HTMLImageElement; rotation: number;
};

type TextItem = {
  id: string; type: "text";
  x: number; y: number; text: string;
  fontSize: number; fill: string;
  fontStyle: "normal" | "bold"; rotation: number;
};

type CanvasItem = ImageItem | TextItem;

const BG_PRESETS  = ["#ffffff", "#faf8f4", "#fdf0ee", "#eef3ee", "#0f0f0f"];
const TEXT_COLORS = ["#1a1a1a", "#ffffff", "#b08060", "#5c7a68", "#8b6f8e", "#a09070"];

export default function VisionBoardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<Konva.Stage>(null);
  const trRef        = useRef<Konva.Transformer>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stageWidth, setStageWidth] = useState(0);
  const [items,      setItems]      = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgColor,    setBgColor]    = useState("#ffffff");
  const [exporting,  setExporting]  = useState(false);

  const stageHeight = stageWidth ? Math.round(stageWidth * (4 / 3)) : 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setStageWidth(el.offsetWidth);
    const obs = new ResizeObserver(([e]) => setStageWidth(Math.floor(e.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const tr = trRef.current, stage = stageRef.current;
    if (!tr || !stage) return;
    if (selectedId) {
      const node = stage.findOne(`#${selectedId}`);
      if (node) tr.nodes([node]); else tr.nodes([]);
    } else { tr.nodes([]); }
    tr.getLayer()?.batchDraw();
  }, [selectedId, items]);

  const addImages = useCallback((files: FileList | null) => {
    if (!files || !stageWidth) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const maxD = stageWidth * 0.55;
          const scale = Math.min(maxD / img.width, maxD / img.height, 1);
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const item: ImageItem = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: "image", x: Math.round((stageWidth - w) / 2), y: Math.round((stageHeight - h) / 2),
            width: w, height: h, imgEl: img, rotation: 0,
          };
          setItems((prev) => [...prev, item]);
          setSelectedId(item.id);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }, [stageWidth, stageHeight]);

  const addText = () => {
    const item: TextItem = {
      id: `text-${Date.now()}`, type: "text",
      x: Math.round(stageWidth * 0.12), y: Math.round(stageHeight * 0.45),
      text: "Your text here", fontSize: Math.round(stageWidth * 0.045),
      fill: "#1a1a1a", fontStyle: "normal", rotation: 0,
    };
    setItems((prev) => [...prev, item]);
    setSelectedId(item.id);
  };

  const updateItem = useCallback((id: string, patch: Partial<CanvasItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? ({ ...i, ...patch } as CanvasItem) : i)));
  }, []);

  const bringToFront = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev]; next.push(next.splice(idx, 1)[0]); return next;
    });
  };

  const handleTextDblClick = (item: TextItem, node: Konva.Text) => {
    const stage = stageRef.current!;
    node.hide(); trRef.current?.hide();
    const box = stage.container().getBoundingClientRect();
    const abs = node.absolutePosition();
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      updateItem(item.id, { text: ta.value || item.text });
      ta.remove(); node.show(); trRef.current?.show();
      trRef.current?.getLayer()?.batchDraw();
    };
    const ta = document.createElement("textarea");
    document.body.appendChild(ta);
    ta.value = item.text;
    Object.assign(ta.style, {
      position: "fixed", left: `${box.left + abs.x}px`, top: `${box.top + abs.y}px`,
      fontSize: `${item.fontSize}px`,
      fontWeight: item.fontStyle === "bold" ? "bold" : "normal",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      color: item.fill, background: "rgba(255,255,255,0.9)",
      border: "1.5px dashed #aaa", borderRadius: "4px",
      padding: "2px 6px", minWidth: "120px", outline: "none",
      resize: "none", overflow: "hidden", zIndex: "9999",
      transform: `rotate(${item.rotation}deg)`, transformOrigin: "top left",
    });
    ta.focus(); ta.select();
    ta.addEventListener("blur", finish, { once: true });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) { e.preventDefault(); finish(); }
    });
  };

  const download = () => {
    if (!stageRef.current || exporting) return;
    const prev = selectedId;
    setExporting(true); setSelectedId(null);
    setTimeout(() => {
      try {
        const uri = stageRef.current!.toDataURL({ pixelRatio: 2 });
        const a = document.createElement("a"); a.href = uri; a.download = "vision-board.png"; a.click();
      } finally { setExporting(false); if (prev) setSelectedId(prev); }
    }, 120);
  };

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const toolbarBtnBase = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-10 space-y-4">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-[var(--accent-label)] uppercase tracking-widest font-medium">FlowDesk</p>
            <h1 className="text-xl font-semibold text-[var(--heading-color)] mt-0.5">Vision Board</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Design your future</p>
          </div>
          <button
            onClick={download}
            disabled={exporting || items.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-white text-xs font-medium rounded-xl disabled:opacity-40 transition-all"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => { if (!exporting && items.length > 0) e.currentTarget.style.background = "var(--accent-hover)"; }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            {exporting ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {exporting ? "Exporting…" : "Download"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${toolbarBtnBase} text-white`}
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Image
            </button>
            <button
              onClick={addText}
              className={`${toolbarBtnBase} bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:bg-[var(--border-soft)]`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h10M4 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Text
            </button>
            {selectedId && (
              <>
                <button
                  onClick={() => bringToFront(selectedId)}
                  className={`${toolbarBtnBase} bg-[var(--accent-soft)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:bg-[var(--border-soft)]`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <path d="M12 4l-4 4m4-4l4 4M12 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Front
                </button>
                <button
                  onClick={() => { setItems((p) => p.filter((i) => i.id !== selectedId)); setSelectedId(null); }}
                  className={`${toolbarBtnBase} bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 ml-auto`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Background color */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] shrink-0">Background</span>
            <div className="flex gap-1.5">
              {BG_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${bgColor === c ? "border-stone-700 scale-110" : "border-transparent"}`}
                  style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
                />
              ))}
            </div>
          </div>

          {/* Text properties */}
          {selected?.type === "text" && (
            <div className="flex items-center gap-2 flex-wrap border-t border-[var(--border-soft)] pt-3">
              <span className="text-xs text-[var(--text-secondary)] shrink-0">Style</span>
              {(["S", "M", "L", "XL"] as const).map((label, i) => {
                const sizes = [0.03, 0.05, 0.07, 0.1];
                const fs = Math.round(stageWidth * sizes[i]);
                const active = (selected as TextItem).fontSize === fs;
                return (
                  <button
                    key={label}
                    onClick={() => updateItem(selectedId!, { fontSize: fs })}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      active
                        ? "text-white"
                        : "bg-[var(--accent-soft)] text-[var(--text-secondary)] border border-[var(--border-soft)] hover:text-[var(--text-primary)]"
                    }`}
                    style={active ? { background: "var(--accent)" } : {}}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                onClick={() => updateItem(selectedId!, { fontStyle: (selected as TextItem).fontStyle === "bold" ? "normal" : "bold" })}
                className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                  (selected as TextItem).fontStyle === "bold"
                    ? "text-white"
                    : "bg-[var(--accent-soft)] text-[var(--text-secondary)] border border-[var(--border-soft)] hover:text-[var(--text-primary)]"
                }`}
                style={(selected as TextItem).fontStyle === "bold" ? { background: "var(--accent)" } : {}}
              >
                B
              </button>
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateItem(selectedId!, { fill: c })}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${(selected as TextItem).fill === c ? "border-stone-700 scale-110" : "border-transparent"}`}
                  style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative rounded-3xl overflow-hidden shadow-sm border border-[var(--border-soft)]"
          style={{ minHeight: 300 }}
          onDrop={(e) => { e.preventDefault(); addImages(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
        >
          {stageWidth > 0 && (
            <>
              <Stage
                ref={stageRef} width={stageWidth} height={stageHeight}
                onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
              >
                <Layer>
                  <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill={bgColor} />
                  {items.map((item) => {
                    if (item.type === "image") {
                      return (
                        <KonvaImage
                          key={item.id} id={item.id} x={item.x} y={item.y}
                          width={item.width} height={item.height} image={item.imgEl}
                          rotation={item.rotation} draggable
                          onClick={() => setSelectedId(item.id)}
                          onTap={() => setSelectedId(item.id)}
                          onDragEnd={(e) => updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
                          onTransformEnd={(e) => {
                            const n = e.target;
                            updateItem(item.id, { x: n.x(), y: n.y(), width: Math.max(10, item.width * n.scaleX()), height: Math.max(10, item.height * n.scaleY()), rotation: n.rotation() });
                            n.scaleX(1); n.scaleY(1);
                          }}
                        />
                      );
                    }
                    const ti = item as TextItem;
                    return (
                      <Text
                        key={ti.id} id={ti.id} x={ti.x} y={ti.y} text={ti.text}
                        fontSize={ti.fontSize} fill={ti.fill} fontStyle={ti.fontStyle}
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                        rotation={ti.rotation} draggable
                        onClick={() => setSelectedId(ti.id)}
                        onTap={() => setSelectedId(ti.id)}
                        onDragEnd={(e) => updateItem(ti.id, { x: e.target.x(), y: e.target.y() })}
                        onDblClick={(e) => handleTextDblClick(ti, e.target as Konva.Text)}
                        onDblTap={(e) => handleTextDblClick(ti, e.target as Konva.Text)}
                        onTransformEnd={(e) => {
                          const n = e.target as Konva.Text;
                          updateItem(ti.id, { x: n.x(), y: n.y(), fontSize: Math.max(8, Math.round(ti.fontSize * n.scaleY())), rotation: n.rotation() });
                          n.scaleX(1); n.scaleY(1);
                        }}
                      />
                    );
                  })}
                  <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) =>
                      Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10 ? oldBox : newBox
                    }
                  />
                </Layer>
              </Stage>

              {items.length === 0 && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer select-none z-10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.4" />
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Tap to add images</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">or drag &amp; drop</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <p className="text-center text-xs text-[var(--text-secondary)]">
            Tap to select · drag to move · drag corners to resize · double-tap text to edit
          </p>
        )}
      </div>

      <input
        ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { addImages(e.target.files); e.target.value = ""; }}
      />

      <BottomNav />
    </div>
  );
}
