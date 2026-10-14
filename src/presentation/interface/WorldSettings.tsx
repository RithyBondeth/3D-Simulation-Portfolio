import {
  ArrowCounterClockwiseIcon,
  SlidersHorizontalIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  QuestionIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type GraphicsPreference } from "../../domain/world/graphics-quality";
import type React from "react";
export default function WorldSettings({
  open,
  triggerRef,
  onToggle,
  night,
  onToggleNight,
  muted,
  onToggleSound,
  animationPaused,
  onToggleAnimation,
  reduceMotion,
  onReset,
  onHelp,
  graphicsPreference,
  onGraphicsChange,
}: {
  open: boolean;
  triggerRef: React.Ref<HTMLButtonElement>;
  onToggle: () => void;
  night: boolean;
  onToggleNight: () => void;
  muted: boolean;
  onToggleSound: () => void;
  animationPaused: boolean;
  onToggleAnimation: () => void;
  reduceMotion: boolean;
  onReset: () => void;
  onHelp: () => void;
  graphicsPreference: GraphicsPreference;
  onGraphicsChange: (preference: GraphicsPreference) => void;
}) {
  return (
    <div className={`world-tools ${open ? "tools-expanded" : ""}`}>
      <button
        className="icon-button tools-toggle"
        ref={triggerRef}
        aria-label={open ? "Close world settings" : "World settings"}
        aria-expanded={open}
        aria-controls="world-settings"
        onClick={onToggle}
      >
        {open ? <XIcon size={20} /> : <SlidersHorizontalIcon size={20} />}
      </button>
      <div
        className="world-settings"
        id="world-settings"
        role="group"
        aria-label="World controls"
        hidden={!open}
      >
        <button
          className="icon-button"
          onClick={onToggleNight}
          aria-label={night ? "Switch to daytime" : "Switch to nighttime"}
          title={night ? "Daytime" : "Nighttime"}
        >
          {night ? <MoonIcon size={19} /> : <SunIcon size={20} />}
        </button>
        <button
          className="icon-button"
          onClick={onToggleSound}
          aria-label={
            muted ? "Enable interaction sounds" : "Mute interaction sounds"
          }
          title={muted ? "Sound off" : "Sound on"}
        >
          {muted ? (
            <SpeakerSlashIcon size={19} />
          ) : (
            <SpeakerHighIcon size={19} />
          )}
        </button>
        <button
          className="icon-button"
          onClick={onToggleAnimation}
          aria-label={
            animationPaused ? "Play scene animation" : "Pause scene animation"
          }
          aria-pressed={animationPaused}
          title={animationPaused ? "Play animation" : "Pause animation"}
          disabled={reduceMotion}
        >
          {animationPaused || reduceMotion ? (
            <PlayIcon size={19} />
          ) : (
            <PauseIcon size={19} />
          )}
        </button>
        <span className="tool-divider" />
        <button
          className="icon-button"
          onClick={onReset}
          aria-label="Reset car and camera"
          title="Return to start"
        >
          <ArrowCounterClockwiseIcon size={19} />
        </button>
        <button
          className="icon-button"
          onClick={onHelp}
          aria-label="How to explore"
          title="How to explore"
        >
          <QuestionIcon size={20} />
        </button>
        <label className="graphics-control">
          <span>Graphics</span>
          <select
            aria-label="Graphics quality"
            value={graphicsPreference}
            onChange={(event) =>
              onGraphicsChange(event.target.value as GraphicsPreference)
            }
          >
            <option value="auto">Auto</option>
            <option value="high">Detailed</option>
            <option value="low">Battery saver</option>
          </select>
        </label>
      </div>
    </div>
  );
}
