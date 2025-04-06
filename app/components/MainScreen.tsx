import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import CemearLogo from '../../assets/logo.png';
import AIAnimation from '../../assets/Animation - 1743167573251.json';

export default function MainScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<LottieView>(null);

  const handleAsk = async () => {
    try {
      setLoading(true);
      setResponse('');
      setFeedbackSent(false);

      // Button pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', {
          uri: uploadFile.uri,
          name: uploadFile.name,
          type: uploadFile.mimeType || '*/*',
        } as any);
        formData.append('contexto', question);

        const res = await axios.post('http://192.168.100.6:8000/upload-interpreta', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setResponse(res.data.resposta_ia);
        setUploadStatus('✅ Arquivo interpretado com sucesso!');
      } else {
        const res = await axios.post('http://192.168.100.6:8000/chat', { question });
        setResponse(res.data.answer);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro ao buscar resposta da IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled && result.assets.length > 0) {
      setUploadFile(result.assets[0]);
      setUploadStatus(`📎 Arquivo anexado: ${result.assets[0].name}`);
    }
  };

  const handleUploadConhecimento = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || '*/*',
        } as any);

        setUploadStatus('Enviando conhecimento...');
        await axios.post('http://192.168.100.6:8000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setUploadStatus('✅ Conhecimento enviado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('❌ Erro ao enviar conhecimento.');
    }
  };

  const handleFeedback = async (tipo: 'certa' | 'errada' | 'melhorar') => {
    try {
      await axios.post('http://192.168.100.6:8000/feedback', {
        question,
        answer: response,
        feedback: tipo,
        contextoUsuario: question,
        origemPlanta: uploadFile?.name || '',
      });
      setFeedbackSent(true);
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with logo and animation */}
      <View style={styles.header}>
        <Image
          source={CemearLogo}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <LottieView
          ref={animationRef}
          source={AIAnimation}
          autoPlay
          loop
          style={styles.lottieAnimation}
          resizeMode="contain"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Digite sua pergunta ou contexto..."
        placeholderTextColor="#94a3b8"
        value={question}
        onChangeText={setQuestion}
        multiline
      />

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleAsk}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Perguntar à IA</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleFileSelect}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Anexar arquivo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleUploadConhecimento}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Enviar para base</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.specialButton}
        onPress={() => navigation.navigate('PlantaUpload')}
        activeOpacity={0.8}
      >
        <Text style={styles.specialButtonText}>Calcular materiais</Text>
      </TouchableOpacity>

      {uploadStatus !== '' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{uploadStatus}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Processando sua solicitação...</Text>
        </View>
      )}

      {response !== '' && (
        <View style={styles.responseCard}>
          <View style={styles.responseHeader}>
            <Text style={styles.responseTitle}>Resposta da IA</Text>
          </View>
          <Text style={styles.responseText}>{response}</Text>

          {!feedbackSent && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackPrompt}>Esta resposta foi útil?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={[styles.feedbackButton, styles.successFeedback]}
                  onPress={() => handleFeedback('certa')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.feedbackButtonText}>👍</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.feedbackButton, styles.dangerFeedback]}
                  onPress={() => handleFeedback('errada')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.feedbackButtonText}>👎</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.feedbackButton, styles.warningFeedback]}
                  onPress={() => handleFeedback('melhorar')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.feedbackButtonText}>✏️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    height: 60,
  },
  logoImage: {
    width: 150,
    height: 50,
  },
  lottieAnimation: {
    width: 180,
    height: 180,
    paddingBottom: 10
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    minHeight: 120,
    color: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00AEEF',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00AEEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.25,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  specialButton: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specialButtonText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  statusContainer: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statusText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 13,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  responseCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  responseHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.25,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#334155',
  },
  feedbackContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  feedbackPrompt: {
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  feedbackButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successFeedback: {
    backgroundColor: '#ecfdf5',
  },
  dangerFeedback: {
    backgroundColor: '#fef2f2',
  },
  warningFeedback: {
    backgroundColor: '#fffbeb',
  },
  feedbackButtonText: {
    fontSize: 20,
  },
});