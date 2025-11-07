import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, // Usado para o loading do histórico
  FlatList,
  Image,
  KeyboardAvoidingView,
  ListRenderItemInfo,
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
  darkInputText: '#333',
};

// --- CONFIGURAÇÃO DA API (LENDO DAS VARIÁVEIS DE AMBIENTE) ---
// 1. Lendo as variáveis do .env
const BASE_URL = process.env.EXPO_PUBLIC_FELCA_API_URL;
const CHAT_ENDPOINT = process.env.EXPO_PUBLIC_FELCA_CHAT_ENDPOINT;
const API_KEY = process.env.EXPO_PUBLIC_FELCA_ACCESS_KEY;

// 2. Combinando a URL final
const API_URL = `${BASE_URL}${CHAT_ENDPOINT}`;

// --- CHAVES DO ASYNCSTORAGE ---
// (Para salvar o histórico baseado no login)
const TOKEN_KEY = '@acolheia_token'; // Onde o login salvou o email
const CHAT_HISTORY_PREFIX = '@acolheia_chat_history_';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Sou o assistente virtual do AcolheIA. Minha missão é ser uma ponte entre a comunidade transgênero e serviços de radiologia afirmativos. Como posso ajudar hoje?',
    sender: 'bot',
  },
];

export default function ChatScreen() {
  // O chat começa vazio, pois vamos carregar o histórico
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const router = useRouter();

  // Estados para controlar o login e o carregamento
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // EFEITO 1: Carregar usuário e histórico de chat
  useEffect(() => {
    const loadData = async () => {
      try {
        // A. Descobre quem está logado (pela chave do login)
        // 3. CORREÇÃO: A tela de login salva o EMAIL, não um token
        const email = await AsyncStorage.getItem(TOKEN_KEY);
        if (!email) {
          // Se não achou ninguém logado, volta para o login
          router.push('/'); // Assumindo que o login é a rota '/'
          return;
        }
        setCurrentUserEmail(email); // Salva o email do usuário logado

        // B. Tenta carregar o histórico de chat desse usuário
        const historyKey = CHAT_HISTORY_PREFIX + email;
        const storedHistory = await AsyncStorage.getItem(historyKey);

        if (storedHistory) {
          // Se achou histórico, carrega no chat
          setMessages(JSON.parse(storedHistory));
        } else {
          // Se não achou, usa a mensagem inicial
          setMessages(initialMessages);
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
        setMessages(initialMessages); // Em caso de erro, começa do zero
      } finally {
        setIsLoadingHistory(false); // Termina o carregamento
      }
    };

    loadData();
  }, []); // [] = Roda apenas uma vez

  // EFEITO 2: Salvar o histórico de chat (baseado no usuário)
  useEffect(() => {
    const saveData = async () => {
      // Não salva se ainda estiver carregando ou se não souber quem é o usuário
      if (isLoadingHistory || !currentUserEmail || messages.length === 0) {
        return;
      }

      try {
        // Salva a lista de mensagens no AsyncStorage com a chave do usuário
        const historyKey = CHAT_HISTORY_PREFIX + currentUserEmail;
        const jsonValue = JSON.stringify(messages);
        await AsyncStorage.setItem(historyKey, jsonValue);
      } catch (e) {
        console.error('Erro ao salvar histórico:', e);
      }
    };

    saveData();
  }, [messages, currentUserEmail, isLoadingHistory]); // Roda sempre que 'messages' mudar

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    // 4. Verificando se as variáveis de ambiente foram carregadas
    if (!API_URL || !API_KEY || !BASE_URL) {
      alert(
        'Erro: As variáveis de ambiente da API (EXPO_PUBLIC_...) não foram carregadas. Verifique seu .env e reinicie o app.',
      );
      return;
    }

    const userMessage: Message = {
      id: String(Date.now()),
      text: inputText,
      sender: 'user',
    };

    // Atualiza o chat (isso dispara o Efeito 2 para salvar)
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const messageToSend = inputText;
    setInputText('');
    setIsBotTyping(true);

    try {
      // 5. Usando as variáveis de ambiente na chamada
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-acolheia-key': API_KEY, // Chave de acesso lida do .env
        },
        body: JSON.stringify({
          mensagem: messageToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail || `Erro HTTP: ${response.status}`;
        throw new Error(detail);
      }

      const data = await response.json();
      const botReplyText = data.resposta;

      if (!botReplyText) {
        throw new Error('Formato de resposta inesperado da API.');
      }

      const botResponse: Message = {
        id: String(Date.now() + 1),
        text: botReplyText,
        sender: 'bot',
      };

      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Falha ao buscar resposta do bot:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Desculpe, estou com problemas para me conectar.';

      const errorResponse: Message = {
        id: String(Date.now() + 1),
        text: errorMessage.includes('HTTP')
          ? 'Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.'
          : errorMessage,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsBotTyping(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => {
    const isUserMessage = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessage : styles.botMessage,
        ]}>
        <Text
          style={[
            styles.messageText,
            isUserMessage ? styles.userMessageText : styles.botMessageText,
          ]}>
          {item.text}
        </Text>
      </View>
    );
  };

  // Tela de Loading enquanto carrega o histórico
  if (isLoadingHistory) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando seu histórico...</Text>
      </SafeAreaView>
    );
  }

  // Se o histórico já carregou, mostra o chat
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Cabeçalho do Chat --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Image
            // 6. CORREÇÃO: Este é o caminho mais provável
            //    (assumindo que 'chat' está em 'app' e 'assets' está na raiz)
            source={require('../../assets/images/acolheIA.png')}
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>Assistente AcolheIA</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          {isBotTyping && (
            <Text style={styles.typingIndicator}>
              Assistente AcolheIA está digitando...
            </Text>
          )}

          {/* --- Input de Texto --- */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={COLORS.grayText}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Feather name="send" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkText,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginLeft: 15,
  },
  keyboardView: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.darkInputText,
  },
  typingIndicator: {
    fontSize: 14,
    color: COLORS.grayText,
    paddingLeft: 15,
    paddingBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightBorder,
    backgroundColor: COLORS.white,
  },
  textInput: {
    flex: 1,
    height: 45,
    backgroundColor: COLORS.white,
    borderRadius: 22.5,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: COLORS.lightBorder,
    borderWidth: 1,
    color: COLORS.darkInputText,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});