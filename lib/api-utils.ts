// Utility functions for API operations

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiError(error: any, operation: string): Promise<ApiResponse> {
  console.error(`API Error in ${operation}:`, error);
  
  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message
    };
  }
  
  return {
    success: false,
    error: error.message || `Failed to ${operation}`
  };
}

export async function fetchSandboxData(sandboxId: string): Promise<ApiResponse> {
  try {
    // This would be implemented based on your sandbox system
    return {
      success: true,
      data: { sandboxId, url: `http://localhost:3000/sandbox/${sandboxId}` }
    };
  } catch (error: any) {
    return handleApiError(error, 'fetch sandbox data');
  }
}

export async function validateSandbox(sandboxId: string): Promise<ApiResponse> {
  try {
    // This would validate the sandbox exists and is healthy
    return {
      success: true,
      data: { active: true, healthy: true }
    };
  } catch (error: any) {
    return handleApiError(error, 'validate sandbox');
  }
}

export async function executeSandboxCommand(sandboxId: string, command: string): Promise<ApiResponse> {
  try {
    // This would execute a command in the sandbox
    return {
      success: true,
      data: { output: `Command executed: ${command}` }
    };
  } catch (error: any) {
    return handleApiError(error, 'execute command');
  }
}