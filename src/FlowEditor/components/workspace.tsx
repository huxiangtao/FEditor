import React from "react";
import { constants } from "../constants";

export default function WorkSpace() {
  const { MARKER_ARROW_WIDTH, MARKER_ARROW_HEIGHT } = constants;
  return (
    <defs>
      <pattern
        id="small-grid"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 8 0 L 0 0 0 8"
          fill="none"
          stroke="#BDBDBD"
          strokeWidth="0.5"
        />
      </pattern>
      <pattern
        id="medium-grid"
        width="16"
        height="16"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 16 0 L 0 0 0 16"
          fill="none"
          stroke="#BDBDBD"
          strokeWidth="0.5"
        />
      </pattern>
      <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="80" height="80" fill="url(#medium-grid)" />
        <path
          d="M 80 0 L 0 0 0 80"
          fill="none"
          stroke="#BDBDBD"
          strokeWidth="1"
        />
      </pattern>
      <filter id="blurFilter2" y="-10" height="40" x="-10" width="150">
        <feOffset in="SourceAlpha" dx="3" dy="3" result="offset2" />
        <feGaussianBlur in="offset2" stdDeviation="3" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <marker
        xmlns="http://www.w3.org/2000/svg"
        id="marker-arrow"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerUnits="userSpaceOnUse"
        markerWidth={MARKER_ARROW_WIDTH}
        markerHeight={MARKER_ARROW_HEIGHT}
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <linearGradient
        id="poop-gradient"
        x1="-492.7"
        y1="3.63"
        x2="-490.65"
        y2="4.59"
        gradientTransform="translate(10519.1 -59.42) scale(21.33)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}
