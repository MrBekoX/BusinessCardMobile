/**
 * Kartvizit görüntüleme bileşeni.
 * Tema uyumlu, optimize edilmiş kartvizit kartı.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { formatPhone, truncateText } from '../../utils/formatters';
import { getInitials, generateRandomColor } from '../../utils/formatters';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Card = ({
  card,
  onPress,
  onLongPress,
  style,
  variant = 'default',
  showActions = false,
  onCall,
  onEmail,
  onShare,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.colors;

  const getCardStyles = () => {
    const variants = {
      default: {
        backgroundColor: colors.card || COLORS.light.card,
        borderWidth: 1,
        borderColor: colors.border || COLORS.light.border,
      },
      elevated: {
        backgroundColor: colors.card || COLORS.light.card,
        borderWidth: 0,
        ...SHADOWS.md,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary || COLORS.primary,
      },
    };
    return variants[variant] || variants.default;
  };

  const cardStyles = [
    styles.container,
    getCardStyles(),
    style,
  ];

  const getInitialsColor = (name) => {
    const baseColor = generateRandomColor(name);
    return baseColor;
  };

  const renderAvatar = () => {
    if (card.profile_image) {
      return (
        <Image
          source={{ uri: card.profile_image }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      );
    }

    const initials = getInitials(card.company_name || card.name || '');
    const backgroundColor = getInitialsColor(card.company_name || card.name || '');
    const textColor = colors.getContrastColor ? colors.getContrastColor(backgroundColor) : '#FFFFFF';

    return (
      <View style={[styles.avatarFallback, { backgroundColor }]}>
        <Text style={[styles.avatarText, { color: textColor }]}>
          {initials}
        </Text>
      </View>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionsContainer}>
        {card.phone && onCall && (
          <TouchableOpacity
            onPress={onCall}
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="phone" size={20} color={colors.primary || COLORS.primary} />
          </TouchableOpacity>
        )}
        
        {card.email && onEmail && (
          <TouchableOpacity
            onPress={onEmail}
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="email" size={20} color={colors.primary || COLORS.primary} />
          </TouchableOpacity>
        )}
        
        {onShare && (
          <TouchableOpacity
            onPress={onShare}
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="share" size={20} color={colors.primary || COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {renderAvatar()}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.companyName, { color: colors.text || COLORS.light.text }]}>
            {truncateText(card.company_name || card.name || '', 30)}
          </Text>
          
          {card.position && (
            <Text style={[styles.position, { color: colors.textSecondary || COLORS.light.textSecondary }]}>
              {truncateText(card.position, 40)}
            </Text>
          )}
          
          {card.phone && (
            <Text style={[styles.contactInfo, { color: colors.textSecondary || COLORS.light.textSecondary }]}>
              {formatPhone(card.phone)}
            </Text>
          )}
          
          {card.email && (
            <Text style={[styles.contactInfo, { color: colors.textSecondary || COLORS.light.textSecondary }]}>
              {truncateText(card.email, 30)}
            </Text>
          )}
        </View>
        
        {renderActions()}
      </View>
      
      {card.website && (
        <View style={styles.footer}>
          <Icon name="language" size={16} color={colors.textSecondary || COLORS.light.textSecondary} />
          <Text style={[styles.website, { color: colors.textSecondary || COLORS.light.textSecondary }]}>
            {truncateText(card.website, 40)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  infoContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  companyName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  position: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  website: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginLeft: 4,
  },
});

export default React.memo(Card);