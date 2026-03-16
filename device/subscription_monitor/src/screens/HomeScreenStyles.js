import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#667eea',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 5,
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  deleteButton: {
    padding: 5,
  },
  period: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  source: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  alternativesButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  notificationBlock: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notificationTouch: {
    marginBottom: 5,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#667eea',
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  notificationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 32,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
});