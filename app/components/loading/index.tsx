import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

// --- DEFINIÇÃO DA NOVA PALETA DE CORES ACOLHEIA ---
const COLORS = {
  primary: '#59B2B6', // Nosso turquesa suave
  primaryDark: '#3A9A9F', // Tom mais escuro (verde-água/teal) para o gradiente
  white: '#FFFFFF', // Cor do indicador (spinner)
  shadow: '#000', // Cor da sombra
  overlay: 'rgba(0, 0, 0, 0.4)', // Fundo semi-transparente
};
// ----------------------------------------------------

type GradientLoadingProps = {
  visible: boolean;
};

export function GradientLoading({ visible }: GradientLoadingProps) {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.container}>

        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.indicatorContainer}>

          <ActivityIndicator size="large" color={COLORS.white} />
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay, // Fundo semi-transparente
  },
  indicatorContainer: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});