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
exports.tsStrings = require("~/../tsrc/util/langstrings").languageStrings;

exports.genStringsDynamic = function (t) {
  var strings = [];
  var recurse = function (pfx) {
    return function (val) {
      if (typeof val == "object") {
        for (var key in val) {
          if (val.hasOwnProperty(key)) {
            recurse(pfx + "." + key)(val[key]);
          }
        }
      } else {
        strings.push(t(pfx)(val));
      }
      return strings;
    };
  };
  return recurse;
};
