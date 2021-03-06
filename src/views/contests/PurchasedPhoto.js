import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, CameraRoll, Alert
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import * as Firebase from 'firebase';
import Database from '../../utils/Database';
import {
  Actions
} from 'react-native-router-flux';
import RNFetchBlob from 'react-native-fetch-blob';
import Share from 'react-native-share';

// components
import PhotoView from 'react-native-photo-view';
import TitleBar from '../../components/common/TitleBar';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';
import HeaderButton from '../../components/common/HeaderButton';
import Avatar from '../../components/profiles/Avatar';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uri: null
    };

    this.ref = Database.ref(
      `photos/${
        this.props.photoId
      }/url`
    );

    // methods
    this.download = this.download.bind(this);
    this.share = this.share.bind(this);
  }

  componentDidMount() {
    this.listener = this.ref.on('value', data => {
      if (data.exists()) {
        this.setState({
          uri: data.val()
        });
      }
    });
  }

  componentWillUnmount() {
    this.listener && this.ref.off('value', this.listener);
  }

  share() {
    if (this.state.uri) {
      RNFetchBlob.config({
        fileCache: true
      }).fetch('GET', this.state.uri).then(photoBlob => {
        return photoBlob.readFile('base64').then(photo => [
          photo, photoBlob
        ]);
      }).then(photo => {
        Share.open({
          title: 'Photo from Crowdshot',
          message: 'I got this photo taken by others on the Crowdshot app!',
          url: `data:image/jpg;base64,${photo[0]}`,
          subject: 'Photo from Crowdshot',
          type: 'image/jpg'
        });
        photo[1].flush();
      }).catch(err => console.log(err));
    }
  }

  download() {
    if (this.state.uri) {
      RNFetchBlob.config({
        fileCache: true,
        appendExt: 'jpg'
      }).fetch('GET', this.state.uri).then(photo => {
        CameraRoll.saveToCameraRoll(
          photo.path(),
          'photo'
        ).then(result => {
          Alert.alert(
            'Photo saved successfully',
            null,
            [
              {
                text: 'OK',
                onPress: Actions.pop
              }
            ]
          );
        }).catch(err => {
          Alert.alert(
            'Couldn\'t save your photo',
            'Please try again'
          );
        }).then(result => {
          photo.flush();
        });
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.uri ? (
            <PhotoView
              source={{
                uri: this.state.uri
              }}
              minimumZoomScale={0.8}
              maximumZoomScale={3}
              androidScaleType='center'
              style={styles.photo} />
          ): (
            <View />
          )
        }
        <CloseFullscreenButton />
        {
          this.props.contestantId && (
            <View style={styles.buttons}>
              <Avatar
                outline
                showRank
                outlineColor={Colors.Text}
                size={28}
                uid={this.props.contestantId}
                onPress={() => Actions.profile({
                  uid: this.props.contestantId
                })} />
              <HeaderButton
                onPress={this.share}
                icon='share' />
              <HeaderButton
                onPress={this.download}
                icon='file-download' />
            </View>
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background
  },

  photo: {
    flex: 1,
    alignSelf: 'stretch',
    width: Sizes.Width,
    height: Sizes.Height
  },

  buttons: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    padding: Sizes.InnerFrame,
    alignItems: 'center'
  }
});
