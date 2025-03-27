import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

export default function PlantaUploadScreen() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [contexto, setContexto] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

        formData.append('contexto', contexto.toString());

        setUploadStatus('Interpretando planta...');
        setLoading(true);

        const res = await axios.post('http://192.168.100.2:8000/upload-planta', formData, {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Interpretação de Planta</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Adicione observações sobre a planta (ex: forro, local, tipo de projeto...)"
        multiline
        numberOfLines={4}
        value={contexto}
        onChangeText={setContexto}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadText}>Enviar Planta (PDF, DWG ou Imagem)</Text>
      </TouchableOpacity>

      {uploadStatus !== '' && <Text style={styles.status}>{uploadStatus}</Text>}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {resultado && resultado.materiais_estimados && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Área: {resultado.materiais_estimados.area_total_m2} m²</Text>
          <Text style={styles.resultText}>Perímetro: {resultado.materiais_estimados.perimetro_total_m} m</Text>
          <Text style={styles.resultText}>Montantes: {resultado.materiais_estimados.montantes}</Text>
          <Text style={styles.resultText}>Guias: {resultado.materiais_estimados.guias}</Text>
          <Text style={styles.resultText}>Placas de Gesso: {resultado.materiais_estimados.placas_gesso}</Text>
          <Text style={styles.resultText}>Parafusos: {resultado.materiais_estimados.parafusos}</Text>
          <Text style={styles.resultText}>Fitas: {resultado.materiais_estimados.fitas}</Text>
          <Text style={styles.resultText}>Massa: {resultado.materiais_estimados.massa}</Text>
          <Text style={styles.resultText}>Resumo OCR: {resultado.resumo}</Text>
          <Text style={styles.resultText}>
            Medidas OCR: {resultado.medidas_detectadas.largura_metros}m x {resultado.medidas_detectadas.altura_metros}m
          </Text>

          {resultado?.resposta_ia && (
            <>
              <Text style={[styles.resultText, { marginTop: 10, fontWeight: 'bold' }]}>💡 Resposta Inteligente:</Text>
              <Text style={styles.resultText}>{resultado.resposta_ia}</Text>
            </>
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
    backgroundColor: '#f0f4f8',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  uploadText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  status: {
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0f7e9',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
