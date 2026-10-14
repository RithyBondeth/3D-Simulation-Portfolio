import { Component, type ReactNode } from "react";
import { ArrowRightIcon, CubeIcon } from "@phosphor-icons/react";

export default class WorldBoundary extends Component<
  { children: ReactNode; onFallback: () => void; onError: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.error)
      return (
        <div className="world-error">
          <CubeIcon size={38} />
          <h2>The 3D scene couldn’t load.</h2>
          <p>Your browser may not support 3D. All the work is still here.</p>
          <button className="primary-button" onClick={this.props.onFallback}>
            Open simple view
            <ArrowRightIcon size={17} />
          </button>
        </div>
      );
    return this.props.children;
  }
}
