'use strict';

import Service from '@/Service';

/**
 * Provides a service that works with local data by using a store array to hold all data.
 * Good match for mocking during testing, prototyping or for hooking into an existing 
 * infrastructure.
 */
class LocalService extends Service {
  constructor ( store ) {
    super();

    this._store = store;
  }

  async exists ( id ) {
    return !!this._store.find(model => model.id === id);
  }

  async fetch ( id ) {
    return this._store.find(model => model.id === id);
  }

  async all () {
    return this._store;
  }

  async where ( field, value ) {
    return this._store.filter(model => model[ field ] === value);
  }

  async save ( model ) {
    if ( model.hasOwnProperty('id') && typeof model.id === 'number' ) {
      return this.update(model);
    }

    this._store.push(model);
  }

  async update ( model ) {
    const existingModel = this.fetch(model.id);

    for ( let [ key, value ] of Object.entries(model) ) {
      existingModel[ key ] = value;
    }

    for ( let relatedModel of model.related ) {
      existingModel.relate(relatedModel);

      const relatedItems = model.get(relatedModel);

      for ( let relatedItem of relatedItems ) {
        model.with(relatedModel, relatedItem);
      }
    }
  }

  async delete ( model ) {
    if ( !model.hasOwnProperty('id') ) {
      return;
    }

    if ( !this.exists(model.id) ) {
      return;
    }

    this._store = this._store.filter(item => item.id === model.id);
  }
}

export default LocalService;
