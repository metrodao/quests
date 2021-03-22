import React from "react";
import { CRYPTOS, QUEST_STATUS } from "../../constants";

import {
  Box,
  Button,
  DateRangePicker,
  DropDown,
  Field,
  IconClose,
  SearchInput,
  Split,
  Tag,
  TextInput,
  TokenBadge,
  _AutoComplete as AutoComplete,
} from "@1hive/1hive-ui";
import { debounce } from "../../utils/class-util";

const currencyOptions = CRYPTOS.map((c) => c.symb);
const questStatusOptions = ["All"].concat(QUEST_STATUS.map((x) => x.name));
const tagSuggestion = ["FrontEnd", "Angular", "React", "CoolStuff"];
const defaultFilter = {
  search: "",
  status: "All",
  expiration: { start: null, end: null },
  tags: [],
  minBounty: 0,
  bountyCurrency: currencyOptions[0],
  showFull: false,
};

export default class QuestFilter extends React.Component {
  state = defaultFilter;

  constructor(props) {
    super(props);
    this.tagRef = React.createRef();
  }

  onTagDelete = (i) => {
    const tags = this.state.tags.slice(0);
    tags.splice(i, 1);
    this.setFilter({ tags });
  };

  onTagAddition = (tag) => {
    if (!this.state.tags.includes(tag)) {
      const tags = this.state.tags.concat(tag);
      this.setFilter({ tags });
    }
    this.tagRef.current.value = "";
  };

  setFilter = (filter, shouldDebounce) => {
    let callback = () => this.props.onFilterChange(this.state);
    this.setState(
      { ...this.state, ...filter },
      shouldDebounce ? debounce(callback, 500) : callback
    );
  };

  render() {
    return (
      <Box heading="Filters" className="fit-content mb-16">
        <div className="m-16">
          <Field label="Search">
            <SearchInput
              value={this.state.search}
              onChange={(x) => this.setFilter({ search: x }, true)}
              wide
            />
          </Field>
        </div>
        <div className="m-16">
          <Field label="Status">
            <DropDown
              items={questStatusOptions}
              selected={questStatusOptions.indexOf(this.state.status)}
              onChange={(x) =>
                this.setFilter({ status: questStatusOptions[x] })
              }
              wide
            />
          </Field>
        </div>
        <div className="m-16">
          <Field label="Expiration">
            <DateRangePicker
              startDate={this.state.expiration.start}
              endDate={this.state.expiration.end}
              onChange={(val) => this.setFilter({ expiration: val })}
              wide
            />
          </Field>
        </div>
        <div className="m-16">
          <Field label="Min bounty">
            <div className="inline-flex">
              <TextInput
                value={this.state.minBounty}
                onChange={(event) => {
                  this.setFilter({ minBounty: event.target.value }, true);
                }}
                type="number"
              />
              <TokenBadge
                symbol="HNY"
                address="0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9"
                networkType="dai"
                size="normal"
              />
              {/* <DropDown
                items={currencyOptions}
                selected={currencyOptions.indexOf(this.state.bountyCurrency)}
                onChange={(x) =>
                  this.setFilter({ bountyCurrency: currencyOptions[x] })
                }
              ></DropDown> */}
            </div>
          </Field>
        </div>
        <div className="m-16">
          <Field label="Tags">
            <AutoComplete
              items={tagSuggestion.filter(
                (name) =>
                  this.state.searchTags &&
                  name
                    .toLowerCase()
                    .indexOf(this.state.searchTags.toLowerCase()) > -1
              )}
              onChange={(val) => this.setState({ searchTags: val })}
              onSelect={this.onTagAddition}
              ref={this.tagRef}
              
              wide
            />
            {this.state.tags.map((x, i) => (
              <Tag
                key={i}
                label={x}
                icon={<IconClose />}
                onClick={() => this.onTagDelete(i)}
                className="pointer"
              />
            ))}
          </Field>
          <Button
            icon={<IconClose />}
            label="clear"
            wide
            onClick={() => this.setFilter(defaultFilter)}
          />
        </div>
      </Box>
    );
  }
}