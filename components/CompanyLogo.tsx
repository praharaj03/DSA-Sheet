"use client";

import { useState } from "react";
import { logoUrl, type Company } from "@/lib/companies";

export default function CompanyLogo({ company, size = 22 }: { company: Company; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (!company.domain || failed) {
    return (
      <span className="logo logo-fallback" style={{ ...style, fontSize: size * 0.48 }} title={company.name}>
        {company.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="logo"
      style={style}
      src={logoUrl(company.domain, size > 24 ? 128 : 64)}
      alt={company.name}
      title={company.name}
      loading="lazy"
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
