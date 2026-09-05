"use server";

import { planStaffRoomConversation, type TalkBeat } from "@/lib/camp-swarm-talk";
import { err, type Result } from "@/lib/result";

export async function askStaffRoom(
  question: string,
): Promise<Result<TalkBeat[], string>> {
  try {
    return planStaffRoomConversation(question);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Staff room went quiet");
  }
}
