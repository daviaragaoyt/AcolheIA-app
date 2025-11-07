import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

// --- DEFINIÇÃO DA NOVA PALETA DE CORES ACOLHEIA ---
const COLORS = {
  primary: '#59B2B6', // Nosso turquesa suave
  primaryDark: '#3A9A9F', // Tom mais escuro (verde-água/teal) para o gradiente
  white: '#FFFFFF', // Texto do botão
  shadow: '#000', // Cor da sombra
};
// ----------------------------------------------------

// Define as propriedades que o botão aceita
type GradientButtonProps = {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  disabled?: boolean;
};

export function GradientButton({ onPress, title, style, disabled }: GradientButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.buttonContainer, style]}
      disabled={disabled}>
     
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.button, disabled && styles.disabledButton]}
        start={{ x: 0.1, y: 0.1 }} // Ajustei o início/fim para um gradiente diagonal
        end={{ x: 1, y: 1 }}>
        {/* MUDANÇA: A cor do texto agora é branca */}
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '90%',
    marginTop: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2, // Aumentei levemente a opacidade da sombra para o botão mais escuro
    shadowRadius: 4.65,
    elevation: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // Removemos a borda, pois o gradiente mais forte já dá definição
  },
  buttonText: {
    color: COLORS.white, // MUDANÇA: Cor do texto para branco
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6, // Opacidade para estado desabilitado
  },
});
