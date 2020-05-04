/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0, (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import axios from "axios";
import { Dispatch } from "redux";
import { Action, ActionCreator, AsyncActionCreators } from "typescript-fsa";
import {
  ReducerBuilder,
  reducerWithInitialState,
} from "typescript-fsa-reducers";
import { Entity } from "../api/Entity";
import { Config } from "../config";
import { actionCreator, wrapAsyncWorker } from "../util/actionutil";
import { IDictionary } from "../util/dictionary";
import { encodeQuery } from "../util/encodequery";
import { languageStrings } from "../util/langstrings";

export function extendedEntityService<
  E extends Entity,
  XC extends {},
  XW extends {}
>(
  entityType: string,
  extCrud?: XC,
  extWorkers?: XW,
  extValidate?: (entity: E, errors: IDictionary<string>) => void
): EntityService<E, XC, XW> {
  const baseActions = entityCrudActions<E>(entityType);
  const baseWorkers = entityWorkers(baseActions, extValidate);
  const actions: EntityCrudActions<E> & XC = Object.assign(
    {},
    baseActions,
    extCrud
  );
  const workers: EntityWorkers<E> & XW = Object.assign(
    {},
    baseWorkers,
    extWorkers
  );

  return {
    actions: actions,
    workers: workers,
    reducer: entityReducerBuilder(baseActions),
  };
}

export function entityService<E extends Entity>(
  entityType: string
): EntityService<E, {}, {}> {
  return extendedEntityService<E, {}, {}>(entityType);
}

export const entityStrings = languageStrings.entity;

export interface EditEntityStateProps<E extends Entity> {
  loading?: boolean;
  entity: E | undefined;
}

export interface EditEntityDispatchProps<E extends Entity> {
  loadEntity: (uuid: string) => Promise<{ result: E }>;
  saveEntity: (entity: E) => Promise<{ result: E }>;
  modifyEntity: (entity: E) => Action<{ entity: E }>;
  validateEntity: (entity: E) => Promise<IDictionary<string>>;
}

export interface EditEntityProps<E extends Entity>
  extends EditEntityStateProps<E>,
    EditEntityDispatchProps<E> {
  uuid?: string;
}

export interface PartialEntityState<E extends Entity> {
  query?: string;
  editingEntity?: E;
  loading?: boolean;
}

export interface EntityState<E extends Entity> extends PartialEntityState<E> {
  loading: boolean;
}

function baseValidate<E extends Entity>(entity: E): IDictionary<string> {
  const validationErrors: IDictionary<string> = {};
  if (!entity.name) {
    validationErrors["name"] = "Name is required";
  }
  return validationErrors;
}

interface EntityCrudActions<E extends Entity> {
  entityType: string;
  create: AsyncActionCreators<{ entity: E }, { result: E }, void>;
  checkPrivs: AsyncActionCreators<{ privilege: string[] }, string[], void>;
  update: AsyncActionCreators<{ entity: E }, { result: E }, void>;
  read: AsyncActionCreators<{ uuid: string }, { result: E }, void>;
  delete: AsyncActionCreators<{ uuid: string }, { uuid: string }, void>;
  validate: AsyncActionCreators<{ entity: E }, IDictionary<string>, void>;
  // This is for temp modifications.  E.g. uncommitted changes before save
  modify: ActionCreator<{ entity: E }>;
}

interface EntityWorkers<E extends Entity> {
  entityType: string;
  create: (
    dispatch: Dispatch<any>,
    params: { entity: E }
  ) => Promise<{ result: E }>;
  update: (
    dispatch: Dispatch<any>,
    params: { entity: E }
  ) => Promise<{ result: E }>;
  read: (
    dispatch: Dispatch<any>,
    params: { uuid: string }
  ) => Promise<{ result: E }>;
  delete: (
    dispatch: Dispatch<any>,
    params: { uuid: string }
  ) => Promise<{ uuid: string }>;
  validate: (
    dispatch: Dispatch<any>,
    params: { entity: E }
  ) => Promise<IDictionary<string>>;
  checkPrivs: (
    dispatch: Dispatch<any>,
    params: { privilege: string[] }
  ) => Promise<string[]>;
}

interface EntityService<E extends Entity, XC extends {}, XW extends {}> {
  actions: EntityCrudActions<E> & XC;
  workers: EntityWorkers<E> & XW;
  reducer: ReducerBuilder<PartialEntityState<E>, PartialEntityState<E>>;
}

function entityCrudActions<E extends Entity>(
  entityType: string
): EntityCrudActions<E> {
  const createUpdate = actionCreator.async<{ entity: E }, { result: E }, void>(
    "SAVE_" + entityType
  );
  return {
    entityType,
    create: createUpdate,
    update: createUpdate,
    read: actionCreator.async<{ uuid: string }, { result: E }, void>(
      "LOAD_" + entityType
    ),
    delete: actionCreator.async<{ uuid: string }, { uuid: string }, void>(
      "DELETE_" + entityType
    ),
    modify: actionCreator<{ entity: E }>("MODIFY_" + entityType),
    validate: actionCreator.async<{ entity: E }, IDictionary<string>, void>(
      "VALIDATE_" + entityType
    ),
    checkPrivs: actionCreator.async<{ privilege: string[] }, string[], void>(
      "CHECKPRIVS_" + entityType
    ),
  };
}

function entityWorkers<E extends Entity>(
  entityCrudActions: EntityCrudActions<E>,
  extValidate?: (entity: E, errors: IDictionary<string>) => void
): EntityWorkers<E> {
  const entityLower = entityCrudActions.entityType.toLowerCase();
  const createUpdate = wrapAsyncWorker(
    entityCrudActions.update,
    (param): Promise<{ result: E }> => {
      const { entity } = param;
      // FIXME: edit a specific locale:
      const postEntity = Object.assign({}, entity, {
        nameStrings: { en: entity.name },
        descriptionStrings: { en: entity.description },
      });
      if (entity.uuid) {
        const url = `${Config.baseUrl}api/${entityLower}/${entity.uuid}`;
        return axios
          .put<{}>(url, postEntity)
          .then((_) => axios.get<E>(url))
          .then((res) => ({ result: res.data }));
      } else {
        return axios
          .post<{}>(`${Config.baseUrl}api/${entityLower}/`, postEntity)
          .then((res) => res.headers["location"])
          .then((loc) => axios.get<E>(loc))
          .then((res) => ({ result: res.data }));
      }
    }
  );

  const validate = function (entity: E): IDictionary<string> {
    const errors = baseValidate(entity);
    if (extValidate) {
      extValidate(entity, errors);
    }
    return errors;
  };

  return {
    entityType: entityCrudActions.entityType,
    create: createUpdate,
    update: createUpdate,
    read: wrapAsyncWorker(
      entityCrudActions.read,
      (param): Promise<{ result: E }> => {
        const { uuid } = param;
        return axios
          .get<E>(`${Config.baseUrl}api/${entityLower}/${uuid}`)
          .then((res) => ({ result: res.data }));
      }
    ),
    delete: wrapAsyncWorker(
      entityCrudActions.delete,
      (param): Promise<{ uuid: string }> => {
        const { uuid } = param;
        return axios
          .delete(`${Config.baseUrl}api/${entityLower}/${uuid}`)
          .then((res) => ({ uuid }));
      }
    ),
    validate: wrapAsyncWorker(
      entityCrudActions.validate,
      (param): Promise<IDictionary<string>> => {
        return Promise.resolve(validate(param.entity));
      }
    ),
    checkPrivs: wrapAsyncWorker(
      entityCrudActions.checkPrivs,
      (param): Promise<string[]> => {
        const { privilege } = param;
        const qs = encodeQuery({ privilege });
        return axios
          .get<string[]>(`${Config.baseUrl}api/acl/privilegecheck${qs}`)
          .then((res) => res.data);
      }
    ),
  };
}

function entityReducerBuilder<E extends Entity>(
  entityCrudActions: EntityCrudActions<E>
): ReducerBuilder<PartialEntityState<E>, PartialEntityState<E>> {
  const initialEntityState: PartialEntityState<E> = {
    query: "",
    loading: false,
  };

  return reducerWithInitialState(initialEntityState)
    .case(entityCrudActions.read.started, (state, data) => {
      return { ...state, editingEntity: undefined, loading: true };
    })
    .case(entityCrudActions.read.done, (state, success) => {
      return { ...state, editingEntity: success.result.result, loading: false };
    })
    .case(entityCrudActions.read.failed, (state, failure) => {
      return { ...state, loading: false };
    })
    .case(entityCrudActions.update.started, (state, data) => {
      return state;
    })
    .case(entityCrudActions.update.done, (state, success) => {
      return state;
    })
    .case(entityCrudActions.update.failed, (state, failure) => {
      return state;
    })
    .case(entityCrudActions.modify, (state, payload) => {
      return { ...state, editingEntity: payload.entity };
    })
    .case(entityCrudActions.validate.done, (state, success) => {
      const editingEntity = Object.assign({}, state.editingEntity, {
        validationErrors: success.result,
      });
      return { ...state, editingEntity };
    });
}
