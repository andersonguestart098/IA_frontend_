import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function MainScreen() {
  const navigation = useNavigation<NavigationProp>(); // ✅ Agora está dentro da função

  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    try {
      setLoading(true);
      setFeedbackSent(false);
      setError(''); // Limpa o erro anterior
      setResponse(''); // Limpa a resposta anterior
      const res = await axios.post('http://192.168.100.2:8000/chat', { question }); // Substitua pela URL do ngrok
      const answer = res.data.answer;
      if (!answer || answer.trim() === '') {
        throw new Error('Nenhuma resposta recebida do servidor.');
      }
      setResponse(answer);
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar resposta da IA.');
      setResponse('');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result?.assets && result.assets.length > 0) {
        const file = result.assets[0];
  
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || '*/*',
        } as any);
  
        setUploadStatus('Enviando...');
        await axios.post('http://192.168.100.2:8000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        if (file.mimeType?.startsWith('image/')) {
          setUploadStatus('Imagem enviada! A IA irá interpretar a planta.');
        } else {
          setUploadStatus('Arquivo enviado com sucesso!');
        }
      } else {
        setUploadStatus('Nenhum arquivo selecionado.');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('Erro ao enviar o arquivo.');
    }
  };
  

  const handleFeedback = async (feedback: 'certa' | 'errada' | 'melhorar') => {
    try {
      await axios.post('http://192.168.100.2:8000/feedback', {
        question,
        answer: response,
        feedback,
      });
      setFeedbackSent(true);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chat IA - Cemear</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite sua pergunta para a I.A"
        value={question}
        onChangeText={setQuestion}
        multiline
      />

      <Button title="Perguntar" onPress={handleAsk} />

    {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      {error !== '' && (
        <Text style={styles.error}>{error}</Text>
      )}

      {response !== '' && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Resposta:</Text>
          <Text style={styles.responseText}>{response}</Text>

          {!feedbackSent && (
            <View style={styles.feedbackRow}>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('certa')}>
                <Text style={styles.feedbackText}>👍 Certa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('errada')}>
                <Text style={styles.feedbackText}>👎 Errada</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback('melhorar')}>
                <Text style={styles.feedbackText}>📝 Pode melhorar</Text>
              </TouchableOpacity>
            </View>
          )}

          {feedbackSent && <Text style={styles.status}>Obrigado pelo feedback!</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadText}>Enviar Arquivo para a IA</Text>
      </TouchableOpacity>

      {uploadStatus !== '' && <Text style={styles.status}>{uploadStatus}</Text>}

      <TouchableOpacity
      style={styles.calcButton}
      onPress={() => navigation.navigate('PlantaUpload')}
    >
      <Text style={styles.calcText}>Ir para Cálculo de Materiais</Text>
    </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f0f4f8',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  responseContainer: {
    marginTop: 20,
    backgroundColor: '#e0f7e9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  responseLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  feedbackButton: {
    backgroundColor: '#dedede',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    marginTop: 30,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  uploadText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  calcButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
  },
  calcText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  status: {
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    marginTop: 10,
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
});