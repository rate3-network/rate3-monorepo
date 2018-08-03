import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const changeTab = (newTab) => {
  const newHash = window.location.hash.split('?');
  newHash[0] = `#${newTab}`;
  window.location = newHash.join('?');
};

class Tabs extends Component {
  state = {
    currentTab: '',
  }

  componentDidMount() {
    const { children } = this.props;
    window.onpopstate = this.setTab;
    if (this.setTab()) {
      return;
    }
    if (children.length) {
      this.setState({ currentTab: children[0].props.path });
    }
  }

  onTabSwitch(tabPath) {
    const { currentTab } = this.state;
    if (tabPath === currentTab) {
      return;
    }
    changeTab(tabPath)
    this.setState({ currentTab: tabPath });
  }

  setTab = () => {
    const { children } = this.props;
    const currentTab = window.location.hash.split('?')[0];
    if (currentTab) {
      const path = currentTab.substring(1); // remove #
      const validPath = children.map(child => child.props.path).indexOf(path) !== -1;
      if (validPath) {
        this.setState({ currentTab: path });
        return true;
      }
    }
    return false;
  }

  extractTabsFromChildren() {
    const { children } = this.props;

    return children.map((child) => {
      const { tabName, tabIcon, path } = child.props;
      return {
        name: tabName,
        icon: tabIcon,
        path,
      };
    });
  }

  render() {
    const { children } = this.props;
    if (!children || !children.length) return null;

    const { currentTab } = this.state;
    const tabs = this.extractTabsFromChildren();

    return (
      <div className="container tabs-switcher-container mt-5 mb-5">
        <div className="p-2 mb-3" style={{ borderRadius: '5px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <ul className="nav nav-pills nav-fill" id="main-tab" role="tablist">
            {
              tabs.map((tab) => {
                const normalizedName = tab.name.split(/\s+/).join('-');
                return (
                  <li key={normalizedName} className="nav-item">
                    <a
                      className={classnames(
                        'nav-link',
                        { active: currentTab === tab.path },
                      )}
                      id={`main-${normalizedName}-tab`}
                      data-toggle="main"
                      aria-controls={`main-${normalizedName}`}
                      aria-selected={currentTab === tab.path}
                      onClick={() => { this.onTabSwitch(tab.path); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={classnames(tab.icon, 'mr-2')} />
                      {tab.name}
                    </a>
                  </li>
                );
              })
            }
          </ul>
        </div>
        <div className="tab-content" id="main-tabContent">
          {
            children.map((child, idx) => {
              const normalizedName = tabs[idx].name.split(/\s+/).join('-');
              return (
                <div
                  key={normalizedName}
                  className={classnames(
                    'tab-pane',
                    'fade',
                    {
                      show: currentTab === child.props.path,
                      active: currentTab === child.props.path,
                    },
                  )}
                  id={`main-${normalizedName}`}
                  role="tabpanel"
                  aria-labelledby={`main-${normalizedName}-tab`}
                >
                  {child}
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

Tabs.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

export default Tabs;
