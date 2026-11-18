"use client";

import { useState } from "react";

export default function Avatar({
  url,
  name,
  size,
  className,
}: {
  url: string;
  name: string;
  size: number;
  className: string;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const style = { width: size, height: size };
  if (url && failedUrl !== url)
    return (
      <img
        src={url}
        alt={name}
        className={className}
        width={size}
        height={size}
        style={style}
        onError={() => setFailedUrl(url)}
      />
    );
  return (
    <span
      role="img"
      aria-label={name}
      className={`${className} avatar-fallback`}
      style={{ ...style, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
