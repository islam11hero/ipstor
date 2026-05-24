"use client";

import { Player } from "@lordicon/react";
import { forwardRef } from "react";

type LordIconPlayerProps = React.ComponentProps<typeof Player>;

export const LordIconPlayer = forwardRef<Player, LordIconPlayerProps>(
  function LordIconPlayer(props, ref) {
    return <Player ref={ref} {...props} />;
  }
);
