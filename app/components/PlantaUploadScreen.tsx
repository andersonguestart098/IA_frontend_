import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import AIAnimation from '../../assets/Animation - 1743167573251.json';

export default function PlantaUploadScreen() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [contexto, setContexto] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [areaManual, setAreaManual] = useState('');
  const [perimetroManual, setPerimetroManual] = useState('');

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
        formData.append('contexto', contexto);

        setUploadStatus('Interpretando planta...');
        setLoading(true);

        const res = await axios.post('http://192.168.100.6:8000/upload-planta', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setResultado(res.data);
        setUploadStatus('Levantamento concluído!');
      } else {
        setUploadStatus('Nenhum arquivo selecionado.');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('Erro ao interpretar a planta.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCalculo = async () => {
    try {
      setUploadStatus('Calculando manualmente...');
      setLoading(true);

      const form = new FormData();
      form.append('area', areaManual);
      form.append('perimetro', perimetroManual);
      form.append('contexto', contexto);

      const res = await axios.post('http://192.168.100.6:8000/calcular-materiais', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultado(res.data);
      setUploadStatus('Cálculo concluído!');
    } catch (error) {
      console.error(error);
      setUploadStatus('Erro no cálculo manual.');
    } finally {
      setLoading(false);
    }
  };

  const enviarFeedback = async (tipo: 'certa' | 'errada' | 'melhorar') => {
    try {
      await axios.post('http://192.168.100.6:8000/feedback', {
        question: `Área: ${areaManual} m²\nPerímetro: ${perimetroManual} m\nContexto: ${contexto}`,
        answer: resultado?.resposta_ia || '',
        feedback: tipo,
        contextoUsuario: contexto,
        origemPlanta: '',
        knowledgeBaseId: resultado?.knowledgeBaseId || null,
      });
      setResultado({ ...resultado, feedbackEnviado: true });
      setUploadStatus('✅ Feedback enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      setUploadStatus('❌ Erro ao enviar feedback.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cálculo de Materiais</Text>
        <LottieView source={AIAnimation} autoPlay loop style={styles.lottieAnimation} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Observações sobre o projeto (ex: tipo de forro, local...)"
        multiline
        value={contexto}
        onChangeText={setContexto}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleUpload}>
        <Text style={styles.primaryText}>Enviar Planta (PDF, Imagem...)</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>ou</Text>

      <TextInput
        style={styles.input}
        placeholder="Área (m²)"
        keyboardType="numeric"
        value={areaManual}
        onChangeText={setAreaManual}
      />
      <TextInput
        style={styles.input}
        placeholder="Perímetro (m)"
        keyboardType="numeric"
        value={perimetroManual}
        onChangeText={setPerimetroManual}
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={handleManualCalculo}>
        <Text style={styles.secondaryText}>Calcular com dados manuais</Text>
      </TouchableOpacity>

      {uploadStatus && <Text style={styles.status}>{uploadStatus}</Text>}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {resultado && (
        <View style={styles.resultBox}>
          {resultado.materiais_estimados &&
            Object.entries(resultado.materiais_estimados).map(([key, value]) => (
              <Text style={styles.resultText} key={key}>
                {key.replaceAll('_', ' ')}: {String(value)}
              </Text>
            ))}

          {resultado.resposta_ia && (
            <>
              <Text style={[styles.resultText, { fontWeight: 'bold', marginTop: 10 }]}>💡 Resposta IA:</Text>
              <Text style={styles.resultText}>{String(resultado.resposta_ia)}</Text>
            </>
          )}

          {!resultado.feedbackEnviado && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackPrompt}>Essa resposta foi útil?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity style={[styles.feedbackButton, styles.successFeedback]} onPress={() => enviarFeedback('certa')}>
                  <Text style={styles.feedbackButtonText}>👍</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.feedbackButton, styles.dangerFeedback]} onPress={() => enviarFeedback('errada')}>
                  <Text style={styles.feedbackButtonText}>👎</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.feedbackButton, styles.warningFeedback]} onPress={() => enviarFeedback('melhorar')}>
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
  container: { padding: 24, backgroundColor: '#f8fafc', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  lottieAnimation: { width: 140, height: 140 },
  input: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    color: '#0f172a',
  },
  primaryButton: {
    backgroundColor: '#00AEEF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#00AEEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: { color: 'white', fontWeight: '600', fontSize: 15 },
  secondaryButton: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderColor: '#a7f3d0',
    borderWidth: 1,
  },
  secondaryText: { color: '#059669', fontWeight: '600', fontSize: 15 },
  orText: { textAlign: 'center', color: '#64748b', marginVertical: 10 },
  status: { textAlign: 'center', color: '#475569', marginVertical: 8 },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  resultText: { fontSize: 16, marginBottom: 4, color: '#1e293b' },
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
  successFeedback: { backgroundColor: '#ecfdf5' },
  dangerFeedback: { backgroundColor: '#fef2f2' },
  warningFeedback: { backgroundColor: '#fffbeb' },
  feedbackButtonText: { fontSize: 20 },
});
