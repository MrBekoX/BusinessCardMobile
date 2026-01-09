/**
 * Özelleştirilmiş input bileşeni.
 * Tema destekli, validasyonlu, güvenli input bileşeni.
 */
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, TOUCHABLE_SIZE, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomInput = forwardRef(({
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
}, ref) => {
  const theme = useTheme();
  const colors = theme.colors;
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Ref'i dışa aktar
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    isFocused: () => inputRef.current?.isFocused(),
  }));

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const hasError = error && error.length > 0;
  const borderColor = hasError
    ? colors.error || COLORS.light.error
    : isFocused
    ? colors.primary || COLORS.primary
    : colors.border || COLORS.light.border;

  const inputContainerStyle = [
    styles.inputContainer,
    {
      borderColor,
      borderWidth: hasError ? 2 : isFocused ? 2 : 1,
      backgroundColor: editable ? colors.surface || COLORS.light.surface : colors.border || COLORS.light.border,
      minHeight: multiline ? 80 : TOUCHABLE_SIZE.min,
    },
    style,
  ];

  const textInputStyle = [
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
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  required: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
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
    fontWeight: TYPOGRAPHY.weights.regular,
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
    fontWeight: TYPOGRAPHY.weights.regular,
  },
});

CustomInput.displayName = 'CustomInput';

export default React.memo(CustomInput);