import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mongoose plugin that adds a uuid field to documents
 * This helps maintain compatibility with MongoDB ObjectIds while moving toward UUID-based lookups
 * 
 * @param {mongoose.Schema} schema - The mongoose schema to apply the plugin to
 * @param {object} options - Plugin options
 */
export function uuidPlugin(schema: mongoose.Schema, options: { index?: boolean } = {}) {
  // Add the uuid field to the schema
  schema.add({
    uuid: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4(),
      index: options.index !== false // Index for faster lookups, true by default
    }
  });
  
  // Generate UUID on pre-save if not already set
  schema.pre('save', function(next) {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
    next();
  });

  // Make the uuid field visible in all JSON representations
  schema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      // Include both uuid and _id for backward compatibility
      // Eventually, clients should transition to using uuid exclusively
      ret.id = ret.uuid || ret._id.toString();
      return ret;
    }
  });
}

export default uuidPlugin;