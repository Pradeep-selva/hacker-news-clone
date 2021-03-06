import React, { Component } from "react";
import axios from "axios";
import "./App.css";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
import {
  DEFAULT_QUERY,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP
} from '../../Constants/constants';
import { options } from '../../Constants/sorts';
import Header from '../Header/index';
import Table from '../Table/index';
import Search from '../Search/index';
import Loading from '../Loading/index';


class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
      pageSearch: '',
      searchKey: '',
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      sortCriteria: '',
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchTopStories = this.fetchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onPageSearch = this.onPageSearch.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    this.setState({
      sortKey: sortKey.value,
      sortCriteria: sortKey.label
    });
  }

  needsToSearchTopStories(searchKey) {
    return !this.state.result[searchKey]
  }

  fetchTopStories(searchTerm, page = 0, isMore = false) {
    this.setState({ isLoading: true });

    if (!isMore) {
      this.setState({
        sortKey: 'NONE',
        sortCriteria: ''
      })
    }

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }))
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm))
      this.fetchTopStories(searchTerm);
    event.preventDefault();
  }

  setSearchTopStories(results) {
    const { hits, page } = results;
    const { searchKey, result } = this.state;

    const oldHits = result && result[searchKey] ?
      result[searchKey].hits :
      [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      result: {
        ...result,
        [searchKey]: {
          hits: updatedHits,
          page
        }
      },
      isLoading: false,
    });
  }

  onDismiss(id) {
    const { searchKey, result } = this.state;
    const { hits, page } = result[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedList = hits.filter(isNotId);
    this.setState({
      result: {
        ...result,
        [searchKey]: {
          hits: updatedList,
          page
        }
      }
    });
  }

  onSearch(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onPageSearch(event) {
    this.setState({ pageSearch: event.target.value })
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchTopStories(searchTerm);
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      pageSearch,
      result,
      searchKey,
      error,
      isLoading,
      sortKey,
      sortCriteria
    } = this.state;

    const page = (
      result &&
      result[searchKey] &&
      result[searchKey].page
    ) || 0;

    const list = (
      result &&
      result[searchKey] &&
      result[searchKey].hits
    ) || [];

    if (error) {
      return (
        <div className="Page">
          <div className="interactions">
            <p>Something went wrong...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="page">
        <div className="interactions">
          <h1 className="fadein">Hacker News Clone</h1>
          <h1>{(result && result.page)}</h1>
          <Search
            onSearch={this.onSearch}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Header
          sortCriteria={sortCriteria}
        />
        <div className="in-page">
          <input
            type="text" style={{ width: '200px' }}
            placeholder="Search in page"
            onChange={this.onPageSearch}
          >
          </input>
          <div className="dropdown">
            <Dropdown
              options={options}
              onChange={this.onSort}
              value={sortKey}
              placeholder='Sort'
            />
          </div>

        </div>
        {
          result &&
          <Table
            list={list}
            searchTerm={pageSearch}
            onDismiss={this.onDismiss}
            sortKey={sortKey}
          />
        }
        {
          !isLoading ?
            <div className="interactions">
              <button onClick={() => this.fetchTopStories(searchKey, page + 1, true)}>
                More
          </button>
            </div> :
            <Loading />

        }

      </div>
    );
  }
}


export default App;
