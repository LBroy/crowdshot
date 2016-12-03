import React, {
  Component
} from 'react';
import {
  View, StyleSheet, ListView, Alert
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';

import * as Firebase from 'firebase';
import Database from '../../utils/Database'
import Swipeout from 'react-native-swipeout';
import ChatCard from '../../components/chat/ChatCard';
import TitleBar from '../../components/common/TitleBar';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rawChat: {},
      activeChat: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 != r2
      })
    };

    this.ref = Database.ref(
      `profiles/${
        Firebase.auth().currentUser.uid
      }/activeChat`
    );

    this.chatRef = Database.ref(
      `chats`
    )
  }

  emptyChat(chatId) {
    if (this.state.chatMessage && this.state.chatMessage[chatId]) {
      return true
    }
    return false
  }

  componentDidMount() {

    this.listener = this.ref.on('value', data => {
        let blob = data.val() || {};
        console.log(blob)
        this.setState({
          rawChat: blob,
          activeChat: new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
          }).cloneWithRows(
            Object.keys(blob)
          )

        });

        // and clear loader
        this.refs.title.clearLoader();
    });

    this.chatListener = this.chatRef.on('value', data => {
      data.exists() && this.setState({
        chatMessage: data.val()
      })
    })
  }

  componentWillUnmount() {
    this.listener && this.ref.off('value', this.listener);
    this.chatListener && this.chatRef.off('value', this.chatListener);
  }

  renderRow(chatId) {
    return (
      <View>
        {
          this.emptyChat(chatId) && (
            <View style={styles.chatContainer}>
              <Swipeout
                right={[
                  {
                    text: 'Remove',
                    color: Colors.Text,
                    backgroundColor: Colors.Cancel,
                    onPress: () => {
                      Alert.alert(
                        'Remove this Chat Entry?',
                        null,
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          }, {
                            text: 'Remove',
                            onPress: () => {
                              Database.ref(
                                `profiles/${
                                  Firebase.auth().currentUser.uid
                                }/activeChat/${
                                  chatId
                                }`
                              ).remove();
                            }
                          }
                        ]
                      );
                    }
                  }
                ]}>
                <ChatCard chatId={chatId} />
              </Swipeout>
            </View>
          )
        }
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar
          clearLoader
          title='Crowd Chat'
          ref='title' />
        <View style={styles.content}>
          <ListView
            key={Math.random()}
            scrollEnabled
            dataSource={this.state.activeChat}
            style={styles.activeChat}
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

  activeChat: {
    flex: 1
  },

  chatContainer: {
    margin: Sizes.InnerFrame / 2,
    marginBottom: 0
  },

  title: {
    alignItems: 'center'
  }
})
