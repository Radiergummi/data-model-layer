'use strict';

/**
 * Abstract base service that provides a backend to handle model changes
 */
class Service {

  /**
   * Saves a model. If the model has an `id` property, it will be updated, created otherwise.
   *
   * @param   {Model} model
   * @returns {void}
   * @throws  {Error} if the save failed
   */
  async save ( model ) {}

  /**
   * Deletes a model if it has an `id` property, silently does nothing otherwise.
   *
   * @param {Model} model
   */
  async delete ( model ) {}

  /**
   * Fetches a model by ID
   *
   * @param   {Number} id
   * @returns {Model}
   * @throws  {Error}  if the fetch failed
   */
  async fetch ( id ) {}

  /**
   * Retrieves all models
   *
   * @returns {Model[]}
   */
  async all () {}

  /**
   * Retrieves all models filtered by a field condition
   *
   * @param   {String}  field
   * @param   {*}       value
   * @returns {Model[]}
   */
  async where ( field, value ) {}

  /**
   * Checks whether a model exists
   *
   * @param   {Number}  id
   * @returns {Boolean}
   */
  async exists ( id ) {
    return true;
  }
}

export default Service;
