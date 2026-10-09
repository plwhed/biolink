import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

type UnsavedChangesBannerProps = {
  count: number;
  saving?: boolean;
  onUndo?: () => void;
  onSave?: () => void;
};

export default function UnsavedChangesBanner({
  count,
  saving = false,
  onUndo,
  onSave,
}: UnsavedChangesBannerProps) {
  const [visible, setVisible] = useState(count > 0);
  const [closing, setClosing] = useState(false);

  // Adjust the animation state during render when the count prop changes
  // (React's recommended alternative to syncing state inside an effect).
  const [prevCount, setPrevCount] = useState(count);

  if (prevCount !== count) {
    setPrevCount(count);

    if (count > 0) {
      setClosing(false);
      setVisible(true);
    } else {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (count > 0 || !closing) return;

    const timeout = window.setTimeout(() => setVisible(false), 180);
    return () => window.clearTimeout(timeout);
  }, [count, closing]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes unsaved-in {
          0% {
            opacity: 0;
            transform: translate(-50%, 14px) scale(0.92);
          }
          60% {
            opacity: 1;
            transform: translate(-50%, -2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes unsaved-out {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 10px) scale(0.96);
          }
        }
      `}</style>

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[min(92vw,760px)] -translate-x-1/2">
        <div
          className="pointer-events-auto rounded-xl border border-[#1b1b1b] bg-[#0d0d0d] p-4"
          style={{
            animation: closing
              ? "unsaved-out 220ms ease-in forwards"
              : "unsaved-in 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                You have {count} unsaved changes.
              </p>
              <p className="text-sm text-white/50">
                Save your changes or undo them
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {onUndo && (
                <button
                  type="button"
                  onClick={onUndo}
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-all duration-200 hover:scale-[1.02] hover:bg-white/5 hover:text-white"
                >
                  Undo
                </button>
              )}

              {onSave && (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-pink-500 text-white hover:bg-pink-600 h-10 px-4 py-2 w-full md:w-auto md:min-w-[160px] mt-2 md:mt-0 gap-2 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
