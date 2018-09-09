'use strict';

import EventEmitter from '@/EventEmitter';

/**
 * Base model class
 */
class Model extends EventEmitter {

  /**
   * Creates a new model instance and populates its fields from an initializer object
   *
   * @param {Object} [fields]
   */
  constructor ( fields = {} ) {
    super();

    this._fields    = {};
    this._relations = new Map();

    for ( let [ name, value ] of Object.entries(fields) ) {
      this.set(name, value);
    }

    this.emit('created', this);
  }

  /**
   * Sets a field on the model
   *
   * @param   {String} name
   * @param   {*}      value
   */
  set ( name, value ) {
    this._fields[ name ] = value;

    if ( !this.constructor._mergedGuardedFields.includes(name) ) {
      const self = this;

      Object.defineProperty(self, name, {
        enumerable: true,

        get () {
          return self.get(name);
        },

        set ( value ) {
          self._fields[ name ] = value;
          this.emit('updated', this);
          this.emit('changed', this);
        },
      });
    }
  }

  /**
   * Relates another model on a named property
   *
   * @param   {Model}  Model  Model to relate
   * @param   {String} [name] Optional property name
   * @returns {void}
   */
  relate ( Model, name = Model.name.toLowerCase() + 's' ) {

    // If there are no relations for this model yet, create an empty array for them
    if ( !this._relations.has(Model) ) {
      this._relations.set(Model, new Set);
    }

    // If the model or property name is not a guarded field, define the public property
    if ( !this.constructor._mergedGuardedFields.includes(name) ) {
      const self = this;

      Object.defineProperty(self, name, {
        enumerable: true,

        get () {
          return self.get(Model);
        },

        set ( value ) {
          return self.with(value);
        },
      });
    }
  }

  /**
   * Adds a relation to the model
   *
   * @param {Model} related
   */
  with ( related ) {

    /** @type {Set} */
    const relatedStore = this._relations.get(related.constructor);

    if ( !relatedStore ) {
      throw new Error(`Fields must match the models`);
    }

    // Add the item to the related set
    relatedStore.add(related);

    // Remove the related item if it gets deleted
    related.addListener('deleting', () => relatedStore.delete(related));
    related.addListener('changed', () => this.emit('changed', this));

    this.emit('updated', this);
    this.emit('changed', this);
  }

  /**
   * Retrieves a field from the model. If there is no field with the name and the passed name
   * matches that of a model, and we have a relation of that name, returns the relation.
   * @param   {String} name
   * @param   {*}      fallback
   * @returns {*}
   */
  get ( name, fallback = null ) {
    if ( this._fields.hasOwnProperty(name) ) {
      return this._fields[ name ];
    }

    if ( this._relations.has(name) ) {
      return this._relations.get(name);
    }

    const modelName = name.substring(0, 1).toUpperCase() + name.substr(1, -name.length - 2);

    if ( this._relations.has(modelName) ) {
      return this._relations.get(modelName);
    }

    return fallback;
  }

  /**
   * Hook for children classes that is invoked before saving a model.
   * Equivalent to listening on `saving`.
   */
  beforeSave () {}

  /**
   * Hook for children classes that is invoked before deleting a model
   * Equivalent to listening on `deleting`.
   */
  beforeDelete () {}

  /**
   * Saves the model by proxying to the service
   */
  save () {
    this.emit('saving', this);
    this.beforeSave();
    this.constructor._service.save(this);
    this.emit('saved', this);
  }

  /**
   * Deletes the model by proxying to the service
   */
  delete () {
    this.emit('deleting', this);
    this.beforeDelete();
    this.constructor._service.delete(this);
    this.emit('deleted', this);
  }

  /**
   * Retrieves all related model types (note: not the models themselves)
   *
   * @returns {IterableIterator<Model>}
   */
  get related () {
    return this._relations.keys();
  }

  /**
   * Holds all fields to be guarded from automatic assigning. To be filled in children classes.
   *
   * @returns {String[]}
   */
  static get guarded () {
    return [];
  }

  /**
   * Holds all required guarded, eg. non-assignable fields to prevent breaking models
   *
   * @returns {String[]}
   * @private
   */
  static get _strictGuardedFields () {
    return [
      'constructor',
      'set',
      'relate',
      'with',
      'get',
      'beforeSave',
      'beforeDelete',
      'save',
      'delete',
      'related',
    ];
  }

  /**
   * Retrieves both strict guarded and children guarded fields
   *
   * @returns {String[]}
   * @private
   */
  static get _mergedGuardedFields () {
    return this._strictGuardedFields.concat(this.guarded);
  }

  /**
   * Retrieves the model backend service. This needs to be set by children classes
   *
   * @returns {Service}
   * @private
   */
  static get _service () {
    return null;
  }

  /**
   * Retrieves all models from the service
   *
   * @returns {Model[]}
   */
  static async all () {
    const results = await this._service.all();

    return results.map(fields => new this(fields));
  }

  /**
   * Retrieves all models from the service that match a field condition
   *
   * @param   {String}  field
   * @param   {*}       value
   * @returns {Model[]}
   */
  static async where ( field, value ) {
    const results = await this._service.where(field, value);

    return results.map(fields => new this(fields));
  }

  /**
   * Finds a specific model by ID
   *
   * @param   {Number} id
   * @returns {Model}
   */
  static async find ( id ) {
    return new this(await this._service.fetch(id));
  }
}

export default Model;
