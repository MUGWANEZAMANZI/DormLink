import { StyleSheet, View } from 'react-native';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Button
            title="Shaka Inzu"
            style={styles.shaka}
            onPress={() => navigation.navigate('FindDorm')}
          />
        </View>
        <View style={styles.right}>
          <Button
            title="Ranga Inzu"
            style={styles.ranga}
            onPress={() => navigation.navigate('AddDorm')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  shaka: {
    backgroundColor: '#007BFF',
  },
  ranga: {
    backgroundColor: '#28A745',
  },
});
