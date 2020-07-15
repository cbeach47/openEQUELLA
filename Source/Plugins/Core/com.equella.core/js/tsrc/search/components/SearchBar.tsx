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
import {
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
} from "@material-ui/core";
import * as React from "react";
import { useCallback, useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import { Close } from "@material-ui/icons";
import { debounce } from "lodash";
import { languageStrings } from "../../util/langstrings";

const ENTER_KEY_CODE = 13;
const ESCAPE_KEY_CODE = 27;

interface SearchBarProps {
  /**
   * Callback fired when the user stops typing (debounced for 500 milliseconds).
   * @param query The string to search.
   */
  onChange: (query: string) => void;
}

/**
 * Debounced searchbar component to be used in the Search Page.
 * It also includes an adornment which allows clearing the search field in a single click.
 * This component does not handle the API query itself,
 * that should be done in the parent component with the onChange callback.
 */
export default function SearchBar({ onChange }: SearchBarProps) {
  const searchStrings = languageStrings.searchpage;
  const [rawSearchMode, setRawSearchMode] = useState<boolean>(false);
  const [queryString, setQuery] = React.useState<string>("");
  const strings = languageStrings.searchpage;
  const callOnChange = (query: string) => {
    const trimmedQuery = query.trim();
    onChange(trimmedQuery + (rawSearchMode || !trimmedQuery ? "" : "*"));
  };
  /**
   * uses lodash to debounce the search query by half a second
   */
  const debouncedQuery = useCallback(debounce(callOnChange, 500), [
    onChange,
    rawSearchMode,
  ]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.keyCode) {
      case ESCAPE_KEY_CODE:
        event.preventDefault();
        handleQueryChange("");
        break;
      case ENTER_KEY_CODE:
        event.preventDefault();
        debouncedQuery(queryString);
        break;
    }
  };
  const handleQueryChange = (query: string) => {
    setQuery(query);
    if (!rawSearchMode) {
      debouncedQuery(query);
    }
  };

  return (
    <Grid container direction="row">
      <Grid item xs={10}>
        <TextField
          id="searchBar"
          helperText={rawSearchMode ? strings.pressEnterToSearch : " "}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: queryString.length > 0 && (
              <IconButton onClick={() => handleQueryChange("")} size="small">
                <Close />
              </IconButton>
            ),
          }}
          fullWidth
          onChange={(event) => {
            handleQueryChange(event.target.value);
          }}
          variant="standard"
          value={queryString}
        />
      </Grid>
      {/* inline style ensures the raw search controls align vertically to the searchbar*/}
      <Grid xs={2} item style={{ alignSelf: "center" }}>
        {/* inline style ensures that the raw search control justifies to the right of it's grid item*/}
        <Tooltip
          title={searchStrings.rawSearchTooltip}
          style={{ float: "right" }}
        >
          <FormControlLabel
            labelPlacement="start"
            label={searchStrings.rawSearch}
            control={
              <Switch
                id="rawSearch"
                size="small"
                onChange={(_, checked) => setRawSearchMode(checked)}
                value={rawSearchMode}
                name={searchStrings.rawSearch}
              />
            }
          />
        </Tooltip>
      </Grid>
    </Grid>
  );
}
