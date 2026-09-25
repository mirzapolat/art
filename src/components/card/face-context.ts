import { createContext, useContext } from "react";

/**
 * Whether the card side a slide is printed on currently faces the viewer.
 * Lets expensive slide artwork (e.g. a shader) pause while it faces away.
 */
export const FaceVisibleContext = createContext(true);

export function useFaceVisible() {
  return useContext(FaceVisibleContext);
}
