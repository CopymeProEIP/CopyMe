import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  listContent: {
    height: '90%',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
    padding: 24,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    maxWidth: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 24,
  },
  loadingIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    maxWidth: '80%',
  },
});

export default styles;
