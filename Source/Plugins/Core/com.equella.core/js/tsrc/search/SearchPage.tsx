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
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  templateDefaults,
  templateError,
  TemplateUpdateProps,
} from "../mainui/Template";
import { languageStrings } from "../util/langstrings";
import { Grid } from "@material-ui/core";
import {
  defaultPagedSearchResult,
  defaultSearchOptions,
  searchItems,
  SearchOptions,
} from "./SearchModule";
import SearchBar from "../search/components/SearchBar";
import * as OEQ from "@openequella/rest-api-client";
import { generateFromError } from "../api/errors";
import {
  getSearchSettingsFromServer,
  SearchSettings,
  SortOrder,
} from "../settings/Search/SearchSettingsModule";
import { RefineSearchPanel } from "./components/RefineSearchPanel";
import { SearchResultList } from "./components/SearchResultList";
import { CollectionSelector } from "./components/CollectionSelector";
import { Collection } from "../modules/CollectionsModule";
import { useHistory } from "react-router";

const SearchPage = ({ updateTemplate }: TemplateUpdateProps) => {
  const searchStrings = languageStrings.searchpage;

  const history = useHistory();

  const [searchOptions, setSearchOptions] = useState<SearchOptions>(
    // If the user has gone 'back' to this page, then use their previous options. Otherwise
    // we start fresh - i.e. if a new navigation to Search Page.
    (history.location.state as SearchOptions) ?? defaultSearchOptions
  );
  const [pagedSearchResult, setPagedSearchResult] = useState<
    OEQ.Common.PagedResult<OEQ.Search.SearchResultItem>
  >(defaultPagedSearchResult);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  /**
   * Update the page title and retrieve Search settings.
   */
  useEffect(() => {
    updateTemplate((tp) => ({
      ...templateDefaults(searchStrings.title)(tp),
    }));

    // Show spinner before calling API to retrieve Search settings.
    setShowSpinner(true);
    getSearchSettingsFromServer().then((settings: SearchSettings) => {
      handleSortOrderChanged(
        searchOptions.sortOrder ?? settings.defaultSearchSort
      );
    });
  }, []);

  /**
   * Trigger a search when state values change, but skip the initial values.
   */
  const isInitialSearch = useRef(true);
  useEffect(() => {
    if (isInitialSearch.current) {
      isInitialSearch.current = false;
    } else {
      search();
    }
  }, [searchOptions]);

  const handleError = (error: Error) => {
    updateTemplate(templateError(generateFromError(error)));
  };

  /**
   * Search items with specified search criteria and show a spinner when the search is in progress.
   */
  const search = (): void => {
    setShowSpinner(true);
    searchItems(searchOptions)
      .then((items: OEQ.Common.PagedResult<OEQ.Search.SearchResultItem>) => {
        setPagedSearchResult(items);
        history.replace({ ...history.location, state: searchOptions });
        // scroll back up to the top of the page
        window.scrollTo(0, 0);
      })
      .catch(handleError)
      .finally(() => setShowSpinner(false));
  };

  const handleSortOrderChanged = (order: SortOrder) =>
    setSearchOptions({ ...searchOptions, sortOrder: order });

  const handleQueryChanged = (query: string) =>
    setSearchOptions({ ...searchOptions, query: query, currentPage: 0 });

  const handleCollectionSelectionChanged = (collections: Collection[]) => {
    setSearchOptions({
      ...searchOptions,
      collections: collections,
      currentPage: 0,
    });
  };

  const handlePageChanged = (page: number) =>
    setSearchOptions({ ...searchOptions, currentPage: page });

  const handleRowsPerPageChanged = (rowsPerPage: number) =>
    setSearchOptions({
      ...searchOptions,
      currentPage: 0,
      rowsPerPage: rowsPerPage,
    });

  const handleRawModeChanged = (rawMode: boolean) =>
    setSearchOptions({ ...searchOptions, rawMode: rawMode });

  return (
    <Grid container spacing={2}>
      <Grid item xs={9}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SearchBar
              query={searchOptions.query ?? ""}
              rawMode={searchOptions.rawMode}
              onQueryChange={handleQueryChanged}
              onRawModeChange={handleRawModeChanged}
              doSearch={search}
            />
          </Grid>
          <Grid item xs={12}>
            <SearchResultList
              searchResultItems={pagedSearchResult.results}
              showSpinner={showSpinner}
              paginationProps={{
                count: pagedSearchResult.available,
                currentPage: searchOptions.currentPage,
                rowsPerPage: searchOptions.rowsPerPage,
                onPageChange: handlePageChanged,
                onRowsPerPageChange: handleRowsPerPageChanged,
              }}
              orderSelectProps={{
                value: searchOptions.sortOrder,
                onChange: handleSortOrderChanged,
              }}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={3}>
        <RefineSearchPanel>
          <CollectionSelector
            onSelectionChange={handleCollectionSelectionChanged}
            value={searchOptions.collections}
          />
        </RefineSearchPanel>
      </Grid>
    </Grid>
  );
};

export default SearchPage;
