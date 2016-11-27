import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, ListView, Alert
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import * as Firebase from 'firebase';
import Database from '../../utils/Database';
import {
  Actions
} from 'react-native-router-flux';

// components
import TitleBar from '../../components/common/TitleBar';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';
import AwardCard from '../../components/lists/AwardCard';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {},
      rawAwards: {},
      awards: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      })
    };

    this.ref = Database.ref(
      `awards/`
    );

    this.profileRef = Database.ref(
      `profiles/${
        Firebase.auth().currentUser.uid
      }`
    );
  }

  componentDidMount() {
    this.listener = this.ref.on('value', data => {

      // dont check exists due to empty entries allowed
      let blob = data.val() || {};
      this.setState({
        rawAwards: blob,
        awards: new ListView.DataSource({
          rowHasChanged: (r1, r2) => r1 !== r2
        }).cloneWithRows(
          Object.keys(blob)
        )
      });

      // and clear loader
      this.refs.title.clearLoader();
    });

    this.profileListener = this.profileRef.on('value', data => {
      if (data.exists()) {
        this.setState({
          profile: data.val()
        });
      }
    });
  }

  componentWillUnmount() {
    this.listener && this.ref.off('value', this.listener);
    this.profileListener && this.profileRef.off('value', this.profileListener);
  }

  renderRow(awardId) {
    return (
      <View style={styles.entryContainer}>
        <AwardCard
          awardId={awardId} />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar
          clearLoader
          ref='title'
          title='Redeem Your Prizes'
          rightIcon='trophy'
          rightTitle={
            `$${
              this.state.profile.wallet
              || 0
            }`
          }/>
        <View style={styles.content}>
          <ListView
            key={Math.random()}
            scrollEnabled
            dataSource={this.state.awards}
            style={styles.entries}
            renderRow={this.renderRow.bind(this)} />
        </View>
        <CloseFullscreenButton />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ModalBackground
  },

  content: {
    flex: 1
  },

  entries: {
    flex: 1
  },

  entryContainer: {
    margin: Sizes.InnerFrame / 2,
    marginBottom: 0,
  }
});