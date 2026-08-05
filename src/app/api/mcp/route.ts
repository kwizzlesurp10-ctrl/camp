import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  chatMessageSchema,
  chatWithStaff,
  clusterSchema,
  getStaffDetail,
  jsonText,
  listStaffSummaries,
  searchStaff,
  staffIdSchema,
} from "@/lib/camp-staff-mcp";

/**
 * Northern Camp Staff MCP connector.
 * Streamable HTTP endpoint for agents (Grok, Claude, Cursor, etc.).
 *
 * Production: https://camp-swart.vercel.app/api/mcp
 * Local:      http://localhost:3000/api/mcp
 */
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_camp_staff",
      {
        title: "List camp staff",
        description:
          "List northern camp counsellor personas (staff archetypes). Optionally filter by cluster: experience, motivation, engagement, or domain.",
        inputSchema: z.object({
          cluster: clusterSchema
            .optional()
            .describe(
              "Optional cluster filter. Use 'all' or omit for every staff persona.",
            ),
        }),
      },
      async ({ cluster }) => {
        const data = listStaffSummaries(
          cluster === "all" || !cluster ? "all" : cluster,
        );
        return {
          content: [
            {
              type: "text",
              text: jsonText(data),
            },
          ],
        };
      },
    );

    server.registerTool(
      "get_camp_staff",
      {
        title: "Get camp staff",
        description:
          "Fetch the full agent-export card for one camp staff persona by id (e.g. wide-eyed-rookie, heart-centered-listener).",
        inputSchema: z.object({
          staff_id: staffIdSchema.describe("Persona id from list_camp_staff."),
        }),
      },
      async ({ staff_id }) => {
        const result = getStaffDetail(staff_id);
        if (!result.ok) {
          return {
            content: [{ type: "text", text: result.error }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: jsonText(result) }],
        };
      },
    );

    server.registerTool(
      "search_camp_staff",
      {
        title: "Search camp staff",
        description:
          "Search staff personas by free text, cluster, and/or trait. Useful before opening a chat.",
        inputSchema: z.object({
          query: z
            .string()
            .max(120)
            .optional()
            .describe(
              "Free-text match against title, essence, traits, tags, etc.",
            ),
          cluster: clusterSchema.optional(),
          trait: z
            .string()
            .max(80)
            .optional()
            .describe('Exact trait label, e.g. "Trauma-Informed".'),
        }),
      },
      async (input) => {
        const data = searchStaff(input);
        return {
          content: [{ type: "text", text: jsonText(data) }],
        };
      },
    );

    server.registerTool(
      "chat_with_camp_staff",
      {
        title: "Chat with camp staff",
        description:
          "Open or continue an in-character conversation with a camp staff persona. Returns a system prompt, draft reply, and guidance so the host model can speak as that counsellor (training sims, multi-agent cast, parent/director Q&A).",
        inputSchema: z.object({
          staff_id: staffIdSchema.describe(
            "Which counsellor to speak as / with.",
          ),
          message: z
            .string()
            .min(1)
            .max(4000)
            .describe("What you want to say or ask this staff member."),
          scenario: z
            .string()
            .max(500)
            .optional()
            .describe(
              "Optional scene framing, e.g. 'midnight homesickness in Cabin Birch' or 'waterfront near-miss debrief'.",
            ),
          conversation_history: z
            .array(chatMessageSchema)
            .max(40)
            .optional()
            .describe("Prior turns for multi-turn staff chats."),
        }),
      },
      async (input) => {
        const result = chatWithStaff(input);
        if (!result.ok) {
          return {
            content: [{ type: "text", text: result.error }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: result.text }],
        };
      },
    );

    server.registerTool(
      "list_staff_ids",
      {
        title: "List staff ids",
        description:
          "Return only the valid staff persona ids (quick lookup for tool args).",
        inputSchema: z.object({}),
      },
      async () => {
        const ids = listStaffSummaries("all").staff.map((s) => ({
          id: s.id,
          title: s.title,
        }));
        return {
          content: [{ type: "text", text: jsonText(ids) }],
        };
      },
    );
  },
  {
    serverInfo: {
      name: "northern-camp-staff",
      version: "1.0.0",
    },
  },
);

export { handler as GET, handler as POST };
