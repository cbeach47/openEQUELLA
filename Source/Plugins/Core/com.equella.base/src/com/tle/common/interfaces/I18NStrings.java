/*
 * Copyright 2017 Apereo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tle.common.interfaces;

import java.util.Map;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public interface I18NStrings
{
	Map<String, String> getStrings();

	I18NString asI18NString(String defaultText);

	I18NStrings maybeNull();

	@Override
	String toString();
}
