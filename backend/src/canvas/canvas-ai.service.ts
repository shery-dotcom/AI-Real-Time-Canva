import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  CanvasGenerationPlan,
  CanvasGroupPlan,
  CanvasPattern,
  CanvasNodeType,
} from "./canvas.types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 1024;
const TEMPERATURE = 0;
const MAX_NODES = 12;
const MAX_LABEL_LENGTH = 2;
const ALLOWED_PATTERNS: CanvasPattern[] = [
  "row",
  "column",
  "grid",
  "radial",
  "single",
];
const ALLOWED_SHAPES: CanvasNodeType[] = ["circle", "rectangle"];

@Injectable()
export class CanvasAiService {
  async createGenerationPlan(prompt: string): Promise<CanvasGenerationPlan> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException("GROQ_API_KEY is not configured");
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: "system",
            content:
              'Return ONLY valid JSON with this exact shape: {"groups":[{"pattern":"row"|"column"|"grid"|"radial"|"single","shape":"circle"|"rectangle","nodes":[{"label":string,"color":string}],"cols"?:number,"hasCenter"?:boolean}]}. Do not include coordinates. Keep labels to 2 characters or fewer. Use only the allowed patterns and shapes. Order the groups array top-to-bottom as they should appear visually on screen — the first group in the array will be placed at the top, the last at the bottom.',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Groq request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new InternalServerErrorException("Groq returned an empty response");
    }

    const parsed = this.parseGenerationPlan(content);
    this.validateGenerationPlan(parsed);

    return parsed;
  }

  private parseGenerationPlan(content: string): CanvasGenerationPlan {
    const jsonText = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      return JSON.parse(jsonText) as CanvasGenerationPlan;
    } catch {
      throw new InternalServerErrorException(
        "Groq response was not valid JSON",
      );
    }
  }

  private validateGenerationPlan(plan: CanvasGenerationPlan): void {
    if (!plan || !Array.isArray(plan.groups) || plan.groups.length === 0) {
      throw new BadRequestException("AI must return at least one group");
    }

    let totalNodes = 0;

    for (const group of plan.groups) {
      if (!ALLOWED_PATTERNS.includes(group.pattern)) {
        throw new BadRequestException(`Unsupported pattern: ${group.pattern}`);
      }

      if (!ALLOWED_SHAPES.includes(group.shape)) {
        throw new BadRequestException(`Unsupported shape: ${group.shape}`);
      }

      if (!Array.isArray(group.nodes) || group.nodes.length === 0) {
        throw new BadRequestException(
          "Each group must contain at least one node",
        );
      }

      if (
        group.cols !== undefined &&
        (!Number.isInteger(group.cols) || group.cols <= 0)
      ) {
        throw new BadRequestException(
          "cols must be a positive integer when provided",
        );
      }

      if (
        group.hasCenter !== undefined &&
        typeof group.hasCenter !== "boolean"
      ) {
        throw new BadRequestException(
          "hasCenter must be a boolean when provided",
        );
      }

      for (const node of group.nodes) {
        totalNodes += 1;

        if (
          typeof node.label !== "string" ||
          node.label.trim().length === 0 ||
          node.label.length > MAX_LABEL_LENGTH
        ) {
          throw new BadRequestException("Labels must be 2 characters or fewer");
        }

        if (typeof node.color !== "string" || node.color.trim().length === 0) {
          throw new BadRequestException("Each node must include a color");
        }
      }
    }

    if (totalNodes > MAX_NODES) {
      throw new BadRequestException("Maximum 12 nodes are allowed");
    }
  }
}
