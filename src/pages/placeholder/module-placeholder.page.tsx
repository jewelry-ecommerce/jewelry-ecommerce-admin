import { Stack } from "@mui/material";
import { useLocation } from "react-router-dom";

import { EmptyComponent } from "@/components/empty/empty.component";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { collectLeafMatchPaths, DASHBOARD_SIDEBAR_NAV, isNavActive } from "@/router/dashboard-sidebar.nav";
import { STYLE } from "@/theme/design-tokens";

/** Longest-prefix nav match, so `/cms/pages/create` reports "Pages" rather than "Content". */
const resolveModuleName = (pathname: string): { title: string; groupTitle: string } => {
  const matches = DASHBOARD_SIDEBAR_NAV.flatMap((group) =>
    (group.items ?? []).flatMap((leaf) =>
      collectLeafMatchPaths(leaf)
        .filter((path) => isNavActive(pathname, path))
        .map((path) => ({ title: leaf.title, groupTitle: group.title, length: path.length })),
    ),
  );

  if (matches.length > 0) {
    const best = matches.reduce((winner, candidate) => (candidate.length > winner.length ? candidate : winner));
    return { title: best.title, groupTitle: best.groupTitle };
  }

  const group = DASHBOARD_SIDEBAR_NAV.find((entry) => entry.path && isNavActive(pathname, entry.path));
  return { title: group?.title ?? "This module", groupTitle: group?.title ?? "Admin" };
};

/**
 * Stand-in for modules whose screens arrive in a later task. Registered for every unbuilt route so
 * navigation always lands somewhere intelligible instead of a blank view.
 */
const ModulePlaceholderPage = () => {
  const { pathname } = useLocation();
  const { title, groupTitle } = resolveModuleName(pathname);

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: "border-box", minHeight: 0 }}>
      <WrapperComponent label={title} description={groupTitle === title ? undefined : groupTitle}>
        <EmptyComponent
          title="Coming in the next task"
          description={`The ${title.toLowerCase()} screen is not built yet. Its contracts, fixtures and permission scopes are already in place, so only the UI remains.`}
        />
      </WrapperComponent>
    </Stack>
  );
};

export default ModulePlaceholderPage;
