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

package com.tle.web.connectors.service;

import com.tle.common.security.SettingsTarget;
import com.tle.core.guice.Bind;
import com.tle.core.settings.security.AbstractSettingsPrivilegeTreeProvider;
import com.tle.web.resources.ResourcesService;
import javax.inject.Singleton;

@Bind
@Singleton
@SuppressWarnings("nls")
public class ConnectorManagementPrivilegeTreeProvider
    extends AbstractSettingsPrivilegeTreeProvider {
  public ConnectorManagementPrivilegeTreeProvider() {
    super(
        Type.MANAGEMENT_PAGE,
        ResourcesService.getResourceHelper(ConnectorManagementPrivilegeTreeProvider.class)
            .key("securitytree.manageconnectors"),
        new SettingsTarget("connectors"));
  }
}
