import { GradientButton } from '@/app/components/button'; // Ajuste o caminho se necessário
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    console.log("Usuário deslogado.");
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFFFFF', '#FDECF0']}
        style={styles.container}>
        <View style={styles.innerContainer}>
          <Image
            source={require('@/assets/images/acolheIA.png')} // Ajuste o caminho se necessário
            style={styles.logo}
          />
          <Text style={styles.title}>Bem-vindo(a)!</Text>
          
          <Text style={styles.description}>
           O AcolheIA é um projeto de plataforma de saúde digital voltado para a população transgênero e não-binária. 
          </Text>

          {/* Botão para iniciar o chat */}
          <GradientButton
            title="Iniciar Conversa"
            onPress={() => router.push('/chat')} // Navega para a tela de chat
            style={{ marginTop: 40 }}
          />

          <GradientButton
            title="Sair"
            onPress={handleLogout}
            style={{ marginTop: 20 }}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4A273A',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: '#8c5b63',
    textAlign: 'center',
    lineHeight: 25,
  },
});