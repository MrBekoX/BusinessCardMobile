/**
 * Özelleştirilmiş input bileşeni.
 * Tema destekli, validasyonlu, güvenli input bileşeni.
 */
import React, { useState, useRef, useImperativeHandle, forwardRef, Ref } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { COLORS, TOUCHABLE_SIZE, TYPOGRAPHY, BORDER_RADIUS } from '@constants/theme';
import Icon from '@expo/vector-icons/MaterialIcons';

// ==================== TYPES ====================

export interface CustomInputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  blurOnSubmit?: boolean;
}

// ==================== COMPONENT ====================

const CustomInput = forwardRef<CustomInputHandle, CustomInputProps>((
  {
    placeholder,
    value,
    onChangeText,
    onBlur,
    onFocus,
    style,
    inputStyle,
    placeholderTextColor,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    autoComplete = 'off',
    editable = true,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    returnKeyType = 'default',
    onSubmitEditing,
    blurOnSubmit = true,
    error,
    label,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    required = false,
    ...props
  },
  ref: Ref<CustomInputHandle>
) => {
  const theme = useTheme();
  const colors = theme.colors;
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Ref'i dışa aktar
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    isFocused: () => inputRef.current?.isFocused() || false,
  }));

  const handleFocus = (): void => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = (): void => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const hasError = error && error.length > 0;
  const borderColor = hasError
    ? colors.error || COLORS.light.error
    : isFocused
    ? colors.primary || COLORS.primary
    : colors.border || COLORS.light.border;

  const inputContainerStyle: StyleProp<ViewStyle>[] = [
    styles.inputContainer,
    {
      borderColor,
      borderWidth: hasError ? 2 : isFocused ? 2 : 1,
      backgroundColor: editable ? colors.surface || COLORS.light.surface : colors.border || COLORS.light.border,
      minHeight: multiline ? 80 : TOUCHABLE_SIZE.min,
    },
    style,
  ];

  const textInputStyle: StyleProp<TextStyle>[] = [
    styles.input,
    {
      color: colors.text || COLORS.light.text,
      fontSize: TYPOGRAPHY.sizes.md,
      paddingLeft: leftIcon ? 40 : 16,
      paddingRight: rightIcon || (secureTextEntry && showPasswordToggle) ? 40 : 16,
    },
    inputStyle,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text || COLORS.light.text }]}>
            {label}
          </Text>
          {required && (
            <Text style={[styles.required, { color: colors.error || COLORS.light.error }]}>
              *
            </Text>
          )}
        </View>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={inputRef}
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={
            placeholderTextColor || colors.placeholder || COLORS.light.placeholder
          }
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          {...props}
        />
        
        {(rightIcon || (secureTextEntry && showPasswordToggle)) && (
          <View style={styles.rightIconContainer}>
            {rightIcon ? (
              rightIcon
            ) : (
              secureTextEntry && showPasswordToggle && (
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.passwordToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary || COLORS.light.textSecondary}
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </View>
      
      {hasError && (
        <Text style={[styles.errorText, { color: colors.error || COLORS.light.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
  required: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold as '700',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular as '400',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.weights.regular as '400',
  },
});

CustomInput.displayName = 'CustomInput';

export default React.memo(CustomInput);
