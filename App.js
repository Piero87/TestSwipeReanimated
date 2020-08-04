import React from 'react';
import { FlatList, Text, View, SafeAreaView, Dimensions } from 'react-native';
import TestSwipe from './TestSwipe';

const windowDimensions = Dimensions.get('window');

export const App = () => {

  const items = [
    {
      id: 1,
      title: "Blue"
    },
    {
      id: 2,
      title: "Red"
    },
    {
      id: 3,
      title: "Purple"
    },
    {
      id: 4,
      title: "Green"
    },
  ];

  const renderItem = ({ item, index }) => {

    return (
      <TestSwipe
        onOpen={close => {
          console.log("OPEN");
        }}
        buttons={[
          {
            title: "Action 1",
            color: '#303030',
            onPress: () => {
              console.log("Action 1")
            }
          },
          {
            title: "Action 2",
            color: '#8cab34',
            onPress: () => {
              console.log("Action 2")
            },
          }
        ]}
      >
        <View style={{ height: 100, borderColor: 'red', borderWidth: 1, width: windowDimensions.width }}>
          <Text numberOfLines={1}>{item.title}</Text>
        </View>
      </TestSwipe>
    );

  };


  return (
    <SafeAreaView>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => `${item.id}`}
      />
    </SafeAreaView>
  );
};
