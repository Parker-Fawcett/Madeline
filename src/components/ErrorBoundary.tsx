"use client";

import { Component } from "react";

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  crashed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("3D scene crashed, falling back to flat view:", error.message);
  }

  render() {
    if (this.state.crashed) return this.props.fallback;
    return this.props.children;
  }
}
