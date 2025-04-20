import { Tool, Comment } from '../hooks/useToolData';

/**
 * A comprehensive Tool data normalizer that ensures consistent structure
 * across different API responses and components
 */

/**
 * Extended Tool interface that includes all possible properties
 * returned by various API endpoints
 */
export interface ExtendedTool extends Omit<Tool, 'id'> {
  uuid?: string; // Added UUID field
  id: string;   // Keep for backward compatibility
  creatorName?: string;
  userName?: string;
  user?: {
    name: string;
    uuid?: string; // Added UUID field
    id?: string;   // Backward compatibility
    [key: string]: unknown;
  };
  // Add additional possible properties for better extraction
  author?: string | {
    name?: string;
    username?: string;
    email?: string;
    uuid?: string; // Added UUID field
  };
  createdBy?: string | {
    name?: string;
    username?: string;
    email?: string;
    uuid?: string; // Added UUID field
  };
}

// Define interfaces for better type safety
export interface FallbackData {
  creatorName?: string | null;
  userName?: string | null;
  defaultName?: string;
  user?: { 
    name?: string; 
    [key: string]: unknown;
  };
  author?: string | { 
    name?: string;
    username?: string;
    email?: string;
    [key: string]: unknown;
  };
  createdBy?: string | { 
    name?: string;
    username?: string;
    email?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface NestedObject {
  name?: string;
  username?: string;
  email?: string;
  displayName?: string;
  fullName?: string;
  [key: string]: unknown;
}

/**
 * Checks if a string is a UUID v4
 * @param id - String to check
 * @returns boolean indicating if it's a UUID
 */
export function isUuid(id: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
}

/**
 * Extracts a human-readable name from an ID by checking fallback data
 * @param id - ID string (could be UUID or MongoDB ObjectID)
 * @param fallbackData - Additional data sources to check for names
 * @returns A human-readable name
 */
function extractNameFromId(
  id: string,
  fallbackData?: FallbackData
): string {
  // Don't use 'User' as a default immediately - look more extensively
  
  if (!fallbackData) {
    return 'Anonymous'; // Better default than just "User"
  }
  
  // Check all possible name fields in the fallback data
  const possibleNameFields = [
    'creatorName',
    'userName',
    'displayName',
    'authorName',
    'name',
    'username',
    'fullName',
    'nickname',
    'handle'
  ];
  
  // First check direct properties
  for (const field of possibleNameFields) {
    const value = fallbackData[field];
    if (typeof value === 'string' && value?.trim()) {
      return value;
    }
  }
  
  // Then check nested properties in user, author, createdBy objects
  const nestedObjects = ['user', 'author', 'createdBy', 'creator'];
  
  for (const objName of nestedObjects) {
    const obj = fallbackData[objName];
    if (obj && typeof obj === 'object') {
      // Type cast to NestedObject to access expected properties
      const typedObj = obj as NestedObject;
      
      for (const field of possibleNameFields) {
        const value = typedObj[field];
        if (typeof value === 'string' && value?.trim()) {
          return value;
        }
      }
      
      // Special check for email - use part before @ as name
      if (typeof typedObj.email === 'string' && typedObj.email.includes('@')) {
        return typedObj.email.split('@')[0];
      }
    }
  }
  
  // Finally check any property that could be a name
  for (const key in fallbackData) {
    const value = fallbackData[key];
    if (
      typeof value === 'string' && 
      value.trim() && 
      !value.includes('@') && // Not an email
      !/^\d+$/.test(value) && // Not just numbers
      !/^[0-9a-f]{24}$/i.test(value) && // Not a MongoDB id
      !isUuid(value) && // Not a UUID
      key.toLowerCase().includes('name')
    ) {
      return value;
    }
  }
  
  return typeof fallbackData.defaultName === 'string' ? fallbackData.defaultName : 'Community Member';
}

/**
 * Normalizes a creator object or string into a consistent format
 * @param creator - The creator data from the API (could be string ID or object)
 * @returns A normalized creator object
 */
export function normalizeCreator(
  creator: string | { 
    _id?: string; 
    id?: string; 
    uuid?: string; 
    name?: string; 
    username?: string; 
    displayName?: string; 
    fullName?: string; 
    email?: string; 
    [key: string]: unknown 
  } | null | undefined, 
  fallbackData?: { 
    creatorName?: string, 
    userName?: string, 
    user?: { 
      name?: string; 
      _id?: string; 
      id?: string;
      uuid?: string;
      username?: string; 
      email?: string; 
      [key: string]: unknown 
    }, 
    [key: string]: unknown 
  }
): { id: string; name: string; username: string; uuid?: string } {
  
  // Handle null or undefined creator
  if (!creator) {
    return { id: '', name: 'Anonymous', username: 'Anonymous' };
  }

  // Handle string creator (usually an ID)
  if (typeof creator === 'string') {
    // Get a better name than just "User"
    const actualName = extractNameFromId(creator, fallbackData);
    
    // If the string is a UUID, use it as the uuid field
    const isUuidString = isUuid(creator);
    
    return {
      id: creator,
      uuid: isUuidString ? creator : undefined,
      name: actualName,
      username: actualName
    };
  }

  // Handle object creator (normal case with complete data)
  if (typeof creator === 'object') {
    // Extract best available name data using specific properties
    const name = 
      (creator.name && creator.name.trim()) ? creator.name : 
      (creator.username && creator.username.trim()) ? creator.username :
      (creator.displayName && creator.displayName.trim()) ? creator.displayName :
      (creator.fullName && creator.fullName.trim()) ? creator.fullName :
      (creator.email) ? creator.email.split('@')[0] : 
      extractNameFromId('', {...creator, ...fallbackData});
      
    // First, try to get explicit UUID field
    let uuid = creator.uuid;
    
    // If no UUID field, check if id is actually a UUID
    if (!uuid && creator.id && typeof creator.id === 'string' && isUuid(creator.id)) {
      uuid = creator.id;
    }
    
    // For compatibility, keep a reference to any ID
    const id = uuid || creator.id || creator._id || '';
    
    return {
      id: id,
      uuid: uuid,
      name: name,
      username: 
        (creator.username && creator.username.trim()) ? creator.username : 
        (creator.name && creator.name.trim()) ? creator.name : 
        name
    };
  }

  // Fallback for unexpected data types
  return { 
    id: '', 
    name: extractNameFromId('', fallbackData) || 'Community Member', 
    username: extractNameFromId('', fallbackData) || 'Community Member'
  };
}

/**
 * Normalizes a comment author that could be a string or object
 * @param author - The comment author data from the API
 * @returns A normalized author representation
 */
export function normalizeCommentAuthor(
  author: string | { 
    id?: string; 
    _id?: string; 
    uuid?: string;
    name?: string; 
    username?: string;
    displayName?: string;
    fullName?: string;
    email?: string;
    [key: string]: unknown 
  } | null | undefined,
  fallbackData?: { [key: string]: unknown }
): string | { id: string; name: string; username?: string; email?: string; uuid?: string } {
  if (!author) {
    return 'Anonymous';
  }

  if (typeof author === 'string') {
    // If author is a string ID, try to extract a name
    if (author.match(/^[0-9a-f]{24}$/i) || isUuid(author)) {
      // It's an ID, look for a better name in fallback data
      const isUuidString = isUuid(author);
      return fallbackData 
        ? { 
            id: author, 
            name: extractNameFromId(author, fallbackData),
            uuid: isUuidString ? author : undefined
          }
        : 'Community Member';
    }
    return author; // Already a name string
  }

  if (typeof author === 'object' && author !== null) {
    // First, try to get explicit UUID field
    let uuid = author.uuid;
    
    // If no UUID field, check if id is actually a UUID
    if (!uuid && author.id && typeof author.id === 'string' && isUuid(author.id)) {
      uuid = author.id;
    }
    
    // For compatibility, keep a reference to any ID
    const id = uuid || author.id || author._id || '';

    // Create a consistent author object
    const authorObj: { 
      id: string; 
      name: string; 
      username?: string;
      email?: string;
      uuid?: string;
    } = {
      id: id,
      name: 'Anonymous',
      uuid: uuid
    };

    // Extract the best display name
    if (author.name && author.name.trim()) {
      authorObj.name = author.name;
    } else if (author.username && author.username.trim()) {
      authorObj.name = author.username;
      authorObj.username = author.username;
    } else if (author.email) {
      authorObj.name = author.email.split('@')[0];
      authorObj.email = author.email;
    } else if (author.displayName && author.displayName.trim()) {
      authorObj.name = author.displayName;
    } else if (author.fullName && author.fullName.trim()) {
      authorObj.name = author.fullName;
    } else if (fallbackData) {
      // Try extracting name from fallback data
      authorObj.name = extractNameFromId('', {...author, ...fallbackData});
    }

    return authorObj;
  }

  return fallbackData ? extractNameFromId('', fallbackData) : 'Community Member';
}

/**
 * Interface for raw comment data from API responses
 */
interface RawComment {
  id?: string;
  _id?: string;
  uuid?: string;
  text?: string;
  author?: string | { 
    id?: string; 
    name?: string; 
    username?: string; 
    email?: string;
    [key: string]: unknown;
  };
  authorId?: string;
  userId?: string;
  timestamp?: number;
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Interface for tool data context
 */
interface ToolDataContext {
  userId?: string;
  userDisplayName?: string;
  authorId?: string;
  authorName?: string;
  [key: string]: unknown;
}

/**
 * Normalizes a single comment to ensure consistent structure
 * @param comment - The comment data from the API
 * @returns A normalized comment object
 */
export function normalizeComment(comment: RawComment, toolData?: ToolDataContext): Comment {
  if (!comment) {
    return {
      id: Date.now().toString(),
      text: '',
      author: 'Anonymous',
      timestamp: Date.now()
    };
  }

  // First, try to get explicit UUID field
  let uuid = comment.uuid;
  
  // If no UUID field, check if id is actually a UUID
  if (!uuid && comment.id && typeof comment.id === 'string' && isUuid(comment.id)) {
    uuid = comment.id;
  }
  
  // For compatibility, keep a reference to any ID
  const commentId = uuid || comment.id || comment._id || Date.now().toString();
  
  const timestamp = comment.timestamp || 
    (comment.createdAt ? new Date(comment.createdAt).getTime() : Date.now());
  
  // Extract any additional user data that might help with name resolution
  const additionalUserData = {
    userId: comment.userId || comment.authorId,
    userDisplayName: comment.userDisplayName || comment.authorName,
    ...toolData // Pass tool data for additional context
  };
  
  return {
    id: commentId,
    uuid: uuid,  // Set UUID as the primary identifier
    text: comment.text || '',
    author: normalizeCommentAuthor(comment.author, additionalUserData),
    authorId: comment.authorId || comment.userId || '',
    timestamp: timestamp
  };
}

/**
 * Interface for raw tool data from API responses
 */
interface RawTool {
  id?: string;
  _id?: string;
  uuid?: string;
  name?: string;
  description?: string;
  url?: string;
  creator?: string | { 
    id?: string; 
    _id?: string;
    uuid?: string;
    name?: string; 
    username?: string;
    [key: string]: unknown; 
  };
  comments?: RawComment[];
  timestamp?: number;
  createdAt?: string;
  updatedAt?: string;
  upvotes?: number | string;
  wants?: number | string;
  bookmarked?: boolean;
  creatorName?: string;
  userName?: string;
  user?: {
    name?: string;
    id?: string;
    uuid?: string;
    [key: string]: unknown;
  };
  author?: string | {
    name?: string;
    username?: string;
    email?: string;
    [key: string]: unknown;
  };
  createdBy?: string | {
    name?: string;
    username?: string;
    email?: string;
    [key: string]: unknown;
  };
  userId?: string;
  userDisplayName?: string;
  authorName?: string;
  [key: string]: unknown;
}

/**
 * Normalizes a complete tool object to ensure consistent structure
 * @param tool - The tool data received from the API
 * @returns A normalized tool object
 */
export function normalizeTool(tool: RawTool): ExtendedTool {
  if (!tool) {
    throw new Error('Cannot normalize undefined or null tool');
  }

  // First, try to get explicit UUID field
  let uuid = tool.uuid;
  
  // If no UUID field, check if id is actually a UUID
  if (!uuid && tool.id && typeof tool.id === 'string' && isUuid(tool.id)) {
    uuid = tool.id;
  }
  
  // For compatibility, keep a reference to any ID
  const toolId = uuid || tool.id || tool._id || '';
  
  if (!toolId) {
    console.warn('Tool object is missing an ID', tool);
  }

  // Extract all possible name-related fields for better name resolution
  const nameFields = {
    creatorName: tool.creatorName,
    userName: tool.userName,
    user: tool.user,
    author: tool.author,
    createdBy: tool.createdBy,
    userId: tool.userId,
    userDisplayName: tool.userDisplayName,
    authorName: tool.authorName,
    // Add any other potential name fields from the tool object
    ...tool
  };

  // Normalize creator with all possible name info
  const normalizedCreator = normalizeCreator(tool.creator, nameFields);
  
  // Ensure user property matches the required structure in ExtendedTool
  const normalizedUser = tool.user ? {
    ...tool.user,
    name: tool.user.name || normalizedCreator.name || 'Anonymous' // Ensure name is always present
  } : undefined;

  // Normalize comments with tool data context for better name resolution
  const normalizedComments = Array.isArray(tool.comments)
    ? tool.comments.map(comment => normalizeComment(comment, nameFields))
    : [];

  // Ensure consistent timestamp
  const timestamp = tool.timestamp || 
    (tool.createdAt ? new Date(tool.createdAt).getTime() : Date.now());

  // Construct the normalized tool with UUID prioritized
  return {
    ...tool,
    name: tool.name || 'Unnamed Tool', // Ensure name is always present and required
    description: tool.description || '', // Ensure description is always present and required
    uuid: uuid,  // Set UUID as the primary identifier
    id: toolId,  // Keep id for backward compatibility
    creator: normalizedCreator,
    user: normalizedUser, // Use our normalized user object
    comments: normalizedComments,
    timestamp: timestamp,
    upvotes: Number(tool.upvotes || 0),
    wants: Number(tool.wants || 0),
    bookmarked: Boolean(tool.bookmarked),
    // Add createdAt and updatedAt if they don't exist
    createdAt: tool.createdAt || new Date(timestamp).toISOString(),
    updatedAt: tool.updatedAt || new Date(timestamp).toISOString(),
  };
}

/**
 * Interface for API responses containing tools
 */
interface ApiResponse {
  tools?: RawTool[];
  bookmarkedTools?: RawTool[];
  bookmarks?: RawTool[];
  postedTools?: RawTool[];
  [key: string]: unknown;
}

/**
 * Extracts tools array from various API response formats
 * @param response - Raw API response that might contain tools in different formats
 * @returns An array of raw tool objects
 */
export function extractToolsArray(response: RawTool[] | ApiResponse | null | undefined): RawTool[] {
  if (!response) {
    return [];
  }
  
  // Direct array
  if (Array.isArray(response)) {
    return response;
  }
  
  // Object containing tools array in different properties
  if (typeof response === 'object') {
    // Check all possible property names where tools might be stored
    if (response.tools && Array.isArray(response.tools)) {
      return response.tools;
    }
    if (response.bookmarkedTools && Array.isArray(response.bookmarkedTools)) {
      return response.bookmarkedTools;
    }
    if (response.bookmarks && Array.isArray(response.bookmarks)) {
      return response.bookmarks;
    }
    if (response.postedTools && Array.isArray(response.postedTools)) {
      return response.postedTools;
    }
  }
  
  // Fallback
  return [];
}

/**
 * Process an API response to extract and normalize tools
 * @param apiResponse - Raw response from the API (could be in various formats)
 * @returns Array of normalized tools
 */
export function processToolsResponse(apiResponse: RawTool[] | ApiResponse | null | undefined): ExtendedTool[] {
  const toolsArray = extractToolsArray(apiResponse);
  
  // Normalize each tool to ensure consistent structure
  return toolsArray.map(normalizeTool);
}