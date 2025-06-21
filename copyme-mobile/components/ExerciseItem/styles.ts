/** @format */

import { StyleSheet } from 'react-native';
import { theme } from '@/styles/theme';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.extraLarge,
  },
  levelText: {
    color: '#000',
    fontSize: theme.typography.fontSize.small,
  },
  description: {
    opacity: 0.7,
    fontSize: theme.typography.fontSize.small,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.lightBackground,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: theme.borderRadius.small,
  },
  percentageText: {
    fontSize: theme.typography.fontSize.small,
    minWidth: 40,
    textAlign: 'right',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    objectFit: 'cover',
  },
});
