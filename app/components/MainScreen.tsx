import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

export default function MainScreen() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleAsk = async () => {
    try {
      setLoading(true);
      setResponse('');
      setFeedbackSent(false);

      // Se houver arquivo, use o endpoint de interpretação inteligente
      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', {
          uri: uploadFile.uri,
          name: uploadFile.name,
          type: uploadFile.mimeType || '*/*',
        } as any);
        formData.append('contexto', question); // Texto como contexto

        const res = await axios.post('http://192.168.100.2:8000/upload-interpreta', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setResponse(res.data.resposta_ia);
        setUploadStatus('✅ Arquivo interpretado com sucesso!');
      } else {
        // Sem arquivo → só texto
        const res = await axios.post('http://192.168.100.2:8000/chat', { question });
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
        await axios.post('http://192.168.100.2:8000/upload', formData, {
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
      await axios.post('http://192.168.100.2:8000/feedback', {
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
      <Text style={styles.title}>Cemear IA 🧠</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite sua pergunta ou contexto..."
        value={question}
        onChangeText={setQuestion}
        multiline
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={handleFileSelect}>
        <Text style={styles.secondaryButtonText}>📎 Anexar imagem ou PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAsk}>
        <Text style={styles.buttonText}>🔍 Perguntar à IA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleUploadConhecimento}>
        <Text style={styles.secondaryButtonText}>📚 Enviar documento para a base</Text>
      </TouchableOpacity>

      {uploadStatus !== '' && <Text style={styles.status}>{uploadStatus}</Text>}

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {response !== '' && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>💡 Resposta:</Text>
          <Text style={styles.resultText}>{response}</Text>

          {!feedbackSent && (
            <View style={styles.feedbackRow}>
              <TouchableOpacity onPress={() => handleFeedback('certa')}>
                <Text style={styles.feedbackBtn}>👍 Certa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleFeedback('errada')}>
                <Text style={styles.feedbackBtn}>👎 Errada</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleFeedback('melhorar')}>
                <Text style={styles.feedbackBtn}>📝 Melhorar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00AEEF',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  secondaryButtonText: {
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 15,
  },
  status: {
    textAlign: 'center',
    marginTop: 10,
    color: '#334155',
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#e0f7e9',
    padding: 15,
    borderRadius: 10,
  },
  resultLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 16,
  },
  resultText: {
    fontSize: 15,
    color: '#1e293b',
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  feedbackBtn: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    color: '#1e293b',
    fontWeight: '600',
  },
});
