/**
 * Optimize edilmiş buton bileşeni.
 * React.memo ile sarılmış, performans için optimize edilmiş buton.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { COLORS, TOUCHABLE_SIZE, TYPOGRAPHY } from '@constants/theme';

// ==================== TYPES ====================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

interface MemoizedButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

interface VariantStyles {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

interface SizeStyles {
  paddingHorizontal: number;
  paddingVertical: number;
  minHeight: number;
  fontSize: number;
}

// ==================== COMPONENT ====================

const MemoizedButton: React.FC<MemoizedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  const theme = useTheme();
  const colors = theme.colors;

  const getVariantStyles = (): VariantStyles => {
    const variants: Record<ButtonVariant, VariantStyles> = {
      primary: {
        backgroundColor: colors.primary || COLORS.primary,
        borderColor: colors.primary || COLORS.primary,
        textColor: '#FFFFFF',
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: colors.primary || COLORS.primary,
        textColor: colors.primary || COLORS.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: colors.border || COLORS.light.border,
        textColor: colors.text || COLORS.light.text,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: colors.primary || COLORS.primary,
      },
      danger: {
        backgroundColor: colors.error || COLORS.light.error,
        borderColor: colors.error || COLORS.light.error,
        textColor: '#FFFFFF',
      },
      success: {
        backgroundColor: colors.success || COLORS.light.success,
        borderColor: colors.success || COLORS.light.success,
        textColor: '#FFFFFF',
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = (): SizeStyles => {
    const sizes: Record<ButtonSize, SizeStyles> = {
      small: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        minHeight: 36,
        fontSize: TYPOGRAPHY.sizes.sm,
      },
      medium: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: TOUCHABLE_SIZE.min,
        fontSize: TYPOGRAPHY.sizes.md,
      },
      large: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 52,
        fontSize: TYPOGRAPHY.sizes.lg,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles: StyleProp<ViewStyle>[] = [
    styles.button,
    {
      backgroundColor: disabled ? colors.border || COLORS.light.border : variantStyles.backgroundColor,
      borderColor: disabled ? colors.border || COLORS.light.border : variantStyles.borderColor,
      borderWidth: variant === 'ghost' ? 0 : 1,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      minHeight: sizeStyles.minHeight,
    },
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles: StyleProp<TextStyle>[] = [
    styles.text,
    {
      color: disabled ? colors.textSecondary || COLORS.light.textSecondary : variantStyles.textColor,
      fontSize: sizeStyles.fontSize,
    },
    textStyle,
  ];

  const handlePress = (event: GestureResponderEvent): void => {
    if (!disabled && !loading && onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      accessible={true}
      {...props}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
            style={styles.loading}
          />
        )}
        
        {!loading && leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <Text style={textStyles} numberOfLines={1}>
          {title}
        </Text>
        
        {!loading && rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loading: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  fullWidth: {
    width: '100%',
  },
});

// React.memo ile sarılmış versiyon
export default React.memo(MemoizedButton);
