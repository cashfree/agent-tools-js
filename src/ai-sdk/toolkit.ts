import { tool, type Tool } from "ai";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import tools, {
  type CashfreeToolDefinition,
  type CashfreeToolMethod,
} from "../tools/tools.js";

class CashfreeAISDKToolkit {
  private cashfree: Cashfree;
  private toolDefinitions: CashfreeToolDefinition[];

  /**
   * Individual tools for use with AI SDK ToolLoopAgent
   * Access tools like: toolkit.createOrder, toolkit.getOrder, etc.
   */
  [key: string]: any;

  /**
   * Object containing all tools with their names as keys
   * Access tools like: toolkit.tools.createOrder
   */
  tools: Record<CashfreeToolMethod, any> = {} as Record<
    CashfreeToolMethod,
    any
  >;

  constructor(
    environment: CFEnvironment,
    clientId: string,
    clientSecret: string,
  ) {
    this.cashfree = new Cashfree(environment, clientId, clientSecret);
    this.toolDefinitions = tools;

    // Create individual tool accessors for AI SDK
    this._createTools();
  }

  /**
   * Creates individual tool properties that can be used with AI SDK ToolLoopAgent
   */
  private _createTools(): void {
    for (const toolDef of this.toolDefinitions) {
      const cashfree = this.cashfree;

      const aiSdkTool = tool({
        description: toolDef.description,
        inputSchema: toolDef.inputSchema,
        execute: async (args: any) => {
          const result = await toolDef.execute(cashfree, args);
          return result;
        },
      });

      // Attach to toolkit instance with method name as key
      this[toolDef.method] = aiSdkTool;
      // Populate tools object
      this.tools[toolDef.method as CashfreeToolMethod] = aiSdkTool;
    }
  }

  /**
   * Get all tools
   * Returns a tools object compatible with ToolLoopAgent constructor
   */
  getTools(): any {
    return this.tools;
  }
}

export { CFEnvironment };
export default CashfreeAISDKToolkit;
