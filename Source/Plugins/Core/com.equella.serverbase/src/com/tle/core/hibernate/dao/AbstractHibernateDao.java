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

package com.tle.core.hibernate.dao;

import com.tle.annotation.NonNullByDefault;
import com.tle.core.hibernate.HibernateService;
import javax.inject.Inject;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.orm.hibernate5.HibernateCallback;
import org.springframework.orm.hibernate5.HibernateTemplate;

@NonNullByDefault
public abstract class AbstractHibernateDao {
  @Inject private HibernateService hibernateService;

  private SessionFactory lastFactory;

  private HibernateTemplate template;

  protected synchronized HibernateTemplate getHibernateTemplate() {
    SessionFactory newFactory =
        hibernateService.getTransactionAwareSessionFactory(getFactoryName(), isSystemDataSource());
    if (!newFactory.equals(lastFactory)) {
      lastFactory = newFactory;
      template =
          new HibernateTemplate(newFactory) {
            // Removed the method param, since it no longer exists in hib5:  boolean
            // enforceNewSession
            // TODO need to understand the impact of the removal
            @Override
            protected Object doExecute(HibernateCallback action, boolean enforceNativeSession)
                throws DataAccessException {
              Thread currentThread = Thread.currentThread();
              ClassLoader origLoader = currentThread.getContextClassLoader();
              try {
                currentThread.setContextClassLoader(Session.class.getClassLoader());
                return super.doExecute(action, enforceNativeSession);
              } finally {
                currentThread.setContextClassLoader(origLoader);
              }
            }
          };
      // TODO - no longer exists in hib5.  Need to review
      // template.setAllowCreate(false);

      template.setExposeNativeSession(true);
    }
    return template;
  }

  protected boolean isSystemDataSource() {
    return false;
  }

  protected String getFactoryName() {
    return "main"; //$NON-NLS-1$
  }
}
