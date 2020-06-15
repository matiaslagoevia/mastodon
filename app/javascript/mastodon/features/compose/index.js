import React from 'react';
import ComposeFormContainer from './containers/compose_form_container';
import NavigationContainer from './containers/navigation_container';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { mountCompose, unmountCompose } from '../../actions/compose';
import { Link } from 'react-router-dom';
import { injectIntl, defineMessages } from 'react-intl';
import SearchContainer from './containers/search_container';
import Motion from '../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import SearchResultsContainer from './containers/search_results_container';
import { changeComposing } from '../../actions/compose';
import { openModal } from 'mastodon/actions/modal';
import elephantUIPlane from '../../../images/elephant_ui_plane.svg';
import { mascot } from '../../initial_state';
import Icon from 'mastodon/components/icon';
import Tooltip from 'mastodon/components/tooltip';
import { logOut } from 'mastodon/utils/log_out';

const messages = defineMessages({
  start: { id: 'getting_started.heading', defaultMessage: 'Getting started' },
  home_timeline: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: { id: 'tabs_bar.notifications', defaultMessage: 'Notifications' },
  public: { id: 'navigation_bar.public_timeline', defaultMessage: 'Federated timeline' },
  community: { id: 'navigation_bar.community_timeline', defaultMessage: 'Local timeline' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  compose: { id: 'navigation_bar.compose', defaultMessage: 'Compose new toot' },
  logoutMessage: { id: 'confirmations.logout.message', defaultMessage: 'Are you sure you want to log out?' },
  logoutConfirm: { id: 'confirmations.logout.confirm', defaultMessage: 'Log out' },
});

const mapStateToProps = (state, ownProps) => ({
  columns: state.getIn(['settings', 'columns']),
  showSearch: ownProps.multiColumn ? state.getIn(['search', 'submitted']) && !state.getIn(['search', 'hidden']) : ownProps.isSearchPage,
});

export default @connect(mapStateToProps)
@injectIntl
class Compose extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    columns: ImmutablePropTypes.list.isRequired,
    multiColumn: PropTypes.bool,
    showSearch: PropTypes.bool,
    isSearchPage: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount () {
    const { isSearchPage } = this.props;

    if (!isSearchPage) {
      this.props.dispatch(mountCompose());
    }
  }

  componentWillUnmount () {
    const { isSearchPage } = this.props;

    if (!isSearchPage) {
      this.props.dispatch(unmountCompose());
    }
  }

  handleLogoutClick = e => {
    const { dispatch, intl } = this.props;

    e.preventDefault();
    e.stopPropagation();

    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.logoutMessage),
      confirm: intl.formatMessage(messages.logoutConfirm),
      onConfirm: () => logOut(),
    }));

    return false;
  }

  onFocus = () => {
    this.props.dispatch(changeComposing(true));
  }

  onBlur = () => {
    this.props.dispatch(changeComposing(false));
  }

  render () {
    const { multiColumn, showSearch, isSearchPage, intl } = this.props;

    let header = '';

    if (multiColumn) {
      const { columns } = this.props;
      header = (
        <nav className='drawer__header'>
          <Tooltip placement='bottom' overlay={intl.formatMessage(messages.start)}>
            <Link to='/getting-started' className='drawer__tab' aria-label={intl.formatMessage(messages.start)}>
              <Icon id='bars' fixedWidth />
            </Link>
          </Tooltip>

          {!columns.some(column => column.get('id') === 'HOME') && (
            <Tooltip placement='bottom' overlay={intl.formatMessage(messages.home_timeline)}>
              <Link to='/timelines/home' className='drawer__tab' aria-label={intl.formatMessage(messages.home_timeline)}>
                <Icon id='home' fixedWidth />
              </Link>
            </Tooltip>
          )}

          {!columns.some(column => column.get('id') === 'NOTIFICATIONS') && (
            <Tooltip placement='bottom' overlay={intl.formatMessage(messages.notifications)}>
              <Link to='/notifications' className='drawer__tab' aria-label={intl.formatMessage(messages.notifications)}>
                <Icon id='bell' fixedWidth />
              </Link>
            </Tooltip>
          )}

          {!columns.some(column => column.get('id') === 'COMMUNITY') && (
            <Tooltip placement='bottom' overlay={intl.formatMessage(messages.community)}>
              <Link to='/timelines/public/local' className='drawer__tab' aria-label={intl.formatMessage(messages.community)}>
                <Icon id='users' fixedWidth />
              </Link>
            </Tooltip>
          )}

          {!columns.some(column => column.get('id') === 'PUBLIC') && (
            <Tooltip placement='bottom' overlay={intl.formatMessage(messages.public)}>
              <Link to='/timelines/public' className='drawer__tab' aria-label={intl.formatMessage(messages.public)}>
                <Icon id='globe' fixedWidth />
              </Link>
            </Tooltip>
          )}

          <Tooltip placement='bottom' overlay={intl.formatMessage(messages.preferences)}>
            <a href='/settings/preferences' className='drawer__tab' aria-label={intl.formatMessage(messages.preferences)}>
              <Icon id='cog' fixedWidth />
            </a>
          </Tooltip>

          <Tooltip placement='bottom' overlay={intl.formatMessage(messages.logout)}>
            <a href='/auth/sign_out' className='drawer__tab' aria-label={intl.formatMessage(messages.logout)} onClick={this.handleLogoutClick}>
              <Icon id='sign-out' fixedWidth />
            </a>
          </Tooltip>
        </nav>
      );
    }

    return (
      <div className='drawer' role='region' aria-label={intl.formatMessage(messages.compose)}>
        {header}

        {(multiColumn || isSearchPage) && <SearchContainer /> }

        <div className='drawer__pager'>
          {!isSearchPage && <div className='drawer__inner' onFocus={this.onFocus}>
            <NavigationContainer onClose={this.onBlur} />

            <ComposeFormContainer />

            <div className='drawer__inner__mastodon'>
              <img alt='' draggable='false' src={mascot || elephantUIPlane} />
            </div>
          </div>}

          <Motion defaultStyle={{ x: isSearchPage ? 0 : -100 }} style={{ x: spring(showSearch || isSearchPage ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
            {({ x }) => (
              <div className='drawer__inner darker' style={{ transform: `translateX(${x}%)`, visibility: x === -100 ? 'hidden' : 'visible' }}>
                <SearchResultsContainer />
              </div>
            )}
          </Motion>
        </div>
      </div>
    );
  }

}
