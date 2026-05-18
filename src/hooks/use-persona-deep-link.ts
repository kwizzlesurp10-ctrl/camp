"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildHrefWithoutPersona,
  buildPersonaHref,
  parsePersonaIdParam,
} from "@/lib/persona-url";

type UsePersonaDeepLinkResult = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  toggleSelectedId: (id: string) => void;
  buildShareHref: (personaId: string) => string;
};

export function usePersonaDeepLink(): UsePersonaDeepLinkResult {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedId = parsePersonaIdParam(searchParams.get("persona"));

  const setSelectedId = useCallback(
    (id: string | null) => {
      const href = id
        ? buildPersonaHref(pathname, id, searchParams)
        : buildHrefWithoutPersona(pathname, searchParams);
      router.replace(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleSelectedId = useCallback(
    (id: string) => {
      setSelectedId(selectedId === id ? null : id);
    },
    [selectedId, setSelectedId],
  );

  const buildShareHref = useCallback(
    (personaId: string) => {
      if (typeof window === "undefined") {
        return buildPersonaHref(pathname, personaId, searchParams);
      }
      return `${window.location.origin}${buildPersonaHref(pathname, personaId, searchParams)}`;
    },
    [pathname, searchParams],
  );

  return { selectedId, setSelectedId, toggleSelectedId, buildShareHref };
}
