import { GradientButton } from '@/app/components/button';
import { GradientLoading } from '@/app/components/loading';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Usaremos isto como nosso "banco de dados"
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  primary: '#59B2B6',
  darkText: '#005662',
  lightBackground: '#E0F7FA',
  lightBorder: '#B2EBF2',
  white: '#FFFFFF',
  grayText: '#90A4AE',
  error: '#D83933',
  success: '#2E7D32',
  darkInputText: '#333',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Chave para nosso "banco de dados" de usuários no AsyncStorage
// A tela de CADASTRO deve salvar os usuários usando esta mesma chave
const USERS_DB_KEY = '@acolheia_user_db';
// Chave para o "token" de sessão falso
const TOKEN_KEY = '@acolheia_token';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Não precisamos mais da API_URL
  // const API_URL = 'http://192.168.1.41:8000';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // --- LÓGICA DE LOGIN 100% FRONTEND ---

      // 1. Puxar o "banco de dados" de usuários do AsyncStorage
      const storedUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
      
      // Se não houver dados, 'users' será um array vazio
      const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      // 2. Procurar o usuário pelo email (ignorando maiúsculas/minúsculas)
      const user = users.find(
        (u:any) => u.email.toLowerCase() === email.toLowerCase(),
      );

      // 3. Validar a senha
      if (user && user.password === password) {
        // Sucesso!
        // Criamos um "token falso" para simular a sessão
        await AsyncStorage.setItem(TOKEN_KEY, 'fake-auth-token-123');
        // Navega para a home
        router.push('/home');
      } else {
        // Falha
        throw new Error('Email ou senha inválidos.');
      }
      // --- FIM DA LÓGICA DE LOGIN ---
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Um erro inesperado ocorreu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // A lógica de "resetar senha" pode continuar sendo uma simulação
    if (!resetEmail) {
      setModalError('Por favor, insira um e-mail válido.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');
    try {
      console.log('Enviando pedido de reset para:', resetEmail);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setModalSuccess('Sucesso! Verifique seu e-mail para o link de redefinição.');
      setResetEmail('');
    } catch (err) {
      setModalError('Erro ao tentar redefinir a senha.');
    } finally {
      setModalLoading(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(email);
    setModalError('');
    setModalSuccess('');
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.white, COLORS.lightBackground]}
        style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.innerContainer}>
            <Image
              source={require('@/assets/images/acolheIA.png')}
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Bem-Vindo ao ACOLHE IA</Text>
            <Text style={styles.loginTitle}>Login</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="email:"
                placeholderTextColor={COLORS.grayText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Feather name="user" size={20} color={COLORS.primary} />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="senha:"
                placeholderTextColor={COLORS.grayText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Feather
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* --- BOTÃO "ESQUECEU A SENHA" ATUALIZADO --- */}
            <TouchableOpacity onPress={openResetModal}>
              <Text style={styles.linkText}>Esqueceu a senha? Clique aqui</Text>
            </TouchableOpacity>

            <Link href="/cadastro" asChild>
              <TouchableOpacity>
                <Text style={styles.linkTextSecondary}>
                  Ainda não possui uma conta?
                </Text>
              </TouchableOpacity>
            </Link>

            <GradientButton
              title={isLoading ? 'Entrando...' : 'Começar'}
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>
          <GradientLoading visible={isLoading} />

          <Modal
            transparent={true}
            visible={isModalVisible}
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {/* Botão de Fechar */}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsModalVisible(false)}>
                  <Feather name="x" size={24} color={COLORS.grayText} />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Redefinir Senha</Text>
                <Text style={styles.modalSubtitle}>
                  Digite seu e-mail para enviarmos um link de redefinição.
                </Text>

                {/* Mostra sucesso ou o formulário */}
                {modalSuccess ? (
                  <Text style={styles.modalMessageSuccess}>{modalSuccess}</Text>
                ) : (
                  <>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="seu-email@exemplo.com"
                        placeholderTextColor={COLORS.grayText}
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <Feather name="mail" size={20} color={COLORS.primary} />
                    </View>

                    {modalError ? (
                      <Text style={styles.modalMessageError}>{modalError}</Text>
                    ) : null}

                    <GradientButton
                      title={modalLoading ? 'Enviando...' : 'Enviar Link'}
                      onPress={handleResetPassword}
                      disabled={modalLoading}
                      style={{ width: '100%', marginTop: 10 }} // Faz o botão ocupar 100% do modal
                    />
                  </>
                )}
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1 },
  keyboardView: { flex: 1, width: '100%' },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    color: COLORS.primary,
    marginBottom: 30,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    height: 55,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkInputText,
  },
  linkText: {
    color: COLORS.primary,
    marginTop: 15,
    fontSize: 14,
  },
  linkTextSecondary: {
    color: COLORS.primary,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },

  // --- ESTILOS DO MODAL ADICIONADOS ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
  modalContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    paddingTop: 40, // Mais espaço no topo para o título
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative', // Para o botão de fechar
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.grayText,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalMessageSuccess: {
    fontSize: 16,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: 10,
    padding: 10,
  },
  modalMessageError: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 10,
  },
});