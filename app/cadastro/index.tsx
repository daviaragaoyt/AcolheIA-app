import { GradientButton } from '@/app/components/button';
import { GradientLoading } from '@/app/components/loading';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// Importar o AsyncStorage para salvar o usuário
import AsyncStorage from '@react-native-async-storage/async-storage';

// Copiando as cores
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
// DEVE ser a mesma chave usada na tela de login
const USERS_DB_KEY = '@acolheia_user_db';

export default function CadastroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Não precisamos mais da API_URL
  // const API_URL = 'http://192.168.1.41:8000';

  const handleRegister = async () => {
    // 1. Validação no frontend
    if (!email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    // Adicionando uma validação simples de email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // --- LÓGICA DE CADASTRO 100% FRONTEND ---

      // 1. Puxar o "banco de dados" atual
      const storedUsersRaw = await AsyncStorage.getItem(USERS_DB_KEY);
      const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      // 2. Verificar se o email já existe
      const existingUser = users.find(
        (u:any) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (existingUser) {
        throw new Error('Este e-mail já foi cadastrado.');
      }

      // 3. Adicionar o novo usuário
      const newUser = { email: email.toLowerCase(), password: password };
      const updatedUsers = [...users, newUser];

      // 4. Salvar o "banco de dados" atualizado no AsyncStorage
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));

      // --- FIM DA LÓGICA DE CADASTRO ---

      setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');

      setTimeout(() => {
        router.push('/'); // Assumindo que a tela de login é a rota '/'
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Um erro inesperado ocorreu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.welcomeText}>Crie sua Conta</Text>
            <Text style={styles.loginTitle}>Cadastro</Text>

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
              <Feather name="mail" size={20} color={COLORS.primary} />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="senha (mín. 6 caracteres):"
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

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="confirme sua senha:"
                placeholderTextColor={COLORS.grayText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }>
                <Feather
                  name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.linkTextSecondary}>
                  Já possui uma conta? Faça login
                </Text>
              </TouchableOpacity>
            </Link>

            <GradientButton
              title={isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              onPress={handleRegister}
              disabled={isLoading}
              style={{ marginTop: 20 }}
            />
          </View>
          <GradientLoading visible={isLoading} />
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Estilos (sem alterações)
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
    width: 120,
    height: 120,
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
  linkTextSecondary: {
    color: COLORS.primary,
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});