import { BaseToolkit, StructuredTool } from "@langchain/core/tools";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { z } from "zod";
import tools, {
  type CashfreeToolDefinition,
  type CashfreeToolMethod,
} from "../tools/tools.js";

class CashfreeTool extends StructuredTool {
  private cashfree: Cashfree;
  private executeFunction: (cashfree: Cashfree, args: any) => Promise<any>;

  name: string;
  description: string;
  schema: z.ZodObject<any, any, any, any>;

  constructor(
    cashfree: Cashfree,
    method: string,
    description: string,
    inputSchema: z.ZodObject<any, any, any, any>,
    executeFunction: (cashfree: Cashfree, args: any) => Promise<any>,
  ) {
    super();
    this.cashfree = cashfree;
    this.name = method;
    this.description = description;
    this.schema = inputSchema;
    this.executeFunction = executeFunction;
  }

  async _call(args: z.infer<typeof this.schema>): Promise<string> {
    const result = await this.executeFunction(this.cashfree, args);
    return typeof result === "string" ? result : JSON.stringify(result);
  }
}

class CashfreeAgentToolkit implements BaseToolkit {
  private cashfree: Cashfree;
  private toolDefinitions: CashfreeToolDefinition[];
  tools: CashfreeTool[];

  /**
   * Object containing all tools with their names as keys
   * Access tools like: toolkit.toolsMap.createOrder
   */
  toolsMap: Record<CashfreeToolMethod, any> = {} as Record<
    CashfreeToolMethod,
    any
  >;

  /**
   * Individual tools for use with LangChain agents
   * Access tools like: toolkit.createOrder, toolkit.getOrder, etc.
   */
  [key: string]: any;

  constructor(
    environment: CFEnvironment,
    clientId: string,
    clientSecret: string,
  ) {
    this.cashfree = new Cashfree(environment, clientId, clientSecret);
    this.toolDefinitions = tools;

    // Create LangChain tools array for getTools()
    this.tools = this.toolDefinitions.map(
      (tool) =>
        new CashfreeTool(
          this.cashfree,
          tool.method,
          tool.description,
          tool.inputSchema,
          tool.execute,
        ),
    );

    // Create individual tool accessors
    this._createToolAccessors();
  }

  /**
   * Creates individual tool properties that can be accessed directly
   */
  private _createToolAccessors(): void {
    for (const toolDef of this.toolDefinitions) {
      const cashfree = this.cashfree;

      const toolInstance = new CashfreeTool(
        cashfree,
        toolDef.method,
        toolDef.description,
        toolDef.inputSchema,
        toolDef.execute,
      );

      // Attach to toolkit instance with method name as key
      this[toolDef.method] = toolInstance;
      // Populate toolsMap
      this.toolsMap[toolDef.method as CashfreeToolMethod] = toolInstance;
    }
  }

  /**
   * Get all tools as an array
   * For usage with LangChain agents: createAgent({ tools: toolkit.getTools() })
   */
  getTools(): any {
    return this.tools;
  }
}

export { CFEnvironment };
export default CashfreeAgentToolkit;
