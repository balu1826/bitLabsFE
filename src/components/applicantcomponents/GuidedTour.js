import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./GuidedTour.css";

/**
 * GuidedTour
 * Props:
 *  - userId: string|number (used to persist "seen" state)
 *  - open: boolean
 *  - onClose: () => void
 *  - steps: Array<{ id?:string, selector: string, text: string, placement?: 'right'|'left'|'top'|'bottom' }>
 *
 * Behavior:
 *  - anchors to DOM elements found by selector
 *  - positions the coachmark to the right of anchor by default (falls back to left)
 *  - shows spotlight over anchor and dims the rest
 *  - stores "seen" in localStorage when completed/closed
 */
const KEY_PREFIX = "tour_seen_";

function getRect(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/** computePosition pins the card to the right by default, centers vertically, clamps to viewport,
 *  and falls back to left placement when there isn't space on the right.
 */
function computePosition(anchorRect, placement = "right", gap = 12, cardSize = { w: 320, h: 160 }) {
  if (!anchorRect) return { top: 0, left: 0, placement };

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // desired left/top for the card when placed to the right of the anchor
  let left = anchorRect.left + scrollX + anchorRect.width + gap;
  let top = anchorRect.top + scrollY + (anchorRect.height - cardSize.h) / 2;

  // If there isn't enough room on the right, try left side (fallback)
  const rightSpace = window.innerWidth - (anchorRect.left + anchorRect.width);
  if (placement === "right" && rightSpace < cardSize.w + gap) {
    left = anchorRect.left + scrollX - gap - cardSize.w;
    placement = "left";
  }

  // clamp inside viewport horizontally
  const minLeft = 8 + scrollX;
  const maxLeft = scrollX + window.innerWidth - cardSize.w - 8;
  left = Math.max(minLeft, Math.min(left, maxLeft));

  // clamp inside viewport vertically
  const minTop = 8 + scrollY;
  const maxTop = scrollY + window.innerHeight - cardSize.h - 8;
  top = Math.max(minTop, Math.min(top, maxTop));

  return { top, left, placement };
}

export default function GuidedTour({ userId, open, onClose, steps = [] }) {
  const storageKey = useMemo(() => `${KEY_PREFIX}${userId}`, [userId]);
  const [index, setIndex] = useState(0);
  const [anchorRect, setAnchorRect] = useState(null);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0, placement: "right" });
  const cardRef = useRef(null);

  const step = steps[index] || {};

  // If not open, do nothing
  useEffect(() => {
    if (!open) return;
    // reset to first step when reopened
    setIndex(0);
  }, [open]);

  // Find anchor element and set rectangle; ensure element is in view
  useEffect(() => {
    if (!open || !step?.selector) return;

    const anchorEl = document.querySelector(step.selector);
    if (!anchorEl) {
      setAnchorRect(null);
      return;
    }

    // Scroll anchor into center so we can position relative to viewport
    try {
      anchorEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    } catch (e) {
      // ignore
    }

    // Small delay to allow scroll to settle and element to render
    const t = setTimeout(() => {
      setAnchorRect(getRect(anchorEl));
    }, 180);

    const update = () => setAnchorRect(getRect(document.querySelector(step.selector)));

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step]);

  // Measure card and compute final position
  useEffect(() => {
    if (!open || !anchorRect) return;

    let raf = 0;

    const measureAndPosition = () => {
      const el = cardRef.current;
      const size = el ? { w: Math.min(el.offsetWidth, 380), h: el.offsetHeight } : { w: 320, h: 160 };
      setCardPos(computePosition(anchorRect, step.placement || "right", 12, size));
    };

    // Give DOM a frame to render the card before measuring
    raf = requestAnimationFrame(() => {
      measureAndPosition();
    });

    const update = () => {
      const el = cardRef.current;
      const size = el ? { w: Math.min(el.offsetWidth, 380), h: el.offsetHeight } : { w: 320, h: 160 };
      setCardPos(computePosition(anchorRect, step.placement || "right", 12, size));
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRect, step]);

  // Close + persist "seen"
  const complete = () => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch (e) {
      /* ignore */
    }
    onClose?.();
  };

  const next = () => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else complete();
  };

  const prev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const close = () => {
    complete();
  };

  // keyboard nav (Esc to close, Arrow keys to move)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, steps]);

  // If not open -> render nothing
  if (!open) return null;

  // Build portal content
  const portal = (
    <>
      {/* Backdrop */}
      <div
        className="gt-backdrop"
        onClick={close}
        role="presentation"
      />

      {/* Spotlight around the anchor (if available) */}
      {anchorRect && (
        <div
          className="gt-spotlight"
          style={{
            top: anchorRect.top + window.scrollY - 8,
            left: anchorRect.left + window.scrollX - 8,
            width: anchorRect.width + 16,
            height: anchorRect.height + 16
          }}
          aria-hidden="true"
        />
      )}

      {/* Coachmark card */}
      <div
        className={`gt-card gt-${cardPos.placement}`}
        ref={cardRef}
        style={{ top: Math.round(cardPos.top), left: Math.round(cardPos.left), position: "absolute" }}
        role="dialog"
        aria-live="polite"
        aria-label={`Step ${index + 1} of ${steps.length}`}
      >
        <button className="gt-close" aria-label="Close tour" onClick={close}>×</button>

        <div className="gt-text">{step.text}</div>

        <div className="gt-footer">
          <div className="gt-dots" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={`gt-dot ${i === index ? "is-active" : ""}`} />
            ))}
          </div>

          <div className="gt-controls">
            <button className="gt-prev" onClick={prev} disabled={index === 0}>Back</button>
            <button className="gt-next" onClick={next}>{index < steps.length - 1 ? "Next" : "Done"}</button>
          </div>
        </div>

        {/* Arrow */}
        <div className={`gt-arrow gt-arrow-${cardPos.placement}`} aria-hidden />
      </div>
    </>
  );

  return ReactDOM.createPortal(portal, document.body);
}
