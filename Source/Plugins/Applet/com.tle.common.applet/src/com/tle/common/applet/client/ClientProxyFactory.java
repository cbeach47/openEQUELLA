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

package com.tle.common.applet.client;

import com.tle.common.applet.SessionHolder;
import java.lang.reflect.Proxy;
import java.net.MalformedURLException;
import java.net.URL;

// TODO removed as a workaround to see if Spring 5 will work.
// import org.springframework.remoting.httpinvoker.AbstractHttpInvokerRequestExecutor;
// import org.springframework.remoting.httpinvoker.HttpInvokerProxyFactoryBean;
// import org.springframework.remoting.httpinvoker.SimpleHttpInvokerRequestExecutor;
// import org.springframework.remoting.support.RemoteInvocation;

public final class ClientProxyFactory {
  public static <T> T createSessionProxy(ClientService client, Class<T> api, String service) {
    return createSessionProxy(client.getSession(), api, client.getServerURL(), service);
  }

  public static <T> T createSessionProxy(
      SessionHolder sessionHolder, Class<T> api, URL url, String service) {
    try {
      url = new URL(url, url.getPath() + service);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
    return create(sessionHolder, api, createProxy(api, url));
  }

  @SuppressWarnings("unchecked")
  public static <T> T createProxy(Class<T> api, URL url) {
    //    HttpInvokerProxyFactoryBean factory = new HttpInvokerProxyFactoryBean();
    //    factory.setServiceUrl(url.toString());
    //    factory.setServiceInterface(api);
    //    AbstractHttpInvokerRequestExecutor requestExecutor =
    //        new PluginAwareSimpleHttpInvokerRequestExecutor();
    //    factory.setHttpInvokerRequestExecutor(requestExecutor);
    //    factory.setBeanClassLoader(api.getClassLoader());
    //    factory.afterPropertiesSet();
    //    return (T) factory.getObject();
    return null;
  }

  //  public static class PluginAwareSimpleHttpInvokerRequestExecutor
  //      extends SimpleHttpInvokerRequestExecutor {
  //    @Override
  //    protected ObjectInputStream createObjectInputStream(InputStream is, String codebaseUrl)
  //        throws IOException {
  //      return new PluginAwareObjectInputStream(is);
  //    }
  //
  //    @Override
  //    protected void writeRemoteInvocation(RemoteInvocation invocation, OutputStream os)
  //        throws IOException {
  //      ObjectOutputStream oos = new PluginAwareObjectOutputStream(decorateOutputStream(os));
  //      try {
  //        doWriteRemoteInvocation(invocation, oos);
  //        oos.flush();
  //      } finally {
  //        oos.close();
  //      }
  //    }
  //  }

  @SuppressWarnings("unchecked")
  private static <T> T create(SessionHolder session, Class<T> api, Object iface) {
    ClientProxy handler = new ClientProxy(session, iface);
    return (T) Proxy.newProxyInstance(api.getClassLoader(), new Class[] {api}, handler);
  }

  private ClientProxyFactory() {
    throw new Error();
  }
}
