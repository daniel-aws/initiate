import { sessionData } from "../data/loadData";

const sessionActive = true;

export function submitInstancedAction() {
  console.log("test");
  sessionData.get("test");
}
