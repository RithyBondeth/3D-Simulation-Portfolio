import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CubeIcon,
  MouseIcon,
  XIcon,
} from "@phosphor-icons/react";
import Dialog from "../shared/Dialog";
export default function ControlsHelp({
  onClose,
  onDrive,
  onSimple,
}: {
  onClose: () => void;
  onDrive: () => void;
  onSimple: () => void;
}) {
  return (
    <Dialog className="help-dialog" titleId="help-title" onClose={onClose}>
      <button
        className="icon-button help-close"
        aria-label="Close help"
        onClick={onClose}
      >
        <XIcon size={21} />
      </button>
      <span className="help-icon">
        <CubeIcon size={32} weight="duotone" />
      </span>
      <h2 id="help-title">Make yourself at home.</h2>
      <p>
        Scroll through the world to discover the work, or take the M4 for a
        short drive of your own.
      </p>
      <div className="help-rows">
        <div>
          <MouseIcon size={23} />
          <span>
            <strong>Explore the world</strong>Scroll through six chapters, or
            choose an island destination. In driving mode, drag to look around
            and scroll to zoom.
          </span>
        </div>
        <div>
          <span className="key-group">
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd>
          </span>
          <span>
            <strong>You’re in the driver’s seat</strong>W / S accelerate and
            reverse. A / D steer. Space brakes. Follow the east avenue to the
            signed bridge for Innovation island.
          </span>
        </div>
        <div>
          <kbd>E</kbd>
          <span>
            <strong>Discover a corner</strong>Click a marker, or press E when
            you’re nearby while driving. M returns to the portfolio. R returns
            to the start.
          </span>
        </div>
        <div>
          <kbd>1-6</kbd>
          <span>
            <strong>Jump right in</strong>Number keys open the six portfolio
            destinations.
          </span>
        </div>
      </div>
      <button className="primary-button" onClick={onDrive}>
        Take a short drive
        <ArrowUpRightIcon size={18} />
      </button>
      <p className="model-credit">
        <a
          href="https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b"
          target="_blank"
          rel="noopener noreferrer"
        >
          BMW M4 Competition
        </a>{" "}
        model by{" "}
        <a
          href="https://sketchfab.com/TheRealSRT"
          target="_blank"
          rel="noopener noreferrer"
        >
          SRT Performance
        </a>{" "}
        ·{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY 4.0
        </a>
        . Optimized for web; paint and wheel animation adapted.
      </p>
      <button className="text-button help-simple" onClick={onSimple}>
        I prefer a simple portfolio
        <ArrowRightIcon size={16} />
      </button>
    </Dialog>
  );
}
