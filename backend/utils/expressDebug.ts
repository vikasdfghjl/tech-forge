import { Router } from 'express';

/**
 * Debug wrapper for Express Router methods
 * Wraps router methods to provide detailed logging about undefined handlers
 */
export function createDebugRouter() {
  const router = Router();
  const originalMethods = {
    get: router.get.bind(router),
    post: router.post.bind(router),
    put: router.put.bind(router),
    delete: router.delete.bind(router),
    patch: router.patch.bind(router),
  };

  // Override router methods with debug versions
  // Using 'any' type to bypass TypeScript's strict checking for the Router methods
  (router as any).get = function(path: any, ...handlers: any[]) {
    validateHandlers('GET', String(path), handlers);
    return originalMethods.get(path, ...handlers);
  };

  (router as any).post = function(path: any, ...handlers: any[]) {
    validateHandlers('POST', String(path), handlers);
    return originalMethods.post(path, ...handlers);
  };

  (router as any).put = function(path: any, ...handlers: any[]) {
    validateHandlers('PUT', String(path), handlers);
    return originalMethods.put(path, ...handlers);
  };

  (router as any).delete = function(path: any, ...handlers: any[]) {
    validateHandlers('DELETE', String(path), handlers);
    return originalMethods.delete(path, ...handlers);
  };

  (router as any).patch = function(path: any, ...handlers: any[]) {
    validateHandlers('PATCH', String(path), handlers);
    return originalMethods.patch(path, ...handlers);
  };

  return router;
}

function validateHandlers(method: string, path: string, handlers: any[]) {
  console.log(`Setting up ${method} route for ${path} with ${handlers.length} handlers`);
  
  handlers.forEach((handler, index) => {
    if (handler === undefined) {
      console.error(`ERROR: Handler #${index} for ${method} ${path} is undefined!`);
      console.trace('Stack trace for undefined handler:');
      throw new Error(`Handler #${index} for ${method} ${path} is undefined!`);
    }
    
    if (typeof handler !== 'function') {
      console.error(`ERROR: Handler #${index} for ${method} ${path} is not a function! Type: ${typeof handler}`);
      console.error('Handler value:', handler);
      console.trace('Stack trace for invalid handler:');
      throw new Error(`Handler #${index} for ${method} ${path} is not a function! Type: ${typeof handler}`);
    }
    
    console.log(`  ✓ Handler #${index}: ${handler.name || '(anonymous)'} [${typeof handler}]`);
  });
}

/**
 * Utility function to show detailed debug info for Express route setup issues
 */
export function debugRouteImports(routeName: string, imports: Record<string, any>) {
  console.log(`==== DEBUG ${routeName} ROUTE IMPORTS ====`);
  for (const [name, value] of Object.entries(imports)) {
    console.log(`${name}: ${typeof value} ${value === undefined ? '(UNDEFINED!)' : ''}`);
    
    if (value === undefined) {
      console.warn(`WARNING: ${name} is undefined! This will cause Route errors.`);
    } else if (typeof value !== 'function') {
      console.warn(`WARNING: ${name} is not a function! Type: ${typeof value}`);
    }
  }
  console.log(`================================`);
}